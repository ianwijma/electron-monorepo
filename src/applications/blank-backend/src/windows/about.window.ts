import {createWindow} from "backend-essentials/src/utilities/createWindow";

export const aboutWindow = createWindow({
    developmentPort: 9100,
    title: 'About __Blank__',
    route: 'about',
    width: 384,
    height: 216,
    minWidth: 384,
    minHeight: 216,
    resizable: false,
    transparent: true,
});