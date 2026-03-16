import React, { useState, useCallback, useEffect } from 'react';
import { X, Edit, Check, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { bulkUpdatePosts } from '../api/posts';
import CreatorAutoComplete from './CreatorAutoComplete';
import TagCategorySelector from './TagCategorySelector';
import usePostTagCategories from '../hooks/usePostTagCategories';
import useCategoryPost from '../hooks/posts/useCategoryPost';
import useSubCategoryPost from '../hooks/posts/useSubCategoryPost';
import type { Creator } from './creators/CreatorList';
import type { Category } from './CategoryAutoComplete';
import { useI18n } from '../i18n';

interface BulkEditData {
  creator: string | 'random' | null;
  selectedCreator: Creator | null;
  category: Category | null;
  subCategory: any | null;
  isActive: boolean | null;
  isBanned: boolean | null;
  checking: 'ready' | 'null' | 'checked' | 'refused' | 'waiting for checking' | null;
  modifyTags: boolean;
  tags: { id?: number; name: string }[];
}

interface BulkEditPostModalProps {
  isOpen: boolean;
  selectedPosts: Set<number>;
  onClose: () => void;
  onSuccess: () => void;
  onDeselectAll: () => void;
}

const BulkEditPostModal: React.FC<BulkEditPostModalProps> = ({
  isOpen,
  selectedPosts,
  onClose,
  onSuccess,
  onDeselectAll,
}) => {
  const { t } = useI18n();
  const { items: availableTags } = usePostTagCategories();
  const { data: categoriesResponse } = useCategoryPost();
  const [bulkEditData, setBulkEditData] = useState<BulkEditData>({
    creator: null,
    selectedCreator: null,
    category: null,
    subCategory: null,
    isActive: null,
    isBanned: null,
    checking: null,
    modifyTags: false,
    tags: [],
  });
  const { data: subCategoriesResponse } = useSubCategoryPost(Number(bulkEditData.category?.id));
  const [bulkEditLoading, setBulkEditLoading] = useState(false);
  const [bulkEditProgress, setBulkEditProgress] = useState({ current: 0, total: 0 });
  const postItemLabel = (count: number) =>
    count !== 1 ? t("posts.bulk_edit.post_plural") : t("posts.bulk_edit.post_singular");
  const formatCountLabel = (key: string, count: number) =>
    t(key)
      .replace("{count}", String(count))
      .replace("{item}", postItemLabel(count));

  const handleCreatorChange = useCallback((value: string | null) => {
    if (value === null || value === '') {
      setBulkEditData(prev => ({ ...prev, creator: null, selectedCreator: null }));
    } else {
      setBulkEditData(prev => ({ ...prev, creator: value }));
    }
  }, []);

  const handleCreatorSelect = useCallback((creator: Creator | null) => {
    if (creator) {
      setBulkEditData(prev => ({
        ...prev,
        creator: creator.name,
        selectedCreator: creator
      }));
    } else {
      setBulkEditData(prev => ({ ...prev, creator: null, selectedCreator: null }));
    }
  }, []);

  const handleCategorySelect = useCallback((category: Category | null) => {
    setBulkEditData(prev => ({
      ...prev,
      category: category,
      subCategory: null // Reset subcategory when category changes
    }));
  }, []);

  const handleSubCategorySelect = useCallback((subCategory: any | null) => {
    setBulkEditData(prev => ({
      ...prev,
      subCategory: subCategory
    }));
  }, []);

  useEffect(() => {
    if (bulkEditData.modifyTags && availableTags.length > 0 && bulkEditData.tags.length === 0) {
      const shuffled = [...availableTags].sort(() => 0.5 - Math.random());
      const randomTags = shuffled.slice(0, 5).map(tag => ({ id: tag.id, name: tag.name }));
      setBulkEditData(prev => ({ ...prev, tags: randomTags }));
    } else if (!bulkEditData.modifyTags) {
      setBulkEditData(prev => ({ ...prev, tags: [] }));
    }
  }, [bulkEditData.modifyTags, availableTags]);

  const closeBulkEdit = () => {
    setBulkEditData({
      creator: null,
      selectedCreator: null,
      category: null,
      subCategory: null,
      isActive: null,
      isBanned: null,
      checking: null,
      modifyTags: false,
      tags: [],
    });
    setBulkEditProgress({ current: 0, total: 0 });
    onClose();
  };

  const handleBulkEditSubmit = async () => {
    if (selectedPosts.size === 0) return;

    setBulkEditLoading(true);
    setBulkEditProgress({ current: 0, total: selectedPosts.size });

    try {
      const updateData: any = {};

      if (bulkEditData.creator !== null) {
        if (bulkEditData.creator === 'random') {
          updateData.creator = 'random';
        } else if (bulkEditData.selectedCreator) {
          updateData.creator_id = bulkEditData.selectedCreator.id.toString();
        }
      }
      if (bulkEditData.category !== null) {
        updateData.category_id = bulkEditData.category.id;
      }
      if (bulkEditData.subCategory !== null) {
        updateData.sub_category_id = bulkEditData.subCategory.id;
      }
      if (bulkEditData.isActive !== null) updateData.isDeleted = !bulkEditData.isActive;
      if (bulkEditData.isBanned !== null) updateData.isBanned = bulkEditData.isBanned;
      if (bulkEditData.checking !== null) updateData.checking = bulkEditData.checking;
      if (bulkEditData.modifyTags && bulkEditData.tags.length > 0) {
        updateData.tags = bulkEditData.tags.map(t => t.id ? t.id : { name: t.name });
      }

      if (Object.keys(updateData).length === 0) {
        toast.error(t("posts.bulk_edit.no_changes_to_apply"));
        setBulkEditLoading(false);
        return;
      }

      // Simulate progress for better UX
      const simulateProgress = (current: number, total: number) => {
        setBulkEditProgress({ current, total });
      };

      // Start progress simulation
      const progressInterval = setInterval(() => {
        setBulkEditProgress(prev => {
          const newCurrent = Math.min(prev.current + 1, prev.total - 1);
          return { ...prev, current: newCurrent };
        });
      }, 100);

      await bulkUpdatePosts(Array.from(selectedPosts), updateData);

      clearInterval(progressInterval);
      setBulkEditProgress({ current: selectedPosts.size, total: selectedPosts.size });

      toast.success(formatCountLabel("posts.bulk_edit.success", selectedPosts.size));
      onSuccess();
      closeBulkEdit();
      onDeselectAll();

    } catch (error: any) {
      console.error('Bulk edit error:', error);
      setBulkEditLoading(false);
      setBulkEditProgress({ current: 0, total: 0 });
      toast.error(error?.response?.data?.message || t("posts.bulk_edit.error"));
    } finally {
      setBulkEditLoading(false);
    }
  };

  const hasChanges = () => {
    return bulkEditData.creator !== null ||
           bulkEditData.category !== null ||
           bulkEditData.subCategory !== null ||
           bulkEditData.isActive !== null ||
           bulkEditData.isBanned !== null ||
           bulkEditData.checking !== null ||
           (bulkEditData.modifyTags && bulkEditData.tags.length > 0);
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-3xl p-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">{t("posts.bulk_edit.title")}</h3>
              <p className="text-blue-100 text-sm mt-0.5">
                {formatCountLabel("posts.bulk_edit.selected_count", selectedPosts.size)}
              </p>
            </div>
          </div>
          <button
            onClick={closeBulkEdit}
            disabled={bulkEditLoading}
            className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[calc(100vh-280px)] overflow-y-auto">
          {/* Info Banner */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">{t("posts.bulk_edit.info_title")}</p>
              <p className="text-blue-700 dark:text-blue-400">
                {t("posts.bulk_edit.info_desc")}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Creator Selection */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                {t("posts.bulk_edit.creator_assignment")}
              </label>
              <div className="space-y-3">
                <CreatorAutoComplete
                  value={bulkEditData.creator === 'random' ? '' : (bulkEditData.creator || '')}
                  onChange={handleCreatorChange}
                  onSelect={handleCreatorSelect}
                  placeholder={t("posts.bulk_edit.creator_placeholder")}
                  disabled={bulkEditLoading || bulkEditData.creator === 'random'}
                />
                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={bulkEditData.creator === 'random'}
                    onChange={(e) => setBulkEditData(prev => ({
                      ...prev,
                      creator: e.target.checked ? 'random' : null,
                      selectedCreator: e.target.checked ? null : prev.selectedCreator
                    }))}
                    className="checkbox checkbox-sm checkbox-primary"
                    disabled={bulkEditLoading}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {t("posts.bulk_edit.creator_random")}
                  </span>
                </label>
              </div>
            </div>

            {/* Category and Subcategory Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Selection */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                  {t("posts.bulk_edit.category")}
                </label>
                <select
                  value={bulkEditData.category?.id || ''}
                  onChange={(e) => {
                    const categoryId = e.target.value;
                    if (categoryId === '') {
                      handleCategorySelect(null);
                    } else {
                      const selectedCategory = categoriesResponse?.categories?.find(
                        (cat: Category) => cat.id.toString() === categoryId
                      );
                      handleCategorySelect(selectedCategory || null);
                    }
                  }}
                  className="select select-bordered w-full bg-white dark:bg-gray-800"
                  disabled={bulkEditLoading}
                >
                  <option value="">{t("posts.bulk_edit.no_change")}</option>
                  {categoriesResponse?.categories?.map((category: Category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Selection */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                  {t("posts.bulk_edit.subcategory")}
                </label>
                <select
                  value={bulkEditData.subCategory?.id || ''}
                  onChange={(e) => {
                    const subCategoryId = e.target.value;
                    if (subCategoryId === '') {
                      handleSubCategorySelect(null);
                    } else {
                      const selectedSubCategory = subCategoriesResponse?.subCategories?.find(
                        (subCat: any) => subCat.id.toString() === subCategoryId
                      );
                      handleSubCategorySelect(selectedSubCategory || null);
                    }
                  }}
                  className="select select-bordered w-full bg-white dark:bg-gray-800"
                  disabled={bulkEditLoading || !bulkEditData.category}
                >
                  <option value="">{t("posts.bulk_edit.no_change")}</option>
                  {bulkEditData.category && subCategoriesResponse?.subCategories?.map((subCategory: any) => (
                    <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Activation Status */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  <div className="w-1 h-5 bg-green-600 rounded-full"></div>
                  {t("posts.bulk_edit.activation_status")}
                </label>
                <select
                  value={bulkEditData.isActive === null ? '' : bulkEditData.isActive.toString()}
                  onChange={(e) => setBulkEditData(prev => ({
                    ...prev,
                    isActive: e.target.value === '' ? null : e.target.value === 'true'
                  }))}
                  className="select select-bordered w-full bg-white dark:bg-gray-800"
                  disabled={bulkEditLoading}
                >
                  <option value="">{t("posts.bulk_edit.no_change")}</option>
                  <option value="true">{t("posts.bulk_edit.activate")}</option>
                  <option value="false">{t("posts.bulk_edit.deactivate")}</option>
                </select>
              </div>

              {/* Ban Status */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  <div className="w-1 h-5 bg-red-600 rounded-full"></div>
                  {t("posts.bulk_edit.ban_status")}
                </label>
                <select
                  value={bulkEditData.isBanned === null ? '' : bulkEditData.isBanned.toString()}
                  onChange={(e) => setBulkEditData(prev => ({
                    ...prev,
                    isBanned: e.target.value === '' ? null : e.target.value === 'true'
                  }))}
                  className="select select-bordered w-full bg-white dark:bg-gray-800"
                  disabled={bulkEditLoading}
                >
                  <option value="">{t("posts.bulk_edit.no_change")}</option>
                  <option value="true">{t("posts.bulk_edit.ban")}</option>
                  <option value="false">{t("posts.bulk_edit.unban")}</option>
                </select>
              </div>
            </div>

            {/* Checking Status */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
                {t("posts.bulk_edit.review_status")}
              </label>
              <select
                value={bulkEditData.checking === null ? '' : bulkEditData.checking}
                onChange={(e) => setBulkEditData(prev => ({
                  ...prev,
                  checking: e.target.value === '' ? null : e.target.value as 'ready' | 'null' | 'checked' | 'refused' | 'waiting for checking'
                }))}
                className="select select-bordered w-full bg-white dark:bg-gray-800"
                disabled={bulkEditLoading}
              >
                <option value="">{t("posts.bulk_edit.no_change")}</option>
                <option value="null">{t("posts.bulk_edit.review.not_ready")}</option>
                <option value="checked">{t("posts.bulk_edit.review.checked")}</option>
                <option value="waiting for checking">{t("posts.bulk_edit.review.waiting")}</option>
                <option value="refused">{t("posts.bulk_edit.review.refused")}</option>
              </select>
            </div>

            {/* Tags */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                <div className="w-1 h-5 bg-amber-600 rounded-full"></div>
                {t("posts.bulk_edit.tags_management")}
              </label>
              <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-amber-400 dark:hover:border-amber-600 transition-colors mb-3">
                <input
                  type="checkbox"
                  checked={bulkEditData.modifyTags}
                  onChange={(e) => setBulkEditData(prev => ({ ...prev, modifyTags: e.target.checked }))}
                  className="checkbox checkbox-sm checkbox-warning"
                  disabled={bulkEditLoading}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {t("posts.bulk_edit.tags_update")}
                </span>
              </label>
              {bulkEditData.modifyTags && (
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <TagCategorySelector
                    selected={bulkEditData.tags}
                    setSelected={(tags) => setBulkEditData(prev => ({ ...prev, tags }))}
                    allowCustomTag={true}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          {bulkEditLoading && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  {t("posts.bulk_edit.processing_updates")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-blue-200 dark:bg-blue-900 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(bulkEditProgress.current / bulkEditProgress.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300 min-w-[4rem] text-right">
                  {bulkEditProgress.current} / {bulkEditProgress.total}
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                {t("posts.bulk_edit.processing_help")}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {hasChanges() ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                {t("posts.bulk_edit.changes_ready")}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                {t("posts.bulk_edit.no_changes_selected")}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              className="btn btn-outline border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={closeBulkEdit}
              disabled={bulkEditLoading}
            >
              {t("common.cancel")}
            </button>
            <button
              className="btn btn-primary bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-lg disabled:opacity-50"
              onClick={handleBulkEditSubmit}
              disabled={bulkEditLoading || selectedPosts.size === 0 || !hasChanges()}
            >
              {bulkEditLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("common.processing")}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {formatCountLabel("posts.bulk_edit.apply_to", selectedPosts.size)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default BulkEditPostModal;