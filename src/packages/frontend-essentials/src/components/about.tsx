import Head from "next/head";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";
import {useWindowControls} from "../hooks/useWindowControls";

export type AboutWindowProps = {
    applicationName: string,
    version: string,
}

export const AboutWindow = ({ applicationName, version }: AboutWindowProps) => {
    const {close} = useWindowControls();

    return (
        <div className='pointer-events-none draggable w-screen h-screen flex flex-col overflow-hidden glass-regular rounded-2xl animate-fade-in'>
            <Head>
                <title>{applicationName}</title>
            </Head>

            <button
                onClick={close}
                className="not-draggable pointer-events-auto glass-capsule w-8 h-8 flex justify-center items-center absolute top-3 right-3 text-text-secondary hover:text-tint-red hover:bg-surface-secondary transition-all duration-fast">
                <FontAwesomeIcon icon={faXmark} size='sm'/>
            </button>

            <div className='flex-1 flex flex-col justify-center items-center gap-4'>
                <div className='text-center'>
                    <h1 className='text-2xl font-bold text-text-primary'>{applicationName}</h1>
                    <div className='glass-capsule px-4 py-2 mt-4'>
                        <span className='text-text-secondary text-sm'>Version </span>
                        <span className='text-text-primary text-sm font-medium not-draggable pointer-events-auto'>{version}</span>
                    </div>
                </div>
            </div>

            <div className='text-xs w-full text-center pb-4 text-text-tertiary'>
                Developed with ❤️ by <a className='not-draggable pointer-events-auto text-tint-blue hover:underline' href='https://ian.wij.ma/' target='_blank'>Ian Wijma</a>
            </div>
        </div>
    );
}
