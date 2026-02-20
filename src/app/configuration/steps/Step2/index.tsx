// src/app/configuration/steps/Step2/index.tsx
'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
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

    // Определяем, нужно ли принудительно линейное питание
    const isForcedLinear = data.length > MAX_LENGTH_FOR_END_POWER;

    // Определяем правильный тип питания для формы
    const getDefaultPowerType = () => {
        if (isForcedLinear) {
            // Если длина > 150, то по умолчанию LINEAR
            return POWER_TYPES.LINEAR;
        }
        // Иначе берем из контекста
        return data.powerType;
    };

    const form = useForm<ConfigurationData>({
        resolver: zodResolver(step2Schema as any),
        defaultValues: {
            voltage: data.voltage,
            powerType: data.powerType,
            powerTypeOverride: data.powerTypeOverride || false,
        },
        mode: 'onChange',
    });

    // Эффект для обновления формы при изменении длины
    useEffect(() => {
        const newIsForcedLinear = data.length > MAX_LENGTH_FOR_END_POWER;
        const currentPowerType = form.getValues('powerType');
        const currentOverride = form.getValues('powerTypeOverride');

        if (newIsForcedLinear) {
            // Если длина > 150
            if (currentPowerType !== POWER_TYPES.LINEAR && !currentOverride) {
                // Если нет override и тип не линейный - меняем на LINEAR
                console.log('📏 Длина > 150 м, устанавливаем LINEAR');
                form.setValue('powerType', POWER_TYPES.LINEAR, {
                    shouldValidate: true,
                });
                form.setValue('powerTypeOverride', false);

                // Обновляем контекст
                updateData({
                    powerType: POWER_TYPES.LINEAR,
                    powerTypeOverride: false,
                });
            }
        } else {
            // Если длина <= 150, но в форме LINEAR - меняем на END (или сохраняем из контекста)
            if (currentPowerType === POWER_TYPES.LINEAR && data.powerType !== POWER_TYPES.LINEAR) {
                console.log('📏 Длина <= 150 м, восстанавливаем тип из контекста');
                form.setValue('powerType', data.powerType, {
                    shouldValidate: true,
                });
            }
        }
    }, [data.length, form, updateData]);

    // Получаем длину линии из контекста для проверки ограничений
    const length = data.length;

    // Синхронизация данных формы с контекстом при изменении
    useEffect(() => {
        const subscription = form.watch((value) => {
            if (value.powerType || value.powerTypeOverride !== undefined) {
                updateData({
                    powerType: value.powerType as any,
                    powerTypeOverride: value.powerTypeOverride,
                });
            }
        });
        return () => subscription.unsubscribe();
    }, [form, updateData]);

    const onSubmit = form.handleSubmit((formData) => {
        updateData(formData);
    });

    const canProceed = form.formState.isValid;

    return (
        <FormProvider {...form}>
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
                                console.log('✅ Данные шага 2:', formData); //вывод данных в консоль
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
        </FormProvider>
    );
}
