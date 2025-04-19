import {eventHandler} from "./eventHandler";
import {createResponseHandler} from 'common-essentials/src/utilities/createResponseHandler'

export const responseHandler = createResponseHandler(eventHandler)