import {BaseSettingsDriver, BaseSettingsDriverProps} from "./types";
import {BaseSettings} from "common-essentials/src/types/settings.types";
import {copyFile, fileExists, readYamlFile, writeYamlFile} from "../../files/files";

export const FileSettingsDriver: BaseSettingsDriver = <T extends BaseSettings>(props: BaseSettingsDriverProps<T>) => {
    const {defaultSettings} = props;
    const {name} = defaultSettings;
    const filePath = `settings/${name}.yaml`;

    return {
        init: async () => {
            const settingsFileExists = await fileExists(filePath);
            if (!settingsFileExists) {
                await writeYamlFile<T>(filePath, defaultSettings);
            }
        },
        get: async () => {
            return readYamlFile<T>(filePath);
        },
        set: async (settings) => {
            await writeYamlFile<T>(filePath, settings);
        },
        backup: async ({name = 'backup'} = {}) => {
            await copyFile(filePath, `${filePath}.${name}_${Date.now()}`);
        }
    }
}
