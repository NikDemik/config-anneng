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

    // Сечение кабеля (упрощенный расчет, 6 А/мм² для меди)
    const currentDensity = 6;
    const recommendedCableSection = Math.max(1.5, totalCurrent / currentDensity);

    // Падение напряжения
    const resistancePerMeter = 0.018 / recommendedCableSection; // Ом/м для меди
    const voltageDrop = totalCurrent * data.length * resistancePerMeter * 1.73;
    const voltageDropPercent = (voltageDrop / data.voltage) * 100;

    // Максимальная длина без потерь (макс 5% падения)
    const maxLengthForVoltageDrop =
        (data.voltage * 0.05) / (((totalCurrent * 0.018) / recommendedCableSection) * 1.73);

    // Рекомендуемый автомат (с запасом 25%)
    const recommendedBreaker = Math.ceil(totalCurrent * 1.25);

    // Ток на фазу
    const phaseCurrent = totalCurrent / 3;

    // Коэффициент одновременности (для справки)
    const simultaneityFactor = CONSUMER_FACTORS[Math.min(data.totalConsumers, 10)] || 0.55;

    return {
        totalCurrent: parseFloat(totalCurrent.toFixed(2)),
        recommendedCableSection: parseFloat(recommendedCableSection.toFixed(2)),
        voltageDropPercent: parseFloat(voltageDropPercent.toFixed(1)),
        maxLengthForVoltageDrop: parseFloat(maxLengthForVoltageDrop.toFixed(0)),
        recommendedBreaker,
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

// Функция для расчета экономии тока
export function calculateCurrentSavings(data: ConfigurationData): {
    baseCurrent: number;
    adjustedCurrent: number;
    savings: number;
    savingsPercent: number;
} {
    const baseCurrent = (data.totalPower * 1000) / (data.voltage * 1.73 * 0.8 * 0.9);
    const adjustedCurrent = calculateTotalCurrent(data);
    const savings = baseCurrent - adjustedCurrent;
    const savingsPercent = (savings / baseCurrent) * 100;

    return {
        baseCurrent: parseFloat(baseCurrent.toFixed(2)),
        adjustedCurrent: parseFloat(adjustedCurrent.toFixed(2)),
        savings: parseFloat(savings.toFixed(2)),
        savingsPercent: parseFloat(savingsPercent.toFixed(1)),
    };
}
