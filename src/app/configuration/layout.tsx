// src/app/configuration/layout.tsx
'use client';

import { ConfigurationProvider } from './context/ConfigurationContext';

export default function ConfigurationLayout({ children }: { children: React.ReactNode }) {
    return (
        <ConfigurationProvider>
            <div className="flex min-h-screen items-center justify-center bg-zinc-800 font-sans dark:bg-black">
                <main className="flex xl:min-h-screen w-full max-w-8xl flex-col items-center justify-between bg-bg-page dark:bg-black sm:items-start overflow-hidden rounded-4xl">
                    {children}
                </main>
            </div>
        </ConfigurationProvider>
    );
}
