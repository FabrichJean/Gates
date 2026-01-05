export type RomanTitle = {
    id: number;
    title: string;
    description: string;
    i18_language: string;
    language: {
        code: string;
        name: string;
    };
};

export type Category = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
};

export type SubCategory = {
    id: number;
    name: string;
    category_id: number;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
};

export type Creator = {
    id: number;
    name: string;
    avatar: string | null;
    gender: string;
};

export type Platform = {
    id: number;
    name: string;
    video_sync_url: string | null;
    post_sync_url: string | null;
};

export type UserInfo = {
    id: number;
    username: string;
    email: string;
    role: string;
};

export type Roman = {
    id: number;
    checking: string;
    processing: string;
    ref: string;
    comment: string | null;
    user_id: number;
    creator: string | null;
    creator_id: number | null;
    category_id: number;
    sub_category_id: number | null;
    total_words: number;
    chapters_count: number;
    need_vip: boolean;
    isDeleted: boolean;
    plateform_id: number;
    cover: string;
    s3_cover_path: string | null;
    cover_upload_status: number;
    local_cover_path: string;
    createdAt: string;
    updatedAt: string;
    titles: RomanTitle[];
    chapters: any[];
    category: Category;
    subCategory: SubCategory | null;
    creatorObj: Creator | null;
    plateform: Platform;
    user: UserInfo;
    public_urls: {
        cover_url: string;
        local_cover_url: string;
    };
    s3_urls: {
        coverUrl: string | null;
    };
};
