import {createWindow} from "./createWindow";

export const sendWindow = createWindow({
    developmentPort: 9200,
    title: 'Send Event',
    route: 'send-event'
});
