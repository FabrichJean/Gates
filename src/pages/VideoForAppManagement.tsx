import React, { useState, useEffect } from "react";
import type { VideoForApp } from "../api/videoForApp";
import Pagination from "../components/Pagination";
import DeepLoader from "../components/DeepLoader";
import { checkObjectContent } from "../utils/filter";
import { useVideoForAppContext } from "../context/VideoForAppContext";
import { useAuth } from "../hooks/useAuth";
import VideoTableHeader from "../components/videos/VideoTableHeader";
import VideoTableRow from "../components/videos/VideoTableRow";
import VideoForAppBulkEditModal from "../components/videos/VideoForAppBulkEditModal";
import VideoForAppRangeSelectorModal from "../components/videos/VideoForAppRangeSelectorModal"; 
import { updateVideoForApp } from "../api/videoForApp";
import VideoForAppFilter from "../components/VideoForAppFilter";
import { toast } from "react-hot-toast";
import { Edit, CheckSquare, Square, Users, X } from "lucide-react";
import BulkSyncTrackingModal from "../components/BulkSyncTrackingModal";
import type { BulkSyncProgress } from "../components/BulkSyncTrackingModal";
import { multipleSync } from "../api/videos";
import { getAllPlateformsApi } from "../api/plateforms";
import { useI18n } from "../i18n";
import { useVideoForAppBulkEdit } from "../hooks/useVideoForAppBulkEdit";
import { useVideoForAppRangeSelection } from "../hooks/useVideoForAppRangeSelection";


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

  const handleBulkEditRequestSync = (originIds: number[]) => {
    setPendingSyncOriginIds(originIds);
    setBulkSyncOpen(true);
  };

  const bulkEdit = useVideoForAppBulkEdit({
    selectedVideos,
    onRequestSync: handleBulkEditRequestSync,
    onSuccess: reFetch,
    onDeselectAll: deselectAll,
  });

  const rangeSelector = useVideoForAppRangeSelection({
    page,
    data,
    filters,
    setSelectedVideos,
  });

  const isAllPageSelected = data?.videos?.every(v => selectedVideos.has(v.id)) || false;
  const isSomeSelected = selectedVideos.size > 0;

  return (
    <div className="flex flex-col gap-2 min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-2 pb-0">
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
            onClick={rangeSelector.openRangeSelector}
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
                onClick={bulkEdit.openBulkEdit}
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
      <VideoForAppRangeSelectorModal
        isOpen={rangeSelector.isOpen}
        rangeSelection={rangeSelector.rangeSelection}
        setRangeSelection={rangeSelector.setRangeSelection}
        hasData={rangeSelector.hasData}
        totalPages={rangeSelector.totalPages}
        rangeLoading={rangeSelector.rangeLoading}
        rangeProgress={rangeSelector.rangeProgress}
        onClose={rangeSelector.closeRangeSelector}
        onSubmit={rangeSelector.selectPageRange}
      />

      {/* Bulk Edit Modal */}
      <VideoForAppBulkEditModal
        isOpen={bulkEdit.isOpen}
        selectedCount={selectedVideos.size}
        bulkEditData={bulkEdit.bulkEditData}
        setBulkEditData={bulkEdit.setBulkEditData}
        creators={bulkEdit.creators}
        bulkEditLoading={bulkEdit.bulkEditLoading}
        bulkEditProgress={bulkEdit.bulkEditProgress}
        onClose={bulkEdit.closeBulkEdit}
        onSubmit={bulkEdit.handleBulkEditSubmit}
        onTagSelect={bulkEdit.handleTagSelect}
        onTagDeselect={bulkEdit.handleTagDeselect}
      />

      {/* Bulk Sync Tracking Modal - reused for synchronizing selected videos */}
      <BulkSyncTrackingModal
        open={bulkSyncOpen}
        onClose={() => setBulkSyncOpen(false)}
        onStartSync={(entities, isForce, pageNum, limitNum, autoSwitch, plateformId, platformFilter) => {
          // Use pending origin ids (from bulk edit) if available, otherwise use current selection
          const originIds = pendingSyncOriginIds ?? Array.from(selectedVideos);
          // close bulk edit UI if it's still open
          if (bulkEdit.isOpen) bulkEdit.closeBulkEdit();
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
