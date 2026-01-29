import React, { useState, useCallback } from 'react';
import { X, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { bulkUpdatePostsForApp } from '../api/postsForApp';
import CreatorAutoComplete from './CreatorAutoComplete';
import type { Creator } from './creators/CreatorList';

interface BulkEditData {
  creator: string | 'random' | null;
  selectedCreator: Creator | null;
  isActive: boolean | null;
  checking: 'ready' | 'null' | 'checked' | 'refused' | null;
  modifyTags: boolean;
  tags: (number | { name: string })[];
}

interface BulkEditModalProps {
  isOpen: boolean;
  selectedPosts: Set<number>;
  onClose: () => void;
  onSuccess: () => void;
  onDeselectAll: () => void;
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  selectedPosts,
  onClose,
  onSuccess,
  onDeselectAll,
}) => {
  const [bulkEditData, setBulkEditData] = useState<BulkEditData>({
    creator: null,
    selectedCreator: null,
    isActive: null,
    checking: null,
    modifyTags: false,
    tags: [],
  });
  const [bulkEditLoading, setBulkEditLoading] = useState(false);
  const [bulkEditProgress, setBulkEditProgress] = useState({ current: 0, total: 0 });

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

  const closeBulkEdit = () => {
    setBulkEditData({
      creator: null,
      selectedCreator: null,
      isActive: null,
      checking: null,
      modifyTags: false,
      tags: [],
    });
    setBulkEditProgress({ current: 0, total: 0 });
    onClose();
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
          updateData.creator = bulkEditData.selectedCreator.id.toString();
        }
      }
      if (bulkEditData.isActive !== null) updateData.isDeleted = !bulkEditData.isActive;
      if (bulkEditData.checking !== null) updateData.checking = bulkEditData.checking;
      if (bulkEditData.modifyTags && bulkEditData.tags.length > 0) {
        updateData.tag_category_ids = bulkEditData.tags.map(t => (typeof t === 'number' ? t : (t as any).id ?? (t as any).name));
      }

      if (Object.keys(updateData).length === 0) {
        toast.error('No changes to apply');
        setBulkEditLoading(false);
        return;
      }

      // Call the bulk update API
      await bulkUpdatePostsForApp(Array.from(selectedPosts), updateData);

      toast.success(`Successfully updated ${selectedPosts.size} post${selectedPosts.size > 1 ? 's' : ''}`);
      onSuccess();
      closeBulkEdit();
      onDeselectAll();

    } catch (error: any) {
      console.error('Bulk edit error:', error);
      toast.error(error?.response?.data?.message || 'An error occurred during bulk edit');
    } finally {
      setBulkEditLoading(false);
      setBulkEditProgress({ current: 0, total: 0 });
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Bulk Edit Posts ({selectedPosts.size} selected)</h3>

        <div className="space-y-4">
          {/* Creator Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Creator
            </label>
            <div className="space-y-2">
              <CreatorAutoComplete
                value={bulkEditData.creator === 'random' ? '' : (bulkEditData.creator || '')}
                onChange={handleCreatorChange}
                onSelect={handleCreatorSelect}
                placeholder="Select creator or leave empty to keep current"
                disabled={bulkEditLoading || bulkEditData.creator === 'random'}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={bulkEditData.creator === 'random'}
                  onChange={(e) => setBulkEditData(prev => ({
                    ...prev,
                    creator: e.target.checked ? 'random' : null,
                    selectedCreator: e.target.checked ? null : prev.selectedCreator
                  }))}
                  className="checkbox checkbox-sm"
                  disabled={bulkEditLoading}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Use random creator</span>
              </div>
            </div>
          </div>

          {/* Activation Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Activation Status
            </label>
            <select
              value={bulkEditData.isActive === null ? '' : bulkEditData.isActive.toString()}
              onChange={(e) => setBulkEditData(prev => ({
                ...prev,
                isActive: e.target.value === '' ? null : e.target.value === 'true'
              }))}
              className="select select-bordered w-full"
            >
              <option value="">Keep current status</option>
              <option value="true">Activate</option>
              <option value="false">Deactivate</option>
            </select>
          </div>

          {/* Checking Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Checking Status
            </label>
            <select
              value={bulkEditData.checking === null ? '' : bulkEditData.checking}
              onChange={(e) => setBulkEditData(prev => ({
                ...prev,
                checking: e.target.value === '' ? null : e.target.value as 'ready' | 'null' | 'checked' | 'refused'
              }))}
              className="select select-bordered w-full"
            >
              <option value="">Keep current status</option>
              <option value="null">Not Ready</option>
              <option value="checked">Checked</option>
              <option value="waiting for checking">Waiting for Checking</option>
              <option value="refused">Refused</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={bulkEditData.modifyTags}
                onChange={(e) => setBulkEditData(prev => ({ ...prev, modifyTags: e.target.checked }))}
                className="checkbox"
              />
              <span className="text-sm">Modify tags</span>
            </div>
            {bulkEditData.modifyTags && (
              <div>
                {/* TODO: Add tag selection component */}
                <div className="flex flex-wrap gap-2">
                  {bulkEditData.tags.map((tag, index) => (
                    <div key={index} className="badge badge-outline gap-2">
                      {typeof tag === 'number' ? `Tag ${tag}` : tag.name}
                      <button
                        onClick={() => handleTagDeselect(tag)}
                        className="btn btn-xs btn-circle btn-ghost"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        {bulkEditLoading && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(bulkEditProgress.current / bulkEditProgress.total) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">
                {bulkEditProgress.current}/{bulkEditProgress.total}
              </span>
            </div>
            <p className="text-sm text-gray-600">Processing bulk edit...</p>
          </div>
        )}

        <div className="modal-action">
          <button
            className="btn btn-outline"
            onClick={closeBulkEdit}
            disabled={bulkEditLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleBulkEditSubmit}
            disabled={bulkEditLoading || selectedPosts.size === 0}
          >
            {bulkEditLoading ? 'Processing...' : `Apply Changes (${selectedPosts.size})`}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default BulkEditModal;