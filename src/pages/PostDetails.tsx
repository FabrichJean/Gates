import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { UsePost, UsePosts, getPrevPost, getNextPost, hasPrevPost, hasNextPost } from "../hooks/usePost";
import { ArrowLeft, Edit, ChevronLeft, ChevronRight, Images, X, Video, Languages } from "lucide-react";

const PostDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: post, loading, error} = UsePost(id);
    const { data: allPosts } = UsePosts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    
    const currentId = parseInt(id || "1");
    
    const handleBack = () => {
        navigate("/post");
    };
    
    const handleModify = () => {
        // Navigation vers la page de modification
        navigate(`/post/edit/${id}`);
    };
    
    const handlePrev = () => {
        const prevPost = getPrevPost(currentId, allPosts);
        if (prevPost) {
            navigate(`/post/${prevPost.id}`);
        }
    };
    
    const handleNext = () => {
        const nextPost = getNextPost(currentId, allPosts);
        if (nextPost) {
            navigate(`/post/${nextPost.id}`);
        }
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-600 dark:text-red-400"> Post Not Found</div>
            </div>
        );
    }
        
    return (
        <div className="p-6">
            <div className="flex items-center justify-between flex-col md:flex-row mb-4">
                <h1 className="text-2xl font-bold text-gray-700 dark:text-blue-100">
                    Post Details - {post.ref}
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <button
                        onClick={handleModify}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={handlePrev}
                        disabled={!hasPrevPost(currentId, allPosts)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!hasNextPost(currentId, allPosts)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ref</p>
                        <p className="font-medium text-gray-900 dark:text-white">{post.ref}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">User</p>
                        <p className="font-medium text-gray-900 dark:text-white">{post.username}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                        <p className="font-medium text-gray-900 dark:text-white">{post.category.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                        <p className="font-medium text-gray-900 dark:text-white">{post.duration}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            post.status === 'approved'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : post.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                            {post.status}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Verification</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            post.checking === 'verified'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : post.checking === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                            {post.checking}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                        <p className="font-medium text-gray-900 dark:text-white">{post.createdAt}</p>
                    </div>
                </div>

                {/* Section Titre et Description multilingue */}
                {post.title.length > 0 && (
                    <div className="mt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Languages size={20} className="text-gray-700 dark:text-gray-300" />
                            <div className="flex gap-2 flex-wrap">
                                {post.title.map((item) => (
                                    <button
                                        key={item.language}
                                        onClick={() => setSelectedLanguage(item.language)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                            selectedLanguage === item.language
                                                ? 'bg-blue-500 text-white shadow-md'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {item.language.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {post.title.find(t => t.language === selectedLanguage)?.title}
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {post.title.find(t => t.language === selectedLanguage)?.description}
                            </p>
                        </div>
                    </div>
                )}
                
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Images ({post.images.length})</p>
                        {post.images.length > 3 && (
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                <Images size={18} />
                                <span>Voir plus ({post.images.length - 3})</span>
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {post.images.slice(0, 3).map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`image-${index}`}
                                className="w-full md:w-64 h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Videos ({post.videos.length})</p>
                        {post.videos.length > 3 && (
                            <button 
                                onClick={() => setIsVideoModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                <Video size={18} />
                                <span>Voir plus ({post.videos.length - 3})</span>
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {post.videos.slice(0, 3).map((video, index) => (
                            <video
                                key={index}
                                src={video}
                                controls
                                className="w-full md:w-64 h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal DaisyUI pour afficher toutes les images */}
            <dialog className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
                <div className="modal-box max-w-6xl w-11/12 max-h-[90vh]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-2xl">Toutes les images ({post.images.length})</h3>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="btn btn-sm btn-circle btn-ghost"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {post.images.map((image, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={image}
                                    alt={`image-${index}`}
                                    className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
                                />
                                <div className="absolute top-2 right-2 badge badge-neutral">
                                    {index + 1}/{post.images.length}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setIsModalOpen(false)}>close</button>
                </form>
            </dialog>

            {/* Modal DaisyUI pour afficher toutes les vidéos */}
            <dialog className={`modal ${isVideoModalOpen ? 'modal-open' : ''}`}>
                <div className="modal-box max-w-6xl w-11/12 max-h-[90vh]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-2xl">Toutes les vidéos ({post.videos.length})</h3>
                        <button
                            onClick={() => setIsVideoModalOpen(false)}
                            className="btn btn-sm btn-circle btn-ghost"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {post.videos.map((video, index) => (
                            <div key={index} className="relative group">
                                <video
                                    src={video}
                                    controls
                                    className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
                                />
                                <div className="absolute top-2 right-2 badge badge-neutral">
                                    {index + 1}/{post.videos.length}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setIsVideoModalOpen(false)}>close</button>
                </form>
            </dialog>

        </div>
    );
};
export default PostDetails;