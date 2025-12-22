// src/app/configuration/steps/Step2/index.tsx
'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FieldGroup } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { step2Schema } from '../shared/schema';
import { ConfigurationData } from '../shared/types';
import { POWER_TYPES, MAX_LENGTH_FOR_END_POWER } from '../shared/constants';
import { useConfiguration } from '../../context/ConfigurationContext';
import VoltageField from './fields/VoltageField';
import PowerTypeField from './fields/PowerTypeField';

export default function Step2() {
    const { data, updateData, goToPrevStep, goToNextStep } = useConfiguration();

    const form = useForm<ConfigurationData>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            voltage: data.voltage,
            powerType: data.powerType,
        },
        mode: 'onChange',
    });

    // Получаем длину линии из контекста для проверки ограничений
    const length = data.length;

    const onSubmit = form.handleSubmit((formData) => {
        updateData(formData);
        // Переход на следующий шаг будет через навигацию в layout
    });

    const canProceed = form.formState.isValid;

    useEffect(() => {
        const isForcedLinear = length > MAX_LENGTH_FOR_END_POWER;

        if (isForcedLinear) {
            // 1. Обновляем форму
            form.setValue('powerType', POWER_TYPES.LINEAR, {
                shouldValidate: true,
                shouldDirty: true,
            });

            // 2. Обновляем глобальный контекст
            updateData({ powerType: POWER_TYPES.LINEAR });
        }
    }, [length, form, updateData]);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <FieldGroup>
                <VoltageField control={form.control} />
                <PowerTypeField control={form.control} length={length} />
            </FieldGroup>

            <div className="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        // Сохраняем данные перед переходом
                        form.handleSubmit((formData) => {
                            updateData(formData);
                            goToPrevStep();
                        })();
                    }}
                >
                    Назад: Основные параметры
                </Button>

                <Button
                    type="button"
                    onClick={() => {
                        // Сохраняем данные перед переходом
                        form.handleSubmit((formData) => {
                            updateData(formData);
                            goToNextStep();
                        })();
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!canProceed}
                >
                    Далее: Потребители
                    {!canProceed && ' (заполните все поля)'}
                </Button>
            </div>
        </form>
    );
}
