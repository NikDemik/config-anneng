// src/app/configuration/layout.tsx
'use client';

import { ConfigurationProvider } from './context/ConfigurationContext';

export default function ConfigurationLayout({ children }: { children: React.ReactNode }) {
    return <ConfigurationProvider>{children}</ConfigurationProvider>;
}
