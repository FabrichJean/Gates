import { useState, useEffect } from "react";
import type { Category } from "../components/CategoryAutoComplete";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import axios from "axios";

export type PostStatus = "approved" | "pending" | "rejected";
export type PostChecking = "verified" | "pending" | "rejected";
export type postID = number | string | undefined;

export type TPostBck = {
    id: number;
    ref: string;
    username: string;
    category: Category;
    subCategory_id: Number;
    status: PostStatus;
    images: string[];
    videos: string[];
    duration: string;
    checking: PostChecking;
    createdAt: string;
    title :Array<{id : number, language : string, title : string, description : string}>;
};

export type Language = {
    code: string;
    name: string;
};

export type PostTitle = {
    id: number;
    title: string;
    description: string | null;
    post_id: number;
    i18_language: string;
    language: Language;
};

export type PostContent = {
    id: number;
    content: string;
    post_id: number;
    i18_language: string;
    language: Language;
};

export type PostCategory = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
};

export type PostSubCategory = {
    id: number;
    name: string;
    category_id: number;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
};

export type Plateform = {
    id: number;
    name: string;
    video_sync_url: string;
    post_sync_url: string;
};

export type VideoPublicUrls = {
    local_mp4_url: string | null;
    hls_url: string | null;
    local_hls_url: string | null;
};

export type VideoS3Urls = {
    hlsUrl: string | null;
    cdnUrl: string | null;
};

export type Video = {
    id: number;
    checking: string | null;
    processing: string | null;
    post_id: number;
    thumbnail_url: string | null;
    duration: number;
    s3_hls_path: string | null;
    cdn_url: string | null;
    local_mp4_path: string | null;
    hash: string;
    sys_code: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    public_urls: VideoPublicUrls;
    s3_urls: VideoS3Urls;
};

export type ImagePublicUrls = {
    local_image_url: string | null;
};

export type ImageS3Urls = {
    imageUrl: string | null;
};

export type Image = {
    id: number;
    post_id: number;
    s3_image_path: string | null;
    image_upload_status: number;
    local_image_path: string | null;
    createdAt: string;
    updatedAt: string;
    public_urls: ImagePublicUrls;
    s3_urls: ImageS3Urls;
};

export type TPost = {
    id: number;
    category_id: number;
    sub_category_id: number;
    plateform_id: number;
    published_at: string;
    createdAt: string;
    updatedAt: string;
    postTitles: PostTitle[];
    contents: PostContent[];
    postCategory: PostCategory;
    postSubCategory: PostSubCategory;
    plateform: Plateform;
    videos: Video[];
    images: Image[];
};


// Données statiques pour la table (temporaire - sera remplacé par API)
// Pour récupérer les données de l'API, décommenter le code ci-dessous:
/*
export const getPostsFromAPI = async (): Promise<TPost[]> => {
    try {
        const response = await fetch(`${apiURL}/posts`, {
            headers: { 
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        return posts;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
};
*/

export const staticPostData: TPost[] = [
    {
        id: 1,
        category_id: 1,
        sub_category_id: 1,
        plateform_id: 1,
        published_at: "2024-11-01",
        createdAt: "2024-11-01",
        updatedAt: "2024-11-01",
        postTitles: [
            {
                id: 1,
                title: "Breaking News",
                description: "Latest updates from around the world.",
                post_id: 1,
                i18_language: "en",
                language: { code: "en", name: "English" }
            }
        ],
        contents: [
            {
                id: 1,
                content: "Detailed content for the breaking news.",
                post_id: 1,
                i18_language: "en",
                language: { code: "en", name: "English" }
            }
        ],
        postCategory: {
            id: 1,
            name: "News",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        postSubCategory: {
            id: 1,
            name: "International",
            category_id: 1,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        plateform: {
            id: 1,
            name: "Main Platform",
            video_sync_url: "video_sync_url",
            post_sync_url: "post_sync_url"
        },
        videos: [
            {
                id: 1,
                checking: null,
                processing: null,
                post_id: 1,
                thumbnail_url: null,
                duration: 330,
                s3_hls_path: null,
                cdn_url: null,
                local_mp4_path: "/video static/video.mp4",
                hash: "hash1",
                sys_code: "SYS001",
                isDeleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                public_urls: {
                    local_mp4_url: "/video static/video.mp4",
                    hls_url: null,
                    local_hls_url: null
                },
                s3_urls: {
                    hlsUrl: null,
                    cdnUrl: null
                }
            }
        ],
        images: [
            {
                id: 1,
                post_id: 1,
                s3_image_path: null,
                image_upload_status: 1,
                local_image_path: "/img static/3232.jpg",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                public_urls: {
                    local_image_url: "/img static/3232.jpg"
                },
                s3_urls: {
                    imageUrl: null
                }
            }
        ]
    },
    {
        id: 2,
        category_id: 2,
        sub_category_id: 1,
        plateform_id: 1,
        published_at: "2024-11-02",
        createdAt: "2024-11-02",
        updatedAt: "2024-11-02",
        postTitles: [
            { id: 1, title: "Behind the Scenes", description: "A deep dive into filmmaking.", post_id: 2, i18_language: "en", language: { code: "en", name: "English" } },
            { id: 2, title: "Dans les coulisses", description: "Aperçu du monde du cinéma.", post_id: 2, i18_language: "fr", language: { code: "fr", name: "French" } },
            { id: 3, title: "Ao ambadiky ny sehatra", description: "Fijerena akaiky ny famoronana.", post_id: 2, i18_language: "mg", language: { code: "mg", name: "Malagasy" } }
        ],
        contents: [
            { id: 1, content: "Behind-the-scenes content.", post_id: 2, i18_language: "en", language: { code: "en", name: "English" } }
        ],
        postCategory: {
            id: 2,
            name: "Entertainment",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        postSubCategory: {
            id: 1,
            name: "Movies",
            category_id: 2,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        plateform: {
            id: 1,
            name: "Main Platform",
            video_sync_url: "video_sync_url",
            post_sync_url: "post_sync_url"
        },
        videos: [
            {
                id: 1,
                checking: null,
                processing: null,
                post_id: 2,
                thumbnail_url: null,
                duration: 765,
                s3_hls_path: null,
                cdn_url: null,
                local_mp4_path: "/video static/video.mp4",
                hash: "hash2",
                sys_code: "SYS002",
                isDeleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                public_urls: {
                    local_mp4_url: "/video static/video.mp4",
                    hls_url: null,
                    local_hls_url: null
                },
                s3_urls: {
                    hlsUrl: null,
                    cdnUrl: null
                }
            }
        ],
        images: [
            {
                id: 1,
                post_id: 2,
                s3_image_path: null,
                image_upload_status: 1,
                local_image_path: "/img static/3232.jpg",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                public_urls: {
                    local_image_url: "/img static/3232.jpg"
                },
                s3_urls: {
                    imageUrl: null
                }
            }
        ]
    }
];


// Hook pour récupérer un post par ID
export function UsePost(id: postID) {
    const [data, setData] = useState<TPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!id) {
            setError(new Error("L'Id n'est pas trouvé"));
            setLoading(false);
            return;
        }

        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await axios.get<TPost>(`${apiURL}/posts/${id}`, {
                    headers: { 
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                setData(response.data);
                setLoading(false);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(new Error(err.response?.data?.message || err.message));
                } else {
                    setError(err instanceof Error ? err : new Error('Failed to fetch post'));
                }
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    return { data, loading, error };

    // Alternative: Utiliser les données statiques (décommenter si besoin)
    /*
    useEffect(() => {
        if (!id) {
            setError(new Error("L'Id n'est pas trouvé"));
            setLoading(false);
            return;
        }

        setLoading(true);
        setTimeout(() => {
            const post = staticPostData.find(p => p.id === Number(id));
            setData(post || null);
            setLoading(false);
        }, 100);
    }, [id]);
    */
}
// Hook pour récupérer tous les posts
export function UsePosts() {
    const [data, setData] = useState<TPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                
                const response = await axios.get<TPost[]>(`${apiURL}/posts`, {
                    headers: { 
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                setData(response.data);
                setLoading(false);
                
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(new Error(err.response?.data?.message || err.message));
                } else {
                    setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
                }
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Alternative: Utiliser les données statiques (décommenter si besoin)
    /*
    useEffect(() => {
        setTimeout(() => {
            setData(staticPostData);
            setLoading(false);
        }, 100);
    }, []);
    */

    return { data, loading, error };
}

// Fonction utilitaire pour obtenir le post précédent
export function getPrevPost(currentId: number, posts: TPost[]): TPost | undefined {
    return posts.find(p => p.id === currentId - 1);
}

// Fonction utilitaire pour obtenir le post suivant
export function getNextPost(currentId: number, posts: TPost[]): TPost | undefined {
    return posts.find(p => p.id === currentId + 1);
}

// Fonction utilitaire pour vérifier si un post précédent existe
export function hasPrevPost(currentId: number, posts: TPost[]): boolean {
    const prevPost = posts.find(p => p.id === currentId - 1);
    return prevPost !== undefined;
}

// Fonction utilitaire pour vérifier si un post suivant existe
export function hasNextPost(currentId: number, posts: TPost[]): boolean {
    const nextPost = posts.find(p => p.id === currentId + 1);
    return nextPost !== undefined;
}
