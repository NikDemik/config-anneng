'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfigurationData } from '../steps/shared/types';

interface ConfigurationContextType {
    data: ConfigurationData;
    currentStep: number;
    updateData: (updates: Partial<ConfigurationData>) => void;
    goToStep: (step: number) => void;
    goToNextStep: () => void;
    goToPrevStep: () => void;
    resetData: () => void;
}

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

// Начальные данные конфигуратора
const initialData: ConfigurationData = {
    length: 30,
    poles: 4,
    voltage: 380,
    powerType: 'end',
    totalConsumers: 1,
    totalPower: 10,
    showIndividualPowers: false,
    individualPowers: [],
};

export function ConfigurationProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<ConfigurationData>(initialData);
    const [currentStep, setCurrentStep] = useState(1);

    const updateData = (updates: Partial<ConfigurationData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    // Управление шагами
    const goToStep = (step: number) => {
        if (step >= 1 && step <= 3) {
            setCurrentStep(step);
        }
    };

    // Следующий шаг
    const goToNextStep = () => {
        if (currentStep < 3) {
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
