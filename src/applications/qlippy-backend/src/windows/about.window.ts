import {createWindow} from "backend-essentials/src/utilities/createWindow";
import {defaultLogo} from "qlippy-common/src/logos";

export const aboutWindow = createWindow({
    developmentPort: 9100,
    icon: defaultLogo,
    title: 'About Qlippy',
    route: 'about',
    width: 384,
    height: 216,
    minWidth: 384,
    minHeight: 216,
    resizable: false,
    transparent: true,
});