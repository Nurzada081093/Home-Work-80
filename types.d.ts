export interface ICategory {
    id: string;
    title: string;
    description: string;
}

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