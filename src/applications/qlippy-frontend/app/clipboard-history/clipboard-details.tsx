import {ClipboardItem} from "qlippy-common/src/settings/clipboard.settings.types";
import {memo} from "react";
import {HtmlFrame} from "../../components/htmlFrame";

export type ClipboardDetailsParams = { item: ClipboardItem | undefined };
export const ClipboardDetails = memo(({item}: ClipboardDetailsParams) => {
    if (!item) return (
        <div className='h-full flex items-center justify-center text-text-tertiary text-sm'>
            Select an item to view details
        </div>
    );

    return (
        <div className='h-full not-draggable overflow-hidden flex flex-col gap-3 p-2'>
            <div className='flex-1 overflow-auto glass-card p-3'>
                <Details item={item} />
            </div>
            <div className='flex-1 overflow-auto glass-card p-3'>
                <Metadata item={item} />
            </div>
        </div>
    )
})

const getMetadataFromType = (item: ClipboardItem) => {
    const {type, dateTimeCopied, pinned} = item;

    const toDate = (dateMs: number): string => {
        const date = new Date(dateMs);

        return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
    }

    const toDifference = (from: number, to: number): string | undefined => {
        if (from && to) {
            return `${to-from}ms`
        }

        return undefined;
    }

    function humanFileSize(bytes: number, useMetrics: boolean = false, rounding: number = 1) {
        const thresh = useMetrics ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        const units = useMetrics
            ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10 ** rounding;

        do {
            bytes /= thresh;
            ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


        return bytes.toFixed(rounding) + ' ' + units[u];
    }

    const baseData = {
        'Copied': toDate(dateTimeCopied),
        'Pinned': pinned ? 'Yes' : 'No',
    }

    switch (type) {
        case 'text':
            return {
                'Type': 'text',
                "Total characters": String(item.length),
                ...baseData,
            };
        case 'html':
            return {
                'Type': 'HTML',
                "Total characters": String(item.length),
                "Text": item.htmlText,
                "Text total characters": String(item.htmlTextLength),
                ...baseData,
            };
        case 'url':
            return {
                'Type': 'URL',
                "URL Length": String(item.length),
                "URL username": item.username,
                "URL password": item.password,
                "URL protocol": item.protocol,
                "Url hostname": item.hostname,
                "Url path": item.pathname,
                "Url hash": item.hash,
                "Url query": item.searchParams,
                "Screenshot size": Number.isInteger(item.size) ? humanFileSize(item.size) : undefined,
                "Screenshot duration": toDifference(item.screenshotStart, item.screenshotEnd),
                'Screenshot width': Number.isInteger(item.screenshotWidth) ? String(item.screenshotWidth) : undefined,
                'Screenshot height': Number.isInteger(item.screenshotHeight) ? String(item.screenshotHeight) : undefined,
                ...baseData,
            };
        case 'path': {
            const defaultFirstData = {
                'Type': 'File path',
                "Path": item.path,
                "Path length": String(item.length),
                ...baseData,
            }

            const defaultRestData = {
                "User ID": String(item.userId),
                "Group ID": String(item.groupId),
                "Date created": toDate(item.createdMs),
                "Date last accessed": toDate(item.lastAccessedMs),
                "Date last modified": toDate(item.lastModifiedMs),
                "Date status changed": toDate(item.statusChangedMs),
                ...baseData,
            }

            if (item.isFile) {
                return {
                    ...defaultFirstData,
                    'Size': Number.isInteger(item.size) ? humanFileSize(item.size) : undefined,
                    ...defaultRestData,
                    ...baseData,
                }
            }

            return {
                ...defaultFirstData,
                ...defaultRestData,
                ...baseData,
            };
        }
        case 'colour':
            return {
                'Type': 'Colour',
                'Colour': String(item.colour),
                ...baseData,
            };
        case 'image':
            return {
                'Type': 'Image',
                'Image size': Number.isInteger(item.size) ? humanFileSize(item.size) : undefined,
                'Image width': String(item.width),
                'Image height': String(item.height),
                ...baseData,
            };
        default:
            return {
                ...(item as ClipboardItem),
                ...baseData,
            };
    }
}

type MetadataProps = { item: ClipboardItem };
const Metadata = ({ item }: MetadataProps) => {
    const metadata= getMetadataFromType(item);

    return (
        <ul className='text-text-secondary text-sm space-y-2'>
            {Object.keys(metadata).map(key => {
                const value: string | any = metadata[key];

                if (!value || JSON.stringify(value) === '{}') return '';

                return (
                    <li key={key} className="flex flex-col gap-0.5">
                        <span className='font-medium text-text-primary'>{key}</span>
                        {typeof value === 'string' ? (
                            <span className='text-text-secondary pl-2'>{value}</span>
                        ) : value && (
                            <ul className='pl-2 space-y-1'>
                                {Object.keys(value).map((subKey: string) => {
                                    const subValue = value[subKey];

                                    if (!value) return '';

                                    return (
                                        <li key={subKey} className='text-text-tertiary'>
                                            <span className='font-medium'>{subKey}:</span> {subValue}
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </li>
                )
            })}
        </ul>
    )
}

type DetailsProps = { item: ClipboardItem };
const Details = ({ item }: DetailsProps) => {
    const { type } = item;

    switch (type) {
        case 'text': {
            return (
                <div className='text-text-primary text-sm whitespace-pre-wrap'>
                    {item.text}
                </div>
            )
        }
        case 'html': {
            return (
                <HtmlFrame>{item.html}</HtmlFrame>
            )
        }
        case 'url': {
            const {imageFilePath} = item;
            if (imageFilePath) {
                return (
                    <div className='w-full h-full flex items-center justify-center'>
                        <img
                            src={`app://${item.imageFilePath}`}
                            alt='Clipboard url screenshot'
                            className='max-w-full max-h-full rounded-lg shadow-md'
                            draggable={false}
                        />
                    </div>
                )
            }

            return (
                <div className='text-text-tertiary text-sm flex items-center justify-center h-full'>
                    Screenshotting the site...
                </div>
            )
        }
        case 'path': {
            return (
                <div className='text-text-primary text-sm'>
                    {item.path}
                </div>
            )
        }
        case 'colour': {
            return (
                <div className='w-full h-full flex items-center justify-center rounded-lg' style={{ backgroundColor: item.colour }}></div>
            )
        }
        case 'image': {
            const {imageFilePath} = item;
            if (imageFilePath) {
                return (
                    <div className='w-full h-full flex items-center justify-center'>
                        <img
                            src={`app://${item.imageFilePath}`}
                            alt='Clipboard image content'
                            className='max-w-full max-h-full rounded-lg shadow-md'
                            draggable="false"
                        />
                    </div>
                )
            }

            return (
                <div className='text-text-tertiary text-sm flex items-center justify-center h-full'>
                    Saving the image...
                </div>
            )
        }
        default: {
            return (
                <div className='text-text-tertiary text-sm flex items-center justify-center h-full'>
                    No preview available for {type}
                </div>
            )
        }
    }

}
