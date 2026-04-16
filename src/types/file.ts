export interface Media {
  id: number;
  s3_path: string | null;
  local_path: string;
  upload_status: number; // 0: Local, 1: S3
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface FileRecord {
  id: number;
  media_id: number;
  user_id: number;
  target_user: number | null;
  node_path: string;
  size: number | null;
  tags: string[];
  comment: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  media?: Media;
  user?: User;
  public_url: string;
  targetUser?: User | null;
}

export interface CreateFileRequest {
  media_id: number;
  user_id: number;
  target_user?: number;
  node_path: string;
  tags?: string[];
  comment?: string;
}

export interface UpdateFileRequest {
  media_id?: number;
  user_id?: number;
  target_user?: number;
  node_path?: string;
  tags?: string[];
  comment?: string;
}

export interface UploadFileRequest {
  file: File;
  target_user?: number;
  tags?: string[];
  comment?: string;
  node_path?: string;
}

export interface FileListQuery {
  page?: number;
  limit?: number;
  media_id?: number;
  user_id?: number;
  target_user?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "id" | "node_path" | "size";
  sortOrder?: "ASC" | "DESC";
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  createdOnDate?: string;
  updatedOnDate?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterInfo {
  sortBy: string;
  sortOrder: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
  filters?: FilterInfo;
}

// File Explorer UI Types
export interface FileTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  extension?: string;
  size?: number;
  modified?: string;
  children?: FileTreeNode[];
  fileRecord?: FileRecord;
}

export interface DriveInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  totalSize?: number;
  usedSize?: number;
}

export interface FileExplorerState {
  currentDrive: DriveInfo | null;
  pathStack: string[];
  selectedFiles: Set<string>;
  viewMode: "grid" | "list";
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

export type FileAction =
  | "cut"
  | "copy"
  | "paste"
  | "delete"
  | "rename"
  | "upload"
  | "download";

export interface FileContextMenuAction {
  id: FileAction;
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}
