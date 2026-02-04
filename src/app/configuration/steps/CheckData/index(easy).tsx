// src/app/configuration/steps/Step4/index.tsx (упрощенная версия)
'use client';

import { useState } from 'react';
import { useConfiguration } from '../../context/ConfigurationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Calculator } from 'lucide-react';

export default function Step4() {
    const { data } = useConfiguration();
    const [loading, setLoading] = useState(false);
    const [calculations, setCalculations] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = async () => {
        setLoading(true);
        setError(null);

        try {
            // Вариант 1: Локальный расчет
            const result = performCalculations(data);
            setCalculations(result);

            // Вариант 2: Отправка на API (раскомментировать)
            // const response = await fetch('/api/calculate', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data),
            // });
            // const result = await response.json();
            // setCalculations(result.calculations);

            // Сохраняем в localStorage для будущего использования
            saveToLocalStorage(data, result);
        } catch (err) {
            setError('Ошибка расчета');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const performCalculations = (config: typeof data) => {
        // Простые расчеты
        const totalCurrent = (config.totalPower * 1000) / (config.voltage * 1.73);
        const cableSection = Math.max(1.5, totalCurrent / 6);
        const voltageDrop = (totalCurrent * config.length * 0.018) / cableSection;

        return {
            totalCurrent: totalCurrent.toFixed(2),
            cableSection: cableSection.toFixed(2),
            voltageDropPercent: ((voltageDrop / config.voltage) * 100).toFixed(1),
            recommendedBreaker: Math.ceil(totalCurrent * 1.25),
            estimatedCost: Math.round(config.length * cableSection * 100),
        };
    };

    const saveToLocalStorage = (config: typeof data, calc: any) => {
        const saved = {
            id: Date.now(),
            config,
            calc,
            date: new Date().toISOString(),
        };

        const existing = localStorage.getItem('electrical-calculations');
        const all = existing ? JSON.parse(existing) : [];
        all.push(saved);
        localStorage.setItem('electrical-calculations', JSON.stringify(all));
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <h2 className="text-xl font-bold mb-4">Результаты расчета</h2>

                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {calculations ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded">
                                <div className="text-sm text-blue-600">Ток нагрузки</div>
                                <div className="text-2xl font-bold">
                                    {calculations.totalCurrent} А
                                </div>
                            </div>
                            <div className="p-4 bg-green-50 rounded">
                                <div className="text-sm text-green-600">Сечение кабеля</div>
                                <div className="text-2xl font-bold">
                                    {calculations.cableSection} мм²
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 rounded">
                                <div className="text-sm text-amber-600">Падение напряжения</div>
                                <div className="text-2xl font-bold">
                                    {calculations.voltageDropPercent}%
                                </div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded">
                                <div className="text-sm text-purple-600">Автомат защиты</div>
                                <div className="text-2xl font-bold">
                                    {calculations.recommendedBreaker}А
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Нажмите кнопку для расчета параметров</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-center">
                        <Button
                            onClick={handleCalculate}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Расчет...
                                </>
                            ) : (
                                <>
                                    <Calculator className="h-4 w-4" />
                                    {calculations ? 'Пересчитать' : 'Рассчитать параметры'}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* История расчетов */}
            {calculations && (
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="font-bold mb-3">Сохраненные данные</h3>
                        <div className="text-sm text-gray-600">
                            Данные сохранены в браузере. Вы можете использовать их для:
                        </div>
                        <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
                            <li>Сравнения разных вариантов</li>
                            <li>Формирования отчетов</li>
                            <li>Печати спецификаций</li>
                            <li>Отправки на почту</li>
                        </ul>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                const dataStr = JSON.stringify(
                                    { config: data, calculations },
                                    null,
                                    2,
                                );
                                navigator.clipboard.writeText(dataStr);
                                alert('Данные скопированы!');
                            }}
                        >
                            Копировать данные
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
