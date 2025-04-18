import type {WindowManagerMethods} from "qommand-backend/src/utils/windowManager";

export const windowManagerActionsRequestName = 'windowManagerActionsRequest';

export type WindowManagerActionsRequestReq = {};

export type WindowManagerActionsRequestRes = { actions: WindowManagerMethods[] };