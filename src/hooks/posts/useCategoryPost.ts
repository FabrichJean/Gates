
import { apiURL } from '../../constant';
import useFetch from 'http-react';
import { getToken } from '../../utils/storage';

interface Category {
    id: number;
    name: string;
}

interface CategoryResponse {
    success: boolean;
    categories: Category[];
    message?: string;
}

const useCategoryPost = () => useFetch<CategoryResponse>(`${apiURL}/post-categories`, {
    headers: {
       'Authorization': `Bearer ${getToken()}`
    },
});

export default useCategoryPost;