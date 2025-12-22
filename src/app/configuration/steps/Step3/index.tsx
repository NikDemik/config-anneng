// src/app/configuration/steps/Step3/index.tsx
'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldGroup } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { step3Schema } from '../shared/schema';
import { ConfigurationData } from '../shared/types';
import { useConfiguration } from '../../context/ConfigurationContext';
import { useConsumersLogic } from './hooks/useConsumersLogic';
import TotalPowerField from './fields/TotalPowerField';
import ConsumersFields from './fields/ConsumersFields';

export default function Step3() {
    const { data, updateData, goToPrevStep } = useConfiguration();

    const form = useForm<ConfigurationData>({
        resolver: zodResolver(step3Schema),
        defaultValues: {
            totalConsumers: data.totalConsumers,
            totalPower: data.totalPower,
            showIndividualPowers: data.showIndividualPowers,
            individualPowers: data.individualPowers,
        },
        mode: 'onChange',
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'individualPowers',
    });

    const watchTotalConsumers = form.watch('totalConsumers');
    const watchShowIndividualPowers = form.watch('showIndividualPowers');
    const watchTotalPower = form.watch('totalPower');
    const watchIndividualPowers = form.watch('individualPowers');

    // Используем хук для логики потребителей
    const {
        handleToggleIndividualPowers,
        handleAddConsumer,
        handleRemoveConsumer,
        handleConsumersChange,
        handleTotalPowerChange,
    } = useConsumersLogic({ form, fields, append, remove });

    // Вычисляем сумму индивидуальных мощностей
    const sumIndividualPowers =
        watchIndividualPowers?.reduce((sum, consumer) => sum + (consumer.power || 0), 0) || 0;

    const hasPowerMismatch = Math.abs(sumIndividualPowers - watchTotalPower) > 0.1;

    const onSubmit = form.handleSubmit((formData) => {
        // Проверяем сходимость мощностей
        if (formData.showIndividualPowers && formData.individualPowers) {
            const sum = formData.individualPowers.reduce(
                (total, consumer) => total + consumer.power,
                0,
            );
            const diff = Math.abs(sum - formData.totalPower);

            if (diff > 0.1) {
                alert(
                    `Ошибка! Сумма индивидуальных мощностей (${sum.toFixed(
                        2,
                    )} кВт) не совпадает с общей мощностью (${formData.totalPower} кВт)`,
                );
                return;
            }
        }

        updateData(formData);
        alert('Конфигурация успешно сохранена!');
    });

    const canSubmit = form.formState.isValid && !hasPowerMismatch;

    // синхронизация массива
    useEffect(() => {
        if (!watchShowIndividualPowers) return;

        const currentLength = fields.length;

        if (watchTotalConsumers > currentLength) {
            // добавляем недостающих
            for (let i = currentLength; i < watchTotalConsumers; i++) {
                append({ power: 0 });
            }
        }

        if (watchTotalConsumers < currentLength) {
            // удаляем лишних
            for (let i = currentLength - 1; i >= watchTotalConsumers; i--) {
                remove(i);
            }
        }
    }, [watchShowIndividualPowers, watchTotalConsumers, fields.length, append, remove]);

    return (
        <div className="space-y-6">
            <form onSubmit={onSubmit}>
                <FieldGroup>
                    {/* Количество потребителей и общая мощность */}
                    <ConsumersFields
                        control={form.control}
                        onConsumersChange={handleConsumersChange}
                    />

                    <TotalPowerField
                        control={form.control}
                        onTotalPowerChange={handleTotalPowerChange}
                    />

                    {/* Индивидуальные мощности (если потребителей > 1) */}
                    {watchTotalConsumers > 1 && (
                        <div className="pt-6 border-t">
                            <ConsumersFields
                                control={form.control}
                                totalConsumers={watchTotalConsumers}
                                showIndividualPowers={watchShowIndividualPowers}
                                onToggleIndividualPowers={handleToggleIndividualPowers}
                                onAddConsumer={handleAddConsumer}
                                onRemoveConsumer={handleRemoveConsumer}
                                fields={fields}
                                sumIndividualPowers={sumIndividualPowers}
                                totalPower={watchTotalPower}
                            />
                        </div>
                    )}

                    {/* Сообщение об ошибке сходимости мощностей */}
                    {watchShowIndividualPowers && watchTotalConsumers > 1 && hasPowerMismatch && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Сумма индивидуальных мощностей ({sumIndividualPowers.toFixed(2)}{' '}
                                кВт) не совпадает с общей мощностью ({watchTotalPower} кВт).
                                Отрегулируйте мощности так, чтобы сумма равнялась общей мощности.
                            </AlertDescription>
                        </Alert>
                    )}
                </FieldGroup>

                <div className="flex justify-between mt-6">
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
                        Назад: Параметры питания
                    </Button>

                    <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!canSubmit}
                    >
                        Завершить конфигурацию
                        {!canSubmit && ' (есть ошибки)'}
                    </Button>
                </div>
            </form>

            {/* Сводка всей конфигурации */}
            <div className="mt-8 p-6 border rounded-lg bg-gray-50">
                <h4 className="font-bold text-lg mb-4">Сводка конфигурации</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Шаг 1 */}
                    <div className="space-y-2">
                        <h5 className="font-semibold text-gray-700 text-sm">
                            Шаг 1: Основные параметры
                        </h5>
                        <div className="bg-white p-3 rounded border">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Длина линии:</span>
                                <span className="font-bold">{data.length} м</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Количество жил:</span>
                                <span className="font-bold">{data.poles} шт</span>
                            </div>
                        </div>
                    </div>

                    {/* Шаг 2 */}
                    <div className="space-y-2">
                        <h5 className="font-semibold text-gray-700 text-sm">Шаг 2: Питание</h5>
                        <div className="bg-white p-3 rounded border">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Напряжение:</span>
                                <span className="font-bold">{data.voltage} В</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Тип питания:</span>
                                <span className="font-bold">
                                    {data.powerType === 'end' ? 'Концевое' : 'Линейное'}
                                    {data.length > 150 &&
                                        data.powerType === 'linear' &&
                                        ' (автоматически)'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Шаг 3 */}
                    <div className="space-y-2">
                        <h5 className="font-semibold text-gray-700 text-sm">Шаг 3: Потребители</h5>
                        <div className="bg-white p-3 rounded border">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Потребители:</span>
                                <span className="font-bold">{watchTotalConsumers} шт</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Общая мощность:</span>
                                <span className="font-bold">{watchTotalPower} кВт</span>
                            </div>
                            {watchShowIndividualPowers &&
                                watchIndividualPowers &&
                                watchIndividualPowers.length > 0 && (
                                    <div className="mt-2 pt-2 border-t">
                                        <div className="text-gray-600 text-sm">
                                            Индивидуальные мощности:
                                        </div>
                                        {watchIndividualPowers
                                            .slice(0, 3)
                                            .map((consumer, index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <span>Потребитель {index + 1}:</span>
                                                    <span>{consumer.power} кВт</span>
                                                </div>
                                            ))}
                                        {watchIndividualPowers.length > 3 && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                + еще {watchIndividualPowers.length - 3}{' '}
                                                потребителей
                                            </div>
                                        )}
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
