/** Options for the ScreenCapture class */
export interface ScreenCaptureOptions {
    /** The bit depth of the image to capture. Defaults to 24 bit. */
    bitDepth?: BitDepth;
    /** The type of palette to use for 8-bit color depth. Defaults to "halftone". */
    paletteType?: PaletteType;
    /** Whether to include the cursor in the screenshot. Defaults to true. */
    includeCursor?: boolean;
}

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

/** Comprehensive information about a window */
export interface WindowInfo {
    /** Handle to the window for use with FFI functions */
    handle: Deno.PointerObject;
    /** Title of the window */
    title: string;
    /** Class name of the window */
    className: string;
    /** Process ID of the window */
    processId: number;
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

/** A unique identifier for a window */
export type WindowIdentifier =
    | { title: string }
    | { className: string }
    | { processId: number }
    | { handle: Deno.PointerObject };

/**
 * Bit depth of the image
 * @link https://en.wikipedia.org/wiki/Color_depth
 */
export type BitDepth = 1 | 4 | 8 | 16 | 24 | 32;

/**
 * Type of palette to use for 8-bit color depth
 * @link https://en.wikipedia.org/wiki/Grayscale
 * @link https://en.wikipedia.org/wiki/8-bit_color
 */
export type PaletteType = "grayscale" | "halftone";

// Win32 API Constants
const DESKTOP_HORZRES = 118;
const DESKTOP_VERTRES = 117;
const GWL_STYLE = -16;
const SRCCOPY = 0x00CC0020;
const CAPTUREBLT = 0x40000000;
const WS_DISABLED = 0x08000000;
const WS_MAXIMIZE = 0x01000000;
const WS_MINIMIZE = 0x20000000;
const DI_NORMAL = 0x0003;

// BMP Structure Constants
const BMP_INFO_HEADER_SIZE = 40;
const BMP_HEADER_SIZE = 14;

// Palette Constants
const ONE_BIT_PALETTE = generate1BitPalette();
const FOUR_BIT_PALETTE = generate4BitPalette();
const EIGHT_BIT_GRAYSCALE_PALETTE = generate8BitGrayscalePalette();
const EIGHT_BIT_HALFTONE_PALETTE = generate8BitHalftonePalette();

/** A class for capturing screenshots and window images in Windows */
export class ScreenCapture implements Disposable {
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
        /**
         * Retrieves information about the global cursor.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getcursorinfo
         */
        GetCursorInfo: { parameters: ["pointer"], result: "bool" },
        /**
         * Retrieves information about the specified icon or cursor.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-geticoninfo
         */
        GetIconInfo: { parameters: ["pointer", "pointer"], result: "bool" },
        /**
         * Draws an icon or cursor into the specified device context.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-drawiconex
         */
        DrawIconEx: {
            parameters: ["pointer", "i32", "i32", "pointer", "i32", "i32", "u32", "pointer", "u32"],
            result: "bool",
        },
        /**
         * Returns the system DPI.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getdpiforsystem
         */
        GetDpiForSystem: { parameters: [], result: "u32" },
        /**
         * Sets the process-default DPI awareness to system-DPI awareness.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setprocessdpiaware
         */
        SetProcessDPIAware: { parameters: [], result: "bool" },
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
         * The GetDIBits function retrieves the bits of the specified bitmap and copies them into a buffer as a DIB.
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
        /**
         * The CreateDIBSection function creates a DIB that applications can write to directly.
         * The function gives you a pointer to the location of the bitmap bit values.
         * @link https://learn.microsoft.com/en-us/windows/win32/api/wingdi/nf-wingdi-createdibsection
         */
        CreateDIBSection: {
            parameters: ["pointer", "pointer", "u32", "pointer", "pointer", "u32"],
            result: "pointer",
        },
    });

    /** The bit depth of the image to capture */
    bitDepth: BitDepth;
    /** The type of palette to use for 8-bit color depth */
    paletteType: PaletteType;
    /** Whether to include the cursor in the screenshot */
    includeCursor: boolean;

    constructor(options: ScreenCaptureOptions = {}) {
        this.bitDepth = options.bitDepth ?? 24;
        this.paletteType = options.paletteType ?? "halftone";
        this.includeCursor = options.includeCursor ?? true;
    }

    /**
     * Gets the number of colors for the current bit depth
     * @returns Number of colors in the palette, or 0 if no palette is used
     */
    private getNumColorsForBitDepth(): number {
        switch (this.bitDepth) {
            case 1:
                return 2;
            case 4:
                return 16;
            case 8:
                return 256;
            default:
                return 0; // 16, 24, and 32-bit depths don't use palettes
        }
    }

    /**
     * Gets the appropriate color palette for the current bit depth and palette type
     * @returns Array of RGBQUAD values for the color palette, or null if not needed
     */
    private getPaletteForBitDepth(): Uint8Array | null {
        switch (this.bitDepth) {
            case 1:
                return ONE_BIT_PALETTE;
            case 4:
                return FOUR_BIT_PALETTE;
            case 8:
                return this.paletteType === "grayscale" ? EIGHT_BIT_GRAYSCALE_PALETTE : EIGHT_BIT_HALFTONE_PALETTE;
            default:
                return null; // 16, 24, and 32-bit depths don't use palettes
        }
    }

    /**
     * Creates buffers for BITMAPINFO and BMP file with given dimensions
     * @param width Width of the image in pixels
     * @param height Height of the image in pixels
     * @returns Object containing the necessary buffers and pixel data offset
     */
    private createBitmapBuffers(width: number, height: number): {
        bmiPtr: Deno.PointerObject;
        bmpBuffer: Uint8Array;
        pixelDataOffset: number;
    } {
        // Get palette information
        const numColors = this.getNumColorsForBitDepth();
        const palette = this.getPaletteForBitDepth();
        const paletteSize = numColors * 4; // Each RGBQUAD is 4 bytes

        // Create BITMAPINFO structure with palette
        const bmiBuffer = new Uint8Array(BMP_INFO_HEADER_SIZE + paletteSize);
        const bmiDataView = new DataView(bmiBuffer.buffer);

        // Fill BITMAPINFO fields
        bmiDataView.setUint32(0, BMP_INFO_HEADER_SIZE, true); // Header size
        bmiDataView.setInt32(4, width, true); // Width
        bmiDataView.setInt32(8, height, true); // Height
        bmiDataView.setUint16(12, 1, true); // Planes
        bmiDataView.setUint16(14, this.bitDepth, true); // Bits per pixel
        bmiDataView.setUint32(16, 0, true); // Compression (0 = BI_RGB)
        bmiDataView.setUint32(20, 0, true); // Image size
        bmiDataView.setUint32(24, 0, true); // X pixels per meter
        bmiDataView.setUint32(28, 0, true); // Y pixels per meter
        bmiDataView.setUint32(32, numColors, true); // Used colors
        bmiDataView.setUint32(36, numColors, true); // Important colors

        // Add palette to BITMAPINFO if needed
        if (palette) {
            bmiBuffer.set(palette, BMP_INFO_HEADER_SIZE);
        }

        // Calculate pixel data offset including palette
        const pixelDataOffset = BMP_HEADER_SIZE + BMP_INFO_HEADER_SIZE + paletteSize;

        // Create BMP file header and structure
        const stride = Math.floor((this.bitDepth * width + 31) / 32) * 4;
        const pixelDataSize = stride * height;
        const fileSize = pixelDataOffset + pixelDataSize;

        const bmpBuffer = new Uint8Array(fileSize);
        const bmpDataView = new DataView(bmpBuffer.buffer);

        // Fill BMP File Header (14 bytes)
        bmpDataView.setUint8(0, 0x42); // 'B'
        bmpDataView.setUint8(1, 0x4D); // 'M'
        bmpDataView.setUint32(2, fileSize, true); // File size
        bmpDataView.setUint32(6, 0, true); // Reserved
        bmpDataView.setUint16(8, 0, true); // Reserved
        bmpDataView.setUint32(10, pixelDataOffset, true); // Pixel data offset

        // Fill BMP Info Header (40 bytes)
        bmpDataView.setUint32(14, BMP_INFO_HEADER_SIZE, true); // Info header size
        bmpDataView.setUint32(18, width, true); // Width
        bmpDataView.setUint32(22, height, true); // Height
        bmpDataView.setUint16(26, 1, true); // Planes
        bmpDataView.setUint16(28, this.bitDepth, true); // Bits per pixel
        bmpDataView.setUint32(30, 0, true); // Compression (0 = BI_RGB)
        bmpDataView.setUint32(34, pixelDataSize, true); // Image size
        bmpDataView.setUint32(38, 0, true); // X pixels per meter
        bmpDataView.setUint32(42, 0, true); // Y pixels per meter
        bmpDataView.setUint32(46, numColors, true); // Colors used
        bmpDataView.setUint32(50, numColors, true); // Colors important

        // Add palette to BMP file if needed
        if (palette) {
            bmpBuffer.set(palette, BMP_HEADER_SIZE + BMP_INFO_HEADER_SIZE);
        }

        // Create pointer for BITMAPINFO
        const bmiPtr = Deno.UnsafePointer.of(bmiBuffer);
        if (bmiPtr === null) {
            throw new Error("Failed to create pointer for BITMAPINFO");
        }

        return { bmiPtr, bmpBuffer, pixelDataOffset };
    }

    /**
     * Draws the cursor on the specified device context
     * @param hdc The device context to draw the cursor on
     * @param offsetX X offset to adjust cursor position
     * @param offsetY Y offset to adjust cursor position
     */
    private drawCursorOnDC(hdc: Deno.PointerObject, offsetX: number, offsetY: number): void {
        // Define CURSORINFO structure (24 bytes on 64-bit Windows)
        const cursorInfoBuffer = new Uint8Array(24);
        const cursorInfoDataView = new DataView(cursorInfoBuffer.buffer);
        cursorInfoDataView.setUint32(0, 24, true);

        // Create pointer for CURSORINFO
        const cursorInfoPtr = Deno.UnsafePointer.of(cursorInfoBuffer);
        if (cursorInfoPtr === null) {
            throw new Error("Failed to create pointer for CURSORINFO");
        }

        // Get cursor info
        if (!this.user32.symbols.GetCursorInfo(cursorInfoPtr)) {
            throw new Error("Failed to get cursor info");
        }

        // Check if cursor is showing
        const flags = cursorInfoDataView.getUint32(4, true);
        if (!(flags & 0x00000001) || !(flags & 0x00000002)) {
            return; // Cursor is not showing, nothing to draw
        }

        // Get cursor handle
        const hCursor = Deno.UnsafePointer.create(cursorInfoDataView.getBigUint64(8, true));
        if (hCursor === null) {
            throw new Error("Failed to get cursor handle");
        }

        // Define ICONINFO structure (32 bytes on 64-bit Windows)
        const iconInfoBuffer = new Uint8Array(32);
        const iconInfoDataView = new DataView(iconInfoBuffer.buffer);
        const iconInfoPtr = Deno.UnsafePointer.of(iconInfoBuffer);
        if (iconInfoPtr === null) {
            throw new Error("Failed to create pointer for ICONINFO");
        }

        // Get icon info for cursor
        if (!this.user32.symbols.GetIconInfo(hCursor, iconInfoPtr)) {
            throw new Error("Failed to get icon info");
        }

        try {
            // Get hot cursor position
            const xHotspot = iconInfoDataView.getUint32(4, true);
            const yHotspot = iconInfoDataView.getUint32(8, true);

            // Get current cursor position
            const cursorX = cursorInfoDataView.getInt32(16, true);
            const cursorY = cursorInfoDataView.getInt32(20, true);

            // Get cursor position with DPI awareness
            if (!this.user32.symbols.SetProcessDPIAware()) {
                throw new Error("Failed to set process DPI awareness");
            }
            const dpi = this.user32.symbols.GetDpiForSystem();
            if (dpi === 0) {
                throw new Error("Failed to get DPI for system");
            }
            const scaleFactor = dpi / 96;

            const realCursorX = Math.round((cursorX - offsetX - xHotspot) * scaleFactor);
            const realCursorY = Math.round((cursorY - offsetY - yHotspot) * scaleFactor);

            // Draw the cursor using DrawIconEx for better quality
            if (!this.user32.symbols.DrawIconEx(hdc, realCursorX, realCursorY, hCursor, 0, 0, 0, null, DI_NORMAL)) {
                throw new Error("Failed to draw cursor");
            }
        } finally {
            // Clean up ICONINFO bitmap handles
            const hbmMask = Deno.UnsafePointer.create(iconInfoDataView.getBigUint64(16, true));
            if (hbmMask !== null) {
                this.gdi32.symbols.DeleteObject(hbmMask);
            }
            const hbmColor = Deno.UnsafePointer.create(iconInfoDataView.getBigUint64(24, true));
            if (hbmColor !== null) {
                this.gdi32.symbols.DeleteObject(hbmColor);
            }
        }
    }

    /**
     * Finds a window based on the provided identifier
     * @param identifier Window identifier
     * @returns Window handle, or null if not found
     */
    private findWindow(identifier: WindowIdentifier): Deno.PointerObject | null {
        if ("handle" in identifier) return identifier.handle;

        const titleHandler = (handle: Deno.PointerObject, identifier: string) => {
            const titleBuffer = new Uint16Array(256);
            const titleLength = this.user32.symbols.GetWindowTextW(handle, titleBuffer, titleBuffer.length);
            let title = "";
            if (titleLength > 0) { // A window may not contain title
                title = String.fromCharCode(...titleBuffer.slice(0, titleLength));
            }
            return title === identifier;
        };
        const classNameHandler = (handle: Deno.PointerObject, identifier: string) => {
            const classBuffer = new Uint16Array(256);
            const classLength = this.user32.symbols.GetClassNameW(handle, classBuffer, classBuffer.length);
            if (classLength === 0) {
                throw new Error("Failed to get class name");
            }
            const windowClassName = String.fromCharCode(...classBuffer.slice(0, classLength));
            return windowClassName === identifier;
        };
        const pidHandler = (handle: Deno.PointerObject, identifier: number) => {
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
                if ("title" in identifier) {
                    if (titleHandler(handle, identifier.title)) {
                        return handle;
                    }
                }
                if ("className" in identifier) {
                    if (classNameHandler(handle, identifier.className)) {
                        return handle;
                    }
                }
                if ("processId" in identifier) {
                    if (pidHandler(handle, identifier.processId)) {
                        return handle;
                    }
                }
            }
            handle = this.user32.symbols.FindWindowExW(null, handle, null, null);
        }
        return null;
    }

    /**
     * Captures the entire screen or a specified portion as a bitmap image
     * @param rect Optional rectangle specifying the area to capture
     * @returns Raw BMP image data
     */
    async captureScreen(rect: Partial<Rect> = {}): Promise<Uint8Array> {
        // Get screen size
        const screenDSize = this.getScreenRect();

        // Calculate capture area using provided options or defaults
        const left = rect?.left ?? 0;
        const top = rect?.top ?? 0;
        const right = rect?.right ?? screenDSize.right;
        const bottom = rect?.bottom ?? screenDSize.bottom;

        const width = right - left;
        const height = bottom - top;
        if (width <= 0 || height <= 0) {
            throw new Error(`Invalid capture area: width=${width}, height=${height}`);
        }

        // Get device context for the screen
        const hdcScreen = this.user32.symbols.GetDCEx(null, null, 0x00000002);
        if (hdcScreen === null) {
            throw new Error("Failed to get device context for screen");
        }

        try {
            // Create memory DC
            const hdcMemory = this.gdi32.symbols.CreateCompatibleDC(hdcScreen);
            if (hdcMemory === null) {
                throw new Error("Failed to create compatible DC");
            }

            try {
                // Create buffers for bitmap
                const { bmiPtr, bmpBuffer, pixelDataOffset } = this.createBitmapBuffers(width, height);

                // Create a pointer to receive the DIB bits pointer
                const pBits = new BigUint64Array(1);
                const pBitsPtr = Deno.UnsafePointer.of(pBits);

                // Create DIB section
                const hBitmap = this.gdi32.symbols.CreateDIBSection(hdcMemory, bmiPtr, 0, pBitsPtr, null, 0);
                if (hBitmap === null) {
                    throw new Error("Failed to create DIB section");
                }

                try {
                    // Select bitmap into DC
                    const hOldBitmap = this.gdi32.symbols.SelectObject(hdcMemory, hBitmap);
                    if (hOldBitmap === null) {
                        throw new Error("Failed to select bitmap into DC");
                    }

                    try {
                        // Copy screen data
                        if (
                            !await this.gdi32.symbols.BitBlt(
                                hdcMemory,
                                0,
                                0,
                                width,
                                height,
                                hdcScreen,
                                left,
                                top,
                                SRCCOPY | CAPTUREBLT,
                            )
                        ) {
                            throw new Error("Failed to copy screen data");
                        }

                        // Draw cursor if enabled
                        if (this.includeCursor) {
                            this.drawCursorOnDC(hdcMemory, left, top);
                        }

                        // Get pointer to pixel data from DIB section and copy to our BMP
                        const pixelsPtr = Deno.UnsafePointer.create(pBits[0]);
                        if (pixelsPtr === null) {
                            throw new Error("Failed to get pixel data pointer");
                        }

                        // Copy the pixel data to our BMP buffer
                        Deno.UnsafePointerView.copyInto(pixelsPtr, bmpBuffer.subarray(pixelDataOffset));

                        return bmpBuffer;
                    } finally {
                        this.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
                    }
                } finally {
                    this.gdi32.symbols.DeleteObject(hBitmap);
                }
            } finally {
                this.gdi32.symbols.DeleteDC(hdcMemory);
            }
        } finally {
            this.user32.symbols.ReleaseDC(null, hdcScreen);
        }
    }

    /**
     * Captures a specific window identified by class name, process id, or ffi handle
     * @param identifier Window identifier
     * @returns Raw BMP image data
     */
    async captureWindow(identifier: WindowIdentifier): Promise<Uint8Array> {
        const handle = this.findWindow(identifier);
        if (handle === null) {
            throw new Error(`Window with identifier "${JSON.stringify(identifier)}" not found`);
        }

        // Get window position and size
        const { left, top, right, bottom } = this.getWindowRect({ handle });

        const width = right - left;
        const height = bottom - top;
        if (width <= 0 || height <= 0) {
            throw new Error(`Invalid capture area: width=${width}, height=${height}`);
        }

        // Get device context for the window
        const hdcWindow = this.user32.symbols.GetDCEx(handle, null, 0x00000001 | 0x00000002);
        if (hdcWindow === null) {
            throw new Error("Failed to get device context for window");
        }

        try {
            // Create memory DC
            const hdcMemory = this.gdi32.symbols.CreateCompatibleDC(hdcWindow);
            if (hdcMemory === null) {
                throw new Error("Failed to create compatible DC");
            }

            try {
                // Create compatible bitmap
                const hBitmap = this.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
                if (hBitmap === null) {
                    throw new Error("Failed to create compatible bitmap");
                }

                try {
                    // Select bitmap into DC
                    const hOldBitmap = this.gdi32.symbols.SelectObject(hdcMemory, hBitmap);
                    if (hOldBitmap === null) {
                        throw new Error("Failed to select bitmap into DC");
                    }

                    try {
                        // Copy window content using PrintWindow
                        if (!await this.user32.symbols.PrintWindow(handle, hdcMemory, 2)) {
                            throw new Error("Failed to copy window content");
                        }

                        // Draw cursor if enabled
                        if (this.includeCursor) {
                            this.drawCursorOnDC(hdcMemory, left, top);
                        }

                        // Create buffers for bitmap
                        const { bmiPtr, bmpBuffer, pixelDataOffset } = this.createBitmapBuffers(width, height);
                        const pixelsPtr = Deno.UnsafePointer.of(bmpBuffer.subarray(pixelDataOffset));
                        if (pixelsPtr === null) {
                            throw new Error("Failed to create pointer for pixel data");
                        }

                        // Get the bitmap bits
                        if (
                            !await this.gdi32.symbols.GetDIBits(
                                hdcMemory,
                                hBitmap,
                                0,
                                height,
                                pixelsPtr,
                                bmiPtr,
                                0,
                            )
                        ) {
                            throw new Error("Failed to get bitmap bits");
                        }

                        return bmpBuffer;
                    } finally {
                        this.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
                    }
                } finally {
                    this.gdi32.symbols.DeleteObject(hBitmap);
                }
            } finally {
                this.gdi32.symbols.DeleteDC(hdcMemory);
            }
        } finally {
            this.user32.symbols.ReleaseDC(handle, hdcWindow);
        }
    }

    /**
     * Gets the screen rectangle
     * @returns Rectangle object with left, top, right, and bottom coordinates
     */
    getScreenRect(): Rect {
        // Get the screen device context
        const hdcScreen = this.user32.symbols.GetDCEx(null, null, 0x00000002);
        if (hdcScreen === null) {
            throw new Error("Failed to get screen device context");
        }

        try {
            // Get screen rectangle
            const right = this.gdi32.symbols.GetDeviceCaps(hdcScreen, DESKTOP_HORZRES);
            const bottom = this.gdi32.symbols.GetDeviceCaps(hdcScreen, DESKTOP_VERTRES);

            return { left: 0, top: 0, right, bottom };
        } finally {
            // Clean up resources
            this.user32.symbols.ReleaseDC(null, hdcScreen);
        }
    }

    /**
     * Gets the rectangle of a specified window
     * @param identifier Window identifier
     * @returns Rectangle object with left, top, right, and bottom coordinates
     */
    getWindowRect(identifier: WindowIdentifier): Rect {
        const handle = this.findWindow(identifier);
        if (handle === null) {
            throw new Error(`Window with identifier "${JSON.stringify(identifier)}" not found`);
        }

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
                const styleValue = this.user32.symbols.GetWindowLongW(handle, GWL_STYLE);
                if (styleValue === 0) {
                    throw new Error("Failed to get window style");
                }

                // Get position
                const position = this.getWindowRect({ handle });

                windowInfoList.push({
                    handle,
                    title,
                    className,
                    processId,
                    position,
                    style: {
                        isMinimized: (styleValue & WS_MINIMIZE) !== 0,
                        isMaximized: (styleValue & WS_MAXIMIZE) !== 0,
                        isDisabled: (styleValue & WS_DISABLED) !== 0,
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

/**
 * Generates a 1-bit color palette (black and white)
 * @returns Array of RGBQUAD values for black and white
 */
function generate1BitPalette(): Uint8Array {
    // 1-bit palette has 2 colors: black and white
    // Each RGBQUAD is 4 bytes: Blue, Green, Red, Reserved (0)
    const palette = new Uint8Array(2 * 4);

    // Black (0, 0, 0, 0)
    palette[0] = 0; // Blue
    palette[1] = 0; // Green
    palette[2] = 0; // Red
    palette[3] = 0; // Reserved

    // White (255, 255, 255, 0)
    palette[4] = 255; // Blue
    palette[5] = 255; // Green
    palette[6] = 255; // Red
    palette[7] = 0; // Reserved

    return palette;
}

/**
 * Generates a 4-bit color palette (standard 16-color VGA palette)
 * @returns Array of RGBQUAD values for the 16-color VGA palette
 */
function generate4BitPalette(): Uint8Array {
    // 4-bit palette has 16 colors
    // Each RGBQUAD is 4 bytes: Blue, Green, Red, Reserved (0)
    const palette = new Uint8Array(16 * 4);

    // Standard 16-color VGA palette (BGR0 format)
    const colors = [
        [0, 0, 0], // Black
        [0, 0, 128], // Dark Red
        [0, 128, 0], // Dark Green
        [0, 128, 128], // Dark Yellow
        [128, 0, 0], // Dark Blue
        [128, 0, 128], // Dark Magenta
        [128, 128, 0], // Dark Cyan
        [192, 192, 192], // Light Gray
        [128, 128, 128], // Dark Gray
        [0, 0, 255], // Red
        [0, 255, 0], // Green
        [0, 255, 255], // Yellow
        [255, 0, 0], // Blue
        [255, 0, 255], // Magenta
        [255, 255, 0], // Cyan
        [255, 255, 255], // White
    ];

    for (let i = 0; i < 16; i++) {
        palette[i * 4] = colors[i][0]; // Blue
        palette[i * 4 + 1] = colors[i][1]; // Green
        palette[i * 4 + 2] = colors[i][2]; // Red
        palette[i * 4 + 3] = 0; // Reserved
    }

    return palette;
}

/**
 * Generates an 8-bit grayscale palette (256 shades of gray)
 * @returns Array of RGBQUAD values for the 256 grayscale palette
 */
function generate8BitGrayscalePalette(): Uint8Array {
    // 8-bit grayscale palette has 256 colors
    // Each RGBQUAD is 4 bytes: Blue, Green, Red, Reserved (0)
    const palette = new Uint8Array(256 * 4);

    for (let i = 0; i < 256; i++) {
        palette[i * 4] = i; // Blue
        palette[i * 4 + 1] = i; // Green
        palette[i * 4 + 2] = i; // Red
        palette[i * 4 + 3] = 0; // Reserved
    }

    return palette;
}

/**
 * Generates an 8-bit Windows Halftone palette (color-rich 256 colors)
 * @returns Array of RGBQUAD values for the 256-color Windows Halftone palette
 */
function generate8BitHalftonePalette(): Uint8Array {
    // 8-bit Windows Halftone palette has 256 colors
    // Each RGBQUAD is 4 bytes: Blue, Green, Red, Reserved (0)
    const palette = new Uint8Array(256 * 4);

    // Windows Halftone palette structure:
    // - 20 standard colors (first 10 and last 10 in the palette)
    // - A 6x6x6 color cube (216 colors)
    // - 20 additional grayscale values

    // System colors
    const standardColors = [
        [0, 0, 0], // Black
        [128, 0, 0], // Dark Red
        [0, 128, 0], // Dark Green
        [128, 128, 0], // Dark Yellow
        [0, 0, 128], // Dark Blue
        [128, 0, 128], // Dark Magenta
        [0, 128, 128], // Dark Cyan
        [192, 192, 192], // Light Gray
        [128, 128, 128], // Dark Gray
        [255, 0, 0], // Red
        [0, 255, 0], // Green
        [255, 255, 0], // Yellow
        [0, 0, 255], // Blue
        [255, 0, 255], // Magenta
        [0, 255, 255], // Cyan
        [255, 255, 255], // White
        [0, 0, 0], // Black (duplicate)
        [0, 0, 95], // Dark Blue shade
        [0, 0, 175], // Medium Blue shade
        [0, 0, 255], // Blue
    ];

    // Insert standard colors
    for (let i = 0; i < 20; i++) {
        palette[i * 4] = standardColors[i][2]; // Blue
        palette[i * 4 + 1] = standardColors[i][1]; // Green
        palette[i * 4 + 2] = standardColors[i][0]; // Red
        palette[i * 4 + 3] = 0; // Reserved
    }

    // Define 6x6x6 color cube (216 colors) - starts at index 20
    let index = 20;
    for (let r = 0; r < 6; r++) {
        for (let g = 0; g < 6; g++) {
            for (let b = 0; b < 6; b++) {
                palette[index * 4] = b * 51; // Blue (0, 51, 102, 153, 204, 255)
                palette[index * 4 + 1] = g * 51; // Green (0, 51, 102, 153, 204, 255)
                palette[index * 4 + 2] = r * 51; // Red (0, 51, 102, 153, 204, 255)
                palette[index * 4 + 3] = 0; // Reserved
                index++;
            }
        }
    }

    // Fill remaining 20 slots with additional grayscale colors
    for (let i = 0; i < 20; i++) {
        const gray = Math.round(i * (255 / 19));
        palette[(index + i) * 4] = gray; // Blue
        palette[(index + i) * 4 + 1] = gray; // Green
        palette[(index + i) * 4 + 2] = gray; // Red
        palette[(index + i) * 4 + 3] = 0; // Reserved
    }

    return palette;
}
