import {ClipboardId} from "../settings/clipboard.settings.types";

export const restoreTextClipboardHistoryEventName = 'restoreTextClipboardHistory';

export type RestoreTextClipboardHistoryEventData = {
    id: ClipboardId;
};