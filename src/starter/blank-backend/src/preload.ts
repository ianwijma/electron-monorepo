const {contextBridge, webUtils} = require('electron/renderer');

import 'backend-essentials/src/utilities/preload';

/**
 * This file provides generic functionality to all the windows.
 */

contextBridge.exposeInMainWorld('filesApi', {
    getPathForFile: (file: File) => webUtils.getPathForFile(file)
})