import { Controller } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { Step1FormData } from '../types';

interface BasicFieldsProps {
    control: Control<Step1FormData>;
}

export function BasicFields({ control }: BasicFieldsProps) {
    return (
        <>
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
                            value={field.value === 0 ? '' : field.value}
                            onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? 0 : Number(value));
                            }}
                            aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>Укажите длину линии от 1 до 500 метров</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />

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
                            value={field.value === 0 ? '' : field.value}
                            onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? 0 : Number(value));
                            }}
                            aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>Количество жил от 1 до 12</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />

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
                            value={field.value === 0 ? '' : field.value}
                            onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? 0 : Number(value));
                            }}
                            aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>Напряжение от 24 до 1000 В</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />
        </>
    );
}
