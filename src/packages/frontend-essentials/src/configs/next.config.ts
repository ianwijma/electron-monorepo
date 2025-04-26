import { platform } from 'node:os'
import type {NextConfig} from "next";

const isProduction = process.env.NODE_ENV === 'production'
const isMac = platform() === 'darwin'

const LINUX_PRODUCTION_BASE_PATH = '/usr/lib/qlippy/resources/app.asar/.webpack/renderer';
const MAC_PRODUCTION_BASE_PATH = '/Applications/qlippy-backend.app/Contents/Resources/app.asar/.webpack/renderer';
const PRODUCTION_BASE_PATH = isMac ? MAC_PRODUCTION_BASE_PATH : LINUX_PRODUCTION_BASE_PATH;

export const nextConfig: NextConfig = {
    /* config options here */
    output: 'export',
    basePath: isProduction ? PRODUCTION_BASE_PATH : '',
};
