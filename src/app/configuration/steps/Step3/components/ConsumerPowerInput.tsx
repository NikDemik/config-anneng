'use client';

import { Controller } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Control } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { ConfigurationData } from '../../shared/types';

interface ConsumerPowerInputProps {
    control: Control<ConfigurationData>;
    index: number;
    totalConsumers: number;
    onRemove?: (index: number) => void;
}

export default function ConsumerPowerInput({
    control,
    index,
    totalConsumers,
    onRemove,
}: ConsumerPowerInputProps) {
    return (
        <Controller
            name={`individualPowers.${index}.power`}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center gap-3">
                        <div className="min-w-[100px]">
                            <FieldLabel className="whitespace-nowrap">
                                Потребитель {index + 1}
                            </FieldLabel>
                        </div>
                        <div className="flex-1">
                            <Input
                                {...field}
                                type="number"
                                placeholder={`Мощность потребителя ${index + 1}`}
                                min={0.1}
                                step="0.1"
                                value={field.value === 0 ? '' : field.value}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value === '' ? 0 : Number(value));
                                }}
                                aria-invalid={fieldState.invalid}
                                className={fieldState.invalid ? 'border-red-500' : ''}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </div>
                        {totalConsumers > 1 && onRemove && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemove(index)}
                                className="h-10 w-10 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                title="Удалить потребителя"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </Field>
            )}
        />
    );
}
