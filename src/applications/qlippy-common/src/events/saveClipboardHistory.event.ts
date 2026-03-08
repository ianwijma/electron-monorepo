import {ClipboardId} from "../settings/clipboard.settings.types";

export const saveClipboardHistoryEventName = 'saveClipboardHistory';

export type SaveClipboardHistoryEventData = {
    id: ClipboardId;
};
