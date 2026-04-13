import React from 'react';
import { useFileExplorer } from '../hooks/useFileExplorer';

export const ExplorerTestHook: React.FC = () => {
  console.log('ExplorerTestHook: Rendering...');
  
  const {
    currentDrive,
    availableDrives,
    viewMode,
    searchQuery,
    selectedCount
  } = useFileExplorer();
  
  console.log('ExplorerTestHook: Hook data:', {
    currentDrive: currentDrive?.name,
    availableDrives: availableDrives.length,
    viewMode,
    searchQuery,
    selectedCount
  });
  
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            File Explorer (Hook Test)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Testing useFileExplorer hook for infinite loops
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="space-y-4">
            <div>
              <strong>Current Drive:</strong> {currentDrive?.name || 'None'}
            </div>
            <div>
              <strong>Available Drives:</strong> {availableDrives.length}
            </div>
            <div>
              <strong>View Mode:</strong> {viewMode}
            </div>
            <div>
              <strong>Search Query:</strong> "{searchQuery}"
            </div>
            <div>
              <strong>Selected Count:</strong> {selectedCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};