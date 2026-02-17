// src/app/configuration/steps/Step4/index.tsx
'use client';

import { useState, useEffect } from 'react';
import { useConfiguration } from '../../context/ConfigurationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CheckCircle,
    AlertCircle,
    Download,
    Printer,
    Share2,
    Copy,
    Save,
    Database,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    calculateTotalCurrent,
    performCompleteCalculations,
} from '@/app/configuration/utils/calculations';

export default function Step4() {
    const { data, updateCalculations, saveCompleteConfiguration, resetData, goToStep } =
        useConfiguration();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [calculations, setCalculations] = useState<any>(null);

    // Автоматический расчет при загрузке или изменении данных
    useEffect(() => {
        if (data.totalPower > 0 && data.voltage > 0) {
            const calc = performCompleteCalculations(data);
            setCalculations(calc);
            // Сохраняем расчеты в контекст
            updateCalculations(calc);
        }
    }, [data.totalPower, data.voltage, data.totalConsumers, data.length]);

    // Проверка данных
    const validationResults = {
        length: data.length > 0 && data.length <= 1000,
        poles: data.poles > 0 && data.poles <= 12,
        voltage: data.voltage >= 24 && data.voltage <= 1000,
        powerType: data.powerType === 'end' || data.powerType === 'linear',
        totalConsumers: data.totalConsumers > 0 && data.totalConsumers <= 12,
        totalPower: data.totalPower > 0 && data.totalPower <= 20000,
        powerMismatch: () => {
            if (!data.showIndividualPowers || !data.individualPowers) return true;
            const sum = data.individualPowers.reduce(
                (total, consumer) => total + consumer.power,
                0,
            );
            return Math.abs(sum - data.totalPower) <= 0.1;
        },
        lengthAndPowerType: () => {
            if (data.length > 150) {
                return data.powerType === 'linear';
            }
            return true;
        },
    };

    const allValid =
        validationResults.length &&
        validationResults.poles &&
        validationResults.voltage &&
        validationResults.powerType &&
        validationResults.totalConsumers &&
        validationResults.totalPower &&
        validationResults.powerMismatch() &&
        validationResults.lengthAndPowerType();

    // Расчетные параметры
    const calculateParameters = () => {
        // Пример расчетов - можно расширить
        const totalCurrent = calculateTotalCurrent(data); // Для трехфазной
        // const totalCurrent = (data.totalPower * 1000) / (data.voltage * 1.73 * 0.8 * 0.9);
        const recommendedCableSection = Math.max(1.5, totalCurrent / 6); // Упрощенный расчет

        return {
            totalCurrent: totalCurrent.toFixed(2),
            recommendedCableSection: recommendedCableSection.toFixed(2),
            maxLengthForVoltageDrop: (
                (data.voltage * 0.05 * 1000) /
                (totalCurrent * 0.018)
            ).toFixed(0), // 5% падение
        };
    };

    const calculated = calculateParameters();

    const handleConfirm = () => {
        // Сохраняем полную конфигурацию
        const savedConfig = saveCompleteConfiguration();
        setIsConfirmed(true);

        // Здесь можно добавить отправку данных на сервер
        console.log('Конфигурация подтверждена:', savedConfig);

        // Можно показать уведомление
        alert('✅ Конфигурация успешно сохранена!');
    };

    // Копировать в буфер
    const handleCopyToClipboard = () => {
        const configText = `
            Конфигурация электрической линии:
            ==============================
            1. Основные параметры:
            - Длина линии: ${data.length} м
            - Количество жил: ${data.poles}
            
            2. Параметры питания:
            - Напряжение: ${data.voltage} В
            - Тип питания: ${data.powerType === 'end' ? 'Концевое' : 'Линейное'}
            ${data.length > 150 ? '  (автоматически выбрано линейное питание)' : ''}
            
            3. Потребители:
            - Количество: ${data.totalConsumers} шт
            - Общая мощность: ${data.totalPower} кВт
            ${
                data.showIndividualPowers &&
                data.individualPowers &&
                data.individualPowers.length > 0
                    ? `  - Индивидуальные мощности: ${data.individualPowers.map((p, i) => `П${i + 1}: ${p.power} кВт`).join(', ')}`
                    : ''
            }
                    
            4. Расчетные параметры:
            - Общий ток: ${calculated.totalCurrent} А
            - Рекомендуемое сечение кабеля: ${calculated.recommendedCableSection} мм²
            - Макс. длина без потерь: ${calculated.maxLengthForVoltageDrop} м
            - Коэффициент одновременности: ${calculations?.simultaneityFactor || 'N/A'} (${Math.round((calculations?.simultaneityFactor || 0) * 100)}%)
            ==============================
            Дата сохранения: ${new Date().toLocaleString('ru-RU')}
            `.trim();

        navigator.clipboard.writeText(configText);
        alert('Конфигурация скопирована в буфер обмена!');
    };

    // Экспорт в json
    const handleExportJSON = () => {
        const jsonData = {
            config: data,
            calculated,
            timestamp: new Date().toISOString(),
            version: '1.0',
        };

        const dataStr = JSON.stringify(jsonData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `конфигурация-линии-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    // Печать
    const handlePrint = () => {
        window.print();
    };

    const handleViewSaved = () => {
        try {
            const saved = localStorage.getItem('saved-configurations');
            const configurations = saved ? JSON.parse(saved) : [];
            console.log('Сохраненные конфигурации:', configurations);
            alert(
                `Найдено ${configurations.length} сохраненных конфигураций. Проверьте консоль для деталей.`,
            );
        } catch (error) {
            console.error('Ошибка чтения сохраненных конфигураций:', error);
        }
    };

    if (!calculations) {
        return (
            <Card>
                <CardContent className="pt-6 text-center py-12">
                    <div className="animate-pulse">
                        <p className="text-gray-600">Выполняется расчет параметров...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Статус проверки */}
            <Alert variant={allValid ? 'default' : 'destructive'}>
                {allValid ? (
                    <CheckCircle className="h-4 w-4" />
                ) : (
                    <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription className="flex justify-between items-center">
                    <span>
                        {allValid
                            ? '✅ Все данные корректны и готовы к сохранению'
                            : '⚠️ Обнаружены ошибки в конфигурации. Пожалуйста, исправьте их перед сохранением.'}
                    </span>
                    {data.calculations && (
                        <Badge variant="outline" className="ml-2">
                            <Database className="h-3 w-3 mr-1" />
                            Расчет выполнен
                        </Badge>
                    )}
                </AlertDescription>
            </Alert>

            {/* Детальный обзор конфигурации */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Левая колонка - основные данные */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Обзор конфигурации</CardTitle>
                        <CardDescription>Проверьте все введенные параметры</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Шаг 1 */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700">
                                    Шаг 1: Основные параметры
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => goToStep(1)}>
                                    Изменить
                                </Button>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-gray-600">Длина линии:</span>
                                        <div className="font-bold">{data.length} м</div>
                                        <Badge
                                            variant={
                                                validationResults.length ? 'default' : 'destructive'
                                            }
                                        >
                                            {validationResults.length ? '✓ Корректно' : 'Ошибка'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Количество жил:</span>
                                        <div className="font-bold">{data.poles} шт</div>
                                        <Badge
                                            variant={
                                                validationResults.poles ? 'default' : 'destructive'
                                            }
                                        >
                                            {validationResults.poles ? '✓ Корректно' : 'Ошибка'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Шаг 2 */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700">
                                    Шаг 2: Параметры питания
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => goToStep(2)}>
                                    Изменить
                                </Button>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-gray-600">Напряжение:</span>
                                        <div className="font-bold">{data.voltage} В</div>
                                        <Badge
                                            variant={
                                                validationResults.voltage
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                        >
                                            {validationResults.voltage ? '✓ Корректно' : 'Ошибка'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Тип питания:</span>
                                        <div className="font-bold">
                                            {data.powerType === 'end' ? 'Концевое' : 'Линейное'}
                                            {data.length > 150 && ' (автоматически)'}
                                        </div>
                                        <Badge
                                            variant={
                                                validationResults.lengthAndPowerType()
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                        >
                                            {validationResults.lengthAndPowerType()
                                                ? '✓ Корректно'
                                                : 'Ошибка'}
                                        </Badge>
                                    </div>
                                </div>
                                {data.length > 150 && data.powerType === 'linear' && (
                                    <div className="mt-2 text-sm text-amber-600">
                                        ⚠️ Автоматически выбрано линейное питание из-за длины линии
                                        &gt; 150 м
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Шаг 3 */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700">
                                    Шаг 3: Потребители и мощность
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => goToStep(3)}>
                                    Изменить
                                </Button>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-gray-600">Потребители:</span>
                                        <div className="font-bold">{data.totalConsumers} шт</div>
                                        <Badge
                                            variant={
                                                validationResults.totalConsumers
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                        >
                                            {validationResults.totalConsumers
                                                ? '✓ Корректно'
                                                : 'Ошибка'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Общая мощность:</span>
                                        <div className="font-bold">{data.totalPower} кВт</div>
                                        <Badge
                                            variant={
                                                validationResults.totalPower
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                        >
                                            {validationResults.totalPower
                                                ? '✓ Корректно'
                                                : 'Ошибка'}
                                        </Badge>
                                    </div>
                                </div>

                                {data.showIndividualPowers &&
                                    data.individualPowers &&
                                    data.individualPowers.length > 0 && (
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="text-sm font-medium text-gray-700 mb-2">
                                                Индивидуальные мощности:
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {data.individualPowers.map((consumer, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex justify-between items-center"
                                                    >
                                                        <span className="text-sm">
                                                            Потребитель {index + 1}:
                                                        </span>
                                                        <span className="font-bold">
                                                            {consumer.power} кВт
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-2 flex justify-between text-sm">
                                                <span>Сумма:</span>
                                                <span
                                                    className={`font-bold ${
                                                        validationResults.powerMismatch()
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }`}
                                                >
                                                    {data.individualPowers
                                                        .reduce((sum, c) => sum + c.power, 0)
                                                        .toFixed(2)}{' '}
                                                    кВт
                                                </span>
                                            </div>
                                            <Badge
                                                variant={
                                                    validationResults.powerMismatch()
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                                className="mt-2"
                                            >
                                                {validationResults.powerMismatch()
                                                    ? '✓ Сумма совпадает с общей мощностью'
                                                    : 'Ошибка: сумма не совпадает'}
                                            </Badge>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Правая колонка - расчеты и действия */}
                <div className="space-y-6">
                    {/* Расчетные параметры */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Расчетные параметры</CardTitle>
                            <CardDescription>Автоматически рассчитанные значения</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-blue-50 p-3 rounded">
                                    <div className="text-sm text-blue-600">Общий ток нагрузки</div>
                                    <div className="text-xl font-bold text-blue-700">
                                        {calculated.totalCurrent} А
                                    </div>
                                    <div className="text-xs text-blue-500 mt-1">
                                        При напряжении {data.voltage} В
                                    </div>
                                </div>
                                {/* <div className="bg-green-50 p-3 rounded">
                                    <div className="text-sm text-green-600">
                                        Рекомендуемое сечение
                                    </div>
                                    <div className="text-xl font-bold text-green-700">
                                        {calculated.recommendedCableSection} мм²
                                    </div>
                                    <div className="text-xs text-green-500 mt-1">
                                        Медь, 3-фазная сеть
                                    </div>
                                </div> */}
                            </div>
                            {/* <div className="bg-amber-50 p-3 rounded">
                                <div className="text-sm text-amber-600">
                                    Максимальная длина без потерь
                                </div>
                                <div className="text-xl font-bold text-amber-700">
                                    {calculated.maxLengthForVoltageDrop} м
                                </div>
                                <div className="text-xs text-amber-500 mt-1">
                                    Допустимое падение напряжения 5%
                                </div>
                            </div> */}

                            {/* {parseInt(calculated.maxLengthForVoltageDrop) < data.length && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Внимание! Длина линии ({data.length} м) превышает
                                        рекомендуемую для выбранных параметров. Рассмотрите
                                        увеличение сечения кабеля или снижение мощности.
                                    </AlertDescription>
                                </Alert>
                            )} */}
                        </CardContent>
                    </Card>

                    {/* Действия */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Действия</CardTitle>
                            <CardDescription>Экспорт и управление конфигурацией</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={handleCopyToClipboard}
                                >
                                    <Copy className="h-4 w-4" />
                                    Копировать
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={handleExportJSON}
                                >
                                    <Download className="h-4 w-4" />
                                    Экспорт JSON
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={handlePrint}
                                >
                                    <Printer className="h-4 w-4" />
                                    Печать
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={handleViewSaved}
                                >
                                    <Database className="h-4 w-4" />
                                    Просмотр
                                </Button>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={resetData}
                                >
                                    Начать заново
                                </Button>

                                <Button
                                    className={`w-full ${allValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
                                    onClick={handleConfirm}
                                    disabled={!allValid || isConfirmed}
                                >
                                    {isConfirmed ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Сохранено
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Сохранить конфигурацию
                                        </>
                                    )}
                                </Button>

                                {!allValid && (
                                    <div className="text-sm text-red-600 text-center">
                                        Для подтверждения исправьте все ошибки
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Сводная информация */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Итоговая информация</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-gray-50 rounded">
                            <div className="text-2xl font-bold text-blue-600">{data.length} м</div>
                            <div className="text-sm text-gray-600">Длина линии</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded">
                            <div className="text-2xl font-bold text-green-600">
                                {data.totalPower} кВт
                            </div>
                            <div className="text-sm text-gray-600">Общая мощность</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded">
                            <div className="text-2xl font-bold text-amber-600">
                                {calculated.totalCurrent} А
                            </div>
                            <div className="text-sm text-gray-600">Ток нагрузки</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.totalConsumers}
                            </div>
                            <div className="text-sm text-gray-600">Потребителей</div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                        <h4 className="font-bold text-blue-700 mb-2">Рекомендации:</h4>
                        <ul className="space-y-1 text-sm text-blue-600">
                            <li>
                                • Используйте кабель сечением не менее{' '}
                                {calculated.recommendedCableSection} мм²
                            </li>
                            <li>
                                • Для защиты используйте автомат на{' '}
                                {Math.ceil(parseFloat(calculated.totalCurrent) * 1.25)}А
                            </li>
                            <li>
                                • Проверьте соответствие выбранного типа питания (
                                {data.powerType === 'end' ? 'концевого' : 'линейного'}) требованиям
                                проекта
                            </li>
                            {data.showIndividualPowers && (
                                <li>• Распределите нагрузку равномерно между фазами</li>
                            )}
                        </ul>
                    </div>

                    {data.calculations && (
                        <div className="mt-4 text-sm text-gray-500 text-right">
                            Расчет выполнен: {new Date(data.savedAt || '').toLocaleString('ru-RU')}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
