import {ClipboardSettings} from "qlippy-common/src/settings/clipboard.settings.types";
import {createSettings, toMigrations} from "backend-essentials/src/settings/createSettings";
import {migrationToSqlite} from "backend-essentials/src/settings/migrations/migration-to-sqlite";

export const clipboardSettings = createSettings<ClipboardSettings>({
    name: 'clipboard',
    defaultSettings: {
        version: 3,
        driver: 'sqlite',
        history: [],
    },
    migrations: toMigrations([
        {
            fromVersion: 1,
            toVersion: 2,
            // @ts-ignore - migrateFunction expects to receive and return the complete settings.
            migrateFunction: (settings) => {
                const {history} = settings;

                return {
                    ...settings,
                    history: history.map((item) => ({
                        ...item,
                        pinned: false
                    }))
                }
            }
        },
        migrationToSqlite({fromVersion: 2, toVersion: 3})
    ])
});
