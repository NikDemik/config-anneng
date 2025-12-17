import { POWER_TYPES } from '@/lib/validation/constants';

export type PowerType = (typeof POWER_TYPES)[keyof typeof POWER_TYPES];

export interface Consumer {
    power: number;
}

export interface Step1FormData {
    length: number;
    poles: number;
    voltage: number;
    powerType: PowerType;
    totalConsumers: number;
    totalPower: number;
    showIndividualPowers: boolean;
    individualPowers: Consumer[];
}
