'use client'

import {useSearchParams} from "next/navigation";
import {useButtonClick} from "../../../hooks/useButtonClick";

export const DialogContent = () => {
    const {emitButtonClick} = useButtonClick();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    const handleConfirm = () => emitButtonClick(`confirm`);

    return (
        <div className='floating-panel p-6 w-[400px] max-w-[90vw] animate-scale-in'>
            <p className='text-text-primary text-center mb-6'>
                {message}
            </p>
            <div className='flex justify-center'>
                <button 
                    onClick={handleConfirm}
                    className='glass-button glass-button-tinted'
                >
                    Ok
                </button>
            </div>
        </div>
    )
}
