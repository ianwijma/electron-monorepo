import {
    ImportClipboardHistoryEventData,
    importClipboardHistoryEventName,
} from "qlippy-common/src/events/importClipboardHistory.event";
import {
    clipboardSettings,
    historyFromFile,
} from "../settings/clipboard.setting";
import { eventHandler } from "backend-essentials/src/utilities/eventHandler";
import { dialog } from "electron";
import yauzl from "yauzl";
import { join as pathJoin } from "node:path";
import { writeFile } from "backend-essentials/src/files/files";
import { clipboardHistoryWindow } from "../windows/clipboard-history.window";
import { isVerbose } from "backend-essentials/src/utilities/isVerbose";
import {
    ClipboardHistory,
    ClipboardItem,
} from "qlippy-common/src/settings/clipboard.settings.types";

const CLIPBOARD_STORAGE_PATH = "clipboard-files";

type ExportManifest = {
    version: number;
    exportedAt: number;
    history: ClipboardHistory;
};

const createClipboardHandleImport = () => {
    return {
        initialize: async (): Promise<void> => {
            eventHandler.listen<ImportClipboardHistoryEventData>(
                importClipboardHistoryEventName,
                async () => {
                    if (isVerbose()) console.time("Import clipboard");

                    const result = await dialog.showOpenDialog(
                        clipboardHistoryWindow.getWindow(),
                        {
                            properties: ["openFile"],
                            filters: [{
                                name: "ZIP Archive",
                                extensions: ["zip"],
                            }],
                        },
                    );

                    if (
                        result.canceled || !result.filePaths ||
                        result.filePaths.length === 0
                    ) {
                        if (isVerbose()) console.timeEnd("Import clipboard");
                        return;
                    }

                    try {
                        const zipPath = result.filePaths[0];

                        const manifest = await new Promise<
                            ExportManifest | null
                        >((resolve, reject) => {
                            yauzl.open(
                                zipPath,
                                { lazyEntries: true },
                                (err, zipfile) => {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }

                                    let foundManifest: ExportManifest | null =
                                        null;

                                    zipfile.readEntry();

                                    zipfile.on("entry", (entry) => {
                                        if (
                                            entry.fileName === "manifest.json"
                                        ) {
                                            zipfile.openReadStream(
                                                entry,
                                                (err, readStream) => {
                                                    if (err) {
                                                        reject(err);
                                                        return;
                                                    }

                                                    const chunks: Buffer[] = [];
                                                    readStream.on(
                                                        "data",
                                                        (chunk) =>
                                                            chunks.push(chunk),
                                                    );
                                                    readStream.on("end", () => {
                                                        const content = Buffer
                                                            .concat(chunks)
                                                            .toString("utf8");
                                                        foundManifest = JSON
                                                            .parse(
                                                                content,
                                                            ) as ExportManifest;
                                                        zipfile.readEntry();
                                                    });
                                                },
                                            );
                                        } else {
                                            zipfile.readEntry();
                                        }
                                    });

                                    zipfile.on(
                                        "end",
                                        () => resolve(foundManifest),
                                    );
                                    zipfile.on("error", reject);
                                },
                            );
                        });

                        if (!manifest) {
                            console.error(
                                "No manifest.json found in the ZIP file",
                            );
                            if (isVerbose()) {
                                console.timeEnd("Import clipboard");
                            }
                            return;
                        }

                        await new Promise<void>((resolve, reject) => {
                            yauzl.open(
                                zipPath,
                                { lazyEntries: true },
                                (err, zipfile) => {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }

                                    zipfile.readEntry();

                                    zipfile.on("entry", (entry) => {
                                        if (
                                            entry.fileName.startsWith(
                                                "files/",
                                            ) && !entry.fileName.endsWith("/")
                                        ) {
                                            zipfile.openReadStream(
                                                entry,
                                                (err, readStream) => {
                                                    if (err) {
                                                        console.error(
                                                            `Failed to read ${entry.fileName}:`,
                                                            err,
                                                        );
                                                        zipfile.readEntry();
                                                        return;
                                                    }

                                                    const chunks: Buffer[] = [];
                                                    readStream.on(
                                                        "data",
                                                        (chunk) =>
                                                            chunks.push(chunk),
                                                    );
                                                    readStream.on(
                                                        "end",
                                                        async () => {
                                                            const relativePath =
                                                                entry.fileName
                                                                    .replace(
                                                                        "files/",
                                                                        "",
                                                                    );
                                                            const destPath =
                                                                pathJoin(
                                                                    CLIPBOARD_STORAGE_PATH,
                                                                    relativePath,
                                                                );
                                                            const content =
                                                                Buffer.concat(
                                                                    chunks,
                                                                );
                                                            try {
                                                                await writeFile(
                                                                    destPath,
                                                                    content,
                                                                );
                                                            } catch (writeErr) {
                                                                console.error(
                                                                    `Failed to write ${destPath}:`,
                                                                    writeErr,
                                                                );
                                                            }
                                                            zipfile.readEntry();
                                                        },
                                                    );
                                                },
                                            );
                                        } else {
                                            zipfile.readEntry();
                                        }
                                    });

                                    zipfile.on("end", () => resolve());
                                    zipfile.on("error", reject);
                                },
                            );
                        });

                        if (isVerbose()) console.time("History import format");

                        const importedHistory: ClipboardHistory =
                            await historyFromFile(manifest.history);

                        if (isVerbose()) {
                            console.timeEnd("History import format");
                        }

                        const settings = clipboardSettings.getSettings();
                        const existingHistory = settings.history;

                        const existingIds = new Set(
                            existingHistory.map((item) => item.id),
                        );

                        const newItems: ClipboardItem[] = [];
                        for (const item of importedHistory) {
                            if (!existingIds.has(item.id)) {
                                newItems.push(item);
                            }
                        }

                        const updatedHistory = [
                            ...newItems,
                            ...existingHistory,
                        ];

                        await clipboardSettings.updateSettings({
                            ...settings,
                            history: updatedHistory,
                        });

                        if (isVerbose()) console.timeEnd("Import clipboard");
                    } catch (error) {
                        console.error("Failed to import clipboard:", error);
                    }
                },
            );
        },
    };
};

export const clipboardHandleImport = createClipboardHandleImport();
