import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Схема валидации
const formSchema = z.object({
    // Длина линии
    length: z.coerce
        .number()
        .int('Длина должна быть целым числом')
        .positive('Длина должна быть положительным числом')
        .min(1, 'Минимальная длина линии - 1 метр')
        .max(500, 'Максимальная длина линии - 500 метров'),
    // Количество жил
    poles: z.coerce
        .number()
        .int('Количество жил должно быть целым числом')
        .positive('Количество жил должно быть положительным числом')
        .min(1, 'Минимальное количество жил - 1')
        .max(12, 'Максимальное количество жил - 12'),
    // Напряжение питания
    voltage: z.coerce
        .number()
        .int('Напряжение должно быть целым числом')
        .positive('Напряжение должно быть положительным числом')
        .min(24, 'Минимальное напряжение - 24В')
        .max(1000, 'Максимальное напряжение - 1000В'),
    // Количество кранов
    cranes: z.coerce
        .number()
        .int('Количество кранов должно быть целым числом')
        .min(0, 'Количество кранов не может быть отрицательным')
        .max(10, 'Максимальное количество кранов - 10'),
});

export default function Step1BaseData({ onNext }: { onNext: (data: any) => void }) {
    const [length, setLength] = useState('');
    const [poles, setPoles] = useState('');
    const [voltage, setVoltage] = useState('');
    const [cranes, setCranes] = useState('');

    // Инициализация формы
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            length: 0,
            poles: 0,
            voltage: 0,
            cranes: 0,
        },
    });

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        console.log('Данные конфигуратора:', data);
        onNext({ data });
        // onNext({
        //     length: Number(length),
        //     poles: Number(poles),
        //     voltage: Number(voltage),
        //     cranes: Number(cranes),
        // });

        // Здесь также можно отправить данные на сервер
        // await fetch('/api/configure', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data),
        // });
    };

    return (
        <Card className="p-6 max-w-xl">
            <CardHeader>
                <CardTitle>Введите данные</CardTitle>
                <CardDescription>Основные параметры линии</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <form id="form-base-data" onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Длина линии */}
                    <div className="space-y-2">
                        <Label>Длина линии (м)</Label>
                        <Input
                            type="number"
                            min={1}
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            placeholder="Например: 30"
                        />
                    </div>

                    {/* Количество жил */}
                    <div className="space-y-2">
                        <Label>Количество жил</Label>
                        <Input
                            type="number"
                            min={1}
                            value={poles}
                            onChange={(e) => setPoles(e.target.value)}
                            placeholder="Например: 4"
                        />
                    </div>

                    {/* Напряжение питания */}
                    <div className="space-y-2">
                        <Label>Напряжение питания (В)</Label>
                        <Input
                            type="number"
                            value={voltage}
                            onChange={(e) => setVoltage(e.target.value)}
                            placeholder="Например: 380"
                        />
                    </div>

                    {/* Количество кранов */}
                    <div className="space-y-2">
                        <Label>Количество кранов</Label>
                        <Input
                            type="number"
                            min={0}
                            value={cranes}
                            onChange={(e) => setCranes(e.target.value)}
                            placeholder="Например: 2"
                        />
                    </div>

                    <Button type="submit" form="form-base-data" className="w-full mt-2">
                        Далее
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
