export type PowerType = 'end' | 'end2' | 'linear';
export type brackerType = '400mm' | '400mm-SB' | '600mm' | '600mm-SB' | '800mm' | '800mm-SB';

export interface Consumer {
    power: number;
    // Можно добавить другие параметры потребителя
    name?: string;
    type?: string;
}

export interface AdditionalComponents {
    trafficLight: boolean; // Светофор
    insulationSection: boolean; // Секция изоляции
    rubber: boolean; // Резина
    brackets: boolean; // Кронштейны
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

    // Шаг 4 - доп компоненты
    additionalComponents: AdditionalComponents;
    brackerType: brackerType;

    // Шаг 5 - расчетные параметры
    calculations?: CalculationResult;
    savedAt?: string;
    status?: 'draft' | 'calculated' | 'saved' | 'approved';
}
