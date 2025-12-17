'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { FieldGroup } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { step1Schema } from './schema';
import { Step1FormData } from './types';
import { BasicFields } from './fields/BasicFields';
import { PowerTypeField } from './fields/PowerTypeField';
import { ConsumersFields } from './fields/ConsumersFields';
import { useStep1Logic } from './hooks/useStep1Logic';

export default function Step1() {
    // Инициализация формы
    const form = useForm<Step1FormData>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            length: 30,
            poles: 4,
            voltage: 380,
            powerType: 'end',
            totalConsumers: 1,
            totalPower: 0,
            showIndividualPowers: false,
            individualPowers: [],
        },
        mode: 'onChange',
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'individualPowers',
    });

    const {
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
    } = useStep1Logic({ form, fields, append, remove });

    return (
        <form id="step1-form" onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
                <BasicFields control={form.control} />
                <PowerTypeField control={form.control} length={watchLength} />
                <ConsumersFields
                    control={form.control}
                    totalConsumers={watchTotalConsumers}
                    showIndividualPowers={watchShowIndividualPowers}
                    totalPower={watchTotalPower}
                    individualPowers={watchIndividualPowers || []}
                    sumIndividualPowers={sumIndividualPowers}
                    onConsumersChange={handleConsumersChange}
                    onTotalPowerChange={handleTotalPowerChange}
                    onAddConsumer={handleAddConsumer}
                    onRemoveConsumer={handleRemoveConsumer}
                    fields={fields}
                    append={append}
                    remove={remove}
                />
            </FieldGroup>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <div className="flex gap-2 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleShowValues}
                    >
                        Показать значения
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleReset}
                    >
                        Сбросить
                    </Button>
                </div>

                <Button type="submit" form="step1-form" className="w-full sm:w-auto">
                    Сохранить и продолжить
                </Button>
            </div>
        </form>
    );
}
