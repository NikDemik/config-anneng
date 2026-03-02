// src/app/configuration/layout.tsx
'use client';

import { useConfiguration } from './context/ConfigurationContext';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import Step6 from './steps/Step6';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home, CheckCircle } from 'lucide-react';

export default function ConfigurationLayout() {
    const { currentStep, goToStep } = useConfiguration();

    const getStepContent = () => {
        switch (currentStep) {
            case 1:
                return <Step1 />;
            case 2:
                return <Step2 />;
            case 3:
                return <Step3 />;
            case 4:
                return <Step4 />;
            case 5:
                return <Step5 />;
            case 6:
                return <Step6 />;
            default:
                return <Step1 />;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1:
                return 'Шаг 1: Основные параметры линии';
            case 2:
                return 'Шаг 2: Параметры питания';
            case 3:
                return 'Шаг 3: Потребители и мощность';
            case 4:
                return 'Шаг 4: Дополнительные компоненты';
            case 5:
                return 'Шаг 5: Проверка и подтверждение';
            case 6:
                return 'Шаг 6: Подбор комплектующих';
            default:
                return 'Конфигуратор электрической линии';
        }
    };

    const getStepDescription = () => {
        switch (currentStep) {
            case 1:
                return 'Укажите длину линии и количество жил';
            case 2:
                return 'Настройте напряжение и тип питания';
            case 3:
                return 'Настройте параметры потребителей';
            case 4:
                return 'Выберите дополнительные компоненты для линии';
            case 5:
                return 'Проверьте все введенные данные перед сохранением';
            case 6:
                return 'На основе ваших данных подобраны оптимальные комплектующие';
            default:
                return 'Пошаговая конфигурация электрической линии';
        }
    };

    return (
        // <div className="xl:min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="container mx-auto">
            {/* Прогресс бар */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">
                        Шаг {currentStep} из 6
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                        {Math.round((currentStep / 6) * 100)}%
                    </span>
                </div>
                <Progress value={(currentStep / 6) * 100} className="h-2" />
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>{getStepTitle()}</CardTitle>
                    <CardDescription>{getStepDescription()}</CardDescription>
                </CardHeader>
                <CardContent>{getStepContent()}</CardContent>
            </Card>

            {/* Навигация */}
            {/* <Card className="mt-6"> */}
            {/* <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => goToStep(1)}
                                className="flex items-center gap-2"
                            >
                                <Home className="h-4 w-4" />К началу
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => goToStep(currentStep - 1)}
                                    className="flex items-center gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Назад
                                </Button>
                            )}

                            {currentStep < 6 ? (
                                <Button
                                    type="button"
                                    onClick={() => goToStep(currentStep + 1)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    {currentStep === 3 ? 'К проверке' : 'Далее'}
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => alert('Конфигурация сохранена!')}
                                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Сохранить конфигурацию
                                </Button>
                            )}
                        </div>
                    </div> */}

            {/* Быстрая навигация по шагам */}
            {/* <div className="border-t p-4">
                        <div className="flex justify-center gap-4">
                            {[1, 2, 3, 4, 5, 6].map((step) => (
                                <Button
                                    key={step}
                                    type="button"
                                    variant={currentStep === step ? 'default' : 'ghost'}
                                    onClick={() => goToStep(step)}
                                    className={`rounded-full w-10 h-10 p-0 ${
                                        currentStep === step
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:text-blue-600'
                                    }`}
                                >
                                    {step}
                                </Button>
                            ))}
                        </div>
                    </div> */}
            {/* </Card> */}
        </div>
        // </div>
    );
}
