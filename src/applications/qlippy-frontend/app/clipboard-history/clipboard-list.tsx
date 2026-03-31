'use client';

import {
    ClipboardItem,
} from "qlippy-common/src/settings/clipboard.settings.types";
import {useEffect, useRef} from "react";
import {SearchableGroupedHistory} from "./page";

export type ClipboardListParams = {
    history: SearchableGroupedHistory,
    selectedIndex: number,
    onItemClicked: (index: number) => void,
    onItemDoubleClick: (index: number) => void,
}

export const ClipboardList = ({ history, selectedIndex, onItemClicked, onItemDoubleClick }: ClipboardListParams) => {
    const selectedRef = useRef<HTMLLIElement>(null);
    const indexRef = useRef<number>(0);

    useEffect(() => {
        const selectedEl = selectedRef.current;

        if (!selectedEl) return;

        selectedEl.scrollIntoView({block: 'nearest'});
    }, [selectedRef, selectedIndex]);

    indexRef.current = 0

    return (
        <ul className='flex flex-col gap-2 p-2'>
            {
                Object.keys(history).map((group, index  ) => {
                    const items = history[group] ?? [];

                    return (
                        <li
                            key={group}
                            className='flex flex-col gap-2 justify-center items-center'
                            style={{zIndex: index}}
                        >
                            <span
                                className='group-header sticky top-2 z-10'
                            >
                                {group}
                            </span>

                            <ul className='w-full flex flex-col gap-1'>
                                {
                                    items.map(({item}) => {
                                        const {id} = item;
                                        const currentIndex = indexRef.current++;
                                        const isSelected = selectedIndex === currentIndex;

                                        return (
                                            <li
                                                key={id}
                                                className={`glass-card px-3 py-2 text-text-primary flex items-center cursor-pointer transition-all duration-fast ${isSelected ? 'glass-card-selected' : ''}`}
                                                ref={isSelected ? selectedRef : null}
                                                onClick={() => onItemClicked(currentIndex)}
                                                onDoubleClick={() => onItemDoubleClick(currentIndex)}
                                            >
                                                <ClipboardListItem item={item}/>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </li>
                    )
                })
            }
        </ul>
    )
}

type ClipboardListItemParams = {
    item: ClipboardItem,
}

const ClipboardListItem = ({item}: ClipboardListItemParams) => {
    const {type} = item;

    switch (type) {
        case 'text': {
            const {text} = item;
            return (
                <div className="truncate text-sm" data-text>
                    {text}
                </div>
            )
        }
        case 'html': {
            const {htmlText} = item;
            return (
                <div className="truncate text-sm" data-html>
                    {htmlText}
                </div>
            )
        }
        case 'url': {
            const {url} = item;
            return (
                <div className='truncate text-sm text-tint-blue' data-url>
                    {url}
                </div>
            )
        }
        case 'path': {
            const {path} = item;
            return (
                <div className='truncate text-sm' data-path>
                    {path}
                </div>
            )
        }
        case 'colour': {
            const {colour, colourText} = item;
            return (
                <div className='truncate text-sm flex items-center gap-2' data-colour>
                    <span style={{ backgroundColor: colour }} className="w-5 h-5 rounded-md shadow-sm" /> 
                    <span>{colourText}</span>
                </div>
            )
        }
        case 'image': {
            const {imageFilePath} = item;
            return (
                <div className='truncate text-sm flex items-center gap-2 h-full' data-image>
                    <span className="text-text-secondary">Image:</span>
                    {
                        imageFilePath
                            ? <img className='h-8 rounded-md shadow-sm' src={`app://${imageFilePath}`} alt='Clipboard image content' draggable={false} />
                            : ''
                    }
                </div>
            )
        }
    }
}
