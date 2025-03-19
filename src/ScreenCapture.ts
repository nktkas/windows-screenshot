/**
 * The RECT structure defines a rectangle by the coordinates of its upper-left and lower-right corners.
 * @link https://learn.microsoft.com/en-us/windows/win32/api/windef/ns-windef-rect
 */
export interface Rect {
    /** Specifies the x-coordinate of the upper-left corner of the rectangle. */
    left: number;
    /** Specifies the y-coordinate of the upper-left corner of the rectangle. */
    top: number;
    /** Specifies the x-coordinate of the lower-right corner of the rectangle. */
    right: number;
    /** Specifies the y-coordinate of the lower-right corner of the rectangle. */
    bottom: number;
}

/**
 * The SIZE structure defines the width and height of a rectangle.
 * @link https://learn.microsoft.com/en-us/windows/win32/api/windef/ns-windef-size
 */
export interface Size {
    /** Specifies the rectangle's width (in pixels). */
    cx: number;
    /** Specifies the rectangle's height (in pixels). */
    cy: number;
}

/** Comprehensive information about a window */
export interface WindowInfo {
    /** Title of the window */
    title: string;
    /** Class name of the window */
    className: string;
    /** Process ID of the window */
    processId: number;
    /** Handle to the window for use with FFI functions */
    handle: Deno.PointerObject;
    /** Position of the window on the screen */
    position: Rect;
    /** Style information of the window */
    style: {
        /** Indicates if the window is minimized */
        isMinimized: boolean;
        /** Indicates if the window is maximized */
        isMaximized: boolean;
        /** Indicates if the window is disabled */
        isDisabled: boolean;
    };
}

interface BMPStructure {
    bmpBuffer: Uint8Array;
    bmiPtr: Deno.PointerObject;
    pixelsPtr: Deno.PointerObject;
}

interface GDIContext {
    hdcMemory: Deno.PointerObject;
    hBitmap: Deno.PointerObject;
}

/** A class for capturing screenshots and window images in Windows */
export class ScreenCapture implements Disposable {
    // Win32 API
    private static readonly DESKTOP_HORZRES = 118;
    private static readonly DESKTOP_VERTRES = 117;
    private static readonly GWL_STYLE = -16;
    private static readonly SRCCOPY = 0x00CC0020;
    private static readonly WS_DISABLED = 0x08000000;
    private static readonly WS_MAXIMIZE = 0x01000000;
    private static readonly WS_MINIMIZE = 0x20000000;

    // BMP Structure
    private static readonly BMP_BITS_PER_PIXEL = 24;
    private static readonly BMP_HEADER_SIZE = 54;

    // FFI Handle
    private readonly user32 = Deno.dlopen("user32.dll", {
        /**
         * Retrieves the dimensions of the bounding rectangle of the specified window.
         * The dimensions are given in screen coordinates that are relative to the upper-left corner of the screen.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getwindowrect
         */
        GetWindowRect: { parameters: ["pointer", "pointer"], result: "bool" },
        /**
         * The GetDCEx function retrieves a handle to a device context (DC) for the client area of a specified window or for the entire screen.
         * You can use the returned handle in subsequent GDI functions to draw in the DC.
         * The device context is an opaque data structure, whose values are used internally by GDI.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getdcex
         */
        GetDCEx: { parameters: ["pointer", "pointer", "u32"], result: "pointer" },
        /**
         * The ReleaseDC function releases a device context (DC), freeing it for use by other applications.
         * The effect of the ReleaseDC function depends on the type of DC.
         * It frees only common and window DCs. It has no effect on class or private DCs.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-releasedc
         */
        ReleaseDC: { parameters: ["pointer", "pointer"], result: "bool" },
        /**
         * Retrieves a handle to a window whose class name and window name match the specified strings.
         * The function searches child windows, beginning with the one following the specified child window.
         * This function does not perform a case-sensitive search.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-findwindowexw
         */
        FindWindowExW: { parameters: ["pointer", "pointer", "buffer", "buffer"], result: "pointer" },
        /**
         * Copies the text of the specified window's title bar (if it has one) into a buffer.
         * If the specified window is a control, the text of the control is copied.
         * However, GetWindowText cannot retrieve the text of a control in another application.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getwindowtextw
         */
        GetWindowTextW: { parameters: ["pointer", "buffer", "i32"], result: "i32" },
        /**
         * Determines the visibility state of the specified window.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-iswindowvisible
         */
        IsWindowVisible: { parameters: ["pointer"], result: "bool" },
        /**
         * Retrieves the name of the class to which the specified window belongs.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getclassnamew
         */
        GetClassNameW: { parameters: ["pointer", "buffer", "i32"], result: "i32" },
        /**
         * Retrieves the identifier of the thread that created the specified window and, optionally, the identifier of the process that created the window.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getwindowthreadprocessid
         */
        GetWindowThreadProcessId: { parameters: ["pointer", "pointer"], result: "u32" },
        /**
         * Retrieves information about the specified window.
         * The function also retrieves the 32-bit (DWORD) value at the specified offset into the extra window memory.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getwindowlongw
         */
        GetWindowLongW: { parameters: ["pointer", "i32"], result: "i32" },
        /**
         * Returns the dots per inch (dpi) value for the specified window.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getdpiforwindow
         */
        GetDpiForWindow: { parameters: ["pointer"], result: "u32" },
        /**
         * The PrintWindow function copies a visual window into the specified device context (DC), typically a printer DC.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-printwindow
         */
        PrintWindow: {
            parameters: ["pointer", "pointer", "u32"],
            result: "bool",
            nonblocking: true,
        },
    });
    private readonly gdi32 = Deno.dlopen("gdi32.dll", {
        /**
         * The CreateCompatibleDC function creates a memory device context (DC) compatible with the specified device.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/wingdi/nf-wingdi-createcompatibledc
         */
        CreateCompatibleDC: { parameters: ["pointer"], result: "pointer" },
        /**
         * The CreateCompatibleBitmap function creates a bitmap compatible with the device that is associated with the specified device context.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/wingdi/nf-wingdi-createcompatiblebitmap
         */
        CreateCompatibleBitmap: { parameters: ["pointer", "i32", "i32"], result: "pointer" },
        /**
         * The SelectObject function selects an object into the specified device context (DC).
         * The new object replaces the previous object of the same type.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/wingdi/nf-wingdi-selectobject
         */
        SelectObject: { parameters: ["pointer", "pointer"], result: "pointer" },
        /**
         * The BitBlt function performs a bit-block transfer of the color data corresponding to a rectangle of pixels from the specified source device context into a destination device context.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/wingdi/nf-wingdi-bitblt
         */
        BitBlt: {
            parameters: ["pointer", "i32", "i32", "i32", "i32", "pointer", "i32", "i32", "u32"],
            result: "bool",
            nonblocking: true,
        },
        /**
         * The DeleteObject function deletes a logical pen, brush, font, bitmap, region, or palette, freeing all system resources associated with the object.
         * After the object is deleted, the specified handle is no longer valid.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/wingdi/nf-wingdi-deleteobject
         */
        DeleteObject: { parameters: ["pointer"], result: "bool" },
        /**
         * The DeleteDC function deletes the specified device context (DC).
         * @link https://learn.microsoft.com/en-us/windows/win32/api/wingdi/nf-wingdi-deletedc
         */
        DeleteDC: { parameters: ["pointer"], result: "bool" },
        /**
         * The GetDIBits function retrieves the bits of the specified compatible bitmap and copies them into a buffer as a DIB using the specified format.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/wingdi/nf-wingdi-getdibits
         */
        GetDIBits: {
            parameters: ["pointer", "pointer", "u32", "u32", "pointer", "pointer", "u32"],
            result: "i32",
            nonblocking: true,
        },
        /**
         * The GetDeviceCaps function retrieves device-specific information for the specified device.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/wingdi/nf-wingdi-getdevicecaps
         */
        GetDeviceCaps: { parameters: ["pointer", "i32"], result: "i32" },
    });

    /**
     * Creates a BMP structure for the specified width and height
     * @param width Width of the image in pixels
     * @param height Height of the image in pixels
     * @returns BMP buffer and pointers
     */
    private createBmpStructure(width: number, height: number): BMPStructure {
        // Calculate BMP format sizes
        const stride = Math.floor((ScreenCapture.BMP_BITS_PER_PIXEL * width + 31) / 32) * 4;
        const pixelDataSize = stride * height;
        const fileSize = ScreenCapture.BMP_HEADER_SIZE + pixelDataSize;

        // Create BMP buffer
        const bmpBuffer = new Uint8Array(fileSize);
        const bmpDataView = new DataView(bmpBuffer.buffer);

        // Fill BMP File Header (14 bytes)
        bmpDataView.setUint8(0, 0x42); // 'B'
        bmpDataView.setUint8(1, 0x4D); // 'M'
        bmpDataView.setUint32(2, fileSize, true); // File size
        bmpDataView.setUint32(6, 0, true); // Reserved
        bmpDataView.setUint32(10, 54, true); // Pixel data offset (54 bytes)

        // Fill BMP Info Header (40 bytes)
        bmpDataView.setUint32(14, 40, true); // Info header size
        bmpDataView.setUint32(18, width, true); // Width
        bmpDataView.setUint32(22, height, true); // Height
        bmpDataView.setUint16(26, 1, true); // Planes
        bmpDataView.setUint16(28, ScreenCapture.BMP_BITS_PER_PIXEL, true); // Bits per pixel
        bmpDataView.setUint32(30, 0, true); // Compression (0 = no compression)
        bmpDataView.setUint32(34, pixelDataSize, true); // Image size
        bmpDataView.setUint32(38, 0, true); // X pixels per meter
        bmpDataView.setUint32(42, 0, true); // Y pixels per meter
        bmpDataView.setUint32(46, 0, true); // Colors used
        bmpDataView.setUint32(50, 0, true); // Colors important

        // Create BITMAPINFO structure
        const bmiBuffer = new Uint8Array(40);
        const bmiDataView = new DataView(bmiBuffer.buffer);

        // Fill BITMAPINFO fields
        bmiDataView.setUint32(0, 40, true); // Header size
        bmiDataView.setUint32(4, width, true); // Width
        bmiDataView.setUint32(8, height, true); // Height
        bmiDataView.setUint16(12, 1, true); // Planes
        bmiDataView.setUint16(14, ScreenCapture.BMP_BITS_PER_PIXEL, true); // Bits per pixel
        bmiDataView.setUint32(16, 0, true); // Compression (0 = no compression)
        bmiDataView.setUint32(20, 0, true); // Image size (can be 0 for BI_RGB)
        bmiDataView.setUint32(24, 0, true); // X pixels per meter
        bmiDataView.setUint32(28, 0, true); // Y pixels per meter
        bmiDataView.setUint32(32, 0, true); // Colors used
        bmiDataView.setUint32(36, 0, true); // Colors important

        // Create pointers
        const bmiPtr = Deno.UnsafePointer.of(bmiBuffer);
        if (bmiPtr === null) {
            throw new Error("Failed to create pointer for BITMAPINFO");
        }
        const pixelsPtr = Deno.UnsafePointer.of(bmpBuffer.subarray(ScreenCapture.BMP_HEADER_SIZE));
        if (pixelsPtr === null) {
            throw new Error("Failed to create pointer for pixel data");
        }

        return { bmpBuffer, bmiPtr, pixelsPtr };
    }

    /**
     * Creates a GDI render context
     * @param hdcSource Source device context handle
     * @param width Width of the bitmap
     * @param height Height of the bitmap
     * @returns memory DC and bitmap handles
     */
    private createGdiRenderContext(hdcSource: Deno.PointerObject, width: number, height: number): GDIContext {
        // Create memory DC
        const hdcMemory = this.gdi32.symbols.CreateCompatibleDC(hdcSource);
        if (hdcMemory === null) {
            throw new Error("Failed to create compatible DC");
        }

        try {
            // Create bitmap
            const hBitmap = this.gdi32.symbols.CreateCompatibleBitmap(hdcSource, width, height);
            if (hBitmap === null) {
                throw new Error("Failed to create compatible bitmap");
            }

            try {
                // Select bitmap into DC
                if (!this.gdi32.symbols.SelectObject(hdcMemory, hBitmap)) {
                    throw new Error("Failed to select bitmap into DC");
                }

                return { hdcMemory, hBitmap };
            } catch (error) {
                // Clean up resources
                this.gdi32.symbols.DeleteObject(hBitmap);
                throw error;
            }
        } catch (error) {
            // Clean up resources
            this.gdi32.symbols.DeleteDC(hdcMemory);
            throw error;
        }
    }

    /**
     * Finds a window by its class name or process ID
     * @param identifier Window class name or process ID to search for
     * @returns Window handle or null if not found
     */
    private findWindow(identifier: string | number): Deno.PointerObject | null {
        const classNameCallback = (handle: Deno.PointerObject, identifier: string) => {
            const classBuffer = new Uint16Array(256);
            const classLength = this.user32.symbols.GetClassNameW(handle, classBuffer, classBuffer.length);
            if (classLength === 0) {
                throw new Error("Failed to get class name");
            }
            const windowClassName = String.fromCharCode(...classBuffer.slice(0, classLength));
            return windowClassName === identifier;
        };
        const pidCallback = (handle: Deno.PointerObject, identifier: number) => {
            const pid = this.user32.symbols.GetWindowThreadProcessId(handle, null);
            if (pid === 0) {
                throw new Error("Failed to get process ID");
            }
            return pid === identifier;
        };

        let handle = this.user32.symbols.FindWindowExW(null, null, null, null);
        if (handle === null) {
            throw new Error("Failed to find first window handle");
        }
        while (handle !== null) {
            if (this.user32.symbols.IsWindowVisible(handle)) {
                if (
                    typeof identifier === "string"
                        ? classNameCallback(handle, identifier)
                        : pidCallback(handle, identifier)
                ) {
                    return handle;
                }
            }
            handle = this.user32.symbols.FindWindowExW(null, handle, null, null);
        }
        return null;
    }

    /**
     * Converts a class name, process ID, or handle to a window handle
     * @param identifier Window class name, process ID, or handle to convert
     * @returns Window handle
     */
    private identifierToHandle(identifier: string | number | Deno.PointerObject): Deno.PointerObject {
        let handle: Deno.PointerObject;

        // Determine window handle based on the type of identifier
        if (typeof identifier === "string" || typeof identifier === "number") {
            // Find window
            const foundWindow = this.findWindow(identifier);
            if (foundWindow === null) {
                throw new Error(`Window with identifier "${identifier}" not found`);
            }
            handle = foundWindow;
        } else {
            // Direct use of window handle
            handle = identifier;
        }

        return handle;
    }

    /**
     * Captures the entire screen or a specified portion as a bitmap image
     * @param rect Optional rectangle specifying the area to capture
     * @returns Raw BMP image data
     * @example Capture entire screen
     * ```ts
     * const capture = new ScreenCapture();
     * const fullScreen = await capture.captureScreen();
     * ```
     * @example Capture region (100,100 to 500,400)
     * ```ts
     * const capture = new ScreenCapture();
     * const region = await capture.captureScreen({ left: 100, top: 100, right: 500, bottom: 400 });
     * ```
     */
    async captureScreen(rect: Partial<Rect> = {}): Promise<Uint8Array> {
        // Get screen size
        const screenDSize = this.getScreenSize();

        // Calculate capture area using provided options or defaults
        const left = rect?.left ?? 0;
        const top = rect?.top ?? 0;
        const width = (rect?.right ?? screenDSize.cx) - left;
        const height = (rect?.bottom ?? screenDSize.cy) - top;

        // Get device context for the window
        const hdcWindow = this.user32.symbols.GetDCEx(null, null, 0x00000002);
        if (hdcWindow === null) {
            throw new Error("Failed to get device context for window");
        }

        try {
            // Get or create GDI render context and bitmap for the capture area
            const { hdcMemory, hBitmap } = this.createGdiRenderContext(hdcWindow, width, height);

            try {
                // Get or create BMP structure
                const { bmpBuffer, bmiPtr, pixelsPtr } = this.createBmpStructure(width, height);

                // Copy specified area of screen content
                if (
                    !await this.gdi32.symbols.BitBlt(
                        hdcMemory,
                        0,
                        0,
                        width,
                        height,
                        hdcWindow,
                        left,
                        top,
                        ScreenCapture.SRCCOPY,
                    )
                ) {
                    throw new Error("Failed to copy screen data");
                }

                // Get the image data
                if (!await this.gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, height, pixelsPtr, bmiPtr, 0)) {
                    throw new Error("Failed to get bitmap data");
                }

                return bmpBuffer;
            } finally {
                // Clean up resources
                this.gdi32.symbols.DeleteObject(hBitmap);
                this.gdi32.symbols.DeleteDC(hdcMemory);
            }
        } finally {
            // Clean up resources
            this.user32.symbols.ReleaseDC(null, hdcWindow);
        }
    }

    /**
     * Captures a specific window identified by class name, process id, or ffi handle
     * @param identifier Window class name, process id, or ffi handle to capture
     * @returns Raw BMP image data
     * @example Capture a window by class name
     * ```ts
     * const capture = new ScreenCapture();
     * const classNameBmp = await capture.captureWindow("Notepad");
     * ```
     * @example Capture a window by process id
     * ```ts
     * const capture = new ScreenCapture();
     * const processIdBmp = await capture.captureWindow(1234);
     * ```
     * @example Capture a window by ffi handle
     * ```ts
     * const capture = new ScreenCapture();
     * const handleBmp = await capture.captureWindow(windowHandle);
     * ```
     */
    async captureWindow(identifier: string | number | Deno.PointerObject): Promise<Uint8Array> {
        const handle = this.identifierToHandle(identifier);

        // Get window position and size
        const { left, top, right, bottom } = this.getWindowRect(handle);
        const cx = right - left;
        const cy = bottom - top;

        // Create the BMP data structure
        const { bmpBuffer, bmiPtr, pixelsPtr } = this.createBmpStructure(cx, cy);

        // Get device context for the window
        const hdcWindow = this.user32.symbols.GetDCEx(handle, null, 0x00000001 | 0x00000002);
        if (hdcWindow === null) {
            throw new Error("Failed to get device context for window");
        }

        try {
            // Get or create GDI render context and bitmap
            const { hdcMemory, hBitmap } = this.createGdiRenderContext(hdcWindow, cx, cy);

            try {
                // Copy window content
                if (!await this.user32.symbols.PrintWindow(handle, hdcMemory, 2)) {
                    throw new Error("Failed to copy window content");
                }

                // Get the image data
                if (!await this.gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, cy, pixelsPtr, bmiPtr, 0)) {
                    throw new Error("Failed to get bitmap data");
                }

                return bmpBuffer;
            } finally {
                // Clean up resources
                this.gdi32.symbols.DeleteObject(hBitmap);
                this.gdi32.symbols.DeleteDC(hdcMemory);
            }
        } finally {
            // Clean up resources
            this.user32.symbols.ReleaseDC(handle, hdcWindow);
        }
    }

    /**
     * Gets the screen size
     * @returns Size object with cx (width) and cy (height) properties
     * @example
     * ```ts
     * const capture = new ScreenCapture();
     * const screenSize = capture.getScreenSize();
     * ```
     */
    getScreenSize(): Size {
        // Get the screen device context
        const hdcScreen = this.user32.symbols.GetDCEx(null, null, 0x00000002);
        if (hdcScreen === null) {
            throw new Error("Failed to get screen device context");
        }

        try {
            // Get screen size
            const cx = this.gdi32.symbols.GetDeviceCaps(hdcScreen, ScreenCapture.DESKTOP_HORZRES);
            const cy = this.gdi32.symbols.GetDeviceCaps(hdcScreen, ScreenCapture.DESKTOP_VERTRES);

            return { cx, cy };
        } finally {
            // Clean up resources
            this.user32.symbols.ReleaseDC(null, hdcScreen);
        }
    }

    /**
     * Gets the rectangle of a specified window
     * @param identifier Window class name, process ID, or handle to get the rectangle for
     * @returns Rectangle object with left, top, right, and bottom coordinates
     * @example
     * ```ts
     * const capture = new ScreenCapture();
     * const rect = capture.getWindowRect(windowHandle);
     * ```
     */
    getWindowRect(identifier: string | number | Deno.PointerObject): Rect {
        const handle = this.identifierToHandle(identifier);

        // Create buffer for RECT structure
        const rectBuffer = new Uint8Array(16);
        const rectPtr = Deno.UnsafePointer.of(rectBuffer);
        if (rectPtr === null) {
            throw new Error("Failed to create pointer for RECT structure");
        }

        // Get window position into rectBuffer
        if (!this.user32.symbols.GetWindowRect(handle, rectPtr)) {
            throw new Error("Failed to get window position");
        }

        // Read position from rectBuffer
        const dataView = new DataView(rectBuffer.buffer);
        const left = dataView.getInt32(0, true);
        const top = dataView.getInt32(4, true);
        const right = dataView.getInt32(8, true);
        const bottom = dataView.getInt32(12, true);

        // Get window DPI and scale factor
        const dpi = this.user32.symbols.GetDpiForWindow(handle);
        if (dpi === 0) {
            throw new Error("Failed to get DPI for window");
        }
        const scaleFactor = dpi / 96;

        // Create position object
        const position = {
            left: Math.ceil(left * scaleFactor),
            top: Math.ceil(top * scaleFactor),
            right: Math.ceil(right * scaleFactor),
            bottom: Math.ceil(bottom * scaleFactor),
        };

        return position;
    }

    /**
     * Gets a list of all visible windows
     * @returns Array of window information objects
     * @example
     * ```ts
     * const capture = new ScreenCapture();
     * const windowList = capture.getWindowList();
     * ```
     */
    getWindowList(): WindowInfo[] {
        // Get the first window handle
        let handle = this.user32.symbols.FindWindowExW(null, null, null, null);
        if (handle === null) {
            throw new Error("Failed to find first window handle");
        }

        // Iterate through all windows
        const windowInfoList: WindowInfo[] = [];

        do {
            // Skip invisible windows
            if (this.user32.symbols.IsWindowVisible(handle)) {
                // Get title text
                const titleBuffer = new Uint16Array(256);
                const titleLength = this.user32.symbols.GetWindowTextW(handle, titleBuffer, titleBuffer.length);
                let title = "";
                if (titleLength > 0) { // A window may not contain title
                    title = String.fromCharCode(...titleBuffer.slice(0, titleLength));
                }

                // Get class name
                const classBuffer = new Uint16Array(256);
                const classLength = this.user32.symbols.GetClassNameW(handle, classBuffer, classBuffer.length);
                if (classLength === 0) {
                    throw new Error("Failed to get class name");
                }
                const className = String.fromCharCode(...classBuffer.slice(0, classLength));

                // Get process ID
                const processId = this.user32.symbols.GetWindowThreadProcessId(handle, null);
                if (processId === 0) {
                    throw new Error("Failed to get process ID");
                }

                // Get style value
                const styleValue = this.user32.symbols.GetWindowLongW(handle, ScreenCapture.GWL_STYLE);
                if (styleValue === 0) {
                    throw new Error("Failed to get window style");
                }

                // Get position
                const position = this.getWindowRect(handle);

                windowInfoList.push({
                    title,
                    handle,
                    position,
                    className,
                    processId,
                    style: {
                        isMinimized: (styleValue & ScreenCapture.WS_MINIMIZE) !== 0,
                        isMaximized: (styleValue & ScreenCapture.WS_MAXIMIZE) !== 0,
                        isDisabled: (styleValue & ScreenCapture.WS_DISABLED) !== 0,
                    },
                });
            }

            // Get next window
            handle = this.user32.symbols.FindWindowExW(null, handle, null, null);
        } while (handle !== null);

        return windowInfoList;
    }

    /** Closes the FFI handles */
    close(): void {
        this.user32.close();
        this.gdi32.close();
    }

    [Symbol.dispose](): void {
        this.close();
    }
}
