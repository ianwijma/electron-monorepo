import {dialog, BrowserWindow} from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

type SaveFileAsParams = {
    sourcePath: string;
    suggestedName?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    window?: BrowserWindow;
};

type SaveFileAsResult = {
    canceled: true;
} | {
    canceled: false;
    destinationPath: string;
};

export const saveFileAs = async (params: SaveFileAsParams): Promise<SaveFileAsResult> => {
    const {sourcePath, suggestedName, filters, window} = params;

    const defaultName = suggestedName ?? path.basename(sourcePath);

    const result = await dialog.showSaveDialog(window, {
        defaultPath: defaultName,
        filters: filters ?? [{name: 'All Files', extensions: ['*']}],
    });

    if (result.canceled || !result.filePath) {
        return {canceled: true};
    }

    await fs.copyFile(sourcePath, result.filePath);

    return {canceled: false, destinationPath: result.filePath};
};
