import {copyFile, fileExists, readYamlFile, writeYamlFile} from "../files/files";
import {BaseSettings, SettingsVersion} from "common-essentials/src/types/settings.types";
import {responseHandler} from "../utilities/responseHandler";
import {eventHandler} from "../utilities/eventHandler";
import {
    settingsUpdatedEventName,
    type SettingsUpdatedEventData
} from '../../../common-essentials/src/events/settingsUpdated.event'
import {
    updateSettingsEventName,
    type UpdateSettingsEventData
} from '../../../common-essentials/src/events/updateSettings.event'
import {
    settingsRequestName,
    type SettingsRequestReq,
    type SettingsRequestRes
} from '../../../common-essentials/src/requests/settings.request'
import diff from 'git-diff'
import {isDebug} from "../utilities/isDebug";

export type SettingsName = string;

export type MigrationType<T extends BaseSettings> = {
    fromVersion: SettingsVersion,
    toVersion: SettingsVersion,
    migrateFunction: (settings: T) => Promise<T>,
}

export type MigrationObjectType<T extends BaseSettings> = Record<SettingsVersion, MigrationType<T>>;
export type MigrationArrayType<T extends BaseSettings> = MigrationType<T>[];

export const toMigrations = <T extends BaseSettings>(input: MigrationArrayType<T>): MigrationObjectType<T> => {
    return input.reduce((acc, migration) => {
        const {fromVersion} = migration;

        if (fromVersion in acc) throw new Error(`Migration with fromVersion "${fromVersion}" was already declared`);

        acc[fromVersion] = migration;

        return acc;
    }, {} as MigrationObjectType<T>)
}

type CreateSettingParams<T extends BaseSettings> = {
    name: SettingsName;
    defaultSettings: Omit<T, "name">;
    preSaveFn?: (data: T) => Promise<T> | T;
    postLoadFn?: (data: T) => Promise<T> | T;
    migrations?: MigrationObjectType<T>;
}

export type CreateSettingReturn<T extends BaseSettings> = {
    name: SettingsName;
    initialize: () => Promise<void>;
    getSettings: () => T;
    syncSettings: () => Promise<void>;
    updateSettings: (updatedSettings: T) => Promise<T>;
    resetSettings: () => Promise<T>;
}

export const createSettings = <T extends BaseSettings>({
                                                           name,
                                                           defaultSettings,
                                                           preSaveFn = (data) => data,
                                                           postLoadFn = (data) => data,
                                                           migrations = {},
                                                       }: CreateSettingParams<T>): CreateSettingReturn<T> => {
    const actuallyDefaultSettings: T = {name, ...defaultSettings} as T;
    const settingsFilePath = `settings/${name}.yaml`;
    let settingsCache: T;

    const isInitialized = () => {
        if (!settingsCache) throw new Error(`Setting ${name} was not initialized`);
    }

    const initialize = async () => {
        console.info(`Initializing ${name} settings`);

        await syncSettings();

        await performMigration();

        await setupListeners();
    }

    const getSettings = (): T => {
        isInitialized();

        return JSON.parse(JSON.stringify(settingsCache));
    };

    const syncSettings = async () => {
        const settingsFileExists = await fileExists(settingsFilePath);
        if (!settingsFileExists) {
            await writeYamlFile<T>(settingsFilePath, actuallyDefaultSettings);
        }

        const settings = await readYamlFile<T>(settingsFilePath);

        settingsCache = await postLoadFn(settings);
    }

    const setupListeners = async () => {
        responseHandler.handleResponse<SettingsRequestReq, SettingsRequestRes<T>>(settingsRequestName, (request) => {
            const {settingsName: currentSettingsName} = request;

            return currentSettingsName === name;
        }, () => {
            return getSettings();
        });

        eventHandler.listen<UpdateSettingsEventData<T>>(updateSettingsEventName, (event) => {
            const {settingsName, settingsToUpdate} = event;

            if (settingsName !== name) return;

            updateSettings(settingsToUpdate);
        })
    };

    const performMigration = async () => {
        let currentSettings = getSettings();

        // Backup locations
        const dateNow = Date.now();
        const backupSettingsFilePath = `${settingsFilePath}.backup_${dateNow}`;
        const debugSettingsFilePath = `${settingsFilePath}.backup_${dateNow}`;

        const isGoingToMigrate = currentSettings.version in migrations;
        if (isGoingToMigrate) {
            console.log(`We're about to perform a migration for the ${name} setting, backing up the current settings to ${backupSettingsFilePath}`);
            await copyFile(settingsFilePath, backupSettingsFilePath);
        }

        while (currentSettings.version in migrations) {
            const migration = migrations[currentSettings.version];
            const {fromVersion, toVersion, migrateFunction} = migration;

            const timeLog = `Migrating ${name} settings from ${fromVersion} to ${toVersion}`;
            console.time(timeLog);
            const migratedSettings = await migrateFunction(currentSettings);
            console.timeEnd(timeLog);

            // Ensure the version is bumped correctly.
            migratedSettings.version = toVersion;

            await updateSettings(migratedSettings, {emitEvents: false});

            currentSettings = getSettings();
        }

        if (isGoingToMigrate) {
            // Backing up the post-migration settings for debugging migration errors.
            await copyFile(settingsFilePath, debugSettingsFilePath);
        }
    };

    type UpdateSettingsConfig = {
        emitEvents?: boolean
    }

    const updateSettings = async (settingToUpdate: T, config: UpdateSettingsConfig = {emitEvents: true}): Promise<T> => {
        let preUpdate = '';
        if (isDebug()) {
            preUpdate = JSON.stringify(getSettings(), null, 2);
        }

        const formattedSettings = await preSaveFn(settingToUpdate);

        await writeYamlFile<T>(settingsFilePath, formattedSettings);

        await syncSettings();

        const updatedSettings = getSettings();

        let postUpdate = '';
        if (isDebug()) {
            postUpdate = JSON.stringify(updatedSettings, null, 2);
        }

        if (isDebug() && postUpdate.length < 5000) {
            const updateDiff = diff(preUpdate, postUpdate, {
                color: true,
            });
            console.log(updateDiff);
        }

        if (config.emitEvents) {
            eventHandler.emit<SettingsUpdatedEventData<T>>(settingsUpdatedEventName, {
                settingName: name,
                updatedSettings,
                type: 'update',
            });
        }

        return updatedSettings;
    }

    const resetSettings = async () => {
        await writeYamlFile<T>(settingsFilePath, actuallyDefaultSettings);

        await syncSettings();

        const resettedSettings = getSettings();

        console.log('Settings reset', {name, settings: JSON.stringify(resettedSettings)});

        eventHandler.emit<SettingsUpdatedEventData<T>>(settingsUpdatedEventName, {
            settingName: name,
            updatedSettings: resettedSettings,
            type: 'reset'
        });

        return resettedSettings;
    }

    return {
        name,
        initialize,
        getSettings,
        syncSettings,
        updateSettings,
        resetSettings
    }
}