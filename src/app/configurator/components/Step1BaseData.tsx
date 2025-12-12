'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';

// Схема валидации с обработкой пустых значений
const formSchema = z.object({
    length: z.coerce
        .number({
            invalid_type_error: 'Длина должна быть числом',
            required_error: 'Поле обязательно',
        })
        .int('Длина должна быть целым числом')
        .min(4, 'Минимальная длина линии - 4 метр')
        .max(1048, 'Максимальная длина линии - 1048 метров')
        .or(z.literal('').transform(() => 0)),

    poles: z.coerce
        .number({
            invalid_type_error: 'Количество жил должно быть числом',
            required_error: 'Поле обязательно',
        })
        .int('Количество жил должно быть целым числом')
        .min(1, 'Минимальное количество жил - 1')
        .max(12, 'Максимальное количество жил - 12')
        .or(z.literal('').transform(() => 0)),

    voltage: z.coerce
        .number({
            invalid_type_error: 'Напряжение должно быть числом',
            required_error: 'Поле обязательно',
        })
        .int('Напряжение должно быть целым числом')
        .min(24, 'Минимальное напряжение - 24В')
        .max(1000, 'Максимальное напряжение - 1000В')
        .or(z.literal('').transform(() => 0)),

    cranes: z.coerce
        .number({
            invalid_type_error: 'Количество потребителей должно быть числом',
            required_error: 'Поле обязательно',
        })
        .int('Количество потребителей должно быть целым числом')
        .min(1, 'Минимальное количество потребителей 1')
        .max(12, 'Максимальное количество потребителей - 12')
        .or(z.literal('').transform(() => 0)),

    power: z.coerce
        .number({
            invalid_type_error: 'Мощность потребителей должно быть числом',
            required_error: 'Поле обязательно',
        })
        .min(0, 'Мощность потребителей не может быть отрицательным')
        .max(100, 'Максимальное количество потребителей - 100')
        .or(z.literal('').transform(() => 0)),
});

export default function ConfigurationForm() {
    // Инициализация формы
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            length: 104,
            poles: 4,
            voltage: 380,
            cranes: 2,
            power: 10,
        },
        mode: 'onChange',
    });

    // Функция обработки отправки формы
    function onSubmit(data: z.infer<typeof formSchema>) {
        console.log('Данные конфигуратора:', data);

        console.table({
            'Длина линии (м)': data.length,
            'Количество жил': data.poles,
            'Напряжение питания (В)': data.voltage,
            'Количество потребителей': data.cranes,
            'Мощность потребителей': data.power,
        });

        console.log(`
        📋 Конфигурация электрической линии:
        ──────────────────────────────
        • Длина линии: ${data.length} м
        • Количество жил: ${data.poles}
        • Напряжение питания: ${data.voltage} В
        • Количество потребителей: ${data.cranes}
        • Мощность потребителей: ${data.power}
        ──────────────────────────────
        `);
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Введите данные</CardTitle>
                <CardDescription>Введите параметры для расчета шинопровода</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="form-configuration" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        {/* Длина линии */}
                        <Controller
                            name="length"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-configuration-length">
                                        Длина линии (м)
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-configuration-length"
                                        type="number"
                                        placeholder="Например: 104"
                                        min={1}
                                        value={field.value === 0 ? '' : field.value}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === '' ? 0 : Number(value));
                                        }}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldDescription>
                                        Укажите длину линии от 4 до 1048 метров, кратно 4
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Количество жил */}
                        <Controller
                            name="poles"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-configuration-poles">
                                        Количество жил
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-configuration-poles"
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
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Напряжение питания */}
                        <Controller
                            name="voltage"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-configuration-voltage">
                                        Напряжение питания (В)
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-configuration-voltage"
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
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Количество потребителей */}
                        <Controller
                            name="cranes"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-configuration-cranes">
                                        Количество потребителей
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-configuration-cranes"
                                        type="number"
                                        placeholder="Например: 2"
                                        min={0}
                                        value={field.value === 0 ? '' : field.value}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === '' ? 0 : Number(value));
                                        }}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldDescription>
                                        Количество потребителей от 1 до 10 (кранов, или др.
                                        оборудование)
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Мощность потребителей */}
                        <Controller
                            name="power"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-configuration-power">
                                        Мощность всех потребителей (кВт)
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-configuration-power"
                                        type="number"
                                        placeholder="Например: 10"
                                        min={0}
                                        value={field.value === 0 ? '' : field.value}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === '' ? 0 : Number(value));
                                        }}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldDescription>
                                        Укажите общую мощность всех потребителей
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col flex-wrap sm:flex-row gap-2">
                <div className="flex gap-2 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                            const values = form.getValues();
                            console.log('Текущие значения формы:', values);
                            alert(`Проверка значений:\n
                                Длина: ${values.length || 0} м\n
                                Жилы: ${values.poles || 0}\n
                                Напряжение: ${values.voltage || 0} В\n
                                Краны: ${values.cranes || 0} \n
                                Мощность: ${values.power || 0} кВт
                            `);
                        }}
                    >
                        Показать значения
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                            form.reset();
                            console.log('Форма сброшена к значениям по умолчанию');
                        }}
                    >
                        Сбросить
                    </Button>
                </div>

                <Button type="submit" form="form-configuration" className="w-full sm:w-auto">
                    Сохранить конфигурацию
                </Button>
            </CardFooter>
        </Card>
    );
}
