export interface RomanTitle {
    id: number;
    title: string;
    description: string;
    i18_language: string;
}

export interface RomanCategory {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface RomanSubCategory {
    id: number;
    name: string;
    category_id: number;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RomanCreator {
    id: number;
    name: string;
    gender: string;
    avatar: string;
    description: string | null;
    metadata: any;
    isDeleted: boolean;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RomanPlateforme {
    id: number;
    name: string;
    video_sync_url: string | null;
    post_sync_url: string | null;
}

export interface Roman {
    id: number;
    checking: string;
    processing: string;
    ref: string;
    comment: string;
    user_id: number;
    creator: string;
    creator_id: number;
    category_id: number;
    sub_category_id: number;
    total_words: number;
    chapters_count: number;
    isDeleted: boolean;
    plateform_id: number;
    createdAt: string;
    updatedAt: string;
    titles: RomanTitle[];
    category: RomanCategory;
    subCategory: RomanSubCategory;
    creatorObj: RomanCreator;
    plateform: RomanPlateforme;
}

export interface RomansResponse {
    romans: Roman[];
    count: number;
}
