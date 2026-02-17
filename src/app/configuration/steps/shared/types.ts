export type PowerType = 'end' | 'linear';

// export type Step1Data = {
//     length: number;
//     poles: number;
// };

export interface Consumer {
    power: number;
}

// Добавляем расчетные параметры
export interface CalculationResult {
    totalCurrent: number;
    recommendedCableSection: number;
    maxLengthForVoltageDrop: number;
    recommendedBreaker: number;
    voltageDropPercent: number;
    simultaneityFactor: number;
    phaseCurrent: number;
    baseCurrentWithoutFactor: number;
}

export interface ConfigurationData {
    // Шаг 1
    length: number;
    poles: number;

    // Шаг 2
    voltage: number;
    powerType: PowerType;

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
