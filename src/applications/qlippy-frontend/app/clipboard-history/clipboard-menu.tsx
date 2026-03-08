import {ClipboardItem} from "qlippy-common/src/settings/clipboard.settings.types";
import {Fragment, memo, useMemo} from "react";

const baseKeyCombos = {
    'Up': 'Highlight previous item',
    'Down': 'Highlight next item',
    'Enter': 'Restore highlighted item',
    'Escape': 'Close Qlippy',
    'Ctrl': 'Shows this menu',
    'Ctrl+Delete': 'Deletes the item',
    'Ctrl+Backspace': 'Clear search query',
}

const pinKeyCombos = {
    'Ctrl+P': 'Pin the item'
}

const unpinKeyCombos = {
    'Ctrl+P': 'Unpin the item'
}

const fileKeyCombos = {
    'Ctrl+F': 'Open the file externally',
}

const imageKeyCombos = {
    'Ctrl+I': 'Open the image externally',
    'Ctrl+S': 'Save the image to disk',
}

const urlKeyCombos = {
    'Ctrl+U': 'Open the url in the default browser',
}

const urlImageKeyCombos = {
    'Ctrl+C': 'Copy the screenshot to clipboard',
    'Ctrl+I': 'Open the screenshot externally',
}

const htmlKeyCombos = {
    'Ctrl+C': 'Copy the HTML\'s cleaned text to clipboard',
}

export type ClipboardMenuParams = {
    show: boolean,
    item: ClipboardItem | undefined,
};
export const ClipboardMenu = memo(({show, item}: ClipboardMenuParams) => {
    const keyCombos = useMemo(() => {
        if (!item) return baseKeyCombos;

        const getPinKeyCombos = () => item.pinned ? unpinKeyCombos : pinKeyCombos;

        const {type} = item;
        switch (type) {
            case 'image': {
                return {
                    ...baseKeyCombos,
                    ...getPinKeyCombos(),
                    ...imageKeyCombos,
                }
            }
            case 'path': {
                return {
                    ...baseKeyCombos,
                    ...getPinKeyCombos(),
                    ...fileKeyCombos,
                }
            }
            case 'url': {
                const {imageFilePath} = item;

                const actualUrlImageKeyCombos = !!imageFilePath ? urlImageKeyCombos : {};

                return {
                    ...baseKeyCombos,
                    ...getPinKeyCombos(),
                    ...urlKeyCombos,
                    ...actualUrlImageKeyCombos
                }
            }
            case 'html': {
                return {
                    ...baseKeyCombos,
                    ...htmlKeyCombos,
                    ...getPinKeyCombos(),
                };
            }
            default: {
                return {
                    ...baseKeyCombos,
                    ...getPinKeyCombos(),
                };
            }
        }
    }, [item]);

    return (
        <div
            className='absolute w-screen h-screen bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center transition-all duration-normal'
            style={{ opacity: show ? 100 : 0, pointerEvents: show ? 'auto' : 'none' }}
        >

            <div className='floating-panel w-[480px] max-w-[90vw] p-6 animate-scale-in'>
                <h2 className='text-lg font-semibold text-text-primary mb-4'>Keyboard Shortcuts</h2>
                <table className='w-full text-sm'>
                    <thead>
                    <tr className='border-b border-border'>
                        <th className='w-1/3 text-left pb-3 text-text-secondary font-medium'>Key</th>
                        <th className='text-left pb-3 text-text-secondary font-medium'>Description</th>
                    </tr>
                    </thead>
                    <tbody className='text-text-primary'>
                    {
                        Object.keys(keyCombos).map((key) => {
                            const description = keyCombos[key]
                            const keyArray = key.split('+');
                            return (
                                <tr key={key} className='border-b border-border-subtle last:border-0'>
                                    <td className='py-3'>
                                        <div className='flex items-center gap-1'>
                                            {keyArray.map((keyItem, index) => (
                                                <Fragment key={keyItem}>
                                                    {!!index && <span className='text-text-tertiary'>+</span>}
                                                    <kbd className='glass-capsule px-2 py-1 text-xs font-mono'>
                                                        {keyItem.toWellFormed()}
                                                    </kbd>
                                                </Fragment>
                                            ))}
                                        </div>
                                    </td>
                                    <td className='py-3 text-text-secondary'>
                                        {description}
                                    </td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </table>
            </div>

        </div>
    )
})
