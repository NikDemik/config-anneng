'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ConfigurationLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export default function ConfigurationLayout({
    children,
    title = 'Конфигуратор электрической линии',
    description = 'Настройте параметры электрической линии для потребителей',
}: ConfigurationLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="container mx-auto max-w-6xl">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent>{children}</CardContent>
                </Card>
            </div>
        </div>
    );
}
