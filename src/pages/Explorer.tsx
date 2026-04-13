import React from 'react';
import { ProfessionalFileExplorer } from '../components/explorer/ProfessionalFileExplorer';
import { ApiConnectionTest } from '../components/ApiConnectionTest';

export const Explorer: React.FC = () => {
  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* API Status */}
      <div className="p-4 pb-2">
        <ApiConnectionTest />
      </div>
      
      {/* File Explorer */}
      <div className="flex-1 px-4 pb-4">
        <ProfessionalFileExplorer />
      </div>
    </div>
  );
};