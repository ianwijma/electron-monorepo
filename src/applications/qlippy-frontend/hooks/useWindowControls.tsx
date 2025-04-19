import {eventHandler} from "frontend-essentials/src/utilities/eventHandler";
import {closeWindowEventName, type CloseWindowEventData} from 'common-essentials/src/events/closeWindow.event'
import {minimizeWindowEventName, type MinimizeWindowEventData} from 'common-essentials/src/events/minimizeWindow.event'
import {useSearchParams} from "next/navigation";

export const useWindowControls = () => {
    const searchParams = useSearchParams()

    return {
        minimize: () => {
            eventHandler.emit<MinimizeWindowEventData>(minimizeWindowEventName, {
                // windowId's are integers.
                windowId: parseInt(searchParams.get('__id'), 10)
            });
        },
        close: () => {
            eventHandler.emit<CloseWindowEventData>(closeWindowEventName, {
                // windowId's are integers.
                windowId: parseInt(searchParams.get('__id'), 10)
            });
        },
    };
}