import type { FileRecord, FileTreeNode, DriveInfo } from '../types/file';

/**
 * File extension mappings for icons and colors
 */
export const FILE_ICONS: Record<string, string> = {
  // Documents
  pdf: '📄',
  doc: '📝',
  docx: '📝',
  txt: '📃',
  rtf: '📝',
  odt: '📝',
  
  // Spreadsheets
  xls: '📊',
  xlsx: '📊',
  csv: '📊',
  ods: '📊',
  
  // Presentations
  ppt: '📑',
  pptx: '📑',
  odp: '📑',
  
  // Images
  jpg: '🖼️',
  jpeg: '🖼️',
  png: '🖼️',
  gif: '🖼️',
  bmp: '🖼️',
  svg: '🖼️',
  ico: '🖼️',
  webp: '🖼️',
  
  // Videos
  mp4: '🎬',
  avi: '🎬',
  mov: '🎬',
  mkv: '🎬',
  wmv: '🎬',
  flv: '🎬',
  webm: '🎬',
  
  // Audio
  mp3: '🎵',
  wav: '🎵',
  flac: '🎵',
  aac: '🎵',
  ogg: '🎵',
  wma: '🎵',
  
  // Archives
  zip: '📦',
  rar: '📦',
  '7z': '📦',
  tar: '📦',
  gz: '📦',
  bz2: '📦',
  
  // Code
  js: '📄',
  ts: '📄',
  jsx: '📄',
  tsx: '📄',
  html: '📄',
  css: '📄',
  scss: '📄',
  json: '📄',
  xml: '📄',
  md: '📄',
  yml: '📄',
  yaml: '📄',
  
  // Design
  fig: '🎨',
  sketch: '🎨',
  ai: '🎨',
  psd: '🎨',
  
  // Others
  folder: '📁',
  default: '📄'
};

/**
 * File extension color mappings (background colors)
 */
export const FILE_COLORS: Record<string, string> = {
  pdf: '#FCEBEB',
  docx: '#E6F1FB',
  doc: '#E6F1FB',
  xlsx: '#EAF3DE',
  xls: '#EAF3DE',
  pptx: '#FAEEDA',
  ppt: '#FAEEDA',
  zip: '#F1EFE8',
  rar: '#F1EFE8',
  '7z': '#F1EFE8',
  jpg: '#FBEAF0',
  jpeg: '#FBEAF0',
  png: '#FBEAF0',
  gif: '#FBEAF0',
  fig: '#EEEDFE',
  sketch: '#EEEDFE',
  txt: '#F1EFE8',
  md: '#F1EFE8',
  mp4: '#FCF3E8',
  mp3: '#F0F8E8',
  folder: '#F1F5F9',
  default: '#F1F5F9'
};

/**
 * File extension text color mappings
 */
export const FILE_TEXT_COLORS: Record<string, string> = {
  pdf: '#A32D2D',
  docx: '#185FA5',
  doc: '#185FA5',
  xlsx: '#3B6D11',
  xls: '#3B6D11',
  pptx: '#854F0B',
  ppt: '#854F0B',
  zip: '#5F5E5A',
  rar: '#5F5E5A',
  '7z': '#5F5E5A',
  jpg: '#993556',
  jpeg: '#993556',
  png: '#993556',
  gif: '#993556',
  fig: '#3C3489',
  sketch: '#3C3489',
  txt: '#5F5E5A',
  md: '#5F5E5A',
  mp4: '#B8720B',
  mp3: '#4A6B2A',
  folder: '#5F5E5A',
  default: '#5F5E5A'
};

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) return '';
  return filename.substring(lastDot + 1).toLowerCase();
}

/**
 * Get file icon for a given filename or extension
 */
export function getFileIcon(filename: string, isFolder = false): string {
  if (isFolder) return FILE_ICONS.folder;
  
  const ext = getFileExtension(filename);
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

/**
 * Get file color theme for a given filename or extension
 */
export function getFileColors(filename: string, isFolder = false): {
  background: string;
  text: string;
} {
  if (isFolder) {
    return {
      background: FILE_COLORS.folder,
      text: FILE_TEXT_COLORS.folder
    };
  }
  
  const ext = getFileExtension(filename);
  return {
    background: FILE_COLORS[ext] || FILE_COLORS.default,
    text: FILE_TEXT_COLORS[ext] || FILE_TEXT_COLORS.default
  };
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '—';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  const formatted = unitIndex === 0 
    ? size.toString() 
    : size.toFixed(1);
    
  return `${formatted} ${units[unitIndex]}`;
}

/**
 * Format date in relative or absolute format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    // Format as date for older files
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

/**
 * Convert FileRecord to FileTreeNode for UI display
 */
export function fileRecordToTreeNode(file: FileRecord): FileTreeNode {
  const isFolder = false; // Files from API are always files, not folders
  const extension = getFileExtension(file.node_path);
  
  return {
    id: file.id.toString(),
    name: file.node_path,
    type: 'file',
    extension,
    size: file.size || undefined,
    modified: formatDate(file.updatedAt),
    fileRecord: file
  };
}

/**
 * Group files by directory structure (if node_path contains directories)
 */
export function buildFileTree(files: FileRecord[]): FileTreeNode[] {
  const tree: FileTreeNode[] = [];
  const pathMap = new Map<string, FileTreeNode>();
  
  files.forEach(file => {
    const pathParts = file.node_path.split('/').filter(Boolean);
    let currentPath = '';
    let currentLevel = tree;
    
    // Build directory structure
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentPath += (currentPath ? '/' : '') + pathParts[i];
      
      let folderNode = pathMap.get(currentPath);
      if (!folderNode) {
        folderNode = {
          id: `folder-${currentPath}`,
          name: pathParts[i],
          type: 'folder',
          children: []
        };
        pathMap.set(currentPath, folderNode);
        currentLevel.push(folderNode);
      }
      
      currentLevel = folderNode.children!;
    }
    
    // Add the file
    const fileName = pathParts[pathParts.length - 1];
    const fileNode = fileRecordToTreeNode({
      ...file,
      node_path: fileName
    });
    
    currentLevel.push(fileNode);
  });
  
  return tree;
}

/**
 * Create default drive configurations
 */
export function createDefaultDrives(): DriveInfo[] {
  return [
    {
      id: 'personal',
      name: 'Personal',
      icon: '👤',
      color: '#E6F1FB',
      description: 'Personal files'
    },
    {
      id: 'work',
      name: 'Work',
      icon: '💼',
      color: '#E1F5EE',
      description: 'Work files'
    },
    {
      id: 'shared',
      name: 'Shared',
      icon: '🔗',
      color: '#FAEEDA',
      description: 'Shared with you'
    },
    {
      id: 'recent',
      name: 'Recent',
      icon: '🕐',
      color: '#F0F8E8',
      description: 'Recently accessed'
    },
    {
      id: 'starred',
      name: 'Starred',
      icon: '⭐',
      color: '#FCF3E8',
      description: 'Starred files'
    },
    {
      id: 'trash',
      name: 'Trash',
      icon: '🗑️',
      color: '#FBEAF0',
      description: 'Deleted files'
    }
  ];
}

/**
 * Validate file upload requirements
 */
export function validateFileUpload(file: File): {
  isValid: boolean;
  error?: string;
} {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = [
    'image/*',
    'video/*',
    'audio/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/*',
    'application/zip',
    'application/x-rar-compressed'
  ];
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${formatFileSize(maxSize)}`
    };
  }
  
  const isTypeAllowed = allowedTypes.some(type => {
    if (type.endsWith('*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });
  
  if (!isTypeAllowed) {
    return {
      isValid: false,
      error: 'File type not supported'
    };
  }
  
  return { isValid: true };
}

/**
 * Generate unique filename to prevent collisions
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const extension = getFileExtension(originalName);
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  
  return extension 
    ? `${timestamp}_${nameWithoutExt}.${extension}`
    : `${timestamp}_${nameWithoutExt}`;
}

/**
 * Search files by name or content
 */
export function searchFiles(files: FileTreeNode[], query: string): FileTreeNode[] {
  if (!query.trim()) return files;
  
  const searchTerm = query.toLowerCase();
  
  return files.filter(file => {
    // Search in file name
    if (file.name.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Search in file record comment if available
    if (file.fileRecord?.comment?.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Search in file tags if available
    if (file.fileRecord?.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) {
      return true;
    }
    
    return false;
  });
}

/**
 * Sort files by specified criteria
 */
export function sortFiles(
  files: FileTreeNode[], 
  sortBy: 'name' | 'size' | 'modified' | 'type',
  order: 'asc' | 'desc' = 'asc'
): FileTreeNode[] {
  const sorted = [...files].sort((a, b) => {
    // Folders always come first
    if (a.type === 'folder' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'folder') return 1;
    
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
        
      case 'size':
        const sizeA = a.size || 0;
        const sizeB = b.size || 0;
        comparison = sizeA - sizeB;
        break;
        
      case 'modified':
        const dateA = a.fileRecord?.updatedAt || '';
        const dateB = b.fileRecord?.updatedAt || '';
        comparison = new Date(dateA).getTime() - new Date(dateB).getTime();
        break;
        
      case 'type':
        const extA = a.extension || '';
        const extB = b.extension || '';
        comparison = extA.localeCompare(extB);
        break;
        
      default:
        comparison = 0;
    }
    
    return order === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
}