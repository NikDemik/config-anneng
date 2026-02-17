// src/app/configuration/utils/calculations.ts
import { ConfigurationData, CalculationResult } from '../steps/shared/types';

// Коэффициенты для разных количеств потребителей
const CONSUMER_FACTORS: Record<number, number> = {
    1: 1.0, // 100%
    2: 0.95, // 95%
    3: 0.9, // 90%
    4: 0.85, // 85%
    5: 0.8, // 80%
    6: 0.75, // 75%
    7: 0.7, // 70%
    8: 0.65, // 65%
    9: 0.6, // 60%
    10: 0.55, // 55%
    11: 0.5, // 50%
    12: 0.45, // 45%
    // Для большего количества можно продолжить или использовать минимальный
};

// Расчет максимального тока
export function calculateTotalCurrent(data: ConfigurationData): number {
    // Базовая формула для одного потребителя
    const baseCurrent = (data.totalPower * 1000) / (data.voltage * 1.73 * 0.8 * 0.9);

    // Получаем коэффициент для текущего количества потребителей
    const consumerCount = Math.min(data.totalConsumers, 12);
    const factor = CONSUMER_FACTORS[consumerCount] || 1; // По умолчанию минимальный коэффициент

    // Применяем коэффициент
    const adjustedCurrent = Math.ceil(baseCurrent * factor); // Округляем до целого значения

    return adjustedCurrent;
}

// Полный расчет всех параметров с новой формулой
export function performCompleteCalculations(data: ConfigurationData): CalculationResult {
    // Расчет тока с учетом количества потребителей
    const totalCurrent = calculateTotalCurrent(data);

    // Коэффициент одновременности (для справки)
    const simultaneityFactor = CONSUMER_FACTORS[Math.min(data.totalConsumers, 10)] || 0.55;

    return {
        totalCurrent: parseFloat(totalCurrent.toFixed(2)),
        simultaneityFactor: parseFloat(simultaneityFactor.toFixed(2)),
        baseCurrentWithoutFactor: parseFloat(
            ((data.totalPower * 1000) / (data.voltage * 1.73 * 0.8 * 0.9)).toFixed(2),
        ),
        phaseCurrent: parseFloat((totalCurrent / 3).toFixed(2)), // Для трехфазной
    };
}

// Функция для получения текстового описания коэффициента
export function getFactorDescription(consumerCount: number): string {
    const factor = CONSUMER_FACTORS[Math.min(consumerCount, 10)] || 0.55;
    const percentage = Math.round(factor * 100);

    return `Коэффициент одновременности для ${consumerCount} потребителей: ${percentage}%`;
}
