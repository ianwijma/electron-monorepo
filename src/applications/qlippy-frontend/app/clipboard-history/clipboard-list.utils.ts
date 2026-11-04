import type {SearchableGroupedHistory, SearchableHistory} from "./page";

/**
 * Every list item is a "glass" card with a backdrop-filter, which is expensive to paint.
 * Rendering the full history (up to 10k items) at once freezes the renderer and leaves the
 * window blank, so we only render a window of items and grow it as the user scrolls / navigates.
 */
export const RENDER_BATCH_SIZE = 100;

export type RenderableGroup = {
    group: string,
    items: SearchableHistory[],
    // Flat index (across all groups) of the first item in this group, used for selection.
    startIndex: number,
}

export type RenderableGroups = {
    groups: RenderableGroup[],
    totalCount: number,
    renderedCount: number,
}

/**
 * Flattens the grouped history into the groups that fit within `renderLimit` items,
 * keeping the flat item indexes stable so selection keeps working for hidden items.
 */
export const toRenderableGroups = (history: SearchableGroupedHistory, renderLimit: number): RenderableGroups => {
    let totalCount = 0;
    let renderedCount = 0;
    const groups: RenderableGroup[] = [];

    Object.keys(history).forEach((group) => {
        const items = history[group] ?? [];
        const startIndex = totalCount;
        totalCount += items.length;

        const remaining = Math.max(renderLimit - renderedCount, 0);
        if (remaining === 0 && items.length > 0) return;

        const visibleItems = items.slice(0, remaining);
        renderedCount += visibleItems.length;

        groups.push({group, items: visibleItems, startIndex});
    });

    return {groups, totalCount, renderedCount};
}
