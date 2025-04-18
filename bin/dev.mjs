import "zx/globals"
import concurrently from "concurrently";
import path from 'path';
import {fileURLToPath} from "url";
import {fsExists, readPackageJsonKey, writePackageJsonWithRestore} from './utils.mjs'

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const PROJECT_ROOT = path.resolve(__dirname, '..');

const {app} = argv;

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

const currentProductName = await readPackageJsonKey(BACKEND_PACKAGE_JSON,'productName');
// await writePackageJsonWithRestore(BACKEND_PACKAGE_JSON, 'productName', `${currentProductName}-dev`);

try {
    const {result} = concurrently(
        [
            {
                command: 'npm run dev',
                name: 'frontend',
                cwd: FRONTEND_DIR
            },
            {
                command: 'npm run dev',
                name: 'backend',
                cwd: BACKEND_DIR
            },
        ],
        {
            prefix: 'name',
            killOthers: ['failure'],
        },
    );

    await result;
} catch (error) {
    console.error(error);
}