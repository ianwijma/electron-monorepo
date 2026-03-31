'use client'

import {useRef} from "react";
import {useSearchParams} from "next/navigation";
import {useButtonClick} from "../../../hooks/useButtonClick";

export const PageContent = () => {
    const {emitButtonClick} = useButtonClick();
    const ref = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();
    const message = searchParams.get('message');
    const placeholder = searchParams.get('placeholder') ?? '';
    const value = searchParams.get('value') ?? '';

    const handleCancel = () => emitButtonClick('cancel');
    const handleConfirm = () => emitButtonClick('confirm', {input: ref.current?.value ?? ''});

    return (
        <div className='floating-panel p-6 w-[400px] max-w-[90vw] animate-scale-in'>
            <p className='text-text-primary text-center mb-4'>
                {message}
            </p>
            <input 
                ref={ref} 
                placeholder={placeholder} 
                className='glass-input w-full px-4 py-2 text-sm mb-6'
                defaultValue={value}
            />
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
