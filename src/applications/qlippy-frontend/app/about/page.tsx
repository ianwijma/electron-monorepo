'use client';

import {version} from 'qlippy-common/version.json';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";
import {useWindowControls} from "frontend-essentials/src/hooks/useWindowControls";
import {defaultLogo} from 'qlippy-common/src/logos'
import Head from "next/head";

export default function AboutPage() {
    const {close} = useWindowControls();

    return (
        <div className='pointer-events-none draggable w-screen h-screen flex flex-col overflow-hidden glass-regular rounded-2xl animate-in'>
            <Head>
                <title>Qlippy</title>
            </Head>

            <button
                onClick={close}
                className="not-draggable pointer-events-auto glass-capsule w-8 h-8 flex justify-center items-center absolute top-3 right-3 text-text-secondary hover:text-tint-red hover:bg-surface-secondary transition-all duration-fast">
                <FontAwesomeIcon icon={faXmark} size='sm'/>
            </button>

            <div className='flex-1 flex flex-col justify-center items-center gap-4'>
                <div className='glass-card p-4 rounded-2xl'>
                    <img src={defaultLogo} alt='Qlippy Logo' className='w-20 h-20'/>
                </div>
                
                <div className='text-center'>
                    <h1 className='text-2xl font-bold text-text-primary'>Qlippy</h1>
                    <p className='text-text-secondary text-sm mt-1'>Your intelligent clipboard manager</p>
                </div>
                
                <div className='glass-capsule px-4 py-2'>
                    <span className='text-text-secondary text-sm'>Version </span>
                    <span className='text-text-primary text-sm font-medium not-draggable pointer-events-auto'>{version}</span>
                </div>
            </div>

            <div className='text-xs w-full text-center pb-4 text-text-tertiary'>
                Developed with ❤️ by <a className='not-draggable pointer-events-auto text-tint-blue hover:underline' href='https://ian.wij.ma/' target='_blank'>Ian Wijma</a>
            </div>
        </div>
    );
}
