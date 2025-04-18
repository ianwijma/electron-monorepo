import "zx/globals"
import * as $ from "zx"
import fs from "fs/promises";

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

    process.once("SIGINT", async () => {
        await writePackageJson(packageJsonPath, key, currentValue);
    })
}