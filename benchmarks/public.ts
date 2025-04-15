import { bmpToRgb, ScreenCapture } from "../mod.ts";

const windowList = new ScreenCapture().getWindowList();
const handle = windowList.find((window) => window.className === "Notepad")?.handle;
if (!handle) throw new Error("Notepad not found");

const capture1 = new ScreenCapture({ bitDepth: 1 });
const capture4 = new ScreenCapture({ bitDepth: 4 });
const capture8_grayscale = new ScreenCapture({ bitDepth: 8, paletteType: "grayscale" });
const capture8_halftone = new ScreenCapture({ bitDepth: 8, paletteType: "halftone" });
const capture16 = new ScreenCapture({ bitDepth: 16 });
const capture24 = new ScreenCapture({ bitDepth: 24 });
const capture32 = new ScreenCapture({ bitDepth: 32 });

const screenshot_1bit_screen = await capture1.captureScreen();
const screenshot_4bit_screen = await capture4.captureScreen();
const screenshot_8_grayscale_screen = await capture8_grayscale.captureScreen();
const screenshot_8_halftone_screen = await capture8_halftone.captureScreen();
const screenshot_16bit_screen = await capture16.captureScreen();
const screenshot_24bit_screen = await capture24.captureScreen();
const screenshot_32bit_screen = await capture32.captureScreen();

const screenshot_1bit_window = await capture1.captureWindow({ handle });
const screenshot_4bit_window = await capture4.captureWindow({ handle });
const screenshot_8_grayscale_window = await capture8_grayscale.captureWindow({ handle });
const screenshot_8_halftone_window = await capture8_halftone.captureWindow({ handle });
const screenshot_16bit_window = await capture16.captureWindow({ handle });
const screenshot_24bit_window = await capture24.captureWindow({ handle });
const screenshot_32bit_window = await capture32.captureWindow({ handle });

// captureScreen

Deno.bench("captureScreen_1bit", { group: "captureScreen" }, async () => {
    await capture1.captureScreen();
});
Deno.bench("captureScreen_4bit", { group: "captureScreen" }, async () => {
    await capture4.captureScreen();
});
Deno.bench("captureScreen_8bit_grayscale", { group: "captureScreen" }, async () => {
    await capture8_grayscale.captureScreen();
});
Deno.bench("captureScreen_8bit_halftone", { group: "captureScreen" }, async () => {
    await capture8_halftone.captureScreen();
});
Deno.bench("captureScreen_16bit", { group: "captureScreen" }, async () => {
    await capture16.captureScreen();
});
Deno.bench("captureScreen_24bit", { group: "captureScreen" }, async () => {
    await capture24.captureScreen();
});
Deno.bench("captureScreen_32bit", { group: "captureScreen" }, async () => {
    await capture32.captureScreen();
});

// captureWindow

Deno.bench("captureWindow_1bit", { group: "captureWindow" }, async () => {
    await capture1.captureWindow({ handle });
});
Deno.bench("captureWindow_4bit", { group: "captureWindow" }, async () => {
    await capture4.captureWindow({ handle });
});
Deno.bench("captureWindow_8bit_grayscale", { group: "captureWindow" }, async () => {
    await capture8_grayscale.captureWindow({ handle });
});
Deno.bench("captureWindow_8bit_halftone", { group: "captureWindow" }, async () => {
    await capture8_halftone.captureWindow({ handle });
});
Deno.bench("captureWindow_16bit", { group: "captureWindow" }, async () => {
    await capture16.captureWindow({ handle });
});
Deno.bench("captureWindow_24bit", { group: "captureWindow" }, async () => {
    await capture24.captureWindow({ handle });
});
Deno.bench("captureWindow_32bit", { group: "captureWindow" }, async () => {
    await capture32.captureWindow({ handle });
});

// bmpToRgb

Deno.bench("bmpToRgb_1bit_screen", { group: "bmpToRgb_screen" }, () => {
    bmpToRgb(screenshot_1bit_screen);
});
Deno.bench("bmpToRgb_4bit_screen", { group: "bmpToRgb_screen" }, () => {
    bmpToRgb(screenshot_4bit_screen);
});
Deno.bench("bmpToRgb_8_grayscale_screen", { group: "bmpToRgb_screen" }, () => {
    bmpToRgb(screenshot_8_grayscale_screen);
});
Deno.bench("bmpToRgb_8_halftone_screen", { group: "bmpToRgb_screen" }, () => {
    bmpToRgb(screenshot_8_halftone_screen);
});
Deno.bench("bmpToRgb_16bit_screen", { group: "bmpToRgb_screen" }, () => {
    bmpToRgb(screenshot_16bit_screen);
});
Deno.bench("bmpToRgb_24bit_screen", { group: "bmpToRgb_screen" }, () => {
    bmpToRgb(screenshot_24bit_screen);
});
Deno.bench("bmpToRgb_32bit_screen", { group: "bmpToRgb_screen" }, () => {
    bmpToRgb(screenshot_32bit_screen);
});

Deno.bench("bmpToRgb_1bit_window", { group: "bmpToRgb_window" }, () => {
    bmpToRgb(screenshot_1bit_window);
});
Deno.bench("bmpToRgb_4bit_window", { group: "bmpToRgb_window" }, () => {
    bmpToRgb(screenshot_4bit_window);
});
Deno.bench("bmpToRgb_8_grayscale_window", { group: "bmpToRgb_window" }, () => {
    bmpToRgb(screenshot_8_grayscale_window);
});
Deno.bench("bmpToRgb_8_halftone_window", { group: "bmpToRgb_window" }, () => {
    bmpToRgb(screenshot_8_halftone_window);
});
Deno.bench("bmpToRgb_16bit_window", { group: "bmpToRgb_window" }, () => {
    bmpToRgb(screenshot_16bit_window);
});
Deno.bench("bmpToRgb_24bit_window", { group: "bmpToRgb_window" }, () => {
    bmpToRgb(screenshot_24bit_window);
});
Deno.bench("bmpToRgb_32bit_window", { group: "bmpToRgb_window" }, () => {
    bmpToRgb(screenshot_32bit_window);
});

// Other

Deno.bench("new ScreenCapture", () => {
    new ScreenCapture();
});

Deno.bench("getScreenRect", () => {
    capture1.getScreenRect();
});

Deno.bench("getWindowRect", () => {
    capture1.getWindowRect({ handle });
});

Deno.bench("getWindowList", () => {
    capture1.getWindowList();
});
