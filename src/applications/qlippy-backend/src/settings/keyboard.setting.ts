import {KeyboardSettings} from "qlippy-common/src/settings/keyboard.settings.types";
import {isMac} from "backend-essentials/src/utilities/isMac";
import {isDev} from "backend-essentials/src/utilities/isDev";
import {createSettings} from "backend-essentials/src/settings/createSettings";

const DEFAULT_CLIPBOARD_KEYS = [
    'Control',
    isMac() ? 'Command' : 'Super',
    isDev() ? 'l' : 'h'
]

export const keyboardSettings = createSettings<KeyboardSettings>({
    name: 'keyboard',
    defaultSettings: {
        version: 1,
        shortcuts: {
            [DEFAULT_CLIPBOARD_KEYS.join('+')]: {
                target: 'window',
                targetId: 'clipboard-history'
            }
        }
    },
});