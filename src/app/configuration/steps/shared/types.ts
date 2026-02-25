export type PowerType = 'end' | 'end2' | 'linear';

export interface Consumer {
    power: number;
    // Можно добавить другие параметры потребителя
    name?: string;
    type?: string;
}

// Добавляем расчетные параметры
export interface CalculationResult {
    totalCurrent: number;
    phaseCurrent: number;
    baseCurrentWithoutFactor: number;
    simultaneityFactor: number;
}

export interface ConfigurationData {
    // Шаг 1
    length: number;
    poles: number;

    // Шаг 2
    voltage: number;
    powerType: PowerType;
    powerTypeOverride?: boolean;

    // Шаг 3
    totalConsumers: number;
    totalPower: number;
    showIndividualPowers: boolean;
    individualPowers: Consumer[];

    // Шаг 4 - расчетные параметры
    calculations?: CalculationResult;
    savedAt?: string;
    status?: 'draft' | 'calculated' | 'saved' | 'approved';
}
