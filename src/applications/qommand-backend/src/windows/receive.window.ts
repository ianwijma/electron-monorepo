import {createWindow} from "./createWindow";

export const receiveWindow = createWindow({
    developmentPort: 9200,
    title: 'Receive Event',
    route: 'receive-event'
});