import {confirmDialog} from "../windows/dialog.window";
import {clipboardManager} from "../clipboard/manager";
import {settingsManager} from "backend-essentials/src/settings/settingsManager";

export const resetAllSettings = async () => {
    const {confirmed} = await confirmDialog.open({
        title: 'Reset all settings',
        message: 'Are you sure you want to reset all settings?',
    })

    if (confirmed) {
        await settingsManager.reset()
        await clipboardManager.removeAll();
    }
}