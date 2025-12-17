import { Controller } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Control } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus } from 'lucide-react';
import { Step1FormData } from '../types';
import { ConsumerPowerInput } from '../components/ConsumerPowerInput';

interface ConsumersFieldsProps {
    control: Control<Step1FormData>;
    totalConsumers: number;
    showIndividualPowers: boolean;
    totalPower: number;
    individualPowers: { power: number }[];
    sumIndividualPowers: number;
    onConsumersChange: (value: string | number) => void;
    onTotalPowerChange: (value: number) => void;
    onAddConsumer: () => void;
    onRemoveConsumer: (index: number) => void;
    fields: any[]; // from useFieldArray
    append: (value: { power: number }) => void;
    remove: (index: number) => void;
}

export function ConsumersFields({
    control,
    totalConsumers,
    showIndividualPowers,
    totalPower,
    individualPowers,
    sumIndividualPowers,
    onConsumersChange,
    onTotalPowerChange,
    onAddConsumer,
    onRemoveConsumer,
    fields,
    append,
    remove,
}: ConsumersFieldsProps) {
    return (
        <>
            <Controller
                name="totalConsumers"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="totalConsumers">Количество потребителей</FieldLabel>
                        <Input
                            {...field}
                            id="totalConsumers"
                            type="number"
                            placeholder="Например: 1"
                            min={1}
                            max={20}
                            value={field.value === 0 ? '' : field.value}
                            onChange={(e) => {
                                const value = e.target.value;
                                onConsumersChange(value);
                            }}
                            aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>
                            Общее количество потребителей на линии (от 1 до 20)
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />

            <Controller
                name="totalPower"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="totalPower">
                            Общая мощность потребителей (кВт)
                        </FieldLabel>
                        <Input
                            {...field}
                            id="totalPower"
                            type="number"
                            placeholder="Например: 100"
                            min={0.1}
                            step="0.1"
                            value={field.value === 0 ? '' : field.value}
                            onChange={(e) => {
                                const value = e.target.value;
                                const numValue = value === '' ? 0 : Number(value);
                                field.onChange(numValue);
                                onTotalPowerChange(numValue);
                            }}
                            aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>
                            Укажите общую мощность всех потребителей
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />

            {totalConsumers > 1 && (
                <Controller
                    name="showIndividualPowers"
                    control={control}
                    render={({ field }) => (
                        <Field className="flex items-center gap-2 pt-2">
                            <Checkbox
                                id="showIndividualPowers"
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                }}
                            />
                            <FieldLabel
                                htmlFor="showIndividualPowers"
                                className="!mb-0 cursor-pointer"
                            >
                                Известна мощность каждого потребителя
                            </FieldLabel>
                            <FieldDescription className="!mt-0">
                                {field.value &&
                                    totalPower > 0 &&
                                    `(${totalConsumers} потребителей по ${(
                                        totalPower / totalConsumers
                                    ).toFixed(2)} кВт каждый)`}
                            </FieldDescription>
                        </Field>
                    )}
                />
            )}

            {showIndividualPowers && totalConsumers > 1 && (
                <>
                    <Alert
                        variant={
                            Math.abs(sumIndividualPowers - totalPower) <= 0.1
                                ? 'default'
                                : 'destructive'
                        }
                        className="mt-2"
                    >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="flex justify-between items-center">
                                <span>Сумма индивидуальных мощностей:</span>
                                <span className="font-bold">
                                    {sumIndividualPowers.toFixed(2)} кВт
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span>Общая мощность:</span>
                                <span className="font-bold">{totalPower.toFixed(2)} кВт</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span>Расхождение:</span>
                                <span
                                    className={`font-bold ${
                                        Math.abs(sumIndividualPowers - totalPower) <= 0.1
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}
                                >
                                    {(sumIndividualPowers - totalPower).toFixed(2)} кВт
                                </span>
                            </div>
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4 pt-4 border-t">
                        <FieldLabel>Мощности потребителей (кВт)</FieldLabel>
                        <FieldDescription>
                            Укажите мощность для каждого потребителя
                        </FieldDescription>

                        <FieldGroup>
                            {fields.map((field, index) => (
                                <ConsumerPowerInput
                                    key={field.id}
                                    control={control}
                                    index={index}
                                    totalConsumers={totalConsumers}
                                    onRemove={onRemoveConsumer}
                                />
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onAddConsumer}
                                className="w-full mt-2"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить потребителя
                            </Button>
                        </FieldGroup>
                    </div>
                </>
            )}
        </>
    );
}
