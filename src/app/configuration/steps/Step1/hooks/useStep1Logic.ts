import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Step1FormData } from '../types';

interface UseStep1LogicProps {
    form: UseFormReturn<Step1FormData>;
    fields: any[];
    append: (value: { power: number }) => void;
    remove: (index: number) => void;
}

export function useStep1Logic({ form, fields, append, remove }: UseStep1LogicProps) {
    // Получаем значения формы для отслеживания
    const watchLength = form.watch('length');
    const watchTotalConsumers = form.watch('totalConsumers');
    const watchShowIndividualPowers = form.watch('showIndividualPowers');
    const watchTotalPower = form.watch('totalPower');
    const watchIndividualPowers = form.watch('individualPowers');

    const sumIndividualPowers =
        watchIndividualPowers?.reduce((sum, consumer) => sum + (consumer.power || 0), 0) || 0;

    // Функция для обновления массива потребителей
    const updateConsumersArray = (count: number) => {
        const currentCount = fields.length;

        if (count > currentCount) {
            const powerPerConsumer = watchTotalPower / count;
            for (let i = currentCount; i < count; i++) {
                append({ power: powerPerConsumer || 0 });
            }
        } else if (count < currentCount) {
            for (let i = currentCount - 1; i >= count; i--) {
                remove(i);
            }
        }

        if (watchShowIndividualPowers && count > 0) {
            const newPowerPerConsumer = watchTotalPower / count;
            fields.forEach((_, index) => {
                if (index < count) {
                    form.setValue(`individualPowers.${index}.power`, newPowerPerConsumer || 0);
                }
            });
        }
    };

    const handleLengthChange = (value: string | number) => {
        const numValue = value === '' ? 0 : Number(value);
        if (numValue < 1) return;
        form.setValue('length', numValue);

        if (numValue > 150 && form.getValues('powerType') !== 'linear') {
            form.setValue('powerType', 'linear');
        }
    };

    const handleConsumersChange = (value: string | number) => {
        const numValue = value === '' ? 1 : Number(value);
        if (numValue < 1) return;
        form.setValue('totalConsumers', numValue);

        if (watchShowIndividualPowers) {
            updateConsumersArray(numValue);
        }
    };

    const handleTotalPowerChange = (value: number) => {
        if (watchShowIndividualPowers && watchTotalConsumers > 0) {
            const powerPerConsumer = value / watchTotalConsumers;
            fields.forEach((_, index) => {
                form.setValue(`individualPowers.${index}.power`, powerPerConsumer || 0);
            });
        }
    };

    const handleAddConsumer = () => {
        const newCount = watchTotalConsumers + 1;
        form.setValue('totalConsumers', newCount);

        const powerPerConsumer = watchTotalPower / newCount;
        append({ power: powerPerConsumer || 0 });

        fields.forEach((_, index) => {
            form.setValue(`individualPowers.${index}.power`, powerPerConsumer || 0);
        });
    };

    const handleRemoveConsumer = (index: number) => {
        remove(index);
        form.setValue('totalConsumers', watchTotalConsumers - 1);
    };

    const handleSubmit = form.handleSubmit((data) => {
        console.log('Данные конфигуратора:', data);
        // Здесь можно добавить логику сохранения и перехода к следующему шагу
    });

    const handleShowValues = () => {
        const values = form.getValues();
        alert(`Проверка значений:\n
            Длина: ${values.length || 0} м\n
            Жилы: ${values.poles || 0}\n
            Напряжение: ${values.voltage || 0} В\n
            Тип питания: ${values.powerType === 'end' ? 'Концевое' : 'Линейное'}\n
            Потребители: ${values.totalConsumers || 1}\n
            Общая мощность: ${values.totalPower || 0} кВт`);
    };

    const handleReset = () => {
        form.reset({
            length: 30,
            poles: 4,
            voltage: 380,
            powerType: 'end',
            totalConsumers: 1,
            totalPower: 0,
            showIndividualPowers: false,
            individualPowers: [],
        });
    };

    return {
        watchLength,
        watchTotalConsumers,
        watchShowIndividualPowers,
        watchTotalPower,
        watchIndividualPowers,
        sumIndividualPowers,
        handleLengthChange,
        handleConsumersChange,
        handleTotalPowerChange,
        handleAddConsumer,
        handleRemoveConsumer,
        handleSubmit,
        handleShowValues,
        handleReset,
    };
}
