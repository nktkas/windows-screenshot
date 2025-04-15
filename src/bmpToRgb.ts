type BitDepth = 1 | 4 | 8 | 16 | 24 | 32;

/** A representation of a RGB image */
export interface RGBImage {
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
export function bmpToRgb(bmp: Uint8Array): RGBImage {
    // Create a DataView for easier binary data access
    const dataView = new DataView(bmp.buffer, bmp.byteOffset, bmp.byteLength);

    // Verify BMP signature (first 2 bytes should be 'BM')
    if (dataView.getUint8(0) !== 0x42 || dataView.getUint8(1) !== 0x4D) {
        throw new Error("Invalid BMP file: Signature 'BM' not found");
    }

    // Parse BMP File Header (14 bytes)
    const pixelDataOffset = dataView.getUint32(10, true);

    // Parse BMP Info Header
    const headerSize = dataView.getUint32(14, true);
    const width = dataView.getInt32(18, true);
    let height = dataView.getInt32(22, true);
    const bitDepth = dataView.getUint16(28, true) as BitDepth;
    const compression = dataView.getUint32(30, true);
    let colorsUsed = dataView.getUint32(46, true);

    // Check if image orientation is top-down (negative height) or bottom-up (positive height)
    const isTopDown = height < 0;
    height = Math.abs(height);

    // If colorsUsed is 0, calculate based on bit depth
    if (colorsUsed === 0 && bitDepth <= 8) {
        colorsUsed = 1 << bitDepth;
    }

    // Determine output format
    const channels = bitDepth === 32 ? 4 : 3; // 32-bit BMP has alpha channel
    const outputData = new Uint8Array(width * height * channels);

    // Process based on bit depth and compression
    switch (compression) {
        case 0: // BI_RGB (uncompressed)
            processUncompressedBitmap(
                dataView,
                width,
                height,
                bitDepth,
                pixelDataOffset,
                colorsUsed,
                isTopDown,
                channels,
                outputData,
            );
            break;
        case 1: // BI_RLE8
            if (bitDepth !== 8) throw new Error("RLE8 compression requires 8-bit depth");
            processRLE8Bitmap(
                dataView,
                width,
                height,
                pixelDataOffset,
                colorsUsed,
                isTopDown,
                channels,
                outputData,
            );
            break;
        case 2: // BI_RLE4
            if (bitDepth !== 4) throw new Error("RLE4 compression requires 4-bit depth");
            processRLE4Bitmap(
                dataView,
                width,
                height,
                pixelDataOffset,
                colorsUsed,
                isTopDown,
                channels,
                outputData,
            );
            break;
        case 3: // BI_BITFIELDS
            if (bitDepth !== 16 && bitDepth !== 32) {
                throw new Error("BITFIELDS compression requires 16-bit or 32-bit depth");
            }
            processBitfieldsBitmap(
                dataView,
                width,
                height,
                bitDepth,
                pixelDataOffset,
                headerSize,
                isTopDown,
                channels,
                outputData,
            );
            break;
        default:
            throw new Error(`Unsupported compression type: ${compression}`);
    }

    return {
        width,
        height,
        channels,
        data: outputData,
    };
}

/**
 * Process uncompressed bitmap data
 */
function processUncompressedBitmap(
    dataView: DataView,
    width: number,
    height: number,
    bitDepth: BitDepth,
    pixelDataOffset: number,
    colorsUsed: number,
    isTopDown: boolean,
    channels: number,
    outputData: Uint8Array,
): void {
    // Calculate row stride (bytes per row, padded to 4-byte boundary)
    const stride = Math.floor((bitDepth * width + 31) / 32) * 4;

    // Read color palette if needed
    const palette = readPalette(dataView, colorsUsed);

    // Process pixel data row by row
    for (let y = 0; y < height; y++) {
        // Handle bottom-up vs top-down storage
        const srcY = isTopDown ? y : (height - 1 - y);
        const srcRowOffset = pixelDataOffset + srcY * stride;
        const dstRowOffset = y * width * channels;

        // Process each pixel in the row
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 255;

            switch (bitDepth) {
                case 1: {
                    // Each byte contains 8 pixels (1 bit per pixel)
                    const byteOffset = srcRowOffset + Math.floor(x / 8);
                    const byte = dataView.getUint8(byteOffset);
                    const bitPosition = 7 - (x % 8); // Most significant bit first
                    const colorIndex = (byte >> bitPosition) & 0x01;

                    r = palette[colorIndex][0];
                    g = palette[colorIndex][1];
                    b = palette[colorIndex][2];
                    break;
                }
                case 4: {
                    // Each byte contains 2 pixels (4 bits per pixel)
                    const byteOffset = srcRowOffset + Math.floor(x / 2);
                    const byte = dataView.getUint8(byteOffset);
                    const nibblePosition = 1 - (x % 2); // High nibble first
                    const colorIndex = (byte >> (nibblePosition * 4)) & 0x0F;

                    r = palette[colorIndex][0];
                    g = palette[colorIndex][1];
                    b = palette[colorIndex][2];
                    break;
                }
                case 8: {
                    // Each byte is one pixel (8 bits per pixel)
                    const byteOffset = srcRowOffset + x;
                    const colorIndex = dataView.getUint8(byteOffset);

                    r = palette[colorIndex][0];
                    g = palette[colorIndex][1];
                    b = palette[colorIndex][2];
                    break;
                }
                case 16: {
                    // Each pixel is 2 bytes (16 bits per pixel)
                    const byteOffset = srcRowOffset + x * 2;
                    const pixel = dataView.getUint16(byteOffset, true);

                    // Default to 5-5-5 format (5 bits each for R,G,B)
                    r = ((pixel >> 10) & 0x1F) * 255 / 31;
                    g = ((pixel >> 5) & 0x1F) * 255 / 31;
                    b = (pixel & 0x1F) * 255 / 31;
                    break;
                }
                case 24: {
                    // Each pixel is 3 bytes (24 bits per pixel) - BGR format
                    const byteOffset = srcRowOffset + x * 3;
                    b = dataView.getUint8(byteOffset);
                    g = dataView.getUint8(byteOffset + 1);
                    r = dataView.getUint8(byteOffset + 2);
                    break;
                }
                case 32: {
                    // Each pixel is 4 bytes (32 bits per pixel) - BGRA format
                    const byteOffset = srcRowOffset + x * 4;
                    b = dataView.getUint8(byteOffset);
                    g = dataView.getUint8(byteOffset + 1);
                    r = dataView.getUint8(byteOffset + 2);
                    a = dataView.getUint8(byteOffset + 3);
                    break;
                }
            }

            // Write pixel to output buffer in RGB(A) format
            const dstOffset = dstRowOffset + x * channels;
            outputData[dstOffset] = r;
            outputData[dstOffset + 1] = g;
            outputData[dstOffset + 2] = b;
            if (channels === 4) {
                outputData[dstOffset + 3] = a;
            }
        }
    }
}

/**
 * Process RLE8 compressed bitmap data
 */
function processRLE8Bitmap(
    dataView: DataView,
    width: number,
    height: number,
    pixelDataOffset: number,
    colorsUsed: number,
    isTopDown: boolean,
    channels: number,
    outputData: Uint8Array,
): void {
    // Read palette
    const palette = readPalette(dataView, colorsUsed);

    // Temporary buffer for decoded pixels (8-bit indices)
    const decodedPixels = new Uint8Array(width * height);
    decodedPixels.fill(0); // Initialize with zeros

    // Decode RLE8 data
    let x = 0, y = 0;
    let i = pixelDataOffset;

    while (i < dataView.byteLength - 1 && y < height) {
        const count = dataView.getUint8(i++);
        const value = dataView.getUint8(i++);

        if (count === 0) {
            // Escape codes
            switch (value) {
                case 0: // End of line
                    x = 0;
                    y++;
                    break;
                case 1: // End of bitmap
                    i = dataView.byteLength; // Exit loop
                    break;
                case 2: { // Delta - move current position
                    if (i + 1 >= dataView.byteLength) break;
                    const dx = dataView.getUint8(i++);
                    const dy = dataView.getUint8(i++);
                    x += dx;
                    y += dy;
                    break;
                }
                default: { // Absolute mode - copy next 'value' bytes
                    for (let j = 0; j < value; j++) {
                        if (i >= dataView.byteLength) break;
                        if (x < width && y < height) {
                            decodedPixels[y * width + x] = dataView.getUint8(i++);
                        } else {
                            i++;
                        }
                        x++;
                    }

                    // Align to word boundary
                    if (value % 2 === 1) i++;
                    break;
                }
            }
        } else {
            // Encoded mode - repeat 'value' for 'count' times
            for (let j = 0; j < count; j++) {
                if (x < width && y < height) {
                    decodedPixels[y * width + x] = value;
                }
                x++;
            }
        }
    }

    // Convert decoded indices to RGB(A) data
    for (let y = 0; y < height; y++) {
        const srcY = isTopDown ? y : (height - 1 - y);
        const dstRowOffset = y * width * channels;

        for (let x = 0; x < width; x++) {
            const colorIndex = decodedPixels[srcY * width + x];
            const r = palette[colorIndex][0];
            const g = palette[colorIndex][1];
            const b = palette[colorIndex][2];

            const dstOffset = dstRowOffset + x * channels;
            outputData[dstOffset] = r;
            outputData[dstOffset + 1] = g;
            outputData[dstOffset + 2] = b;
            if (channels === 4) {
                outputData[dstOffset + 3] = 255; // Full opacity
            }
        }
    }
}

/**
 * Process RLE4 compressed bitmap data
 */
function processRLE4Bitmap(
    dataView: DataView,
    width: number,
    height: number,
    pixelDataOffset: number,
    colorsUsed: number,
    isTopDown: boolean,
    channels: number,
    outputData: Uint8Array,
): void {
    // Read palette
    const palette = readPalette(dataView, colorsUsed);

    // Temporary buffer for decoded pixels (4-bit indices)
    const decodedPixels = new Uint8Array(width * height);
    decodedPixels.fill(0); // Initialize with zeros

    // Decode RLE4 data
    let x = 0, y = 0;
    let i = pixelDataOffset;

    while (i < dataView.byteLength - 1 && y < height) {
        const count = dataView.getUint8(i++);
        const value = dataView.getUint8(i++);

        if (count === 0) {
            // Escape codes
            switch (value) {
                case 0: // End of line
                    x = 0;
                    y++;
                    break;
                case 1: // End of bitmap
                    i = dataView.byteLength; // Exit loop
                    break;
                case 2: { // Delta - move current position
                    if (i + 1 >= dataView.byteLength) break;
                    const dx = dataView.getUint8(i++);
                    const dy = dataView.getUint8(i++);
                    x += dx;
                    y += dy;
                    break;
                }
                default: { // Absolute mode - copy next 'value' pixels (4 bits each)
                    let nibbleIndex = 0;
                    for (let j = 0; j < value; j++) {
                        if (nibbleIndex === 0) {
                            if (i >= dataView.byteLength) break;
                            const byte = dataView.getUint8(i++);
                            // High nibble
                            if (x < width && y < height) {
                                decodedPixels[y * width + x] = (byte >> 4) & 0x0F;
                            }
                            nibbleIndex = 1;
                        } else {
                            // Low nibble (from previous byte)
                            if (x < width && y < height) {
                                const byte = dataView.getUint8(i - 1);
                                decodedPixels[y * width + x] = byte & 0x0F;
                            }
                            nibbleIndex = 0;
                        }
                        x++;
                    }

                    // Align to word boundary (considering nibble packing)
                    if ((value + 1) / 2 % 2 === 1) i++;
                    break;
                }
            }
        } else {
            // Encoded mode - alternate between high and low nibbles
            const highNibble = (value >> 4) & 0x0F;
            const lowNibble = value & 0x0F;

            for (let j = 0; j < count; j++) {
                if (x < width && y < height) {
                    decodedPixels[y * width + x] = (j % 2 === 0) ? highNibble : lowNibble;
                }
                x++;
            }
        }
    }

    // Convert decoded indices to RGB(A) data
    for (let y = 0; y < height; y++) {
        const srcY = isTopDown ? y : (height - 1 - y);
        const dstRowOffset = y * width * channels;

        for (let x = 0; x < width; x++) {
            const colorIndex = decodedPixels[srcY * width + x];
            const r = palette[colorIndex][0];
            const g = palette[colorIndex][1];
            const b = palette[colorIndex][2];

            const dstOffset = dstRowOffset + x * channels;
            outputData[dstOffset] = r;
            outputData[dstOffset + 1] = g;
            outputData[dstOffset + 2] = b;
            if (channels === 4) {
                outputData[dstOffset + 3] = 255; // Full opacity
            }
        }
    }
}

/**
 * Process BITFIELDS compressed bitmap data
 */
function processBitfieldsBitmap(
    dataView: DataView,
    width: number,
    height: number,
    bitDepth: BitDepth,
    pixelDataOffset: number,
    headerSize: number,
    isTopDown: boolean,
    channels: number,
    outputData: Uint8Array,
): void {
    // Read bit masks
    let redMask = 0, greenMask = 0, blueMask = 0, alphaMask = 0;

    // Read mask values based on header type
    if (headerSize === 40) { // BITMAPINFOHEADER with separate masks
        redMask = dataView.getUint32(14 + 40, true);
        greenMask = dataView.getUint32(14 + 44, true);
        blueMask = dataView.getUint32(14 + 48, true);

        // For 32-bit, check if there's an alpha mask
        if (bitDepth === 32 && pixelDataOffset >= 14 + 52 + 4) {
            alphaMask = dataView.getUint32(14 + 52, true);
        }
    } else if (headerSize >= 56) { // BITMAPV3INFOHEADER or newer
        redMask = dataView.getUint32(14 + 40, true);
        greenMask = dataView.getUint32(14 + 44, true);
        blueMask = dataView.getUint32(14 + 48, true);
        alphaMask = dataView.getUint32(14 + 52, true);
    }

    // If no masks are defined, use default masks based on bit depth
    if (redMask === 0 && greenMask === 0 && blueMask === 0) {
        if (bitDepth === 16) {
            // Default 5-5-5 format
            redMask = 0x7C00; // 5 bits, bits 10-14
            greenMask = 0x03E0; // 5 bits, bits 5-9
            blueMask = 0x001F; // 5 bits, bits 0-4
        } else if (bitDepth === 32) {
            // Default BGRA format (Windows default)
            blueMask = 0x000000FF; // 8 bits, bits 0-7
            greenMask = 0x0000FF00; // 8 bits, bits 8-15
            redMask = 0x00FF0000; // 8 bits, bits 16-23
            alphaMask = 0xFF000000; // 8 bits, bits 24-31
        }
    }

    // Calculate shift amounts and bit counts for each component
    const redShift = findLowestSetBit(redMask);
    const greenShift = findLowestSetBit(greenMask);
    const blueShift = findLowestSetBit(blueMask);
    const alphaShift = findLowestSetBit(alphaMask);

    const redBits = countBits(redMask);
    const greenBits = countBits(greenMask);
    const blueBits = countBits(blueMask);
    const alphaBits = countBits(alphaMask);

    // Calculate scaling factors to convert to 8-bit per channel
    const redScale = redBits > 0 ? 255 / ((1 << redBits) - 1) : 0;
    const greenScale = greenBits > 0 ? 255 / ((1 << greenBits) - 1) : 0;
    const blueScale = blueBits > 0 ? 255 / ((1 << blueBits) - 1) : 0;
    const alphaScale = alphaBits > 0 ? 255 / ((1 << alphaBits) - 1) : 0;

    // Calculate row stride (bytes per row, padded to 4-byte boundary)
    const bytesPerPixel = bitDepth / 8;
    const stride = Math.floor((bitDepth * width + 31) / 32) * 4;

    // Process pixel data
    for (let y = 0; y < height; y++) {
        const srcY = isTopDown ? y : (height - 1 - y);
        const srcRowOffset = pixelDataOffset + srcY * stride;
        const dstRowOffset = y * width * channels;

        for (let x = 0; x < width; x++) {
            let pixel;
            const byteOffset = srcRowOffset + x * bytesPerPixel;

            // Read pixel value based on bit depth
            if (bitDepth === 16) {
                pixel = dataView.getUint16(byteOffset, true);
            } else { // 32-bit
                pixel = dataView.getUint32(byteOffset, true);
            }

            // Extract and scale color components using masks
            const r = Math.min(255, Math.round(((pixel & redMask) >> redShift) * redScale));
            const g = Math.min(255, Math.round(((pixel & greenMask) >> greenShift) * greenScale));
            const b = Math.min(255, Math.round(((pixel & blueMask) >> blueShift) * blueScale));
            let a = 255;

            if (alphaMask !== 0) {
                a = Math.min(255, Math.round(((pixel & alphaMask) >> alphaShift) * alphaScale));
            }

            // Write pixel to output buffer
            const dstOffset = dstRowOffset + x * channels;
            outputData[dstOffset] = r;
            outputData[dstOffset + 1] = g;
            outputData[dstOffset + 2] = b;
            if (channels === 4) {
                outputData[dstOffset + 3] = a;
            }
        }
    }
}

/**
 * Read palette from BMP file
 */
function readPalette(dataView: DataView, colorsUsed: number): number[][] {
    const palette: number[][] = [];
    const paletteOffset = 14 + 40; // BMP header (14) + DIB header (40)

    for (let i = 0; i < colorsUsed; i++) {
        const offset = paletteOffset + i * 4;
        if (offset + 3 < dataView.byteLength) {
            // RGBQUAD format is [Blue, Green, Red, Reserved]
            const b = dataView.getUint8(offset);
            const g = dataView.getUint8(offset + 1);
            const r = dataView.getUint8(offset + 2);
            palette.push([r, g, b]);
        } else {
            palette.push([0, 0, 0]); // Default to black if out of bounds
        }
    }

    return palette;
}

/**
 * Find the position of the lowest set bit in a mask
 */
function findLowestSetBit(mask: number): number {
    if (mask === 0) return 0;

    let shift = 0;
    while ((mask & 1) === 0) {
        mask >>= 1;
        shift++;
    }
    return shift;
}

/**
 * Count the number of bits set in a mask
 */
function countBits(mask: number): number {
    if (mask === 0) return 0;

    let count = 0;
    let m = mask;
    while (m) {
        count += m & 1;
        m >>= 1;
    }
    return count;
}
