import {useSearchParams} from "next/navigation";
import {SimpleEventBusData} from "common-essentials/src/types/eventbus.types";
import {useListen} from "src/packages/frontend-essentials/src/hooks/useEventHandler";
import {
    buttonClickedEventName,
    type ButtonClickedEventData
} from 'qlippy-common/src/events/buttonClicked.event'
import {eventHandler} from "frontend-essentials/src/utilities/eventHandler";

export const useButtonClick = () => {
    const searchParams = useSearchParams();
    const windowId = searchParams.get('__id');

    return {
        emitButtonClick: (buttonId: string, buttonData?: SimpleEventBusData) => {
            eventHandler.emit<ButtonClickedEventData>(buttonClickedEventName, {
                buttonId,
                windowId,
                buttonData,
            })
        },
        onButtonClicked: (buttonId: string, callback: (buttonData: SimpleEventBusData) => void) => {
            useListen<ButtonClickedEventData>(buttonClickedEventName, (data) => {
                const {buttonId: currentButtonId, buttonData} = data;
                if (currentButtonId === buttonId) {
                    callback(buttonData);
                }
            })
        },
        onSameWindowButtonClicked: (buttonId: string, callback: (buttonData: SimpleEventBusData) => void) => {
            useListen<ButtonClickedEventData>(buttonClickedEventName, (data) => {
                const {buttonId: currentButtonId, windowId: currentWindowId, buttonData} = data;
                if (currentWindowId === windowId && currentButtonId === buttonId) {
                    callback(buttonData);
                }
            })
        }
    }
}