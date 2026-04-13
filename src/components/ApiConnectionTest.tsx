import React, { useState, useEffect } from 'react';
import { filesAPI } from '../api/files';
import { apiURL } from '../constant';

export const ApiConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<{
    connection: 'testing' | 'connected' | 'error';
    apiUrl: string;
    error?: string;
    testResults?: any;
  }>({
    connection: 'testing',
    apiUrl: apiURL
  });

  useEffect(() => {
    const testConnection = async () => {
      try {
        setStatus(prev => ({ ...prev, connection: 'testing' }));
        
        // Test basic file listing endpoint
        const response = await filesAPI.getFiles({ page: 1, limit: 5 });
        
        setStatus({
          connection: 'connected',
          apiUrl: apiURL,
          testResults: {
            success: response.success,
            dataCount: response.data?.length || 0,
            pagination: response.pagination,
            message: response.message
          }
        });
      } catch (error: any) {
        setStatus({
          connection: 'error',
          apiUrl: apiURL,
          error: error.message || 'Connection failed'
        });
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        API Connection Status
      </h3>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">API URL:</span>
          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {status.apiUrl}
          </code>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
          <div className="flex items-center space-x-2">
            {status.connection === 'testing' && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-600 dark:text-blue-400">Testing connection...</span>
              </>
            )}
            {status.connection === 'connected' && (
              <>
                <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">Connected</span>
              </>
            )}
            {status.connection === 'error' && (
              <>
                <span className="text-red-600 dark:text-red-400 text-lg">❌</span>
                <span className="text-red-600 dark:text-red-400 font-semibold">Connection Failed</span>
              </>
            )}
          </div>
        </div>
        
        {status.error && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
            <p className="text-red-800 dark:text-red-200 text-sm">
              <strong>Error:</strong> {status.error}
            </p>
          </div>
        )}
        
        {status.testResults && (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
            <div className="text-sm space-y-1">
              <p className="text-green-800 dark:text-green-200">
                <strong>Success:</strong> {status.testResults.success ? 'Yes' : 'No'}
              </p>
              <p className="text-green-800 dark:text-green-200">
                <strong>Files Found:</strong> {status.testResults.dataCount}
              </p>
              <p className="text-green-800 dark:text-green-200">
                <strong>Message:</strong> {status.testResults.message}
              </p>
              {status.testResults.pagination && (
                <p className="text-green-800 dark:text-green-200">
                  <strong>Total:</strong> {status.testResults.pagination.total} files
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};