import {ClipboardSettings} from "qlippy-common/src/settings/clipboard.settings.types";
import {createSettings, toMigrations} from "backend-essentials/src/settings/createSettings";
import {fileExists, readStringFile, writeFile} from "backend-essentials/src/files/files";
import {join as pathJoin} from "node:path";
import {CLIPBOARD_STORAGE_PATH} from "../clipboard/handle-change";
import {isVerbose} from "backend-essentials/src/utilities/isVerbose";

export const clipboardSettings = createSettings<ClipboardSettings>({
    name: 'clipboard',
    defaultSettings: {
        version: 3,
        history: [],
    },
    migrations: toMigrations([
        {
            fromVersion: 1,
            toVersion: 2,
            // @ts-ignore - migrateFunction expects to receive and return the complete settings.
            migrateFunction: (settings) => {
                const {history} = settings;

                return {
                    ...settings,
                    history: history.map((item) => ({
                        ...item,
                        pinned: false
                    }))
                }
            }
        },
        {
            fromVersion: 2,
            toVersion: 3,
            // @ts-ignore - migrateFunction expects to receive and return the complete settings.
            migrateFunction: async (settings) => {
                const {history} = settings;

                return {
                    ...settings,
                    history: await Promise.all(history.map(async (item) => {
                        if (item.type === 'html') {
                            const htmlPath = pathJoin(CLIPBOARD_STORAGE_PATH, `${item.id}.html.txt`);
                            if (!await fileExists(htmlPath)) {
                                item.htmlPath = await writeFile(htmlPath, item.html);
                            }

                            const textPath = pathJoin(CLIPBOARD_STORAGE_PATH, `${item.id}.text.txt`);
                            if (!await fileExists(textPath)) {
                                item.htmlTextPath = await writeFile(textPath, item.htmlText);
                            }
                        }

                        if (item.type === 'text') {
                            const textPath = pathJoin(CLIPBOARD_STORAGE_PATH, `${item.id}.text.txt`);
                            if (!await fileExists(textPath)) {
                                item.textPath = await writeFile(textPath, item.text);
                            }
                        }

                        return item;
                    }))
                }
            }
        }
    ]),
    preSaveFn: async (settings) => {
        const {version, history} = settings;

        if (version < 3) return settings;

        if (isVerbose()) console.time('Clipboard pre save');

        const historyItems = await Promise.all(history.map(async (item) => {
            if (item.type === 'text') {
                delete item.text;
            }

            if (item.type === 'html') {
                delete item.html;
                delete item.htmlText;
            }

            return item;
        }));

        if (isVerbose()) console.timeEnd('Clipboard pre save');

        return {
            ...settings,
            history: historyItems
        }
    },
    postLoadFn: async (settings) => {
        const {version, history} = settings;

        if (version < 3) return settings;

        if (isVerbose()) console.time('Clipboard post load');

        const historyItems = await Promise.all(history.map(async (item) => {
            if (item.type === 'text' && item.textPath) {
                item.text = await readStringFile(item.textPath);
            }

            if (item.type === 'html' && item.htmlPath && item.htmlTextPath) {
                const [html, text] = await Promise.all([
                    readStringFile(item.htmlPath),
                    readStringFile(item.htmlTextPath),
                ]);

                item.html = html;
                item.htmlText = text;
            }

            return item;
        }));

        if (isVerbose()) console.timeEnd('Clipboard post load');

        return {
            ...settings,
            history: historyItems
        }
    }
});
