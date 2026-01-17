import { useState } from "react";
import SelectModal from "../components/SelectModal";
import useSyncOption from "../hooks/useSyncOption";
import useSyncErrors from "../hooks/useSyncErrors";
import useCardFlottant from "../hooks/useCardFlottant";
import { Link } from "react-router-dom";
import WaterProgressModal from "../components/WaterProgressModal";
import BulkSyncTrackingModal from "../components/BulkSyncTrackingModal";
import type { SyncEntity, BulkSyncProgress, BulkSyncResource } from "../components/BulkSyncTrackingModal";
import { FaSyncAlt, FaTasks, FaCheck, FaTimes, FaClock, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { getVideosForBulkSync } from "../api/videos";
import { getPostsForBulkSync } from "../api/posts";
import { singleSync } from "../api/videos";

const Synchronisation = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"firstTab" | "errorList" | "bulkSync">(
    "errorList"
  );

  const { data: syncErrors, loading, error, reFetch } = useSyncErrors();

  const [processingAll, setProcessingAll] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [currentItem, setCurrentItem] = useState<number | null>(null);
  const [onlyUnresolved, setOnlyUnresolved] = useState(false);

  // Bulk sync state
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
  const [bulkSyncResources, setBulkSyncResources] = useState<BulkSyncResource[]>([]);
  const [bulkSyncAbortController, setBulkSyncAbortController] = useState<AbortController | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(10);
  const [currentEntity, setCurrentEntity] = useState<SyncEntity>("video");

  const { show } = useCardFlottant();

  const handleOpenFor = (id?: number) => {
    setSelectedRow(() => id || null);
    setModalOpen(() => true);
  };

  const { sync } = useSyncOption();

  const displayedErrors = onlyUnresolved ? (syncErrors || []).filter((r) => !r.resolved) : (syncErrors || []);

  const handleSubmit = async (
    optionId: string | null,
    label: number | null,
    platformId?: number | null
  ) => {

    try {
      show();
      await sync({
        isForce: optionId === "true",
        label: label,
        platformId: platformId,
      });

      reFetch();
      // Close the modal
      setModalOpen(false);
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  // Bulk sync functions
  const fetchResources = async (entity: SyncEntity, page: number = 1, limit: number = 10): Promise<BulkSyncResource[]> => {
    try {
      let resources: BulkSyncResource[] = [];
      
      if (entity === "video" || entity === "all") {
        const videoResponse = await getVideosForBulkSync(page, limit);
        // Handle different response formats
        const videos = videoResponse.data.data || videoResponse.data.videos || videoResponse.data;
        if (Array.isArray(videos)) {
          resources.push(...videos.map((v: any) => ({
            id: v.id,
            title: v.title || v.name || `Video #${v.id}`,
            status: v.status,
          })));
        }
      }
      
      if (entity === "post" || entity === "all") {
        const postResponse = await getPostsForBulkSync(page, limit);
        // Handle different response formats
        const posts = postResponse.data.data || postResponse.data.posts || postResponse.data;
        if (Array.isArray(posts)) {
          resources.push(...posts.map((p: any) => ({
            id: p.id,
            title: p.title || p.name || `Post #${p.id}`,
            status: p.status,
          })));
        }
      }
      
      return resources;
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      return [];
    }
  };

  const handleStartBulkSync = async (entity: SyncEntity, isForce: boolean, page: number = 1, limit: number = 10) => {
    try {
      // Store current pagination info
      setCurrentPage(page);
      setCurrentLimit(limit);
      setCurrentEntity(entity);
      
      const resources = await fetchResources(entity, page, limit);
      setBulkSyncResources(resources);
      
      // Create page stat entry
      const pageStatEntry = {
        page,
        entity,
        limit,
        processed: 0,
        succeeded: 0,
        failed: 0,
        startTime: new Date()
      };
      
      setBulkSyncProgress(prev => ({
        processed: 0,
        total: resources.length,
        failed: 0,
        succeeded: 0,
        currentItem: null,
        isRunning: true,
        isPaused: false,
        errors: [],
        pageStats: [...prev.pageStats, pageStatEntry]
      }));

      const abortController = new AbortController();
      setBulkSyncAbortController(abortController);

      // Start processing resources
      processBulkSync(resources, entity, isForce, abortController.signal, page);
    } catch (error) {
      console.error("Failed to start bulk sync:", error);
    }
  };

  const processBulkSync = async (
    resources: BulkSyncResource[],
    entity: SyncEntity,
    isForce: boolean,
    signal: AbortSignal,
    page: number
  ) => {
    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    const errors: Array<{ resourceId: number; error: string }> = [];

    for (const resource of resources) {
      if (signal.aborted) break;

      // Check if paused
      while (bulkSyncProgress.isPaused && !signal.aborted) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (signal.aborted) break;

      setBulkSyncProgress(prev => ({
        ...prev,
        currentItem: resource
      }));

      try {
        const entityType = entity === "all" ? (resource.title ? "video" : "post") : entity;
        await singleSync({
          entity: entityType,
          origin_id: resource.id,
          isForce
        });
        succeeded++;
      } catch (error: any) {
        failed++;
        errors.push({
          resourceId: resource.id,
          error: error?.response?.data?.message || error?.message || "Unknown error"
        });
      } finally {
        processed++;
        setBulkSyncProgress(prev => ({
          ...prev,
          processed,
          succeeded,
          failed,
          errors: [...errors],
          pageStats: prev.pageStats.map((stat, index) => 
            index === prev.pageStats.length - 1 // Update the last (current) page stat
              ? {
                  ...stat,
                  processed,
                  succeeded,
                  failed
                }
              : stat
          )
        }));
      }

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Mark page as completed with end time and duration
    const endTime = new Date();
    setBulkSyncProgress(prev => ({
      ...prev,
      isRunning: false,
      currentItem: null,
      pageStats: prev.pageStats.map((stat, index) => 
        index === prev.pageStats.length - 1 // Update the last (current) page stat
          ? {
              ...stat,
              endTime,
              duration: endTime.getTime() - stat.startTime.getTime()
            }
          : stat
      )
    }));
    setBulkSyncAbortController(null);
  };

  const handlePauseBulkSync = () => {
    setBulkSyncProgress(prev => ({
      ...prev,
      isPaused: true
    }));
  };

  const handleResumeBulkSync = () => {
    setBulkSyncProgress(prev => ({
      ...prev,
      isPaused: false
    }));
  };

  const handleStopBulkSync = () => {
    if (bulkSyncAbortController) {
      bulkSyncAbortController.abort();
    }
    setBulkSyncProgress(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false
    }));
    setBulkSyncAbortController(null);
  };

  return (
    <div className="h-screen w-full flex p-2">
      <div className="w-full h-full flex flex-col">
        {/* view error process */}
        <div className="w-full flex justify-between gap-2 items-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Synchronisation</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkSyncOpen(true)}
              className="rounded-lg cursor-pointer flex items-center justify-center gap-2 px-2 py-2 text-nowrap font-medium text-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 text-green-800 dark:text-green-300 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-100 dark:hover:bg-green-800 transition-all"
            >
              <FaTasks />
              <span className="md:inline hidden text-green-600 dark:text-green-400">
                Bulk Sync Tracking
              </span>
            </button>
            <button
              onClick={handleOpenFor.bind(null, undefined)}
              className=" rounded-lg cursor-pointer flex items-center justify-center gap-2 px-2 py-2 text-nowrap font-medium text-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <FaSyncAlt />
              <span className="md:inline hidden text-gray-600 dark:text-gray-400 ">
                Launch Synchronisation
              </span>
            </button>
            <button
              onClick={async () => {
                // retry all errors one by one
                if (!syncErrors || syncErrors.length === 0) return;
                const rows = syncErrors.filter((r) => !r.resolved);
                if (rows.length === 0) return;
                setTotalToProcess(rows.length);
                setProcessedCount(0);
                setProcessingAll(true);

                for (let i = 0; i < rows.length; i++) {
                  const row = rows[i];
                  try {
                    setCurrentItem(row.id);
                    // call sync for each error id; don't force by default
                    await sync({ isForce: false, label: row.id, platformId: row.plateform_id ?? null });
                  } catch (err) {
                    // swallow error and continue to next
                    console.error(`Retry failed for id=${row.id}`, err);
                  } finally {
                    setProcessedCount((c) => c + 1);
                  }
                }

                setProcessingAll(false);
                setCurrentItem(null);
                reFetch();
              }}
              disabled={processingAll || loading}
              className=" rounded-lg cursor-pointer flex items-center justify-center gap-2 px-2 py-2 text-nowrap font-medium text-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              Retry all errors
            </button>
            {processingAll && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {processedCount}/{totalToProcess} processed{currentItem ? ` — current: ${currentItem}` : ''}
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation + filter */}
        <div className="w-full mt-6 flex items-center justify-between">
          <div className="tabs tabs-bordered">
            <button
              className={`tab tab-bordered ${activeTab === "errorList" ? "tab-active" : ""
                }`}
              onClick={() => setActiveTab("errorList")}
            >
              Error List
            </button>
            <button
              className={`tab tab-bordered ${activeTab === "bulkSync" ? "tab-active" : ""
                }`}
              onClick={() => setActiveTab("bulkSync")}
            >
              Bulk Sync Status
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 ">
              <input
                type="checkbox"
                className="checkbox mr-2 accent-blue-500 dark:accent-blue-300"
                checked={onlyUnresolved}
                onChange={(e) => setOnlyUnresolved(e.target.checked)}
              />
              <span className="cursor-pointer">Only unresolved</span>
            </label>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "firstTab" ? (
          <div className="w-full flex flex-col mt-6">
            <h2 className="font-bold pb-2 text-blue-400">First Tab Content</h2>
            <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default p-6">
              <div className="text-center text-gray-500">
                <h3 className="text-lg font-medium mb-2">
                  Welcome to First Tab
                </h3>
                <p>
                  This is the content for the first tab. You can add any content
                  here.
                </p>
              </div>
            </div>
          </div>
        ) : activeTab === "bulkSync" ? (
          <div className="w-full flex flex-col mt-6">
            <h2 className="font-bold pb-2 text-green-400">Bulk Sync Status</h2>
            <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default p-6">
              {bulkSyncProgress.total === 0 ? (
                <div className="text-center text-gray-500">
                  <h3 className="text-lg font-medium mb-2">
                    No Bulk Sync in Progress
                  </h3>
                  <p className="mb-4">
                    Start a bulk synchronization to track progress here.
                  </p>
                  <button
                    onClick={() => setBulkSyncOpen(true)}
                    className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <FaTasks className="w-4 h-4" />
                    Start Bulk Sync
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Progress Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {bulkSyncProgress.processed}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Processed</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {bulkSyncProgress.total}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {bulkSyncProgress.succeeded}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Succeeded</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {bulkSyncProgress.failed}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                    </div>
                  </div>

                  {/* Current Batch Info */}
                  <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-gray-200">
                          Current Batch: {currentEntity.toUpperCase()}
                        </h5>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Page {currentPage} • {currentLimit} items per page
                        </div>
                      </div>
                      {!bulkSyncProgress.isRunning && bulkSyncProgress.total > 0 && (
                        <div className="flex items-center gap-2">
                          {currentPage > 1 && (
                            <button
                              onClick={() => handleStartBulkSync(currentEntity, false, currentPage - 1, currentLimit)}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                            >
                              <FaArrowLeft className="w-3 h-3" />
                              Prev
                            </button>
                          )}
                          <button
                            onClick={() => handleStartBulkSync(currentEntity, false, currentPage + 1, currentLimit)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                          >
                            Next
                            <FaArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden mb-2">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300" 
                        style={{ width: `${bulkSyncProgress.total > 0 ? (bulkSyncProgress.processed / bulkSyncProgress.total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(bulkSyncProgress.total > 0 ? (bulkSyncProgress.processed / bulkSyncProgress.total) * 100 : 0)}% Complete
                    </div>
                  </div>

                  {/* Current Item */}
                  {bulkSyncProgress.currentItem && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Currently Processing:
                      </h5>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        ID: {bulkSyncProgress.currentItem.id} - {bulkSyncProgress.currentItem.title || "Untitled"}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      bulkSyncProgress.isRunning 
                        ? bulkSyncProgress.isPaused
                          ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                          : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        : bulkSyncProgress.processed === bulkSyncProgress.total && bulkSyncProgress.total > 0
                          ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300"
                    }`}>
                      {bulkSyncProgress.isRunning 
                        ? bulkSyncProgress.isPaused 
                          ? "Paused" 
                          : "Running..."
                        : bulkSyncProgress.processed === bulkSyncProgress.total && bulkSyncProgress.total > 0
                          ? "Completed"
                          : "Stopped"
                      }
                    </div>
                  </div>

                  {/* Errors */}
                  {bulkSyncProgress.errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <h5 className="font-medium text-red-600 dark:text-red-400 mb-3">
                        Recent Errors ({bulkSyncProgress.errors.length})
                      </h5>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {bulkSyncProgress.errors.slice(-5).map((error, index) => (
                          <div key={index} className="text-sm border-l-2 border-red-400 pl-2">
                            <div className="font-medium text-red-700 dark:text-red-300">
                              Resource ID: {error.resourceId}
                            </div>
                            <div className="text-red-600 dark:text-red-400 text-xs">
                              {error.error}
                            </div>
                          </div>
                        ))}
                        {bulkSyncProgress.errors.length > 5 && (
                          <div className="text-xs text-gray-500 text-center">
                            ... and {bulkSyncProgress.errors.length - 5} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setBulkSyncOpen(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      View Details
                    </button>
                    {!bulkSyncProgress.isRunning && bulkSyncProgress.processed > 0 && (
                      <button
                        onClick={() => setBulkSyncProgress({
                          processed: 0,
                          total: 0,
                          failed: 0,
                          succeeded: 0,
                          currentItem: null,
                          isRunning: false,
                          isPaused: false,
                          errors: [],
                          pageStats: []
                        })}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Clear Status
                      </button>
                    )}
                  </div>

                  {/* Page Statistics Summary */}
                  {bulkSyncProgress.pageStats.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-gray-800 dark:text-gray-200">
                          Session Statistics
                        </h5>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {bulkSyncProgress.pageStats.length} pages processed
                        </div>
                      </div>
                      
                      {/* Overall Session Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {bulkSyncProgress.pageStats.reduce((sum, stat) => sum + stat.processed, 0)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">
                            {bulkSyncProgress.pageStats.reduce((sum, stat) => sum + stat.succeeded, 0)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Success</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-red-600 dark:text-red-400">
                            {bulkSyncProgress.pageStats.reduce((sum, stat) => sum + stat.failed, 0)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            {bulkSyncProgress.pageStats.reduce((sum, stat) => sum + stat.processed, 0) > 0
                              ? Math.round((bulkSyncProgress.pageStats.reduce((sum, stat) => sum + stat.succeeded, 0) / bulkSyncProgress.pageStats.reduce((sum, stat) => sum + stat.processed, 0)) * 100)
                              : 0}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                        </div>
                      </div>

                      {/* Individual Page Stats */}
                      <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Pages Breakdown
                      </h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {bulkSyncProgress.pageStats.map((stat, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                  Page {stat.page}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  stat.entity === 'video' 
                                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : stat.entity === 'post'
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                    : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                }`}>
                                  {stat.entity.toUpperCase()}
                                </span>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${
                                stat.endTime ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                              }`}></div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="text-center">
                                <div className="font-medium text-blue-600 dark:text-blue-400">
                                  {stat.processed}
                                </div>
                                <div className="text-xs text-gray-500">Items</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-green-600 dark:text-green-400">
                                  {stat.succeeded}
                                </div>
                                <div className="text-xs text-gray-500">Success</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-red-600 dark:text-red-400">
                                  {stat.failed}
                                </div>
                                <div className="text-xs text-gray-500">Failed</div>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-center text-gray-500">
                              {stat.duration 
                                ? `Duration: ${(stat.duration / 1000).toFixed(1)}s`
                                : stat.endTime 
                                  ? 'Completed' 
                                  : 'Processing...'
                              }
                            </div>
                            {stat.processed > 0 && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full transition-all duration-300" 
                                    style={{ width: `${Math.round((stat.succeeded / stat.processed) * 100)}%` }}
                                  />
                                </div>
                                <div className="text-xs text-center mt-1 text-gray-500">
                                  {Math.round((stat.succeeded / stat.processed) * 100)}% success rate
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col mt-6">
            <h2 className="font-bold pb-2 text-pink-400">Error List</h2>

            <div className="relative bg-neutral-primary-soft shadow-xs rounded-base border border-default">
              <div className="max-h-[60vh] overflow-auto">
                <table className="w-full text-sm text-left rtl:text-right text-body">
                  <thead className="text-sm text-body text-white dark:text-white bg-slate-500 dark:bg-slate-800 border-b border-default no-scrollbar sticky top-0 z-20">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">
                        ID
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Entity
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Platform
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Origin ID
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Source ID
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Resolved
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Created
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-2">Loading errors...</span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-4 text-center text-red-500"
                        >
                          Error loading sync errors: {error.message}
                          <button
                            onClick={reFetch}
                            className="ml-2 px-2 py-1 bg-brand-600 text-white rounded text-sm hover:bg-brand-700"
                          >
                            Retry
                          </button>
                        </td>
                      </tr>
                    ) : displayedErrors.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No sync errors found
                        </td>
                      </tr>
                    ) : (
                      displayedErrors.map((row) => (
                        <tr
                          key={row.id}
                          className="bg-neutral-primary border-b border-default"
                        >
                          <td className="px-4 py-3">{row.id}</td>
                          <td className="px-4 py-3">{row.entity}</td>
                          <td className="px-4 py-3">
                            {row.plateform?.name ?? row.plateform_id}
                          </td>
                          <td className="px-4 py-3">
                            {row.origin_id
                              ? row.entity === "video" || row.entity === "post"
                                ? (() => {
                                  // choose base path depending on entity
                                  const basePath =
                                    row.entity === "video" ? "videos" : "posts";
                                  const href = `/${basePath}/${row.origin_id}`;
                                  return (
                                    <Link
                                      to={href}
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {row.origin_id}
                                    </Link>
                                  );
                                })()
                                : String(row.origin_id)
                              : "-"}
                          </td>
                          <td className="px-4 py-3">{row.source_id ?? "-"}</td>
                          <td className="px-4 py-3">
                            {row.resolved ? (
                              <span className="text-green-600 font-medium">
                                Resolved
                              </span>
                            ) : (
                              <span className="text-yellow-600 font-medium">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {row.createdAt
                              ? new Date(row.createdAt).toLocaleString()
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              disabled={row.resolved}
                              className={`btn btn-xs btn-primary ${row.resolved ? "btn-disabled" : ""}`}
                              onClick={() => handleOpenFor(row.id)}
                            >
                              retry
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {modalOpen && <SelectModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          rowLabel={selectedRow}
          title={selectedRow ? `Sync: ${selectedRow}` : "Select an option"}
          onSubmit={handleSubmit}
        />}
        <WaterProgressModal
          open={processingAll}
          percent={totalToProcess > 0 ? (processedCount / totalToProcess) * 100 : 0}
          processed={processedCount}
          total={totalToProcess}
          currentItem={currentItem}
          onClose={() => {
            setProcessingAll(false);
          }}
        />
        <BulkSyncTrackingModal
          open={bulkSyncOpen}
          onClose={() => setBulkSyncOpen(false)}
          onStartSync={handleStartBulkSync}
          progress={bulkSyncProgress}
          onPause={handlePauseBulkSync}
          onResume={handleResumeBulkSync}
          onStop={handleStopBulkSync}
        />
      </div>
    </div>
  );
};

export default Synchronisation;
