import {useEffect, useState} from "react";
import {BaseSettings} from "common-essentials/src/types/settings.types";
import {eventHandler} from "../utils/eventHandler";
import {settingsUpdatedEventName, type SettingsUpdatedEventData} from 'common-essentials/src/events/settingsUpdated.event'
import {updateSettingsEventName, type UpdateSettingsEventData} from 'common-essentials/src/events/updateSettings.event'
import {
    settingsRequestName,
    type SettingsRequestReq,
    type SettingsRequestRes
} from 'common-essentials/src/requests/settings.request'
import {responseHandler} from "../utils/responseHandler";
import {useListen} from "./useEventHandler";
import type {SettingsName} from "backend-essentials/src/utilities/createSettings";

export const useSettings = <T extends BaseSettings>(settingsName: SettingsName) => {
    const [settings, setSettings] = useState<T>(null);
    const isLoading = settings === null;

    const initializeSettings = async () => {
        try {
            const initialSettings = await responseHandler.requestResponse<SettingsRequestRes<T>, SettingsRequestReq>(
                settingsRequestName,
                {settingsName},
                {timeout: 200}
            );

            console.log('Setting Initialised', {
                settingsName,
                initialSettings
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
                updatedSettings
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