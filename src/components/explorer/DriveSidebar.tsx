import React from 'react';
import type { DriveInfo } from '../../types/file';

interface DriveSidebarProps {
  drives: DriveInfo[];
  currentDrive: DriveInfo | null;
  onDriveSelect: (driveId: string) => void;
}

export const DriveSidebar: React.FC<DriveSidebarProps> = ({
  drives,
  currentDrive,
  onDriveSelect
}) => {
  const myDrives = drives.slice(0, 3); // Personal, Work, Shared
  const quickAccess = drives.slice(3); // Recent, Starred, Trash

  return (
    <div className="flex flex-col gap-2 p-3">
      {/* My Drives Section */}
      <div>
        <div className="text-xs font-medium text-gray-400 dark:text-gray-500 
          uppercase tracking-wider px-2 py-1 mb-1">
          My Drives
        </div>
        <div className="flex flex-col gap-1">
          {myDrives.map(drive => (
            <DriveItem
              key={drive.id}
              drive={drive}
              isActive={currentDrive?.id === drive.id}
              onSelect={() => onDriveSelect(drive.id)}
            />
          ))}
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="mt-3">
        <div className="text-xs font-medium text-gray-400 dark:text-gray-500 
          uppercase tracking-wider px-2 py-1 mb-1">
          Quick Access
        </div>
        <div className="flex flex-col gap-1">
          {quickAccess.map(drive => (
            <DriveItem
              key={drive.id}
              drive={drive}
              isActive={currentDrive?.id === drive.id}
              onSelect={() => onDriveSelect(drive.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface DriveItemProps {
  drive: DriveInfo;
  isActive: boolean;
  onSelect: () => void;
}

const DriveItem: React.FC<DriveItemProps> = ({
  drive,
  isActive,
  onSelect
}) => {
  return (
    <div
      onClick={onSelect}
      className={`
        flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer
        transition-all duration-200
        ${isActive 
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
        }
      `}
    >
      {/* Drive icon */}
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center text-sm"
        style={{ backgroundColor: drive.color }}
      >
        {drive.icon}
      </div>

      {/* Drive info */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">
          {drive.name}
        </div>
        <div className="text-xs opacity-75 truncate">
          {drive.description}
        </div>
      </div>
    </div>
  );
};