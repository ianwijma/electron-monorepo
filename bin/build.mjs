import 'zx/globals'
import {
    fsExists,
    readPackageJsonKey,
    setupProject,
    writePackageJsonWithRestore
} from "./utils.mjs";

let restore;

try {
    const {app, quick} = argv;

    const {BACKEND_DIR, FRONTEND_DIR, BACKEND_PACKAGE_JSON} = await setupProject(app);

    // Getting the commit hash
    const {stdout} = await $`git rev-parse HEAD`;
    const commitHash = stdout.trim();

    // Add hash to the version in the backend package json file.
    const currentVersion = await readPackageJsonKey(BACKEND_PACKAGE_JSON,'version');
    restore = await writePackageJsonWithRestore(BACKEND_PACKAGE_JSON, 'version', `${currentVersion}.${commitHash}`);

    echo`~~~ Cleaning up previous build files...`
    await Promise.allSettled([
        $`rm -r ${BACKEND_DIR}/.webpack`,
        $`rm -r ${BACKEND_DIR}/out`,
        $`rm -r ${FRONTEND_DIR}/.next`,
        $`rm -r ${FRONTEND_DIR}/out`,
    ])

    if (quick) {
        echo`~~~ Build frontend quickly...`
        await $`lerna run build-quick --scope=${app}-frontend`
    } else {
        echo`~~~ Build frontend...`
        await $`lerna run build --scope=${app}-frontend`
    }

    // Ensure the frontend build ends up in the backend build output folder.
    const feInterval = setInterval(async () => {
        const frontendIsPresent = await fsExists(`${BACKEND_DIR}/.webpack/renderer/`)
        if (!frontendIsPresent) {
            echo`~~~ Copy compiled frontend packages into the backend renderer build folder...`
            await $`mkdir -p ${BACKEND_DIR}/.webpack/renderer/`
            await $`cp -r ${FRONTEND_DIR}/out/* ${BACKEND_DIR}/.webpack/renderer/`;
        }
    }, 100)

    echo`~~~ Build backend...`
    await $`lerna run build --scope=${app}-backend`;

    clearInterval(feInterval);

 } catch (_) {
    // eh...
} finally {
    await restore();
}