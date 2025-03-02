/**
 * Configuration options for ScreenCapture
 */
export interface ScreenCaptureOptions {
    /** Maximum number of BMP structures to keep in cache (default: 20) */
    maxBmpCacheSize?: number;
    /** Maximum number of window dimensions to keep in cache (default: 20) */
    maxWindowDimensionsCacheSize?: number;
    /** Maximum number of device contexts, bitmaps, and dimensions to keep in cache (default: 20) */
    maxContextCacheSize?: number;
}

/**
 * Comprehensive information about a window in the Windows operating system
 */
export interface WindowInfo {
    /** Window title text */
    title: string;
    /** Native window handle for FFI operations */
    handle: Deno.PointerObject;
    /** Window width and height */
    dimensions: WindowDimensions;
    /** Window coordinates on screen */
    position: WindowPosition;
    /** Window visibility state */
    isVisible: boolean;
    /** Win32 window class identifier */
    className: string;
    /** Operating system process ID that owns this window */
    processId: number;
    /** Window style information */
    style: {
        /** Raw style bit flags */
        value: number;
        /** Window is in minimized state */
        isMinimized: boolean;
        /** Window is in maximized state */
        isMaximized: boolean;
        /** Window interaction is disabled */
        isDisabled: boolean;
    };
}

/**
 * Internal representation of a bitmap structure for Win32 API
 */
interface BMPStructure {
    /** Raw bitmap data including header and pixel data */
    bmpData: Uint8Array;
    /** BITMAPINFO structure buffer */
    bmiBuffer: Uint8Array;
    /** Size of the BMP header in bytes */
    headerSize: number;
    /** Pointer to BITMAPINFO structure */
    bmiPtr: Deno.PointerObject;
    /** Pointer to pixel data section */
    pixelsPtr: Deno.PointerObject;
}

/**
 * Window dimensions in pixels
 */
export interface WindowDimensions {
    /** Width in pixels */
    width: number;
    /** Height in pixels */
    height: number;
}

/**
 * Window coordinates in pixels
 */
export interface WindowPosition {
    /** Left coordinate */
    left: number;
    /** Top coordinate */
    top: number;
    /** Right coordinate */
    right: number;
    /** Bottom coordinate */
    bottom: number;
}

/**
 * Window DPI and scale factor
 */
interface WindowDPI {
    dpi: number;
    scaleFactor: number;
}

/**
 * Device context and bitmap handles for GDI operations
 */
interface GDIContext {
    /** Memory device context handle */
    hdcMemory: Deno.PointerObject;
    /** Bitmap handle */
    hBitmap: Deno.PointerObject;
}

/**
 * Combined window dimensional information
 */
type WindowDimensionalInfo = WindowDimensions & WindowPosition & WindowDPI;

/**
 * A generic Least Recently Used (LRU) cache implementation
 */
class LRUCache<K, V> {
    /** Internal map storing the cached entries */
    private cache: Map<K, { value: V; timestamp: number }> = new Map();
    /** Internal map storing the timestamps of the cached entries */
    private timestamps: Map<number, K[]> = new Map();
    /** Maximum number of entries to store in the cache */
    private readonly maxSize: number;
    /** Optional cleanup function to call when an entry is evicted */
    private readonly cleanupFn?: (value: V) => void;

    /**
     * Creates a new LRU cache with the specified maximum size
     * @param maxSize Maximum number of entries to store
     */
    constructor(maxSize: number, cleanupFn?: (value: V) => void) {
        this.maxSize = maxSize;
        this.cleanupFn = cleanupFn;
    }

    /**
     * Gets a value from the cache
     * @param key The key to look up
     * @returns The cached value, or undefined if not found
     */
    get(key: K): V | undefined {
        const entry = this.cache.get(key);
        if (entry) {
            // Update the timestamp to mark this entry as recently used
            entry.timestamp = Date.now();
            return entry.value;
        }
        return undefined;
    }

    /**
     * Sets a value in the cache
     * @param key The key to store
     * @param value The value to cache
     */
    set(key: K, value: V): void {
        // If the cache is full and this is a new key, remove the least recently used item
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }

        // Add or update the entry with the current timestamp
        this.cache.set(key, { value, timestamp: Date.now() });
    }

    /**
     * Checks if a key exists in the cache
     * @param key The key to check
     * @returns True if the key exists in the cache
     */
    has(key: K): boolean {
        return this.cache.has(key);
    }

    /**
     * Removes a key from the cache
     * @param key The key to remove
     * @returns True if the key was found and removed
     */
    delete(key: K): boolean {
        // Call the cleanup function if provided
        if (this.cleanupFn) {
            const entry = this.cache.get(key);
            if (entry) {
                this.cleanupFn(entry.value);
            } else {
                return false;
            }
        }

        return this.cache.delete(key);
    }

    /**
     * Removes all entries from the cache
     */
    clear(): void {
        // Call the cleanup function for each entry if provided
        if (this.cleanupFn) {
            for (const [, { value }] of this.cache.entries()) {
                this.cleanupFn(value);
            }
        }
        this.cache.clear();
    }

    /**
     * Gets the number of entries in the cache
     */
    get size(): number {
        return this.cache.size;
    }

    /**
     * Gets all keys in the cache
     */
    keys(): IterableIterator<K> {
        return this.cache.keys();
    }

    /**
     * Gets all entries in the cache
     */
    entries(): IterableIterator<[K, V]> {
        // Convert the internal format to the expected external format
        return (function* (cache) {
            for (const [key, { value }] of cache.cache.entries()) {
                yield [key, value];
            }
        })(this);
    }

    /**
     * Removes the least recently used item from the cache
     * @private
     */
    private evictLRU(): void {
        if (this.cache.size === 0) return;

        // Find the minimum timestamp O(1)
        const minTimestamp = Math.min(...this.timestamps.keys());
        const keysToRemove = this.timestamps.get(minTimestamp) ?? [];
        const keyToRemove = keysToRemove[0];

        // Delete the entry
        const entry = this.cache.get(keyToRemove);
        if (entry) {
            this.cleanupFn?.(entry.value);
            this.cache.delete(keyToRemove);
        }

        // Update the key list for this timestamp
        keysToRemove.shift();
        if (keysToRemove.length === 0) {
            this.timestamps.delete(minTimestamp);
        } else {
            this.timestamps.set(minTimestamp, keysToRemove);
        }
    }
}

/**
 * A class for capturing screenshots and window images in Windows
 */
export class ScreenCapture {
    // BMP format constants

    /** File header (14) + Info header (40) */
    private readonly BMP_HEADER_SIZE = 54;
    /** RGB */
    private readonly BMP_BITS_PER_PIXEL = 24;

    // Win32 API constants

    /** Direct copy of source pixels */
    private readonly SRCCOPY = 0x00CC0020;
    /** Horizontal screen resolution */
    private readonly DESKTOPHORZRES = 118;
    /** Vertical screen resolution */
    private readonly DESKTOPVERTRES = 117;
    /** Window style offset for GetWindowLong */
    private readonly GWL_STYLE = -16;
    /** Window disabled flag */
    private readonly WS_DISABLED = 0x08000000;
    /** Window minimized flag */
    private readonly WS_MINIMIZE = 0x20000000;
    /** Window maximized flag */
    private readonly WS_MAXIMIZE = 0x01000000;

    // FFI library handles

    /** Deno FFI handle for user32.dll */
    private readonly user32 = Deno.dlopen("user32.dll", {
        GetDesktopWindow: { parameters: [], result: "pointer" },
        GetWindowRect: { parameters: ["pointer", "pointer"], result: "i32" },
        GetDC: { parameters: ["pointer"], result: "pointer" },
        ReleaseDC: { parameters: ["pointer", "pointer"], result: "i32" },
        FindWindowExW: { parameters: ["pointer", "pointer", "buffer", "buffer"], result: "pointer" },
        GetWindowTextW: { parameters: ["pointer", "buffer", "i32"], result: "i32" },
        IsWindowVisible: { parameters: ["pointer"], result: "i32" },
        GetClassNameW: { parameters: ["pointer", "buffer", "i32"], result: "i32" },
        GetWindowThreadProcessId: { parameters: ["pointer", "pointer"], result: "u32" },
        GetWindowLongW: { parameters: ["pointer", "i32"], result: "i32" },
        GetDpiForWindow: { parameters: ["pointer"], result: "u32" },
        PrintWindow: { parameters: ["pointer", "pointer", "u32"], result: "i32" },
    });
    /** Deno FFI handle for gdi32.dll */
    private readonly gdi32 = Deno.dlopen("gdi32.dll", {
        CreateCompatibleDC: { parameters: ["pointer"], result: "pointer" },
        CreateCompatibleBitmap: { parameters: ["pointer", "i32", "i32"], result: "pointer" },
        SelectObject: { parameters: ["pointer", "pointer"], result: "pointer" },
        BitBlt: { parameters: ["pointer", "i32", "i32", "i32", "i32", "pointer", "i32", "i32", "u32"], result: "i32" },
        DeleteObject: { parameters: ["pointer"], result: "i32" },
        DeleteDC: { parameters: ["pointer"], result: "i32" },
        GetDIBits: { parameters: ["pointer", "pointer", "u32", "u32", "pointer", "pointer", "u32"], result: "i32" },
        GetDeviceCaps: { parameters: ["pointer", "i32"], result: "i32" },
    });

    // Performance optimizations

    /** Cached desktop window handle */
    private readonly desktopWindowHandle: Deno.PointerObject;
    /** Cached screen dimensions */
    private screenDimensions: WindowDimensions | null = null;
    /** Cached RECT structure for GetWindowRect */
    private readonly rect: { buffer: Uint8Array; ptr: Deno.PointerValue };
    /** Cache map for window dimensions */
    private windowDimensionsCache: LRUCache<bigint, WindowDimensionalInfo>;
    /** Cache map for BMP structures by dimension */
    private bmpCache: LRUCache<string, BMPStructure>;
    /** Cache map for device context, bitmap, and dimensions */
    private contextCache: LRUCache<string, GDIContext & WindowDimensions>;

    // BMP header templates

    /** BMP file header template */
    private readonly bmpHeaderTemplate = new Uint8Array([
        0x42, // Signature 'B'
        0x4D, // Signature 'M'
        0, // File size byte 1 (filled dynamically)
        0, // File size byte 2 (filled dynamically)
        0, // File size byte 3 (filled dynamically)
        0, // File size byte 4 (filled dynamically)
        0, // Reserved byte 1
        0, // Reserved byte 2
        0, // Reserved byte 3
        0, // Reserved byte 4
        54, // Pixel data offset byte 1
        0, // Pixel data offset byte 2
        0, // Pixel data offset byte 3
        0, // Pixel data offset byte 4

        40, // Header size byte 1
        0, // Header size byte 2
        0, // Header size byte 3
        0, // Header size byte 4
        0, // Width byte 1 (filled dynamically)
        0, // Width byte 2 (filled dynamically)
        0, // Width byte 3 (filled dynamically)
        0, // Width byte 4 (filled dynamically)
        0, // Height byte 1 (filled dynamically)
        0, // Height byte 2 (filled dynamically)
        0, // Height byte 3 (filled dynamically)
        0, // Height byte 4 (filled dynamically)
        1, // Planes byte 1
        0, // Planes byte 2
        24, // Bits per pixel byte 1 (24-bit RGB)
        0, // Bits per pixel byte 2
        0, // Compression type byte 1 (no compression)
        0, // Compression type byte 2
        0, // Compression type byte 3
        0, // Compression type byte 4
        0, // Image size byte 1 (filled dynamically)
        0, // Image size byte 2 (filled dynamically)
        0, // Image size byte 3 (filled dynamically)
        0, // Image size byte 4 (filled dynamically)
        0, // X pixels per meter byte 1
        0, // X pixels per meter byte 2
        0, // X pixels per meter byte 3
        0, // X pixels per meter byte 4
        0, // Y pixels per meter byte 1
        0, // Y pixels per meter byte 2
        0, // Y pixels per meter byte 3
        0, // Y pixels per meter byte 4
        0, // Colors used byte 1
        0, // Colors used byte 2
        0, // Colors used byte 3
        0, // Colors used byte 4
        0, // Colors important byte 1
        0, // Colors important byte 2
        0, // Colors important byte 3
        0, // Colors important byte 4
    ]);
    /** BMP info header template */
    private readonly bmiTemplate = new Uint8Array([
        40, // Header size byte 1
        0, // Header size byte 2
        0, // Header size byte 3
        0, // Header size byte 4
        0, // Width byte 1 (filled dynamically)
        0, // Width byte 2 (filled dynamically)
        0, // Width byte 3 (filled dynamically)
        0, // Width byte 4 (filled dynamically)
        0, // Height byte 1 (filled dynamically)
        0, // Height byte 2 (filled dynamically)
        0, // Height byte 3 (filled dynamically)
        0, // Height byte 4 (filled dynamically)
        1, // Planes byte 1
        0, // Planes byte 2
        24, // Bits per pixel byte 1 (24-bit RGB)
        0, // Bits per pixel byte 2
        0, // Compression type byte 1 (no compression)
        0, // Compression type byte 2
        0, // Compression type byte 3
        0, // Compression type byte 4
        0, // Image size byte 1 (can be 0 for BI_RGB)
        0, // Image size byte 2
        0, // Image size byte 3
        0, // Image size byte 4
        0, // X pixels per meter byte 1
        0, // X pixels per meter byte 2
        0, // X pixels per meter byte 3
        0, // X pixels per meter byte 4
        0, // Y pixels per meter byte 1
        0, // Y pixels per meter byte 2
        0, // Y pixels per meter byte 3
        0, // Y pixels per meter byte 4
        0, // Colors used byte 1
        0, // Colors used byte 2
        0, // Colors used byte 3
        0, // Colors used byte 4
        0, // Colors important byte 1
        0, // Colors important byte 2
        0, // Colors important byte 3
        0, // Colors important byte 4
    ]);

    /**
     * Initializes the screenshot library and acquires necessary resources
     * @param options Configuration options for ScreenCapture
     * @throws Error if unable to initialize required Windows resources
     */
    constructor(options: ScreenCaptureOptions = {}) {
        // Initialize LRU caches with specified maximum sizes
        this.windowDimensionsCache = new LRUCache<bigint, WindowDimensionalInfo>(
            options.maxWindowDimensionsCacheSize ?? 20,
        );
        this.bmpCache = new LRUCache<string, BMPStructure>(
            options.maxBmpCacheSize ?? 20,
        );
        this.contextCache = new LRUCache<string, GDIContext & WindowDimensions>(
            options.maxContextCacheSize ?? 20,
            (context) => {
                // Cleanup function for GDI resources
                this.gdi32.symbols.DeleteObject(context.hBitmap);
                this.gdi32.symbols.DeleteDC(context.hdcMemory);
            },
        );

        // Cache desktop window handle
        const desktopWindowHandle = this.user32.symbols.GetDesktopWindow();
        if (desktopWindowHandle === null) {
            throw new Error("Failed to get desktop window handle");
        }
        this.desktopWindowHandle = desktopWindowHandle;

        // Cache RECT structure for GetWindowRect
        const rectBuffer = new Uint8Array(16);
        const rectPtr = Deno.UnsafePointer.of(rectBuffer);
        if (rectPtr === null) {
            throw new Error("Failed to create pointer for RECT structure");
        }
        this.rect = { buffer: rectBuffer, ptr: rectPtr };
    }

    // —————————— Private Methods ——————————

    /**
     * Retrieves window dimensions from its handle
     * @param hwnd Window handle
     * @param forceRefresh Bypass cache and get fresh dimensions (default: true)
     * @returns Window dimensions, position, DPI, and scale factor
     * @throws Error if unable to get window dimensions
     */
    private getWindowDimensions(
        hwnd: Deno.PointerObject,
        forceRefresh = true,
    ): WindowDimensions & WindowPosition & WindowDPI {
        // Create a unique key for this window handle
        const handleKey = Deno.UnsafePointer.value(hwnd);

        // Return cached dimensions if available and refresh not forced
        if (!forceRefresh) {
            const cachedDimensions = this.windowDimensionsCache.get(handleKey);
            if (cachedDimensions) {
                return cachedDimensions;
            }
        }

        // Get window dimensions into the buffer
        if (this.user32.symbols.GetWindowRect(hwnd, this.rect.ptr) === 0) {
            throw new Error("Failed to get window dimensions");
        }

        // Read dimensions from the buffer
        const dataView = new DataView(this.rect.buffer.buffer);
        const left = dataView.getInt32(0, true);
        const top = dataView.getInt32(4, true);
        const right = dataView.getInt32(8, true);
        const bottom = dataView.getInt32(12, true);

        // Get DPI and scale factor
        const dpi = this.user32.symbols.GetDpiForWindow(hwnd);
        const scaleFactor = dpi !== 0 ? (dpi / 96) : 1;

        // Create dimensions object
        const dimensions = {
            left,
            top,
            right,
            bottom,
            dpi,
            scaleFactor,
            width: Math.ceil((right - left) * scaleFactor),
            height: Math.ceil((bottom - top) * scaleFactor),
        };

        // Cache the dimensions for future use
        this.windowDimensionsCache.set(handleKey, dimensions);

        return dimensions;
    }

    /**
     * Retrieves current screen dimensions
     * @param forceRefresh Bypass cache and get fresh dimensions (default: true)
     * @returns Screen width and height
     * @throws Error if unable to get screen dimensions
     */
    private getScreenDimensions(forceRefresh = true): WindowDimensions {
        // Return cached dimensions if available and refresh not forced
        if (this.screenDimensions !== null && !forceRefresh) {
            return this.screenDimensions;
        }

        // Get the screen device context
        const hdcScreen = this.user32.symbols.GetDC(null);
        if (hdcScreen === null) {
            throw new Error("Failed to get screen device context");
        }

        // Get screen dimensions
        const width = this.gdi32.symbols.GetDeviceCaps(hdcScreen, this.DESKTOPHORZRES);
        const height = this.gdi32.symbols.GetDeviceCaps(hdcScreen, this.DESKTOPVERTRES);

        // Release the screen device context
        this.user32.symbols.ReleaseDC(null, hdcScreen);

        // Cache the dimensions
        this.screenDimensions = { width, height };

        return this.screenDimensions;
    }

    /**
     * Creates a BMP file data structure with headers and pixel data buffers
     * @param width Image width in pixels
     * @param height Image height in pixels
     * @returns BMP structure with data and pointers for Win32 API
     * @throws Error if unable to create required pointers
     */
    private createBmpStructure(width: number, height: number): BMPStructure {
        // Calculate BMP format sizes
        const rowSize = Math.floor((this.BMP_BITS_PER_PIXEL * width + 31) / 32) * 4;
        const pixelDataSize = rowSize * height;
        const fileSize = this.BMP_HEADER_SIZE + pixelDataSize;

        // Create BMP buffer from template
        const bmpData = new Uint8Array(fileSize);
        bmpData.set(this.bmpHeaderTemplate.subarray(0, this.BMP_HEADER_SIZE));

        // Create DataView for efficient binary manipulation
        const bmpDataView = new DataView(bmpData.buffer);

        // Update BMP file header fields
        bmpDataView.setUint32(2, fileSize, true);

        // Update BMP info header fields
        bmpDataView.setUint32(18, width, true);
        bmpDataView.setUint32(22, height, true);
        bmpDataView.setUint32(34, pixelDataSize, true);

        // Create BITMAPINFO structure from template
        const bmiBuffer = new Uint8Array(40);
        bmiBuffer.set(this.bmiTemplate);

        // Update BITMAPINFO fields
        const bmiDataView = new DataView(bmiBuffer.buffer);
        bmiDataView.setUint32(4, width, true);
        bmiDataView.setUint32(8, height, true);

        // Create pointers for Win32 API
        const bmiPtr = Deno.UnsafePointer.of(bmiBuffer);
        if (bmiPtr === null) {
            throw new Error("Failed to create pointer for BITMAPINFO");
        }

        const pixelsPtr = Deno.UnsafePointer.of(bmpData.subarray(this.BMP_HEADER_SIZE));
        if (pixelsPtr === null) {
            throw new Error("Failed to create pointer for pixel data");
        }

        return {
            bmpData,
            bmiBuffer,
            headerSize: this.BMP_HEADER_SIZE,
            bmiPtr,
            pixelsPtr,
        };
    }

    /**
     * Gets or creates a cached BMP structure for specified dimensions
     * @param width Width of the bitmap
     * @param height Height of the bitmap
     * @returns BMP structure with prepared memory buffers and pointers
     */
    private getOrCreateBmpStructure(width: number, height: number): BMPStructure {
        // Check cache for existing BMP structure
        const dimensionKey = `${width}x${height}`;

        // If found in cache, return it
        const cachedBmp = this.bmpCache.get(dimensionKey);
        if (cachedBmp) {
            return cachedBmp;
        }

        // Create new BMP structure and add to cache
        const bmpStructure = this.createBmpStructure(width, height);
        this.bmpCache.set(dimensionKey, bmpStructure);

        // Return the BMP structure
        return bmpStructure;
    }

    /**
     * Creates a new GDI rendering context with memory device context and bitmap
     * @param hdcSource Source DC to be compatible with
     * @param width Width of the bitmap
     * @param height Height of the bitmap
     * @returns GDI rendering context with memory DC and bitmap handles
     * @throws Error if unable to create DC or bitmap
     */
    private createGdiRenderContext(hdcSource: Deno.PointerObject, width: number, height: number): GDIContext {
        // Create new memory DC
        const hdcMemory = this.gdi32.symbols.CreateCompatibleDC(hdcSource);
        if (hdcMemory === null) {
            throw new Error("Failed to create compatible DC");
        }

        try {
            // Create new bitmap
            const hBitmap = this.gdi32.symbols.CreateCompatibleBitmap(hdcSource, width, height);
            if (hBitmap === null) {
                throw new Error("Failed to create compatible bitmap");
            }

            return { hdcMemory, hBitmap };
        } catch (error) {
            // Clean up resources in case of error
            this.gdi32.symbols.DeleteDC(hdcMemory);
            throw error;
        }
    }

    /**
     * Gets or creates a GDI rendering context with memory device context and bitmap
     * @param hdcSource Source DC to be compatible with
     * @param width Width of the bitmap
     * @param height Height of the bitmap
     * @returns GDI rendering context with memory DC and bitmap handles
     * @throws Error if unable to create DC or bitmap
     */
    private getOrCreateGdiRenderContext(hdcSource: Deno.PointerObject, width: number, height: number): GDIContext {
        // Check cache for existing context
        const dimensionKey = `${width}x${height}`;

        // If found in cache, return it
        const cachedContext = this.contextCache.get(dimensionKey);
        if (cachedContext) {
            return {
                hdcMemory: cachedContext.hdcMemory,
                hBitmap: cachedContext.hBitmap,
            };
        }

        // Create new memory DC and bitmap
        const context = this.createGdiRenderContext(hdcSource, width, height);

        // Store in cache
        this.contextCache.set(dimensionKey, { ...context, width, height });

        // Return the context
        return context;
    }

    /**
     * Finds a window by its class name
     * @param className The class name to search for
     * @returns Window handle or null if not found
     */
    private findWindowByClassName(className: string): Deno.PointerObject | null {
        // Prepare buffer for class name
        const classBuffer = new Uint16Array(256);

        // Start with the first top-level window
        let hwnd = this.user32.symbols.FindWindowExW(this.desktopWindowHandle, null, null, null);

        // Iterate through all top-level windows
        while (hwnd !== null) {
            // Check if window is visible
            if (this.user32.symbols.IsWindowVisible(hwnd) !== 0) {
                // Get the window's class name
                const classLength = this.user32.symbols.GetClassNameW(hwnd, classBuffer, classBuffer.length);
                if (classLength > 0) {
                    const windowClassName = String.fromCharCode(...classBuffer.slice(0, classLength));
                    if (windowClassName === className) return hwnd;
                }
            }

            // Move to next window
            hwnd = this.user32.symbols.FindWindowExW(this.desktopWindowHandle, hwnd, null, null);
        }

        // No matching window found
        return null;
    }

    /**
     * Finds a window by its process ID
     * @param processId The process ID to search for
     * @returns Window handle or null if not found
     */
    private findWindowByProcessId(processId: number): Deno.PointerObject | null {
        // Prepare buffer for process ID
        const pidBuffer = new Uint32Array(1);
        const pidPtr = Deno.UnsafePointer.of(pidBuffer);

        if (pidPtr === null) {
            throw new Error("Failed to create pointer for process ID buffer");
        }

        // Start with the first top-level window
        let hwnd = this.user32.symbols.FindWindowExW(this.desktopWindowHandle, null, null, null);

        // Iterate through all top-level windows
        while (hwnd !== null) {
            // Check if window is visible
            if (this.user32.symbols.IsWindowVisible(hwnd) !== 0) {
                // Get the window's process ID
                this.user32.symbols.GetWindowThreadProcessId(hwnd, pidPtr);
                const windowProcessId = pidBuffer[0];
                if (windowProcessId === processId) return hwnd;
            }

            // Move to next window
            hwnd = this.user32.symbols.FindWindowExW(this.desktopWindowHandle, hwnd, null, null);
        }

        // No matching window found
        return null;
    }

    // —————————— Public Methods ——————————

    /**
     * Retrieves information about all windows in the system
     * @param visibleOnly Only include visible windows
     * @returns Array of window information objects
     * @example
     * ```ts
     * const capture = new ScreenCapture();
     * const windowList = capture.getWindowList();
     * ```
     */
    public getWindowList(visibleOnly: boolean = true): WindowInfo[] {
        const windowInfoList = [];
        const titleBuffer = new Uint16Array(256); // For Unicode window titles
        const classBuffer = new Uint16Array(256); // For Unicode class names

        // Create a buffer for process ID
        const pidBuffer = new Uint32Array(1);
        const pidPtr = Deno.UnsafePointer.of(pidBuffer);

        // Start with no window
        let hwnd = this.user32.symbols.FindWindowExW(this.desktopWindowHandle, null, null, null);

        // Iterate through all windows
        while (hwnd !== null) {
            // Get window visibility
            const isVisible = this.user32.symbols.IsWindowVisible(hwnd) !== 0;

            // Skip invisible windows if visibleOnly is true
            if (!visibleOnly || isVisible) {
                // Get window title
                const length = this.user32.symbols.GetWindowTextW(hwnd, titleBuffer, titleBuffer.length);
                let title = "";

                if (length > 0) {
                    // Convert buffer to string
                    title = String.fromCharCode(...titleBuffer.slice(0, length));
                }

                // Get window class name
                const classLength = this.user32.symbols.GetClassNameW(hwnd, classBuffer, classBuffer.length);
                let className = "";

                if (classLength > 0) {
                    className = String.fromCharCode(...classBuffer.slice(0, classLength));
                }

                // Get window style
                const styleValue = this.user32.symbols.GetWindowLongW(hwnd, this.GWL_STYLE);

                // Get process ID
                let processId = 0;
                if (pidPtr) {
                    this.user32.symbols.GetWindowThreadProcessId(hwnd, pidPtr);
                    processId = pidBuffer[0];
                }

                // Get window position
                const position = this.getWindowDimensions(hwnd);

                // Calculate dimensions
                const dimensions = {
                    width: position.right - position.left,
                    height: position.bottom - position.top,
                };

                windowInfoList.push({
                    title,
                    handle: hwnd,
                    dimensions,
                    position,
                    isVisible,
                    className,
                    processId,
                    style: {
                        value: styleValue,
                        isMinimized: (styleValue & this.WS_MINIMIZE) !== 0,
                        isMaximized: (styleValue & this.WS_MAXIMIZE) !== 0,
                        isDisabled: (styleValue & this.WS_DISABLED) !== 0,
                    },
                });
            }

            // Get next window
            hwnd = this.user32.symbols.FindWindowExW(this.desktopWindowHandle, hwnd, null, null);
        }

        return windowInfoList;
    }

    /**
     * Captures the entire screen as a bitmap image
     * @param forceRefresh Force refresh of cached dimensions (default: true)
     * @returns Raw BMP image data
     * @throws Error if capture fails
     * @example
     * ```ts
     * const capture = new ScreenCapture();
     * const buffer = capture.captureScreen();
     * ```
     * @example Performance: If you have a large screen resolution and you are sure that the size will not change, you can use caching to improve performance.
     * ```ts
     * const capture = new ScreenCapture();
     * const buffer = capture.captureScreen(false);
     * ```
     */
    public captureScreen(forceRefresh: boolean = true): Uint8Array {
        // Get cached screen dimensions
        const { width, height } = this.getScreenDimensions(forceRefresh);

        // Get device context for the window
        const hdcWindow = this.user32.symbols.GetDC(this.desktopWindowHandle);
        if (hdcWindow === null) {
            throw new Error("Failed to get device context for window");
        }

        try {
            // Get or create GDI render context and bitmap
            const { hdcMemory, hBitmap } = this.getOrCreateGdiRenderContext(hdcWindow, width, height);

            // Get or create cached BMP structure
            const { bmpData, bmiPtr, pixelsPtr } = this.getOrCreateBmpStructure(width, height);

            // Select bitmap into DC
            const oldBitmap = this.gdi32.symbols.SelectObject(hdcMemory, hBitmap);
            if (oldBitmap === null) {
                throw new Error("Failed to select bitmap into DC");
            }

            try {
                // Copy screen content
                if (this.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, this.SRCCOPY) === 0) {
                    throw new Error("Failed to copy screen data");
                }

                // Get the image data
                if (this.gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, height, pixelsPtr, bmiPtr, 0) === 0) {
                    throw new Error("Failed to get bitmap data");
                }

                return bmpData;
            } finally {
                // Restore the original bitmap
                this.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
            }
        } finally {
            // Always release the window DC
            this.user32.symbols.ReleaseDC(this.desktopWindowHandle, hdcWindow);
        }
    }

    /**
     * Captures a specific window identified by className, processId, or handle
     * @param identifier Window className, processId, or handle to capture
     * @param forceRefresh Force refresh of cached dimensions (default: true)
     * @returns Raw BMP image data
     * @throws Error if window not found or capture fails
     * @example
     * ```ts
     * const capture = new ScreenCapture();
     * const buffer = capture.captureWindow("Notepad");
     * ```
     * @example Performance: If you have a large screen resolution and you are sure that the size will not change, you can use caching to improve performance.
     *
     * Additional performance: It is also recommended to find the window you need in advance via `getWindowList` and use its handle directly instead of ClassName or ProcessId.
     * ```ts
     * const capture = new ScreenCapture();
     * const buffer = capture.captureWindow("Notepad", false);
     * ```
     */
    public captureWindow(identifier: string | number | Deno.PointerObject, forceRefresh: boolean = true): Uint8Array {
        let hwnd: Deno.PointerObject;

        // Determine window handle based on the type of identifier
        if (typeof identifier === "string") {
            // Find window by class name
            const foundWindow = this.findWindowByClassName(identifier);
            if (foundWindow === null) {
                throw new Error(`Window with className "${identifier}" not found`);
            }
            hwnd = foundWindow;
        } else if (typeof identifier === "number") {
            // Find window by process ID
            const foundWindow = this.findWindowByProcessId(identifier);
            if (foundWindow === null) {
                throw new Error(`Window with processId ${identifier} not found`);
            }
            hwnd = foundWindow;
        } else {
            // Direct use of window handle
            hwnd = identifier;
        }

        // Get window dimensions
        const { width, height } = this.getWindowDimensions(hwnd, forceRefresh);

        // Create the BMP data structure
        const { bmpData, bmiPtr, pixelsPtr } = this.getOrCreateBmpStructure(width, height);

        // Get device context for the window
        const hdcWindow = this.user32.symbols.GetDC(hwnd);
        if (hdcWindow === null) {
            throw new Error("Failed to get device context for window");
        }

        try {
            // Get or create GDI render context and bitmap
            const { hdcMemory, hBitmap } = this.getOrCreateGdiRenderContext(hdcWindow, width, height);

            // Select bitmap into DC
            const oldBitmap = this.gdi32.symbols.SelectObject(hdcMemory, hBitmap);
            if (oldBitmap === null) {
                throw new Error("Failed to select bitmap into DC");
            }

            try {
                // Copy window content
                if (this.user32.symbols.PrintWindow(hwnd, hdcMemory, 2) === 0) {
                    throw new Error("Failed to copy window content");
                }

                // Get the image data
                if (this.gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, height, pixelsPtr, bmiPtr, 0) === 0) {
                    throw new Error("Failed to get bitmap data");
                }

                return bmpData;
            } finally {
                // Restore the original bitmap
                this.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
            }
        } finally {
            // Release the window DC
            this.user32.symbols.ReleaseDC(hwnd, hdcWindow);
        }
    }

    /**
     * Releases all resources used by the screenshot library.
     * Must be called when finished to prevent memory leaks.
     */
    public close(): void {
        // Cleanup all caches
        this.contextCache.clear();
        this.windowDimensionsCache.clear();
        this.bmpCache.clear();

        // Close FFI handles
        this.user32.close();
        this.gdi32.close();
    }
}
