'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfigurationData, CalculationResult, AdditionalComponents } from '../steps/shared/types';

interface ConfigurationContextType {
    data: ConfigurationData;
    currentStep: number;
    updateData: (updates: Partial<ConfigurationData>) => void;
    goToStep: (step: number) => void;
    goToNextStep: () => void;
    goToPrevStep: () => void;
    resetData: () => void;
    updateCalculations: (calculations: CalculationResult) => void;
    updateAdditionalComponents: (components: Partial<AdditionalComponents>) => void;
    saveCompleteConfiguration: () => void;
}

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

const initialAdditionalComponents: AdditionalComponents = {
    trafficLight: false,
    insulationSection: false,
    rubber: false,
    brackets: false,
};

// Начальные данные конфигуратора
const initialData: ConfigurationData = {
    length: 10,
    poles: 4,
    voltage: 380,
    powerType: 'end',
    powerTypeOverride: false,
    totalConsumers: 1,
    totalPower: 20,
    showIndividualPowers: false,
    individualPowers: [],
    additionalComponents: initialAdditionalComponents,
    brackerType: '400mm-SB',
    status: 'draft',
};

export function ConfigurationProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<ConfigurationData>(initialData);
    const [currentStep, setCurrentStep] = useState(1);

    const updateData = (updates: Partial<ConfigurationData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    // Новый метод для обновления расчетов
    const updateCalculations = (calculations: CalculationResult) => {
        setData((prev) => ({
            ...prev,
            calculations,
            savedAt: new Date().toISOString(),
        }));
    };

    // Обновления дополнительных компонентов
    const updateAdditionalComponents = (components: Partial<AdditionalComponents>) => {
        setData((prev) => ({
            ...prev,
            additionalComponents: {
                ...prev.additionalComponents,
                ...components,
            },
        }));
    };

    // Новый метод для полного сохранения (данные + расчеты)
    const saveCompleteConfiguration = () => {
        const completeData = {
            ...data,
            savedAt: new Date().toISOString(),
            status: 'calculated' as const,
        };

        // Сохраняем в localStorage
        try {
            const saved = localStorage.getItem('saved-configurations');
            const configurations = saved ? JSON.parse(saved) : [];
            configurations.push(completeData);
            localStorage.setItem('saved-configurations', JSON.stringify(configurations));
            console.log('Конфигурация сохранена:', completeData);
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }

        return completeData;
    };

    // Управление шагами
    const goToStep = (step: number) => {
        if (step >= 1 && step <= 6) {
            setCurrentStep(step);
        }
    };

    // Следующий шаг
    const goToNextStep = () => {
        if (currentStep < 6) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    // Предыдущий шаг
    const goToPrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    // Сброс конфигуратора
    const resetData = () => {
        setData(initialData);
        setCurrentStep(1);
    };

    return (
        <ConfigurationContext.Provider
            value={{
                data,
                currentStep,
                updateData,
                goToStep,
                goToNextStep,
                goToPrevStep,
                resetData,
                updateCalculations,
                saveCompleteConfiguration,
                updateAdditionalComponents,
            }}
        >
            {children}
        </ConfigurationContext.Provider>
    );
}

export function useConfiguration() {
    const context = useContext(ConfigurationContext);
    if (!context) {
        throw new Error('useConfiguration must be used within ConfigurationProvider');
    }
    return context;
}
