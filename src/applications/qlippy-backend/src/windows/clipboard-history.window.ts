import {createWindow} from "backend-essentials/src/utilities/createWindow";
import {isDebug} from "backend-essentials/src/utilities/isDebug";

export const clipboardHistoryWindow = createWindow({
    title: 'Clipboard history',
    route: 'clipboard-history',
    width: 1080,
    height: 640,
    minWidth: 1080,
    minHeight: 640,
    resizable: false,
    alwaysOnTop: true,
    transparent: true,
    posY: 150,
    onBlur: ({close}) => isDebug() || close(),
});
