
import { apiURL } from '../../constant';
import useFetch from 'http-react';
import { getToken } from '../../utils/storage';
import type { Category } from '../../components/CategoryAutoComplete';

interface SubCategory {
    id: number;
    name: string;
    subCategories: number;
    category: Category;
}

interface SubCategoryResponse {
    success: boolean;
    subCategories: SubCategory[];
    message?: string;
}

const useSubCategoryPost = (categoryId?: number) => useFetch<SubCategoryResponse>(`${apiURL}/post-sub-categories`, {
    headers: {
       'Authorization': `Bearer ${getToken()}`
    },
});

export default useSubCategoryPost;