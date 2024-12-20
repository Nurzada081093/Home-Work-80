export interface ICategory {
    id: string;
    title: string;
    description: string;
}

export type CategoryWithoutId = Omit<ICategory, 'id'>

export interface ILocation {
    id: string;
    title: string;
    description: string;
}

export type LocationWithoutId = Omit<ILocation, 'id'>

export interface Item {
    id: string;
    category_id: number;
    location_id: number;
    title: string;
    description: string;
    image: string | null;
    create_date: string;
}

export type ItemWithoutId = Omit<Item, 'id',' create_date'>