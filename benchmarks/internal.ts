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

Deno.bench("createBitmapBuffers - 800x600", { group: "createBitmapBuffers" }, () => {
    // @ts-ignore - Accessing private method
    capture.createBitmapBuffers(800, 600);
});
Deno.bench("createBitmapBuffers - 1280x720", { group: "createBitmapBuffers" }, () => {
    // @ts-ignore - Accessing private method
    capture.createBitmapBuffers(1280, 720);
});
Deno.bench("createBitmapBuffers - 1920x1080", { group: "createBitmapBuffers" }, () => {
    // @ts-ignore - Accessing private method
    capture.createBitmapBuffers(1920, 1080);
});
Deno.bench("createBitmapBuffers - 2560x1440", { group: "createBitmapBuffers" }, () => {
    // @ts-ignore - Accessing private method
    capture.createBitmapBuffers(2560, 1440);
});
Deno.bench("createBitmapBuffers - 3840x2160", { group: "createBitmapBuffers" }, () => {
    // @ts-ignore - Accessing private method
    capture.createBitmapBuffers(3840, 2160);
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

Deno.bench("drawCursorOnDC - 800x600", { group: "drawCursorOnDC" }, (t) => {
    const width = 800;
    const height = 600;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private method
    capture.drawCursorOnDC(hdcMemory, 0, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("drawCursorOnDC - 1280x720", { group: "drawCursorOnDC" }, (t) => {
    const width = 1280;
    const height = 720;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private method
    capture.drawCursorOnDC(hdcMemory, 0, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("drawCursorOnDC - 1920x1080", { group: "drawCursorOnDC" }, (t) => {
    const width = 1920;
    const height = 1080;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private method
    capture.drawCursorOnDC(hdcMemory, 0, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("drawCursorOnDC - 2560x1440", { group: "drawCursorOnDC" }, (t) => {
    const width = 2560;
    const height = 1440;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private method
    capture.drawCursorOnDC(hdcMemory, 0, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("drawCursorOnDC - 3840x2160", { group: "drawCursorOnDC" }, (t) => {
    const width = 3840;
    const height = 2160;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private method
    capture.drawCursorOnDC(hdcMemory, 0, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});

// —————————— Direct FFI calls ——————————

Deno.bench("GetWindowRect", { group: "user32" }, () => {
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.GetWindowRect(testWindow.handle, rectPtr);
});
Deno.bench("GetDCEx", { group: "user32" }, (t) => {
    t.start();
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000001 | 0x00000002);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("ReleaseDC", { group: "user32" }, (t) => {
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000001 | 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
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
    capture.user32.symbols.GetWindowLongW(testWindow.handle, -16);
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
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(testWindow.handle, hdcWindow);
});
Deno.bench("GetCursorInfo", { group: "user32" }, (t) => {
    const cursorInfoBuffer = new Uint8Array(24);
    const cursorInfoDataView = new DataView(cursorInfoBuffer.buffer);
    cursorInfoDataView.setUint32(0, 24, true);
    const cursorInfoPtr = Deno.UnsafePointer.of(cursorInfoBuffer);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.GetCursorInfo(cursorInfoPtr);
    t.end();
});
Deno.bench("GetIconInfo", { group: "user32" }, (t) => {
    const cursorInfoBuffer = new Uint8Array(24);
    const cursorInfoDataView = new DataView(cursorInfoBuffer.buffer);
    cursorInfoDataView.setUint32(0, 24, true);
    const cursorInfoPtr = Deno.UnsafePointer.of(cursorInfoBuffer);

    // @ts-ignore - Accessing private fields
    capture.user32.symbols.GetCursorInfo(cursorInfoPtr);

    const hCursor = Deno.UnsafePointer.create(cursorInfoDataView.getBigUint64(8, true));

    const iconInfoBuffer = new Uint8Array(32);
    const iconInfoPtr = Deno.UnsafePointer.of(iconInfoBuffer);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.GetIconInfo(hCursor, iconInfoPtr);
    t.end();
});
Deno.bench("DrawIconEx", { group: "user32" }, (t) => {
    const cursorInfoBuffer = new Uint8Array(24);
    const cursorInfoDataView = new DataView(cursorInfoBuffer.buffer);
    cursorInfoDataView.setUint32(0, 24, true);
    const cursorInfoPtr = Deno.UnsafePointer.of(cursorInfoBuffer);

    // @ts-ignore - Accessing private fields
    capture.user32.symbols.GetCursorInfo(cursorInfoPtr);

    const hCursor = Deno.UnsafePointer.create(cursorInfoDataView.getBigUint64(8, true));

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000001 | 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.DrawIconEx(hdcWindow, 0, 0, hCursor, 0, 0, 0, null, 0x0003);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("GetDpiForSystem", { group: "user32" }, () => {
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.GetDpiForSystem();
});
Deno.bench("SetProcessDPIAware", { group: "user32" }, () => {
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.SetProcessDPIAware();
});

Deno.bench("CreateCompatibleDC", { group: "gdi32" }, (t) => {
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000001 | 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("CreateCompatibleBitmap", { group: "gdi32" }, (t) => {
    const width = 800;
    const height = 600;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("SelectObject", { group: "gdi32" }, (t) => {
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, 800, 600);

    t.start();
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("BitBlt", { group: "gdi32" }, async (t) => {
    const width = 800;
    const height = 600;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcMemory, bmiPtr, 0, pBitsPtr, null, 0);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, 0x00CC0020 | 0x40000000);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("DeleteObject", { group: "gdi32" }, (t) => {
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, 800, 600);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("DeleteDC", { group: "gdi32" }, (t) => {
    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);

    t.start();
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("GetDIBits", { group: "gdi32" }, async (t) => {
    const width = 800;
    const height = 600;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcMemory, bmiPtr, 0, pBitsPtr, null, 0);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, 0x00CC0020 | 0x40000000);
    const pixelsPtr = Deno.UnsafePointer.create(pBits[0]);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, height, pixelsPtr, bmiPtr, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("GetDeviceCaps", { group: "gdi32" }, (t) => {
    // @ts-ignore - Accessing private constants
    const hdcScreen = capture.user32.symbols.GetDCEx(null, null, 0x00000002);

    t.start();
    // @ts-ignore - Accessing private constants
    capture.gdi32.symbols.GetDeviceCaps(hdcScreen, 118);
    t.end();

    // @ts-ignore - Accessing private constants
    capture.user32.symbols.ReleaseDC(null, hdcScreen);
});
Deno.bench("CreateDIBSection", { group: "gdi32" }, (t) => {
    const width = 800;
    const height = 600;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcWindow, bmiPtr, 0, pBitsPtr, null, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});

Deno.bench("BitBlt - 1280x720", { group: "BitBlt" }, async (t) => {
    const width = 1280;
    const height = 720;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcMemory, bmiPtr, 0, pBitsPtr, null, 0);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, 0x00CC0020 | 0x40000000);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("BitBlt - 1920x1080", { group: "BitBlt" }, async (t) => {
    const width = 1920;
    const height = 1080;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcMemory, bmiPtr, 0, pBitsPtr, null, 0);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, 0x00CC0020 | 0x40000000);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("BitBlt - 2560x1440", { group: "BitBlt" }, async (t) => {
    const width = 2560;
    const height = 1440;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcMemory, bmiPtr, 0, pBitsPtr, null, 0);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, 0x00CC0020 | 0x40000000);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("BitBlt - 3840x2160", { group: "BitBlt" }, async (t) => {
    const width = 3840;
    const height = 2160;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcMemory, bmiPtr, 0, pBitsPtr, null, 0);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, 0x00CC0020 | 0x40000000);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});

Deno.bench("GetDIBits - 1280x720", { group: "GetDIBits" }, async (t) => {
    const width = 1280;
    const height = 720;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcMemory, bmiPtr, 0, pBitsPtr, null, 0);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, 0x00CC0020 | 0x40000000);
    const pixelsPtr = Deno.UnsafePointer.create(pBits[0]);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, height, pixelsPtr, bmiPtr, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("GetDIBits - 1920x1080", { group: "GetDIBits" }, async (t) => {
    const width = 1920;
    const height = 1080;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcMemory, bmiPtr, 0, pBitsPtr, null, 0);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, 0x00CC0020 | 0x40000000);
    const pixelsPtr = Deno.UnsafePointer.create(pBits[0]);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, height, pixelsPtr, bmiPtr, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("GetDIBits - 2560x1440", { group: "GetDIBits" }, async (t) => {
    const width = 2560;
    const height = 1440;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcMemory, bmiPtr, 0, pBitsPtr, null, 0);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, 0x00CC0020 | 0x40000000);
    const pixelsPtr = Deno.UnsafePointer.create(pBits[0]);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, height, pixelsPtr, bmiPtr, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("GetDIBits - 3840x2160", { group: "GetDIBits" }, async (t) => {
    const width = 3840;
    const height = 2160;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcMemory, bmiPtr, 0, pBitsPtr, null, 0);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.BitBlt(hdcMemory, 0, 0, width, height, hdcWindow, 0, 0, 0x00CC0020 | 0x40000000);
    const pixelsPtr = Deno.UnsafePointer.create(pBits[0]);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.gdi32.symbols.GetDIBits(hdcMemory, hBitmap, 0, height, pixelsPtr, bmiPtr, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteDC(hdcMemory);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});

Deno.bench("PrintWindow - 1280x720", { group: "PrintWindow" }, async (t) => {
    const width = 1280;
    const height = 720;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(testWindow.handle, null, 0x00000001 | 0x00000002);
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
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
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
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
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
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
    // @ts-ignore - Accessing private fields
    const hdcMemory = capture.gdi32.symbols.CreateCompatibleDC(hdcWindow);
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    // @ts-ignore - Accessing private fields
    const hOldBitmap = capture.gdi32.symbols.SelectObject(hdcMemory, hBitmap);

    t.start();
    // @ts-ignore - Accessing private fields
    await capture.user32.symbols.PrintWindow(testWindow.handle, hdcMemory, 2);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.SelectObject(hdcMemory, hOldBitmap);
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
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("CreateCompatibleBitmap - 1920x1080", { group: "CreateCompatibleBitmap" }, (t) => {
    const width = 1920;
    const height = 1080;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("CreateCompatibleBitmap - 2560x1440", { group: "CreateCompatibleBitmap" }, (t) => {
    const width = 2560;
    const height = 1440;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("CreateCompatibleBitmap - 3840x2160", { group: "CreateCompatibleBitmap" }, (t) => {
    const width = 3840;
    const height = 2160;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateCompatibleBitmap(hdcWindow, width, height);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});

Deno.bench("CreateDIBSection - 1280x720", { group: "CreateDIBSection" }, (t) => {
    const width = 1280;
    const height = 720;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcWindow, bmiPtr, 0, pBitsPtr, null, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("CreateDIBSection - 1920x1080", { group: "CreateDIBSection" }, (t) => {
    const width = 1920;
    const height = 1080;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcWindow, bmiPtr, 0, pBitsPtr, null, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("CreateDIBSection - 2560x1440", { group: "CreateDIBSection" }, (t) => {
    const width = 2560;
    const height = 1440;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcWindow, bmiPtr, 0, pBitsPtr, null, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
Deno.bench("CreateDIBSection - 3840x2160", { group: "CreateDIBSection" }, (t) => {
    const width = 3840;
    const height = 2160;

    // @ts-ignore - Accessing private fields
    const hdcWindow = capture.user32.symbols.GetDCEx(null, null, 0x00000002);
    // @ts-ignore - Accessing private fields
    const { bmiPtr } = capture.createBitmapBuffers(width, height);
    const pBits = new BigUint64Array(1);
    const pBitsPtr = Deno.UnsafePointer.of(pBits);

    t.start();
    // @ts-ignore - Accessing private fields
    const hBitmap = capture.gdi32.symbols.CreateDIBSection(hdcWindow, bmiPtr, 0, pBitsPtr, null, 0);
    t.end();

    // @ts-ignore - Accessing private fields
    capture.gdi32.symbols.DeleteObject(hBitmap);
    // @ts-ignore - Accessing private fields
    capture.user32.symbols.ReleaseDC(null, hdcWindow);
});
