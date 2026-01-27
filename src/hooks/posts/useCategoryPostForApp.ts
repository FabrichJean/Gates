import { apiURL } from '../../constant';
import useFetch from 'http-react';
import { getToken } from '../../utils/storage';
import type { Category } from '../../components/CategoryAutoComplete';

interface CategoryResponse {
    success: boolean;
    categories: Category[];
    message?: string;
}

const useCategoryPostForApp = () => useFetch<CategoryResponse>(`${apiURL}/post-for-app-categories`, {
    headers: {
       'Authorization': `Bearer ${getToken()}`
    },
});

export default useCategoryPostForApp;