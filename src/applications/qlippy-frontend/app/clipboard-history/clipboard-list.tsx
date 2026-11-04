'use client';

import {
    ClipboardItem,
} from "qlippy-common/src/settings/clipboard.settings.types";
import {useEffect, useMemo, useRef, useState} from "react";
import {SearchableGroupedHistory} from "./page";
import {RENDER_BATCH_SIZE, toRenderableGroups} from "./clipboard-list.utils";

export type ClipboardListParams = {
    history: SearchableGroupedHistory,
    selectedIndex: number,
    onItemClicked: (index: number) => void,
    onItemDoubleClick: (index: number) => void,
}

export const ClipboardList = ({ history, selectedIndex, onItemClicked, onItemDoubleClick }: ClipboardListParams) => {
    const selectedRef = useRef<HTMLLIElement>(null);
    const sentinelRef = useRef<HTMLLIElement>(null);
    const [renderLimit, setRenderLimit] = useState<number>(RENDER_BATCH_SIZE);

    // Keep the keyboard-selected item renderable, even when it lies beyond the current window.
    useEffect(() => {
        if (selectedIndex >= renderLimit) {
            setRenderLimit(selectedIndex + RENDER_BATCH_SIZE);
        }
    }, [selectedIndex, renderLimit]);

    const {groups, totalCount, renderedCount} = useMemo(
        () => toRenderableGroups(history, renderLimit),
        [history, renderLimit]
    );
    const hasMore = renderedCount < totalCount;

    useEffect(() => {
        const selectedEl = selectedRef.current;

        if (!selectedEl) return;

        selectedEl.scrollIntoView({block: 'nearest'});
    }, [selectedRef, selectedIndex, renderedCount]);

    // Grow the rendered window once the user scrolls to the end of it.
    useEffect(() => {
        const sentinelEl = sentinelRef.current;

        if (!sentinelEl || !hasMore || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver((entries) => {
            if (entries.some(({isIntersecting}) => isIntersecting)) {
                setRenderLimit((limit) => limit + RENDER_BATCH_SIZE);
            }
        });

        observer.observe(sentinelEl);

        return () => observer.disconnect();
    }, [hasMore, renderedCount]);

    return (
        <ul className='flex flex-col gap-2 p-2'>
            {
                groups.map(({group, items, startIndex}, index) => {
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
                                    items.map(({item}, itemIndex) => {
                                        const {id} = item;
                                        const currentIndex = startIndex + itemIndex;
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
            {
                hasMore
                    ? (
                        <li ref={sentinelRef} className='text-text-tertiary text-xs text-center py-2'>
                            Showing {renderedCount} of {totalCount} items
                        </li>
                    )
                    : null
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
