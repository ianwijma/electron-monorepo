import "zx/globals"
import concurrently from "concurrently";
import {readPackageJsonKey, safeRun, setupProject, writePackageJsonWithRestore} from './utils.mjs'

await safeRun(async ({ addRevert }) => {
    const {app} = argv;

    const {BACKEND_DIR, FRONTEND_DIR, BACKEND_PACKAGE_JSON} = await setupProject(app);

    const currentProductName = await readPackageJsonKey(BACKEND_PACKAGE_JSON,'productName');
    const restoreProductName = await writePackageJsonWithRestore(BACKEND_PACKAGE_JSON, 'productName', `${currentProductName}-dev`);
    addRevert(restoreProductName);

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
})