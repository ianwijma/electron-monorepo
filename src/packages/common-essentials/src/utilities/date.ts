import dayjs, {Dayjs} from 'dayjs'

export const toHumanDateAgo = (dateTimestamp: number): string => {
    const date: Dayjs = dayjs(dateTimestamp);
    const now = dayjs();

    const differenceInDays = now.diff(date, 'days');
    const differenceInWeeks = now.diff(date, 'week');
    const differenceInMonths = now.diff(date, 'months');
    const differenceInYears = now.diff(date, 'years');

    const s = (text: string, count: number) => count === 1 ? text : `${text}s`;

    if (differenceInDays <= 0) {
        return 'Today';
    } else if (differenceInDays === 1) {
        return 'Yesterday';
    } else if (differenceInDays > 1 && differenceInWeeks <= 0) {
        return `${differenceInDays} ${s('day', differenceInDays)} ago`;
    } else if (differenceInWeeks > 0 && differenceInMonths <= 0) {
        return `${differenceInWeeks} ${s('week', differenceInWeeks)} ago`;
    } else if (differenceInMonths > 0 && differenceInYears <= 0) {
        return `${differenceInMonths} ${s('month', differenceInMonths)} ago`;
    } else if (differenceInYears > 0 && differenceInYears < 10) {
        return `${differenceInYears} ${s('year', differenceInYears)} ago`;
    } else {
        // More than a decade...
        return 'Wow...'
    }
}