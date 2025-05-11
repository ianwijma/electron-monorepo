import React, {PropsWithChildren} from 'react';
import {useWindowControls} from "../../../hooks/useWindowControls";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faWindowMinimize, faExpand, faXmark} from "@fortawesome/free-solid-svg-icons";

export type BaseTitlebarProps = {
    logo: string;
    title: string;
    showClose?: boolean;
    onCloseClicked?: () => void;
    showMinimize?: boolean;
    onMinimizeClicked?: () => void;
    showMaximize?: boolean;
    onMaximizeClicked?: () => void;
    color?: string;
}

export const BaseTitlebar = ({
                                 logo,
                                 title,
                                 showClose = true,
                                 onCloseClicked,
                                 showMinimize = true,
                                 onMinimizeClicked,
                                 showMaximize = true,
                                 onMaximizeClicked,
                                 color
                             }: BaseTitlebarProps) => {
    const {minimize, close, maximize} = useWindowControls();

    onMaximizeClicked ??= maximize;
    onMinimizeClicked ??= minimize;
    onCloseClicked ??= close;

    return (
        <div className='draggable flex justify-between px-1 py-1' style={{backgroundColor: color}}>
            <div className='flex items-center gap-1'>
                <img src={logo} alt='logo' className='w-5 h-5'/>
                <span className='max-w-1/2 flex overflow-ellipsis overflow-hidden whitespace-nowrap'>
                    {title}
                </span>
            </div>
            <div className='flex gap-2'>
                {
                    showMaximize && (
                        <TitleBarButton onClick={onMaximizeClicked}>
                            <FontAwesomeIcon icon={faExpand} size='xs'/>
                        </TitleBarButton>
                    )
                }
                {
                    showMinimize && (
                        <TitleBarButton onClick={onMinimizeClicked}>
                            <FontAwesomeIcon icon={faWindowMinimize} size='xs'/>
                        </TitleBarButton>
                    )
                }
                {
                    showClose && (
                        <TitleBarButton onClick={onCloseClicked}>
                            <FontAwesomeIcon icon={faXmark} size='sm'/>
                        </TitleBarButton>
                    )
                }
            </div>
        </div>
    )
}

type TitleBarButtonProps = PropsWithChildren & {
    onClick?: () => void;
}

const TitleBarButton = ({children, onClick}: TitleBarButtonProps) => {
    return <button
        onClick={onClick}
        className='not-draggable w-6 h-6 rounded-full flex justify-center items-center'>
        {children}
    </button>
}
