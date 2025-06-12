'use client';

import {version} from 'qile-common/version.json';
import {AboutWindow} from 'frontend-essentials/src/components/about'

export default function AboutPage() {
    return <AboutWindow applicationName={'Qile'} version={version}/>
}