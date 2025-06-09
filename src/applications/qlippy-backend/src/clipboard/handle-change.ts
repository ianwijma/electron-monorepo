import {clipboardChangeEmitter} from "./change-emitter";
import {
    ClipboardItemHash,
    ClipboardItemTypes,
} from "qlippy-common/src/settings/clipboard.settings.types";
import {
    htmlToHtmlClipboardItem,
    isTextAColour,
    isTextAUrl,
    nativeImageToImageClipboardItem,
    textToColourClipboardItem,
    textToPathClipboardItem,
    textToTextClipboardItem,
    textToUrlClipboardItem
} from "./item-converters";
import {clipboardManager} from "./manager";
import {join as pathJoin} from 'node:path'
import {fileExists, fileStats, UNSAFE_fileStats, writeFile} from "backend-essentials/src/files/files";
import {sha1} from "backend-essentials/src/utilities/crypto";
import {nativeImage} from "electron";
import {screenshotUrl} from "backend-essentials/src/utilities/screenshotSite";
import {isVerbose} from "backend-essentials/src/utilities/isVerbose";


export const CLIPBOARD_STORAGE_PATH = 'clipboard-files';

const createClipboardHandleChange = () => {
    const clipboardHashMap = new Map<ClipboardItemTypes, ClipboardItemHash>();
    const updateHash = (name: ClipboardItemTypes, hash: ClipboardItemHash): void => {
        clipboardHashMap.set(name, hash);
    };
    const isHashDifferent = (name: ClipboardItemTypes, hash: ClipboardItemHash): boolean => {
        return clipboardHashMap.get(name) !== hash;
    }

    return {
        initialize: async (): Promise<void> => {
            clipboardChangeEmitter.onChange(async (data) => {
                if (isVerbose()) console.time('Clipboard Change');

                const {image, imageHash, isImageEmpty} = data;

                // First we're getting the image, because HTML can contain the HTML version of an image.
                if (!isImageEmpty && isHashDifferent('image', imageHash)) {
                    updateHash('image', imageHash);

                    const item = nativeImageToImageClipboardItem({image, hash: imageHash});

                    // If there is already an imageFilePath, we don't need to safe it again
                    if (item.imageFilePath) {
                        if (isVerbose()) console.timeEnd('Clipboard Change');
                        return; // is handled
                    }

                    // Save file & update the clipboard item.
                    const filePath = pathJoin(CLIPBOARD_STORAGE_PATH, `${item.id}.png`);
                    let fileStoragePath = await fileExists(filePath);
                    if (fileStoragePath === false) {
                        const imagePng = image.toPNG();
                        item.imageFilePath = await writeFile(filePath, imagePng);

                        // Get the image size
                        const imageStats = await fileStats(filePath);
                        if (imageStats !== false) {
                            item.size = imageStats.size;
                        }
                    }

                    await clipboardManager.add(item);

                    if (isVerbose()) console.timeEnd('Clipboard Change');
                    return; // is handled
                }

                if (isVerbose()) console.timeLog('Clipboard Change', 'not a image');

                const {text, textHash, isTextEmpty} = data;

                // We're getting the text, for colour checking, as some colours are copied from an IDE, which involves HTML, we need to first check for colours.
                if (!isTextEmpty && isTextAColour(text) && isHashDifferent('colour', textHash)) {
                    updateHash('colour', textHash);

                    const item = textToColourClipboardItem({text, hash: textHash});
                    await clipboardManager.add(item);

                    if (isVerbose()) console.timeEnd('Clipboard Change');
                    return; // is handled
                }

                if (isVerbose()) console.timeLog('Clipboard Change', 'not a colour');

                // Text check we're checking if it contains a local path.
                const stats = await UNSAFE_fileStats(text.trim());
                if (!isTextEmpty && stats && isHashDifferent('path', textHash)) {
                    updateHash('path', textHash);

                    const item = textToPathClipboardItem({text, stats, hash: textHash});
                    await clipboardManager.add(item);

                    if (isVerbose()) console.timeEnd('Clipboard Change');
                    return; // is handled
                }

                if (isVerbose()) console.timeLog('Clipboard Change', 'not a file path');

                // Text check we're checking if it contains a valid URL.
                const url = isTextAUrl(text.trim());
                if (!isTextEmpty && url && !!url.hostname) {
                    // Using the url.toString functionality to ensure a more stable URL string
                    const urlHash = sha1(url.toString());
                    if (isHashDifferent('url', urlHash)) {
                        updateHash('url', urlHash);

                        const item = textToUrlClipboardItem({text, url, hash: urlHash});
                        await clipboardManager.add(item);

                        // If there is already an imageFilePath, we don't need to safe it again
                        if (item.imageFilePath) {
                            return; // is handled
                        }

                        // Screenshot the time and save it to the item
                        const filePath = pathJoin(CLIPBOARD_STORAGE_PATH, `${item.id}.png`);
                        let fileStoragePath = await fileExists(filePath);
                        if (fileStoragePath === false) {
                            // Screenshotting the URL
                            item.screenshotStart = Date.now();
                            const screenshotPng = await screenshotUrl.screenshot({url, type: 'png'});
                            item.screenshotEnd = Date.now();

                            // Writing the file to disc
                            if (screenshotPng) {
                                item.imageFilePath = await writeFile(filePath, screenshotPng);

                                // Extracting the screenshot information.
                                const screenshot = nativeImage.createFromBuffer(screenshotPng);
                                const screenshotSize = screenshot.getSize();
                                item.screenshotWidth = screenshotSize.width;
                                item.screenshotHeight = screenshotSize.height;

                                // Get the screenshot size
                                const imageStats = await fileStats(filePath);
                                if (imageStats !== false) {
                                    item.size = imageStats.size;
                                }

                                await clipboardManager.update(item);
                            }
                        }


                        if (isVerbose()) console.timeEnd('Clipboard Change');
                        return; // is handled
                    }
                }

                if (isVerbose()) console.timeLog('Clipboard Change', 'not a url');

                const {html, htmlHash, isHtmlEmpty} = data;

                // We're getting the HTML, as HTML also contains the text in the HTML.
                if (!isHtmlEmpty && html.length !== text.length && isHashDifferent('html', htmlHash)) {
                    updateHash('html', htmlHash);

                    const item = htmlToHtmlClipboardItem({html, htmlText: text, hash: htmlHash});

                    const htmlPath = pathJoin(CLIPBOARD_STORAGE_PATH, `${item.id}.html.txt`);
                    if (!await fileExists(htmlPath)) {
                        item.htmlPath = await writeFile(htmlPath, html);
                    }

                    const textPath = pathJoin(CLIPBOARD_STORAGE_PATH, `${item.id}.text.txt`);
                    if (!await fileExists(textPath)) {
                        item.htmlTextPath = await writeFile(textPath, text);
                    }

                    await clipboardManager.add(item);

                    if (isVerbose()) console.timeEnd('Clipboard Change');
                    return; // is handled
                }

                if (isVerbose()) console.timeLog('Clipboard Change', 'not html');

                // Text check we're checking if is not empty.
                if (!isTextEmpty && isHashDifferent('text', textHash)) {
                    updateHash('text', textHash);

                    const item = textToTextClipboardItem({text, hash: textHash});

                    const textPath = pathJoin(CLIPBOARD_STORAGE_PATH, `${item.id}.text.txt`);
                    if (!await fileExists(textPath)) {
                        item.textPath = await writeFile(textPath, text);
                    }

                    await clipboardManager.add(item);

                    if (isVerbose()) console.timeEnd('Clipboard Change');
                    return; // is handled
                }

                if (isVerbose()) console.timeEnd('Clipboard Change');

                console.log('[clipboard-change-listener] Unknown clipboard change.')
            })
        }
    }
}

export const clipboardHandleChange = createClipboardHandleChange()