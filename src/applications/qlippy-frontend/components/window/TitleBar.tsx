import {useWindowControls} from "frontend-essentials/src/hooks/useWindowControls";
import {PropsWithChildren} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faWindowMinimize, faXmark} from "@fortawesome/free-solid-svg-icons";
import {defaultLogo} from 'qlippy-common/src/logos'

type TitleBarButtonProps = PropsWithChildren & {
    onClick?: () => void;
    variant?: 'close' | 'minimize';
}

const TitleBarButton = ({children, onClick, variant = 'minimize'}: TitleBarButtonProps) => {
    const closeStyles = variant === 'close' 
        ? 'hover:bg-tint-red hover:text-white' 
        : 'hover:bg-surface-secondary';
    
    return <button
        onClick={onClick}
        className={`not-draggable glass-capsule w-7 h-7 flex justify-center items-center text-text-secondary transition-all duration-fast ${closeStyles}`}
    >
        {children}
    </button>
}

type TitleBarProps = PropsWithChildren & {
    showMinimize?: boolean;
    showClose?: boolean;
    onMinimizeClicked?: () => void;
    onCloseClicked?: () => void;
}

export const TitleBar = ({
                             children,
                             showMinimize = true,
                             showClose = true,
                             onMinimizeClicked,
                             onCloseClicked
                         }: TitleBarProps) => {
    const {minimize, close} = useWindowControls();

    onMinimizeClicked ??= minimize;
    onCloseClicked ??= close;

    return <div className='draggable glass-titlebar flex justify-between items-center text-text-secondary px-3 py-2'>
        <div className='flex items-center gap-2'>
            <img src={defaultLogo} alt='logo' className='w-5 h-5 opacity-90' draggable={false}/>
            <span className='max-w-1/2 font-medium text-sm flex overflow-ellipsis overflow-hidden whitespace-nowrap'>
                {children}
            </span>
        </div>
        <div className='flex gap-2'>
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
}
