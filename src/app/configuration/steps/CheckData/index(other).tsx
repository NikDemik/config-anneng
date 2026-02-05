// src/app/configuration/steps/Step4/index.tsx (частично обновленный)
'use client';

import { useState, useEffect } from 'react';
import { useConfiguration } from '../../context/ConfigurationContext';
import {
    performCompleteCalculations,
    getFactorDescription,
    calculateCurrentSavings,
} from '../../utils/calculations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Calculator,
    Zap,
    Cpu,
    TrendingDown,
    DollarSign,
    Shield,
    Info,
    AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function Step4() {
    const { data } = useConfiguration();
    const [calculations, setCalculations] = useState<any>(null);
    const [currentSavings, setCurrentSavings] = useState<any>(null);

    // Автоматический расчет при загрузке или изменении данных
    useEffect(() => {
        if (data.totalPower > 0 && data.voltage > 0) {
            const calc = performCompleteCalculations(data);
            setCalculations(calc);

            const savings = calculateCurrentSavings(data);
            setCurrentSavings(savings);
        }
    }, [data]);

    const handleSaveResults = () => {
        if (!calculations) return;

        // Сохраняем в localStorage
        const savedData = {
            id: `calc-${Date.now()}`,
            config: data,
            calculations,
            timestamp: new Date().toISOString(),
        };

        const existing = localStorage.getItem('electrical-calculations');
        const all = existing ? JSON.parse(existing) : [];
        all.push(savedData);
        localStorage.setItem('electrical-calculations', JSON.stringify(all));

        alert('Результаты сохранены!');
    };

    const handleExportData = () => {
        if (!calculations) return;

        const exportData = {
            configuration: data,
            calculations,
            factorDescription: getFactorDescription(data.totalConsumers),
            savings: currentSavings,
            generatedAt: new Date().toISOString(),
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `расчет-линии-${new Date().toISOString().slice(0, 10)}.json`);
        link.click();
    };

    if (!calculations) {
        return (
            <Card>
                <CardContent className="pt-6 text-center">
                    <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Введите данные для расчета</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Карточка с коэффициентом одновременности */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Коэффициент одновременности
                    </CardTitle>
                    <CardDescription className="text-blue-600">
                        {getFactorDescription(data.totalConsumers)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-white rounded border">
                            <div className="text-sm text-gray-600">Потребителей</div>
                            <div className="text-2xl font-bold">{data.totalConsumers}</div>
                        </div>
                        <div className="p-3 bg-white rounded border">
                            <div className="text-sm text-gray-600">Коэффициент</div>
                            <div className="text-2xl font-bold">
                                {calculations.simultaneityFactor}
                            </div>
                        </div>
                        <div className="p-3 bg-white rounded border">
                            <div className="text-sm text-gray-600">Экономия тока</div>
                            <div className="text-2xl font-bold text-green-600">
                                {currentSavings?.savingsPercent || 0}%
                            </div>
                        </div>
                        <div className="p-3 bg-white rounded border">
                            <div className="text-sm text-gray-600">Ток без учета</div>
                            <div className="text-2xl font-bold text-gray-500">
                                {currentSavings?.baseCurrent || 0}А
                            </div>
                        </div>
                    </div>

                    {/* Пояснение коэффициента */}
                    <div className="mt-4 text-sm text-blue-700">
                        <p>
                            Коэффициент одновременности учитывает вероятность одновременной работы
                            всех потребителей. Чем больше потребителей, тем меньше вероятность их
                            одновременной работы, что позволяет использовать меньший ток.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Основные результаты расчета */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Левая колонка - электрические параметры */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            Электрические параметры
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Ток нагрузки */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="text-sm font-medium">
                                    Ток нагрузки (с учетом коэффициента)
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                    {calculations.consumerCount} потребителей
                                </Badge>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-bold">
                                    {calculations.totalCurrent} А
                                </div>
                                <div className="text-sm text-gray-500">
                                    (было бы {currentSavings?.baseCurrent || 0}А без коэффициента)
                                </div>
                            </div>
                            <Progress
                                value={
                                    (calculations.totalCurrent /
                                        (currentSavings?.baseCurrent || 1)) *
                                    100
                                }
                                className="h-2"
                            />
                        </div>

                        {/* Падение напряжения */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <div className="text-sm font-medium">Падение напряжения</div>
                                <Badge
                                    variant={
                                        calculations.voltageDropPercent <= 3
                                            ? 'default'
                                            : calculations.voltageDropPercent <= 5
                                              ? 'outline'
                                              : 'destructive'
                                    }
                                >
                                    {calculations.voltageDropPercent <= 3
                                        ? '✓ Хорошо'
                                        : calculations.voltageDropPercent <= 5
                                          ? '⚠️ Допустимо'
                                          : '✗ Критично'}
                                </Badge>
                            </div>
                            <div className="text-2xl font-bold">
                                {calculations.voltageDropPercent}%
                            </div>
                            {calculations.voltageDropPercent > 5 && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Падение напряжения превышает рекомендуемые 5%. Рассмотрите
                                        увеличение сечения кабеля.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Сечение кабеля */}
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Рекомендуемое сечение кабеля</div>
                            <div className="text-2xl font-bold">
                                {calculations.recommendedCableSection} мм²
                            </div>
                            <div className="text-sm text-gray-600">
                                Медь, 3-фазная система, плотность тока 6 А/мм²
                            </div>
                        </div>

                        {/* Автомат защиты */}
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Автомат защиты</div>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                {calculations.recommendedBreaker}А
                                <Shield className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="text-sm text-gray-600">
                                С запасом 25% от расчетного тока
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Правая колонка - дополнительные параметры */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cpu className="h-5 w-5" />
                            Дополнительные параметры
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Длина линии */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <div className="text-sm font-medium">
                                    Макс. длина без потерь (5%)
                                </div>
                                <Badge
                                    variant={
                                        data.length <= calculations.maxLengthFor5Percent
                                            ? 'default'
                                            : 'destructive'
                                    }
                                >
                                    {data.length <= calculations.maxLengthFor5Percent
                                        ? '✓ Норма'
                                        : '✗ Превышение'}
                                </Badge>
                            </div>
                            <div className="text-2xl font-bold">
                                {calculations.maxLengthFor5Percent} м
                            </div>
                            <div className="text-sm text-gray-600">
                                Ваша длина: {data.length} м (
                                {data.length <= calculations.maxLengthFor5Percent
                                    ? 'в норме'
                                    : 'превышает'}
                                )
                            </div>
                        </div>

                        {/* Экономия */}
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="h-5 w-5 text-green-600" />
                                    <div className="font-bold text-green-700">
                                        Экономия благодаря коэффициенту
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-sm text-green-600">Снижение тока</div>
                                        <div className="text-xl font-bold">
                                            {currentSavings?.savings || 0} А
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-green-600">
                                            Процент экономии
                                        </div>
                                        <div className="text-xl font-bold">
                                            {currentSavings?.savingsPercent || 0}%
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-green-600 mt-2">
                                    Экономия позволяет использовать кабель меньшего сечения и
                                    автомат меньшего номинала
                                </div>
                            </CardContent>
                        </Card>

                        {/* Стоимость */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-amber-600" />
                                <div className="text-sm font-medium">Примерная стоимость</div>
                            </div>
                            <div className="text-2xl font-bold">
                                {calculations.estimatedCost.toLocaleString('ru-RU')} ₽
                            </div>
                            <div className="text-sm text-gray-600">
                                Кабель: {data.length}м × {calculations.recommendedCableSection}мм² ×
                                120₽ + монтаж {data.totalConsumers} точек
                            </div>
                        </div>

                        {/* Технические детали */}
                        <div className="space-y-2 text-sm">
                            <div className="font-medium">Технические детали:</div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <div className="text-gray-600">Ток на фазу:</div>
                                    <div className="font-bold">{calculations.phaseCurrent} А</div>
                                </div>
                                <div>
                                    <div className="text-gray-600">Коэф. безопасности:</div>
                                    <div className="font-bold">{calculations.safetyFactor}</div>
                                </div>
                                <div>
                                    <div className="text-gray-600">Напряжение:</div>
                                    <div className="font-bold">{data.voltage} В</div>
                                </div>
                                <div>
                                    <div className="text-gray-600">Общая мощность:</div>
                                    <div className="font-bold">{data.totalPower} кВт</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Действия */}
            <Card>
                <CardHeader>
                    <CardTitle>Управление результатами</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={handleSaveResults} className="flex-1">
                            Сохранить результаты
                        </Button>
                        <Button onClick={handleExportData} variant="outline" className="flex-1">
                            Экспорт в JSON
                        </Button>
                        <Button onClick={() => window.print()} variant="outline">
                            Печать отчета
                        </Button>
                    </div>

                    {/* Сводка */}
                    <div className="mt-6 p-4 bg-gray-50 rounded text-sm">
                        <div className="font-bold mb-2">Итоговая сводка:</div>
                        <ul className="space-y-1">
                            <li>
                                • Для {data.totalConsumers} потребителей применен коэффициент
                                одновременности {calculations.simultaneityFactor}
                            </li>
                            <li>
                                • Расчетный ток: {calculations.totalCurrent}А (вместо{' '}
                                {currentSavings?.baseCurrent || 0}А)
                            </li>
                            <li>
                                • Рекомендуемое сечение кабеля:{' '}
                                {calculations.recommendedCableSection} мм²
                            </li>
                            <li>• Автомат защиты: {calculations.recommendedBreaker}А</li>
                            <li>
                                • Падение напряжения: {calculations.voltageDropPercent}% (
                                {calculations.voltageDropPercent <= 5
                                    ? 'допустимо'
                                    : 'требует корректировки'}
                                )
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Таблица коэффициентов для справки */}
            <Card>
                <CardHeader>
                    <CardTitle>Таблица коэффициентов одновременности</CardTitle>
                    <CardDescription>Коэффициенты применяются к базовому току</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 text-left">Кол-во потребителей</th>
                                    <th className="p-2 text-left">Коэффициент</th>
                                    <th className="p-2 text-left">Процент</th>
                                    <th className="p-2 text-left">Пример расчета</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => {
                                    const factor = count === 1 ? 1.0 : 1.0 - (count - 1) * 0.05;
                                    const baseCurrent = 100; // Пример
                                    const result = baseCurrent * factor;

                                    return (
                                        <tr
                                            key={count}
                                            className={
                                                count === data.totalConsumers ? 'bg-blue-50' : ''
                                            }
                                        >
                                            <td className="p-2">{count}</td>
                                            <td className="p-2 font-mono">{factor.toFixed(2)}</td>
                                            <td className="p-2">{Math.round(factor * 100)}%</td>
                                            <td className="p-2">
                                                {baseCurrent}А × {factor.toFixed(2)} ={' '}
                                                {result.toFixed(1)}А
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        <p>
                            <strong>Пояснение:</strong> Коэффициенты основаны на вероятности
                            одновременной работы всех потребителей. При 10 потребителях используется
                            минимальный коэффициент 0.55.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
