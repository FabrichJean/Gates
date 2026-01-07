<<<<<<< HEAD
import { useState } from "react";
import { singleSync } from "../api/videos";
import SingleSyncModal from "../components/SingleSyncModal";
import { useAuth } from "../hooks/useAuth";
=======
import React, { useEffect, useState } from "react";
>>>>>>> a76bf2379bab6e279223f9de87d04a92f0493989
import { useParams, useNavigate, Link } from "react-router-dom";
import { UsePost, useNextPost } from "../hooks/usePost";
import PostChecking from "../components/PostChecking";
import { ArrowLeft, Edit } from "lucide-react";
import GetImagePost from "./posts/getImagePost";
import GetVideoPost from "./posts/getVideoPost";
import GetPostTitles from "./posts/GetPostTitles";
import BtnTranscodeComponent from "../components/Post/BtnTranscodeComponent";
<<<<<<< HEAD
import RoleEnum from "../utils/roleEnum";
import { LiaSyncSolid } from "react-icons/lia";
=======
import { togglePostBannedStatus, updatePostBannedStatus } from "../api/posts";
import toast from "react-hot-toast";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
>>>>>>> a76bf2379bab6e279223f9de87d04a92f0493989

const PostDetails = () => {
    const { user } = useAuth();
    const [singleSyncOpen, setSingleSyncOpen] = useState(false);
    const [singleSyncLoading, setSingleSyncLoading] = useState(false);

    const handleSingleSync = async (isForce: boolean) => {
      if (!post) return;
      setSingleSyncLoading(true);
      try {
        await singleSync({ entity: "post", origin_id: post.id, isForce });
        setSingleSyncOpen(false);
        reFetch();
      } catch (err: any) {
        // Optionally: toast.error(err?.response?.data?.message || "❌ Erreur sync single !");
      } finally {
        setSingleSyncLoading(false);
      }
    };
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: post, loading, error, reFetch } = UsePost(id);
  const { nextPost, prevPost, hasNext, hasPrev } = useNextPost(id);
  const [showCover, setShowCover] = useState<boolean>(true);
  const handleBack = () => {
    navigate("/post");
  };

  const handleModify = () => {
    // Navigation vers la page de modification
    navigate(`/post/edit/${id}`);
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
          Post Details - POST-{String(post.id).padStart(3, "0")}
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
            <span className="hidden sm:inline">back</span>
            <span className="sm:hidden">Back</span>
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

<<<<<<< HEAD

          {/* bouton single sync */}
          {user?.role === RoleEnum.SUPERADMIN && (
            <>
              <button
                type="button"
                onClick={() => setSingleSyncOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 text-xs font-medium transition-all duration-200"
                disabled={singleSyncLoading}
              >
                <LiaSyncSolid className="w-4 h-4" />
                Sync
              </button>
              <SingleSyncModal
                open={singleSyncOpen}
                onClose={() => setSingleSyncOpen(false)}
                onSubmit={handleSingleSync}
                title={`Synchroniser le post #${post.id}`}
              />
            </>
          )}
=======
          <button
            onClick={async () => {
              const should = window.confirm(
                post.isBanned ? "Are you sure you want to unban this post?" : "Are you sure you want to ban this post?"
              );
              if (!should) return;
              try {
                await updatePostBannedStatus(post.id, !post.isBanned);
                toast.success(`Post ${!post.isBanned ? 'banned' : 'unbanned'} successfully`);
                reFetch();
              } catch (error: any) {
                toast.error(error?.response?.data?.message || 'Failed to update banned status');
              }
            }}
            className={`relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5
font-medium text-sm rounded-md transition-all duration-300
backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-500 ${
              post.isBanned
                ? "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600"
                : "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600"
            } flex-shrink-0`}
          >
            {post.isBanned ? "Unban Post" : "Ban Post"}
          </button>
>>>>>>> a76bf2379bab6e279223f9de87d04a92f0493989

          {hasPrev ? (
            <Link
              to={"/post/" + prevPost}
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
              prev
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
              to={"/post/" + nextPost}
              className="relative flex items-center justify-center gap-2 px-4 py-2
    font-medium text-sm rounded-md transition-all duration-300
    bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 
    text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 
    hover:border-blue-300 dark:hover:border-blue-600 flex-shrink-0 min-w-[90px]"
            >
              next
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
              next
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
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative ${post.isBanned ? "ring-4 ring-red-500 ring-opacity-50" : ""}`}>
        {post.isBanned && showCover && (
          <div className="absolute inset-0 backdrop-blur-md bg-opacity-5 z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold text-xl shadow-lg transform rotate-12">
              BANNED
            </div>
          </div>
        )}
        {post.isBanned && (
          <div className="absolute top-3 right-3 z-20 flex gap-2 pointer-events-auto">
            <button
              onClick={() => {
                const next = !showCover;
                setShowCover(next);
                if (post?.id) localStorage.setItem(`post-show-cover-${post.id}`, String(next));
              }}
              className="bg-black/40 text-white p-2 rounded-md hover:bg-black/60 transition"
              title={showCover ? "Hide cover" : "Show cover"}
            >
              {showCover ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ref</p>
            <p className="font-medium text-gray-900 dark:text-white">
              POST-{String(post?.id).padStart(3, "0")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Platform</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {post?.plateform.name}
            </p>
          </div>
          {
            // prefer showing creatorObj (with avatar) when available
            (post as any)?.creatorObj ? (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Creator
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={(post).creatorObj.avatar!}
                    alt={(post)?.creatorObj.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.src = "";
                    }}
                  />
                  <div>
                    <Link className="hover:text-blue-500" to={`/creators/` + post?.creatorObj?.id}>{(post)?.creatorObj?.name ?? post.creator ?? '-'}</Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(post as any)?.creatorObj.gender || ""}
                    </p>
                  </div>
                </div>
              </div>
            ) : post?.creator ? (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Creator
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {post?.creator}
                </p>
              </div>
            ) : null
          }
          {/* User / owner information (if provided by API) */}

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">User</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {(post as any)?.user?.username}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {post?.postCategory.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sub Category
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {post?.postSubCategory.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
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
              Verification
            </p>
            {post?.videos[0] ? (
              <PostChecking index={0} reFetch={reFetch} post={post} />
            ) : (
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}
              >
                No video
              </span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Published
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(post?.published_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(post?.createdAt).toLocaleDateString()}
            </p>
          </div>
          {/* Tag Category chips */}
          <div className="col-span-2 mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Tags</p>
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
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">No tags</span>
            )}
          </div>
        </div>

        <GetPostTitles postTitles={post?.titles} />
        <div className={`${post.isBanned && showCover ? 'filter blur-sm brightness-75' : ''}`}>
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
    </div>
  );
};
export default PostDetails;
