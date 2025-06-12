import {app, Menu, nativeImage, Tray, MenuItemConstructorOptions} from "electron";
import {defaultLogo} from 'blank-common/src/logos'
import {aboutWindow} from "../windows/about.window";

export const defaultTray = {
    async initialize() {
        console.info('Initializing default tray');
        const icon = nativeImage.createFromDataURL(defaultLogo)
        const tray = new Tray(icon);

        tray.setToolTip('__Blank__');

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