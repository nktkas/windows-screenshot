# windows-screenshot

[![JSR](https://jsr.io/badges/@nktkas/windows-screenshot)](https://jsr.io/@nktkas/windows-screenshot)

Library for creating a screenshot.

## Features

- Written for [Deno](https://deno.com) + Windows 11 x64.
- Uses native user32.dll and gdi32.dll, so no external modules are needed.
- High performance (as much as possible for user32.dll / gdi32.dll). Actively uses caching and optimizations.

## Usage example

### Screen

Create a screenshot of the full screen.

```ts
const capture = new ScreenCapture();
const buffer = capture.captureScreen();
```

### Window

Create a screenshot of the application window.

```ts
const capture = new ScreenCapture();
const buffer = capture.captureWindow("Notepad"); // or ProcessId or FFI Handle
```

### List of windows

Get a list of programs and their window information: size, position, indentifiers, Deno FFI Handle and styles

```ts
const capture = new ScreenCapture();
const windowList = capture.getWindowList();
```

### Cleanup

If you no longer need the ScreenCapture instance, free resources to prevent memory leaks.

```ts
const capture = new ScreenCapture();

// any operations

capture.close();
```

## API

```ts
/** Comprehensive information about a window in the Windows operating system */
export interface WindowInfo {
    /** Window title text */
    title: string;
    /** Native window handle for FFI operations */
    handle: Deno.PointerObject;
    /** Window width and height */
    dimensions: { width: number; height: number };
    /** Window coordinates on screen */
    position: { left: number; top: number; right: number; bottom: number };
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

/** A class for capturing screenshots and window images in Windows */
export class ScreenCapture {
    /**
     * Retrieves information about all windows in the system
     * @param visibleOnly Only include visible windows
     * @returns Array of window information objects
     */
    getWindowList(visibleOnly: boolean = true): WindowInfo[];

    /**
     * Captures the entire screen as a bitmap image
     * @param forceRefresh Force refresh of cached dimensions (default: true)
     * @returns Raw BMP image data
     * @throws Error if capture fails
     */
    captureScreen(forceRefresh: boolean = true): Uint8Array;

    /**
     * Captures a specific window identified by className, processId, or handle
     * @param identifier Window className, processId, or handle to capture
     * @param forceRefresh Force refresh of cached dimensions (default: true)
     * @returns Raw BMP image data
     * @throws Error if window not found or capture fails
     */
    captureWindow(identifier: string | number | Deno.PointerObject, forceRefresh: boolean = true): Uint8Array;

    /**
     * Releases all resources used by the screenshot library.
     * Must be called when finished to prevent memory leaks.
     */
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
Runtime | Deno 2.2.2 (x86_64-pc-windows-msvc)

benchmark                       time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------------------------- ----------------------------- --------------------- --------------------------
Class initialization                     1.5 ms         677.0 (  1.4 ms …   4.9 ms)   1.5 ms   1.6 ms   1.8 ms
Class cleanup                            3.5 µs       287,400 (  2.8 µs …  25.0 µs)   3.6 µs   6.9 µs   8.5 µs

group captureScreen
captureScreen - without cache           10.9 ms          91.7 (  9.3 ms …  15.2 ms)  11.1 ms  14.3 ms  14.8 ms
captureScreen - with cache              12.1 ms          82.8 (  8.2 ms …  14.8 ms)  12.4 ms  13.2 ms  13.4 ms

summary
  captureScreen - without cache
     1.11x faster than captureScreen - with cache

group captureWindow
captureWindow - without cache            4.4 ms         226.4 (  2.2 ms …   7.6 ms)   6.6 ms   7.4 ms   7.4 ms
captureWindow - with cache               4.1 ms         246.8 (  3.2 ms …   8.7 ms)   4.2 ms   4.6 ms   4.7 ms

summary
  captureWindow - with cache
     1.09x faster than captureWindow - without cache

group captureWindow_find
captureWindow - by class name            5.6 ms         179.3 (  2.2 ms …   7.6 ms)   6.7 ms   7.3 ms   7.4 ms
captureWindow - by process id            5.6 ms         178.4 (  2.3 ms …  11.4 ms)   6.8 ms   7.5 ms   7.7 ms
captureWindow - by handle                4.3 ms         230.4 (  2.2 ms …   7.7 ms)   6.6 ms   7.4 ms   7.4 ms

summary
  captureWindow - by handle
     1.28x faster than captureWindow - by class name
     1.29x faster than captureWindow - by process id

group getWindowList
getWindowList - only visible           362.2 µs         2,761 (302.3 µs …   1.6 ms) 336.1 µs   1.2 ms   1.3 ms
getWindowList - all                      1.3 ms         775.2 (  1.1 ms …   3.0 ms)   1.2 ms   2.3 ms   2.7 ms

summary
  getWindowList - only visible
     3.56x faster than getWindowList - all
```

### 2560x1440

```
    CPU | AMD Ryzen 9 7950X
Runtime | Deno 2.2.2 (x86_64-pc-windows-msvc)

benchmark                       time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------------------------- ----------------------------- --------------------- --------------------------
Class initialization                     1.5 ms         674.0 (  1.4 ms …   4.5 ms)   1.5 ms   1.6 ms   1.7 ms
Class cleanup                            3.5 µs       286,800 (  2.9 µs …  25.2 µs)   3.6 µs   5.4 µs   7.3 µs

group captureScreen
captureScreen - without cache           19.4 ms          51.5 ( 17.1 ms …  29.8 ms)  20.9 ms  23.5 ms  24.1 ms
captureScreen - with cache              17.6 ms          56.9 ( 13.9 ms …  21.8 ms)  17.8 ms  20.5 ms  20.7 ms

summary
  captureScreen - with cache
     1.10x faster than captureScreen - without cache

group captureWindow
captureWindow - without cache            4.5 ms         223.7 (  2.1 ms …   7.7 ms)   6.6 ms   7.4 ms   7.5 ms
captureWindow - with cache               4.1 ms         245.9 (  3.1 ms …   8.8 ms)   4.2 ms   4.6 ms   4.7 ms

summary
  captureWindow - with cache
     1.10x faster than captureWindow - without cache

group captureWindow_find
captureWindow - by class name            5.5 ms         183.0 (  2.3 ms …   7.5 ms)   6.7 ms   7.3 ms   7.4 ms
captureWindow - by process id            4.9 ms         202.3 (  2.3 ms …   7.6 ms)   6.7 ms   7.4 ms   7.5 ms
captureWindow - by handle                4.0 ms         248.8 (  2.1 ms …   7.7 ms)   6.4 ms   7.4 ms   7.5 ms

summary
  captureWindow - by handle
     1.23x faster than captureWindow - by process id
     1.36x faster than captureWindow - by class name

group getWindowList
getWindowList - only visible           345.4 µs         2,896 (300.6 µs …   1.2 ms) 325.4 µs   1.1 ms   1.2 ms
getWindowList - all                      1.2 ms         824.8 (  1.1 ms …   2.4 ms)   1.2 ms   2.1 ms   2.2 ms

summary
  getWindowList - only visible
     3.51x faster than getWindowList - all
```

### 5120x1440

```
    CPU | AMD Ryzen 9 7950X
Runtime | Deno 2.2.2 (x86_64-pc-windows-msvc)

benchmark                       time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------------------------- ----------------------------- --------------------- --------------------------
Class initialization                     1.5 ms         672.2 (  1.4 ms …   3.3 ms)   1.5 ms   1.7 ms   1.8 ms
Class cleanup                            3.4 µs       290,700 (  2.9 µs …  24.4 µs)   3.5 µs   6.4 µs   7.2 µs

group captureScreen
captureScreen - without cache           35.9 ms          27.8 ( 32.8 ms …  49.8 ms)  36.3 ms  43.0 ms  43.5 ms
captureScreen - with cache              30.2 ms          33.2 ( 26.3 ms …  36.7 ms)  31.2 ms  35.4 ms  36.1 ms

summary
  captureScreen - with cache
     1.19x faster than captureScreen - without cache

group captureWindow
captureWindow - without cache            4.7 ms         213.4 (  2.1 ms …   7.7 ms)   6.6 ms   7.4 ms   7.5 ms
captureWindow - with cache               4.1 ms         246.6 (  3.1 ms …   7.7 ms)   4.2 ms   4.6 ms   4.7 ms

summary
  captureWindow - with cache
     1.16x faster than captureWindow - without cache

group captureWindow_find
captureWindow - by class name            5.9 ms         170.6 (  2.3 ms …   7.6 ms)   6.7 ms   7.3 ms   7.3 ms
captureWindow - by process id            5.7 ms         176.7 (  2.2 ms …   8.2 ms)   6.7 ms   7.3 ms   7.3 ms
captureWindow - by handle                4.8 ms         207.5 (  2.1 ms …   7.5 ms)   6.6 ms   7.2 ms   7.4 ms

summary
  captureWindow - by handle
     1.17x faster than captureWindow - by process id
     1.22x faster than captureWindow - by class name

group getWindowList
getWindowList - only visible           333.5 µs         2,999 (294.6 µs …   1.5 ms) 313.9 µs   1.1 ms   1.1 ms
getWindowList - all                      1.2 ms         849.7 (  1.0 ms …   3.0 ms)   1.1 ms   2.1 ms   2.2 ms

summary
  getWindowList - only visible
     3.53x faster than getWindowList - all
```

## Related

[`@nktkas/keyboard-hook`](https://github.com/nktkas/keyboard-hook) - Library for listening to global keyboard press
events.
