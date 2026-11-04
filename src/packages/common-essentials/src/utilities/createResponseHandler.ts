import {nanoid} from "nanoid";
import {EventHandler} from "./createEventHandler";
import {SimpleEventBusData} from "../types/eventbus.types";

export type RequestResponseOptions = {
    timeout?: number;
}

export type ResponseHandler = {
    requestResponse: <RES extends SimpleEventBusData, REQ extends SimpleEventBusData = SimpleEventBusData>(requestName: string, data: REQ, options?: RequestResponseOptions) => Promise<RES>;
    handleResponse: <REQ extends SimpleEventBusData, RES extends SimpleEventBusData = SimpleEventBusData>(requestName: string, shouldHandleCallback: (data: REQ) => boolean | Promise<boolean>, callback: (data: REQ) => RES | Promise<RES>) => void;
}

type RequestObject<T extends SimpleEventBusData = SimpleEventBusData> = {
    requestId: string;
    data?: T;
}

type ResponseObject<T extends SimpleEventBusData = SimpleEventBusData> = {
    requestId: string;
    success?: boolean;
    data?: T;
    errorMessage?: string;
}

const ENABLE_LOG = false;
const log = (...args: any[]) => ENABLE_LOG && console.log(...args);

export const createResponseHandler = (eventHandler: EventHandler): ResponseHandler => {
    return {
        requestResponse: <RES extends SimpleEventBusData, REQ extends SimpleEventBusData = SimpleEventBusData>(requestName: string, requestData: REQ, options: RequestResponseOptions = {}) => {
            const requestId = nanoid();

            const REQUEST_NAME = `${requestName}-request`;
            const RESPONSE_NAME = `${requestName}-response`;

            return new Promise((resolve, reject) => {

                let done = false;
                let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

                const stopListening = eventHandler.listen<ResponseObject<RES>>(RESPONSE_NAME, (response) => {
                    log('responseHandler - requestResponse - listen', requestName, response);

                    const {requestId: currentRequestId, data: responseData, success, errorMessage} = response;

                    if (currentRequestId === requestId && !done) {
                        done = true;
                        stopListening();
                        if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);

                        if (success) {
                            // @ts-expect-error - IDK why TS is sad, the data is of correct type...
                            resolve(responseData);
                        } else {
                            reject(`ResponseHandler - fetch failure: ${errorMessage}`);
                        }
                    }
                });

                log('responseHandler - requestResponse - emit', requestName, requestId);
                eventHandler.emit<RequestObject<REQ>>(REQUEST_NAME, {
                    requestId,
                    data: requestData
                })

                if ('timeout' in options && options.timeout > 0) {
                    timeoutHandle = setTimeout(() => {
                        if (done) return;

                        done = true;
                        // Stop listening, otherwise a late response keeps a dangling listener around forever.
                        stopListening();
                        reject(`ResponseHandler - Timed out after ${options.timeout}ms (${requestName})`);
                    }, options.timeout);
                }
            })
        },
        handleResponse: <REQ extends SimpleEventBusData, RES extends SimpleEventBusData = SimpleEventBusData>(requestName: string, shouldHandleCallback: (data: REQ) => boolean | Promise<boolean>, callback: (data: REQ) => RES | Promise<RES>) => {
            log('responseHandler - handleResponse - listen', requestName, shouldHandleCallback, callback);

            const REQUEST_NAME = `${requestName}-request`;
            const RESPONSE_NAME = `${requestName}-response`;

            eventHandler.listen<RequestObject<REQ>>(REQUEST_NAME, async (request) => {
                log('responseHandler - listen - handle', requestName, request);

                const {requestId, data} = request;

                const shouldHandleRequest = await shouldHandleCallback(data);
                if (shouldHandleRequest) {
                    try {
                        const responseData = await callback(data);

                        eventHandler.emit<ResponseObject<RES>>(RESPONSE_NAME, {
                            requestId,
                            success: true,
                            data: responseData,
                        });
                    } catch (error) {
                        console.log('responseHandler - error', error);

                        eventHandler.emit<ResponseObject<RES>>(RESPONSE_NAME, {
                            requestId,
                            success: false,
                            errorMessage: error.message
                        });
                    }
                }

            });
        }
    }
}