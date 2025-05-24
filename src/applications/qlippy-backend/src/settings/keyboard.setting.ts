import {KeyboardSettings} from "qlippy-common/src/settings/keyboard.settings.types";
import {isMac} from "backend-essentials/src/utilities/isMac";
import {isDev} from "backend-essentials/src/utilities/isDev";
import {createSettings, toMigrations} from "backend-essentials/src/settings/createSettings";

const DEFAULT_CLIPBOARD_KEYS = [
    'Control',
    isMac() ? 'Command' : 'Super',
    isDev() ? 'l' : 'h'
]

// @ts-ignore
export const keyboardSettings = createSettings<KeyboardSettings>({
    name: 'keyboard',
    defaultSettings: {
        version: 3,
        driver: 'file',
        shortcuts: {
            [DEFAULT_CLIPBOARD_KEYS.join('+')]: {
                shortcut: DEFAULT_CLIPBOARD_KEYS.join('+'),
                target: 'window',
                targetId: 'clipboard-history'
            }
        }
    },
    migrations: toMigrations([
        {
            fromVersion: 1,
            toVersion: 2,
            // @ts-ignore - migrateFunction expects to receive and return the complete settings.
            migrateFunction: (settings) => {
                const {shortcuts} = settings;

                return {
                    ...settings,
                    shortcuts: Object.keys(shortcuts).reduce((acc, accelerator) => {
                        const shortcut = shortcuts[accelerator];

                        acc[accelerator] = {
                            ...shortcut,
                            shortcut: accelerator
                        }

                        return acc;
                    }, shortcuts)
                }
            }
        }
    ])
});