export interface RomanTitle {
    title: string;
    i18_language: string;
    language: {
        code: string;
        name: string;
    };
}

export interface Roman {
    id: number;
    ref: string;
    user_id: number;
    creator_id: number;
    titles: RomanTitle[];
    user: {
        id: number;
        username: string;
        email: string;
    };
    creatorObj: {
        id: number;
        name: string;
        avatar: string;
        gender: string;
    };
}

export interface RomanChapter {
    id: number;
    roman_id: number;
    chapter_number: number;
    titles?: Array<{ i18_language: string; title: string; language?: { code: string; name: string } }>;
    contents?: Array<{ i18_language: string; content: string; nb_words?: number; language?: { code: string; name: string } }>;
    word_count?: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    roman?: Roman;
}

export interface RomanChapterDetailsProps {
    chapter: RomanChapter;
    onClose: () => void;
}
