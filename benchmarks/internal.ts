import { ScreenCapture } from "../mod.ts";

const windowClassName = "Notepad"; // Replace with actual window class name
const windowList = new ScreenCapture().getWindowList();
const testWindow = windowList.find((w) => w.className === windowClassName);
if (!testWindow) {
    throw new Error(`Window with class name "${windowClassName}" not found.`);
}

const capture = new ScreenCapture();

// Prepare
const rectBuffer = new Uint8Array(16);
const rectPtr = Deno.UnsafePointer.of(rectBuffer);
if (rectPtr === null) {
    throw new Error("Failed to create pointer for RECT structure");
}

const pidPtr = Deno.UnsafePointer.of(new Uint32Array(1));

// —————————— Class private methods ——————————

Deno.bench("createBmpStructure - 800x600", { group: "createBmpStructure" }, () => {
    // @ts-ignore - Accessing private method
    capture.createBmpStructure(800, 600);
});
Deno.bench("createBmpStructure - 1280x720", { group: "createBmpStructure" }, () => {
    // @ts-ignore - Accessing private method
    capture.createBmpStructure(1280, 720);
});
Deno.bench("createBmpStructure - 1920x1080", { group: "createBmpStructure" }, () => {
    // @ts-ignore - Accessing private method
    capture.createBmpStructure(1920, 1080);
});
Deno.bench("createBmpStructure - 2560x1440", { group: "createBmpStructure" }, () => {
    // @ts-ignore - Accessing private method
    capture.createBmpStructure(2560, 1440);
});
Deno.bench("createBmpStructure - 3840x2160", { group: "createBmpStructure" }, () => {
    // @ts-ignore - Accessing private method
    capture.createBmpStructure(3840, 2160);
});

Deno.bench("createGdiRenderContext - 800x600", { group: "createGdiRenderContext" }, (t) => {
    const width = 800;
    const height = 600;

    // @ts-ignore - Accessing private field
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);

    t.start();
    // @ts-ignore - Accessing private method
    const context = capture.createGdiRenderContext(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(context.hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(context.hdcMemory);
    // @ts-ignore - Accessing private field
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("createGdiRenderContext - 1280x720", { group: "createGdiRenderContext" }, (t) => {
    const width = 1280;
    const height = 720;

    // @ts-ignore - Accessing private field
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);

    t.start();
    // @ts-ignore - Accessing private method
    const context = capture.createGdiRenderContext(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(context.hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(context.hdcMemory);
    // @ts-ignore - Accessing private field
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("createGdiRenderContext - 1920x1080", { group: "createGdiRenderContext" }, (t) => {
    const width = 1920;
    const height = 1080;

    // @ts-ignore - Accessing private field
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);

    t.start();
    // @ts-ignore - Accessing private method
    const context = capture.createGdiRenderContext(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(context.hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(context.hdcMemory);
    // @ts-ignore - Accessing private field
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("createGdiRenderContext - 2560x1440", { group: "createGdiRenderContext" }, (t) => {
    const width = 2560;
    const height = 1440;

    // @ts-ignore - Accessing private field
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);

    t.start();
    // @ts-ignore - Accessing private method
    const context = capture.createGdiRenderContext(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(context.hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(context.hdcMemory);
    // @ts-ignore - Accessing private field
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("createGdiRenderContext - 3840x2160", { group: "createGdiRenderContext" }, (t) => {
    const width = 3840;
    const height = 2160;

    // @ts-ignore - Accessing private field
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);

    t.start();
    // @ts-ignore - Accessing private method
    const context = capture.createGdiRenderContext(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(context.hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(context.hdcMemory);
    // @ts-ignore - Accessing private field
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});

Deno.bench("findWindow - by class name", { group: "findWindow" }, () => {
    // @ts-ignore - Accessing private method
    capture.findWindow(testWindow.className);
});
Deno.bench("findWindow - by process ID", { group: "findWindow" }, () => {
    // @ts-ignore - Accessing private method
    capture.findWindow(testWindow.processId);
});
Deno.bench("findWindow - non-existent class", { group: "findWindow" }, () => {
    // @ts-ignore - Accessing private method
    capture.findWindow("NonExistentClassNameForBenchmark");
});
Deno.bench("findWindow - non-existent process id", { group: "findWindow" }, () => {
    // @ts-ignore - Accessing private method
    capture.findWindow(9999999);
});

// —————————— Direct FFI calls ——————————

Deno.bench("GetWindowRect", { group: "user32" }, () => {
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.GetWindowRect(testWindow.handle, rectPtr);
});
Deno.bench("GetDCEx", { group: "user32" }, (t) => {
    t.start();
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("ReleaseDC", { group: "user32" }, (t) => {
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
    t.end();
});
Deno.bench("FindWindowExW", { group: "user32" }, () => {
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.FindWindowExW(null, null, null, null);
});
Deno.bench("GetWindowTextW", { group: "user32" }, () => {
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.GetWindowTextW(testWindow.handle, new Uint16Array(256), 256);
});
Deno.bench("IsWindowVisible", { group: "user32" }, () => {
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.IsWindowVisible(testWindow.handle);
});
Deno.bench("GetClassNameW", { group: "user32" }, () => {
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.GetClassNameW(testWindow.handle, new Uint16Array(256), 256);
});
Deno.bench("GetWindowThreadProcessId", { group: "user32" }, () => {
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.GetWindowThreadProcessId(testWindow.handle, pidPtr);
});
Deno.bench("GetWindowLongW", { group: "user32" }, () => {
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.GetWindowLongW(testWindow.handle, ScreenCapture.GWL_STYLE);
});
Deno.bench("GetDpiForWindow", { group: "user32" }, () => {
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.GetDpiForWindow(testWindow.handle);
});
Deno.bench("PrintWindow", { group: "user32" }, async (t) => {
    const width = 800;
    const height = 600;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});

Deno.bench("CreateCompatibleDC", { group: "gdi32" }, (t) => {
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("CreateCompatibleBitmap", { group: "gdi32" }, (t) => {
    const width = 800;
    const height = 600;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("SelectObject", { group: "gdi32" }, (t) => {
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, 800, 600);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("BitBlt", { group: "gdi32" }, async (t) => {
    const width = 800;
    const height = 600;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, ScreenCapture.SRCCOPY);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("DeleteObject", { group: "gdi32" }, (t) => {
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, 800, 600);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("DeleteDC", { group: "gdi32" }, (t) => {
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("GetDIBits", { group: "gdi32" }, async (t) => {
    const width = 800;
    const height = 600;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);
    // @ts-ignore - Accessing private method
    const bmpStructure = capture.createBmpStructure(width, height);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, ScreenCapture.SRCCOPY);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.GetDIBits(
        hdcMemory,
        hBitmap,
        0,
        height,
        bmpStructure.pixelsPtr,
        bmpStructure.bmiPtr,
        0,
    );
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("GetDeviceCaps", { group: "gdi32" }, (t) => {
    // @ts-ignore - Accessing private constants
    const hdcScreen = capture.user32.symbols.GetDCEx(null, null, 0x00000002);

    t.start();
    // @ts-ignore - Accessing private constants
    capture.gdi32.symbols.GetDeviceCaps(hdcScreen, ScreenCapture.DESKTOP_HORZRES);
    t.end();

    // @ts-ignore - Accessing private constants
    capture.user32.symbols.ReleaseDC(null, hdcScreen);
});

Deno.bench("BitBlt - 1280x720", { group: "BitBlt" }, async (t) => {
    const width = 1280;
    const height = 720;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, ScreenCapture.SRCCOPY);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("BitBlt - 1920x1080", { group: "BitBlt" }, async (t) => {
    const width = 1920;
    const height = 1080;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, ScreenCapture.SRCCOPY);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("BitBlt - 2560x1440", { group: "BitBlt" }, async (t) => {
    const width = 2560;
    const height = 1440;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, ScreenCapture.SRCCOPY);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("BitBlt - 3840x2160", { group: "BitBlt" }, async (t) => {
    const width = 3840;
    const height = 2160;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, ScreenCapture.SRCCOPY);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});

Deno.bench("GetDIBits - 1280x720", { group: "GetDIBits" }, async (t) => {
    const width = 1280;
    const height = 720;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);
    // @ts-ignore - Accessing private method
    const bmpStructure = capture.createBmpStructure(width, height);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, ScreenCapture.SRCCOPY);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.GetDIBits(
        hdcMemory,
        hBitmap,
        0,
        height,
        bmpStructure.pixelsPtr,
        bmpStructure.bmiPtr,
        0,
    );
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("GetDIBits - 1920x1080", { group: "GetDIBits" }, async (t) => {
    const width = 1920;
    const height = 1080;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);
    // @ts-ignore - Accessing private method
    const bmpStructure = capture.createBmpStructure(width, height);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, ScreenCapture.SRCCOPY);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.GetDIBits(
        hdcMemory,
        hBitmap,
        0,
        height,
        bmpStructure.pixelsPtr,
        bmpStructure.bmiPtr,
        0,
    );
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("GetDIBits - 2560x1440", { group: "GetDIBits" }, async (t) => {
    const width = 2560;
    const height = 1440;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);
    // @ts-ignore - Accessing private method
    const bmpStructure = capture.createBmpStructure(width, height);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, ScreenCapture.SRCCOPY);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.GetDIBits(
        hdcMemory,
        hBitmap,
        0,
        height,
        bmpStructure.pixelsPtr,
        bmpStructure.bmiPtr,
        0,
    );
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("GetDIBits - 3840x2160", { group: "GetDIBits" }, async (t) => {
    const width = 3840;
    const height = 2160;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);
    // @ts-ignore - Accessing private method
    const bmpStructure = capture.createBmpStructure(width, height);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, ScreenCapture.SRCCOPY);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.GetDIBits(
        hdcMemory,
        hBitmap,
        0,
        height,
        bmpStructure.pixelsPtr,
        bmpStructure.bmiPtr,
        0,
    );
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});

Deno.bench("PrintWindow - 1280x720", { group: "PrintWindow" }, async (t) => {
    const width = 1280;
    const height = 720;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("PrintWindow - 1920x1080", { group: "PrintWindow" }, async (t) => {
    const width = 1920;
    const height = 1080;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("PrintWindow - 2560x1440", { group: "PrintWindow" }, async (t) => {
    const width = 2560;
    const height = 1440;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("PrintWindow - 3840x2160", { group: "PrintWindow" }, async (t) => {
    const width = 3840;
    const height = 2160;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields and methods
    const { hdcMemory, hBitmap } = capture.createGdiRenderContext(hdcWindow, width, height);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});

Deno.bench("CreateCompatibleBitmap - 1280x720", { group: "CreateCompatibleBitmap" }, (t) => {
    const width = 1280;
    const height = 720;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("CreateCompatibleBitmap - 1920x1080", { group: "CreateCompatibleBitmap" }, (t) => {
    const width = 1920;
    const height = 1080;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("CreateCompatibleBitmap - 2560x1440", { group: "CreateCompatibleBitmap" }, (t) => {
    const width = 2560;
    const height = 1440;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("CreateCompatibleBitmap - 3840x2160", { group: "CreateCompatibleBitmap" }, (t) => {
    const width = 3840;
    const height = 2160;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
