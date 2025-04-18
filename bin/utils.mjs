import "zx/globals"
import * as $ from "zx"
import fs from "fs/promises";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * @param packageJsonPath {string}
 * @param key {string}
 * @returns {Promise<string|undefined>}
 */
export const readPackageJsonKey = async (packageJsonPath, key) => {
    const packageJson = await $.fs.readJSON(packageJsonPath);

    return packageJson?.[key];
}

/**
 * @param packageJsonPath {string}
 * @param key {string}
 * @param value {string|undefined}
 * @returns {Promise<void>}
 */
export const writePackageJson = async (packageJsonPath, key, value) => {
    const packageJson = await $.fs.readJSON(packageJsonPath);

    if (!!value) {
        packageJson[key] = value;
    } else {
        delete packageJson[key];
    }

    $.fs.writeJson(packageJsonPath, packageJson, {spaces: 2});
}

/**
 * @param path {string}
 * @returns {Promise<boolean>}
 */
export const fsExists = async (path) => {
    try {
        await fs.stat(path);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * @param packageJsonPath {string}
 * @param key {string}
 * @param value {string|undefined}
 * @returns {Promise<void>}
 */
export const writePackageJsonWithRestore = async (packageJsonPath, key, value) => {
    const currentValue = await readPackageJsonKey(packageJsonPath, key);

    await writePackageJson(packageJsonPath, key, value);

    const restore = async () => {
        await writePackageJson(packageJsonPath, key, currentValue);
    }

    process.once("SIGINT", restore);

    return restore
}


export const setupProject = async (app) => {
    const BACKEND_DIR = path.join(PROJECT_ROOT, 'src', 'applications', `${app}-backend`);
    const COMMON_DIR = path.join(PROJECT_ROOT, 'src', 'applications', `${app}-common`);
    const FRONTEND_DIR = path.join(PROJECT_ROOT, 'src', 'applications', `${app}-frontend`);
    const APP_DIRS = [BACKEND_DIR, COMMON_DIR, FRONTEND_DIR];

    for (const dir of APP_DIRS) {
        const dirExists = await fsExists(dir);
        if (!dirExists) {
            throw new Error(`App does not seem to exists, dir not found: ${dir}`);
        }
    }

    const BACKEND_PACKAGE_JSON = path.join(BACKEND_DIR, 'package.json');
    const COMMON_PACKAGE_JSON = path.join(COMMON_DIR, 'package.json');
    const FRONTEND_PACKAGE_JSON = path.join(FRONTEND_DIR, 'package.json');

    return {
        BACKEND_DIR, FRONTEND_DIR, COMMON_DIR,
        BACKEND_PACKAGE_JSON, COMMON_PACKAGE_JSON, FRONTEND_PACKAGE_JSON
    }
}

/**
 * @callback AddRevertCallback
 * @return {void|Promise<void>}
 */

/**
 * @callback AddRevert
 * @param {AddRevertCallback} callback
 * @return {void}
 */

/**
 * @typedef AddRevertProps
 * @type {object}
 * @property {AddRevert} addRevert
 * @returns {Promise<void>}
 */

/**
 * @callback SafeFunction
 * @param {AddRevertProps}
 */

/**
 * @param functionToRunSafely {SafeFunction}
 * @returns {Promise<void>}
 */
export const safeRun = async (functionToRunSafely) => {
    const reverts = [];

    /**
     * @param callback {function}
     * @returns {void}
     */
    const addRevert = (callback) => { reverts.push(callback) };

    try {
        await functionToRunSafely({ addRevert })
    } finally {
        for (const revert of reverts) {
            await revert();
        }
    }
}