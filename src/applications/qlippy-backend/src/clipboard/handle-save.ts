import {
    saveClipboardHistoryEventName,
    SaveClipboardHistoryEventData
} from "qlippy-common/src/events/saveClipboardHistory.event";
import {clipboardManager} from "./manager";
import {eventHandler} from "backend-essentials/src/utilities/eventHandler";
import {saveFileAs} from "backend-essentials/src/files/saveFileAs";
import {clipboardHistoryWindow} from "../windows/clipboard-history.window";

const createClipboardHandleSave = () => {
    return {
        initialize: async (): Promise<void> => {
            eventHandler.listen<SaveClipboardHistoryEventData>(saveClipboardHistoryEventName, async ({id}) => {
                const item = clipboardManager.getById(id);

                if (!item || item.type !== 'image' || !item.imageFilePath) {
                    return;
                }

                try {
                    await saveFileAs({
                        sourcePath: item.imageFilePath,
                        suggestedName: `clipboard-${item.id}.png`,
                        filters: [{name: 'PNG Image', extensions: ['png']}],
                        window: clipboardHistoryWindow.getWindow(),
                    });
                } catch (error) {
                    console.error('Failed to save image:', error);
                }
            });
        }
    }
}

export const clipboardHandleSave = createClipboardHandleSave();
