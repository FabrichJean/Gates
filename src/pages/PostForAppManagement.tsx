import { FilePlus, Eye, Filter, Edit, CheckSquare, Square, Users, X } from "lucide-react";
import BulkEditModal from "../components/BulkEditModal";
import Pagination from "../components/Pagination";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import useBulkSelection from "../hooks/useBulkSelection";
import BulkSelectionControls from "../components/PostForApp/BulkSelectionControls";
import RangeSelectorModal from "../components/PostForApp/RangeSelectorModal";
import UsePlateform from "../hooks/usePlateform";
import PostForAppChecking from "../components/PostForApp/PostForAppChecking";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { singleSync } from "../api/videos";
import { getPostsForApp } from "../api/postsForApp";
import {
  PostForAppProvider,
  usePostForAppContext,
} from "../context/PostForAppContext";
import { webAppPlateform } from "../api/plateforms";
import RoleEnum from "../utils/roleEnum";
import PostForAppFilter, {
  type TPostForAppFilter,
} from "../components/PostForApp/PostForAppFilter";
import { cdnS3 } from "../utils/cdn";

// Inner component consumes PostForAppContext
const PostForAppManagementInner = () => {
  // State for singleSync modal (per post)
  const [singleSyncOpenId, setSingleSyncOpenId] = useState<number | null>(null);
  const [singleSyncLoading, setSingleSyncLoading] = useState(false);

  // Selection state for bulk edit (moved to hook)
  const [showBulkEdit, setShowBulkEdit] = useState(false);


  const handleSingleSync = async (postId: number, isForce: boolean) => {
    setSingleSyncLoading(true);
    try {
      await singleSync({ entity: "post-for-app", origin_id: postId, isForce });
      toast.success("✅ Sync single post for app exécuté");
      setSingleSyncOpenId(null);
      reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "❌ Erreur sync single !");
    } finally {
      setSingleSyncLoading(false);
    }
  };

  // Selection handlers are provided by useBulkSelection hook

  const openBulkEdit = () => {
    setShowBulkEdit(true);
  };

  const closeBulkEdit = () => {
    setShowBulkEdit(false);
  };

  const { page, setPage, data, loading, reFetch, activate } = usePostForAppContext();

  // filters are now centralized in context
  const { filters, setFilters } = usePostForAppContext();

  // Bulk selection logic extracted to hook
  const {
    selectedPosts,
    togglePostSelection,
    selectAllPage,
    deselectAll,
    showRangeSelector,
    openRangeSelector,
    closeRangeSelector,
    rangeSelection,
    setRangeSelection,
    rangeLoading,
    rangeProgress,
    selectPageRange,
  } = useBulkSelection({ posts: data?.posts || [], page, data, filters, reFetch });

  // Update range selection when page changes
  React.useEffect(() => {
    setRangeSelection(prev => ({
      ...prev,
      startPage: page,
      endPage: Math.max(page, prev.endPage)
    }));
  }, [page]);

  const posts = data?.posts || [];
  const total = data?.total || 0;

  // const totalSent = filteredData?.totalSent ?? data?.total;
  const limit = data?.limit || 10;

  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  // client-side filtering of current page
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR");

  function interpretBool(val: any) {
    if (val === 'yes') return true;
    if (val === 'no') return false;
    return val;
  }

  if (loading) return <Loader />;

  return (
    <div className="h-screen w-full">
      <div className="">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-blue-100">
          应用帖子
        </h1>

        {/* header  */}
        <header className="border-b border-gray-200 dark:border-gray-700 py-3">
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              {/* Post filters (dialog rendered by PostFilter) */}
              <div>
                <button
                  onClick={() => {
                    const modal = document.getElementById(
                      "search_modal_posts_for_app",
                    ) as HTMLDialogElement | null;
                    modal?.showModal();
                  }}
                  className="input input-ghost hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <Filter className="w-3 text-gray-600 dark:text-gray-400" />{" "}
                  过滤器
                </button>

                <PostForAppFilter
                  filters={filters}
                  setFilters={setFilters}
                  params={{ page: String(page), limit: String(limit) }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索帖子..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Bulk edit controls */}
      <div className="w-full mt-4 mb-4">
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <BulkSelectionControls
                posts={data?.posts || []}
                selectedPosts={selectedPosts}
                selectAllPage={selectAllPage}
                openRangeSelector={openRangeSelector}
                deselectAll={deselectAll}
                openBulkEdit={openBulkEdit}
              />
            </div>
        </div>

      <div className="w-full mt-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left border-t-3 border-blue-500 dark:border-blue-500 rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-blue-500/5 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  <span className="sr-only">Select</span>
                </th>
                <th scope="col" className="px-6 py-3">
                  身份证
                </th>
                <th scope="col" className="px-6 py-3">
                  类别
                </th>
                <th scope="col" className="px-6 py-3">
                  创造者
                </th>
                <th scope="col" className="px-6 py-3">
                  平台
                </th>
                <th scope="col" className="px-6 py-3">
                  检查中
                </th>

                <th scope="col" className="px-6 py-3">
                  激活
                </th>
                <th scope="col" className="px-6 py-3">
                  视频
                </th>
                <th scope="col" className="px-6 py-3">
                  图片
                </th>
                <th scope="col" className="px-6 py-3">
                 创建日期
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {posts?.map((post: any, idx: number) => (
                <tr
                  key={post.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPosts.has(post.id)}
                      onChange={() => togglePostSelection(post.id)}
                      className="checkbox checkbox-sm"
                    />
                  </td>
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {post.id}
                  </th>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100/50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
                      {post?.postCategory?.name} / {post?.postSubCategory?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {post.creatorObj ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={cdnS3(post.creatorObj.avatar)}
                          alt={post.creatorObj.name!}
                          className="min-w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            t.src = "";
                          }}
                        />
                        <Link
                          to={`/creators/` + post?.creatorObj?.id}
                          className="text-sm font-medium text-gray-900 dark:text-gray-100 text-nowrap"
                        >
                          {(post as any).creatorObj.name}
                        </Link>
                      </div>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        {post.creator || "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                      {post.plateform.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <PostForAppChecking
                      index={idx}
                      reFetch={reFetch}
                      postForApp={post}
                    />
                  </td>
                  <td className="py-3 px-6 text-center border-r border-gray-100 dark:border-gray-800">
                    <input
                      type="checkbox"
                      checked={!post.isDeleted}
                      className="toggle bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 checked:bg-blue-300 dark:checked:bg-blue-500 checked:border-gray-300 dark:checked:border-gray-700 transition-colors duration-300 w-[2.5rem] h-[1.5rem] scale-[0.7] rounded-full"
                      onChange={
                        user?.role === RoleEnum.SUPERADMIN
                          ? () => activate(post.id)
                          : undefined
                      }
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-nowrap gap-1">
                      {post.videos?.slice(0, 2).map((video: any) => (
                        <div key={video.id} className="relative group">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-blue-600 dark:text-blue-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                            {Math.floor(video.duration / 1000)}s
                          </div>
                        </div>
                      ))}
                      {post.videos?.length > 2 && (
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            +{post.videos.length - 2}
                          </span>
                        </div>
                      )}
                      {post.videos?.length === 0 && (
                        <span className="text-xs text-gray-400">无视频</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-nowrap gap-1">
                      {post.images
                        ?.slice(0, 2)
                        .map((image: any, index: number) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={
                                cdnS3(image.s3_urls?.imageUrl) ||
                                image.public_urls.local_image_url
                              }
                              alt={`Image ${index + 1}`}
                              className="min-w-8 h-8 object-cover rounded whitespace-nowrap"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                        ))}
                      {post.images?.length > 2 && (
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            +{post.images.length - 2}
                          </span>
                        </div>
                      )}
                      {post.images?.length === 0 && (
                        <span className="text-xs text-gray-400">无图片</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="flex justify-center gap-2 px-6 py-4">
                    <Link
                      to={`/post-for-app/${post.id}`}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 underline"
                    >
                      <Eye className="w-4 h-4" />
                      <span>详情</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            totalItems={total}
            pageSize={limit}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
          />

          {posts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No posts found for this search"
                : "No posts available"}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={showBulkEdit}
        selectedPosts={selectedPosts}
        onClose={closeBulkEdit}
        onSuccess={reFetch}
        onDeselectAll={deselectAll}
      />

      {/* Range Selection Modal */}
      <RangeSelectorModal
        visible={showRangeSelector}
        onClose={closeRangeSelector}
        rangeSelection={rangeSelection}
        setRangeSelection={setRangeSelection}
        selectPageRange={selectPageRange}
        rangeLoading={rangeLoading}
        rangeProgress={rangeProgress}
        data={data}
      />

    </div>
  );
};

const PostForAppManagement = () => {
  return (
    <PostForAppProvider>
      <PostForAppManagementInner />
    </PostForAppProvider>
  );
};

export default PostForAppManagement;
