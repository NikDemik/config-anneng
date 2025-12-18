// src/app/configuration/steps/Step3/fields/ConsumersFields.tsx
'use client';

import { Controller } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Control } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus } from 'lucide-react';
import { ConfigurationData } from '../../shared/types';
import ConsumerPowerInput from '../components/ConsumerPowerInput';

interface ConsumersFieldsProps {
    control: Control<ConfigurationData>;
    totalConsumers?: number;
    showIndividualPowers?: boolean;
    onConsumersChange?: (value: number) => void;
    onToggleIndividualPowers?: (checked: boolean) => void;
    onAddConsumer?: () => void;
    onRemoveConsumer?: (index: number) => void;
    fields?: any[];
    sumIndividualPowers?: number;
    totalPower?: number;
}

export default function ConsumersFields({
    control,
    totalConsumers = 1,
    showIndividualPowers = false,
    onConsumersChange,
    onToggleIndividualPowers,
    onAddConsumer,
    onRemoveConsumer,
    fields = [],
    sumIndividualPowers = 0,
    totalPower = 0,
}: ConsumersFieldsProps) {
    const hasIndividualPowers = showIndividualPowers && totalConsumers > 1;
    const powerMismatch = Math.abs(sumIndividualPowers - totalPower) > 0.1;

    // Если передано totalConsumers, не показываем поле для его ввода
    const showConsumersInput = totalConsumers === undefined;

    return (
        <div className="space-y-6">
            {/* Количество потребителей (показываем только если не передано явно) */}
            {showConsumersInput && (
                <Controller
                    name="totalConsumers"
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="totalConsumers">
                                Количество потребителей
                            </FieldLabel>
                            <Input
                                {...field}
                                id="totalConsumers"
                                type="number"
                                placeholder="Например: 3"
                                min={1}
                                max={20}
                                value={field.value === 0 ? '' : field.value}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = value === '' ? 1 : Number(value);
                                    field.onChange(numValue);
                                    if (onConsumersChange) onConsumersChange(numValue);
                                }}
                                aria-invalid={fieldState.invalid}
                            />
                            <FieldDescription>
                                Сколько потребителей (электроприемников) подключено к линии?
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            )}

            {/* Checkbox для индивидуальных мощностей (показывается если потребителей > 1) */}
            {totalConsumers > 1 && (
                <Controller
                    name="showIndividualPowers"
                    control={control}
                    render={({ field }) => (
                        <Field className="flex items-center gap-3 pt-4">
                            <Checkbox
                                id="showIndividualPowers"
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (onToggleIndividualPowers)
                                        onToggleIndividualPowers(!!checked);
                                }}
                            />
                            <div className="flex-1">
                                <FieldLabel
                                    htmlFor="showIndividualPowers"
                                    className="!mb-1 cursor-pointer"
                                >
                                    Указать мощность для каждого потребителя отдельно
                                </FieldLabel>
                                <FieldDescription className="!mt-0">
                                    Активируйте, если знаете точную мощность каждого потребителя
                                </FieldDescription>
                            </div>
                        </Field>
                    )}
                />
            )}

            {/* Информация о сходимости мощностей */}
            {hasIndividualPowers && (
                <Alert variant={powerMismatch ? 'destructive' : 'default'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span>Общая мощность:</span>
                                <span className="font-bold">{totalPower.toFixed(2)} кВт</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Сумма индивидуальных мощностей:</span>
                                <span className="font-bold">
                                    {sumIndividualPowers.toFixed(2)} кВт
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Расхождение:</span>
                                <span
                                    className={`font-bold ${
                                        powerMismatch ? 'text-red-600' : 'text-green-600'
                                    }`}
                                >
                                    {(sumIndividualPowers - totalPower).toFixed(2)} кВт
                                </span>
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Поля для индивидуальных мощностей */}
            {hasIndividualPowers && fields.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <FieldLabel className="text-lg">Мощности потребителей (кВт)</FieldLabel>
                            <FieldDescription>
                                Укажите мощность для каждого из {totalConsumers} потребителей
                            </FieldDescription>
                        </div>
                        {onAddConsumer && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onAddConsumer}
                                disabled={totalConsumers >= 20}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Добавить
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <ConsumerPowerInput
                                key={field.id}
                                control={control}
                                index={index}
                                totalConsumers={totalConsumers}
                                onRemove={onRemoveConsumer}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
