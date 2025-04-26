import type {CreateSettingReturn, SettingsName} from "./createSettings";
import {BaseSettings} from "common-essentials/src/types/settings.types";

type Setting = CreateSettingReturn<BaseSettings>;

const createSettingsManager = () => {
    const settingsMap: Record<SettingsName, Setting> = {};

    return {
        addSettings: (...setting: Setting[]) => {
            setting.forEach((setting: Setting) => {
                settingsMap[setting.name] = setting;
            })
        },
        initialize: async () => {
            for (const name in settingsMap) {
                const setting = settingsMap[name];

                await setting.initialize();
            }
        },
        reset: async () => {
            for (const name in settingsMap) {
                const setting = settingsMap[name];

                await setting.resetSettings();
            }
        }
    }
}

export const settingsManager = createSettingsManager();