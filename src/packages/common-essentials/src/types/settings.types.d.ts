export type SettingsVersion = number;

export type DRIVER = 'file' | 'sqlite'

export type BaseSettings = {
    name: string;
    version: SettingsVersion;
    driver: DRIVER
};