import { useState, useCallback, useMemo } from 'react';
import type { 
  FileExplorerState, 
  DriveInfo, 
  FileTreeNode, 
  FileRecord 
} from '../types/file';
import { 
  createDefaultDrives,
  fileRecordToTreeNode,
  searchFiles,
  sortFiles
} from '../utils/fileUtils';

/**
 * Hook for managing file explorer UI state and interactions
 */
export function useFileExplorer() {
  // Memoize the default drives to prevent recreating on every render
  const defaultDrives = useMemo(() => createDefaultDrives(), []);
  
  const [state, setState] = useState<FileExplorerState>(() => {
    return {
      currentDrive: defaultDrives[0], // Default to first drive (Personal)
      pathStack: [],
      selectedFiles: new Set<string>(),
      viewMode: 'grid',
      searchQuery: '',
      isLoading: false,
      error: null
    };
  });

  /**
   * Select a drive
   */
  const selectDrive = useCallback((driveId: string) => {
    const drive = defaultDrives.find(d => d.id === driveId);
    
    if (drive) {
      setState(prev => ({
        ...prev,
        currentDrive: drive,
        pathStack: [], // Reset path when switching drives
        selectedFiles: new Set(), // Clear selection
        searchQuery: '', // Clear search
        error: null
      }));
    }
  }, [defaultDrives]);

  /**
   * Navigate to a specific path in the current drive
   */
  const navigateToPath = useCallback((pathIndex: number) => {
    setState(prev => ({
      ...prev,
      pathStack: pathIndex < 0 ? [] : prev.pathStack.slice(0, pathIndex + 1),
      selectedFiles: new Set(), // Clear selection when navigating
      error: null
    }));
  }, []);

  /**
   * Enter a folder
   */
  const enterFolder = useCallback((folderName: string) => {
    setState(prev => ({
      ...prev,
      pathStack: [...prev.pathStack, folderName],
      selectedFiles: new Set(), // Clear selection when entering folder
      error: null
    }));
  }, []);

  /**
   * Go back to parent directory
   */
  const goBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      pathStack: prev.pathStack.slice(0, -1),
      selectedFiles: new Set(),
      error: null
    }));
  }, []);

  /**
   * Toggle file selection
   */
  const toggleFileSelection = useCallback((fileId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedFiles);
      
      if (newSelected.has(fileId)) {
        newSelected.delete(fileId);
      } else {
        newSelected.add(fileId);
      }
      
      return {
        ...prev,
        selectedFiles: newSelected
      };
    });
  }, []);

  /**
   * Select multiple files
   */
  const selectFiles = useCallback((fileIds: string[]) => {
    setState(prev => ({
      ...prev,
      selectedFiles: new Set([...prev.selectedFiles, ...fileIds])
    }));
  }, []);

  /**
   * Clear all file selections
   */
  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedFiles: new Set()
    }));
  }, []);

  /**
   * Select all files
   */
  const selectAll = useCallback((files: FileTreeNode[]) => {
    const fileIds = files.map(f => f.id);
    setState(prev => ({
      ...prev,
      selectedFiles: new Set(fileIds)
    }));
  }, []);

  /**
   * Toggle view mode between grid and list
   */
  const toggleViewMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      viewMode: prev.viewMode === 'grid' ? 'list' : 'grid'
    }));
  }, []);

  /**
   * Set view mode explicitly
   */
  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    setState(prev => ({
      ...prev,
      viewMode: mode
    }));
  }, []);

  /**
   * Update search query
   */
  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      selectedFiles: new Set() // Clear selection when searching
    }));
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading
    }));
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error
    }));
  }, []);

  /**
   * Process and filter files based on current state
   */
  const processFiles = useCallback((
    files: FileRecord[],
    sortBy: 'name' | 'size' | 'modified' | 'type' = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): FileTreeNode[] => {
    // Convert FileRecord to FileTreeNode
    let processedFiles = files.map(fileRecordToTreeNode);
    
    // Apply search filter
    if (state.searchQuery.trim()) {
      processedFiles = searchFiles(processedFiles, state.searchQuery);
    }
    
    // Apply sorting
    processedFiles = sortFiles(processedFiles, sortBy, sortOrder);
    
    return processedFiles;
  }, [state.searchQuery]); // Only depend on searchQuery since sortBy and sortOrder are parameters

  /**
   * Get current breadcrumb path
   */
  const breadcrumbPath = useMemo(() => {
    if (!state.currentDrive) return [];
    
    const parts = [
      { name: state.currentDrive.name, index: -1 }
    ];
    
    state.pathStack.forEach((path, index) => {
      parts.push({ name: path, index });
    });
    
    return parts;
  }, [state.currentDrive, state.pathStack]);

  /**
   * Get selected files count
   */
  const selectedCount = state.selectedFiles.size;

  /**
   * Check if a file is selected
   */
  const isFileSelected = useCallback((fileId: string) => {
    return state.selectedFiles.has(fileId);
  }, [state.selectedFiles]);

  /**
   * Get available drives
   */
  const availableDrives = defaultDrives;

  /**
   * Get current path string
   */
  const currentPath = useMemo(() => {
    if (!state.currentDrive) return '';
    
    const basePath = `/${state.currentDrive.name}`;
    if (state.pathStack.length === 0) return basePath;
    
    return `${basePath}/${state.pathStack.join('/')}`;
  }, [state.currentDrive, state.pathStack]);

  /**
   * Reset explorer state
   */
  const reset = useCallback(() => {
    setState({
      currentDrive: defaultDrives[0],
      pathStack: [],
      selectedFiles: new Set(),
      viewMode: 'grid',
      searchQuery: '',
      isLoading: false,
      error: null
    });
  }, [defaultDrives]);

  return {
    // State
    ...state,
    
    // Computed values
    breadcrumbPath,
    selectedCount,
    availableDrives,
    currentPath,
    
    // Drive operations
    selectDrive,
    
    // Navigation operations
    navigateToPath,
    enterFolder,
    goBack,
    
    // Selection operations
    toggleFileSelection,
    selectFiles,
    clearSelection,
    selectAll,
    isFileSelected,
    
    // View operations
    toggleViewMode,
    setViewMode,
    setSearchQuery,
    
    // State operations
    setLoading,
    setError,
    reset,
    
    // File processing
    processFiles
  };
}