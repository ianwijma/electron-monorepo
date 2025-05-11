import {responseHandler} from "frontend-essentials/src/utilities/responseHandler";
import {useState} from "react";
import {SimpleEventBusData} from "common-essentials/src/types/eventbus.types";
import type {RequestResponseOptions} from 'common-essentials/src/utilities/createResponseHandler';

export const useRequestResponse = <REQ extends SimpleEventBusData, RES extends SimpleEventBusData = SimpleEventBusData>(requestName: string, requestData: REQ, options?: RequestResponseOptions) => {
    const [response, setResponse] = useState<RES>(null);
    const sendRequest = async () => {
        setResponse(null);

        const response = await responseHandler.requestResponse<RES, REQ>(
            requestName,
            requestData,
            options
        );

        setResponse(response);
    }

    return {
        isLoading: response === null,
        sendRequest,
        response
    }
}
