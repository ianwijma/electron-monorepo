import {app} from 'electron';
import started from 'electron-squirrel-startup';
import {defaultTray} from "./tray/defaultTray";
import {isDev} from "backend-essentials/src/utilities/isDev";
import {aboutWindow} from "./windows/about.window";
import {clipboardHistoryWindow} from "./windows/clipboard-history.window";
import {fileProtocol} from "backend-essentials/src/files/fileProtocol";
import {settingsManager} from "backend-essentials/src/settings/settingsManager";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

let isSingleInstance = app.requestSingleInstanceLock({isDev: isDev()});
if (!isSingleInstance) {
    console.log('__Blank__ can only be opened once.')
    app.quit();
} else {
    const onBeforeQuit = () => {
        // @ts-expect-error - isQuiting is not officially defined.
        app.isQuiting = true;
    }

    app.on('before-quit', onBeforeQuit);

    const onReady = async () => {
        // Settings
        await settingsManager.initialize();

        // Background Processes
        await fileProtocol.initialize();

        // Windows
        await clipboardHistoryWindow.initialize();
        await aboutWindow.initialize();

        // Tray
        await defaultTray.initialize();
    }

    app.on('ready', onReady);
}
