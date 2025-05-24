import {BaseSettingsDriver, BaseSettingsDriverProps} from "./types";
import {BaseSettings} from "common-essentials/src/types/settings.types";
import initSqlJs from "sql.js";
import {copyFile, fileExists, readFile, writeFile} from "../../files/files";

/**
 * TODO: Replace sql.js with https://github.com/pubkey/rxdb
 */

// @ts-ignore
export const DatabaseSettingsDriver: BaseSettingsDriver = <T extends BaseSettings>(props: BaseSettingsDriverProps<T>) => {
    const {defaultSettings} = props
    const {name} = defaultSettings;
    const databaseFilePath = `settings/${name}.sqlite`;

    let database;

    return {
        init: async () => {
            const sqlJs = await initSqlJs();

            // Ensure file exists
            if (!(await fileExists(databaseFilePath))) {
                await writeFile(databaseFilePath, '');
            }

            // Setup database
            const databaseBuffer = await readFile(databaseFilePath)
            database = new sqlJs.Database(databaseBuffer);

            // Ensure settings table is created
            database.run(`CREATE TABLE IF NOT EXISTS settings
                          (
                              id
                              INTEGER
                              PRIMARY
                              KEY,
                              data
                              TEXT
                              NOT
                              NULL
                          )`);
            const existsStatement = database.prepare(`SELECT EXISTS(SELECT 1 FROM settings WHERE id = 0);`)
            const exists = existsStatement.getAsObject();
            console.log('DATABASE TEST', {exists});
        },
        get: async () => {
            console.log('TODO: WRITE TO DB');
            return defaultSettings;
        },
        set: async (settings) => {
            console.log('TODO: READ FROM DB');
        },
        backup: async ({name = 'backup'} = {}) => {
            await copyFile(databaseFilePath, `${databaseFilePath}.${name}_${Date.now()}`);
        }
    }
}
