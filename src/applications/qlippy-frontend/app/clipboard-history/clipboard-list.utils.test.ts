import {toRenderableGroups} from "./clipboard-list.utils";
import type {SearchableGroupedHistory, SearchableHistory} from "./page";

const toItems = (group: string, amount: number): SearchableHistory[] =>
    Array.from({length: amount}, (_, index) => ({
        id: `${group}-${index}`,
        type: 'text',
        text: `${group} ${index}`,
        group,
        item: {
            id: `${group}-${index}`,
            hash: `${group}-${index}`,
            dateTimeCopied: 0,
            pinned: group === 'Pinned',
            type: 'text',
            text: `${group} ${index}`,
            length: 0,
        },
    }));

describe('toRenderableGroups', () => {
    it('renders everything when the history fits within the limit', () => {
        const history: SearchableGroupedHistory = {
            'Pinned': toItems('Pinned', 2),
            'Today': toItems('Today', 3),
        };

        const {groups, totalCount, renderedCount} = toRenderableGroups(history, 100);

        expect(totalCount).toBe(5);
        expect(renderedCount).toBe(5);
        expect(groups.map(({group, startIndex, items}) => [group, startIndex, items.length])).toEqual([
            ['Pinned', 0, 2],
            ['Today', 2, 3],
        ]);
    });

    it('cuts the list off at the limit and drops groups that start beyond it', () => {
        const history: SearchableGroupedHistory = {
            'Today': toItems('Today', 150),
            'Yesterday': toItems('Yesterday', 50),
            '2 days ago': toItems('2 days ago', 50),
        };

        const {groups, totalCount, renderedCount} = toRenderableGroups(history, 175);

        expect(totalCount).toBe(250);
        expect(renderedCount).toBe(175);
        expect(groups.map(({group, startIndex, items}) => [group, startIndex, items.length])).toEqual([
            ['Today', 0, 150],
            ['Yesterday', 150, 25],
        ]);
    });

    it('keeps flat indexes stable so a hidden selection still maps to the right item', () => {
        const history: SearchableGroupedHistory = {
            'Today': toItems('Today', 10),
            'Yesterday': toItems('Yesterday', 10),
        };

        const limited = toRenderableGroups(history, 5);
        const full = toRenderableGroups(history, 100);

        expect(limited.groups[0].startIndex).toBe(full.groups[0].startIndex);
        expect(full.groups[1].startIndex).toBe(10);
        expect(limited.renderedCount).toBe(5);
    });

    it('keeps an empty group (e.g. "Pinned" with no matches) without consuming budget', () => {
        const history: SearchableGroupedHistory = {
            'Pinned': [],
            'Today': toItems('Today', 3),
        };

        const {groups, renderedCount} = toRenderableGroups(history, 2);

        expect(renderedCount).toBe(2);
        expect(groups.map(({group, items}) => [group, items.length])).toEqual([
            ['Pinned', 0],
            ['Today', 2],
        ]);
    });
});
