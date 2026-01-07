import React from 'react';
import clsx from 'clsx';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

type Props = {
  platform: { id: number; name: string };
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const PlatformCard: React.FC<Props> = ({ platform, selected, onSelect, onEdit, onDelete }) => (
  <div
    className={clsx(
      'group flex items-center justify-between rounded-xl p-3 transition',
      selected ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
    )}
  >
    <button
      onClick={onSelect}
      className="flex flex-1 items-center gap-3 text-left"
      aria-current={selected}
    >
      <span
        className={clsx(
          'h-3 w-3 rounded-full border-2',
          selected ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent border-gray-400'
        )}
      />
      <span className="font-medium text-gray-800 dark:text-gray-100">{platform.name}</span>
    </button>

    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
      <button
        onClick={onEdit}
        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
        aria-label="Edit"
      >
        <PencilIcon className="w-4 h-4" />
      </button>
      <button
        onClick={onDelete}
        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
        aria-label="Delete"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  </div>
);