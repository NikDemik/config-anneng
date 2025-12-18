'use client';

import { Controller } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { ConfigurationData } from '../../shared/types';

interface VoltageFieldProps {
    control: Control<ConfigurationData>;
}

export default function VoltageField({ control }: VoltageFieldProps) {
    return (
        <Controller
            name="voltage"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="voltage">Напряжение питания (В)</FieldLabel>
                    <Input
                        {...field}
                        id="voltage"
                        type="number"
                        placeholder="Например: 380"
                        min={24}
                        max={1000}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? 0 : Number(value));
                        }}
                        aria-invalid={fieldState.invalid}
                        className="text-lg"
                    />
                    <FieldDescription>
                        Напряжение питания линии (от 24 до 1000 В). Стандартные значения: 24В, 48В,
                        110В, 220В, 380В, 660В.
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
}
