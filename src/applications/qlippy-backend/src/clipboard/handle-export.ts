import {
    ExportClipboardHistoryEventData,
    exportClipboardHistoryEventName,
} from "qlippy-common/src/events/exportClipboardHistory.event";
import {
    clipboardSettings,
    historyToFile,
} from "../settings/clipboard.setting";
import { eventHandler } from "backend-essentials/src/utilities/eventHandler";
import { dialog } from "electron";
import archiver from "archiver";
import { join as pathJoin } from "node:path";
import { createWriteStream } from "node:fs";
import { readFile } from "backend-essentials/src/files/files";
import { clipboardHistoryWindow } from "../windows/clipboard-history.window";
import { isVerbose } from "backend-essentials/src/utilities/isVerbose";

const CLIPBOARD_STORAGE_PATH = "clipboard-files";

type ExportManifest = {
    version: number;
    exportedAt: number;
    history: unknown[];
};

const createClipboardHandleExport = () => {
    return {
        initialize: async (): Promise<void> => {
            eventHandler.listen<ExportClipboardHistoryEventData>(
                exportClipboardHistoryEventName,
                async () => {
                    if (isVerbose()) console.time("Export clipboard");

                    const settings = clipboardSettings.getSettings();
                    const { history } = settings;

                    const result = await dialog.showSaveDialog(
                        clipboardHistoryWindow.getWindow(),
                        {
                            defaultPath: `qlippy-export-${Date.now()}.zip`,
                            filters: [{
                                name: "ZIP Archive",
                                extensions: ["zip"],
                            }],
                        },
                    );

                    if (result.canceled || !result.filePath) {
                        if (isVerbose()) console.timeEnd("Export clipboard");
                        return;
                    }

                    try {
                        const output = createWriteStream(result.filePath);
                        const archive = archiver("zip", { zlib: { level: 9 } });

                        const zipPromise = new Promise<void>(
                            (resolve, reject) => {
                                output.on("close", () => resolve());
                                archive.on(
                                    "error",
                                    (err: Error) => reject(err),
                                );
                            },
                        );

                        archive.pipe(output);

                        if (isVerbose()) console.time("History export format");

                        const historyItems = await historyToFile(history);

                        if (isVerbose()) {
                            console.timeEnd("History export format");
                        }

                        const manifest: ExportManifest = {
                            version: 1,
                            exportedAt: Date.now(),
                            history: historyItems,
                        };
                        archive.append(JSON.stringify(manifest, null, 2), {
                            name: "manifest.json",
                        });

                        for (const item of history) {
                            if (item.type === "image" || item.type === "url") {
                                if (item.imageFilePath) {
                                    try {
                                        const fileBuffer = await readFile(
                                            item.imageFilePath,
                                        );
                                        const fileName = pathJoin(
                                            "files",
                                            item.imageFilePath.replace(
                                                CLIPBOARD_STORAGE_PATH + "/",
                                                "",
                                            ),
                                        ).replace(/\\/g, "/");
                                        archive.append(fileBuffer, {
                                            name: fileName,
                                        });
                                    } catch (error) {
                                        console.error(
                                            `Failed to export file for item ${item.id}:`,
                                            error,
                                        );
                                    }
                                }
                            }

                            if (item.type === "text") {
                                if (item.textPath) {
                                    try {
                                        const fileBuffer = await readFile(
                                            item.textPath,
                                        );
                                        const fileName = pathJoin(
                                            "files",
                                            item.textPath.replace(
                                                CLIPBOARD_STORAGE_PATH + "/",
                                                "",
                                            ),
                                        ).replace(/\\/g, "/");
                                        archive.append(fileBuffer, {
                                            name: fileName,
                                        });
                                    } catch (error) {
                                        console.error(
                                            `Failed to export file for item ${item.id}:`,
                                            error,
                                        );
                                    }
                                }
                            }

                            if (item.type === "html") {
                                if (item.htmlPath) {
                                    try {
                                        const fileBuffer = await readFile(
                                            item.htmlPath,
                                        );
                                        const fileName = pathJoin(
                                            "files",
                                            item.htmlPath.replace(
                                                CLIPBOARD_STORAGE_PATH + "/",
                                                "",
                                            ),
                                        ).replace(/\\/g, "/");
                                        archive.append(fileBuffer, {
                                            name: fileName,
                                        });
                                    } catch (error) {
                                        console.error(
                                            `Failed to export html file for item ${item.id}:`,
                                            error,
                                        );
                                    }
                                }
                                if (item.htmlTextPath) {
                                    try {
                                        const fileBuffer = await readFile(
                                            item.htmlTextPath,
                                        );
                                        const fileName = pathJoin(
                                            "files",
                                            item.htmlTextPath.replace(
                                                CLIPBOARD_STORAGE_PATH + "/",
                                                "",
                                            ),
                                        ).replace(/\\/g, "/");
                                        archive.append(fileBuffer, {
                                            name: fileName,
                                        });
                                    } catch (error) {
                                        console.error(
                                            `Failed to export html text file for item ${item.id}:`,
                                            error,
                                        );
                                    }
                                }
                            }
                        }

                        archive.finalize();
                        await zipPromise;

                        if (isVerbose()) console.timeEnd("Export clipboard");
                    } catch (error) {
                        console.error("Failed to export clipboard:", error);
                    }
                },
            );
        },
    };
};

export const clipboardHandleExport = createClipboardHandleExport();
