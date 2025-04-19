import {BaseSettings} from "../types/settings.types";

export const settingsUpdatedEventName = 'settingsUpdated';

export type SettingsUpdatedEventData<T extends BaseSettings> = {
    settingName: string;
    updatedSettings: T;
    type: 'reset' | 'update';
}