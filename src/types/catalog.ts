export type ComponentType =
    | 'housing'
    | 'conductor'
    | 'hanger'
    | 'endcap'
    | 'feed'
    | 'joint'
    | 'bracket';

export interface ComponentSpecs {
    amperageMax?: number;
    amperage?: number;
    poles?: number[];
    mount?: string[];
    series?: string[];
}

export interface ComponentItem {
    id: string;
    name: string;
    type: ComponentType;
    series?: string[];
    specs?: ComponentSpecs;
    price?: number;
}
