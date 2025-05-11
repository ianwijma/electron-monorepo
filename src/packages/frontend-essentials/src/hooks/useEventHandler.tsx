import {SimpleEventBusData} from "common-essentials/src/types/eventbus.types";
import {useEffect} from "react";
import {eventHandler} from "../utilities/eventHandler";

const {listen, listenOnce} = eventHandler;

export const useListen = <T extends SimpleEventBusData>(eventName: string, callback: (data: T) => void) => {
    useEffect(() => listen(eventName, callback), []);
}

export const useListenOnce = <T extends SimpleEventBusData>(eventName: string, callback: (data: T) => void) => {
    useEffect(() => listenOnce(eventName, callback), []);
}
