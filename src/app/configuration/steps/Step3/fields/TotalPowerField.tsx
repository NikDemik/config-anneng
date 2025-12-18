'use client';

import { Controller } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { ConfigurationData } from '../../shared/types';

interface TotalPowerFieldProps {
    control: Control<ConfigurationData>;
    onTotalPowerChange?: (value: number) => void;
}

export default function TotalPowerField({ control, onTotalPowerChange }: TotalPowerFieldProps) {
    return (
        <Controller
            name="totalPower"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="totalPower">Общая мощность потребителей (кВт)</FieldLabel>
                    <Input
                        {...field}
                        id="totalPower"
                        type="number"
                        placeholder="Например: 150"
                        min={0.1}
                        step="0.1"
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : Number(value);
                            field.onChange(numValue);
                            if (onTotalPowerChange) {
                                onTotalPowerChange(numValue);
                            }
                        }}
                        aria-invalid={fieldState.invalid}
                        className="text-lg"
                    />
                    <FieldDescription>
                        Суммарная мощность всех потребителей на линии. Для одного потребителя — его
                        мощность. Для нескольких — общая сумма мощностей.
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
}
