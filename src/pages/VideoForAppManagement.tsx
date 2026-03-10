import React, { useState, useEffect } from "react";
import type { VideoForApp } from "../api/videoForApp";
import Pagination from "../components/Pagination";
import DeepLoader from "../components/DeepLoader";
import { checkObjectContent } from "../utils/filter";
import { useVideoForAppContext } from "../context/VideoForAppContext";
import { useAuth } from "../hooks/useAuth";
import VideoTableHeader from "../components/videos/VideoTableHeader";
import VideoTableRow from "../components/videos/VideoTableRow";
import { updateVideoForApp, fetchVideoForAppList } from "../api/videoForApp";
import { getCreators } from "../api/creators";
import VideoForAppFilter from "../components/VideoForAppFilter";
import { toast } from "react-hot-toast";
import { Edit, CheckSquare, Square, Users, X } from "lucide-react";
import BulkSyncTrackingModal from "../components/BulkSyncTrackingModal";
import type { BulkSyncProgress, BulkSyncResource } from "../components/BulkSyncTrackingModal";
import { multipleSync } from "../api/videos";
import { getAllPlateformsApi } from "../api/plateforms";
import TagCategoryVideoForApp from "../components/TagCategoryVideoForApp";
import { useI18n } from "../i18n";
import { buildVideoForAppListParams } from "../utils/videoForAppFilters";

type CheckingStatus = 'ready' | 'not ready' | 'checked' | 'waiting for checking' | null;


const VideoForAppManagement = () => {
  const { user } = useAuth();
  const ctx = useVideoForAppContext();
  if (!ctx) return null;

  const {
    page,
    setPage,
    filters,
    setFilters,
    params,
    data,
    loading,
    mutate,
    toWebapp,
    activate,
    send,
    reFetch,
  } = ctx;

  const { t } = useI18n();

  // Selection state
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    title: '',
    description: '',
    tags: [] as (number | { name: string })[],
    category: '',
    subcategory: '',
    isActive: null as boolean | null,
    checking: null as CheckingStatus,
    isBanned: null as boolean | null,
    creator_id: '',
    modifyTags: false,
    randomTags: false,
    randomTagsText: '',
    synchronize: false,
  });
  const [bulkEditLoading, setBulkEditLoading] = useState(false);
  const [bulkEditProgress, setBulkEditProgress] = useState({ current: 0, total: 0 });

  // Range selection state
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [rangeSelection, setRangeSelection] = useState({
    startPage: page,
    endPage: page,
  });
  const [rangeLoading, setRangeLoading] = useState(false);
  const [rangeProgress, setRangeProgress] = useState({ current: 0, total: 0 });

  const [creators, setCreators] = useState<any[]>([]);
  // Bulk sync modal / progress state
  const [bulkSyncOpen, setBulkSyncOpen] = useState(false);
  const [bulkSyncProgress, setBulkSyncProgress] = useState<BulkSyncProgress>({
    processed: 0,
    total: 0,
    failed: 0,
    succeeded: 0,
    currentItem: null,
    isRunning: false,
    isPaused: false,
    errors: [],
    pageStats: []
  });
  const [bulkSyncAbortController, setBulkSyncAbortController] = useState<AbortController | null>(null);
  const [availablePlateforms, setAvailablePlateforms] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    const fetchPlateforms = async () => {
      try {
        const res = await getAllPlateformsApi();
        if (!mounted) return;
        setAvailablePlateforms(res.data || []);
      } catch (err) {
        console.error('Failed to load platforms', err);
        if (!mounted) return;
        setAvailablePlateforms([]);
      }
    };
    fetchPlateforms();
    return () => { mounted = false; };
  }, []);
  const [pendingSyncOriginIds, setPendingSyncOriginIds] = useState<number[] | null>(null);

  // Start synchronization using multipleSync and update the tracking modal progress
  const startSynchronization = async (originIds: number[], isForce: boolean = false, plateformId?: number) => {
    if (!originIds || originIds.length === 0) return;

    setBulkSyncOpen(true);
    const controller = new AbortController();
    setBulkSyncAbortController(controller);

    setBulkSyncProgress({
      processed: 0,
      total: originIds.length,
      failed: 0,
      succeeded: 0,
      currentItem: null,
      isRunning: true,
      isPaused: false,
      errors: [],
      pageStats: []
    });

    try {
      // Chunk the originIds to avoid very large requests and to provide progressive feedback
      const BATCH_SIZE = Math.max(10, data?.limit || 50);
      const chunk = <T,>(arr: T[], size: number) => {
        const out: T[][] = [];
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
        return out;
      };

      const batches = chunk<number>(originIds, BATCH_SIZE);
      // initialize progress
      setBulkSyncProgress(prev => ({ ...prev, total: originIds.length, processed: 0, succeeded: 0, failed: 0, errors: [] }));

      for (let i = 0; i < batches.length; i++) {
        if (controller.signal.aborted) break;

        // Respect pause
        // eslint-disable-next-line no-await-in-loop
        while (bulkSyncProgress.isPaused && !controller.signal.aborted) {
          // wait 200ms
          // eslint-disable-next-line no-await-in-loop
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        const batch = batches[i];
        // update currentItem to show first id in batch (UI shows title/cover when available, but we at least set an id)
        setBulkSyncProgress(prev => ({ ...prev, currentItem: { id: batch[0], title: `Batch ${i + 1}/${batches.length}` } as any }));

        try {
          // eslint-disable-next-line no-await-in-loop
          await multipleSync({ entity: 'video_for_app', originIds: batch, isForce, plateformId, signal: controller.signal });

          // success for this batch
          setBulkSyncProgress(prev => ({
            ...prev,
            processed: prev.processed + batch.length,
            succeeded: prev.succeeded + batch.length,
            // append a pageStat for UI
            pageStats: [...prev.pageStats, { page: i + 1, entity: 'video_for_app', limit: batch.length, processed: batch.length, succeeded: batch.length, failed: 0, startTime: new Date() } as any]
          }));
        } catch (batchErr: any) {
          if (controller.signal.aborted) {
            // aborted by user
            setBulkSyncProgress(prev => ({ ...prev, isRunning: false, currentItem: null }));
            toast.error('Synchronization aborted');
            break;
          }

          // Batch failed — count all in batch as failed and record error
          const errorsForBatch = batch.map(id => ({ resourceId: id, error: batchErr?.response?.data?.message || batchErr?.message || 'Batch sync failed' }));
          setBulkSyncProgress(prev => ({
            ...prev,
            processed: prev.processed + batch.length,
            failed: prev.failed + batch.length,
            errors: [...prev.errors, ...errorsForBatch],
            pageStats: [...prev.pageStats, { page: i + 1, entity: 'video_for_app', limit: batch.length, processed: batch.length, succeeded: 0, failed: batch.length, startTime: new Date() } as any]
          }));
        }
      }

      // finished all batches (or aborted)
      setBulkSyncProgress(prev => ({ ...prev, isRunning: false, currentItem: null }));
      toast.success(`Synchronization finished — processed ${originIds.length} items`);
      // keep modal open briefly so user can see result, then close
      setTimeout(() => setBulkSyncOpen(false), 1200);
    } catch (err: any) {
      console.error('Bulk synchronization failed', err);
      setBulkSyncProgress(prev => ({ ...prev, isRunning: false, currentItem: null }));
      toast.error('Synchronization failed for selected videos');
    } finally {
      setBulkSyncAbortController(null);
      // refresh list
      reFetch();
      deselectAll();
    }
  };

  const handleBulkSyncPause = () => {
    setBulkSyncProgress(prev => ({ ...prev, isPaused: true }));
  };

  const handleBulkSyncResume = () => {
    setBulkSyncProgress(prev => ({ ...prev, isPaused: false }));
  };

  const handleBulkSyncStop = () => {
    if (bulkSyncAbortController) {
      bulkSyncAbortController.abort();
    }
    setBulkSyncProgress(prev => ({ ...prev, isRunning: false, isPaused: false }));
    setBulkSyncOpen(false);
  };

  useEffect(() => {
    let mounted = true;
    getCreators()
      .then((res) => {
        if (!mounted) return;
        const list = res?.data?.creators || res;
        setCreators(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!mounted) return;
        setCreators([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Selection handlers
  const toggleVideoSelection = (videoId: number) => {
    setSelectedVideos(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(videoId)) {
        newSelection.delete(videoId);
      } else {
        newSelection.add(videoId);
      }
      return newSelection;
    });
  };

  const selectAllPage = () => {
    setSelectedVideos(prev => {
      const newSelection = new Set(prev);
      const currentPageIds = data?.videos?.map(v => v.id) || [];
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
    setSelectedVideos(new Set());
  };

  const handleTagSelect = (tag: number | { name: string }) => {
    setBulkEditData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
  };

  const handleTagDeselect = (tag: number | { name: string }) => {
    setBulkEditData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => {
        if (typeof tag === 'number' && typeof t === 'number') {
          return t !== tag;
        }
        if (typeof tag === 'object' && typeof t === 'object') {
          return t.name !== tag.name;
        }
        return true;
      })
    }));
  };

  // Range selection handler
  const selectPageRange = async () => {
    if (rangeSelection.startPage > rangeSelection.endPage) {
      toast.error("起始页必须小于或等于结束页");
      return;
    }

    setRangeLoading(true);
    setRangeProgress({ current: 0, total: rangeSelection.endPage - rangeSelection.startPage + 1 });
    try {
      const allVideoIds: number[] = [];
      const totalPages = Math.ceil((data?.total || 0) / (data?.limit || 20));

      // Validate range
      if (rangeSelection.endPage > totalPages) {
        toast.error(`结束页不能超过 ${totalPages}`);
        return;
      }

      // Fetch all pages in the range
      for (let currentPage = rangeSelection.startPage; currentPage <= rangeSelection.endPage; currentPage++) {
        try {
          const { params: queryParams } = buildVideoForAppListParams({ filters, page: currentPage });
          const response = await fetchVideoForAppList(queryParams);
          const pageVideoIds = response.videos.map(v => v.id);
          allVideoIds.push(...pageVideoIds);

          // Update progress
          setRangeProgress(prev => ({ ...prev, current: prev.current + 1 }));
        } catch (error) {
          console.error(`加载第 ${currentPage} 页时出错:`, error);
          toast.error(`加载第 ${currentPage} 页时出错`);
          return;
        }
      }

      // Update selection
      setSelectedVideos(prev => {
        const newSelection = new Set(prev);
        allVideoIds.forEach(id => newSelection.add(id));
        return newSelection;
      });

      toast.success(`在 ${rangeSelection.endPage - rangeSelection.startPage + 1} 页中选中了 ${allVideoIds.length} 个视频`);
      setShowRangeSelector(false);

    } catch (error) {
      console.error('范围选择时出错:', error);
      toast.error('范围选择时出错');
    } finally {
      setRangeLoading(false);
      setRangeProgress({ current: 0, total: 0 });
    }
  };

  const isAllPageSelected = data?.videos?.every(v => selectedVideos.has(v.id)) || false;
  const isSomeSelected = selectedVideos.size > 0;

  // Update page selection state when data changes
  const currentPageIds = data?.videos?.map(v => v.id) || [];
  const selectedOnCurrentPage = currentPageIds.filter(id => selectedVideos.has(id)).length;

  // Bulk edit handlers
  const openBulkEdit = () => {
    setShowBulkEdit(true);
  };

  const closeBulkEdit = () => {
    setShowBulkEdit(false);
    setBulkEditData({
      title: '',
      description: '',
      tags: [],
      category: '',
      subcategory: '',
      isActive: null,
      checking: null,
      isBanned: null,
      creator_id: '',
      modifyTags: false,
      randomTags: false,
      randomTagsText: '',
      synchronize: false,
    });
    setBulkEditProgress({ current: 0, total: 0 });
  };

  // Helper function to pick random tags from a list
  const pickRandomTags = (tagList: string[], count: number = 3): string[] => {
    // Filter empty lines and trim
    const cleanedTags = tagList
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // If we have fewer tags than requested, return all
    if (cleanedTags.length <= count) {
      return cleanedTags;
    }

    // Randomly pick count tags
    const shuffled = [...cleanedTags].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const handleBulkEditSubmit = async () => {
    if (selectedVideos.size === 0) return;

    // Validate random tags if enabled
    if (bulkEditData.randomTags && bulkEditData.randomTagsText.trim().length === 0) {
      toast.error('Veuillez fournir une liste de tags pour la sélection aléatoire');
      return;
    }

    setBulkEditLoading(true);
    setBulkEditProgress({ current: 0, total: selectedVideos.size });
    let successCount = 0;
    let errorCount = 0;

    try {
      // Process each selected video one by one
      for (const videoId of selectedVideos) {
        try {
          const updateData: any = {};

          if (bulkEditData.title) updateData.title = bulkEditData.title;
          if (bulkEditData.description) updateData.description = bulkEditData.description;

          // Handle tags: either from manual selection or random selection
          let tagsToApply: (number | string)[] = [];

          if (bulkEditData.randomTags) {
            // Get random tags from the provided list
            const tagList = bulkEditData.randomTagsText.split('\n');
            const randomTagNames = pickRandomTags(tagList, 3);
            tagsToApply = randomTagNames;
          } else if (bulkEditData.modifyTags && bulkEditData.tags.length > 0) {
            // Use manually selected tags
            tagsToApply = bulkEditData.tags.map(t => (typeof t === 'number' ? t : (t as any).id ?? (t as any).name));
          }

          if (tagsToApply.length > 0) {
            updateData.tag_category_ids = tagsToApply;
          }

          if (bulkEditData.category) updateData.category = bulkEditData.category;
          if (bulkEditData.subcategory) updateData.subcategory = bulkEditData.subcategory;
          if (bulkEditData.isActive !== null) updateData.isDeleted = !bulkEditData.isActive;
          if (bulkEditData.checking !== null) updateData.checking = bulkEditData.checking;
          if (bulkEditData.isBanned !== null) updateData.isBanned = bulkEditData.isBanned;

          // Apply update if needed
          if (Object.keys(updateData).length > 0) {
            await updateVideoForApp(videoId, updateData);
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to update video ${videoId}:`, error);
          errorCount++;
        }

        // Update progress
        setBulkEditProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }

      // If user asked to synchronize selected videos, call multipleSync once for all selected
      if (bulkEditData.synchronize && selectedVideos.size > 0) {
        // request synchronization: store selected ids and open tracking modal for configuration
        const originIds = Array.from(selectedVideos);
        setPendingSyncOriginIds(originIds);
        setBulkSyncOpen(true);
      }

      if (successCount > 0) {
        toast.success(`成功更新了 ${successCount} 个视频`);
        reFetch();
        closeBulkEdit();
        deselectAll();
      }

      if (errorCount > 0) {
        toast.error(`更新 ${errorCount} 个视频失败`);
      }
    } catch (error) {
      console.error('批量编辑错误:', error);
      toast.error('批量编辑过程中出错');
    } finally {
      setBulkEditLoading(false);
      setBulkEditProgress({ current: 0, total: 0 });
    }
  };

  // Update range selection when page changes
  React.useEffect(() => {
    setRangeSelection(prev => ({
      ...prev,
      startPage: page,
      endPage: Math.max(page, prev.endPage)
    }));
  }, [page]);

  return (
    <div className="flex flex-col gap-2 min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-2 pb-0">
      {/* <VideoHeader
        user={user}
        filters={filters as any}
        setFilters={setFilters}
        params={{ status: "all", page, ...params }}
        loading={undefined}
        onMutate={mutate}
        onWebApp={toWebapp}
        scope="videos"
      /> */}

      <div className="flex justify-between w-full ">
        <div>
          {/* Filter Button */}
          <button
            className="btn btn-outline btn-sm w-fit mb-2"
            onClick={() => {
              const modal = document.getElementById("search_modal_52") as HTMLDialogElement | null;
              modal?.showModal();
            }}
          >
            {t('filters.btn', {
              default: {
                en: 'filters',
                zh: '过滤器',
                fr: 'filtres'
              }
            })}
          </button>
          <VideoForAppFilter
            filters={filters}
            setFilters={setFilters}
            params={params}
            setPage={setPage}
            onSubmit={(response: any) => {
              // response should contain { videos, total, limit, page }
              const respPage = response?.page ? Number(response.page) : 1;
              setPage(respPage);
              if ((ctx as any).setData) {
                (ctx as any).setData({
                  videos: response.videos,
                  total: response.total,
                  limit: response.limit,
                  page: respPage,
                });
              } else {
                // fallback: trigger a refetch
                reFetch();
              }
            }}
          />
          {checkObjectContent(filters).hasContent ? (
            <span className="mb-3 text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">* 应用 视频 滤镜</span>
          ) : null}
        </div>

        {/* Selection Controls */}
        <div className="flex items-center gap-2 mb-2">
          {/* <CheckClassFButton batchSize={100} /> */}
          <button
            className="btn btn-outline btn-sm"
            onClick={selectAllPage}
          >
            {isAllPageSelected ? (
              <>
                <Square className="w-4 h-4 mr-1" />
                取消选择页面
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 mr-1" />
                选择页面
              </>
            )}
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setRangeSelection({
                startPage: page,
                endPage: page,
              });
              setShowRangeSelector(true);
            }}
          >
            <Users className="w-4 h-4 mr-1" />
            选择范围
          </button>

          {isSomeSelected && (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                已选择 {selectedVideos.size} 个视频
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={openBulkEdit}
              >
                <Edit className="w-4 h-4 mr-1" />
                批量编辑
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={deselectAll}
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-gray-800 overflow-hidden">
        {loading && <DeepLoader />}

        <div className="overflow-x-auto pb-[8rem]">
          <table className="min-w-full w-max text-sm md:text-base bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
            <VideoTableHeader showSelection={true} />
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300 pb-[8rem] transition-colors duration-300">
              {data?.videos?.map((video: VideoForApp, index: number) => (
                <VideoTableRow
                  key={video.id}
                  video={video as any}
                  index={index}
                  onActivate={activate}
                  onSend={send}
                  updateFn={updateVideoForApp}
                  hideTouchLink={false}
                  cancelFn={undefined}
                  reFetchFn={reFetch}
                  detailsPath="/app-videos"
                  convertToMp4Fn={undefined}
                  hideSend={true}
                  showSelection={true}
                  isSelected={selectedVideos.has(video.id)}
                  onToggleSelection={toggleVideoSelection}
                />
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          totalItems={data?.total}
          pageSize={data?.limit}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>

      {/* Range Selection Modal */}
      {showRangeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  选择范围
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
                      开始页
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
                      结束页
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
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                  取消
                </button>
                <button
                  onClick={selectPageRange}
                  disabled={rangeLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {rangeLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      加载中...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      选择范围
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  批量版 ({selectedVideos.size} vidéo{selectedVideos.size > 1 ? 's' : ''})
                </h2>
                <button
                  onClick={closeBulkEdit}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="modifyTags"
                    checked={bulkEditData.modifyTags}
                    onChange={(e) => setBulkEditData(prev => ({ ...prev, modifyTags: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="modifyTags" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    修改标签
                  </label>
                </div>

                {bulkEditData.modifyTags && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      标签
                    </label>
                    <TagCategoryVideoForApp
                      selectedTags={bulkEditData.tags}
                      onTagSelect={handleTagSelect}
                      onTagDeselect={handleTagDeselect}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="randomTags"
                    checked={bulkEditData.randomTags}
                    onChange={(e) => setBulkEditData(prev => ({ ...prev, randomTags: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="randomTags" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ajouter des tags aléatoires (3 par vidéo)
                  </label>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="synchronize"
                    checked={bulkEditData.synchronize}
                    onChange={(e) => setBulkEditData(prev => ({ ...prev, synchronize: e.target.checked }))}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="synchronize" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Synchronize selected videos (send to platform)
                  </label>
                </div>

                {bulkEditData.randomTags && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Liste de tags (un par ligne)
                    </label>
                    <textarea
                      value={bulkEditData.randomTagsText}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, randomTagsText: e.target.value }))}
                      placeholder="recommend&#10;featured&#10;mandatory&#10;creampie&#10;incest"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs"
                      rows={8}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      3 tags seront sélectionnés aléatoirement parmi cette liste pour chaque vidéo
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">创建 / 分配创建者</label>
                  <select
                    value={bulkEditData.creator_id}
                    onChange={(e) => setBulkEditData(prev => ({ ...prev, creator_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">不修改</option>
                    {creators.map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    激活状态
                  </label>
                  <select
                    value={bulkEditData.isActive === null ? '' : bulkEditData.isActive.toString()}
                    onChange={(e) => setBulkEditData(prev => ({
                      ...prev,
                      isActive: e.target.value === '' ? null : e.target.value === 'true'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请勿修改</option>
                    <option value="true">激活</option>
                    <option value="false">禁用</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    状态：已禁止
                  </label>
                  <select
                    value={bulkEditData.isBanned === null ? '' : String(bulkEditData.isBanned)}
                    onChange={(e) => setBulkEditData(prev => ({
                      ...prev,
                      isBanned: e.target.value === '' ? null : e.target.value === 'true'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请勿修改</option>
                    <option value="true">封禁</option>
                    <option value="false">解封</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    审核状态 (Checking)
                  </label>
                  <select
                    value={bulkEditData.checking || ''}
                    onChange={(e) => setBulkEditData(prev => ({
                      ...prev,
                      checking: e.target.value === '' ? null : e.target.value as CheckingStatus
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请勿修改</option>
                    <option value="refused">拒绝</option>
                    <option value="checked">已审核</option>
                    <option value="null">未准备</option>
                    <option value="waiting for checking">准备就绪：等待审核</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                {bulkEditLoading && bulkEditProgress.total > 0 && (
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(bulkEditProgress.current / bulkEditProgress.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {bulkEditProgress.current} / {bulkEditProgress.total}
                    </span>
                  </div>
                )}
                <button
                  onClick={closeBulkEdit}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={bulkEditLoading}
                >
                  取消
                </button>
                <button
                  onClick={handleBulkEditSubmit}
                  disabled={bulkEditLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {bulkEditLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      更新...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      应用修改
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Sync Tracking Modal - reused for synchronizing selected videos */}
      <BulkSyncTrackingModal
        open={bulkSyncOpen}
        onClose={() => setBulkSyncOpen(false)}
        onStartSync={(entities, isForce, pageNum, limitNum, autoSwitch, plateformId, platformFilter) => {
          // Use pending origin ids (from bulk edit) if available, otherwise use current selection
          const originIds = pendingSyncOriginIds ?? Array.from(selectedVideos);
          // close bulk edit UI if it's still open
          if (showBulkEdit) closeBulkEdit();
          startSynchronization(originIds, isForce, plateformId);
          // clear pending ids after starting
          setPendingSyncOriginIds(null);
        }}
        progress={bulkSyncProgress}
        onPause={handleBulkSyncPause}
        onResume={handleBulkSyncResume}
        onStop={handleBulkSyncStop}
        onDisableAutoSwitch={() => { /* noop */ }}
        currentPage={page}
        currentEntity={"video"}
        currentLimit={data?.limit}
        availablePlateforms={availablePlateforms}
      />
    </div>
  );
};

export default VideoForAppManagement;
