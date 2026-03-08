'use client';

import {useSearchParams} from "next/navigation";
import {DefaultWindowContainer} from "../../../components/windowContainer/DefaultWindowContainer";
import {PageContent} from "./PageContent";


export default function DialogMessagePage() {
    const searchParams = useSearchParams();
    const title = searchParams.get('title');

    return (
        <DefaultWindowContainer title={title} showMinimize={false} showClose={false} className='glass-regular flex items-center justify-center'>
            <PageContent/>
        </DefaultWindowContainer>
    );
}
