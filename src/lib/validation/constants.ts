export const POWER_TYPES = {
    END: 'end',
    LINEAR: 'linear',
} as const;

export const VALIDATION_MESSAGES = {
    LENGTH_MIN: 'Минимальная длина линии - 1 метр',
    LENGTH_MAX: 'Максимальная длина линии - 500 метров',
    POLES_MIN: 'Минимальное количество жил - 1',
    POLES_MAX: 'Максимальное количество жил - 12',
    VOLTAGE_MIN: 'Минимальное напряжение - 24В',
    VOLTAGE_MAX: 'Максимальное напряжение - 1000В',
    CONSUMERS_MIN: 'Минимальное количество потребителей - 1',
    CONSUMERS_MAX: 'Максимальное количество потребителей - 20',
    TOTAL_POWER_MAX: 'Максимальная общая мощность - 20000 кВт',
    INDIVIDUAL_POWER_MAX: 'Максимальная мощность - 1000 кВт',
    POWER_TYPE_REQUIRED: 'Выберите тип питания',
    LENGTH_OVER_150: 'При длине линии более 150 метров доступно только линейное питание',
    POWER_SUM_MISMATCH: 'Сумма мощностей потребителей не совпадает с общей мощностью',
} as const;

export const MAX_LENGTH_FOR_END_POWER = 150;
