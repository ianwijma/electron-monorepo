import React, {CSSProperties, PropsWithChildren} from "react";
import Head from "next/head";

export type BaseContainerProps = PropsWithChildren<{
    title: string;
    titleBar: React.ReactNode;
    color?: string;
    borderColor?: string;
}>

export const BaseContainer = ({
                                  children,
                                  title,
                                  titleBar,
                                  color = '#3c3f41',
                                  borderColor = null
                              }: BaseContainerProps) => {
    const borderStyles: CSSProperties = borderColor ? {
        borderColor: borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
    } : {}
    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <div className='w-screen h-screen flex flex-col overflow-hidden'
                 style={{backgroundColor: color, ...borderStyles}}>
                {titleBar}
                <div className='flex flex-col h-full py-1 px-1 overflow-x-auto whitespace-nowrap'>
                    {children}
                </div>
            </div>
        </>
    )
}