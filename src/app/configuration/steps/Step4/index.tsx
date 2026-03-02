// src/app/configuration/steps/Step4/index.tsx
'use client';

import { useConfiguration } from '../../context/ConfigurationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Siren, Cable, CircleGauge, Wrench, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Step4() {
    const { data, updateAdditionalComponents, goToPrevStep, goToNextStep } = useConfiguration();
    const { additionalComponents } = data;

    const handleCheckboxChange = (key: keyof typeof additionalComponents) => {
        updateAdditionalComponents({
            [key]: !additionalComponents[key],
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        goToNextStep();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* <Card> */}
            {/* <CardHeader>
                    <CardTitle className="text-lg">Дополнительные компоненты</CardTitle>
                    <CardDescription>
                        Выберите дополнительные элементы для вашей линии
                    </CardDescription>
                </CardHeader> */}
            {/* <CardContent className="space-y-6"> */}
            {/* Подсказка */}
            <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                    Вы можете добавить дополнительные компоненты к вашей линии. Это повлияет на
                    итоговую стоимость и комплектацию.
                </AlertDescription>
            </Alert>

            {/* Светофор */}
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                    id="trafficLight"
                    checked={additionalComponents.trafficLight}
                    onCheckedChange={() => handleCheckboxChange('trafficLight')}
                    className="mt-1"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Siren className="h-5 w-5 text-red-500" />
                        <Label
                            htmlFor="trafficLight"
                            className="text-base font-medium cursor-pointer"
                        >
                            Добавить светофор
                        </Label>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Световая сигнализация для оповещения о работе линии. Рекомендуется для зон с
                        интенсивным движением.
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                        • Напряжение: 220В • Устанавливается через каждые 50м
                    </div>
                </div>
            </div>

            {/* Секция изоляции */}
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                    id="insulationSection"
                    checked={additionalComponents.insulationSection}
                    onCheckedChange={() => handleCheckboxChange('insulationSection')}
                    className="mt-1"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Cable className="h-5 w-5 text-blue-500" />
                        <Label
                            htmlFor="insulationSection"
                            className="text-base font-medium cursor-pointer"
                        >
                            Добавить секцию изоляции
                        </Label>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Изолирующая секция для разделения линии на независимые участки. Необходима
                        при ремонтных работах.
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                        • Длина: 1м • Устанавливается через каждые 50м • Цена: +8 900 ₽
                    </div>
                </div>
            </div>

            {/* Резина */}
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                    id="rubber"
                    checked={additionalComponents.rubber}
                    onCheckedChange={() => handleCheckboxChange('rubber')}
                    className="mt-1"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <CircleGauge className="h-5 w-5 text-green-500" />
                        <Label htmlFor="rubber" className="text-base font-medium cursor-pointer">
                            Добавить резину
                        </Label>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Резиновые уплотнители для защиты от пыли и влаги. Увеличивают срок службы
                        оборудования.
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                        • Материал: EPDM • Степень защиты: IP44
                    </div>
                </div>
            </div>

            {/* Кронштейны */}
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                    id="brackets"
                    checked={additionalComponents.brackets}
                    onCheckedChange={() => handleCheckboxChange('brackets')}
                    className="mt-1"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-amber-500" />
                        <Label htmlFor="brackets" className="text-base font-medium cursor-pointer">
                            Добавить кронштейны
                        </Label>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Усиленные монтажные кронштейны для надежной фиксации линии. Рекомендуются
                        для вибрационных нагрузок.
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                        • Материал: оцинкованная сталь • Нагрузка: до 150 кг • Цена: +1 800 ₽/шт
                    </div>
                </div>
            </div>

            {/* Информация о выбранных компонентах */}
            <div className="mt-6 p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Выбранные компоненты:</h4>
                <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        Светофор: {additionalComponents.trafficLight ? '✓ Да' : '✗ Нет'}
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        Секция изоляции: {additionalComponents.insulationSection ? '✓ Да' : '✗ Нет'}
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        Резина: {additionalComponents.rubber ? '✓ Да' : '✗ Нет'}
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        Кронштейны: {additionalComponents.brackets ? '✓ Да' : '✗ Нет'}
                    </li>
                </ul>
            </div>
            {/* </CardContent> */}
            {/* </Card> */}

            {/* Кнопки навигации */}
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={goToPrevStep}>
                    Назад к потребителям
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Далее к проверке
                </Button>
            </div>
        </form>
    );
}