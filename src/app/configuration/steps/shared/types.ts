export type PowerType = 'end' | 'linear';

export type Step1Data = {
    length: number;
    poles: number;
};

export interface Consumer {
    power: number;
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
}
