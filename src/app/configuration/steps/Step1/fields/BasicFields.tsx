'use client';

import { Controller } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { ConfigurationData } from '../../shared/types';

interface BasicFieldsProps {
    control: Control<ConfigurationData>;
}

export default function BasicFields({ control }: BasicFieldsProps) {
    return (
        <div className="space-y-6">
            {/* Длина линии */}
            <Controller
                name="length"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="length">Длина линии (м)</FieldLabel>
                        <Input
                            {...field}
                            id="length"
                            type="number"
                            placeholder="Например: 30"
                            min={1}
                            max={500}
                            value={field.value === 0 ? '' : field.value}
                            onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? 0 : Number(value));
                            }}
                            aria-invalid={fieldState.invalid}
                            className="text-lg"
                        />
                        <FieldDescription>
                            Укажите длину линии от 1 до 500 метров.
                            {field.value > 150 && (
                                <span className="text-amber-600 ml-1">
                                    При длине более 150 м будет применено линейное питание.
                                </span>
                            )}
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />

            {/* Количество жил */}
            <Controller
                name="poles"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="poles">Количество жил</FieldLabel>
                        <Input
                            {...field}
                            id="poles"
                            type="number"
                            placeholder="Например: 4"
                            min={1}
                            max={12}
                            value={field.value === 0 ? '' : field.value}
                            onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? 0 : Number(value));
                            }}
                            aria-invalid={fieldState.invalid}
                            className="text-lg"
                        />
                        <FieldDescription>
                            Количество токопроводящих жил в линии (от 1 до 12)
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />
        </div>
    );
}
