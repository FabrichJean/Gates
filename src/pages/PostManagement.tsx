import { FilePlus, Eye, Columns } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPosts } from "../api/posts";
import type { Post, PostsResponse } from "../types/post";
import Loader from "../components/Loader";

const PostManagement = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await getPosts();
            const data: PostsResponse = response.data;
            setPosts(data.posts);
        } catch (err) {
            setError("Erreur lors du chargement des posts");
            console.error("Error fetching posts:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };


    const getMainTitle = (post: Post) => {
        return post.titles.find(title => title.i18_language === "fr")?.title || 
               post.titles[0]?.title || 
               "Sans titre";
    };

    const filteredPosts = posts.filter(post =>
        getMainTitle(post).toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.postCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.postSubCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.plateform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(post.createdAt).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="text-red-500 text-center">
                    <p className="text-xl mb-2">Erreur</p>
                    <p>{error}</p>
                    <button 
                        onClick={fetchPosts}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full">
            <div className="">
                <h1 className="text-2xl font-bold text-gray-700 dark:text-blue-100">Post Management</h1>

                {/* header  */}
                <header className="border-b border-gray-200 dark:border-gray-700 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-3">
                            <Link
                                to={"/post/upload"}
                                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 font-medium text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition-all"
                            >
                                <FilePlus className="w-5 h-auto text-blue-400 dark:text-blue-300" />
                            </Link>
                            <button className="flex items-center justify-center gap-2 p-2.5 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 font-medium text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition-all">
                                <Columns className="w-5 h-auto text-blue-400 dark:text-blue-300" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            </div>
            {/* tableau post videos */}
            <div className="w-full mt-4">
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left border-t-3 border-blue-500 dark:border-blue-500 rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-blue-500/5 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    ID
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Titre
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Catégorie
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Sous-catégorie
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Plateforme
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Date de création
                                </th>
                                <th scope="col" className="px-6 py-3 text-left">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map((post) => (
                                    <tr key={post.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {post.id}
                                        </th>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs truncate" title={getMainTitle(post)}>
                                                {getMainTitle(post)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100/50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
                                                {post.postCategory.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100/50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
                                                {post.postSubCategory.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                                                {post.plateform.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {formatDate(post.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-center gap-2">
                                                <Link
                                                    to={`/post/${post.id}`}
                                                    className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredPosts.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {searchTerm ? "Aucun post trouvé pour cette recherche" : "Aucun post disponible"}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default PostManagement;
