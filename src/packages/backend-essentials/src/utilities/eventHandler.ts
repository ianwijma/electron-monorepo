import {createEventHandler} from 'common-essentials/src/utilities/createEventHandler';
import {eventBus} from "./eventBus";

export const eventHandler = createEventHandler(eventBus);

