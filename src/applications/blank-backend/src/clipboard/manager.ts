import {
    ClipboardId,
    ClipboardItem,
} from 'qlippy-common/src/settings/clipboard.settings.types'
import {clipboardSettings} from "../settings/clipboard.setting";
import {readFile, removeFile} from "backend-essentials/src/files/files";
import {clipboard, nativeImage} from "electron";
import {isVerbose} from "backend-essentials/src/utilities/isVerbose";

/**
 * TODO: Tests these limits
 * The clipboard manager UI is simple, and technically should handle the limit below.
 * Couple of performance concerns I have:
 * - Frontend rendering slows down, solution would be to only render the items in the view port.
 * - Backend changes are slow, solution would be to migrate to SQLite instead of a YAML file... Something that is already in the pipeline.
 */
const CLIPBOARD_AMOUNT_LIMIT = 10_000; // TODO: Test these limits

const createClipboardManager = () => {
    const removeItemFromHistory = async ({item, history}: {
        item: ClipboardItem,
        history: ClipboardItem[]
    }): Promise<ClipboardItem[]> => {
        // Check if there are any files we need to remove.
        const {type} = item;
        if (type === 'image' || type === 'url') {
            const {imageFilePath} = item;

            if (imageFilePath) {
                await removeFile(imageFilePath);
            }
        }

        if (type === 'text') {
            const {textPath} = item;

            if (textPath) {
                await removeFile(textPath);
            }
        }

        if (type === 'html') {
            const {htmlPath, htmlTextPath} = item;

            await Promise.all([
                htmlPath ? removeFile(htmlPath) : Promise.resolve(),
                htmlTextPath ? removeFile(htmlTextPath) : Promise.resolve(),
            ])
        }

        return history.filter(({id}) => id !== item.id);
    }

    const getIndex = (item: ClipboardItem): number => {
        const settings = clipboardSettings.getSettings();
        const {history} = settings;

        return history.findIndex(({id}) => id === item.id);
    }

    const restoreImage = async (imageFilePath: string) => {
        if (imageFilePath) {
            const imageBuffer = await readFile(imageFilePath);
            const image = nativeImage.createFromBuffer(imageBuffer);
            clipboard.writeImage(image, 'clipboard');
        }
    }

    const restoreText = (text: string) => {
        if (text) {
            clipboard.writeText(text, 'clipboard');
        }
    }

    return {
        add: async (newItem: ClipboardItem): Promise<void> => {
            if (isVerbose()) console.time('Clipboard Manager Add');

            const settings = clipboardSettings.getSettings();
            const {history} = settings;
            const [firstItem = undefined] = history;

            let updatedHistory = history;
            if (firstItem === undefined || firstItem.hash !== newItem.hash) {
                updatedHistory.unshift(newItem);

                // Check if we're over our hard limit;
                while (history.length > CLIPBOARD_AMOUNT_LIMIT) {
                    const itemToRemove = history.pop();

                    updatedHistory = await removeItemFromHistory({item: itemToRemove, history});
                }

                if (isVerbose()) console.timeLog('Clipboard Manager Add', 'Item(s) Removed');
            }

            // Update the history.
            await clipboardSettings.updateSettings({
                ...settings,
                history: updatedHistory,
            });

            if (isVerbose()) console.timeEnd('Clipboard Manager Add');
        },
        update: async (itemToUpdate: ClipboardItem): Promise<void> => {
            if (isVerbose()) console.time('Clipboard Manager Update');

            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            // Removed the item from history.
            const updatedHistory = history.filter((item) => item.id !== itemToUpdate.id);

            // Update the history
            await clipboardSettings.updateSettings({
                ...settings,
                history: [
                    itemToUpdate,
                    ...updatedHistory,
                ],
            });

            if (isVerbose()) console.timeEnd('Clipboard Manager Update');
        },
        removeMultiple: async (itemsToRemove: ClipboardItem[]): Promise<void> => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            let updatedHistory = history;
            for (const item of itemsToRemove) {
                updatedHistory = await removeItemFromHistory({item, history: updatedHistory})
            }

            // Update the history.
            await clipboardSettings.updateSettings({
                ...settings,
                history: updatedHistory,
            });
        },
        removeAll: async (): Promise<void> => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            let updatedHistory = history;
            for (const item of history) {
                updatedHistory = await removeItemFromHistory({item, history: updatedHistory})
            }

            // Update the history.
            await clipboardSettings.updateSettings({
                ...settings,
                history: updatedHistory,
            });
        },
        restoreImage,
        restoreText,
        restore: async (itemToRestore: ClipboardItem): Promise<void> => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            const index = getIndex(itemToRestore);
            if (index !== -1) {
                let updatedHistory = history;

                // Updated the date
                itemToRestore.dateTimeCopied = Date.now();

                // Move the item to the top of the history.
                updatedHistory.splice(index, 1);
                updatedHistory.unshift(itemToRestore);

                // Update the history.
                await clipboardSettings.updateSettings({
                    ...settings,
                    history: updatedHistory,
                });

                // Then submit the change.
                const {type} = itemToRestore;
                switch (type) {
                    case 'image': {
                        const {imageFilePath} = itemToRestore;
                        await restoreImage(imageFilePath);
                        break;
                    }
                    case 'url': {
                        const {url} = itemToRestore;
                        restoreText(url);
                        break;
                    }
                    case 'path': {
                        const {path} = itemToRestore;
                        restoreText(path);
                        break;
                    }
                    case 'colour': {
                        const {colourText} = itemToRestore;
                        restoreText(colourText);
                        break;
                    }
                    case 'html': {
                        const {html, htmlText} = itemToRestore;
                        clipboard.write({
                            html,
                            text: htmlText,
                        }, 'clipboard');
                        break;
                    }
                    case 'text': {
                        const {text} = itemToRestore;
                        restoreText(text);
                        break;
                    }
                }
            }
        },
        getById: (id: ClipboardId): undefined | ClipboardItem => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            return history.find((item) => item.id === id);
        },
    }
}

export const clipboardManager = createClipboardManager();