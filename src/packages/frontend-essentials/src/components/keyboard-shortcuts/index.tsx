import {useEffect, useState} from "react";
import {KeyToAcceleratorMap} from "./map";

type Settings = {
    key: string;
    shift: string;
    ctrl: string;
    alt: string;
    meta: string;
}

const toAccelerate = (settings: Settings): string => {
    const {key, shift, ctrl, alt, meta} = settings;

    return [
        shift || null,
        ctrl || null,
        alt || null,
        meta || null,
        key || null,
    ].filter(Boolean).join('+');
}

let globalTrackingLock = false;

export type KeyboardShortcutsProps = { onShortcutChanged: (accelerator: string) => void };

export const KeyboardShortcuts = ({onShortcutChanged}: KeyboardShortcutsProps) => {
    const [localTrackingLock, setLocalTrackingLock] = useState(false);

    const defaultSettings: Settings = {key: '', shift: '', ctrl: '', alt: '', meta: ''};
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    const handleKeyDown = (event: KeyboardEvent) => {
        event.preventDefault();

        const {code, shiftKey, ctrlKey, altKey, metaKey} = event;

        setSettings({
            key: KeyToAcceleratorMap[code] ?? '',
            shift: shiftKey ? 'Shift' : '',
            ctrl: ctrlKey ? 'CommandOrControl' : '',
            alt: altKey ? 'Alt' : '',
            meta: metaKey ? 'Super' : '',
        });
    };

    useEffect(() => {
        if (localTrackingLock) {
            window.addEventListener('keydown', handleKeyDown);
        } else {
            window.removeEventListener('keydown', handleKeyDown);
            onShortcutChanged(toAccelerate(settings));
        }

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [localTrackingLock]);

    // componentWillUnmount
    useEffect(() => () => {
        globalTrackingLock = false
    }, []);

    const onTrackingClicked = () => {
        if (!localTrackingLock && !globalTrackingLock) {
            setLocalTrackingLock(true);
            globalTrackingLock = true
        } else if (localTrackingLock) {
            setLocalTrackingLock(false);
            globalTrackingLock = false;
        }
    }

    const shortcut = toAccelerate(settings);

    return (
        <button onClick={onTrackingClicked}>
            {localTrackingLock ? `<${shortcut ? shortcut : 'Press to register'}>` : shortcut ? shortcut : '// Nothing'}
        </button>
    )
}