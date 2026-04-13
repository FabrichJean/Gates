import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  path: Array<{ name: string; index: number }>;
  onNavigate: (index: number) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  path,
  onNavigate
}) => {
  if (path.length === 0) return null;

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700 
      text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
      {path.map((segment, index) => (
        <React.Fragment key={`${segment.name}-${segment.index}`}>
          {index > 0 && (
            <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-500" />
          )}
          <button
            onClick={() => onNavigate(segment.index)}
            className={`
              px-2 py-1 rounded text-sm transition-colors duration-150
              ${index === path.length - 1 
                ? 'text-gray-900 dark:text-gray-100 font-medium cursor-default'
                : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }
            `}
            disabled={index === path.length - 1}
          >
            {segment.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};