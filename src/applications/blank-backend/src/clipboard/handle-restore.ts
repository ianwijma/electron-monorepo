import {
    restoreClipboardHistoryEventName, RestoreClipboardHistoryEventData
} from "qlippy-common/src/events/restoreClipboardHistory.event";
import {
    restoreImageClipboardHistoryEventName, RestoreImageClipboardHistoryEventData
} from "qlippy-common/src/events/restoreImageClipboardHistory.event";
import {
    restoreTextClipboardHistoryEventName, RestoreTextClipboardHistoryEventData
} from "qlippy-common/src/events/restoreTextClipboardHistory.event";
import {clipboardManager} from "./manager";
import {eventHandler} from "backend-essentials/src/utilities/eventHandler";

const createClipboardHandleRestore = () => {
    return {
        initialize: async (): Promise<void> => {
            eventHandler.listen<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, async ({id}) => {
                const item = clipboardManager.getById(id);
                if (item) {
                    await clipboardManager.restore(item);
                }
            });

            eventHandler.listen<RestoreImageClipboardHistoryEventData>(restoreImageClipboardHistoryEventName, async ({id}) => {
                const item = clipboardManager.getById(id);
                if (item && 'imageFilePath' in item && !!item.imageFilePath) {
                    await clipboardManager.restoreImage(item.imageFilePath);
                }
            });

            eventHandler.listen<RestoreTextClipboardHistoryEventData>(restoreTextClipboardHistoryEventName, async ({id}) => {
                const item = clipboardManager.getById(id);
                if (item && 'htmlText' in item && !!item.htmlText) {
                    clipboardManager.restoreText(item.htmlText);
                }
            });
        }
    }
}

export const clipboardHandleRestore = createClipboardHandleRestore()