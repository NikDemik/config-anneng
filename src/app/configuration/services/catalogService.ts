// src/app/configuration/services/catalogService.ts
import catalogData from '@/data/catalog.json'; // Путь к вашему JSON файлу

export interface Component {
    id: string;
    name: string;
    description: string;
    imageUrl: string[];
    price: number;
    type: string;
    typeId: string;
    specs: any;
    categoryId: string;
    brandId: string;
    seriesId: string;
    compatibility?: {
        seriesIds: string[];
        amperageRange?: { min: number; max: number };
        poles?: number[];
    };
    quantityPerMeter?: number;
}

export interface Series {
    id: string;
    name: string;
    brandId: string;
    typeId: string;
    description: string;
    imageUrl: string;
    amperageRange?: { min: number; max: number };
    polesAvailable?: number[];
}

export interface Consumer {
    power: number;
}

export interface ConsumerWithCalculation {
    power: number; // Мощность в кВт
    current: number; // Ток в А (рассчитанный)
    requiredCollectors: number; // Необходимое количество токосъемников
    selectedCollectors: Component[]; // Выбранные токосъемники
    totalCollectorAmperage: number; // Суммарный ток всех токосъемников
}

export interface IndividualCollectorSelection {
    consumers: ConsumerWithCalculation[]; // Массив потребителей с расчетами
    totalCollectors: number; // Общее количество токосъемников
    totalPrice: number; // Общая стоимость
    collectorsByType: Record<
        string,
        {
            // Группировка по типу/номиналу
            count: number;
            price: number;
            component: Component;
        }
    >;
}

export interface ConfigurationResult {
    config: any; // Ваши сохраненные данные
    components: {
        sections: Component[];
        endCaps: Component[];
        jointCovers: Component[];
        connectTerminals: Component[];
        powerFeeds: Component[];
        powerTerminals: Component[];
        powerfeedLinears: Component[];
        fixedSuspensions: Component[];
        slidingSuspensions: Component[];
        currentCollectors: Component[];
        collectorGrips: Component[];
    };
    totals: {
        sectionsCount: number;
        sectionsPrice: number;
        accessoriesCount: Record<string, number>;
        accessoriesPrice: Record<string, number>;
        totalPrice: number;
        collectorDetails?: {
            // Детали по токосъемникам
            type?: 'uniform' | 'individual';
            perCollectorAmperage: number;
            collectorsPerConsumer: number;
            totalCollectors: number;
            consumers?: ConsumerWithCalculation[];
            collectorsByType?: Record<
                string,
                { count: number; price: number; component: Component }
            >;
        };
    };
}

class CatalogService {
    private data: typeof catalogData;

    constructor() {
        this.data = catalogData;
    }

    // Поиск секций по амперажу и количеству жил
    findSections(amperage: number, poles: number): Component[] {
        return this.data.components
            .filter(
                (comp: Component) =>
                    comp.typeId === 'section' &&
                    comp.specs.amperage >= amperage && // Секция должна выдерживать нужный ток
                    comp.specs.poles === poles,
            )
            .sort((a, b) => a.specs.amperage - b.specs.amperage);
    }

    // Найти оптимальную секцию (ближайшую по току снизу или сверху)
    findOptimalSection(amperage: number, poles: number): Component | null {
        const sections = this.findSections(amperage, poles);

        if (sections.length === 0) return null;

        // Ищем секцию с током >= требуемого
        return sections[0];
    }

    // ПОИСК ТОКОСЪЕМНИКОВ ПО АМПЕРАЖУ
    findCurrentCollectors(): Component[] {
        return this.data.components
            .filter((comp: Component) => comp.typeId === 'current_collector')
            .sort((a, b) => a.specs.amperage - b.specs.amperage);
    }

    // ПОДБОР ТОКОСЪЕМНИКОВ ПО КОЛИЧЕСТВУ ПОТРЕБИТЕЛЕЙ И ТОКУ ЛИНИИ (для одинаковых потребителей)
    selectCurrentCollectors(
        totalLineAmperage: number, // Общий ток линии (например, 140А)
        totalConsumers: number, // Количество потребителей (например, 3)
    ): {
        collectors: Component[]; // Массив выбранных токосъемников
        perCollectorAmperage: number; // Ток на один токосъемник
        collectorsPerConsumer: number; // Сколько токосъемников на одного потребителя
        totalCollectors: number; // Общее количество токосъемников
    } {
        // Получаем все доступные токосъемники
        const allCollectors = this.findCurrentCollectors();
        if (allCollectors.length === 0) {
            throw new Error('Токосъемники не найдены в каталоге');
        }

        // Массив доступных номиналов токосъемников
        const availableAmperages = allCollectors.map((c) => c.specs.amperage).sort((a, b) => a - b);

        // Расчет необходимого тока на одного потребителя
        const amperagePerConsumer = totalLineAmperage / totalConsumers;

        // Находим оптимальный номинал токосъемника
        let selectedAmperage = this.findOptimalCollectorAmperage(
            amperagePerConsumer,
            availableAmperages,
        );

        // Рассчитываем сколько токосъемников нужно на одного потребителя
        const collectorsPerConsumer = Math.ceil(amperagePerConsumer / selectedAmperage);

        // Общее количество токосъемников
        const totalCollectors = collectorsPerConsumer * totalConsumers;

        // Находим сам токосъемник по номиналу
        const selectedCollector = allCollectors.find((c) => c.specs.amperage === selectedAmperage);
        if (!selectedCollector) {
            throw new Error(`Токосъемник на ${selectedAmperage}А не найден`);
        }

        // Создаем массив токосъемников (по одному экземпляру для каждого места)
        const collectors = Array(totalCollectors).fill(selectedCollector);

        return {
            collectors,
            perCollectorAmperage: selectedAmperage,
            collectorsPerConsumer,
            totalCollectors,
        };
    }

    /**
     * ПОДБОР ТОКОСЪЕМНИКОВ ДЛЯ ИНДИВИДУАЛЬНЫХ ПОТРЕБИТЕЛЕЙ
     * @param consumers - массив потребителей с их мощностями
     * @param voltage - напряжение линии
     */
    selectIndividualCurrentCollectors(
        consumers: Consumer[],
        voltage: number,
    ): IndividualCollectorSelection {
        // Получаем все доступные токосъемники
        const allCollectors = this.findCurrentCollectors();
        if (allCollectors.length === 0) {
            throw new Error('Токосъемники не найдены в каталоге');
        }

        // Массив доступных номиналов
        const availableAmperages = allCollectors.map((c) => c.specs.amperage).sort((a, b) => a - b);

        // Результаты для каждого потребителя
        const consumersWithCalc: ConsumerWithCalculation[] = [];
        const collectorsByType: Record<
            string,
            { count: number; price: number; component: Component }
        > = {};

        // Обрабатываем каждого потребителя
        for (const consumer of consumers) {
            // Рассчитываем ток для этого потребителя
            // I = P * 1000 / (U * 1.73 * cosφ * η)
            const consumerCurrent = (consumer.power * 1000) / (voltage * 1.73 * 0.8 * 0.9);

            // Подбираем токосъемники для этого потребителя
            const selection = this.selectCollectorsForConsumer(
                consumerCurrent,
                availableAmperages,
                allCollectors,
            );

            // Добавляем информацию о потребителе
            consumersWithCalc.push({
                power: consumer.power,
                current: consumerCurrent,
                requiredCollectors: selection.requiredCount,
                selectedCollectors: selection.collectors,
                totalCollectorAmperage: selection.totalAmperage,
            });

            // Группируем токосъемники по номиналу для итоговой статистики
            selection.collectors.forEach((collector) => {
                const key = `${collector.specs.amperage}A`;
                if (!collectorsByType[key]) {
                    collectorsByType[key] = {
                        count: 0,
                        price: collector.price,
                        component: collector,
                    };
                }
                collectorsByType[key].count++;
            });
        }

        // Рассчитываем общую стоимость
        let totalPrice = 0;
        Object.values(collectorsByType).forEach((item) => {
            totalPrice += item.price * item.count;
        });

        // Общее количество токосъемников
        const totalCollectors = consumersWithCalc.reduce(
            (sum, consumer) => sum + consumer.requiredCollectors,
            0,
        );

        return {
            consumers: consumersWithCalc,
            totalCollectors,
            totalPrice,
            collectorsByType,
        };
    }

    /**
     * Подбор токосъемников для одного потребителя
     */
    private selectCollectorsForConsumer(
        requiredCurrent: number,
        availableAmperages: number[],
        allCollectors: Component[],
    ): {
        collectors: Component[];
        requiredCount: number;
        totalAmperage: number;
    } {
        // Находим оптимальный номинал
        const optimalAmperage = this.findOptimalCollectorAmperage(
            requiredCurrent,
            availableAmperages,
        );

        // Находим сам токосъемник
        const collector = allCollectors.find((c) => c.specs.amperage === optimalAmperage);
        if (!collector) {
            throw new Error(`Токосъемник на ${optimalAmperage}А не найден`);
        }

        // Рассчитываем необходимое количество
        const requiredCount = Math.ceil(requiredCurrent / optimalAmperage);

        // Создаем массив токосъемников
        const collectors = Array(requiredCount).fill(collector);

        return {
            collectors,
            requiredCount,
            totalAmperage: optimalAmperage * requiredCount,
        };
    }

    // Поиск оптимального номинала токосъемника
    private findOptimalCollectorAmperage(
        requiredAmperage: number,
        availableAmperages: number[],
    ): number {
        // Если требуемый ток меньше минимального доступного
        if (requiredAmperage <= availableAmperages[0]) {
            return availableAmperages[0];
        }

        // Пробуем найти точное совпадение
        const exactMatch = availableAmperages.find(
            (a) => a >= requiredAmperage && a <= requiredAmperage * 1.2,
        );
        if (exactMatch) {
            return exactMatch;
        }

        // Ищем оптимальное сочетание: ближайший доступный номинал,
        // чтобы количество токосъемников на потребителя было минимальным
        let bestAmperage = availableAmperages[availableAmperages.length - 1];
        let minCollectorsPerConsumer = Infinity;

        for (const amperage of availableAmperages) {
            const collectorsNeeded = Math.ceil(requiredAmperage / amperage);

            // Предпочитаем варианты с меньшим количеством токосъемников на потребителя
            if (collectorsNeeded < minCollectorsPerConsumer) {
                minCollectorsPerConsumer = collectorsNeeded;
                bestAmperage = amperage;
            }
            // Если количество одинаковое, выбираем больший номинал (меньше токосъемников всего)
            else if (collectorsNeeded === minCollectorsPerConsumer && amperage < bestAmperage) {
                bestAmperage = amperage;
            }
        }

        return bestAmperage;
    }

    // Поиск комплектующих по серии и совместимости
    findAccessories(seriesId: string, amperage: number, typeIds?: string[]): Component[] {
        return this.data.components.filter((comp: Component) => {
            // Исключаем секции и токосъемники из общего поиска
            if (comp.typeId === 'section' || comp.typeId === 'current_collector') return false;

            // Проверка типа, если указан
            if (typeIds && !typeIds.includes(comp.typeId)) return false;

            // Проверка совместимости с серией
            const seriesCompatible = comp.compatibility?.seriesIds?.includes(seriesId);

            // Проверка совместимости по току
            let amperageCompatible = true;
            if (comp.compatibility?.amperageRange) {
                const range = comp.compatibility.amperageRange;
                amperageCompatible = amperage >= range.min && amperage <= range.max; // Если нужно строгий диапазон добавить условие amperage >= range.min
            } else if (comp.specs.amperage) {
                // Если указан конкретный ток
                if (typeof comp.specs.amperage === 'number') {
                    amperageCompatible = comp.specs.amperage >= amperage;
                } else if (comp.specs.amperage?.min && comp.specs.amperage?.max) {
                    amperageCompatible =
                        amperage >= comp.specs.amperage.min && amperage <= comp.specs.amperage.max;
                }
            }

            return seriesCompatible && amperageCompatible;
        });
    }

    // Расчет необходимого количества секций
    calculateSections(
        length: number,
        sectionLength: number = 4, // Стандартная длина секции
    ): {
        sections: Component[];
        count: number;
        remainder: number;
    } {
        const sectionCount = Math.ceil(length / sectionLength);
        const remainder = length % sectionLength;

        return {
            sections: [],
            count: sectionCount,
            remainder,
        };
    }

    // Сборка полного комплекта
    async buildKit(configData: any): Promise<ConfigurationResult> {
        const {
            length,
            poles,
            powerType,
            totalConsumers,
            totalPower,
            voltage,
            showIndividualPowers,
            individualPowers,
            calculations,
        } = configData;

        const requiredAmperage = Math.ceil(calculations.totalCurrent);

        // 1. Находим оптимальную секцию
        const optimalSection = this.findOptimalSection(requiredAmperage, poles);
        if (!optimalSection) {
            throw new Error(
                `Максимальный ток для линии серии HFP56 240А. По предварительным расчетам у вас ${requiredAmperage}А и ${poles} жил. Рекомендуем выбрать монотроллейный шинопровод.`,
            );
        }
        const seriesId = optimalSection.seriesId; // Можно определять по другим параметрам

        // 2. Рассчитываем количество секций
        const { count: sectionCount } = this.calculateSections(length);

        // 3. ПОДБОР ТОКОСЪЕМНИКОВ по новой логике
        // const collectorSelection = this.selectCurrentCollectors(requiredAmperage, totalConsumers);
        // 3. ПОДБОР ТОКОСЪЕМНИКОВ (с учетом индивидуальных мощностей)
        let collectorSelection;
        let collectorDetails;

        if (showIndividualPowers && individualPowers && individualPowers.length > 0) {
            // Индивидуальный подбор для каждого потребителя
            collectorSelection = this.selectIndividualCurrentCollectors(individualPowers, voltage);
            collectorDetails = {
                type: 'individual',
                consumers: collectorSelection.consumers,
                totalCollectors: collectorSelection.totalCollectors,
                collectorsByType: collectorSelection.collectorsByType,
            };
        } else {
            // Стандартный подбор (все потребители одинаковые)
            const standardSelection = this.selectCurrentCollectors(
                requiredAmperage,
                totalConsumers,
            );

            // Преобразуем в формат для одного типа потребителей
            const consumerPower = totalPower / totalConsumers;
            const consumerCurrent = (consumerPower * 1000) / (voltage * 1.73 * 0.8 * 0.9);

            collectorSelection = {
                consumers: [
                    {
                        power: consumerPower,
                        current: consumerCurrent,
                        requiredCollectors: standardSelection.collectorsPerConsumer,
                        selectedCollectors: standardSelection.collectors.slice(
                            0,
                            standardSelection.collectorsPerConsumer,
                        ),
                        totalCollectorAmperage:
                            standardSelection.perCollectorAmperage *
                            standardSelection.collectorsPerConsumer,
                    },
                ],
                totalCollectors: standardSelection.totalCollectors,
                totalPrice:
                    standardSelection.collectors[0].price * standardSelection.totalCollectors,
                collectorsByType: {
                    [`${standardSelection.perCollectorAmperage}A`]: {
                        count: standardSelection.totalCollectors,
                        price: standardSelection.collectors[0].price,
                        component: standardSelection.collectors[0],
                    },
                },
            };

            collectorDetails = {
                type: 'uniform',
                perCollectorAmperage: standardSelection.perCollectorAmperage,
                collectorsPerConsumer: standardSelection.collectorsPerConsumer,
                totalCollectors: standardSelection.totalCollectors,
            };
        }

        // 4. Находим совместимые комплектующие
        const accessories = this.findAccessories(seriesId, requiredAmperage);

        // Создаем массив токосъемников из результатов подбора
        const allCollectors: Component[] = [];
        Object.values(collectorSelection.collectorsByType).forEach((item) => {
            for (let i = 0; i < item.count; i++) {
                allCollectors.push(item.component);
            }
        });

        // Группируем комплектующие по типу
        const grouped = {
            sections: Array(sectionCount).fill(optimalSection),
            endCaps: accessories.filter((c) => c.typeId === 'end_cap'),
            jointCovers: accessories.filter((c) => c.typeId === 'joint_cover'),
            connectTerminals: accessories.filter((c) => c.typeId === 'connect_terminal'),
            powerFeeds: accessories.filter((c) => c.typeId === 'power_feed'),
            powerTerminals: accessories.filter((c) => c.typeId === 'power_terminal'),
            powerfeedLinears: accessories.filter((c) => c.typeId === 'power_feed_linear'),
            fixedSuspensions: accessories.filter((c) => c.typeId === 'suspension_fixed'),
            slidingSuspensions: accessories.filter((c) => c.typeId === 'suspension_sliding'),
            collectorGrips: accessories.filter((c) => c.typeId === 'collector_grip'),
            currentCollectors: allCollectors,
            // currentCollectors: collectorSelection.collectors,
        };

        // Расчет количества крышек концевых
        const endcapCount = powerType === 'end' ? 1 : powerType === 'end2' ? 0 : 2;

        // Расчет количества крышек стыковых
        const jointCoverCount = sectionCount - 1; // Крышки стыков на количество соединений

        // Расчет количества клемм соединительных
        function calculateConnectTerminalCount(requiredAmperage: number): number {
            return requiredAmperage > 100 ? jointCoverCount * 4 : 0;
        }
        const connectTerminalCount = calculateConnectTerminalCount(requiredAmperage);

        // Расчет количества подводов
        function calcPowerfeedsCount(powerType: 'end' | 'end2' | 'linear'): number {
            return powerType === 'linear'
                ? length <= 150
                    ? 1
                    : Math.floor(length / 151) + 1
                : powerType === 'end'
                  ? 1
                  : 2;
        }
        const powerFeedsCount =
            powerType === 'end' || powerType === 'end2' ? calcPowerfeedsCount(powerType) : 0;
        const powerfeedLinearsCount = powerType === 'linear' ? calcPowerfeedsCount(powerType) : 0;

        // Расчет количества клемм ввода питания
        function calculatePowerTerminalCount(requiredAmperage: number): number {
            return (requiredAmperage > 100 && powerType === 'end') || powerType === 'end2'
                ? powerFeedsCount * 4
                : 0;
        }
        const powerTerminalCount = calculatePowerTerminalCount(requiredAmperage);

        // Расчет количества фиксирующих подвесов
        function calculateSuspensionCount(length: number): number {
            return powerType === 'linear'
                ? (length <= 150 ? 2 : Math.floor(length / 75)) + powerfeedLinearsCount * 2
                : length <= 75
                  ? 1
                  : Math.floor(length / 75) + 1;
        }
        const suspensionFixedCount = calculateSuspensionCount(length);

        // Расчет количества скользящих подвесов
        const suspensionCount =
            powerType === 'linear'
                ? Math.ceil(length / 4) * 3 - suspensionFixedCount + powerfeedLinearsCount
                : Math.ceil(length / 4) * 3 - suspensionFixedCount;

        // Расчет количества токосъемников и захватов
        const currentCollectorCount = collectorSelection.totalCollectors;

        // Расчет количества захватов
        const collectorGripCount = collectorSelection.totalCollectors;

        // Расчет стоимости
        const totals = {
            sectionsCount: sectionCount,
            sectionsPrice: optimalSection.price * sectionCount,
            accessoriesCount: {
                endCaps: endcapCount,
                jointCovers: jointCoverCount,
                connectTerminals: connectTerminalCount,
                powerFeeds: powerFeedsCount,
                powerTerminals: powerTerminalCount,
                powerfeedLinears: powerfeedLinearsCount,
                fixedSuspensions: suspensionFixedCount,
                slidingSuspensions: suspensionCount,
                currentCollectors: currentCollectorCount,
                collectorGrips: collectorGripCount,
            },
            accessoriesPrice: {
                endCaps: (grouped.endCaps[0]?.price || 0) * endcapCount,
                jointCovers: (grouped.jointCovers[0]?.price || 0) * jointCoverCount,
                connectTerminals: (grouped.connectTerminals[0]?.price || 0) * connectTerminalCount,
                powerFeeds: (grouped.powerFeeds[0]?.price || 0) * powerFeedsCount,
                powerTerminals: (grouped.powerTerminals[0]?.price || 0) * powerTerminalCount,
                powerfeedLinears: (grouped.powerfeedLinears[0]?.price || 0) * powerfeedLinearsCount,
                fixedSuspensions: (grouped.fixedSuspensions[0]?.price || 0) * suspensionFixedCount,
                slidingSuspensions: (grouped.slidingSuspensions[0]?.price || 0) * suspensionCount,
                collectorGrips: (grouped.collectorGrips[0]?.price || 0) * collectorGripCount,
                currentCollectors: collectorSelection.totalPrice,
                // currentCollectors:
                //     (grouped.currentCollectors[0]?.price || 0) * currentCollectorCount,
            },
            totalPrice: 0,
            collectorDetails: collectorDetails,
        };

        // Общая стоимость
        totals.totalPrice =
            totals.sectionsPrice +
            Object.values(totals.accessoriesPrice).reduce((a, b) => a + b, 0);

        return {
            config: configData,
            components: grouped,
            totals,
        };
    }

    // Получить информацию о серии
    getSeries(seriesId: string): Series | undefined {
        return this.data.series.find((s: Series) => s.id === seriesId);
    }

    // Вспомогательная функция для тестирования подбора токосъемников (для одинаковых потребителей)
    testCollectorSelection(requiredAmperage: number, consumers: number) {
        const result = this.selectCurrentCollectors(requiredAmperage, consumers);
        console.log(`
        Тест подбора токосъемников:
        Ток линии: ${requiredAmperage}А
        Потребителей: ${consumers}
        Ток на потребителя: ${(requiredAmperage / consumers).toFixed(1)}А
        Выбран номинал: ${result.perCollectorAmperage}А
        Токосъемников на потребителя: ${result.collectorsPerConsumer}
        Всего токосъемников: ${result.totalCollectors}
        `);
        return result;
    }

    // Вспомогательная функция для тестирования подбора токосъемников для индивидуальных потребителей
    testIndividualCollectorSelection(consumers: Consumer[], voltage: number) {
        const result = this.selectIndividualCurrentCollectors(consumers, voltage);
        console.log(`
        Тест подбора токосъемников (индивидуальные потребители):
        Напряжение: ${voltage}В
        Потребители: ${consumers.map((c) => c.power + ' кВт').join(', ')}
        Результаты по потребителям:
        ${result.consumers
            .map(
                (c, i) =>
                    `  Потребитель ${i + 1}: ${c.power} кВт → ${Math.round(c.current)}А → ${c.requiredCollectors} шт по ${Math.round(c.totalCollectorAmperage / c.requiredCollectors)}А`,
            )
            .join('\n')}
        Всего токосъемников: ${result.totalCollectors}
        Общая стоимость: ${result.totalPrice} ₽
        `);
        return result;
    }
}

export const catalogService = new CatalogService();
