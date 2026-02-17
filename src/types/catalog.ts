// Типы продукта
export type ProductCategory = 'busbars' | 'components';

// Типы шинопровода
export type BusbarType = 'trolley' | 'monotrolley';

// Типы компонентов
export type ComponentType =
    | 'Секция'
    | 'Корпус'
    | 'Медь'
    | 'Подвес скользящий'
    | 'Подвес фиксирующий'
    | 'Крышка стыковая'
    | 'Крышка концевая'
    | 'Подвод питания'
    | 'Токосъемник'
    | 'Захват';

// Бренды
export interface BusbarBrand {
    id: string;
    name: string;
}

// Серии
export interface BusbarSeries {
    id: string;
    name: string;
    brandId: BusbarBrand;
    typeId: BusbarType;
    description?: string;
    imageUrl: string[];
}

// Параметры компонентов
export interface ComponentSpecs {
    amperage?: number;
    poles?: number;
    lenght?: number;
    material?: string;
}

// Компоненты
export interface ComponentItem {
    id: string;
    name: string;
    description: string;
    imageUrl: string[];
    price: number;
    type?: ComponentType;
    specs?: ComponentSpecs;
    categoryId: ProductCategory;
    brandId: BusbarBrand;
    seriesId: BusbarSeries;
}

// Параметры шинопровода
export interface BusbarSpecs {
    amperage: number;
    poles: number;
    lenght: number;
    voltage: number;
}

// Шинопровод
export interface BusbarItem {
    id: string;
    name: string;
    description: string;
    imageUrl: string[];
    amperage: number;
    price?: number;
    specs?: BusbarSpecs;
    categoryId: ProductCategory;
    brandId: BusbarBrand;
    seriesId: BusbarSeries;
    components?: ComponentItem;
}
