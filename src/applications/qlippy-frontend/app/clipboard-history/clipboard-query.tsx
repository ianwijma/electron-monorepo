import {KeyboardEventHandler, memo, useCallback, useEffect, useRef, useState} from "react";
import { OpenClipboardHistoryAction } from 'qlippy-common/src/events/openClipboardHistory.event'
import {ClipboardItem} from "qlippy-common/src/settings/clipboard.settings.types";

export type ClipboardQueryParams = {
    query: string;
    updateQuery: (query: string) => void;
    typeFilter: string;
    updateTypeFilter: (query: string) => void;
    selectNext: () => void,
    selectPrevious: () => void,
    confirmSelected: () => void,
    deleteSelected: () => void,
    openSelected: (action: OpenClipboardHistoryAction) => void,
    pinSelected: () => void,
    restoreSelectedImage: () => void,
    restoreSelectedText: () => void,
    saveSelected: () => void,
    close: () => void,
    isMenuShown: boolean,
    showMenu: () => void,
    hideMenu: () => void,
    item: ClipboardItem | undefined
}

const tips = [
    'Type to filter through entries...',
    'Press up/down to navigate, Enter to restore',
    'Hold Ctrl to see available actions',
    'Each item has its own actions',
];

const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
}

export const ClipboardQuery = memo(({
                                        query,
                                        updateQuery,
                                        typeFilter,
                                        updateTypeFilter,
                                        selectNext,
                                        selectPrevious,
                                        confirmSelected,
                                        deleteSelected,
                                        openSelected,
                                        pinSelected,
                                        restoreSelectedImage,
                                        restoreSelectedText,
                                        saveSelected,
                                        close,
                                        isMenuShown,
                                        showMenu,
                                        hideMenu,
                                        item,
                                    }: ClipboardQueryParams) => {
    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback((event) => {
        if (event.ctrlKey) {
            event.preventDefault();
            showMenu();

            switch (event.code) {
                case 'Delete':
                    event.preventDefault();
                    deleteSelected();
                    break;
                case 'Backspace':
                    event.preventDefault();
                    query.length > 0 && updateQuery('');
                    break;
                case 'KeyF':
                case 'KeyI':
                    event.preventDefault();
                    openSelected('file');
                    hideMenu();
                    break;
                case 'KeyU':
                    event.preventDefault();
                    openSelected('url');
                    hideMenu();
                    break;
                case 'KeyP':
                    event.preventDefault();
                    pinSelected();
                    break;
                case 'KeyC':
                    event.preventDefault();
                    if (item?.type === 'image') {
                        restoreSelectedImage();
                    }
                    if (item?.type === 'html') {
                        restoreSelectedText();
                    }
                    break;
                case 'KeyS':
                    event.preventDefault();
                    if (item?.type === 'image') {
                        saveSelected();
                    }
                    break;
            }
        } else {
            switch (event.code) {
                case 'ArrowDown':
                    event.preventDefault();
                    selectNext();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    selectPrevious();
                    break;
                case 'Enter':
                    event.preventDefault();
                    confirmSelected();
                    break;
                case 'Escape':
                    event.preventDefault();
                    close();
                    break;
            }
        }
    }, [selectNext, selectPrevious, confirmSelected, close, deleteSelected, showMenu, hideMenu, openSelected, updateQuery, saveSelected]);
    const [currentTip] = useState(getRandomTip());

    const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = useCallback((event) => {
        if (isMenuShown && !event.ctrlKey) {
            event.preventDefault();
            hideMenu();
        }
    }, [hideMenu, isMenuShown])


    const inputRef = useRef<HTMLInputElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        const inputEl = inputRef.current;
        const selectEl = selectRef.current;

        if (!inputRef || !selectRef) return;

        type Focus = 'input' | 'select' | null;
        let currentFocus: Focus = null;
        const handleFocus = (name: Focus) => () => setTimeout(() => currentFocus = name, 10);
        const handleBlur = () => {
            currentFocus = null;

            setTimeout(() => {
                if (currentFocus === null) {
                    inputEl.focus();
                }
            }, 20);
        };

        inputEl.addEventListener('focus', handleFocus('input'));
        selectEl.addEventListener('focus', handleFocus('select'));
        inputEl.addEventListener('blur', handleBlur);
        selectEl.addEventListener('blur', handleBlur);

        setTimeout(() => {
            inputEl.focus()
        }, 50);

        return () => {
            inputEl.removeEventListener('focus', handleFocus('input'));
            selectEl.removeEventListener('focus', handleFocus('select'));
            inputEl.removeEventListener('blur', handleBlur);
            selectEl.removeEventListener('blur', handleBlur);
        }
    }, [inputRef, selectRef]);

    return (
        <div className="h-full flex gap-2 justify-between items-center">
            <input
                ref={inputRef}
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                className='not-draggable glass-input flex-1 h-full px-4 text-sm'
                placeholder={currentTip}
                suppressHydrationWarning
            />
            <select
                ref={selectRef}
                className='not-draggable glass-input w-32 h-full px-3 text-sm cursor-pointer'
                value={typeFilter}
                onChange={(e) => updateTypeFilter(e.target.value)}
            >
                <option value=''>All Types</option>
                <option value='image'>Images</option>
                <option value='html'>HTML</option>
                <option value='url'>URLs</option>
                <option value='path'>Files</option>
                <option value='colour'>Colours</option>
                <option value='text'>Text</option>
            </select>
        </div>
    )
})
