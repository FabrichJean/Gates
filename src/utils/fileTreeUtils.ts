import type { FileRecord } from '../types/file';

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: number;
  modified?: string;
  fileRecord?: FileRecord;
  children: FileTreeNode[];
  parent?: FileTreeNode;
  isExpanded?: boolean;
}

/**
 * Build a file tree structure from flat file records using node_path
 */
export function buildFileTree(files: FileRecord[]): FileTreeNode {
  const root: FileTreeNode = {
    id: 'root',
    name: 'Root',
    path: '',
    type: 'folder',
    children: [],
    isExpanded: true
  };

  const nodeMap = new Map<string, FileTreeNode>();
  nodeMap.set('', root);

  // Sort files by path depth to ensure parent folders are created first
  const sortedFiles = files.sort((a, b) => {
    const depthA = a.node_path.split('/').filter(p => p).length;
    const depthB = b.node_path.split('/').filter(p => p).length;
    return depthA - depthB;
  });

  for (const file of sortedFiles) {
    const pathParts = file.node_path.split('/').filter(p => p);
    let currentPath = '';
    
    // Create all parent directories if they don't exist
    for (let i = 0; i < pathParts.length - 1; i++) {
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i];
      
      if (!nodeMap.has(currentPath)) {
        const folderNode: FileTreeNode = {
          id: `folder-${currentPath}`,
          name: pathParts[i],
          path: currentPath,
          type: 'folder',
          children: [],
          isExpanded: false
        };
        
        nodeMap.set(currentPath, folderNode);
        
        const parent = nodeMap.get(parentPath);
        if (parent) {
          parent.children.push(folderNode);
          folderNode.parent = parent;
        }
      }
    }
    
    // Add the file
    const fileName = pathParts[pathParts.length - 1];
    if (fileName === '.void') {
      continue;
    }
    const filePath = file.node_path;
    const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : '';
    
    const fileNode: FileTreeNode = {
      id: `file-${file.id}`,
      name: fileName,
      path: filePath,
      type: 'file',
      extension: getFileExtension(fileName),
      size: file.size || undefined,
      modified: file.updatedAt,
      fileRecord: file,
      children: []
    };
    
    const parent = nodeMap.get(parentPath);
    if (parent) {
      parent.children.push(fileNode);
      fileNode.parent = parent;
    }
  }

  // Sort children alphabetically (folders first)
  sortTreeNodes(root);
  
  return root;
}

/**
 * Recursively sort tree nodes (folders first, then alphabetically)
 */
function sortTreeNodes(node: FileTreeNode) {
  node.children.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });
  
  node.children.forEach(sortTreeNodes);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string | undefined {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : undefined;
}

/**
 * Get appropriate icon for file type
 */
export function getFileIcon(type: 'file' | 'folder', extension?: string, isExpanded?: boolean): string {
  if (type === 'folder') {
    return isExpanded ? '📂' : '📁';
  }
  
  switch (extension?.toLowerCase()) {
    case 'pdf': return '📄';
    case 'doc': case 'docx': return '📝';
    case 'xls': case 'xlsx': case 'csv': return '📊';
    case 'ppt': case 'pptx': return '📈';
    case 'txt': case 'md': case 'readme': return '📃';
    case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': case 'svg': case 'webp': return '🖼️';
    case 'mp4': case 'avi': case 'mov': case 'wmv': case 'flv': case 'webm': return '🎥';
    case 'mp3': case 'wav': case 'flac': case 'aac': case 'm4a': return '🎵';
    case 'zip': case 'rar': case '7z': case 'tar': case 'gz': return '🗜️';
    case 'js': case 'ts': case 'jsx': case 'tsx': return '📜';
    case 'html': case 'htm': case 'css': return '🌐';
    case 'json': case 'xml': case 'yaml': case 'yml': return '⚙️';
    case 'exe': case 'msi': case 'dmg': case 'pkg': return '💾';
    default: return '📄';
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Format date for display
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Find a node in the tree by path
 */
export function findNodeByPath(root: FileTreeNode, path: string): FileTreeNode | null {
  if (root.path === path) return root;
  
  for (const child of root.children) {
    const found = findNodeByPath(child, path);
    if (found) return found;
  }
  
  return null;
}

/**
 * Get all files in a folder (non-recursive)
 */
export function getFilesInFolder(node: FileTreeNode): FileTreeNode[] {
  return node.children.filter(child => child.type === 'file');
}

/**
 * Get all subfolders in a folder
 */
export function getSubfolders(node: FileTreeNode): FileTreeNode[] {
  return node.children.filter(child => child.type === 'folder');
}

/**
 * Get breadcrumb path from root to node
 */
export function getBreadcrumbPath(node: FileTreeNode): FileTreeNode[] {
  const path: FileTreeNode[] = [];
  let current: FileTreeNode | undefined = node;
  
  while (current && current.id !== 'root') {
    path.unshift(current);
    current = current.parent;
  }
  
  return path;
}