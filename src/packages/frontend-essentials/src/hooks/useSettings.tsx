import {useEffect, useState} from "react";
import {BaseSettings} from "common-essentials/src/types/settings.types";
import {settingsUpdatedEventName, type SettingsUpdatedEventData} from 'common-essentials/src/events/settingsUpdated.event'
import {updateSettingsEventName, type UpdateSettingsEventData} from 'common-essentials/src/events/updateSettings.event'
import {
    settingsRequestName,
    type SettingsRequestReq,
    type SettingsRequestRes
} from 'common-essentials/src/requests/settings.request'
import {useListen} from "./useEventHandler";
import {responseHandler} from "../utilities/responseHandler";
import {eventHandler} from "../utilities/eventHandler";

/**
 * Settings can be large (e.g. the clipboard history, which carries the content of every item).
 * Cloning them on the main thread and sending them over IPC can take well over a second for a
 * big history, so the timeout only exists to surface a backend that never answers at all.
 */
const SETTINGS_REQUEST_TIMEOUT_MS = 30_000;

export const useSettings = <T extends BaseSettings>(settingsName: string) => {
    const [settings, setSettings] = useState<T>(null);
    const isLoading = settings === null;

    const initializeSettings = async () => {
        try {
            const initialSettings = await responseHandler.requestResponse<SettingsRequestRes<T>, SettingsRequestReq>(
                settingsRequestName,
                {settingsName},
                {timeout: SETTINGS_REQUEST_TIMEOUT_MS}
            );

            console.log('Setting Initialised', {
                settingsName,
                version: initialSettings?.version,
            });

            setSettings(initialSettings);
        } catch (error) {
            console.error('Failed to fetch and update the settings', {error});
        }
    }

    useListen<SettingsUpdatedEventData<T>>(settingsUpdatedEventName, (response) => {
        const {updatedSettings} = response;
        const {name} = updatedSettings;

        if (name === settingsName) {
            console.log('Setting Updated', {
                settingsName,
                name,
                version: updatedSettings?.version,
            });
            setSettings(updatedSettings);
        }
    })

    useEffect(() => {
        initializeSettings();
    }, []);

    const updateSettings = (settingsToUpdate: T) => {
        eventHandler.emit<UpdateSettingsEventData<T>>(updateSettingsEventName, {
            settingsName,
            settingsToUpdate
        });
    }

    return {
        isLoading,
        settings,
        updateSettings
    }
}