import React, { useState, useCallback, useMemo, useEffect } from "react";
import NewFolderModal from "./NewFolderModal";
import UserSelector, { type User } from "../UserSelector";
import { useFileOperations } from "../../hooks/useFileOperations";
import { FileUpload } from "./FileUpload";
import { useFiles } from "../../hooks/useFiles";
import { useFileExplorer } from "../../hooks/useFileExplorer";
import {
  buildFileTree,
  findNodeByPath,
  getBreadcrumbPath,
  getFileIcon,
  formatFileSize,
  formatDate,
} from "../../utils/fileTreeUtils";
import type { FileTreeNode } from "../../utils/fileTreeUtils";
import FileDetails from "./FileDetails";
import { useAuthMe, useUsers } from "../../hooks/useAuth";
import RoleEnum from "../../utils/roleEnum";

export const ProfessionalFileExplorer: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    selectedFiles,
    toggleFileSelection,
    clearSelection,
  } = useFileExplorer();
  // User filter state

  const { data: user } = useAuthMe();
  const { data: users } = useUsers("");
  const [selectedUser, setSelectedUser] = useState<User | null>(() => {
    if (user && user.role !== RoleEnum.SUPERADMIN) {
      return user;
    }
    return null;
  });

  // Keep selectedUser in sync if user changes (e.g., after login)
  useEffect(() => {
    if (user && user.role !== RoleEnum.SUPERADMIN) {
      setSelectedUser(user);
    } else if (user && user.role === RoleEnum.SUPERADMIN) {
      setSelectedUser(null);
    }
  }, [user]);

  // Date filter fields
  const [createdAfter, setCreatedAfter] = useState("");
  const [createdBefore, setCreatedBefore] = useState("");
  const [updatedAfter, setUpdatedAfter] = useState("");
  const [updatedBefore, setUpdatedBefore] = useState("");
  const [createdOnDate, setCreatedOnDate] = useState("");
  const [updatedOnDate, setUpdatedOnDate] = useState("");
  const [showDateFilters, setShowDateFilters] = useState(false);

  const { files, isLoading, error, refetch } = useFiles({
    search: searchQuery,
    target_user: selectedUser?.id,
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
    createdOnDate,
    updatedOnDate,
  });
  const [currentPath, setCurrentPath] = useState("");
  const [expandedFolders, setExpandedFolders] = useState(new Set<string>([""]));
  const [showUpload, setShowUpload] = useState(false);
  // TODO: Replace with actual user id from context/auth
  const { uploadFile } = useFileOperations();
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderLoading, setNewFolderLoading] = useState(false);
  const [newFolderError, setNewFolderError] = useState("");
  // File details modal state
  const [detailsFile, setDetailsFile] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Build file tree from files
  const fileTree = useMemo(() => buildFileTree(files), [files]);

  // Get current folder node
  const currentNode = useMemo(
    () => findNodeByPath(fileTree, currentPath) || fileTree,
    [fileTree, currentPath],
  );

  // Get breadcrumb path
  const breadcrumbPath = useMemo(
    () => getBreadcrumbPath(currentNode),
    [currentNode],
  );

  const handleFolderClick = useCallback((folderPath: string) => {
    setCurrentPath(folderPath);
    setExpandedFolders((prev) => new Set([...prev, folderPath]));
  }, []);

  const handleFileClick = useCallback(
    (fileNode: FileTreeNode) => {
      if (fileNode.fileRecord) {
        toggleFileSelection(fileNode.fileRecord.id.toString());
      }
    },
    [toggleFileSelection],
  );

  const handleFileDoubleClick = useCallback((fileNode: FileTreeNode) => {
    if (fileNode.fileRecord) {
      setDetailsFile(fileNode.fileRecord);
      setShowDetailsModal(true);
    }
  }, []);

  const toggleFolderExpansion = useCallback(
    (folderPath: string, event: React.MouseEvent) => {
      event.stopPropagation();
      setExpandedFolders((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(folderPath)) {
          newSet.delete(folderPath);
        } else {
          newSet.add(folderPath);
        }
        return newSet;
      });
    },
    [],
  );

  // Folder creation handler
  async function handleCreateFolder() {
    setNewFolderError("");
    if (!newFolderName.trim()) {
      setNewFolderError("Folder name is required");
      return;
    }
    setNewFolderLoading(true);
    // Compose folder path
    let folderPath = currentPath;
    if (!folderPath || folderPath === "" || folderPath === "/") {
      folderPath = newFolderName.trim();
    } else {
      folderPath = folderPath.endsWith("/")
        ? folderPath + newFolderName.trim()
        : folderPath + "/" + newFolderName.trim();
    }
    // Upload a void file (empty blob) with special tag 'folder'
    const voidFile = new File([""], "_", { type: "application/x-empty" });
    try {
      await uploadFile({
        file: voidFile,
        node_path: folderPath + "/" + voidFile.name, // trailing slash to indicate folder
        tags: ["folder"],
        comment: "Virtual folder",
      });
      setShowNewFolder(false);
      setNewFolderName("");
      setNewFolderError("");
      refetch();
    } catch (err) {
      setNewFolderError(
        err instanceof Error ? err.message : "Failed to create folder",
      );
    } finally {
      setNewFolderLoading(false);
    }
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          {/* Toggle Date Filters Button */}
          {showDateFilters && (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-start">
                <label className="text-[10px] font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                  Created After
                </label>
                <input
                  type="date"
                  value={createdAfter}
                  onChange={(e) => setCreatedAfter(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Created After"
                  title="Created After"
                />
              </div>
              <div className="flex flex-col items-start">
                <label className="text-[10px] font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                  Created Before
                </label>
                <input
                  type="date"
                  value={createdBefore}
                  onChange={(e) => setCreatedBefore(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Created Before"
                  title="Created Before"
                />
              </div>
              <div className="flex flex-col items-start">
                <label className="text-[10px] font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                  Updated After
                </label>
                <input
                  type="date"
                  value={updatedAfter}
                  onChange={(e) => setUpdatedAfter(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Updated After"
                  title="Updated After"
                />
              </div>
              <div className="flex flex-col items-start">
                <label className="text-[10px] font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                  Updated Before
                </label>
                <input
                  type="date"
                  value={updatedBefore}
                  onChange={(e) => setUpdatedBefore(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Updated Before"
                  title="Updated Before"
                />
              </div>
              <div className="flex flex-col items-start">
                <label className="text-[10px] font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                  Created On
                </label>
                <input
                  type="date"
                  value={createdOnDate}
                  onChange={(e) => setCreatedOnDate(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Created On"
                  title="Created On Date"
                />
              </div>
              <div className="flex flex-col items-start">
                <label className="text-[10px] font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                  Updated On
                </label>
                <input
                  type="date"
                  value={updatedOnDate}
                  onChange={(e) => setUpdatedOnDate(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Updated On"
                  title="Updated On Date"
                />
              </div>
            </div>
          )}
         {!showDateFilters ? <>
          {/* Navigation Buttons */}
          <div className="flex items-center space-x-1">
            <button
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={() => setCurrentPath(currentNode.parent?.path || "")}
              disabled={!currentNode.parent}
              title="Go back"
            >
              <svg
                className="w-4 h-4 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={refetch}
              title="Refresh"
            >
              <svg
                className="w-4 h-4 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <button
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
              onClick={() => setCurrentPath("")}
            >
              Root
            </button>
            {breadcrumbPath.length <= 3 ? (
              breadcrumbPath.map((node) => (
                <React.Fragment key={node.id}>
                  <span className="mx-2 text-gray-400">/</span>
                  <button
                    className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                    onClick={() => setCurrentPath(node.path)}
                  >
                    {node.name}
                  </button>
                </React.Fragment>
              ))
            ) : (
              <>
                <span className="mx-2 text-gray-400">/</span>
                <button
                  className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                  onClick={() => setCurrentPath(breadcrumbPath[0].path)}
                >
                  {breadcrumbPath[0].name}
                </button>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-400">...</span>
                <span className="mx-2 text-gray-400">/</span>
                <button
                  className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                  onClick={() => setCurrentPath(breadcrumbPath[breadcrumbPath.length - 1].path)}
                >
                  {breadcrumbPath[breadcrumbPath.length - 1].name}
                </button>
              </>
            )}
          </div>
          </> : null}
        </div>

        <div className="flex items-center space-x-3">
          <button
            className={`px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
            onClick={() => setShowDateFilters((v) => !v)}
            type="button"
            title="Toggle date filters"
          >
            {showDateFilters ? "Hide Date Filters" : "Show Date Filters"}
          </button>

          {!showDateFilters ? <>
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 px-3 py-1.5 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* User Filter */}
          {user?.role === RoleEnum.SUPERADMIN ? (
            <div className="w-max">
              <UserSelector
                users={users}
                selectedUserId={selectedUser?.id ?? null}
                onSelect={setSelectedUser}
                placeholder="Filter by user..."
                allowClear
                showValidationBadge={false}
              />
            </div>
          ) : null}
          </> : null}

          {/* New Folder Button */}
          {(!showDateFilters && user?.role === RoleEnum.SUPERADMIN) ? (
            <button
              onClick={() => setShowNewFolder(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition-colors"
              title="Create new folder"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7V6a2 2 0 012-2h2m4 0h6a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M9 3v4m6-4v4"
                />
              </svg>
              New Folder
            </button>
          ) : null}

          {/* New Folder Modal */}
          <NewFolderModal
            open={showNewFolder}
            value={newFolderName}
            loading={newFolderLoading}
            error={newFolderError}
            onChange={setNewFolderName}
            onClose={() => {
              setShowNewFolder(false);
              setNewFolderName("");
              setNewFolderError("");
            }}
            onCreate={handleCreateFolder}
          />
          {/* Upload Button */}
          {(!showDateFilters && user?.role === RoleEnum.SUPERADMIN) ? (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
              title="Upload files"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
              Upload
            </button>
          ) : null}

          {/* View Mode Toggle */}
          {/* Upload Modal */}
          {showUpload && (
            <div className="fixed inset-0 z-50 flex items-center justify-center h-full bg-black/50 p-1 bg-opacity-30 overflow-auto">
              <div className="rounded-lg shadow-lg w-[60%] h-max overflow-auto">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  onClick={() => setShowUpload(false)}
                  aria-label="Close upload modal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <FileUpload
                  onUploadComplete={() => {
                    setShowUpload(false);
                    refetch();
                  }}
                  onUploadError={() => {}}
                  currentPath={currentPath}
                />
              </div>
            </div>
          )}
          <div className="flex items-center bg-gray-200 dark:bg-gray-600 rounded-md p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded text-xs ${
                viewMode === "grid"
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              title="Grid view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded text-xs ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              title="List view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 h-full overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-32 text-red-600 dark:text-red-400">
              <p>Error loading files: {error.message}</p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="h-full overflow-auto">
              {viewMode === "grid" ? (
                <FileGridView
                  node={currentNode}
                  onFolderClick={handleFolderClick}
                  onFileClick={handleFileClick}
                  onFileDoubleClick={handleFileDoubleClick}
                  selectedFiles={selectedFiles}
                />
              ) : (
                <FileListView
                  node={currentNode}
                  onFolderClick={handleFolderClick}
                  onFileClick={handleFileClick}
                  onFileDoubleClick={handleFileDoubleClick}
                  selectedFiles={selectedFiles}
                  expandedFolders={expandedFolders}
                  onToggleExpansion={toggleFolderExpansion}
                />
              )}
            </div>
          )}
        </div>
        {/* File Details Modal */}
        {showDetailsModal && detailsFile && (
          <div className="fixed inset-0 h-full w-full z-50 flex items-center justify-center bg-black/50 bg-opacity-30">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[50%] h-full relative overflow-auto">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailsFile(null);
                }}
                aria-label="Close file details modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <FileDetails file={detailsFile} />
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
        <div className="flex items-center justify-between">
          <span>
            {currentNode.children.length} items
            {selectedFiles.size > 0 && ` • ${selectedFiles.size} selected`}
          </span>
          <span>{files.length} total files</span>
        </div>
      </div>
    </div>
  );
};

// Grid View Component
const FileGridView: React.FC<{
  node: FileTreeNode;
  onFolderClick: (path: string) => void;
  onFileClick: (node: FileTreeNode) => void;
  onFileDoubleClick: (node: FileTreeNode) => void;
  selectedFiles: Set<string>;
}> = ({
  node,
  onFolderClick,
  onFileClick,
  onFileDoubleClick,
  selectedFiles,
}) => {
  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
      {node.children.map((child) => {
        const isSelected =
          child.fileRecord && selectedFiles.has(child.fileRecord.id.toString());

        return (
          <div
            key={child.id}
            className={`flex flex-col items-center p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
              isSelected
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
            onClick={() =>
              child.type === "folder"
                ? onFolderClick(child.path)
                : onFileClick(child)
            }
            onDoubleClick={() =>
              child.type === "folder"
                ? onFolderClick(child.path)
                : onFileDoubleClick(child)
            }
          >
            <div className="text-2xl mb-2">
              {getFileIcon(child.type, child.extension)}
            </div>
            <div className="text-center w-full">
              <p
                className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate"
                title={child.name}
              >
                {child.name}
              </p>
              {child.type === "file" && child.size && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatFileSize(child.size)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// List View Component
const FileListView: React.FC<{
  node: FileTreeNode;
  onFolderClick: (path: string) => void;
  onFileClick: (node: FileTreeNode) => void;
  onFileDoubleClick: (node: FileTreeNode) => void;
  selectedFiles: Set<string>;
  expandedFolders: Set<string>;
  onToggleExpansion: (path: string, event: React.MouseEvent) => void;
}> = ({
  node,
  onFolderClick,
  onFileClick,
  onFileDoubleClick,
  selectedFiles,
  expandedFolders,
  onToggleExpansion,
}) => {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Modified</div>
      </div>

      {/* Files and Folders */}
      {node.children.map((child) => {
        const isSelected =
          child.fileRecord && selectedFiles.has(child.fileRecord.id.toString());
        const isExpanded = expandedFolders.has(child.path);

        return (
          <div key={child.id}>
            <div
              className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
              onClick={() =>
                child.type === "folder"
                  ? onFolderClick(child.path)
                  : onFileClick(child)
              }
              onDoubleClick={() =>
                child.type === "folder"
                  ? onFolderClick(child.path)
                  : onFileDoubleClick(child)
              }
            >
              <div className="col-span-6 flex items-center space-x-3 min-w-0">
                <div className="flex items-center space-x-1">
                  {child.type === "folder" && (
                    <button
                      onClick={(e) => onToggleExpansion(child.path, e)}
                      className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <svg
                        className={`w-3 h-3 text-gray-400 transform transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                  <span className="text-lg">
                    {getFileIcon(child.type, child.extension, isExpanded)}
                  </span>
                </div>
                <span className="text-sm text-gray-900 dark:text-gray-100 truncate font-medium">
                  {child.name}
                </span>
              </div>
              <div className="col-span-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                {child.type === "file" ? formatFileSize(child.size) : "—"}
              </div>
              <div className="col-span-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                {child.type === "file"
                  ? child.extension?.toUpperCase() || "File"
                  : "Folder"}
              </div>
              <div className="col-span-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                {formatDate(child.modified)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
