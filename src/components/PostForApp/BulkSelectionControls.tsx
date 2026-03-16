import React from "react";
import { CheckSquare, Square, Users, X, Edit } from "lucide-react";

export default function BulkSelectionControls({
  posts,
  selectedPosts,
  selectAllPage,
  openRangeSelector,
  deselectAll,
  openBulkEdit,
}: {
  posts: any[];
  selectedPosts: Set<number>;
  selectAllPage: () => void;
  openRangeSelector: () => void;
  deselectAll: () => void;
  openBulkEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={selectAllPage}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          {posts?.length > 0 && posts.every(p => selectedPosts.has(p.id)) ? (
            <CheckSquare className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          全选页面
        </button>

        <button
          onClick={() => {
            openRangeSelector();
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
  );
}
