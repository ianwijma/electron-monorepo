import {BaseSettings} from "../types/settings.types";

export const updateSettingsEventName = 'updateSettings';

export type UpdateSettingsEventData<T extends BaseSettings> = {
    settingsName: string;
    settingsToUpdate: T
}