// src/app/configuration/steps/Step1/index.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FieldGroup } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { step1Schema } from '../shared/schema';
import { ConfigurationData } from '../shared/types';
import { useConfiguration } from '../../context/ConfigurationContext';
import BasicFields from './fields/BasicFields';

export default function Step1() {
    const { data, updateData, goToNextStep } = useConfiguration();

    const form = useForm<ConfigurationData>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            length: data.length,
            poles: data.poles,
        },
        mode: 'onChange',
    });

    const onSubmit = form.handleSubmit((formData) => {
        updateData(formData);
        goToNextStep();
    });

    const canProceed = form.formState.isValid;

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <FieldGroup>
                <BasicFields control={form.control} />
            </FieldGroup>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!canProceed}
                >
                    Далее: Параметры питания
                    {!canProceed && ' (заполните все поля)'}
                </Button>
            </div>
        </form>
    );
}
