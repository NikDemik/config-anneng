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

export interface ConfigurationResult {
    config: any; // Ваши сохраненные данные
    components: {
        sections: Component[];
        endCaps: Component[];
        jointCovers: Component[];
        powerFeeds: Component[];
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

    // Поиск комплектующих по серии и совместимости
    findAccessories(seriesId: string, amperage: number, typeIds?: string[]): Component[] {
        return this.data.components.filter((comp: Component) => {
            // Проверка типа, если указан
            if (typeIds && !typeIds.includes(comp.typeId)) return false;

            // Проверка совместимости с серией
            const seriesCompatible = comp.compatibility?.seriesIds?.includes(seriesId);

            // Проверка совместимости по току
            let amperageCompatible = true;
            if (comp.compatibility?.amperageRange) {
                const range = comp.compatibility.amperageRange;
                amperageCompatible = amperage <= range.max; // Если нужно строгий диапазон добавить условие amperage >= range.min
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
        const { length, poles, powerType, voltage, totalPower, totalConsumers, calculations } =
            configData;

        const requiredAmperage = Math.ceil(calculations.totalCurrent);
        const seriesId = 'hfp56'; // Можно определять по другим параметрам

        // 1. Находим оптимальную секцию
        const optimalSection = this.findOptimalSection(requiredAmperage, poles);
        if (!optimalSection) {
            throw new Error(`Не найдена секция для тока ${requiredAmperage}А и ${poles} жил`);
        }

        // 2. Рассчитываем количество секций
        const { count: sectionCount, remainder } = this.calculateSections(length);

        // 3. Находим совместимые комплектующие
        const accessories = this.findAccessories(seriesId, requiredAmperage);

        // Группируем комплектующие по типу
        const grouped = {
            sections: Array(sectionCount).fill(optimalSection),
            endCaps: accessories.filter((c) => c.typeId === 'end_cap'),
            jointCovers: accessories.filter((c) => c.typeId === 'joint_cover'),
            powerFeeds: accessories.filter((c) => c.typeId === 'power_feed'),
            fixedSuspensions: accessories.filter((c) => c.typeId === 'suspension_fixed'),
            slidingSuspensions: accessories.filter((c) => c.typeId === 'suspension_sliding'),
            currentCollectors: accessories.filter((c) => c.typeId === 'current_collector'),
            collectorGrips: accessories.filter((c) => c.typeId === 'collector_grip'),
        };

        // Расчет количества крышек концевых
        const endcapCount = powerType === 'end' ? 1 : 2;

        // Расчет количества крышек стыковых
        const jointCoverCount = sectionCount - 1; // Крышки стыков на количество соединений

        // Расчет количества фиксирующих подвесов
        function calculateSuspensionCount(length: number): number {
            return length <= 75 ? 1 : Math.floor(length / 75) + 1;
        }
        const suspensionFixedCount = calculateSuspensionCount(length);

        // Расчет количества скользящих подвесов
        const suspensionCount = Math.ceil(length / 4) * 3 - suspensionFixedCount; // Подвесы через каждые 1.3 метра

        // Расчет количества комплектующих
        const currentCollectorCount = totalConsumers; // По количеству потребителей

        // Расчет стоимости
        const totals = {
            sectionsCount: sectionCount,
            sectionsPrice: optimalSection.price * sectionCount,
            accessoriesCount: {
                endCaps: endcapCount, // По 1 на линию
                jointCovers: jointCoverCount,
                powerFeeds: 1, // Как минимум 1
                fixedSuspensions: suspensionFixedCount,
                slidingSuspensions: suspensionCount,
                currentCollectors: currentCollectorCount,
                collectorGrips: currentCollectorCount,
            },
            accessoriesPrice: {
                endCaps: (grouped.endCaps[0]?.price || 0) * 2,
                jointCovers: (grouped.jointCovers[0]?.price || 0) * jointCoverCount,
                powerFeeds: (grouped.powerFeeds[0]?.price || 0) * 1,
                fixedSuspensions:
                    (grouped.fixedSuspensions[0]?.price || 0) * Math.ceil(suspensionCount / 2),
                slidingSuspensions:
                    (grouped.slidingSuspensions[0]?.price || 0) * Math.floor(suspensionCount / 2),
                currentCollectors:
                    (grouped.currentCollectors[0]?.price || 0) * currentCollectorCount,
                collectorGrips: (grouped.collectorGrips[0]?.price || 0) * currentCollectorCount,
            },
            totalPrice: 0,
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
}

export const catalogService = new CatalogService();
