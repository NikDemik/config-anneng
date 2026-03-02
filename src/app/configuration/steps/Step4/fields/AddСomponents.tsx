// src/app/configuration/steps/Step4/fields/AddComponents.tsx
'use client';

import { Controller } from 'react-hook-form';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldContent,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Control } from 'react-hook-form';
import { AlertCircle, Plus } from 'lucide-react';
import { ConfigurationData } from '../../shared/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddComponentsProps {
    control: Control<ConfigurationData>;
    showAddComponents?: boolean;
    onToggleAddLightSignal?: (checked: boolean) => void;
    onToggleAddInsulationSection?: (checked: boolean) => void;
    onToggleAddTape?: (checked: boolean) => void;
    onToggleAddBrackets?: (checked: boolean) => void;
}

export default function AddComponents({ control }: AddComponentsProps) {
    <Card>
        <CardHeader>
            <CardTitle className="text-lg">Дополнительные компонетнты</CardTitle>
            <CardDescription>Автоматически рассчитанные значения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            <Controller
                name="addLightSignal"
                control={control}
                render={({ field }) => (
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        label="Добавить световую сигнализацию"
                    />
                )}
            />

            <Controller
                name="addInsulationSection"
                control={control}
                render={({ field }) => (
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        label="Добавить секцию изоляции"
                    />
                )}
            />

            <Controller
                name="addTape"
                control={control}
                render={({ field }) => (
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        label="Добавить ленту"
                    />
                )}
            />

            <Controller
                name="addBrackets"
                control={control}
                render={({ field }) => (
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        label="Добавить кронштейны"
                    />
                )}
            />
        </CardContent>
    </Card>;
}
