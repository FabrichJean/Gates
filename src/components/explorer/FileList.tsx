import React from 'react';
import { FileRow } from './FileRow';
import type { FileTreeNode } from '../../types/file';

interface FileListProps {
  files: FileTreeNode[];
  selectedFiles: Set<string>;
  onFileSelect: (fileId: string) => void;
  onFileDoubleClick: (fileId: string) => void;
  onFileClick?: (fileId: string, event: React.MouseEvent) => void;
  emptyMessage?: string;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedFiles,
  onFileSelect,
  onFileDoubleClick,
  onFileClick,
  emptyMessage = 'No files found'
}) => {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-500 dark:text-gray-400">
        <div className="text-3xl">🗂️</div>
        <div className="text-sm">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="grid grid-cols-[24px_1fr_80px_90px_70px] gap-2 items-center 
        px-2 py-2 border-b border-gray-200 dark:border-gray-700 
        text-xs font-medium text-gray-500 dark:text-gray-400">
        <div></div>
        <div>Name</div>
        <div>Type</div>
        <div>Modified</div>
        <div className="text-right">Size</div>
      </div>

      {/* Files */}
      <div className="flex flex-col">
        {files.map(file => (
          <FileRow
            key={file.id}
            file={file}
            isSelected={selectedFiles.has(file.id)}
            onSelect={onFileSelect}
            onDoubleClick={onFileDoubleClick}
            onClick={onFileClick}
          />
        ))}
      </div>
    </div>
  );
};