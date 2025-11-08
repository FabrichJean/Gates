
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
    
    // const [categories, setCategories] = useState<Category[]>([]);
    // const [loading, setLoading] = useState<boolean>(false);
    // const [error, setError] = useState<string | null>(null);

    // const fetchCategories = async () => {
    //     setLoading(true);
    //     setError(null);
        
    //     try {
    //         const response = await axios.get<CategoryResponse>(`${apiURL}/post-categories`);

    //         if (response.data.success) {
    //             setCategories(response.data.data);
    //         } else {
    //             setError(response.data.message || 'Failed to fetch categories');
    //         }
    //     } catch (err) {
    //         if (axios.isAxiosError(err)) {
    //             setError(err.response?.data?.message || err.message || 'Failed to fetch categories');
    //         } else {
    //             setError('An unexpected error occurred');
    //         }
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchCategories();
    // }, []);

    // const refreshCategories = () => {
    //     fetchCategories();
    // };

    // return {
    //     categories,
    //     loading,
    //     error,
    //     refreshCategories
    // };


export default useCategoryPost;