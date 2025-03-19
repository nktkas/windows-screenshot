import { ScreenCapture } from "../mod.ts";

const windowClassName = "Notepad"; // Replace with actual window class name
const windowList = new ScreenCapture().getWindowList();
const window = windowList.find((w) => w.className === windowClassName);
if (!window) {
    throw new Error(`Window with class name "${windowClassName}" not found.`);
}

const capture = new ScreenCapture();

Deno.bench("captureScreen", async () => {
    await capture.captureScreen();
});

Deno.bench("captureWindow", async () => {
    await capture.captureWindow(window.handle);
});

Deno.bench("getScreenSize", () => {
    capture.getScreenSize();
});

Deno.bench("getWindowRect", () => {
    capture.getWindowRect(window.handle);
});

Deno.bench("getWindowList", () => {
    capture.getWindowList();
});
