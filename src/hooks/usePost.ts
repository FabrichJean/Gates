import { useState, useEffect } from "react";
import type { Category } from "../components/CategoryAutoComplete";
import { apiURL, token } from "../constant";
import { getToken } from "../utils/storage";
import axios from "axios";
import useFetch from "http-react";
import type { Creator } from "./useCreators";
import type { TagCategoryItem } from "../api/tagCategory";
import { UsePostBot } from "./usePostBot";

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
    local_cover_path: string | null;
};

export type VideoS3Urls = {
    hlsUrl: string | null;
    cdnUrl: string | null;
    coverUrl: string | null;
};

export type Video = {
    id: number;
    checking: string | null;
    processing: string | null;
    post_id: number;
    thumbnail_url: string | null;
    duration: number;
    s3_hls_path: string | null;
    s3_cover_path: string | null;
    cdn_url: string | null;
    local_mp4_path: string | null;
    hash: string;
    sys_code: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    public_urls: VideoPublicUrls;
    s3_urls: VideoS3Urls;
    type: '1' | '2';
    // optional local cover path provided by backend (new field)
    local_cover_path?: string | null;
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
    checking: string | null;
    plateform_id: number;
    published_at: string;
    creatorObj: Creator
    createdAt: string;
    updatedAt: string;
    // optional creator free-text
    creator?: string | null;
    titles: PostTitle[];
    processing: string | null;
    contents: PostContent[];
    postCategory: PostCategory;
    postSubCategory: PostSubCategory;
    tagCategory: TagCategoryItem[];
    plateform: Plateform;
    videos: Video[];
    images: Image[];
};


// Hook pour récupérer un post par ID
export function UsePost(id: postID) {
    return useFetch<TPost>(apiURL + '/posts/' + id, {
        headers: { Authorization: `Bearer ${token()}` },
    })
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
                
                const response = await axios.get(`${apiURL}/posts`, {
                    headers: { 
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                // Gérer différents formats de réponse API
                const responseData = response.data;
                if (Array.isArray(responseData)) {
                    setData(responseData);
                } else if (responseData?.data && Array.isArray(responseData.data)) {
                    setData(responseData.data);
                } else if (responseData?.posts && Array.isArray(responseData.posts)) {
                    setData(responseData.posts);
                } else {
                    console.warn('Format de réponse API inattendu:', responseData);
                    setData([]);
                }
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

    return { data, loading, error };
}


// Hook pour navigation entre posts
export function useNextPost(currentId: string | number | undefined) {
    const { data: posts, loading } = UsePosts();

    // Vérifier si posts est un tableau, sinon retourner des valeurs par défaut
    if (!posts || !Array.isArray(posts)) {
        return {
            loading,
            nextPost: currentId,
            prevPost: currentId,
            hasNext: false,
            hasPrev: false
        };
    }

    const currentPostIndex = posts.findIndex(post => post.id === Number(currentId));
    const hasNext = currentPostIndex !== -1 && currentPostIndex < (posts.length - 1);
    const hasPrev = currentPostIndex !== -1 && currentPostIndex > 0;

    return {
        loading,
        nextPost: hasNext ? posts[currentPostIndex + 1]?.id || currentId : currentId,
        prevPost: hasPrev ? posts[currentPostIndex - 1]?.id || currentId : currentId,
        hasNext,
        hasPrev
    };
}