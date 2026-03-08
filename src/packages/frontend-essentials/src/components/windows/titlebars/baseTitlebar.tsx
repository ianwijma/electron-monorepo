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
                             }: BaseTitlebarProps) => {
    const {minimize, close, maximize} = useWindowControls();

    onMaximizeClicked ??= maximize;
    onMinimizeClicked ??= minimize;
    onCloseClicked ??= close;

    return (
        <div className='draggable glass-titlebar flex justify-between items-center px-3 py-2'>
            <div className='flex items-center gap-2'>
                <img src={logo} alt='logo' className='w-5 h-5 opacity-90'/>
                <span className='max-w-1/2 font-medium text-sm text-text-primary flex overflow-ellipsis overflow-hidden whitespace-nowrap'>
                    {title}
                </span>
            </div>
            <div className='flex gap-2'>
                {
                    showMaximize && (
                        <TitleBarButton onClick={onMaximizeClicked} variant='maximize'>
                            <FontAwesomeIcon icon={faExpand} size='xs'/>
                        </TitleBarButton>
                    )
                }
                {
                    showMinimize && (
                        <TitleBarButton onClick={onMinimizeClicked} variant='minimize'>
                            <FontAwesomeIcon icon={faWindowMinimize} size='xs'/>
                        </TitleBarButton>
                    )
                }
                {
                    showClose && (
                        <TitleBarButton onClick={onCloseClicked} variant='close'>
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
    variant?: 'close' | 'minimize' | 'maximize';
}

const TitleBarButton = ({children, onClick, variant = 'minimize'}: TitleBarButtonProps) => {
    const variantStyles = variant === 'close' 
        ? 'hover:bg-tint-red hover:text-white' 
        : 'hover:bg-surface-secondary';
    
    return <button
        onClick={onClick}
        className={`not-draggable glass-capsule w-7 h-7 flex justify-center items-center text-text-secondary transition-all duration-fast ${variantStyles}`}
    >
        {children}
    </button>
}
