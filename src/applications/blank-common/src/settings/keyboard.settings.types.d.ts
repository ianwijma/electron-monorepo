import {BaseSettings} from "common-essentials/src/types/settings.types";

export type KeyboardShortcut = string;
export type KeyboardActionTarget = 'window';
export type KeyboardAction = {
    shortcut: KeyboardShortcut,
    target: KeyboardActionTarget,
    targetId: string,
};

export type KeyboardShortcuts = {
    [key: KeyboardShortcut]: KeyboardAction;
}

export type KeyboardSettings = BaseSettings & {
    shortcuts: KeyboardShortcuts
};