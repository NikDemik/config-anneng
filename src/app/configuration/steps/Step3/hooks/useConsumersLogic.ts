// src/app/configuration/steps/Step3/hooks/useConsumersLogic.ts
'use client';

import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ConfigurationData } from '../../shared/types';

interface UseConsumersLogicProps {
    form: UseFormReturn<ConfigurationData>;
    fields: any[];
    append: (value: { power: number }) => void;
    remove: (index: number) => void;
}

export function useConsumersLogic({ form, fields, append, remove }: UseConsumersLogicProps) {
    const { watch, setValue } = form;
    const isUpdatingRef = useRef(false);

    const watchTotalConsumers = watch('totalConsumers');
    const watchShowIndividualPowers = watch('showIndividualPowers');
    const watchTotalPower = watch('totalPower');

    // Синхронизация полей при изменении количества потребителей или режима
    useEffect(() => {
        // Защита от рекурсивных обновлений
        if (isUpdatingRef.current) return;

        if (!watchShowIndividualPowers || watchTotalConsumers <= 1) {
            // Если режим выключен или потребителей <= 1, очищаем массив
            if (fields.length > 0) {
                isUpdatingRef.current = true;
                for (let i = fields.length - 1; i >= 0; i--) {
                    remove(i);
                }
                isUpdatingRef.current = false;
            }
            return;
        }

        const currentLength = fields.length;

        if (watchTotalConsumers > currentLength) {
            // Добавляем новых потребителей
            isUpdatingRef.current = true;
            const powerPerConsumer =
                watchTotalPower > 0 ? watchTotalPower / watchTotalConsumers : 0;

            for (let i = currentLength; i < watchTotalConsumers; i++) {
                append({ power: powerPerConsumer });
            }
            isUpdatingRef.current = false;
        } else if (watchTotalConsumers < currentLength) {
            // Удаляем лишних потребителей
            isUpdatingRef.current = true;
            for (let i = currentLength - 1; i >= watchTotalConsumers; i--) {
                remove(i);
            }
            isUpdatingRef.current = false;
        }
    }, [watchShowIndividualPowers, watchTotalConsumers]);

    // Отдельный эффект только для перераспределения мощности
    useEffect(() => {
        // Защита от рекурсивных обновлений
        if (isUpdatingRef.current) return;

        if (watchShowIndividualPowers && watchTotalConsumers > 1 && watchTotalPower > 0) {
            // Проверяем, нужно ли перераспределять
            const currentSum = fields.reduce((sum, field) => sum + (field.power || 0), 0);
            const expectedPerConsumer = watchTotalPower / watchTotalConsumers;
            const needsRedistribution = Math.abs(currentSum - watchTotalPower) > 0.1;

            if (needsRedistribution && fields.length === watchTotalConsumers) {
                isUpdatingRef.current = true;
                fields.forEach((_, index) => {
                    setValue(`individualPowers.${index}.power`, expectedPerConsumer, {
                        shouldValidate: true,
                    });
                });
                isUpdatingRef.current = false;
            }
        }
    }, [watchTotalPower, watchTotalConsumers, watchShowIndividualPowers]);

    const handleToggleIndividualPowers = (checked: boolean) => {
        setValue('showIndividualPowers', checked);

        // Если включаем режим и есть потребители, инициализируем массив
        if (checked && watchTotalConsumers > 1 && fields.length === 0) {
            const powerPerConsumer =
                watchTotalPower > 0 ? watchTotalPower / watchTotalConsumers : 0;

            isUpdatingRef.current = true;
            for (let i = 0; i < watchTotalConsumers; i++) {
                append({ power: powerPerConsumer });
            }
            isUpdatingRef.current = false;
        }
    };

    const handleAddConsumer = () => {
        const newCount = Math.min(watchTotalConsumers + 1, 20);
        setValue('totalConsumers', newCount);
    };

    const handleRemoveConsumer = (index: number) => {
        if (watchShowIndividualPowers && watchTotalConsumers > 1) {
            remove(index);
            const newCount = watchTotalConsumers - 1;
            setValue('totalConsumers', newCount);
        }
    };

    const handleConsumersChange = (value: number) => {
        setValue('totalConsumers', value);
    };

    const handleTotalPowerChange = (value: number) => {
        setValue('totalPower', value);
    };

    return {
        watchTotalConsumers,
        watchShowIndividualPowers,
        watchTotalPower,
        handleToggleIndividualPowers,
        handleAddConsumer,
        handleRemoveConsumer,
        handleConsumersChange,
        handleTotalPowerChange,
    };
}
