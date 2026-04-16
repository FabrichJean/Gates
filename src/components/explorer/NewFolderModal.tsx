import React from "react";

interface NewFolderModalProps {
  open: boolean;
  value: string;
  loading: boolean;
  error: string;
  onChange: (v: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

const NewFolderModal: React.FC<NewFolderModalProps> = ({
  open,
  value,
  loading,
  error,
  onChange,
  onClose,
  onCreate,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-xs relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
          onClick={onClose}
          aria-label="Close new folder modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Create New Folder</h2>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Folder name"
          className="w-full px-3 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          disabled={loading}
          onKeyDown={e => { if (e.key === 'Enter') onCreate(); }}
        />
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={onClose}
            disabled={loading}
          >Cancel</button>
          <button
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
            onClick={onCreate}
            disabled={loading || !value.trim()}
          >{loading ? 'Creating...' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
};

export default NewFolderModal;
