'use client';

import { useEffect } from 'react';
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

    const watchTotalConsumers = watch('totalConsumers');
    const watchShowIndividualPowers = watch('showIndividualPowers');
    const watchTotalPower = watch('totalPower');

    // Синхронизация полей при изменении количества потребителей или режима
    useEffect(() => {
        if (watchShowIndividualPowers && watchTotalConsumers > 1) {
            const currentCount = fields.length;
            const targetCount = watchTotalConsumers;

            if (currentCount < targetCount) {
                // Нужно добавить поля
                const powerPerConsumer = watchTotalPower > 0 ? watchTotalPower / targetCount : 0;
                for (let i = currentCount; i < targetCount; i++) {
                    append({ power: powerPerConsumer });
                }
            } else if (currentCount > targetCount) {
                // Нужно удалить лишние поля
                for (let i = currentCount - 1; i >= targetCount; i--) {
                    remove(i);
                }
            }

            // Перераспределяем мощность
            if (watchTotalPower > 0) {
                const powerPerConsumer = watchTotalPower / targetCount;
                fields.forEach((_, index) => {
                    setValue(`individualPowers.${index}.power`, powerPerConsumer);
                });
            }
        } else if (!watchShowIndividualPowers && fields.length > 0) {
            // Если режим выключен, очищаем все поля
            while (fields.length > 0) {
                remove(fields.length - 1);
            }
        }
    }, [watchShowIndividualPowers, watchTotalConsumers]);

    // Перераспределение мощности при изменении общей мощности
    useEffect(() => {
        if (watchShowIndividualPowers && watchTotalConsumers > 1 && watchTotalPower > 0) {
            const powerPerConsumer = watchTotalPower / watchTotalConsumers;
            fields.forEach((_, index) => {
                setValue(`individualPowers.${index}.power`, powerPerConsumer);
            });
        }
    }, [watchTotalPower]);

    const handleToggleIndividualPowers = (checked: boolean) => {
        setValue('showIndividualPowers', checked);
    };

    const handleAddConsumer = () => {
        const newCount = watchTotalConsumers + 1;
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
