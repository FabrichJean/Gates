import { useState, useEffect } from "react";
import type { Category } from "../components/CategoryAutoComplete";
import { apiURL, token } from "../constant";
import { getToken } from "../utils/storage";
import axios from "axios";
import useFetch from "http-react";
import { type Creator } from "../components/creators/CreatorList";
import type { TagCategoryItem } from "../api/tagCategory";
import { getPostsForApp } from "../api/postsForApp";
import usePostForAppManagement from "./usePostForAppManagement";
import type { PostForAppTitle } from "../types/postForApp";

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
// Use the PostForAppTitle type from ../types/postForApp for consistency


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
    const [data, setData] = useState<TPostForApp | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchPost = async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(apiURL + '/posts-for-app/' + id, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            setData(response.data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [id, refreshKey]);

    const refetch = () => setRefreshKey(prev => prev + 1);

    return { data, loading, error, refetch };
}

// Hook pour récupérer tous les posts for app (version simplifiée pour debug)
export function UsePostsForApp() {
    const [data, setData] = useState<TPostForApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchPostsForApp = async () => {
            try {
                setLoading(true);

                // Utiliser la fonction API dédiée
                const response = await getPostsForApp({
                    limit: 50,
                    page: 1
                });

                // Gérer différents formats de réponse API
                const responseData = response.data;
                
                let posts: TPostForApp[] = [];
                if (responseData && typeof responseData === 'object' && 'postsForApp' in responseData) {
                    posts = responseData.postsForApp;
                } else if (Array.isArray(responseData)) {
                    posts = responseData;
                } else if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)) {
                    posts = responseData.data;
                } else {
                    console.warn('UsePostsForApp - Format de réponse inattendu pour posts-for-app:', responseData);
                    posts = [];
                }
                
                console.log('Posts récupérés:', posts.length, 'posts');
                setData(posts);
                
                console.log('Posts récupérés:', posts.length, 'posts');
                setData(posts);
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

// Hook pour naviguer entre les posts for app (version finale)
export function useNextPostForApp(currentId: string | undefined) {
    const {data} = usePostForAppManagement()
    const [navigationData, setNavigationData] = useState<{
        nextPost: TPostForApp | null;
        prevPost: TPostForApp | null;
        hasNext: boolean;
        hasPrev: boolean;
        loading: boolean;
    }>({
        nextPost: null,
        prevPost: null,
        hasNext: false,
        hasPrev: false,
        loading: true
    });

    useEffect(() => {
        const fetchNavigationData = async () => {
            if (!currentId) {
                setNavigationData({
                    nextPost: null,
                    prevPost: null,
                    hasNext: false,
                    hasPrev: false,
                    loading: false
                });
                return;
            }

            try {

                const posts = data?.posts;
                const currentIndex = posts?.findIndex(post => post.id === Number(currentId));
                const nextPost = currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
                const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;

                setNavigationData({
                    nextPost,
                    prevPost,
                    hasNext: nextPost !== null,
                    hasPrev: prevPost !== null,
                    loading: false
                });

            } catch (error) {
                console.error('Erreur lors de la récupération des données de navigation:', error);
                setNavigationData({
                    nextPost: null,
                    prevPost: null,
                    hasNext: false,
                    hasPrev: false,
                    loading: false
                });
            }
        };

        fetchNavigationData();
    }, [currentId, data]);

    return navigationData;
}