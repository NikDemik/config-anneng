// src/app/configuration/page.tsx
'use client';

import { ConfigurationProvider } from './context/ConfigurationContext';
import ConfigurationLayout from './layout';

export default function ConfigurationPage() {
    return (
        <ConfigurationProvider>
            <ConfigurationLayout />
        </ConfigurationProvider>
    );
}
