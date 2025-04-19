import {SimpleEventBusData} from "common-essentials/src/types/eventbus.types";

export const dialogRequestName = 'dialogRequest';

export type DialogRequestReq<T extends SimpleEventBusData> = { dialog: T };

export type DialogRequestRes<T extends SimpleEventBusData> = T;