import React, { useState, useCallback, useEffect } from 'react';
import { X, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { bulkUpdatePostsForApp } from '../api/postsForApp';
import CreatorAutoComplete from './CreatorAutoComplete';
import TagCategorySelector from './TagCategorySelector';
import usePostTagCategories from '../hooks/usePostTagCategories';
import { usePostForAppSocket } from '../context/PostForAppSocketContext';
import type { Creator } from './creators/CreatorList';

interface BulkEditData {
  creator: string | 'random' | null;
  selectedCreator: Creator | null;
  isActive: boolean | null;
  checking: 'ready' | 'null' | 'checked' | 'refused' | null;
  modifyTags: boolean;
  tags: { id?: number; name: string }[];
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
  const { subscribe, unsubscribe, startBulkUpdate } = usePostForAppSocket();
  const { items: availableTags } = usePostTagCategories();
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

  // Subscribe to Socket.IO events when modal opens
  useEffect(() => {
    if (isOpen) {
      subscribe({
        onProgress: (data) => {
          setBulkEditProgress(prev => ({
            current: data.current || prev.current,
            total: data.total || prev.total,
          }));
        },
        onComplete: (data) => {
          setBulkEditLoading(false);
          setBulkEditProgress({ current: 0, total: 0 });
          toast.success(`Successfully updated ${data.success} post${data.success > 1 ? 's' : ''}${data.failed > 0 ? ` (${data.failed} failed)` : ''}`);
          onSuccess();
          closeBulkEdit();
          onDeselectAll();
        },
        onError: (data) => {
          setBulkEditLoading(false);
          setBulkEditProgress({ current: 0, total: 0 });
          toast.error(`Bulk edit error: ${data.error}`);
        },
      });
    } else {
      unsubscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [isOpen, subscribe, unsubscribe, onSuccess, onDeselectAll]);

  // Initialize random tags when modifyTags is enabled
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
      isActive: null,
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
          updateData.creator = bulkEditData.selectedCreator.id.toString();
        }
      }
      if (bulkEditData.isActive !== null) updateData.isDeleted = !bulkEditData.isActive;
      if (bulkEditData.checking !== null) updateData.checking = bulkEditData.checking;
      if (bulkEditData.modifyTags && bulkEditData.tags.length > 0) {
        updateData.tags = bulkEditData.tags.map(t => t.id ? t.id : { name: t.name });
      }

      if (Object.keys(updateData).length === 0) {
        toast.error('No changes to apply');
        setBulkEditLoading(false);
        return;
      }

      // Start bulk update via Socket.IO
      startBulkUpdate(Array.from(selectedPosts));

      // Call the bulk update API (this will trigger Socket.IO events)
      await bulkUpdatePostsForApp(Array.from(selectedPosts), updateData);

      // Note: Success/failure will be handled by Socket.IO callbacks

    } catch (error: any) {
      console.error('Bulk edit error:', error);
      setBulkEditLoading(false);
      setBulkEditProgress({ current: 0, total: 0 });
      toast.error(error?.response?.data?.message || 'An error occurred during bulk edit');
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