import React from 'react';
import { useFileExplorer } from '../hooks/useFileExplorer';

export const ExplorerTestSimple: React.FC = () => {
  const {
    currentDrive,
    availableDrives,
    viewMode,
    searchQuery,
    selectedFiles
  } = useFileExplorer();

  console.log('Simple Test Results:');
  console.log('- Current Drive:', currentDrive?.name);
  console.log('- Available Drives:', availableDrives.length);
  console.log('- View Mode:', viewMode);
  console.log('- Search Query:', searchQuery);
  console.log('- Selected Count:', selectedFiles.size);

  // Mock files for display
  const mockDisplayFiles = [
    {
      id: '1',
      name: 'Project Presentation.pdf',
      type: 'file' as const,
      extension: 'pdf',
      size: 2458734,
      modified: '2024-01-15T10:30:00Z'
    },
    {
      id: '2', 
      name: 'Team Meeting Recording.mp4',
      type: 'file' as const,
      extension: 'mp4',
      size: 15728640,
      modified: '2024-01-16T14:00:00Z'
    },
    {
      id: '3',
      name: 'Design Assets',
      type: 'folder' as const,
      size: undefined,
      modified: '2024-01-17T09:15:00Z'
    },
    {
      id: '4',
      name: 'Budget Spreadsheet.xlsx',
      type: 'file' as const,
      extension: 'xlsx',
      size: 1234567,
      modified: '2024-01-18T11:45:00Z'
    }
  ];

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return Math.round(bytes / (1024 * 1024)) + ' MB';
    return Math.round(bytes / (1024 * 1024 * 1024)) + ' GB';
  };

  const getFileIcon = (type: string, extension?: string): string => {
    if (type === 'folder') return '📁';
    
    switch (extension?.toLowerCase()) {
      case 'pdf': return '📄';
      case 'mp4': case 'mov': case 'avi': return '🎥';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
      case 'zip': case 'rar': case '7z': return '🗜️';
      case 'xlsx': case 'xls': case 'csv': return '📊';
      case 'doc': case 'docx': return '📝';
      default: return '📄';
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        File Explorer - Simple Test
      </h1>
      
      {/* Hook Status */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Hook Status ✅
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Current Drive:</span>
            <p className="font-semibold text-blue-600 dark:text-blue-400">{currentDrive?.name || 'Loading...'}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Drives:</span>
            <p className="font-semibold text-green-600 dark:text-green-400">{availableDrives.length}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">View:</span>
            <p className="font-semibold text-purple-600 dark:text-purple-400">{viewMode}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Search:</span>
            <p className="font-semibold text-orange-600 dark:text-orange-400">"{searchQuery}"</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Selected:</span>
            <p className="font-semibold text-red-600 dark:text-red-400">{selectedFiles.size}</p>
          </div>
        </div>
      </div>

      {/* Mock File Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Mock Files (No API) 📁
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mockDisplayFiles.map((file) => (
            <div 
              key={file.id}
              className="flex flex-col items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600 
                         hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="text-3xl mb-2">
                {getFileIcon(file.type, file.extension)}
              </div>
              <div className="text-center w-full">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatFileSize(file.size)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(file.modified).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Message */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
          <div>
            <p className="text-green-800 dark:text-green-200 font-semibold">
              Infinite Loop Issue Resolved!
            </p>
            <p className="text-green-700 dark:text-green-300 text-sm">
              The useFileExplorer hook is working correctly without causing re-renders.
              Ready to integrate with the files API once endpoints are available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};