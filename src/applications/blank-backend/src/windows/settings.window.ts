import {createWindow} from "backend-essentials/src/utilities/createWindow";

export const settingsWindow = createWindow({
    developmentPort: 9100,
    title: 'Qlippy Settings',
    route: 'settings',
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    transparent: true,
});
