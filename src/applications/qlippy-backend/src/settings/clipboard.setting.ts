import {
    ClipboardHistory,
    ClipboardSettings,
} from "qlippy-common/src/settings/clipboard.settings.types";
import {
    createSettings,
    toMigrations,
} from "backend-essentials/src/settings/createSettings";
import {
    denormalizeFilePath,
    fileExists,
    normalizeFilePath,
    readStringFile,
    writeFile,
} from "backend-essentials/src/files/files";
import { join as pathJoin } from "node:path";
import { CLIPBOARD_STORAGE_PATH } from "../clipboard/handle-change";
import { isVerbose } from "backend-essentials/src/utilities/isVerbose";

export const historyToFile = async (
    history: ClipboardHistory,
): Promise<ClipboardHistory> => {
    return Promise.all(history.map(async (item) => {
        try {
            if (item.type === "text" && item.textPath) {
                delete item.text;
            }

            if (item.type === "html" && item.htmlPath && item.htmlPath) {
                delete item.html;
                delete item.htmlText;
            }

            if (item.type === "image" || item.type === "url") {
                item.imageFilePath = denormalizeFilePath(
                    item.imageFilePath,
                );
            }

            if (item.type === "text") {
                item.textPath = denormalizeFilePath(item.textPath);
            }

            if (item.type === "html") {
                item.htmlPath = denormalizeFilePath(item.htmlPath);
                item.htmlTextPath = denormalizeFilePath(item.htmlTextPath);
            }
        } catch (error) {
            console.error(
                `Failed to load data for clipboard item ${item.id}`,
                { error },
            );
        }

        return item;
    }));
};

export const historyFromFile = async (
    history: ClipboardHistory,
): Promise<ClipboardHistory> => {
    return Promise.all(history.map(async (item) => {
        try {
            if (item.type === "text" && item.textPath) {
                item.text = await readStringFile(item.textPath);
            }

            if (
                item.type === "html" && item.htmlPath && item.htmlTextPath
            ) {
                const [html, text] = await Promise.all([
                    readStringFile(item.htmlPath),
                    readStringFile(item.htmlTextPath),
                ]);

                item.html = html;
                item.htmlText = text;
            }

            if (item.type === "image" || item.type === "url") {
                item.imageFilePath = normalizeFilePath(item.imageFilePath);
            }

            if (item.type === "text") {
                item.textPath = normalizeFilePath(item.textPath);
            }

            if (item.type === "html") {
                item.htmlPath = normalizeFilePath(item.htmlPath);
                item.htmlTextPath = normalizeFilePath(item.htmlTextPath);
            }
        } catch (error) {
            console.error(
                `Failed to load data for clipboard item ${item.id}`,
                { error },
            );
        }

        return item;
    }));
};

export const clipboardSettings = createSettings<ClipboardSettings>({
    name: "clipboard",
    defaultSettings: {
        version: 4,
        history: [],
    },
    preSaveFn: async (settings) => {
        const { version, history } = settings;

        if (version < 3) return settings;

        if (isVerbose()) console.time("History save");

        const historyItems = await historyToFile(history);

        if (isVerbose()) console.timeEnd("History save");

        return {
            ...settings,
            history: historyItems,
        };
    },
    postLoadFn: async (settings) => {
        const { version, history } = settings;

        if (version < 3) return settings;

        if (isVerbose()) console.time("History load");

        const historyItems = await historyFromFile(history);

        if (isVerbose()) console.timeEnd("History load");

        return {
            ...settings,
            history: historyItems,
        };
    },
    migrations: toMigrations([
        {
            fromVersion: 1,
            toVersion: 2,
            // @ts-ignore - migrateFunction expects to receive and return the complete settings.
            migrateFunction: (settings) => {
                const { history } = settings;

                return {
                    ...settings,
                    history: history.map((item) => ({
                        ...item,
                        pinned: false,
                    })),
                };
            },
        },
        {
            fromVersion: 2,
            toVersion: 3,
            // @ts-ignore - migrateFunction expects to receive and return the complete settings.
            migrateFunction: async (settings) => {
                const { history } = settings;

                return {
                    ...settings,
                    history: await Promise.all(history.map(async (item) => {
                        if (item.type === "html") {
                            const htmlPath = pathJoin(
                                CLIPBOARD_STORAGE_PATH,
                                `${item.id}.html.txt`,
                            );
                            const currentHtmlPath = await fileExists(htmlPath);
                            if (currentHtmlPath) {
                                item.htmlPath = currentHtmlPath;
                            } else {
                                item.htmlPath = await writeFile(
                                    htmlPath,
                                    item.html,
                                );
                            }

                            const textPath = pathJoin(
                                CLIPBOARD_STORAGE_PATH,
                                `${item.id}.text.txt`,
                            );
                            const currentTextPath = await fileExists(textPath);
                            if (currentTextPath) {
                                item.htmlTextPath = currentTextPath;
                            } else {
                                item.htmlTextPath = await writeFile(
                                    textPath,
                                    item.htmlText,
                                );
                            }
                        }

                        if (item.type === "text") {
                            const textPath = pathJoin(
                                CLIPBOARD_STORAGE_PATH,
                                `${item.id}.text.txt`,
                            );
                            const currentTextPath = await fileExists(textPath);
                            if (currentTextPath) {
                                item.textPath = currentTextPath;
                            } else {
                                item.textPath = await writeFile(
                                    textPath,
                                    item.text,
                                );
                            }
                        }

                        return item;
                    })),
                };
            },
        },
        {
            fromVersion: 3,
            toVersion: 4,
            // @ts-ignore - migrateFunction expects to receive and return the complete settings.
            migrateFunction: (settings) => {
                const { history } = settings;

                return {
                    ...settings,
                    history: history.map((item) => {
                        if (item.type === "image" || item.type === "url") {
                            item.imageFilePath = denormalizeFilePath(
                                item.imageFilePath,
                            );
                        }

                        if (item.type === "text") {
                            item.textPath = denormalizeFilePath(item.textPath);
                        }

                        if (item.type === "html") {
                            item.htmlPath = denormalizeFilePath(item.htmlPath);
                            item.htmlTextPath = denormalizeFilePath(
                                item.htmlTextPath,
                            );
                        }

                        return item;
                    }),
                };
            },
        },
    ]),
});
