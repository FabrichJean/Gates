import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Upload, 
  Search, 
  Grid3X3, 
  List,
  MoreHorizontal,
  X
} from 'lucide-react';
import { DriveSidebar } from './DriveSidebar';
import { Breadcrumb } from './Breadcrumb';
import { FileGrid } from './FileGrid';
import { FileList } from './FileList';
import { FileUpload } from './FileUpload';
import { useFiles } from '../../hooks/useFiles';
import { useFileExplorer } from '../../hooks/useFileExplorer';
import { useAuthMe } from '../../hooks/useAuth';
import type { FileTreeNode } from '../../types/file';

interface FileExplorerProps {
  className?: string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  className = '' 
}) => {
  const { data: user } = useAuthMe();
  const [showUpload, setShowUpload] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'id' | 'node_path' | 'size'>('node_path');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const {
    // State
    currentDrive,
    pathStack,
    selectedFiles,
    viewMode,
    searchQuery,
    isLoading: explorerLoading,
    error: explorerError,
    
    // Computed
    breadcrumbPath,
    selectedCount,
    availableDrives,
    
    // Actions
    selectDrive,
    navigateToPath,
    enterFolder,
    toggleFileSelection,
    clearSelection,
    selectAll,
    isFileSelected,
    setViewMode,
    setSearchQuery,
    setError,
    processFiles
  } = useFileExplorer();

  // Memoize the files query to prevent unnecessary re-renders
  const filesQuery = useMemo(() => ({
    page: 1,
    limit: 100,
    search: searchQuery || undefined,
    sortBy: sortBy,
    sortOrder: sortOrder.toUpperCase() as 'ASC' | 'DESC',
    // Add drive-specific filtering logic here
    user_id: currentDrive?.id === 'personal' ? user?.id : undefined,
    target_user: currentDrive?.id === 'shared' ? user?.id : undefined,
  }), [
    searchQuery,
    sortBy,
    sortOrder,
    currentDrive?.id,
    user?.id
  ]);

  const { 
    files: rawFiles, 
    isLoading: filesLoading, 
    isError: filesError, 
    error: filesErrorObj,
    refetch 
  } = useFiles(filesQuery);

  const isLoading = explorerLoading || filesLoading;
  
  // Process files for display
  const uiSortBy = sortBy === 'node_path' ? 'name' : sortBy === 'updatedAt' ? 'modified' : sortBy as 'name' | 'size' | 'modified' | 'type';
  const processedFiles = processFiles(rawFiles, uiSortBy, sortOrder);

  // Handle file double-click (open folder or file)
  const handleFileDoubleClick = (fileId: string) => {
    const file = processedFiles.find(f => f.id === fileId);
    if (!file) return;

    if (file.type === 'folder') {
      enterFolder(file.name);
    } else {
      // Handle file opening (download, preview, etc.)
      console.log('Open file:', file);
    }
  };

  // Handle file single click
  const handleFileClick = (fileId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      toggleFileSelection(fileId);
    } else if (event.shiftKey && selectedFiles.size > 0) {
      // Range select with Shift
      // Implementation for range selection would go here
      toggleFileSelection(fileId);
    } else {
      // Single select
      clearSelection();
      toggleFileSelection(fileId);
    }
  };

  // Handle successful upload
  const handleUploadComplete = (uploadedFiles: any[]) => {
    refetch(); // Refresh file list
    setShowUpload(false);
    setError(null);
  };

  // Handle upload error
  const handleUploadError = (error: string) => {
    setError(error);
  };

  // Update search with debounce
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, setSearchQuery]);

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 p-4 
        border-b border-gray-200 dark:border-gray-700">
        
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium
              bg-blue-600 text-white rounded-md hover:bg-blue-700
              transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
          
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium
              border border-gray-200 dark:border-gray-600 rounded-md
              hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-44 pl-9 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600
                rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                dark:focus:ring-blue-400 dark:focus:border-blue-400"
            />
          </div>

          {/* View Toggle */}
          <div className="flex border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 text-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 text-sm transition-colors border-l border-gray-200 dark:border-gray-600 ${
                viewMode === 'list'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-52 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <DriveSidebar
            drives={availableDrives}
            currentDrive={currentDrive}
            onDriveSelect={selectDrive}
          />
        </div>

        {/* File Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Breadcrumb */}
          <Breadcrumb
            path={breadcrumbPath}
            onNavigate={navigateToPath}
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 
            border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCount > 0 ? `${selectedCount} selected` : '0 selected'}
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-500">
              {processedFiles.length} item{processedFiles.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Files */}
          <div className="flex-1 overflow-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filesError || explorerError ? (
              <div className="flex items-center justify-center h-48 text-red-500 dark:text-red-400">
                Error loading files: {filesErrorObj?.message || explorerError}
              </div>
            ) : viewMode === 'grid' ? (
              <FileGrid
                files={processedFiles}
                selectedFiles={selectedFiles}
                onFileSelect={toggleFileSelection}
                onFileDoubleClick={handleFileDoubleClick}
                onFileClick={handleFileClick}
              />
            ) : (
              <FileList
                files={processedFiles}
                selectedFiles={selectedFiles}
                onFileSelect={toggleFileSelection}
                onFileDoubleClick={handleFileDoubleClick}
                onFileClick={handleFileClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Upload Files
              </h2>
              <button
                onClick={() => setShowUpload(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <FileUpload
                userId={user?.id || 1}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};