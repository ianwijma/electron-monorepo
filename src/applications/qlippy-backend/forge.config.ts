import type {ForgeConfig} from '@electron-forge/shared-types';
import {MakerSquirrel} from '@electron-forge/maker-squirrel';
import {MakerDeb} from '@electron-forge/maker-deb';
import MakerRpm from "@electron-forge/maker-rpm";
import {AutoUnpackNativesPlugin} from '@electron-forge/plugin-auto-unpack-natives';
import {WebpackPlugin} from '@electron-forge/plugin-webpack';
import {FusesPlugin} from '@electron-forge/plugin-fuses';
import {FuseV1Options, FuseVersion} from '@electron/fuses';

import {mainConfig} from './webpack.main.config';
import {preloadConfig} from './webpack.preload.config';
import MakerDMG from "@electron-forge/maker-dmg";

const NAME = 'Qlippy';
const DESCRIPTION = 'Qlip That!';
const AUTHOR = 'Ian Wijma';

// Linux desktop icons, installed into the hicolor theme by the deb/rpm makers.
// electron-installer-common accepts a {resolution: path} map, but Forge types `icon` as a string.
const LINUX_ICONS = [16, 22, 24, 32, 48, 64, 128, 256, 512].reduce<Record<string, string>>(
    (icons, size) => ({...icons, [`${size}x${size}`]: `./assets/icons/${size}x${size}.png`}),
    {scalable: './assets/icon.svg'}
) as unknown as string;

const config: ForgeConfig = {
    packagerConfig: {
        asar: true,
        // Forge picks icon.ico (Windows) or icon.icns (macOS) from this base path.
        icon: './assets/icon',
    },
    rebuildConfig: {},
    makers: [
        new MakerDeb({
            options: {
                name: NAME,
                productName: NAME,
                description: DESCRIPTION,
                maintainer: AUTHOR,
                section: 'utils',
                icon: LINUX_ICONS,
                categories: ['Development', 'Utility']
            }
        }),
        new MakerRpm({
            options: {
                name: NAME,
                productName: NAME,
                description: DESCRIPTION,
                icon: LINUX_ICONS,
                categories: ['Development', 'Utility']
            }
        }),
        new MakerSquirrel({
            name: NAME,
            description: DESCRIPTION,
            authors: AUTHOR,
            setupIcon: './assets/icon.ico',
            certificateFile: 'todo',
            certificatePassword: 'TODO'
        }),
        new MakerDMG({
            name: NAME,
            icon: './assets/icon.icns',
        })
    ],
    plugins: [
        new AutoUnpackNativesPlugin({}),
        new WebpackPlugin({
            mainConfig,
            renderer: {
                config: preloadConfig,
                entryPoints: [
                    {
                        name: '../main',
                        preload: {
                            js: './src/preload.ts',
                        },
                    }
                ],
            },
        }),
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};

export default config;
