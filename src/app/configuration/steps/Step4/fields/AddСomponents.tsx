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
    onToggleIndividualPowers?: (checked: boolean) => void;
    showAddComponents?: boolean;

    totalConsumers?: number;
    onConsumersChange?: (value: number) => void;
    onAddConsumer?: () => void;
    onRemoveConsumer?: (index: number) => void;
    fields?: any[];
    sumIndividualPowers?: number;
    totalPower?: number;
}

export default function AddComponents({
    control,
    totalConsumers = 1,
    showAddComponents = false,
    onConsumersChange,
    onToggleIndividualPowers,
    onAddConsumer,
    onRemoveConsumer,
    fields = [],
    sumIndividualPowers = 0,
    totalPower = 0,
}: AddComponentsProps) {
    <Card>
        <CardHeader>
            <CardTitle className="text-lg">Дополнительные компонетнты</CardTitle>
            <CardDescription>Автоматически рассчитанные значения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            <Controller
                name="addComponents"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} orientation="horizontal">
                        <Checkbox id="terms-checkbox-2" name="terms-checkbox-2" defaultChecked />
                        <FieldContent>
                            <FieldLabel htmlFor="terms-checkbox-2">
                                Accept terms and conditions
                            </FieldLabel>
                            <FieldDescription>
                                By clicking this checkbox, you agree to the terms.
                            </FieldDescription>
                        </FieldContent>
                    </Field>
                )}
            />
        </CardContent>
    </Card>;
}
