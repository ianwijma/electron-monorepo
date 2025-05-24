export type BaseSettingsDriverProps<T extends BaseSettings> = {
    defaultSettings: T
}

export type BaserSettingsDriverBackupProps = {
    name?: string;
}

export type BaseSettingsDriver = <T extends BaseSettings>(props: BaseSettingsDriverProps<T>) => {
    init: () => void | Promise<void>;
    get: () => T | Promise<T>;
    set: (settings: T) => void | Promise<void>;
    backup: (props?: BaserSettingsDriverBackupProps) => void | Promise<void>;
}
