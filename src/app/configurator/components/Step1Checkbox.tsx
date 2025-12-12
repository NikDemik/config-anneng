'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect } from 'react';

// Схема валидации для потребителей
const consumerSchema = z.object({
    power: z.coerce
        .number({
            invalid_type_error: 'Мощность должна быть числом',
            required_error: 'Укажите мощность потребителя',
        })
        .positive('Мощность должна быть положительным числом')
        .max(1000, 'Максимальная мощность - 1000 кВт')
        .or(z.literal('').transform(() => 0)),
});

// Основная схема валидации с кастомной проверкой суммы мощностей
const formSchema = z
    .object({
        length: z.coerce
            .number({
                invalid_type_error: 'Длина должна быть числом',
                required_error: 'Поле обязательно',
            })
            .int('Длина должна быть целым числом')
            .min(1, 'Минимальная длина линии - 1 метр')
            .max(500, 'Максимальная длина линии - 500 метров')
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

        // Поле для общего количества потребителей
        totalConsumers: z.coerce
            .number({
                invalid_type_error: 'Количество потребителей должно быть числом',
            })
            .int('Количество потребителей должно быть целым числом')
            .min(1, 'Минимальное количество потребителей - 1')
            .max(20, 'Максимальное количество потребителей - 20')
            .or(z.literal('').transform(() => 1)),

        // Общая мощность всех потребителей
        totalPower: z.coerce
            .number({
                invalid_type_error: 'Общая мощность должна быть числом',
                required_error: 'Укажите общую мощность',
            })
            .positive('Общая мощность должна быть положительным числом')
            .max(20000, 'Максимальная общая мощность - 20000 кВт')
            .or(z.literal('').transform(() => 0)),

        // Флаг для показа индивидуальных мощностей
        showIndividualPowers: z.boolean().default(false),

        // Массив индивидуальных мощностей потребителей
        individualPowers: z.array(consumerSchema).optional(),
    })
    .refine(
        (data) => {
            // Проверка сходимости суммы мощностей с общей мощностью
            if (
                data.showIndividualPowers &&
                data.individualPowers &&
                data.individualPowers.length > 0
            ) {
                const sumIndividualPowers = data.individualPowers.reduce(
                    (sum, consumer) => sum + (consumer.power || 0),
                    0,
                );

                // Допускаем небольшую погрешность в 0.1 кВт из-за округлений
                return Math.abs(sumIndividualPowers - data.totalPower) <= 0.1;
            }
            return true; // Если индивидуальные мощности не указаны, проверка не нужна
        },
        {
            message: 'Сумма мощностей потребителей не совпадает с общей мощностью',
            path: ['totalPower'], // Указываем ошибку на поле общей мощности
        },
    );

export default function ConfigurationForm() {
    // Инициализация формы
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            length: 30,
            poles: 4,
            voltage: 380,
            totalConsumers: 1,
            totalPower: 0,
            showIndividualPowers: false,
            individualPowers: [],
        },
        mode: 'onChange',
    });

    // Получаем значения формы для отслеживания
    const watchTotalConsumers = form.watch('totalConsumers');
    const watchShowIndividualPowers = form.watch('showIndividualPowers');
    const watchTotalPower = form.watch('totalPower');
    const watchIndividualPowers = form.watch('individualPowers');

    // Вычисляем сумму индивидуальных мощностей
    const sumIndividualPowers =
        watchIndividualPowers?.reduce((sum, consumer) => sum + (consumer.power || 0), 0) || 0;

    // Инициализация fieldArray для динамических полей потребителей
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'individualPowers',
    });

    // Функция обработки отправки формы
    function onSubmit(data: z.infer<typeof formSchema>) {
        console.log('Данные конфигуратора:', data);

        console.table({
            'Длина линии (м)': data.length,
            'Количество жил': data.poles,
            'Напряжение питания (В)': data.voltage,
            'Количество потребителей': data.totalConsumers,
            'Общая мощность (кВт)': data.totalPower,
        });

        if (data.showIndividualPowers && data.individualPowers) {
            console.log('Индивидуальные мощности потребителей:');
            data.individualPowers.forEach((consumer, index) => {
                console.log(`  Потребитель ${index + 1}: ${consumer.power || 0} кВт`);
            });
            console.log(`Сумма индивидуальных мощностей: ${sumIndividualPowers} кВт`);
        }

        console.log(`
        📋 Конфигурация электрической линии:
        ──────────────────────────────
        • Длина линии: ${data.length} м
        • Количество жил: ${data.poles}
        • Напряжение питания: ${data.voltage} В
        • Количество потребителей: ${data.totalConsumers}
        • Общая мощность: ${data.totalPower} кВт
        ${data.showIndividualPowers ? '• Используются индивидуальные мощности' : ''}
        ${
            data.showIndividualPowers
                ? `• Сумма индивидуальных мощностей: ${sumIndividualPowers} кВт`
                : ''
        }
        ──────────────────────────────
        `);
    }

    // Функция для обновления массива потребителей при изменении количества
    const updateConsumersArray = (count: number) => {
        const currentCount = fields.length;

        if (count > currentCount) {
            // Добавляем новые поля с расчетом мощности по умолчанию
            const powerPerConsumer = watchTotalPower / count;
            for (let i = currentCount; i < count; i++) {
                append({ power: powerPerConsumer || 0 });
            }
        } else if (count < currentCount) {
            // Удаляем лишние поля
            for (let i = currentCount - 1; i >= count; i--) {
                remove(i);
            }
        }

        // Если есть индивидуальные мощности, перераспределяем общую мощность
        if (watchShowIndividualPowers && count > 0) {
            const remainingPower = watchTotalPower;
            const newPowerPerConsumer = remainingPower / count;

            // Обновляем существующие поля
            fields.forEach((_, index) => {
                if (index < count) {
                    form.setValue(`individualPowers.${index}.power`, newPowerPerConsumer || 0);
                }
            });
        }
    };

    // Обработчик изменения количества потребителей
    const handleConsumersChange = (value: string | number) => {
        const numValue = value === '' ? 1 : Number(value);

        if (numValue < 1) return;

        form.setValue('totalConsumers', numValue);

        // Если включен режим индивидуальных мощностей
        if (watchShowIndividualPowers) {
            updateConsumersArray(numValue);
        }
    };

    // Обработчик изменения общей мощности
    const handleTotalPowerChange = (value: number) => {
        // Если включен режим индивидуальных мощностей, перераспределяем мощность
        if (watchShowIndividualPowers && watchTotalConsumers > 0) {
            const powerPerConsumer = value / watchTotalConsumers;

            fields.forEach((_, index) => {
                form.setValue(`individualPowers.${index}.power`, powerPerConsumer || 0);
            });
        }
    };

    // Эффект для автоматического перераспределения мощности при изменении общего количества
    useEffect(() => {
        if (watchShowIndividualPowers && watchTotalPower > 0) {
            handleTotalPowerChange(watchTotalPower);
        }
    }, [watchTotalConsumers, watchShowIndividualPowers]);

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Конфигуратор электрической линии</CardTitle>
                <CardDescription>
                    Настройте параметры электрической линии для потребителей
                </CardDescription>
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
                                        placeholder="Например: 30"
                                        min={1}
                                        value={field.value === 0 ? '' : field.value}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === '' ? 0 : Number(value));
                                        }}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldDescription>
                                        Укажите длину линии от 1 до 500 метров
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
                            name="totalConsumers"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-configuration-consumers">
                                        Количество потребителей
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-configuration-consumers"
                                        type="number"
                                        placeholder="Например: 1"
                                        min={1}
                                        max={20}
                                        value={field.value === 0 ? '' : field.value}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleConsumersChange(value);
                                        }}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldDescription>
                                        Общее количество потребителей на линии (от 1 до 20)
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Общая мощность потребителей */}
                        <Controller
                            name="totalPower"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-configuration-total-power">
                                        Общая мощность потребителей (кВт)
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-configuration-total-power"
                                        type="number"
                                        placeholder="Например: 100"
                                        min={0.1}
                                        step="0.1"
                                        value={field.value === 0 ? '' : field.value}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const numValue = value === '' ? 0 : Number(value);
                                            field.onChange(numValue);
                                            handleTotalPowerChange(numValue);
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

                        {/* Checkbox для индивидуальных мощностей (показываем только если потребителей > 1) */}
                        {watchTotalConsumers > 1 && (
                            <Controller
                                name="showIndividualPowers"
                                control={form.control}
                                render={({ field }) => (
                                    <Field className="flex items-center gap-2 pt-2">
                                        <Checkbox
                                            id="show-individual-powers"
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked);

                                                if (checked) {
                                                    // Включаем режим индивидуальных мощностей
                                                    updateConsumersArray(watchTotalConsumers);
                                                } else {
                                                    // Выключаем режим, очищаем массив
                                                    while (fields.length > 0) {
                                                        remove(fields.length - 1);
                                                    }
                                                }
                                            }}
                                        />
                                        <FieldLabel
                                            htmlFor="show-individual-powers"
                                            className="!mb-0 cursor-pointer"
                                        >
                                            Известна мощность каждого потребителя
                                        </FieldLabel>
                                        <FieldDescription className="!mt-0">
                                            {field.value &&
                                                watchTotalPower > 0 &&
                                                `(${watchTotalConsumers} потребителей по ${(
                                                    watchTotalPower / watchTotalConsumers
                                                ).toFixed(2)} кВт каждый)`}
                                        </FieldDescription>
                                    </Field>
                                )}
                            />
                        )}

                        {/* Показатель сходимости мощностей */}
                        {watchShowIndividualPowers && watchTotalConsumers > 1 && (
                            <Alert
                                variant={
                                    Math.abs(sumIndividualPowers - watchTotalPower) <= 0.1
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
                                        <span className="font-bold">
                                            {watchTotalPower.toFixed(2)} кВт
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span>Расхождение:</span>
                                        <span
                                            className={`font-bold ${
                                                Math.abs(sumIndividualPowers - watchTotalPower) <=
                                                0.1
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {(sumIndividualPowers - watchTotalPower).toFixed(2)} кВт
                                        </span>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Поля для индивидуальных мощностей потребителей (только если потребителей > 1 и checkbox активен) */}
                        {watchTotalConsumers > 1 && watchShowIndividualPowers && (
                            <div className="space-y-4 pt-4 border-t">
                                <FieldLabel>Мощности потребителей (кВт)</FieldLabel>
                                <FieldDescription>
                                    Укажите мощность для каждого потребителя
                                </FieldDescription>

                                <div className="space-y-3">
                                    {fields.map((field, index) => (
                                        <Controller
                                            key={field.id}
                                            name={`individualPowers.${index}.power`}
                                            control={form.control}
                                            render={({ field: powerField, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <div className="flex items-center gap-2">
                                                        <FieldLabel className="w-32">
                                                            Потребитель {index + 1}
                                                        </FieldLabel>
                                                        <div className="flex-1">
                                                            <Input
                                                                {...powerField}
                                                                type="number"
                                                                placeholder={`Мощность потребителя ${
                                                                    index + 1
                                                                }`}
                                                                min={0.1}
                                                                step="0.1"
                                                                value={
                                                                    powerField.value === 0
                                                                        ? ''
                                                                        : powerField.value
                                                                }
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    powerField.onChange(
                                                                        value === ''
                                                                            ? 0
                                                                            : Number(value),
                                                                    );
                                                                }}
                                                                aria-invalid={fieldState.invalid}
                                                            />
                                                            {fieldState.invalid && (
                                                                <FieldError
                                                                    errors={[fieldState.error]}
                                                                />
                                                            )}
                                                        </div>
                                                        {watchTotalConsumers > 1 && index > 0 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    remove(index);
                                                                    // Обновляем общее количество потребителей
                                                                    form.setValue(
                                                                        'totalConsumers',
                                                                        watchTotalConsumers - 1,
                                                                    );
                                                                }}
                                                                className="h-10 w-10"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </Field>
                                            )}
                                        />
                                    ))}

                                    {/* Кнопка для добавления нового потребителя */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newCount = watchTotalConsumers + 1;
                                            form.setValue('totalConsumers', newCount);

                                            // Добавляем нового потребителя с расчетной мощностью
                                            const powerPerConsumer = watchTotalPower / newCount;
                                            append({ power: powerPerConsumer || 0 });

                                            // Перераспределяем мощность между всеми потребителями
                                            fields.forEach((_, index) => {
                                                form.setValue(
                                                    `individualPowers.${index}.power`,
                                                    powerPerConsumer || 0,
                                                );
                                            });
                                        }}
                                        className="w-full mt-2"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Добавить потребителя
                                    </Button>
                                </div>
                            </div>
                        )}
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                            const values = form.getValues();
                            console.log('Текущие значения формы:', values);

                            let message = `Проверка значений:\n
                                Длина: ${values.length || 0} м\n
                                Жилы: ${values.poles || 0}\n
                                Напряжение: ${values.voltage || 0} В\n
                                Потребители: ${values.totalConsumers || 1}\n
                                Общая мощность: ${values.totalPower || 0} кВт`;

                            if (values.showIndividualPowers && values.individualPowers) {
                                message += '\n\nИндивидуальные мощности:';
                                values.individualPowers.forEach((consumer, index) => {
                                    message += `\n  Потребитель ${index + 1}: ${
                                        consumer.power || 0
                                    } кВт`;
                                });
                                message += `\nСумма: ${sumIndividualPowers.toFixed(2)} кВт`;
                            }

                            alert(message);
                        }}
                    >
                        Показать значения
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                            form.reset({
                                length: 30,
                                poles: 4,
                                voltage: 380,
                                totalConsumers: 1,
                                totalPower: 0,
                                showIndividualPowers: false,
                                individualPowers: [],
                            });
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
