import { FilePlus, Eye, Filter, Edit, CheckSquare, Square, Users, X } from "lucide-react";
import BulkEditModal from "../components/BulkEditModal";
import Pagination from "../components/Pagination";
import { Link } from "react-router-dom";
import React, { useState } from "react";
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
import { TfiReload } from "react-icons/tfi";

// Inner component consumes PostForAppContext
const PostForAppManagementInner = () => {
  // State for singleSync modal (per post)
  const [singleSyncOpenId, setSingleSyncOpenId] = useState<number | null>(null);
  const [singleSyncLoading, setSingleSyncLoading] = useState(false);

  // Selection state for bulk edit
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  // Range selection state
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [rangeSelection, setRangeSelection] = useState({
    startPage: 1,
    endPage: 1,
  });
  const [rangeLoading, setRangeLoading] = useState(false);
  const [rangeProgress, setRangeProgress] = useState({ current: 0, total: 0 });

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

  // Selection handlers
  const togglePostSelection = (postId: number) => {
    setSelectedPosts(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(postId)) {
        newSelection.delete(postId);
      } else {
        newSelection.add(postId);
      }
      return newSelection;
    });
  };

  const selectAllPage = () => {
    setSelectedPosts(prev => {
      const newSelection = new Set(prev);
      const currentPageIds = filteredPosts?.map(p => p.id) || [];
      const allSelected = currentPageIds.every(id => newSelection.has(id));

      if (allSelected) {
        // If all are selected, deselect all on current page
        currentPageIds.forEach(id => newSelection.delete(id));
      } else {
        // If not all are selected, select all on current page
        currentPageIds.forEach(id => newSelection.add(id));
      }

      return newSelection;
    });
  };

  const deselectAll = () => {
    setSelectedPosts(new Set());
  };

  const selectPageRange = async () => {
    if (rangeSelection.startPage > rangeSelection.endPage) {
      toast.error("La page de départ doit être inférieure ou égale à la page d'arrêt");
      return;
    }

    setRangeLoading(true);
    setRangeProgress({ current: 0, total: rangeSelection.endPage - rangeSelection.startPage + 1 });
    try {
      const allPostIds: number[] = [];
      const totalPages = Math.ceil((data?.total || 0) / (data?.limit || 20));

      // Validate range
      if (rangeSelection.endPage > totalPages) {
        toast.error(`La page d'arrêt ne peut pas dépasser ${totalPages}`);
        return;
      }

      // Normalize filters like in usePostForAppManagement
      const normalizeBool = (val: any) => {
        if (val === "yes") return true;
        if (val === "no") return false;
        return val;
      };

      const normalizedFilters = {
        ...filters,
        isDeleted: normalizeBool(filters.isDeleted),
        processing: normalizeBool(filters.processing),
        uploaded: normalizeBool(filters.uploaded),
      };

      // Remove any filter with value 'all' from the params
      const apiFilters = Object.fromEntries(
        Object.entries(normalizedFilters).filter(([k, v]) => v !== "all" && v !== "" && v !== undefined && v !== null)
      );

      // Fetch all pages in the range
      for (let currentPage = rangeSelection.startPage; currentPage <= rangeSelection.endPage; currentPage++) {
        try {
          const response = await getPostsForApp({
            ...apiFilters,
            page: currentPage,
            limit: data?.limit || 20
          });
          const pagePostIds = response.data.posts.map((p: any) => p.id);
          allPostIds.push(...pagePostIds);

          // Update progress
          setRangeProgress(prev => ({ ...prev, current: prev.current + 1 }));
        } catch (error) {
          console.error(`Erreur lors du chargement de la page ${currentPage}:`, error);
          toast.error(`Erreur lors du chargement de la page ${currentPage}`);
          return;
        }
      }

      // Update selection
      setSelectedPosts(prev => {
        const newSelection = new Set(prev);
        allPostIds.forEach(id => newSelection.add(id));
        return newSelection;
      });

      toast.success(`${allPostIds.length} posts sélectionnés sur ${rangeSelection.endPage - rangeSelection.startPage + 1} page(s)`);
      setShowRangeSelector(false);

    } catch (error) {
      console.error('Erreur lors de la sélection par plage:', error);
      toast.error('Erreur lors de la sélection par plage');
    } finally {
      setRangeLoading(false);
      setRangeProgress({ current: 0, total: 0 });
    }
  };

  const openBulkEdit = () => {
    setShowBulkEdit(true);
  };

  const closeBulkEdit = () => {
    setShowBulkEdit(false);
  };

  const { page, setPage, data, loading, reFetch, activate } =
    usePostForAppContext();

  // filters are now centralized in context
  const { filters, setFilters } = usePostForAppContext();

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

  const [allPostsForSearch, setAllPostsForSearch] = useState<any[] | null>(null);
  const [loadingAllPostsForSearch, setLoadingAllPostsForSearch] =
    useState(false);
  const [searchLoadingProgress, setSearchLoadingProgress] = useState({
    current: 0,
    total: 0,
  });
  const searchRequestIdRef = React.useRef(0);

  const searchFilters = React.useMemo(() => {
    const normalizeBool = (val: any) => {
      if (val === "yes") return true;
      if (val === "no") return false;
      return val;
    };

    const normalizedFilters = {
      ...filters,
      isDeleted: normalizeBool(filters.isDeleted),
      processing: normalizeBool(filters.processing),
      uploaded: normalizeBool(filters.uploaded),
    };

    return Object.fromEntries(
      Object.entries(normalizedFilters).filter(
        ([, v]) => v !== "all" && v !== "" && v !== undefined && v !== null,
      ),
    );
  }, [filters]);

  const searchFiltersKey = React.useMemo(
    () => JSON.stringify(searchFilters),
    [searchFilters],
  );

  const loadAllPostsForSearch = React.useCallback(async () => {
    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;
    setLoadingAllPostsForSearch(true);
    setSearchLoadingProgress({ current: 0, total: 0 });

    try {
      const searchLimit = Math.max(data?.limit || 10, 100);
      const firstResponse = await getPostsForApp({
        ...searchFilters,
        page: 1,
        limit: searchLimit,
      });

      if (searchRequestIdRef.current !== requestId) return;

      const firstData = firstResponse.data;
      const firstPagePosts = firstData?.posts || [];
      const totalPages =
        Number(firstData?.pages) ||
        Math.ceil(
          (firstData?.total || firstPagePosts.length) /
          (firstData?.limit || searchLimit),
        ) ||
        1;
      setSearchLoadingProgress({ current: 1, total: totalPages });

      const allPosts: any[] = [...firstPagePosts];
      const pagesToFetch = Array.from(
        { length: Math.max(0, totalPages - 1) },
        (_, i) => i + 2,
      );
      const batchSize = 5;

      for (let i = 0; i < pagesToFetch.length; i += batchSize) {
        const pageBatch = pagesToFetch.slice(i, i + batchSize);
        const responses = await Promise.all(
          pageBatch.map((pageNumber) =>
            getPostsForApp({
              ...searchFilters,
              page: pageNumber,
              limit: searchLimit,
            }),
          ),
        );

        if (searchRequestIdRef.current !== requestId) return;

        responses.forEach((response) => {
          const pagePosts = response?.data?.posts || [];
          allPosts.push(...pagePosts);
        });
        setSearchLoadingProgress((prev) => ({
          ...prev,
          current: Math.min(prev.total, prev.current + pageBatch.length),
        }));
      }

      if (searchRequestIdRef.current !== requestId) return;
      setAllPostsForSearch(allPosts);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de toutes les pages pour la recherche:",
        error,
      );
      toast.error("Erreur lors de la recherche globale des titres");
      if (searchRequestIdRef.current === requestId) {
        setAllPostsForSearch([]);
      }
    } finally {
      if (searchRequestIdRef.current === requestId) {
        setLoadingAllPostsForSearch(false);
      }
    }
  }, [data?.limit, searchFilters]);

  React.useEffect(() => {
    setAllPostsForSearch(null);
    setSearchLoadingProgress({ current: 0, total: 0 });
  }, [searchFiltersKey]);

  React.useEffect(() => {
    const term = searchTerm.trim();

    if (!term) {
      searchRequestIdRef.current += 1;
      setLoadingAllPostsForSearch(false);
      setSearchLoadingProgress({ current: 0, total: 0 });
      return;
    }

    if (allPostsForSearch !== null || loadingAllPostsForSearch) return;

    const timeoutId = window.setTimeout(() => {
      loadAllPostsForSearch();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [
    allPostsForSearch,
    loadingAllPostsForSearch,
    loadAllPostsForSearch,
    searchTerm,
  ]);

  const filteredPosts = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return posts;

    const sourcePosts = allPostsForSearch || [];

    return sourcePosts.filter((post: any) =>
      Array.isArray(post?.titles) &&
      post.titles.some(
        (titleItem: any) =>
          typeof titleItem?.title === "string" &&
          titleItem.title.toLowerCase().includes(term),
      ),
    );
  }, [allPostsForSearch, posts, searchTerm]);

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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center ">
                  {searchTerm.trim().length === 0 ? (
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

                  ) : (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="cursor-pointer"
                      aria-label="Effacer la recherche"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-red-500 ">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </button>
                  )}

                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Bulk edit controls */}
      <div className="w-full mt-4 mb-4">
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllPage}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                {filteredPosts?.length > 0 && filteredPosts.every(p => selectedPosts.has(p.id)) ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                全选页面
              </button>

              <button
                onClick={() => {
                  setRangeSelection({
                    startPage: page,
                    endPage: page,
                  });
                  setShowRangeSelector(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                按范围选择
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPosts.size} selected
              </span>
            </div>

            {selectedPosts.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={deselectAll}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  取消全选
                </button>
                <button
                  onClick={openBulkEdit}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  批量编辑 ({selectedPosts.size})
                </button>
              </div>
            )}
          </div>
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
                <th scope="col" className="px-6 py-3 text-nowrap">
                  身份证
                </th>
                <th scope="col" className="px-6 py-3 text-nowrap">
                  类别
                </th>
                <th scope="col" className="px-6 py-3 text-nowrap">
                  创造者
                </th>
                <th scope="col" className="px-6 py-3 text-nowrap">
                  平台
                </th>
                <th scope="col" className="px-6 py-3 text-nowrap">
                  检查中
                </th>

                <th scope="col" className="px-6 py-3 text-nowrap">
                  激活
                </th>
                <th scope="col" className="px-6 py-3 text-nowrap">
                  视频
                </th>
                <th scope="col" className="px-6 py-3 text-nowrap">
                  图片
                </th>
                <th scope="col" className="px-6 py-3 text-nowrap">
                  创建日期
                </th>
                <th scope="col" className="px-6 py-3 text-left text-nowrap">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts?.map((post: any, idx: number) => (
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
                    <span className="flex flex-col gap-1 px-2 py-1 text-xs text-nowrap font-medium rounded-full bg-gray-100/50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
                      {post?.postCategory?.name}
                      <span className={`${post?.postSubCategory?.name ? 'text-left' : 'text-center'}`}>{post?.postSubCategory?.name ? post?.postSubCategory?.name : '-'}</span>
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
                    <span className="px-2 py-1 text-xs font-medium text-nowrap rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
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
                        () => activate(post.id)
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
                      <span className="text-nowrap">详情</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {searchTerm.length === 0 && (
            <Pagination
              totalItems={total}
              pageSize={limit}
              currentPage={page}
              onPageChange={(p) => setPage(p)}
            />
          )}

          {searchTerm.trim().length > 0 && loadingAllPostsForSearch && (
            <div className="py-6">
              <div className="max-w-lg mx-auto">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>Chargement de toutes les pages pour la recherche...</span>
                  <span>
                    {/* {searchLoadingProgress.current} / {searchLoadingProgress.total} */}
                    <TfiReload className="h-5 w-5 animate-spin" />
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${searchLoadingProgress.total > 0
                        ? (searchLoadingProgress.current /
                          searchLoadingProgress.total) *
                        100
                        : 0
                        }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {filteredPosts.length === 0 && !loadingAllPostsForSearch && (
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
      {showRangeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  选择页面范围
                </h2>
                <button
                  onClick={() => {
                    setShowRangeSelector(false);
                    setRangeProgress({ current: 0, total: 0 });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      起始页
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={rangeSelection.startPage}
                      onChange={(e) => setRangeSelection(prev => ({
                        ...prev,
                        startPage: Math.max(1, parseInt(e.target.value) || 1)
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      停止页
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={rangeSelection.endPage}
                      onChange={(e) => setRangeSelection(prev => ({
                        ...prev,
                        endPage: Math.max(1, parseInt(e.target.value) || 1)
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {data && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    可用页面总数 : {Math.ceil(data.total / data.limit)}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                {rangeLoading && rangeProgress.total > 0 && (
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(rangeProgress.current / rangeProgress.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {rangeProgress.current} / {rangeProgress.total} 页面
                    </span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setShowRangeSelector(false);
                    setRangeProgress({ current: 0, total: 0 });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={rangeLoading}
                >
                  取消
                </button>
                <button
                  onClick={selectPageRange}
                  disabled={rangeLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {rangeLoading ? (
                    <>
                      <div className="loading loading-spinner loading-sm"></div>
                      加载中...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      选择页面范围
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// --- SendToWebApp component ---
function SendToWebApp() {
  const { data: plateforms } = UsePlateform();
  const [webappModalOpen, setWebappModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const sendToWebapp = async () => {
    if (selectedIds.length === 0)
      return toast.error("至少选择一个平台");
    setLoading(true);
    try {
      await webAppPlateform(selectedIds);
      toast.success("发送成功到 WebApp！");
      setWebappModalOpen(false);
      setSelectedIds([]);
    } catch (err) {
      toast.error("发送到 WebApp 时出错");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <dialog className={`modal ${webappModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box max-w-lg">
          <h3 className="font-bold text-lg">选择要发送的平台</h3>
          <div className="max-h-60 overflow-auto mt-3">
            {plateforms?.map((p: any) => (
              <label
                key={p.id}
                className="flex items-center gap-3 p-2 border-b"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => toggle(p.id)}
                  className="checkbox"
                />
                <span>{p.name}</span>
              </label>
            ))}
          </div>
          <div className="modal-action">
            <button
              className="btn btn-outline"
              onClick={() => setWebappModalOpen(false)}
            >
              关闭
            </button>
            <button
              className="btn btn-primary"
              onClick={sendToWebapp}
              disabled={loading}
            >
              {loading ? "发送中..." : "发送"}
            </button>
          </div>
        </div>
      </dialog>
    </>
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
