import { useState, useEffect } from "react";
import type { Category } from "../components/CategoryAutoComplete";
import { apiURL, token } from "../constant";
import { getToken } from "../utils/storage";
import axios from "axios";
import useFetch from "http-react";
import { type Creator } from "../components/creators/CreatorList";
import type { TagCategoryItem } from "../api/tagCategory";

export type PostForAppStatus = "approved" | "pending" | "rejected";
export type PostForAppChecking = "verified" | "pending" | "rejected";
export type postForAppID = number | string | undefined;

export type TPostForAppBck = {
    id: number;
    ref: string;
    username: string;
    category: Category;
    subCategory_id: Number;
    status: PostForAppStatus;
    images: string[];
    videos: string[];
    duration: string;
    checking: PostForAppChecking;
    createdAt: string;
    title :Array<{id : number, language : string, title : string, description : string}>;
};

export type Language = {
    code: string;
    name: string;
};

export type PostForAppTitle = {
    id: number;
    title: string;
    description: string | null;
    post_for_app_id: number;
    i18_language: string;
    language: Language;
};

export type PostForAppContent = {
    id: number;
    content: string;
    post_for_app_id: number;
    i18_language: string;
    language: Language;
};

export type Image = {
    id: number;
    post_for_app_id: number;
    s3_image_path: string | null;
    image_upload_status: number;
    local_image_path: string;
    createdAt: string;
    updatedAt: string;
    public_urls: {
        local_image_url: string;
    };
    s3_urls: {
        imageUrl: string | null;
    };
};

export type Video = {
    id: number;
    checking: string;
    processing: string;
    post_for_app_id: number;
    thumbnail_url: string | null;
    duration: number;
    s3_hls_path: string | null;
    cdn_url: string | null;
    local_mp4_path: string;
    hash: string;
    sys_code: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    public_urls: {
        local_mp4_url: string;
        hls_url: string;
        local_hls_url: string | null;
    };
    s3_urls: {
        hlsUrl: string | null;
        cdnUrl: string | null;
    };
};

export type TPostForApp = {
    id: number;
    category_id: number;
    sub_category_id: number;
    plateform_id: number;
    published_at: string | null;
    createdAt: string;
    updatedAt: string;
    // optional free-text creator name
    creator?: string | null;
    creatorObj?: Creator | null;
    titles: PostForAppTitle[];
    postCategory: any; // PostForAppCategory
    postSubCategory: any; // PostForAppSubCategory
    plateform: any;
    isDeleted: boolean;
    isBanned: boolean;
    videos: Video[];
    images: Image[];
};

// Hook pour récupérer un post for app par ID
export function UsePostForApp(id: postForAppID) {
    return useFetch<TPostForApp>(apiURL + '/posts-for-app/' + id, {
        headers: { Authorization: `Bearer ${token()}` },
    })
}

// Hook pour récupérer tous les posts for app
export function UsePostsForApp() {
    const [data, setData] = useState<TPostForApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchPostsForApp = async () => {
            try {
                setLoading(true);

                const response = await axios.get(`${apiURL}/posts-for-app`, {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

                // Gérer différents formats de réponse API
                const responseData = response.data;
                if (responseData && typeof responseData === 'object' && 'postsForApp' in responseData) {
                    setData(responseData.postsForApp);
                } else if (Array.isArray(responseData)) {
                    setData(responseData);
                } else {
                    console.warn('Format de réponse inattendu pour posts-for-app:', responseData);
                    setData([]);
                }
            } catch (err) {
                console.error('Erreur lors de la récupération des posts for app:', err);
                setError(err instanceof Error ? err : new Error('Erreur inconnue'));
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPostsForApp();
    }, []);

    return { data, loading, error };
}

// Hook pour naviguer entre les posts for app
export function useNextPostForApp(currentId: string | undefined) {
    const { data: posts, loading } = UsePostsForApp();

    const currentIndex = posts.findIndex(post => post.id.toString() === currentId);

    const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
    const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;

    return {
        nextPost,
        prevPost,
        hasNext: nextPost !== null,
        hasPrev: prevPost !== null,
        loading
    };
}