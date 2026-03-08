'use client'

import {useSearchParams} from "next/navigation";
import {useButtonClick} from "../../../hooks/useButtonClick";

export const DialogContent = () => {
    const {emitButtonClick} = useButtonClick();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    const handleCancel = () => emitButtonClick('cancel');
    const handleConfirm = () => emitButtonClick(`confirm`, {confirmed: true});

    return (
        <div className='floating-panel p-6 w-[400px] max-w-[90vw] animate-scale-in'>
            <p className='text-text-primary text-center mb-6'>
                {message}
            </p>
            <div className='flex gap-3 justify-center'>
                <button 
                    onClick={handleCancel}
                    className='glass-button'
                >
                    Cancel
                </button>
                <button 
                    onClick={handleConfirm}
                    className='glass-button glass-button-tinted'
                >
                    Confirm
                </button>
            </div>
        </div>
    )
}
