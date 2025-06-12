'use client';

import {version} from 'blank-common/version.json';
import {AboutWindow} from 'frontend-essentials/src/components/about'

export default function AboutPage() {
    return <AboutWindow applicationName={'__Blank__'} version={version}/>
}