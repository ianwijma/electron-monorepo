import {useEffect, useState} from "react";
import {AcceleratorToKeyMap, KeyToAcceleratorMap} from "./map";

const defaultSettings: Settings = {key: '', shift: '', ctrl: '', alt: '', meta: ''};

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

const fromAccelerate = (accelerate: string): Settings => {
    const split = accelerate.split('+').map(s => s.trim());

    return split.reduce<Settings>((acc, key) => {
        switch (key) {
            case 'Shift':
                acc.shift = key;
                break;
            case 'CommandOrControl':
                acc.ctrl = key;
                break;
            case 'Alt':
                acc.alt = key;
                break;
            case 'Super':
                acc.meta = key;
                break;
            default: {
                if (key in AcceleratorToKeyMap) {
                    acc.key = AcceleratorToKeyMap[key];
                }
                break;
            }
        }

        return acc;
    }, {...defaultSettings});
}

let globalTrackingLock = false;

export type KeyboardShortcutsProps = {
    onShortcutChanged: (accelerator: string) => void;
    accelerate: string;
};

export const KeyboardShortcuts = ({accelerate, onShortcutChanged}: KeyboardShortcutsProps) => {
    const [localTrackingLock, setLocalTrackingLock] = useState(false);

    const [settings, setSettings] = useState<Settings>(fromAccelerate(accelerate));

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

    const onResetClicked = () => {
        setSettings(defaultSettings);

        onShortcutChanged(toAccelerate(defaultSettings));
    }

    const onCancelClicked = () => {
    }

    const shortcut = toAccelerate(settings);

    if (localTrackingLock) {
        return (
            <div className="flex gap-2">
                <span>{shortcut ? shortcut : 'Press keys to set shortcuts'}</span>
                <button onClick={onTrackingClicked}>Click to confirm</button>
                <button onClick={onCancelClicked}>Click to cancel</button>
            </div>
        )
    }

    if (shortcut === '') {
        return <button className='border border-transparent' onClick={onTrackingClicked}>
            Click to set shortcut
        </button>
    }

    return (
        <div className="flex gap-2">
            <span>{shortcut}</span>
            <button onClick={onTrackingClicked}>Click to edit</button>
            <button onClick={onResetClicked}>Click to reset</button>
        </div>
    )
}