import {BaseSettings} from "../types/settings.types";

export const settingsRequestName = 'settingsRequest';

export type SettingsRequestReq = { settingsName: string };

export type SettingsRequestRes<T extends BaseSettings> = T;