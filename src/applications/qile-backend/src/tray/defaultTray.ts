import {app, Menu, nativeImage, Tray, MenuItemConstructorOptions} from "electron";
import {defaultLogo} from 'qile-common/src/logos'
import {aboutWindow} from "../windows/about.window";

export const defaultTray = {
    async initialize() {
        console.info('Initializing default tray');
        const icon = nativeImage.createFromDataURL(defaultLogo)
        const tray = new Tray(icon);

        tray.setToolTip('Qile');

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'About',
                type: 'normal',
                click: () => aboutWindow.open()
            },
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