// src/app/configuration/steps/Step5/index.tsx
'use client';

import { useEffect } from 'react';
import { useConfiguration } from '../../context/ConfigurationContext';
import { KitDisplay } from '../../components/KitDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Download, ShoppingCart, RotateCcw } from 'lucide-react';
import { useCatalog } from '../../hooks/useCatalog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Step5() {
    const { data, goToPrevStep, resetData } = useConfiguration();
    const { kit, loading, error, buildKit } = useCatalog();

    // Автоматически запускаем подбор при загрузке шага
    useEffect(() => {
        if (data.calculations) {
            buildKit();
        }
    }, []);

    const handleNewConfiguration = () => {
        resetData();
    };

    if (!data.calculations) {
        return (
            <Card>
                <CardContent className="pt-6 text-center py-12">
                    <p className="text-gray-600 mb-4">
                        Необходимо выполнить расчет на предыдущем шаге
                    </p>
                    <Button onClick={() => goToPrevStep()}>Вернуться к расчету</Button>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <Alert variant="destructive">
                    <AlertDescription>Ошибка при подборе комплектующих: {error}</AlertDescription>
                </Alert>
                <div className="flex justify-between">
                    <Button variant="outline" onClick={goToPrevStep}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Назад
                    </Button>
                    <Button onClick={buildKit}>Повторить попытку</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Информация о конфигурации */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="p-3 bg-blue-50 rounded">
                            <div className="text-blue-600 font-medium">Длина линии</div>
                            <div className="text-xl font-bold">{data.length} м</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded">
                            <div className="text-green-600 font-medium">Расчетный ток</div>
                            <div className="text-xl font-bold">
                                {data.calculations?.totalCurrent} А
                            </div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded">
                            <div className="text-purple-600 font-medium">Серия шинопровода</div>
                            <div className="text-xl font-bold">HFP56</div>
                        </div>
                        <div className="p-3 bg-amber-50 rounded">
                            <div className="text-amber-600 font-medium">Количество жил</div>
                            <div className="text-xl font-bold">{data.poles}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Отображаем подобранный комплект */}
            <KitDisplay />

            {/* Действия */}
            <div className="flex justify-between">
                <Button variant="outline" onClick={goToPrevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Назад к проверке
                </Button>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleNewConfiguration}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Новая конфигурация
                    </Button>

                    <Button className="bg-green-600 hover:bg-green-700">
                        <ShoppingCart className="h-4 w-4 mr-2" />В корзину
                    </Button>

                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Спецификация
                    </Button>
                </div>
            </div>

            {/* Пояснение к подбору */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <h4 className="font-bold text-blue-800 mb-2">Как подбирались комплектующие:</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                        <li>
                            • Секции подобраны по току ({data.calculations?.totalCurrent} А) и
                            количеству жил ({data.poles})
                        </li>
                        <li>
                            • Количество секций: {Math.ceil(data.length / 4)} шт (длина секции 4 м)
                        </li>
                        <li>
                            • Подвесы устанавливаются через каждые 2 метра:{' '}
                            {Math.ceil(data.length / 2) * 2} шт
                        </li>
                        <li>
                            • Токосъемники: по 1 на каждого потребителя ({data.totalConsumers} шт)
                        </li>
                        <li>• Все комплектующие совместимы с серией HFP56 и выбранным током</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
