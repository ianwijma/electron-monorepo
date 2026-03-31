import {dialog, BrowserWindow} from 'electron';

type OpenFileAsParams = {
    suggestedName?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    window?: BrowserWindow;
};

type OpenFileAsResult = {
    canceled: true;
} | {
    canceled: false;
    filePath: string;
};

export const openFileAs = async (params: OpenFileAsParams): Promise<OpenFileAsResult> => {
    const {filters, window} = params;

    const result = await dialog.showOpenDialog(window, {
        properties: ['openFile'],
        filters: filters ?? [{name: 'All Files', extensions: ['*']}],
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return {canceled: true};
    }

    return {canceled: false, filePath: result.filePaths[0]};
};
