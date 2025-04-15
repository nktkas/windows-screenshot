# windows-screenshot

[![JSR](https://jsr.io/badges/@nktkas/windows-screenshot)](https://jsr.io/@nktkas/windows-screenshot)

Windows screen capture for Deno with zero dependencies.

## Usage example

### Screenshot entire screen

```ts
import { ScreenCapture } from "@nktkas/windows-screenshot";

const capture = new ScreenCapture();

// Capture entire screen
const fullScreenBmp = await capture.captureScreen();

// Capture region (100,100 to 500,400)
const regionBmp = await capture.captureScreen({ left: 100, top: 100, right: 500, bottom: 400 });
```

### Screenshot specific window

```ts
import { ScreenCapture } from "@nktkas/windows-screenshot";

const capture = new ScreenCapture();

// Capture a specific window by title, class name, process id, or ffi handle
const titleBmp = await capture.captureWindow({ title: "Untitled - Notepad" });
const classNameBmp = await capture.captureWindow({ className: "Notepad" });
const processIdBmp = await capture.captureWindow({ processId: 1234 });
const handleBmp = await capture.captureWindow({ handle: windowHandle });
```

### Get the screen rectangle

```ts
import { ScreenCapture } from "@nktkas/windows-screenshot";

const capture = new ScreenCapture();
const screenRect = capture.getScreenRect();

// { left: 0, top: 0, right: 1920, bottom: 1080 }
```

### Get rectangle of a specific window

```ts
import { ScreenCapture } from "@nktkas/windows-screenshot";

const capture = new ScreenCapture();
const windowRect = capture.getWindowRect({ title: "Untitled - Notepad" }); // or className, processId, or handle

// { left: 100, top: 100, right: 500, bottom: 400 }
```

### Get a list of all visible windows

```ts
import { ScreenCapture } from "@nktkas/windows-screenshot";

const capture = new ScreenCapture();
const windows = capture.getWindowList();

// [
//   {
//     handle: {},
//     title: "...",
//     className: "...",
//     processId: 1234,
//     position: { left: 100, top: 100, right: 500, bottom: 400 },
//     style: {
//       isMinimized: true,
//       isMaximized: false,
//       isDisabled: false,
//     },
//   },
//   ...
// ]
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
/** Options for the ScreenCapture class */
interface ScreenCaptureOptions {
    /** The bit depth of the image to capture. Defaults to 24 bit. */
    bitDepth?: BitDepth;
    /** The type of palette to use for 8-bit color depth. Defaults to "halftone". */
    paletteType?: PaletteType;
    /** Whether to include the cursor in the screenshot. Defaults to true. */
    includeCursor?: boolean;
}

/** The RECT structure defines a rectangle by the coordinates of its upper-left and lower-right corners. */
interface Rect {
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
interface WindowInfo {
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
type WindowIdentifier =
    | { title: string }
    | { className: string }
    | { processId: number }
    | { handle: Deno.PointerObject };

/** Bit depth of the image */
type BitDepth = 1 | 4 | 8 | 16 | 24 | 32;

/** Type of palette to use for 8-bit color depth */
type PaletteType = "grayscale" | "halftone";

/** A class for capturing screenshots and window images in Windows */
class ScreenCapture implements Disposable {
    /**
     * Captures the entire screen or a specified portion as a bitmap image
     * @param rect Optional rectangle specifying the area to capture
     * @returns Raw BMP image data
     */
    async captureScreen(rect?: Partial<Rect>): Promise<Uint8Array>;

    /**
     * Captures a specific window identified by class name, process id, or ffi handle
     * @param identifier Window identifier
     * @returns Raw BMP image data
     */
    async captureWindow(identifier: WindowIdentifier): Promise<Uint8Array>;

    /**
     * Gets the screen rectangle
     * @returns Rectangle object with left, top, right, and bottom coordinates
     */
    getScreenRect(): Rect;

    /**
     * Gets the rectangle of a specified window
     * @param identifier Window identifier
     * @returns Rectangle object with left, top, right, and bottom coordinates
     */
    getWindowRect(identifier: WindowIdentifier): Rect;

    /**
     * Gets a list of all visible windows
     * @returns Array of window information objects
     */
    getWindowList(): WindowInfo[];

    /** Closes the FFI handles */
    close(): void;
}

/** A representation of a RGB image */
interface RGBImage {
    /** Width of the image in pixels */
    width: number;
    /** Height of the image in pixels */
    height: number;
    /** Number of channels in the image */
    channels: 3 | 4;
    /** Raw RGB data */
    data: Uint8Array;
}

/**
 * Converts a BMP to an RGB image
 * @param bmp - The BMP array to convert
 * @returns An object with the width, height, channels, and raw RGB data
 */
function bmpToRgb(bmp: Uint8Array): RGBImage;
```

## Benchmarks

```bash
deno bench --allow-ffi .\benchmarks\public.ts
```

> **Note:** Incomplete benchmark provided

```
    CPU | AMD Ryzen 9 7950X
Runtime | Deno 2.2.10 (x86_64-pc-windows-msvc)

benchmark       time/iter (avg)        iter/s      (min … max)           p75      p99     p995
--------------- ----------------------------- --------------------- --------------------------
captureScreen_24bit_1920x1080          12.5 ms          80.2 ( 10.3 ms …  14.9 ms)  12.7 ms  14.9 ms  14.9 ms
bmpToRgb_24bit_screen_1920x1080         8.5 ms         118.2 (  8.2 ms …  11.9 ms)   8.3 ms  11.9 ms  11.9 ms

captureScreen_24bit_2560x1440          18.0 ms          55.6 ( 16.0 ms …  22.3 ms)  19.4 ms  22.3 ms  22.3 ms
bmpToRgb_24bit_screen_2560x1440        15.0 ms          66.9 ( 14.4 ms …  18.5 ms)  14.7 ms  18.5 ms  18.5 ms

captureScreen_24bit_5120x1440          33.4 ms          30.0 ( 30.7 ms …  35.9 ms)  34.3 ms  35.9 ms  35.9 ms
bmpToRgb_24bit_screen_5120x1440        29.9 ms          33.5 ( 29.1 ms …  36.5 ms)  29.5 ms  36.5 ms  36.5 ms

captureWindow_24bit_minsize_notepad     4.2 ms         238.6 (  3.7 ms …   6.8 ms)   4.2 ms   5.7 ms   6.8 ms
bmpToRgb_24bit_window_minsize_notepad  39.0 µs        25,640 ( 27.2 µs …   1.4 ms)  38.5 µs  66.6 µs  87.6 µs

new ScreenCapture                       1.8 ms         565.5 (  1.7 ms …   4.8 ms)   1.8 ms   1.9 ms   2.3 ms
getScreenRect                           4.4 µs       228,000 (  4.1 µs …   5.4 µs)   4.5 µs   5.4 µs   5.4 µs
getWindowRect                           1.5 µs       683,600 (  1.2 µs …   2.8 µs)   1.5 µs   2.8 µs   2.8 µs
getWindowList                         448.5 µs         2,230 (389.3 µs …   4.2 ms) 442.1 µs 885.0 µs   1.0 ms
```

## Related

[`@nktkas/keyboard-hook`](https://github.com/nktkas/keyboard-hook) - Global Windows keyboard listener for Deno with zero
dependencies.

[`@nktkas/mouse-hook`](https://github.com/nktkas/mouse-hook) - Global Windows mouse listener for Deno with zero
dependencies.
