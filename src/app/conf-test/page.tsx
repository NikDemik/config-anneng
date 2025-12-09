'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

// Схема валидации
const formSchema = z.object({
    length: z.coerce
        .number()
        .int('Длина должна быть целым числом')
        .positive('Длина должна быть положительным числом')
        .min(1, 'Минимальная длина линии - 1 метр')
        .max(500, 'Максимальная длина линии - 500 метров'),

    poles: z.coerce
        .number()
        .int('Количество жил должно быть целым числом')
        .positive('Количество жил должно быть положительным числом')
        .min(1, 'Минимальное количество жил - 1')
        .max(12, 'Максимальное количество жил - 12'),

    voltage: z.coerce
        .number()
        .int('Напряжение должно быть целым числом')
        .positive('Напряжение должно быть положительным числом')
        .min(24, 'Минимальное напряжение - 24В')
        .max(1000, 'Максимальное напряжение - 1000В'),

    cranes: z.coerce
        .number()
        .int('Количество кранов должно быть целым числом')
        .min(0, 'Количество кранов не может быть отрицательным')
        .max(10, 'Максимальное количество кранов - 10'),
});

export default function ConfigurationForm() {
    // Инициализация формы
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            length: 4,
            poles: 4,
            voltage: 380,
            cranes: 1,
        },
    });

    // Функция обработки отправки формы
    const onSubmit = (data: z.infer<typeof formSchema>) => {
        // Выводим данные в консоль
        console.log('Данные конфигуратора:', data);

        // Форматированный вывод для удобства
        console.table({
            'Длина линии (м)': data.length,
            'Количество жил': data.poles,
            'Напряжение питания (В)': data.voltage,
            'Количество кранов': data.cranes,
        });

        // Альтернативный красивый вывод
        console.log(`
        📋 Конфигурация электрической линии:
        ──────────────────────────────
        • Длина линии: ${data.length} м
        • Количество жил: ${data.poles}
        • Напряжение питания: ${data.voltage} В
        • Количество кранов: ${data.cranes}
        ──────────────────────────────
        `);

        // Здесь также можно отправить данные на сервер
        // await fetch('/api/configure', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data),
        // });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Длина линии */}
                <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Длина линии (м)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Например: 30"
                                    min={1}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Количество жил */}
                <FormField
                    control={form.control}
                    name="poles"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Количество жил</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Например: 4" min={1} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Напряжение питания */}
                <FormField
                    control={form.control}
                    name="voltage"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Напряжение питания (В)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Например: 380" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Количество кранов */}
                <FormField
                    control={form.control}
                    name="cranes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Количество кранов</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Например: 2" min={0} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Кнопка отправки */}
                <Button type="submit" className="w-full">
                    Сохранить конфигурацию
                </Button>

                {/* Дополнительная кнопка для отладки */}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            const values = form.getValues();
                            console.log('Текущие значения формы:', values);
                            alert(`Проверка значений:\n
                                Длина: ${values.length} м\n
                                Жилы: ${values.poles}\n
                                Напряжение: ${values.voltage} В\n
                                Краны: ${values.cranes}
                            `);
                        }}
                    >
                        Показать текущие значения
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            form.reset();
                            console.log('Форма сброшена к значениям по умолчанию');
                        }}
                    >
                        Сбросить
                    </Button>
                </div>
            </form>
        </Form>
    );
}
