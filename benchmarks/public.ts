/**
 * Benchmarks for public library methods.
 */

import { ScreenCapture } from "../mod.ts";

const windowClassName = "Notepad"; // Replace with actual window class name
const windowList = new ScreenCapture().getWindowList();
const window = windowList.find((w) => w.className === windowClassName);
if (!window) {
    throw new Error(`Window with class name "${windowClassName}" not found.`);
}

Deno.bench("Class initialization", { warmup: 100, n: 1000 }, (t) => {
    t.start();
    const capture = new ScreenCapture();
    t.end();

    capture.close();
});
Deno.bench("Class cleanup", { warmup: 100, n: 1000 }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    capture.close();
    t.end();
});

Deno.bench("captureScreen - without cache", { warmup: 100, n: 1000, group: "captureScreen" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    capture.captureScreen(true);
    t.end();

    capture.close();
});
Deno.bench("captureScreen - with cache", { warmup: 100, n: 1000, group: "captureScreen" }, (t) => {
    const capture = new ScreenCapture();
    capture.captureScreen();

    t.start();
    capture.captureScreen(false);
    t.end();

    capture.close();
});

Deno.bench("captureWindow - without cache", { warmup: 100, n: 1000, group: "captureWindow" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    capture.captureWindow(window.handle, true);
    t.end();

    capture.close();
});
Deno.bench("captureWindow - with cache", { warmup: 100, n: 1000, group: "captureWindow" }, (t) => {
    const capture = new ScreenCapture();
    capture.captureWindow(window.handle);

    t.start();
    capture.captureWindow(window.handle, false);
    t.end();

    capture.close();
});

Deno.bench("captureWindow - by class name", { warmup: 100, n: 1000, group: "captureWindow_find" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    capture.captureWindow(window.className, true);
    t.end();

    capture.close();
});
Deno.bench("captureWindow - by process id", { warmup: 100, n: 1000, group: "captureWindow_find" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    capture.captureWindow(window.processId, true);
    t.end();

    capture.close();
});
Deno.bench("captureWindow - by handle", { warmup: 100, n: 1000, group: "captureWindow_find" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    capture.captureWindow(window.handle, true);
    t.end();

    capture.close();
});

Deno.bench("getWindowList - only visible", { warmup: 100, n: 1000, group: "getWindowList" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    capture.getWindowList(true);
    t.end();

    capture.close();
});
Deno.bench("getWindowList - all", { warmup: 100, n: 1000, group: "getWindowList" }, (t) => {
    const capture = new ScreenCapture();

    t.start();
    capture.getWindowList(false);
    t.end();

    capture.close();
});
