import React, { useCallback, useRef, useState, useMemo } from "react";
import { useFileOperations } from "../../hooks/useFileOperations";
import { validateFileUpload, formatFileSize } from "../../utils/fileUtils";
import type { UploadFileRequest } from "../../types/file";
import { useUsers } from "../../hooks/useAuth";
import UserSelector from "../UserSelector";

// ═══════════════════════════════════════════════════════════════════════════════
// ENTERPRISE FILE UPLOAD - HORIZONTAL LAYOUT OPTIMIZED
// ═══════════════════════════════════════════════════════════════════════════════

interface FileUploadProps {
  currentPath: string;
  targetUserId?: number;
  onUploadComplete?: (files: any[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  maxFileSize?: number;
}

// ───────────────────────────────────────────────────────────────────────────────
// Icon System
// ───────────────────────────────────────────────────────────────────────────────

const Icon: React.FC<{ name: string; className?: string; size?: number }> = ({
  name,
  className = "",
  size = 16,
}) => {
  const icons: Record<string, React.ReactNode> = {
    upload: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    file: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
    close: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    check: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20,6 9,17 4,12" />
      </svg>
    ),
    alert: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    spinner: (
      <svg viewBox="0 0 24 24" fill="none" className="animate-spin">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeOpacity="0.2"
        />
        <path
          fill="currentColor"
          d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"
        />
      </svg>
    ),
    tag: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    folder: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    user: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    arrowRight: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12,5 19,12 12,19" />
      </svg>
    ),
    cloud: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    ),
    trash: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="3,6 5,6 21,6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    settings: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    message: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  };

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {icons[name] || null}
    </span>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Compact TagInput
// ───────────────────────────────────────────────────────────────────────────────

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

const CompactTagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  maxTags = 8,
}) => {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (value: string) => {
      const trimmed = value
        .trim()
        .toLowerCase()
        .replace(/[,\\s]+$/, "");
      if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
        onChange([...tags, trimmed]);
      }
      setInput("");
    },
    [tags, onChange, maxTags],
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`
        flex flex-wrap items-center gap-1 min-h-[36px] px-2 py-1
        bg-white dark:bg-gray-800 border rounded-md cursor-text
        transition-all duration-150
        ${focused ? "border-blue-500 ring-1 ring-blue-100 dark:ring-blue-900" : "border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600"}
      `}
    >
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-200 text-[11px] font-medium rounded border border-slate-200 dark:border-gray-700"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(i);
            }}
            className="text-slate-400 hover:text-slate-600"
          >
            <Icon name="close" size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={tags.length === 0 ? "Add tags..." : ""}
        disabled={tags.length >= maxTags}
        className="flex-1 min-w-[60px] bg-transparent text-xs text-slate-700 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none disabled:cursor-not-allowed"
      />
      {tags.length > 0 && (
        <span className="text-[10px] text-slate-400 dark:text-gray-500 ml-auto">
          {tags.length}/{maxTags}
        </span>
      )}
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Compact File List Item
// ───────────────────────────────────────────────────────────────────────────────

interface FileListItemProps {
  file: File;
  index: number;
  onRemove: () => void;
}

const CompactFileItem: React.FC<FileListItemProps> = ({
  file,
  index,
  onRemove,
}) => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  const colors: Record<string, string> = {
    pdf: "bg-red-50 text-red-600 border-red-100",
    doc: "bg-blue-50 text-blue-600 border-blue-100",
    docx: "bg-blue-50 text-blue-600 border-blue-100",
    xls: "bg-green-50 text-green-600 border-green-100",
    xlsx: "bg-green-50 text-green-600 border-green-100",
    jpg: "bg-purple-50 text-purple-600 border-purple-100",
    jpeg: "bg-purple-50 text-purple-600 border-purple-100",
    png: "bg-purple-50 text-purple-600 border-purple-100",
  };
  const colorClass =
    colors[ext] || "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-md hover:border-slate-300 dark:hover:border-gray-600 transition-colors"
      style={{ animation: `slideIn 150ms ease ${index * 30}ms both` }}
    >
      <span
        className={`flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border ${colorClass}`}
      >
        {ext.slice(0, 4)}
      </span>
      <span className="flex-1 min-w-0 text-xs text-slate-700 truncate">
        {file.name}
      </span>
      <span className="text-[10px] text-slate-400 flex-shrink-0">
        {formatFileSize(file.size)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
      >
        <Icon name="close" size={12} />
      </button>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Drop Zone Compact
// ───────────────────────────────────────────────────────────────────────────────

interface DropZoneProps {
  onFilesSelected: (files: FileList) => void;
  isDragActive: boolean;
  onDragStateChange: (active: boolean) => void;
}

const CompactDropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  isDragActive,
  onDragStateChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDragStateChange(false);
      if (e.dataTransfer.files.length > 0)
        onFilesSelected(e.dataTransfer.files);
    },
    [onFilesSelected, onDragStateChange],
  );

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        onDragStateChange(true);
      }}
      onDragLeave={() => onDragStateChange(false)}
      className={`
        relative flex flex-col items-center justify-center gap-2 p-4
        border-2 border-dashed rounded-lg cursor-pointer
        transition-all duration-200
        ${isDragActive ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/30 scale-[1.01]" : "border-slate-300 dark:border-gray-700 hover:border-slate-400 dark:hover:border-gray-600 bg-slate-50/30 dark:bg-gray-800/30"}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
        className="hidden"
      />
      <div
        className={`p-2 rounded-lg transition-colors ${isDragActive ? "bg-blue-100 dark:bg-blue-900/30" : "bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700"}`}
      >
        <Icon
          name={isDragActive ? "upload" : "cloud"}
          size={20}
          className={isDragActive ? "text-blue-600" : "text-slate-400"}
        />
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-slate-700 dark:text-gray-100">
          {isDragActive ? "Drop here" : "Drop files or click"}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-gray-400">
          Max 100MB
        </p>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Status Badge
// ───────────────────────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{
  type: "error" | "success";
  message: string;
  onDismiss?: () => void;
}> = ({ type, message, onDismiss }) => {
  const styles =
    type === "error"
      ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
      : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs ${styles}`}
    >
      <Icon name={type === "error" ? "alert" : "check"} size={14} />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current opacity-60 hover:opacity-100"
        >
          <Icon name="close" size={12} />
        </button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component - Horizontal Layout
// ═══════════════════════════════════════════════════════════════════════════════

export const FileUpload: React.FC<FileUploadProps> = ({
  currentPath,
  targetUserId,
  onUploadComplete,
  onUploadError,
  className = "",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>(["uploaded"]);
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState();
  const [recipientId, setRecipientId] = useState(
    targetUserId?.toString() ?? "",
  );
  const [errors, setErrors] = useState<string[]>([]);

  const { uploadMultipleFiles, uploadState, clearState } = useFileOperations();

  const { data: users } = useUsers("");

  const validateAndAddFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const valid: File[] = [];
      const errs: string[] = [];
      Array.from(fileList).forEach((file) => {
        const v = validateFileUpload(file);
        v.isValid ? valid.push(file) : errs.push(`${file.name}: ${v.error}`);
      });
      if (errs.length) {
        setErrors(errs);
        onUploadError?.(errs.join("\\n"));
      } else setErrors([]);
      if (valid.length) setSelectedFiles((prev) => [...prev, ...valid]);
    },
    [onUploadError],
  );

  const removeFile = useCallback(
    (i: number) =>
      setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i)),
    [],
  );

  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    setTags(["uploaded"]);
    setComment("");
    setRecipientId(targetUserId?.toString() ?? "");
    setErrors([]);
    clearState();
  }, [targetUserId, clearState]);

  const handleUpload = useCallback(async () => {
    if (!selectedFiles.length) return;
    const requests: UploadFileRequest[] = selectedFiles.map((file) => {
      let nodePath = currentPath;
      if (!nodePath || nodePath === "" || nodePath === "/")
        nodePath = file.name;
      else
        nodePath = nodePath.endsWith("/")
          ? `${nodePath}${file.name}`
          : `${nodePath}/${file.name}`;
      return {
        file,
        node_path: nodePath,
        tags: tags.length ? tags : undefined,
        comment: comment.trim() || undefined,
        ...(recipientId ? { target_user: parseInt(recipientId, 10) } : {}),
      };
    });

    try {
      const results = await uploadMultipleFiles(requests);
      if (results.length) {
        onUploadComplete?.(results);
        clearAll();
      }
    } catch (err) {
      onUploadError?.(err instanceof Error ? err.message : "Upload failed");
    }
  }, [
    selectedFiles,
    currentPath,
    tags,
    comment,
    recipientId,
    uploadMultipleFiles,
    onUploadComplete,
    onUploadError,
    clearAll,
  ]);

  const canUpload = selectedFiles.length > 0 && !uploadState.isLoading;
  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <Icon name="upload" size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              File Upload
            </h3>
            <p className="text-[11px] text-slate-500">
              {selectedFiles.length} file(s) · {formatFileSize(totalSize)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-gray-400">
          <Icon name="folder" size={12} />
          <span className="max-w-[120px] truncate">
            {currentPath || "Root"}
          </span>
        </div>
      </div>

      {/* Main Content - Horizontal Layout */}
      <div className="p-4 dark:bg-gray-900">
        <div className="flex flex-col gap-4">
          {/* LEFT COLUMN: Drop Zone & File List */}
          <div className="flex-1 min-w-0 space-y-3">
            <CompactDropZone
              onFilesSelected={validateAndAddFiles}
              isDragActive={dragActive}
              onDragStateChange={setDragActive}
            />

            {selectedFiles.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                {selectedFiles.map((file, i) => (
                  <CompactFileItem
                    key={`${file.name}-${i}`}
                    file={file}
                    index={i}
                    onRemove={() => removeFile(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Metadata Form */}
          <div className=" space-y-3">
            {/* User IDs Row */}
            <div className="gap-2">
              <div>
                <label className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-gray-300 mb-1">
                  <Icon name="arrowRight" size={10} />
                  User
                </label>
                <UserSelector
                  users={users || []}
                  selectedUserId={recipientId ? Number(recipientId) : null}
                  onSelect={(user) => setRecipientId(user ? user.id.toString() : "")}
                  placeholder="Select user..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-gray-300 mb-1">
                <Icon name="tag" size={10} />
                Tags
              </label>
              <CompactTagInput tags={tags} onChange={setTags} maxTags={8} />
            </div>

            {/* Comment */}
            <div>
              <label className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-gray-300 mb-1">
                <Icon name="message" size={10} />
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Note..."
                rows={2}
                className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded resize-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {(errors.length > 0 || uploadState.error || uploadState.success) && (
          <div className="mt-3 space-y-2">
            {errors.length > 0 && (
              <StatusBadge
                type="error"
                message={errors.join(", ")}
                onDismiss={() => setErrors([])}
              />
            )}
            {uploadState.error && (
              <StatusBadge
                type="error"
                message={uploadState.error}
                onDismiss={clearState}
              />
            )}
            {uploadState.success && !uploadState.error && (
              <StatusBadge
                type="success"
                message="Upload complete"
                onDismiss={clearState}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800 flex items-center justify-between">
        <button
          type="button"
          onClick={clearAll}
          disabled={uploadState.isLoading}
          className="text-xs font-medium text-slate-500 dark:text-gray-300 hover:text-slate-700 dark:hover:text-gray-100 px-3 py-1.5 rounded hover:bg-slate-200/50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!canUpload}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {uploadState.isLoading ? (
            <>
              <Icon name="spinner" size={14} />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Icon name="upload" size={14} />
              <span>
                Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
              </span>
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default FileUpload;
