// src/app/configuration/components/KitDisplay.tsx
'use client';

import { useCatalog } from '@/app/configuration/hooks/useCatalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShoppingCart, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function KitDisplay() {
    const { kit, loading, error, buildKit } = useCatalog();

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6 text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Подбор комплектующих...</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>Ошибка: {error}</AlertDescription>
            </Alert>
        );
    }

    if (!kit) {
        return (
            <Card>
                <CardContent className="pt-6 text-center py-12">
                    <p className="text-gray-600">Выполните расчет для подбора комплекта</p>
                    <Button onClick={buildKit} className="mt-4">
                        Подобрать комплект
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Подобранный комплект</span>
                        <Badge variant="outline" className="text-lg">
                            {kit.totals.totalPrice.toLocaleString('ru-RU')} ₽
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Секции */}
                    <div className="mb-6">
                        <h3 className="font-bold mb-3">Секции шинопровода</h3>
                        <div className="bg-gray-50 p-4 rounded">
                            <div className="flex justify-between mb-2">
                                <span>{kit.components.sections[0]?.name}</span>
                                <span className="font-bold">{kit.totals.sectionsCount} шт</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Ток: {kit.components.sections[0]?.specs.amperage}А</span>
                                <span>
                                    Цена: {kit.totals.sectionsPrice.toLocaleString('ru-RU')} ₽
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Комплектующие */}
                    <div className="mb-6">
                        <h3 className="font-bold mb-3">Комплектующие</h3>
                        <div className="space-y-3">
                            {Object.entries(kit.totals.accessoriesCount).map(([key, count]) => {
                                if (count === 0) return null;

                                const component =
                                    kit.components[key as keyof typeof kit.components]?.[0];
                                const price =
                                    kit.totals.accessoriesPrice[
                                        key as keyof typeof kit.totals.accessoriesPrice
                                    ];

                                if (!component || count === 0) return null;

                                return (
                                    <div key={key} className="bg-gray-50 p-3 rounded">
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="font-medium">{component.name}</div>
                                                <div className="text-sm text-gray-600">
                                                    {count} шт × {component.price} ₽
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">
                                                    {price.toLocaleString('ru-RU')} ₽
                                                </div>
                                                <div className="text-sm text-gray-600">всего</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Итого */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-bold">
                            <span>ИТОГО:</span>
                            <span>{kit.totals.totalPrice.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button className="flex-1">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Добавить в корзину
                            </Button>
                            <Button variant="outline" className="flex-1">
                                <Download className="h-4 w-4 mr-2" />
                                Скачать спецификацию
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
