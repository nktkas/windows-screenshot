# windows-screenshot

[![JSR](https://jsr.io/badges/@nktkas/windows-screenshot)](https://jsr.io/@nktkas/windows-screenshot)

Windows screen capture for Deno with zero dependencies.

## Usage example

### Screen

```ts
import { ScreenCapture } from "@nktkas/windows-screenshot";

const capture = new ScreenCapture();

// Capture entire screen
const fullScreen = await capture.captureScreen();

// Capture region (100,100 to 500,400)
const region = await capture.captureScreen({ left: 100, top: 100, right: 500, bottom: 400 });
```

### Window

```ts
import { ScreenCapture } from "@nktkas/windows-screenshot";

const capture = new ScreenCapture();

// Capture a specific window by class name, process id, or ffi handle
const classNameBmp = await capture.captureWindow("Notepad");
const processIdBmp = await capture.captureWindow(1234);
const handleBmp = await capture.captureWindow(windowHandle);
```

### Cleanup

After you have finished working with the ScreenCapture instance, you must clear the FFI resources

```ts
import { ScreenCapture } from "@nktkas/windows-screenshot";

const capture = new ScreenCapture();

// any operations

capture.close();
```

## API

```ts
/** The RECT structure defines a rectangle by the coordinates of its upper-left and lower-right corners */
export interface Rect {
    /** Specifies the x-coordinate of the upper-left corner of the rectangle */
    left: number;
    /** Specifies the y-coordinate of the upper-left corner of the rectangle */
    top: number;
    /** Specifies the x-coordinate of the lower-right corner of the rectangle */
    right: number;
    /** Specifies the y-coordinate of the lower-right corner of the rectangle */
    bottom: number;
}

/** The SIZE structure defines the width and height of a rectangle. */
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

/** A class for capturing screenshots and window images in Windows */
export class ScreenCapture {
    /**
     * Captures the entire screen or a specified portion as a bitmap image
     * @param rect Optional rectangle specifying the area to capture
     * @returns Raw BMP image data
     */
    async captureScreen(rect: Partial<Rect> = {}): Promise<Uint8Array>;

    /**
     * Captures a specific window identified by class name, process id, or ffi handle
     * @param identifier Window class name, process id, or ffi handle to capture
     * @returns Raw BMP image data
     */
    async captureWindow(identifier: string | number | Deno.PointerObject): Promise<Uint8Array>;

    /**
     * Gets the screen size
     * @returns Size object with cx (width) and cy (height) properties
     */
    getScreenSize(): Size;

    /**
     * Gets the rectangle of a specified window
     * @param identifier Window class name, process ID, or handle to get the rectangle for
     * @returns Rectangle object with left, top, right, and bottom coordinates
     */
    getWindowRect(identifier: string | number | Deno.PointerObject): Rect;

    /**
     * Gets a list of all visible windows
     * @returns Array of window information objects
     */
    getWindowList(): WindowInfo[];

    /** Closes the FFI handles */
    close(): void;
}
```

## Benchmarks

```bash
deno bench --allow-ffi .\benchmarks\public.ts
```

### 1920x1080

```
    CPU | AMD Ryzen 9 7950X
Runtime | Deno 2.2.4 (x86_64-pc-windows-msvc)

benchmark       time/iter (avg)        iter/s      (min … max)           p75      p99     p995
--------------- ----------------------------- --------------------- --------------------------
captureScreen           12.9 ms          77.5 ( 10.8 ms …  16.6 ms)  12.9 ms  16.6 ms  16.6 ms
captureWindow            4.2 ms         238.3 (  3.6 ms …   6.6 ms)   4.3 ms   6.4 ms   6.6 ms
getScreenSize            4.1 µs       243,000 (  4.0 µs …   4.5 µs)   4.1 µs   4.5 µs   4.5 µs
getWindowRect            1.4 µs       702,600 (  1.2 µs …   2.6 µs)   1.4 µs   2.6 µs   2.6 µs
getWindowList          327.3 µs         3,055 (283.2 µs …   3.7 ms) 321.8 µs 776.7 µs 951.3 µs
```

### 2560x1440

```
    CPU | AMD Ryzen 9 7950X
Runtime | Deno 2.2.4 (x86_64-pc-windows-msvc)

benchmark       time/iter (avg)        iter/s      (min … max)           p75      p99     p995
--------------- ----------------------------- --------------------- --------------------------
captureScreen           21.4 ms          46.7 ( 18.7 ms …  27.9 ms)  22.1 ms  27.9 ms  27.9 ms
captureWindow            4.2 ms         239.8 (  3.7 ms …   4.6 ms)   4.3 ms   4.6 ms   4.6 ms
getScreenSize            4.2 µs       240,500 (  4.1 µs …   4.5 µs)   4.2 µs   4.5 µs   4.5 µs
getWindowRect            1.4 µs       711,300 (  1.2 µs …   2.7 µs)   1.4 µs   2.7 µs   2.7 µs
getWindowList          327.9 µs         3,050 (281.5 µs …   3.7 ms) 321.4 µs 860.6 µs   1.0 ms
```

### 5120x1440

```
    CPU | AMD Ryzen 9 7950X
Runtime | Deno 2.2.4 (x86_64-pc-windows-msvc)

benchmark       time/iter (avg)        iter/s      (min … max)           p75      p99     p995
--------------- ----------------------------- --------------------- --------------------------
captureScreen           38.3 ms          26.1 ( 35.6 ms …  43.3 ms)  39.3 ms  43.3 ms  43.3 ms
captureWindow            4.2 ms         240.1 (  3.6 ms …   5.1 ms)   4.2 ms   4.7 ms   5.1 ms
getScreenSize            4.2 µs       238,000 (  4.1 µs …   5.0 µs)   4.2 µs   5.0 µs   5.0 µs
getWindowRect            1.4 µs       740,300 (  1.1 µs …   2.4 µs)   1.4 µs   2.4 µs   2.4 µs
getWindowList          335.2 µs         2,983 (283.4 µs …   3.3 ms) 326.2 µs 905.6 µs   1.2 ms
```

## Related

[`@nktkas/keyboard-hook`](https://github.com/nktkas/keyboard-hook) - Windows keyboard listening for Deno with zero
dependencies.

[`@nktkas/mouse-hook`](https://github.com/nktkas/mouse-hook) - Windows mouse listening for Deno with zero dependencies.
