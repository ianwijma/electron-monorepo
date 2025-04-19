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

    return <div className='pointer-events-none draggable w-screen h-screen flex flex-col overflow-hidden bg-[#11baee] rounded-xl'>
        <Head>
            <title>{applicationName}</title>
        </Head>

        <button
            onClick={close}
            className="not-draggable pointer-events-auto w-6 h-6 rounded-full flex justify-center items-center bg-[#005d7b] absolute top-2 left-2">
            <FontAwesomeIcon icon={faXmark} size='sm'/>
        </button>

        <div className='w-full h-screen flex flex-col justify-center items-center'>
            <span>{applicationName}</span>
            <span>Version: <span className='not-draggable pointer-events-auto'>{version}</span></span>
        </div>

        <div className='text-sm w-full text-center pb-2 absolute bottom-2'>Developed with ❤️ by <a className='not-draggable pointer-events-auto' href='https://ian.wij.ma/' target='_blank'>Ian Wijma</a></div>
    </div>
}