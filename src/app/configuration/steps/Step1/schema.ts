import * as z from 'zod';
import {
    POWER_TYPES,
    VALIDATION_MESSAGES,
    MAX_LENGTH_FOR_END_POWER,
} from '@/lib/validation/constants';

// Схема валидации для потребителей
const consumerSchema = z.object({
    power: z.coerce
        .number({
            invalid_type_error: 'Мощность должна быть числом',
            required_error: 'Укажите мощность потребителя',
        })
        .positive('Мощность должна быть положительным числом')
        .max(1000, VALIDATION_MESSAGES.INDIVIDUAL_POWER_MAX)
        .or(z.literal('').transform(() => 0)),
});

// Основная схема валидации с кастомными проверками
export const step1Schema = z
    .object({
        length: z.coerce
            .number({
                invalid_type_error: 'Длина должна быть числом',
                required_error: 'Поле обязательно',
            })
            .int('Длина должна быть целым числом')
            .min(1, VALIDATION_MESSAGES.LENGTH_MIN)
            .max(500, VALIDATION_MESSAGES.LENGTH_MAX)
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

        voltage: z.coerce
            .number({
                invalid_type_error: 'Напряжение должно быть числом',
                required_error: 'Поле обязательно',
            })
            .int('Напряжение должно быть целым числом')
            .min(24, VALIDATION_MESSAGES.VOLTAGE_MIN)
            .max(1000, VALIDATION_MESSAGES.VOLTAGE_MAX)
            .or(z.literal('').transform(() => 0)),

        powerType: z.enum([POWER_TYPES.END, POWER_TYPES.LINEAR], {
            required_error: VALIDATION_MESSAGES.POWER_TYPE_REQUIRED,
        }),

        totalConsumers: z.coerce
            .number({
                invalid_type_error: 'Количество потребителей должно быть числом',
            })
            .int('Количество потребителей должно быть целым числом')
            .min(1, VALIDATION_MESSAGES.CONSUMERS_MIN)
            .max(20, VALIDATION_MESSAGES.CONSUMERS_MAX)
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
            if (data.length > MAX_LENGTH_FOR_END_POWER) {
                return data.powerType === POWER_TYPES.LINEAR;
            }
            return true;
        },
        {
            message: VALIDATION_MESSAGES.LENGTH_OVER_150,
            path: ['powerType'],
        },
    );
