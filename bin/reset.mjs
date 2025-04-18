import 'zx/globals'
import {safeRun, setupProject} from "./utils.mjs";

await safeRun(async () => {
    const {app} = argv;

    const {PROJECT_ROOT, BACKEND_DIR, COMMON_DIR, FRONTEND_DIR} = await setupProject(app);

    echo`~~~ Cleaning up build files...`
    await Promise.allSettled([
        $`rm -r ${BACKEND_DIR}/.webpack`,
        $`rm -r ${BACKEND_DIR}/out`,
        $`rm -r ${FRONTEND_DIR}/.next`,
        $`rm -r ${FRONTEND_DIR}/out`,
    ])

    echo`~~~ Cleaning up node_modules...`
    await Promise.allSettled([
        $`rm -r ${PROJECT_ROOT}/node_modules`,
        $`rm -r ${BACKEND_DIR}/node_modules`,
        $`rm -r ${COMMON_DIR}/node_modules`,
        $`rm -r ${FRONTEND_DIR}/node_modules`,
    ])

    echo`~~~ Running NPM Install `
    await $`pnpm install`;
});
