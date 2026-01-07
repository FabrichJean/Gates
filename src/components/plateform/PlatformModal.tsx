import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

type Props = {
  open: boolean;
  platform?: { id: number; name: string; video_sync_url?: string; post_sync_url?: string };
  onClose: () => void;
  onSave: (p: { name: string; video_sync_url?: string; post_sync_url?: string }) => void;
};

export const PlatformModal: React.FC<Props> = ({ open, platform, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [postUrl, setPostUrl] = useState('');

  useEffect(() => {
    if (platform) {
      setName(platform.name);
      setVideoUrl(platform.video_sync_url ?? '');
      setPostUrl(platform.post_sync_url ?? '');
    } else {
      setName('');
      setVideoUrl('');
      setPostUrl('');
    }
  }, [platform, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-cardLight dark:bg-cardDark p-6 shadow-xl animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {platform ? 'Edit platform' : 'Add platform'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
        <input
          className="w-full mb-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Video sync URL</label>
        <input
          className="w-full mb-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />

        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Post sync URL</label>
        <input
          className="w-full mb-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ name, video_sync_url: videoUrl, post_sync_url: postUrl })}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primaryHover"
          >
            {platform ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};