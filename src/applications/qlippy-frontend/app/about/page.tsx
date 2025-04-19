'use client';

import {DefaultWindowContainer} from "../../components/windowContainer/DefaultWindowContainer";
import {version} from 'qlippy-common/version.json';
import {AboutWindow} from 'frontend-essentials/src/components/about'



export default function AboutPage() {
    return <AboutWindow applicationName={'Qlippy'} version={version} />
}