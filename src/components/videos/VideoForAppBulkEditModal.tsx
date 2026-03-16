import React from "react";
import { Users, X } from "lucide-react";
import TagCategoryVideoForApp from "../TagCategoryVideoForApp";
import type {
  VideoForAppBulkEditData,
  VideoForAppCheckingStatus,
} from "../../hooks/useVideoForAppBulkEdit";

interface VideoForAppBulkEditModalProps {
  isOpen: boolean;
  selectedCount: number;
  bulkEditData: VideoForAppBulkEditData;
  setBulkEditData: React.Dispatch<React.SetStateAction<VideoForAppBulkEditData>>;
  creators: any[];
  bulkEditLoading: boolean;
  bulkEditProgress: { current: number; total: number };
  onClose: () => void;
  onSubmit: () => void;
  onTagSelect: (tag: number | { name: string }) => void;
  onTagDeselect: (tag: number | { name: string }) => void;
}

const VideoForAppBulkEditModal: React.FC<VideoForAppBulkEditModalProps> = ({
  isOpen,
  selectedCount,
  bulkEditData,
  setBulkEditData,
  creators,
  bulkEditLoading,
  bulkEditProgress,
  onClose,
  onSubmit,
  onTagSelect,
  onTagDeselect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              批量版 ({selectedCount} vidéo{selectedCount > 1 ? "s" : ""})
            </h2>
            <button
              onClick={onClose}
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
                onChange={(e) => setBulkEditData((prev) => ({ ...prev, modifyTags: e.target.checked }))}
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
                  onTagSelect={onTagSelect}
                  onTagDeselect={onTagDeselect}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="randomTags"
                checked={bulkEditData.randomTags}
                onChange={(e) => setBulkEditData((prev) => ({ ...prev, randomTags: e.target.checked }))}
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
                onChange={(e) => setBulkEditData((prev) => ({ ...prev, synchronize: e.target.checked }))}
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
                  onChange={(e) => setBulkEditData((prev) => ({ ...prev, randomTagsText: e.target.value }))}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                创建 / 分配创建者
              </label>
              <select
                value={bulkEditData.creator_id}
                onChange={(e) => setBulkEditData((prev) => ({ ...prev, creator_id: e.target.value }))}
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
                value={bulkEditData.isActive === null ? "" : bulkEditData.isActive.toString()}
                onChange={(e) => setBulkEditData((prev) => ({
                  ...prev,
                  isActive: e.target.value === "" ? null : e.target.value === "true",
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
                value={bulkEditData.isBanned === null ? "" : String(bulkEditData.isBanned)}
                onChange={(e) => setBulkEditData((prev) => ({
                  ...prev,
                  isBanned: e.target.value === "" ? null : e.target.value === "true",
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
                value={bulkEditData.checking || ""}
                onChange={(e) => setBulkEditData((prev) => ({
                  ...prev,
                  checking: e.target.value === "" ? null : (e.target.value as VideoForAppCheckingStatus),
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
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={bulkEditLoading}
            >
              取消
            </button>
            <button
              onClick={onSubmit}
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
  );
};

export default VideoForAppBulkEditModal;
