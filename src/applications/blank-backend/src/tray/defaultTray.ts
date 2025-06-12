import {app, Menu, nativeImage, Tray, MenuItemConstructorOptions} from "electron";
import {isDev} from "backend-essentials/src/utilities/isDev";
import {resetAllSettings} from "../utils/resetAllSettings";
import {defaultLogo} from 'qlippy-common/src/logos'
import {aboutWindow} from "../windows/about.window";
import {clipboardHistoryWindow} from "../windows/clipboard-history.window";
import {settingsWindow} from "../windows/settings.window";

export const defaultTray = {
    async initialize() {
        console.info('Initializing default tray');
        const icon = nativeImage.createFromDataURL(defaultLogo)
        const tray = new Tray(icon);

        tray.setToolTip('Qlippy');

        let devItems: MenuItemConstructorOptions[] = [
            {
                type: 'separator',
            },
            {
                label: 'Reset',
                type: 'normal',
                click: () => resetAllSettings()
            },
        ]

        let settingsItems: MenuItemConstructorOptions[] = []

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show',
                type: 'normal',
                click: () => clipboardHistoryWindow.toggle()
            },
            {
                label: 'Settings',
                type: 'normal',
                click: () => settingsWindow.open()
            },
            {
                label: 'About',
                type: 'normal',
                click: () => aboutWindow.open()
            },
            ...isDev() ? devItems : [],
            {
                type: 'separator',
            },
            {
                label: 'Quit',
                type: 'normal',
                click: () => app.quit()
            },
        ]);
        tray.setContextMenu(contextMenu);
    }
};