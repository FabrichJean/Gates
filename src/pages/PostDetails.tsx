import { useParams, useNavigate } from "react-router-dom";
import { UsePost, UsePosts, getPrevPost, getNextPost, hasPrevPost, hasNextPost } from "../hooks/usePost";
import { ArrowLeft, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import GetImagePost from "./posts/getImagePost";
import GetVideoPost from "./posts/getVideoPost";
import GetPostTitles from "./posts/GetPostTitles";

const PostDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: post, loading, error} = UsePost(id);
    const { data: allPosts } = UsePosts();
    
    const currentId = parseInt(id || "1");
    
    const handleBack = () => {
        navigate("/post");
    };
    
    const handleModify = () => {
        // Navigation vers la page de modification
        navigate(`/post/edit/${id}`);
    };
    
    // const handlePrev = () => {
    //     const prevPost = getPrevPost(currentId, allPosts);
    //     if (prevPost) {
    //         navigate(`/post/${prevPost.id}`);
    //     }
    // };
    
    // const handleNext = () => {
    //     const nextPost = getNextPost(currentId, allPosts);
    //     if (nextPost) {
    //         navigate(`/post/${nextPost.id}`);
    //     }
    // };
    
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
                    Post Details - POST-{String(post.id).padStart(3, '0')}
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
                        // onClick={handlePrev}
                        // disabled={!hasPrevPost(currentId, allPosts)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        // onClick={handleNext}
                        // disabled={!hasNextPost(currentId, allPosts)}
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
                        <p className="font-medium text-gray-900 dark:text-white">POST-{String(post.id).padStart(3, '0')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Platform</p>
                        <p className="font-medium text-gray-900 dark:text-white">{post.plateform.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                        <p className="font-medium text-gray-900 dark:text-white">{post.postCategory.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sub Category</p>
                        <p className="font-medium text-gray-900 dark:text-white">{post.postSubCategory.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {post.videos[0] ? `${Math.floor(post.videos[0].duration / 60)}:${String(post.videos[0].duration % 60).padStart(2, '0')}` : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            published
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Verification</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            post.videos[0]?.checking === 'verified'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : post.videos[0]?.checking === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                            {post.videos[0]?.checking || 'pending'}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
                        <p className="font-medium text-gray-900 dark:text-white">{new Date(post.published_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                        <p className="font-medium text-gray-900 dark:text-white">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <GetPostTitles postTitles={post.titles} />                
                <GetImagePost images={post.images} />
                <GetVideoPost videos={post.videos} />
            </div>
        </div>
    );
};
export default PostDetails;