import {createWindow} from "./createWindow";

export const aboutWindow = createWindow({
    developmentPort: 9200,
    title: 'About Qommand',
    route: 'about',
    width: 690,
    height: 180,
    minWidth: 690,
    minHeight: 180,
    resizable: false,
});
