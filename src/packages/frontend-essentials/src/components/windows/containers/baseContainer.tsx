import React, {PropsWithChildren} from "react";
import Head from "next/head";

export type BaseContainerProps = PropsWithChildren<{
    title: string;
    titleBar: React.ReactNode;
}>

export const BaseContainer = ({
                                  children,
                                  title,
                                  titleBar,
                              }: BaseContainerProps) => {
    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <div className='w-screen h-screen flex flex-col overflow-hidden glass-regular rounded-2xl shadow-glass animate-fade-in'>
                {titleBar}
                <div className='flex-1 flex flex-col overflow-x-auto whitespace-nowrap p-2'>
                    {children}
                </div>
            </div>
        </>
    )
}
