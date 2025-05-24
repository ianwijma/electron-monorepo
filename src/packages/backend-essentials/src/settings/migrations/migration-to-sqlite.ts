import {MigrationType} from "../createSettings";
import {BaseSettings} from "common-essentials/src/types/settings.types";
import {MigrationToDefaultProps} from "./types";
import {FileSettingsDriver} from "../drivers/fileSettingsDriver";
import {DatabaseSettingsDriver} from "../drivers/databaseSettingDriver";

export const migrationToSqlite = <T extends BaseSettings>({
                                                              fromVersion,
                                                              toVersion
                                                          }: MigrationToDefaultProps): MigrationType<T> => {
    return {
        fromVersion,
        toVersion,
        migrateFunction: async (settings: T) => {
            const fileDriver = FileSettingsDriver({defaultSettings: settings});
            const databaseDriver = DatabaseSettingsDriver({defaultSettings: settings});

            await Promise.all([
                fileDriver.init(),
                databaseDriver.init()
            ]);

            const fileSettings = await fileDriver.get();
            const updatedSettings: T = {
                ...fileSettings,
                driver: 'sqlite'
            }

            await databaseDriver.set(updatedSettings);

            return updatedSettings;
        }
    }
}