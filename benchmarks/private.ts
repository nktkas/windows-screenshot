/**
 * Benchmarks for internal library methods.
 */

import { ScreenCapture } from "../mod.ts";

const windowClassName = "Notepad"; // Replace with actual window class name
const windowList = new ScreenCapture().getWindowList();
const testWindow = windowList.find((w) => w.className === windowClassName);
if (!testWindow) {
    throw new Error(`Window with class name "${windowClassName}" not found.`);
}

// —————————— getWindowDimensions ——————————

Deno.bench("getWindowDimensions - uncached", { n: 1000, group: "getWindowDimensions" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    // @ts-ignore - Accessing private method
    capture.getWindowDimensions(testWindow.handle, true);
    t.end();

    capture.close();
});

Deno.bench("getWindowDimensions - cached", { n: 1000, group: "getWindowDimensions" }, (t) => {
    const capture = new ScreenCapture();

    // Cache the dimensions first
    // @ts-ignore - Accessing private method
    capture.getWindowDimensions(testWindow.handle);

    t.start();
    // @ts-ignore - Accessing private method
    capture.getWindowDimensions(testWindow.handle);
    t.end();

    capture.close();
});

// —————————— getScreenDimensions ——————————

Deno.bench("getScreenDimensions - uncached", { n: 1000, group: "getScreenDimensions" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    // @ts-ignore - Accessing private method
    capture.getScreenDimensions(true);
    t.end();

    capture.close();
});

Deno.bench("getScreenDimensions - cached", { n: 1000, group: "getScreenDimensions" }, (t) => {
    const capture = new ScreenCapture();

    // Cache the dimensions first
    // @ts-ignore - Accessing private method
    capture.getScreenDimensions();

    t.start();
    // @ts-ignore - Accessing private method
    capture.getScreenDimensions();
    t.end();

    capture.close();
});

// —————————— createBmpStructure - Screen Size ——————————

Deno.bench("createBmpStructure - 1280x720", { n: 1000, group: "createBmpStructure_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    // @ts-ignore - Accessing private method
    capture.createBmpStructure(1280, 720);
    t.end();

    capture.close();
});

Deno.bench("createBmpStructure - 1920x1080", { n: 1000, group: "createBmpStructure_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    // @ts-ignore - Accessing private method
    capture.createBmpStructure(1920, 1080);
    t.end();

    capture.close();
});

Deno.bench("createBmpStructure - 2560x1440", { n: 1000, group: "createBmpStructure_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    // @ts-ignore - Accessing private method
    capture.createBmpStructure(2560, 1440);
    t.end();

    capture.close();
});

Deno.bench("createBmpStructure - 3840x2160", { n: 1000, group: "createBmpStructure_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    // @ts-ignore - Accessing private method
    capture.createBmpStructure(3840, 2160);
    t.end();

    capture.close();
});

// —————————— getOrCreateBmpStructure ——————————

Deno.bench("getOrCreateBmpStructure - new creation", { n: 1000, group: "getOrCreateBmpStructure" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    // @ts-ignore - Accessing private method
    capture.getOrCreateBmpStructure(1920, 1080);
    t.end();

    capture.close();
});

Deno.bench("getOrCreateBmpStructure - cached", { n: 1000, group: "getOrCreateBmpStructure" }, (t) => {
    const capture = new ScreenCapture();

    // Cache the structure first
    // @ts-ignore - Accessing private method
    capture.getOrCreateBmpStructure(1920, 1080);

    t.start();
    // @ts-ignore - Accessing private method
    capture.getOrCreateBmpStructure(1920, 1080);
    t.end();

    capture.close();
});

Deno.bench("getOrCreateBmpStructure - multiple sizes", { n: 1000, group: "getOrCreateBmpStructure" }, (t) => {
    const capture = new ScreenCapture();

    // Create structures of multiple sizes
    // @ts-ignore - Accessing private method
    capture.getOrCreateBmpStructure(800, 600);
    // @ts-ignore - Accessing private method
    capture.getOrCreateBmpStructure(1024, 768);

    t.start();
    // This will create a new structure of a different size
    // @ts-ignore - Accessing private method
    capture.getOrCreateBmpStructure(1920, 1080);
    t.end();

    capture.close();
});

// —————————— createGdiRenderContext - Screen Size ——————————

Deno.bench("createGdiRenderContext - 1280x720", { n: 1000, group: "createGdiRenderContext_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();

    // Get window DC for the test
    // @ts-ignore - Accessing private field
    const desktopHandle = capture.desktopWindowHandle;
    // @ts-ignore - Accessing private field
    const hdcWindow = capture.user32.symbols.GetDC(desktopHandle);

    t.start();
    // @ts-ignore - Accessing private method
    const context = capture.createGdiRenderContext(hdcWindow, 1280, 720);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(context.hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(context.hdcMemory);
    // @ts-ignore - Accessing private field
    capture.user32.symbols.ReleaseDC(desktopHandle, hdcWindow);
    capture.close();
});

Deno.bench("createGdiRenderContext - 1920x1080", { n: 1000, group: "createGdiRenderContext_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();

    // Get window DC for the test
    // @ts-ignore - Accessing private field
    const desktopHandle = capture.desktopWindowHandle;
    // @ts-ignore - Accessing private field
    const hdcWindow = capture.user32.symbols.GetDC(desktopHandle);

    t.start();
    // @ts-ignore - Accessing private method
    const context = capture.createGdiRenderContext(hdcWindow, 1920, 1080);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(context.hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(context.hdcMemory);
    // @ts-ignore - Accessing private field
    capture.user32.symbols.ReleaseDC(desktopHandle, hdcWindow);
    capture.close();
});

Deno.bench("createGdiRenderContext - 2560x1440", { n: 1000, group: "createGdiRenderContext_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();

    // Get window DC for the test
    // @ts-ignore - Accessing private field
    const desktopHandle = capture.desktopWindowHandle;
    // @ts-ignore - Accessing private field
    const hdcWindow = capture.user32.symbols.GetDC(desktopHandle);

    t.start();
    // @ts-ignore - Accessing private method
    const context = capture.createGdiRenderContext(hdcWindow, 2560, 1440);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(context.hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(context.hdcMemory);
    // @ts-ignore - Accessing private field
    capture.user32.symbols.ReleaseDC(desktopHandle, hdcWindow);
    capture.close();
});

Deno.bench("createGdiRenderContext - 3840x2160", { n: 1000, group: "createGdiRenderContext_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();

    // Get window DC for the test
    // @ts-ignore - Accessing private field
    const desktopHandle = capture.desktopWindowHandle;
    // @ts-ignore - Accessing private field
    const hdcWindow = capture.user32.symbols.GetDC(desktopHandle);

    t.start();
    // @ts-ignore - Accessing private method
    const context = capture.createGdiRenderContext(hdcWindow, 3840, 2160);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(context.hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(context.hdcMemory);
    // @ts-ignore - Accessing private field
    capture.user32.symbols.ReleaseDC(desktopHandle, hdcWindow);
    capture.close();
});

// —————————— getOrCreateGdiRenderContext ——————————

Deno.bench("getOrCreateGdiRenderContext - new context", { n: 1000, group: "getOrCreateGdiRenderContext" }, (t) => {
    const capture = new ScreenCapture();

    // Get window DC for the test
    // @ts-ignore - Accessing private field
    const desktopHandle = capture.desktopWindowHandle;
    // @ts-ignore - Accessing private field
    const hdcWindow = capture.user32.symbols.GetDC(desktopHandle);

    t.start();
    // @ts-ignore - Accessing private method
    capture.getOrCreateGdiRenderContext(hdcWindow, 800, 600);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private field
    capture.user32.symbols.ReleaseDC(desktopHandle, hdcWindow);
    capture.close();
});

Deno.bench("getOrCreateGdiRenderContext - reused context", { n: 1000, group: "getOrCreateGdiRenderContext" }, (t) => {
    const capture = new ScreenCapture();

    // Get window DC for the test
    // @ts-ignore - Accessing private field
    const desktopHandle = capture.desktopWindowHandle;
    // @ts-ignore - Accessing private field
    const hdcWindow = capture.user32.symbols.GetDC(desktopHandle);

    // Create the context first
    // @ts-ignore - Accessing private method
    capture.getOrCreateGdiRenderContext(hdcWindow, 800, 600);

    t.start();
    // This should reuse the existing context
    // @ts-ignore - Accessing private method
    capture.getOrCreateGdiRenderContext(hdcWindow, 800, 600);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private field
    capture.user32.symbols.ReleaseDC(desktopHandle, hdcWindow);
    capture.close();
});

Deno.bench("getOrCreateGdiRenderContext - different size", { n: 1000, group: "getOrCreateGdiRenderContext" }, (t) => {
    const capture = new ScreenCapture();

    // Get window DC for the test
    // @ts-ignore - Accessing private field
    const desktopHandle = capture.desktopWindowHandle;
    // @ts-ignore - Accessing private field
    const hdcWindow = capture.user32.symbols.GetDC(desktopHandle);

    // Create a context with one size
    // @ts-ignore - Accessing private method
    capture.getOrCreateGdiRenderContext(hdcWindow, 800, 600);

    t.start();
    // Create a context with different dimensions
    // @ts-ignore - Accessing private method
    capture.getOrCreateGdiRenderContext(hdcWindow, 1024, 768);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private field
    capture.user32.symbols.ReleaseDC(desktopHandle, hdcWindow);
    capture.close();
});

// —————————— findWindowByClassName ——————————

Deno.bench("findWindowByClassName - existing class", { n: 1000, group: "findWindowByClassName" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    // @ts-ignore - Accessing private method
    capture.findWindowByClassName(testWindow.className);
    t.end();

    capture.close();
});
Deno.bench("findWindowByClassName - non-existent class", { n: 1000, group: "findWindowByClassName" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    // @ts-ignore - Accessing private method
    capture.findWindowByClassName("NonExistentClassNameForBenchmark");
    t.end();

    capture.close();
});

// —————————— findWindowByProcessId ——————————

Deno.bench("findWindowByProcessId - existing process", { n: 1000, group: "findWindowByProcessId" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    // @ts-ignore - Accessing private method
    capture.findWindowByProcessId(testWindow.processId);
    t.end();

    capture.close();
});
Deno.bench("findWindowByProcessId - non-existent process", { n: 1000, group: "findWindowByProcessId" }, (t) => {
    const capture = new ScreenCapture();

    // Use an impossibly high process ID that shouldn't exist
    const nonExistentPid = 9999999;

    t.start();
    // @ts-ignore - Accessing private method
    capture.findWindowByProcessId(nonExistentPid);
    t.end();

    capture.close();
});

// —————————— Direct user32.dll FFI calls ——————————

Deno.bench("Direct GetDC FFI call", { n: 1000, group: "user32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;

    t.start();
    const hdcWindow = user32.symbols.GetDC(testWindow.handle);
    t.end();

    // Cleanup
    user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("Direct ReleaseDC FFI call", { n: 1000, group: "user32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    const hdcWindow = user32.symbols.GetDC(testWindow.handle);

    t.start();
    user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    t.end();

    capture.close();
});

Deno.bench("Direct FindWindowExW FFI call", { n: 1000, group: "user32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    // @ts-ignore - Accessing private fields
    const desktopWindowHandle = capture.desktopWindowHandle;

    t.start();
    user32.symbols.FindWindowExW(desktopWindowHandle, null, null, null);
    t.end();

    capture.close();
});

Deno.bench("Direct GetWindowTextW FFI call", { n: 1000, group: "user32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    const titleBuffer = new Uint16Array(256);

    t.start();
    user32.symbols.GetWindowTextW(testWindow.handle, titleBuffer, titleBuffer.length);
    t.end();

    capture.close();
});

Deno.bench("Direct GetClassNameW FFI call", { n: 1000, group: "user32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    const classBuffer = new Uint16Array(256);

    t.start();
    user32.symbols.GetClassNameW(testWindow.handle, classBuffer, classBuffer.length);
    t.end();

    capture.close();
});

Deno.bench("Direct IsWindowVisible FFI call", { n: 1000, group: "user32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;

    t.start();
    user32.symbols.IsWindowVisible(testWindow.handle);
    t.end();

    capture.close();
});

Deno.bench("Direct GetWindowThreadProcessId FFI call", { n: 1000, group: "user32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    const pidBuffer = new Uint32Array(1);
    const pidPtr = Deno.UnsafePointer.of(pidBuffer);

    t.start();
    user32.symbols.GetWindowThreadProcessId(testWindow.handle, pidPtr);
    t.end();

    capture.close();
});

Deno.bench("Direct GetWindowLongW FFI call", { n: 1000, group: "user32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    // @ts-ignore - Accessing private fields
    const GWL_STYLE = capture.GWL_STYLE;

    t.start();
    user32.symbols.GetWindowLongW(testWindow.handle, GWL_STYLE);
    t.end();

    capture.close();
});

Deno.bench("Direct GetDpiForWindow FFI call", { n: 1000, group: "user32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;

    t.start();
    user32.symbols.GetDpiForWindow(testWindow.handle);
    t.end();

    capture.close();
});

Deno.bench("Direct PrintWindow FFI call", { n: 1000, group: "user32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    // Get device context for the window
    const hdcWindow = user32.symbols.GetDC(testWindow.handle);
    // Create memory DC
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // Create bitmap
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, 800, 600);
    // Select bitmap into DC
    // @ts-ignore - Accessing private fields
    const oldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

// —————————— Direct gdi32.dll FFI calls ——————————

Deno.bench("Direct CreateCompatibleDC FFI call", { n: 1000, group: "gdi32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const gdi32 = capture.gdi32;
    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    const hdcWindow = user32.symbols.GetDC(testWindow.handle);

    t.start();
    const hdcMemory = gdi32.symbols.CreateCompatibleDC(hdcWindow);
    t.end();

    // Cleanup
    gdi32.symbols.DeleteDC(hdcMemory);
    user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("Direct DeleteDC FFI call", { n: 1000, group: "gdi32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const gdi32 = capture.gdi32;
    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    const hdcWindow = user32.symbols.GetDC(testWindow.handle);
    const hdcMemory = gdi32.symbols.CreateCompatibleDC(hdcWindow);

    t.start();
    gdi32.symbols.DeleteDC(hdcMemory);
    t.end();

    user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("Direct CreateCompatibleBitmap FFI call", { n: 1000, group: "gdi32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const gdi32 = capture.gdi32;
    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    const hdcWindow = user32.symbols.GetDC(testWindow.handle);

    t.start();
    const hBitmap = gdi32.symbols.CreateCompatibleBitmap(hdcWindow, 1920, 1080);
    t.end();

    // Cleanup
    gdi32.symbols.DeleteObject(hBitmap);
    user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("Direct DeleteObject FFI call", { n: 1000, group: "gdi32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const gdi32 = capture.gdi32;
    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    const hdcWindow = user32.symbols.GetDC(testWindow.handle);
    const hBitmap = gdi32.symbols.CreateCompatibleBitmap(hdcWindow, 800, 600);

    t.start();
    gdi32.symbols.DeleteObject(hBitmap);
    t.end();

    user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("Direct SelectObject FFI call", { n: 1000, group: "gdi32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const gdi32 = capture.gdi32;
    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    const hdcWindow = user32.symbols.GetDC(testWindow.handle);
    const hdcMemory = gdi32.symbols.CreateCompatibleDC(hdcWindow);
    const hBitmap = gdi32.symbols.CreateCompatibleBitmap(hdcWindow, 800, 600);

    t.start();
    const oldBitmap = gdi32.symbols.SelectObject(hdcMemory, hBitmap);
    t.end();

    // Cleanup
    gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    gdi32.symbols.DeleteObject(hBitmap);
    gdi32.symbols.DeleteDC(hdcMemory);
    user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("Direct BitBlt FFI call", { n: 1000, group: "gdi32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const gdi32 = capture.gdi32;
    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    // @ts-ignore - Accessing private constants
    const SRCCOPY = capture.SRCCOPY;
    const hdcWindow = user32.symbols.GetDC(testWindow.handle);
    const hdcMemory = gdi32.symbols.CreateCompatibleDC(hdcWindow);
    const hBitmap = gdi32.symbols.CreateCompatibleBitmap(hdcWindow, 800, 600);
    const oldBitmap = gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    gdi32.symbols.BitBlt(hdcMemory, 0, 0, 800, 600, hdcWindow, 0, 0, SRCCOPY);
    t.end();

    // Cleanup
    gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    gdi32.symbols.DeleteObject(hBitmap);
    gdi32.symbols.DeleteDC(hdcMemory);
    user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("Direct GetDIBits FFI call", { n: 1000, group: "gdi32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // Setup
    // @ts-ignore - Accessing private fields and methods
    const gdi32 = capture.gdi32;
    // @ts-ignore - Accessing private fields and methods
    const user32 = capture.user32;
    // @ts-ignore - Accessing private fields and methods
    const SRCCOPY = capture.SRCCOPY;

    const hdcWindow = user32.symbols.GetDC(testWindow.handle);
    const hdcMemory = gdi32.symbols.CreateCompatibleDC(hdcWindow);
    const hBitmap = gdi32.symbols.CreateCompatibleBitmap(hdcWindow, 800, 600);
    const oldBitmap = gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    // Create bitmap info structure
    // @ts-ignore - Accessing private method
    const bmpStructure = capture.getOrCreateBmpStructure(800, 600);

    // Copy content
    gdi32.symbols.BitBlt(hdcMemory, 0, 0, 800, 600, hdcWindow, 0, 0, SRCCOPY);

    t.start();
    gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, 600, bmpStructure.pixelsPtr, bmpStructure.bmiPtr, 0);
    t.end();

    // Cleanup
    gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    gdi32.symbols.DeleteObject(hBitmap);
    gdi32.symbols.DeleteDC(hdcMemory);
    user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("Direct GetDeviceCaps FFI call", { n: 1000, group: "gdi32_FFI" }, (t) => {
    const capture = new ScreenCapture();

    // @ts-ignore - Accessing private fields
    const gdi32 = capture.gdi32;
    // @ts-ignore - Accessing private fields
    const user32 = capture.user32;
    // @ts-ignore - Accessing private constants
    const DESKTOPHORZRES = capture.DESKTOPHORZRES;
    const hdcScreen = user32.symbols.GetDC(null);

    t.start();
    gdi32.symbols.GetDeviceCaps(hdcScreen, DESKTOPHORZRES);
    t.end();

    // Cleanup
    user32.symbols.ReleaseDC(null, hdcScreen);
    capture.close();
});

// —————————— BitBlt - Screen Size ——————————

Deno.bench("BitBlt - 1280x720", { n: 1000, group: "BitBlt_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 1280;
    const height = 720;

    // Get device context for the window
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);
    // Create memory DC
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // Create bitmap
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // Select bitmap into DC
    // @ts-ignore - Accessing private fields
    const oldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, capture.SRCCOPY);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("BitBlt - 1920x1080", { n: 1000, group: "BitBlt_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 1920;
    const height = 1080;

    // Get device context for the window
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);
    // Create memory DC
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // Create bitmap
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // Select bitmap into DC
    // @ts-ignore - Accessing private fields
    const oldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, capture.SRCCOPY);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("BitBlt - 2560x1440", { n: 1000, group: "BitBlt_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 2560;
    const height = 1440;

    // Get device context for the window
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);
    // Create memory DC
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // Create bitmap
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // Select bitmap into DC
    // @ts-ignore - Accessing private fields
    const oldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, capture.SRCCOPY);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("BitBlt - 3840x2160", { n: 1000, group: "BitBlt_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 3840;
    const height = 2160;

    // Get device context for the window
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);
    // Create memory DC
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // Create bitmap
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // Select bitmap into DC
    // @ts-ignore - Accessing private fields
    const oldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, capture.SRCCOPY);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

// —————————— GetDIBits - Screen Size ——————————

Deno.bench("GetDIBits - 1280x720", { n: 1000, group: "GetDIBits_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 1280;
    const height = 720;

    // Setup
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const oldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    // Create bitmap info structure
    // @ts-ignore - Accessing private method
    const bmpStructure = capture.getOrCreateBmpStructure(width, height);

    // Copy content for the test
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, capture.SRCCOPY);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, height, bmpStructure.pixelsPtr, bmpStructure.bmiPtr, 0);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("GetDIBits - 1920x1080", { n: 1000, group: "GetDIBits_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 1920;
    const height = 1080;

    // Setup
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const oldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    // Create bitmap info structure
    // @ts-ignore - Accessing private method
    const bmpStructure = capture.getOrCreateBmpStructure(width, height);

    // Copy content for the test
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, capture.SRCCOPY);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, height, bmpStructure.pixelsPtr, bmpStructure.bmiPtr, 0);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("GetDIBits - 2560x1440", { n: 1000, group: "GetDIBits_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 2560;
    const height = 1440;

    // Setup
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const oldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    // Create bitmap info structure
    // @ts-ignore - Accessing private method
    const bmpStructure = capture.getOrCreateBmpStructure(width, height);

    // Copy content for the test
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, capture.SRCCOPY);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, height, bmpStructure.pixelsPtr, bmpStructure.bmiPtr, 0);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("GetDIBits - 3840x2160", { n: 1000, group: "GetDIBits_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 3840;
    const height = 2160;

    // Setup
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const oldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    // Create bitmap info structure
    // @ts-ignore - Accessing private method
    const bmpStructure = capture.getOrCreateBmpStructure(width, height);

    // Copy content for the test
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, capture.SRCCOPY);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, height, bmpStructure.pixelsPtr, bmpStructure.bmiPtr, 0);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

// —————————— PrintWindow - Screen Size ——————————

Deno.bench("PrintWindow - 1280x720", { n: 1000, group: "PrintWindow_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 1280;
    const height = 720;

    // Setup
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const oldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("PrintWindow - 1920x1080", { n: 1000, group: "PrintWindow_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 1920;
    const height = 1080;

    // Setup
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const oldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("PrintWindow - 2560x1440", { n: 1000, group: "PrintWindow_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 2560;
    const height = 1440;

    // Setup
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const oldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("PrintWindow - 3840x2160", { n: 1000, group: "PrintWindow_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 3840;
    const height = 2160;

    // Setup
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const oldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, oldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

// —————————— CreateCompatibleBitmap - Screen Size ——————————

Deno.bench("CreateCompatibleBitmap - 1280x720", { n: 1000, group: "CreateCompatibleBitmap_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 1280;
    const height = 720;

    // Setup
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("CreateCompatibleBitmap - 1920x1080", { n: 1000, group: "CreateCompatibleBitmap_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 1920;
    const height = 1080;

    // Setup
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("CreateCompatibleBitmap - 2560x1440", { n: 1000, group: "CreateCompatibleBitmap_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 2560;
    const height = 1440;

    // Setup
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});

Deno.bench("CreateCompatibleBitmap - 3840x2160", { n: 1000, group: "CreateCompatibleBitmap_ScreenSize" }, (t) => {
    const capture = new ScreenCapture();
    const width = 3840;
    const height = 2160;

    // Setup
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDC(testWindow.handle);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // Cleanup
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    capture.close();
});
