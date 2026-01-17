import React, { useState, useEffect } from "react";
import { FaSyncAlt, FaPlay, FaPause, FaStop } from "react-icons/fa";

export type SyncEntity = "video" | "post" | "all";

export interface BulkSyncResource {
  id: number;
  title?: string;
  name?: string;
  status?: string;
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
}

interface BulkSyncTrackingModalProps {
  open: boolean;
  onClose: () => void;
  onStartSync: (entity: SyncEntity, isForce: boolean) => void;
  progress: BulkSyncProgress;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const BulkSyncTrackingModal: React.FC<BulkSyncTrackingModalProps> = ({
  open,
  onClose,
  onStartSync,
  progress,
  onPause,
  onResume,
  onStop,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<SyncEntity>("video");
  const [isForce, setIsForce] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const percent = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;
  
  const handleStart = () => {
    onStartSync(selectedEntity, isForce);
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
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "video" as SyncEntity, label: "Videos" },
                      { value: "post" as SyncEntity, label: "Posts" },
                      { value: "all" as SyncEntity, label: "All" },
                    ].map((entity) => (
                      <button
                        key={entity.value}
                        onClick={() => setSelectedEntity(entity.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedEntity === entity.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {entity.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Force Option */}
                <div className="space-y-3">
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
                </div>

                {/* Start Button */}
                <button
                  onClick={handleStart}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <FaPlay className="w-4 h-4" />
                  Start Synchronization
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
                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Currently Processing:
                  </h5>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    ID: {progress.currentItem.id} - {progress.currentItem.title || progress.currentItem.name || "Untitled"}
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
              </div>
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