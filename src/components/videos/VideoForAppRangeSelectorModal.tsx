import React from "react";
import { CheckSquare, X } from "lucide-react";
import type {
  RangeProgress,
  VideoForAppRangeSelection,
} from "../../hooks/useVideoForAppRangeSelection";

interface VideoForAppRangeSelectorModalProps {
  isOpen: boolean;
  rangeSelection: VideoForAppRangeSelection;
  setRangeSelection: React.Dispatch<React.SetStateAction<VideoForAppRangeSelection>>;
  hasData: boolean;
  totalPages: number;
  rangeLoading: boolean;
  rangeProgress: RangeProgress;
  onClose: () => void;
  onSubmit: () => void;
}

const VideoForAppRangeSelectorModal: React.FC<VideoForAppRangeSelectorModalProps> = ({
  isOpen,
  rangeSelection,
  setRangeSelection,
  hasData,
  totalPages,
  rangeLoading,
  rangeProgress,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              选择范围
            </h2>
            <button
              onClick={onClose}
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
                  onChange={(e) =>
                    setRangeSelection((prev) => ({
                      ...prev,
                      startPage: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
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
                  onChange={(e) =>
                    setRangeSelection((prev) => ({
                      ...prev,
                      endPage: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {hasData && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                可用页面总数 : {totalPages}
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
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={rangeLoading}
            >
              取消
            </button>
            <button
              onClick={onSubmit}
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
  );
};

export default VideoForAppRangeSelectorModal;
