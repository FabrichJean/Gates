import React from 'react';
import { FileCard } from './FileCard';
import type { FileTreeNode } from '../../types/file';

interface FileGridProps {
  files: FileTreeNode[];
  selectedFiles: Set<string>;
  onFileSelect: (fileId: string) => void;
  onFileDoubleClick: (fileId: string) => void;
  onFileClick?: (fileId: string, event: React.MouseEvent) => void;
  emptyMessage?: string;
}

export const FileGrid: React.FC<FileGridProps> = ({
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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3 p-1">
      {files.map(file => (
        <FileCard
          key={file.id}
          file={file}
          isSelected={selectedFiles.has(file.id)}
          onSelect={onFileSelect}
          onDoubleClick={onFileDoubleClick}
          onClick={onFileClick}
        />
      ))}
    </div>
  );
};