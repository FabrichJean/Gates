import { FilePlus, Filter, Edit, X, CheckSquare, Square, Users } from "lucide-react";
import Pagination from "../components/Pagination";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import UsePlateform from "../hooks/usePlateform";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { singleSync } from "../api/videos";
import { getPosts } from "../api/posts";
import { PostsProvider, usePostsContext } from "../context/PostsContext";
import { webAppPlateform } from "../api/plateforms";
import PostFilter, { type TPostFilter } from "../components/Post/PostFilter";
import BulkEditPostModal from "../components/BulkEditPostModal";
import { mapStatusProcessing } from "../utils/filter";
import PostManagementTable from "../components/Post/PostManagementTable";

// Inner component consumes PostsContext
const PostManagementInner = () => {

  // State for singleSync modal (per post)
  const [singleSyncOpenId, setSingleSyncOpenId] = useState<number | null>(null);
  const [singleSyncLoading, setSingleSyncLoading] = useState(false);

  const handleSingleSync = async (postId: number, isForce: boolean) => {
    setSingleSyncLoading(true);
    try {
      await singleSync({ entity: "post", origin_id: postId, isForce });
      toast.success("✅ 单帖同步执行");
      setSingleSyncOpenId(null);
      reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "❌ 单同步错误！");
    } finally {
      setSingleSyncLoading(false);
    }
  };
  const { page, setPage, data, loading, reFetch, activate } = usePostsContext();

  // local state to hold filter UI and optionally filtered results
  const [filters, setFilters] = useState<TPostFilter>({
    category_id: "",
    sub_category_id: "",
    creator_id: "",
    startDate: "",
    endDate: "",
    user_id: "",
    isDeleted: "all",
    processing: "",
    uploaded: "all",
    page: "1",
    limit: "10",
    sort: "createdAt",
    order: "DESC",
  });

  const [filteredData, setFilteredData] = useState<any | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [activeFilters, setActiveFilters] = useState<TPostFilter | null>(null);

  // Function to handle filter reset
  const handleFilterReset = useCallback(() => {
    setFilteredData(null);
    setIsFiltered(false);
    setActiveFilters(null);
  }, []);

  // Check if filters are active on component mount
  useEffect(() => {
    const savedFilters = localStorage.getItem("posts_filtered");
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setActiveFilters(parsed);
        setIsFiltered(true);
      } catch (error) {
        console.error("Error parsing saved filters:", error);
      }
    }
  }, []);

  // Listen for localStorage changes to detect filter reset
  useEffect(() => {
    const handleStorageChange = () => {
      const savedFilters = localStorage.getItem("posts_filtered");
      if (!savedFilters && isFiltered) {
        handleFilterReset();
      }
    };

    // Check every 100ms for localStorage changes (since PostFilter doesn't dispatch custom events)
    const interval = setInterval(() => {
      const savedFilters = localStorage.getItem("posts_filtered");
      if (!savedFilters && isFiltered) {
        handleFilterReset();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isFiltered, handleFilterReset]);

  // Function to re-apply filters with new page
  const reApplyFilters = useCallback(async (newPage: number) => {
    if (!activeFilters) return;
    
    try {
      const filterData = {
        category_id: activeFilters.category_id || undefined,
        sub_category_id: activeFilters.sub_category_id || undefined,
        creator_id: activeFilters.creator_id || undefined,
        startedAt: activeFilters.startDate || "",
        endAt: activeFilters.endDate || "",
        processing: mapStatusProcessing(activeFilters.processing || activeFilters.uploaded || "all"),
        isDeleted: activeFilters.isDeleted !== "all" ? activeFilters.isDeleted : undefined,
        page: String(newPage),
        limit: activeFilters.limit || "10",
        sort: activeFilters.sort || "createdAt",
        order: activeFilters.order || "DESC",
      };

      const fetched = await getPosts(filterData);
      setFilteredData(fetched.data);
    } catch (error) {
      console.error("Error re-applying filters:", error);
    }
  }, [activeFilters]);

  // When page changes and there are active filters, re-apply filters with new page
  useEffect(() => {
    if (isFiltered && activeFilters) {
      reApplyFilters(page);
    }
  }, [page, isFiltered, activeFilters, reApplyFilters]);

  // Bulk edit state
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());

  console.log("selectedPosts contents:", Array.from(selectedPosts));
  
  
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);

  // Range selection state
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [rangeSelection, setRangeSelection] = useState({
    startPage: 1,
    endPage: 1,
  });
  const [rangeLoading, setRangeLoading] = useState(false);
  const [rangeProgress, setRangeProgress] = useState({ current: 0, total: 0 });

  const posts = filteredData?.posts || data?.posts || [];
  const total = filteredData?.total || data?.total || 0;
  // const totalSent = filteredData?.totalSent ?? data?.total;
  const limit = filteredData?.limit || data?.limit || 10;

  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  // Bulk edit functions
  const togglePostSelection = (postId: number, index: number, event?: React.MouseEvent) => {
    setSelectedPosts(prev => {
      const newSet = new Set(prev);
      
      // Handle range selection with Shift key
      if (event?.shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        
        for (let i = start; i <= end; i++) {
          if (filteredPosts[i]) {
            newSet.add(filteredPosts[i].id);
          }
        }
      } else {
        // Single selection
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
      }
      
      setLastSelectedIndex(index);
      return newSet;
    });
  };

  const enterSelectionMode = () => {
    setSelectionMode(true);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedPosts(new Set());
    setLastSelectedIndex(null);
  };

  const handleBulkEditSuccess = () => {
    reFetch();
    setSelectedPosts(new Set());
    setSelectionMode(false);
  };

  const handleDeselectAll = () => {
    setSelectedPosts(new Set());
    setSelectionMode(false);
  };

  // Range selection function mirroring PostForApp
  const selectPageRange = async () => {
    if (rangeSelection.startPage > rangeSelection.endPage) {
      toast.error("La page de départ doit être inférieure ou égale à la page d'arrêt");
      return;
    }

    setRangeLoading(true);
    setRangeProgress({ current: 0, total: rangeSelection.endPage - rangeSelection.startPage + 1 });

    try {
      const totalPages = Math.ceil(total / limit);
      
      // Check if endPage exceeds available pages
      if (rangeSelection.endPage > totalPages) {
        toast.error(`Page d'arrêt (${rangeSelection.endPage}) dépasse le nombre total de pages (${totalPages})`);
        setRangeLoading(false);
        return;
      }

      const allPostIds = new Set<number>();

      // Helper function to filter posts (same logic as in the UI)
      const filterPosts = (posts: any[]) => {
        const formatDate = (dateString: string) =>
          new Date(dateString).toLocaleDateString("fr-FR");
        
        return posts.filter((post: any) =>
          post?.postCategory?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post?.postSubCategory?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          post.plateform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatDate(post.createdAt)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      };

      // Use the current filter parameters from local filters state
      const currentParams = {
        category_id: filters.category_id || undefined,
        sub_category_id: filters.sub_category_id || undefined,
        creator_id: filters.creator_id || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        user_id: filters.user_id || undefined,
        isDeleted: filters.isDeleted !== "all" ? filters.isDeleted : undefined,
        processing: mapStatusProcessing(filters.processing),
        // processing: filters.processing,
        uploaded: filters.uploaded !== "all" ? filters.uploaded : undefined,
        sort: filters.sort || undefined,
        order: filters.order || undefined,
        limit: limit,
      };

      // Fetch posts from each page in the range using PostsContext's getPosts method
      for (let currentPage = rangeSelection.startPage; currentPage <= rangeSelection.endPage; currentPage++) {
        try {
          // Use getPosts from the API with current params and specific page
          const response = await getPosts({
            ...currentParams,
            page: currentPage,
          });

          const pageData = response.data;
          
          // Add only filtered post IDs from this page (matching search criteria)
          if (pageData.posts && Array.isArray(pageData.posts)) {
            // Apply the same filtering logic as used in the UI
            const filteredPagePosts = filterPosts(pageData.posts);

            // Add only the filtered post IDs
            filteredPagePosts.forEach((post: any) => {
              allPostIds.add(post.id);
            });
          }

          // Update progress
          setRangeProgress({ current: currentPage - rangeSelection.startPage + 1, total: rangeSelection.endPage - rangeSelection.startPage + 1 });
          
        } catch (error) {
          console.error(`Error fetching page ${currentPage}:`, error);
          toast.error(`Erreur lors du chargement de la page ${currentPage}`);
        }
      }

      // Update selection with all collected post IDs
      setSelectedPosts(allPostIds);
      setSelectionMode(true);
      
      toast.success(`${allPostIds.size} posts sélectionnés sur ${rangeSelection.endPage - rangeSelection.startPage + 1} page(s)`);
      setShowRangeSelector(false);
      
    } catch (error) {
      console.error('Error in range selection:', error);
      toast.error("Erreur lors de la sélection par plage");
    } finally {
      setRangeLoading(false);
      setRangeProgress({ current: 0, total: 0 });
    }
  };

  const selectAllPage = () => {
    const allCurrentPageIds = filteredPosts.map((post: any) => post.id);
    const isAllSelected = allCurrentPageIds.every((id: number) => visibleSelectedPosts.has(id));
    
    if (isAllSelected) {
      // Deselect all on current page
      setSelectedPosts(prev => {
        const newSet = new Set(prev);
        allCurrentPageIds.forEach((id: number) => newSet.delete(id));
        return newSet;
      });
    } else {
      // Select all on current page
      setSelectedPosts(prev => {
        const newSet = new Set(prev);
        allCurrentPageIds.forEach((id: number) => newSet.add(id));
        return newSet;
      });
      setSelectionMode(true);
    }
  };

  const deselectAll = () => {
    setSelectedPosts(new Set());
    setSelectionMode(false);
  };

  // client-side filtering of current page
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR");
  const filteredPosts = posts.filter(
    (post: any) =>
      post?.postCategory?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post?.postSubCategory?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      post.plateform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(post.createdAt)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Only consider posts that are currently visible as selected
  const visibleSelectedPosts = new Set(
    Array.from(selectedPosts).filter(postId =>
      filteredPosts.some(post => post.id === postId)
    )
  );

  if (loading) return <Loader />;

  return (
    <div className="h-screen w-full">
      <div className="">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-blue-100">
          帖子管理
        </h1>

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

              <SendToWebApp />

              {/* Selection Mode Toggle */}
              {!selectionMode ? (
                <button
                  onClick={enterSelectionMode}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <input type="checkbox" className="checkbox checkbox-sm pointer-events-none" />
                  Select Posts
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={exitSelectionMode}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  
                  <button
                    onClick={selectAllPage}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    {filteredPosts.length > 0 && filteredPosts.every((p: any) => visibleSelectedPosts.has(p.id)) ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    Select All Page
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
                    Sélectionner par plage
                  </button>

                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {visibleSelectedPosts.size} selected
                  </span>
                </div>
              )}

              {visibleSelectedPosts.size > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={deselectAll}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Deselect All
                  </button>
                </div>
              )}

              {/* Bulk Edit Button */}
              {visibleSelectedPosts.size > 0 && (
                <button
                  onClick={() => setBulkEditOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-green-200 dark:border-green-700 bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 text-green-700 dark:text-green-300 font-medium text-sm hover:bg-green-100 dark:hover:bg-green-800 transition-all shadow-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit {visibleSelectedPosts.size} post{visibleSelectedPosts.size !== 1 ? 's' : ''}
                </button>
              )}

              {/* Post filters (dialog rendered by PostFilter) */}
              <div>
                <button
                  onClick={() => {
                    const modal = document.getElementById(
                      "search_modal_52"
                    ) as HTMLDialogElement | null;
                    modal?.showModal();
                  }}
                  className="input input-ghost hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <Filter className="w-3 text-gray-600 dark:text-gray-400" /> 过滤器
                </button>

                <PostFilter
                  filters={filters}
                  setFilters={setFilters}
                  params={{ page: String(page), limit: String(limit) }}
                  onSubmit={(d: any) => {
                    setFilteredData(d);
                    setIsFiltered(true);
                    setActiveFilters(filters); // Save current filters
                    try {
                      const p = Number(d?.page || page);
                      if (!Number.isNaN(p)) setPage(p);
                    } catch { }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectionMode && (
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    {visibleSelectedPosts.size} of {filteredPosts.length} selected
                  </div>
                  {visibleSelectedPosts.size > 0 && (
                    <button
                      onClick={handleDeselectAll}
                      className="text-xs text-blue-500 hover:text-blue-700 underline"
                    >
                      Clear
                    </button>
                  )}
                  <div className="text-xs text-blue-500 dark:text-blue-400 opacity-70">
                    💡 Hold Shift to select range
                  </div>
                </div>
              )}
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

      <div className="w-full mt-4">
        <div className="relative overflow-x-auto">
          <PostManagementTable
            selectionMode={selectionMode}
            filteredPosts={filteredPosts}
            visibleSelectedPosts={visibleSelectedPosts}
            selectAllPage={selectAllPage}
            togglePostSelection={togglePostSelection}
            user={user}
            activate={activate}
            reFetch={reFetch}
            singleSyncOpenId={singleSyncOpenId}
            setSingleSyncOpenId={setSingleSyncOpenId}
            singleSyncLoading={singleSyncLoading}
            handleSingleSync={handleSingleSync}
          />

          <Pagination
            totalItems={total}
            pageSize={limit}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
          />

          {filteredPosts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No posts found for this search"
                : "No posts available"}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Edit Modal */}
      <BulkEditPostModal
        isOpen={bulkEditOpen}
        selectedPosts={visibleSelectedPosts}
        onClose={() => setBulkEditOpen(false)}
        onSuccess={handleBulkEditSuccess}
        onDeselectAll={handleDeselectAll}
      />

      {/* Range Selection Modal */}
      {showRangeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Sélectionner par plage de pages
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
                      Page de départ
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
                      Page d'arrêt
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
                    Total de pages disponibles : {Math.ceil(total / limit)}
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
                      {rangeProgress.current} / {rangeProgress.total} pages
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
                  Annuler
                </button>
                <button
                  onClick={selectPageRange}
                  disabled={rangeLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {rangeLoading ? (
                    <>
                      <div className="loading loading-spinner loading-sm"></div>
                      Sélection...
                    </>
                  ) : (
                    'Sélectionner'
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

const PostManagement = () => (
  <PostsProvider>
    <PostManagementInner />
  </PostsProvider>
);

// --- SendToWebApp component ---
function SendToWebApp() {
  const { data: plateforms } = UsePlateform();
  const [webappModalOpen, setWebappModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const sendToWebapp = async () => {
    if (selectedIds.length === 0)
      return toast.error("Select at least one platform");
    setLoading(true);
    try {
      await webAppPlateform(selectedIds);
      toast.success("Envoyé avec succès vers le WebApp !");
      setWebappModalOpen(false);
      setSelectedIds([]);
    } catch (err) {
      toast.error("Erreur lors de l'envoi vers WebApp");
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
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default PostManagement;
