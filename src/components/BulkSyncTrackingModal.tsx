import React, { useState, useEffect } from "react";
import { FaSyncAlt, FaPlay, FaPause, FaStop, FaCheck, FaTimes, FaClock, FaArrowLeft, FaArrowRight } from "react-icons/fa";

export type SyncEntity = "video" | "post" | "video_for_app";
export type SyncEntitySelection = SyncEntity[] | "all";

export interface BulkSyncResource {
  id: number;
  title?: string;
  name?: string;
  status?: string;
  source?: SyncEntity; // Track the source entity type
  cover?: string; // Cover image URL
}

export interface BulkSyncProgress {
  processed: number;
  total: number;
  failed: number;
  succeeded: number;
  currentItem: BulkSyncResource | null;
  isRunning: boolean;
  isPaused: boolean;
  errors: Array<{
    resourceId: number;
    error: string;
  }>;
  pageStats: Array<{
    page: number;
    entity: SyncEntity;
    limit: number;
    processed: number;
    succeeded: number;
    failed: number;
    startTime: Date;
    endTime?: Date;
    duration?: number; // in milliseconds
  }>;
}

interface BulkSyncTrackingModalProps {
  open: boolean;
  onClose: () => void;
  onStartSync: (entities: SyncEntitySelection, isForce: boolean, page: number, limit: number, autoSwitch?: boolean) => void;
  progress: BulkSyncProgress;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onDisableAutoSwitch?: () => void;
}

const BulkSyncTrackingModal: React.FC<BulkSyncTrackingModalProps> = ({
  open,
  onClose,
  onStartSync,
  progress,
  onPause,
  onResume,
  onStop,
  onDisableAutoSwitch,
}) => {
  const [selectedEntities, setSelectedEntities] = useState<SyncEntity[]>(["video"]);
  const [isForce, setIsForce] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [autoSwitchPage, setAutoSwitchPage] = useState(false);
  const [autoSwitchDisabled, setAutoSwitchDisabled] = useState(false);

  const percent = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

  // Reset local state when modal opens
  useEffect(() => {
    if (open && progress.processed === 0 && progress.total === 0) {
      setAutoSwitchPage(false);
      setAutoSwitchDisabled(false);
      setShowDetails(false);
    }
  }, [open, progress.processed, progress.total]);

  const handleStart = () => {
    console.log(`Starting sync with auto-switch: ${autoSwitchPage}`);
    console.log(autoSwitchPage);

    const entities: SyncEntitySelection = selectedEntities.length === 3 ? "all" : selectedEntities;
    onStartSync(entities, isForce, currentPage, limit, autoSwitchPage);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg relative max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <FaSyncAlt className="text-blue-500 w-6 h-6" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Bulk Synchronization Tracking
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            disabled={progress.isRunning}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!progress.isRunning && progress.processed === 0 ? (
            // Configuration phase
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                  Configure Synchronization
                </h4>
                
                {/* Entity Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Entity Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: "video" as SyncEntity, label: "Videos" },
                      { value: "post" as SyncEntity, label: "Posts" },
                      { value: "video_for_app" as SyncEntity, label: "Videos For App" },
                    ].map((entity) => (
                      <label key={entity.value} className="flex items-center p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          checked={selectedEntities.includes(entity.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEntities([...selectedEntities, entity.value]);
                            } else {
                              setSelectedEntities(selectedEntities.filter(e => e !== entity.value));
                            }
                          }}
                          className="checkbox checkbox-primary mr-3"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{entity.label}</span>
                      </label>
                    ))}
                    
                    <div className="md:col-span-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <label className="flex items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEntities.length === 3}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEntities(["video", "post", "video_for_app"]);
                            } else {
                              setSelectedEntities([]);
                            }
                          }}
                          className="checkbox checkbox-secondary mr-3"
                        />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Select All</span>
                      </label>
                    </div>
                    
                    {selectedEntities.length > 0 && (
                      <div className="md:col-span-2 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                          Selected: {selectedEntities.length} entity{selectedEntities.length !== 1 ? 'ies' : 'y'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedEntities.map(entity => (
                            <span key={entity} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                              {entity === "video_for_app" ? "Videos For App" : entity === "video" ? "Videos" : "Posts"}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Force Option */}
                {/* <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Synchronization Mode
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="syncMode"
                        checked={!isForce}
                        onChange={() => setIsForce(false)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">Normal Sync</div>
                        <div className="text-sm text-gray-500">Only sync new items</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="syncMode"
                        checked={isForce}
                        onChange={() => setIsForce(true)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">Force Sync</div>
                        <div className="text-sm text-gray-500">Update all existing items</div>
                      </div>
                    </label>
                  </div>
                </div> */}

                {/* Pagination Options */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pagination Settings
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Page Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentPage}
                        onChange={(e) => setCurrentPage(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Items per page
                      </label>
                      <select
                        value={limit}
                        onChange={(e) => setLimit(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Auto Switch Page Option */}
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <input
                      type="checkbox"
                      id="autoSwitchPage"
                      checked={autoSwitchPage}
                      onChange={(e) => setAutoSwitchPage(e.target.checked)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoSwitchPage" className="flex-1">
                      <div className="font-medium text-blue-800 dark:text-blue-200">
                        Auto Switch to Next Page
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-300">
                        Automatically move to the next page when current page completes
                      </div>
                    </label>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Will fetch page {currentPage} with {limit} items per page
                    {autoSwitchPage && (
                      <span className="text-blue-600 dark:text-blue-400">
                        {" "}• Auto-pagination enabled
                      </span>
                    )}
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={handleStart}
                  disabled={selectedEntities.length === 0}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                    selectedEntities.length === 0
                      ? "bg-gray-400 cursor-not-allowed text-gray-200"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <FaPlay className="w-4 h-4" />
                  Start Synchronization
                  {selectedEntities.length === 0 && " (Select at least one entity)"}
                </button>
              </div>
            </div>
          ) : (
            // Progress tracking phase
            <div className="space-y-6">
              {/* Progress Overview */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Sync Progress
                  </h4>
                  <div className="flex items-center gap-2">
                    {progress.isRunning && !progress.isPaused && (
                      <button
                        onClick={onPause}
                        className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-md text-sm hover:bg-yellow-200 dark:hover:bg-yellow-900/30"
                      >
                        <FaPause className="w-3 h-3" />
                        Pause
                      </button>
                    )}
                    {progress.isPaused && (
                      <button
                        onClick={onResume}
                        className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm hover:bg-green-200 dark:hover:bg-green-900/30"
                      >
                        <FaPlay className="w-3 h-3" />
                        Resume
                      </button>
                    )}
                    <button
                      onClick={onStop}
                      className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm hover:bg-red-200 dark:hover:bg-red-900/30"
                    >
                      <FaStop className="w-3 h-3" />
                      Stop
                    </button>
                    {autoSwitchPage && !autoSwitchDisabled && (
                      <button
                        onClick={() => {
                          console.log("Disable Auto-Switch button clicked");
                          setAutoSwitchPage(false);
                          setAutoSwitchDisabled(true);
                          if (onDisableAutoSwitch) {
                            console.log("Calling onDisableAutoSwitch callback");
                            onDisableAutoSwitch();
                          } else {
                            console.warn("onDisableAutoSwitch callback not provided");
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-md text-sm hover:bg-orange-200 dark:hover:bg-orange-900/30"
                        title="Disable auto-pagination for future pages"
                      >
                        Disable Auto-Switch
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {progress.processed}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {progress.total}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {progress.succeeded}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Succeeded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {progress.failed}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-2">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(percent)}% Complete
                </div>
              </div>

              {/* Current Item */}
              {progress.currentItem && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
                    Currently Processing:
                  </h5>
                  <div className="flex items-center gap-4">
                    {progress.currentItem.cover && (
                      <div className="flex-shrink-0">
                        <img
                          src={progress.currentItem.cover}
                          alt={progress.currentItem.title || "Cover"}
                          className="w-16 h-16 object-cover rounded-lg border border-blue-200 dark:border-blue-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {progress.currentItem.title || progress.currentItem.name || "Untitled"}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                        ID: {progress.currentItem.id}
                        {progress.currentItem.source && (
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            progress.currentItem.source === 'video' 
                              ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300'
                              : progress.currentItem.source === 'post'
                              ? 'bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300'
                              : progress.currentItem.source === 'video_for_app'
                              ? 'bg-orange-100 dark:bg-orange-800/50 text-orange-700 dark:text-orange-300'
                              : 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                          }`}>
                            {progress.currentItem.source.toUpperCase().replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Errors Section */}
              {progress.errors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-red-600 dark:text-red-400">
                      Errors ({progress.errors.length})
                    </h5>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showDetails ? "Hide Details" : "Show Details"}
                    </button>
                  </div>
                  
                  {showDetails && (
                    <div className="max-h-40 overflow-y-auto bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                      {progress.errors.map((error, index) => (
                        <div key={index} className="mb-2 last:mb-0 text-sm">
                          <div className="font-medium text-red-700 dark:text-red-300">
                            Resource ID: {error.resourceId}
                          </div>
                          <div className="text-red-600 dark:text-red-400 text-xs">
                            {error.error}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                  progress.isRunning 
                    ? progress.isPaused
                      ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                      : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                    : progress.processed === progress.total && progress.total > 0
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300"
                }`}>
                  {progress.isRunning 
                    ? progress.isPaused 
                      ? "Paused" 
                      : "Running..."
                    : progress.processed === progress.total && progress.total > 0
                      ? "Completed"
                      : "Stopped"
                  }
                </div>
                {autoSwitchPage && !autoSwitchDisabled && (progress.processed === progress.total && progress.total > 0) && (
                  <div className="mt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      Preparing to switch to next page...
                    </div>
                  </div>
                )}
                {autoSwitchDisabled && (progress.processed === progress.total && progress.total > 0) && (
                  <div className="mt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                      <FaStop className="w-2 h-2" />
                      Auto-switch disabled
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination Controls for Next Batch */}
              {(progress.processed === progress.total && progress.total > 0) && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Load Next Batch
                  </h5>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Current: Page {currentPage} ({limit} items)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newPage = currentPage + 1;
                          setCurrentPage(newPage);
                          const entities: SyncEntitySelection = selectedEntities.length === 3 ? "all" : selectedEntities;
                          onStartSync(entities, isForce, newPage, limit, autoSwitchPage);
                        }}
                        disabled={progress.isRunning}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm transition-colors flex items-center gap-1"
                      >
                        Next Page
                        <FaArrowRight className="w-3 h-3" />
                      </button>
                      {currentPage > 1 && (
                        <button
                          onClick={() => {
                            const newPage = currentPage - 1;
                            setCurrentPage(newPage);
                            const entities: SyncEntitySelection = selectedEntities.length === 3 ? "all" : selectedEntities;
                            onStartSync(entities, isForce, newPage, limit, autoSwitchPage);
                          }}
                          disabled={progress.isRunning}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded text-sm transition-colors flex items-center gap-1"
                        >
                          <FaArrowLeft className="w-3 h-3" />
                          Prev Page
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Page Statistics */}
              {progress.pageStats.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-800 dark:text-gray-200">
                      Page Statistics ({progress.pageStats.length} pages processed)
                    </h5>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      {showDetails ? "Hide Stats" : "Show Stats"}
                    </button>
                  </div>
                  
                  {showDetails && (
                    <div className="max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Page</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Entity</th>
                              <th className="px-3 py-2 text-center font-medium text-gray-700 dark:text-gray-300">Items</th>
                              <th className="px-3 py-2 text-center font-medium text-gray-700 dark:text-gray-300">
                                <div className="flex items-center justify-center gap-1">
                                  <FaCheck className="w-3 h-3 text-green-600" />
                                  Success
                                </div>
                              </th>
                              <th className="px-3 py-2 text-center font-medium text-gray-700 dark:text-gray-300">
                                <div className="flex items-center justify-center gap-1">
                                  <FaTimes className="w-3 h-3 text-red-600" />
                                  Failed
                                </div>
                              </th>
                              <th className="px-3 py-2 text-center font-medium text-gray-700 dark:text-gray-300">
                                <div className="flex items-center justify-center gap-1">
                                  <FaClock className="w-3 h-3 text-gray-600" />
                                  Duration
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {progress.pageStats.map((stat, index) => (
                              <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                                <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
                                  {stat.page}
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    stat.entity === 'video' 
                                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                      : stat.entity === 'post'
                                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                      : stat.entity === 'video_for_app'
                                      ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                                      : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                  }`}>
                                    {stat.entity.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">
                                  {stat.processed}/{stat.limit}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    {stat.succeeded}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className="text-red-600 dark:text-red-400 font-medium">
                                    {stat.failed}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-xs">
                                  {stat.duration 
                                    ? `${(stat.duration / 1000).toFixed(1)}s`
                                    : stat.endTime ? 'Completed' : 'Running...'
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Summary Statistics */}
                      <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {progress.pageStats.reduce((sum, stat) => sum + stat.processed, 0)}
                            </div>
                            <div className="text-xs text-gray-500">Total Items</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              {progress.pageStats.reduce((sum, stat) => sum + stat.succeeded, 0)}
                            </div>
                            <div className="text-xs text-gray-500">Total Success</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                              {progress.pageStats.reduce((sum, stat) => sum + stat.failed, 0)}
                            </div>
                            <div className="text-xs text-gray-500">Total Failed</div>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Average Success Rate: {
                              progress.pageStats.length > 0 
                                ? Math.round(
                                    (progress.pageStats.reduce((sum, stat) => sum + stat.succeeded, 0) / 
                                     progress.pageStats.reduce((sum, stat) => sum + stat.processed, 0)) * 100
                                  )
                                : 0
                            }%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {(progress.processed === progress.total && progress.total > 0) || (!progress.isRunning && progress.processed > 0) ? (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BulkSyncTrackingModal;