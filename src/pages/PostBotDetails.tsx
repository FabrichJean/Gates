import { useParams, useNavigate, Link } from "react-router-dom";
import PostChecking from "../components/PostChecking";
import { ArrowLeft, Edit } from "lucide-react";
import GetImagePost from "./posts/getImagePost";
import GetVideoPost from "./posts/getVideoPost";
import GetPostTitles from "./posts/GetPostTitles";
import BtnTranscodeComponent from "../components/Post/BtnTranscodeComponent";
import { useNextPostBot, UsePostBot } from "../hooks/usePostBot";
import { cdnS3 } from "../utils/cdn";

const PostBotDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: post, loading, error, reFetch } = UsePostBot(id);
    const { nextPost, prevPost, hasNext, hasPrev } = useNextPostBot(id);

    const handleBack = () => {
        navigate("/bot-posts");
    };

    const handleModify = () => {
        // Navigation vers la page de modification
        navigate(`/bot-posts/edit/${id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-gray-600 dark:text-gray-400">加载中...</div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-600 dark:text-red-400"> 未找到帖子</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between flex-col md:flex-row mb-4">
                <h1 className="text-2xl font-bold text-gray-700 dark:text-blue-100">
                    帖子详情 - POST-{String(post.id).padStart(3, "0")}
                </h1>
                <PostChecking reFetch={reFetch} post={post} />
                <div className="flex gap-2">
                    <button
                        onClick={handleBack}
                        className="relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5
        font-medium text-sm rounded-md transition-all duration-300
        backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 flex-shrink-0"
                    >
                        <ArrowLeft size={16} />
                        <span className="sm:hidden">←</span>
                        <span className="hidden sm:inline">返回</span>
                        <span className="sm:hidden">返回</span>
                    </button>
                    <button
                        onClick={handleModify}
                        className="relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5
    font-medium text-sm rounded-md transition-all duration-300
    backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 flex-shrink-0"
                    >
                        <Edit size={16} />
                    </button>
                    <BtnTranscodeComponent post={post} reFetch={reFetch} />

                    {hasPrev ? (
                        <Link
                            to={"/bot-posts/" + prevPost}
                            className="relative flex items-center justify-center gap-2 px-4 py-2
    font-medium text-sm rounded-md transition-all duration-300
    bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 
    text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 
    hover:border-blue-300 dark:hover:border-blue-600 flex-shrink-0 min-w-[90px]"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            上一条
                        </Link>
                    ) : (
                        <div
                            className="relative flex items-center justify-center gap-2 px-4 py-2
    font-medium text-sm rounded-md transition-all duration-300
    bg-gray-100 dark:bg-gray-800 
    text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 
    flex-shrink-0 min-w-[90px] cursor-not-allowed opacity-50"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                    )}
                    {hasNext ? (
                        <Link
                            to={"/bot-posts/" + nextPost}
                            className="relative flex items-center justify-center gap-2 px-4 py-2
    font-medium text-sm rounded-md transition-all duration-300
    bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 
    text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 
    hover:border-blue-300 dark:hover:border-blue-600 flex-shrink-0 min-w-[90px]"
                        >
                            下一条
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </Link>
                    ) : (
                        <div
                            className="relative flex items-center justify-center gap-2 px-4 py-2
    font-medium text-sm rounded-md transition-all duration-300
    bg-gray-100 dark:bg-gray-800 
    text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 
    flex-shrink-0 min-w-[90px] cursor-not-allowed opacity-50"
                        >
                            下一条
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">编号</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            POST-{String(post?.id).padStart(3, "0")}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">平台</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {post?.plateform.name}
                        </p>
                    </div>
                    {
                        // prefer showing creatorObj (with avatar) when available
                        (post as any)?.creatorObj ? (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    创建者
                                </p>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={cdnS3((post).creatorObj.avatar)}
                                        alt={(post)?.creatorObj.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => {
                                            const t = e.target as HTMLImageElement;
                                            t.src = "";
                                        }}
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            <Link className="hover:text-blue-500" to={`/creators/` + post?.creatorObj?.id}>{(post)?.creatorObj?.name ?? post.creator ?? '-'}</Link>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {(post as any)?.creatorObj.gender || ""}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : post?.creator ? (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    创建者
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {post?.creator}
                                </p>
                            </div>
                        ) : null
                    }
                    {/* User / owner information (if provided by API) */}

                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">用户</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {(post as any)?.user?.username}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">分类</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {post?.postCategory?.name}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            子分类
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {post?.postSubCategory?.name}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">时长</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {post?.videos[0]
                                ? `${Math.floor(post.videos[0].duration / 60)}:${String(
                                    post?.videos[0].duration % 60
                                ).padStart(2, "0")}`
                                : "N/A"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            验证
                        </p>
                        {post?.videos[0] ? (
                            <PostChecking index={0} reFetch={reFetch} post={post} />
                        ) : (
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}
                            >
                                无视频
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            发布时间
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(post?.published_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">创建时间</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(post?.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    {/* Tag Category chips */}
                    <div className="col-span-2 mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">标签</p>
                        {Array.isArray((post as any)?.tagCategory) && (post as any)?.tagCategory.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {(post as any).tagCategory.map((tg: any) => (
                                    <span
                                        key={`${tg?.id ?? tg?.name}-chip`}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                                        title={tg?.meta ? JSON.stringify(tg.meta) : undefined}
                                    >
                                        #{tg?.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">无标签</span>
                        )}
                    </div>
                </div>

                <GetPostTitles postTitles={post?.titles} />
                <GetImagePost images={post?.images} reFetch={reFetch} />
                {/* ensure each video has a local_cover_path fallback to post.local_cover_path */}
                <GetVideoPost
                    idPost={post?.id}
                    videos={(post?.videos || []).map((v: any) => ({
                        ...v,
                        local_cover_path: v.local_cover_path || v.public_urls?.cover_url || v.s3_urls?.coverUrl || (post as any)?.local_cover_path || v.cover || "",
                    }))}
                    reFetch={reFetch}
                />
            </div>
        </div>
    );
};
export default PostBotDetails;
