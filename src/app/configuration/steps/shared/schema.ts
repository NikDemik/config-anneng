import * as z from 'zod';
import {
    POWER_TYPES,
    BRACKET_TYPES,
    VALIDATION_MESSAGES,
    MAX_LENGTH_FOR_END_POWER,
} from './constants';

// Схема для потребителя
export const consumerSchema = z.object({
    power: z.coerce
        .number({
            invalid_type_error: 'Мощность должна быть числом',
            required_error: 'Укажите мощность потребителя',
        })
        .positive('Мощность должна быть положительным числом')
        .max(1000, VALIDATION_MESSAGES.INDIVIDUAL_POWER_MAX)
        .or(z.literal('').transform(() => 0)),
});

// Схема для шага 1
export const step1Schema = z.object({
    length: z.coerce
        .number({
            invalid_type_error: 'Длина должна быть числом',
            required_error: 'Поле обязательно',
        })
        .int('Длина должна быть целым числом')
        .min(1, VALIDATION_MESSAGES.LENGTH_MIN)
        .max(1000, VALIDATION_MESSAGES.LENGTH_MAX)
        .or(z.literal('').transform(() => 0)),

    poles: z.coerce
        .number({
            invalid_type_error: 'Количество жил должно быть числом',
            required_error: 'Поле обязательно',
        })
        .int('Количество жил должно быть целым числом')
        .min(1, VALIDATION_MESSAGES.POLES_MIN)
        .max(12, VALIDATION_MESSAGES.POLES_MAX)
        .or(z.literal('').transform(() => 0)),
});

// Схема для шага 2
export const step2Schema = z.object({
    voltage: z.coerce
        .number({
            invalid_type_error: 'Напряжение должно быть числом',
            required_error: 'Поле обязательно',
        })
        .int('Напряжение должно быть целым числом')
        .min(24, VALIDATION_MESSAGES.VOLTAGE_MIN)
        .max(1000, VALIDATION_MESSAGES.VOLTAGE_MAX)
        .or(z.literal('').transform(() => 0)),

    powerType: z.enum([POWER_TYPES.END, POWER_TYPES.END2, POWER_TYPES.LINEAR], {
        required_error: VALIDATION_MESSAGES.POWER_TYPE_REQUIRED,
    }),

    powerTypeOverride: z.boolean(),
});

// Схема для шага 3
export const step3Schema = z.object({
    totalConsumers: z.coerce
        .number({
            invalid_type_error: 'Количество потребителей должно быть числом',
        })
        .int('Количество потребителей должно быть целым числом')
        .min(1, VALIDATION_MESSAGES.CONSUMERS_MIN)
        .max(12, VALIDATION_MESSAGES.CONSUMERS_MAX)
        .or(z.literal('').transform(() => 1)),

    totalPower: z.coerce
        .number({
            invalid_type_error: 'Общая мощность должна быть числом',
            required_error: 'Укажите общую мощность',
        })
        .positive('Общая мощность должна быть положительным числом')
        .max(20000, VALIDATION_MESSAGES.TOTAL_POWER_MAX)
        .or(z.literal('').transform(() => 0)),

    showIndividualPowers: z.boolean().default(false),
    individualPowers: z.array(consumerSchema).optional(),
});

// Схема для шага 4
export const step4Schema = z.object({
    addLightSignal: z.boolean().default(false),
    addInsulationSection: z.boolean().default(false),
    addTape: z.boolean().default(false),
    addBrackets: z.boolean().default(false),

    brackerType: z.enum([
        BRACKET_TYPES.FOUR_HUNDRED_SB,
        BRACKET_TYPES.FOUR_HUNDRED,
        BRACKET_TYPES.SIX_HUNDRED_SB,
        BRACKET_TYPES.SIX_HUNDRED,
        BRACKET_TYPES.EIGHT_HUNDRED_SB,
        BRACKET_TYPES.EIGHT_HUNDRED,
    ]),
});

// Полная схема конфигурации с перекрестными валидациями
export const configurationSchema = z
    .object({
        // Шаг 1
        length: step1Schema.shape.length,
        poles: step1Schema.shape.poles,

        // Шаг 2
        voltage: step2Schema.shape.voltage,
        powerType: step2Schema.shape.powerType,
        powerTypeOverride: step2Schema.shape.powerTypeOverride,

        // Шаг 3
        totalConsumers: step3Schema.shape.totalConsumers,
        totalPower: step3Schema.shape.totalPower,
        showIndividualPowers: step3Schema.shape.showIndividualPowers,
        individualPowers: step3Schema.shape.individualPowers,

        // Шаг 4
        addLightSignal: step4Schema.shape.addLightSignal,
        addInsulationSection: step4Schema.shape.addInsulationSection,
        addTape: step4Schema.shape.addTape,
        addBrackets: step4Schema.shape.addBrackets,
        brackerType: step4Schema.shape.brackerType,
    })
    .refine(
        (data) => {
            if (
                data.showIndividualPowers &&
                data.individualPowers &&
                data.individualPowers.length > 0
            ) {
                const sumIndividualPowers = data.individualPowers.reduce(
                    (sum, consumer) => sum + (consumer.power || 0),
                    0,
                );
                return Math.abs(sumIndividualPowers - data.totalPower) <= 0.1;
            }
            return true;
        },
        {
            message: VALIDATION_MESSAGES.POWER_SUM_MISMATCH,
            path: ['totalPower'],
        },
    )
    .refine(
        (data) => {
            // Если длина <= 150 - всегда ок
            if (data.length <= MAX_LENGTH_FOR_END_POWER) return true;

            // Если длина > 150:
            // Ок, если тип LINEAR ИЛИ включен override
            return data.powerType === POWER_TYPES.LINEAR || data.powerTypeOverride === true;
        },
        {
            message: VALIDATION_MESSAGES.LENGTH_OVER_150,
            path: ['powerType'],
        },
    );