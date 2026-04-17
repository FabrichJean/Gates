import React from 'react';

export const ExplorerDebug: React.FC = () => {
  console.log('ExplorerDebug: Rendering...');
  
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            File Explorer (Debug Mode)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            This is a simplified version to test for infinite loops
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              📁
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Debug version loaded successfully. No hooks causing infinite loops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};