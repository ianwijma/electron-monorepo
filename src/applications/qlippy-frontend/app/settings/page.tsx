'use client';

import {KeyboardShortcuts} from 'frontend-essentials/src/components/keyboard-shortcuts'
import {KeyboardSettings} from "qlippy-common/src/settings/keyboard.settings.types";
import {useSettings} from "frontend-essentials/src/hooks/useSettings";
import {DefaultWindowContainer} from "../../components/windowContainer/DefaultWindowContainer";
import {defaultLogo} from 'qlippy-common/src/logos'
import {eventHandler} from "frontend-essentials/src/utilities/eventHandler";
import {
    exportClipboardHistoryEventName,
    ExportClipboardHistoryEventData
} from "qlippy-common/src/events/exportClipboardHistory.event";
import {
    importClipboardHistoryEventName,
    ImportClipboardHistoryEventData
} from "qlippy-common/src/events/importClipboardHistory.event";

export default function SettingsPage() {
    const {isLoading, settings, updateSettings} = useSettings<KeyboardSettings>('keyboard');

    if (isLoading) return (
        <DefaultWindowContainer title='Qlippy Settings' className='glass-regular p-6'>
            <div className='flex items-center justify-center h-full'>
                <div className='text-text-secondary'>Loading...</div>
            </div>
        </DefaultWindowContainer>
    );

    const {shortcuts} = settings;

    const activateShortcut = Object.values(shortcuts).filter(({target}) => target === 'window')[0] ?? undefined;

    if (!activateShortcut) {
        return (
            <DefaultWindowContainer title='Qlippy Settings' className='glass-regular p-6'>
                <div className='flex items-center justify-center h-full'>
                    <div className='text-tint-red'>Unable to find activate shortcut</div>
                </div>
            </DefaultWindowContainer>
        );
    }

    const onActivatorChanged = (activator: string) => {
        const {[activateShortcut.shortcut]: _, ...otherShortcut} = shortcuts;

        updateSettings({
            ...settings,
            shortcuts: {
                ...otherShortcut,
                [activator]: {
                    ...activateShortcut,
                    shortcut: activator
                }
            }
        })
    }

    const handleExport = () => {
        eventHandler.emit<ExportClipboardHistoryEventData>(exportClipboardHistoryEventName, {});
    }

    const handleImport = () => {
        eventHandler.emit<ImportClipboardHistoryEventData>(importClipboardHistoryEventName, {});
    }

    return (
        <DefaultWindowContainer title='Qlippy Settings' className='glass-regular animate-fade-in'>
            <div className='h-full p-6 flex flex-col gap-6'>
                <div className='flex items-center gap-3'>
                    <img src={defaultLogo} alt='logo' className='w-10 h-10 rounded-xl'/>
                    <div>
                        <h1 className='text-xl font-semibold text-text-primary'>Qlippy Settings</h1>
                        <p className='text-sm text-text-secondary'>Customize your clipboard experience</p>
                    </div>
                </div>

                <div className='section-divider'/>

                <div className='glass-card p-4'>
                    <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-text-primary'>
                            Activation Shortcut
                        </label>
                        <p className='text-xs text-text-secondary'>
                            Press this key combination to open the clipboard history
                        </p>
                        <div className='mt-2'>
                            <KeyboardShortcuts onShortcutChanged={onActivatorChanged} accelerate={activateShortcut.shortcut}/>
                        </div>
                    </div>
                </div>

                <div className='glass-card p-4'>
                    <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-text-primary'>
                            Export / Import
                        </label>
                        <p className='text-xs text-text-secondary'>
                            Save your clipboard history to a file or restore it on another machine.
                        </p>
                        <div className='mt-2 flex gap-3'>
                            <button
                                onClick={handleExport}
                                className='px-4 py-2 text-sm font-medium text-text-primary bg-surface-secondary hover:bg-surface-tertiary rounded-lg transition-colors'
                            >
                                Export Clipboard
                            </button>
                            <button
                                onClick={handleImport}
                                className='px-4 py-2 text-sm font-medium text-text-primary bg-surface-secondary hover:bg-surface-tertiary rounded-lg transition-colors'
                            >
                                Import Clipboard
                            </button>
                        </div>
                    </div>
                </div>

                <div className='mt-auto pt-4 border-t border-border-subtle'>
                    <p className='text-xs text-text-tertiary text-center'>
                        Qlippy - Your intelligent clipboard manager
                    </p>
                </div>
            </div>
        </DefaultWindowContainer>
    );
}
