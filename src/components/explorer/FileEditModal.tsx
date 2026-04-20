import React, { useCallback, useEffect, useRef, useState } from "react";
import type { FileRecord, UpdateFileRequest } from "../../types/file";
import { useUsers } from "../../hooks/useAuth";
import UserSelector from "../UserSelector";

interface FileEditModalProps {
    open: boolean;
    file: FileRecord | null;
    onClose: () => void;
    onSave: (payload: UpdateFileRequest) => Promise<FileRecord | null>;
}

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    maxTags?: number;
    disabled?: boolean;
    inputValue: string;
    onInputChange: (value: string) => void;
}

const TagCloseIcon: React.FC<{ size?: number; className?: string }> = ({
    size = 10,
    className = "",
}) => (
    <svg
        className={className}
        width={size}
        height={size}
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
);

const CompactTagInput: React.FC<TagInputProps> = ({
    tags,
    onChange,
    maxTags = 8,
    disabled = false,
    inputValue,
    onInputChange,
}) => {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = useCallback(
        (value: string) => {
            if (disabled) return;
            const trimmed = value
                .trim()
                .toLowerCase()
                .replace(/[,\s]+$/, "");
            if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
                onChange([...tags, trimmed]);
            }
            onInputChange("");
        },
        [disabled, tags, onChange, maxTags, onInputChange],
    );

    const removeTag = useCallback(
        (index: number) => {
            if (disabled) return;
            onChange(tags.filter((_, i) => i !== index));
        },
        [disabled, tags, onChange],
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            if (inputValue.trim()) addTag(inputValue);
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
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
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
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
                        disabled={disabled}
                    >
                        <TagCloseIcon size={10} />
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={tags.length === 0 && !inputValue ? "Add tags..." : ""}
                disabled={disabled || tags.length >= maxTags}
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

const splitNodePath = (value: string) => {
    const normalized = (value || "").replace(/\\/g, "/");
    const trimmed = normalized.replace(/\/+$/, "");
    const lastSlash = trimmed.lastIndexOf("/");

    if (lastSlash === -1) {
        return { prefix: "", name: trimmed };
    }

    return {
        prefix: trimmed.slice(0, lastSlash),
        name: trimmed.slice(lastSlash + 1),
    };
};

const buildNodePath = (prefix: string, name: string) => {
    const normalizedPrefix = prefix.trim().replace(/\\/g, "/");
    const cleanedPrefix = normalizedPrefix.replace(/\/+$/, "");
    const normalizedName = name.trim();

    if (!normalizedName) return "";
    if (!cleanedPrefix) return normalizedName;
    return `${cleanedPrefix}/${normalizedName}`;
};

const FileEditModal: React.FC<FileEditModalProps> = ({
    open,
    file,
    onClose,
    onSave,
}) => {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagDraft, setTagDraft] = useState("");
    const [pathPrefix, setPathPrefix] = useState("");
    const [fileName, setFileName] = useState("");
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const { data: users } = useUsers("");

    useEffect(() => {
        if (!open || !file) return;
        setSelectedUserId(file.target_user ?? file.targetUser?.id ?? null);
        setTags(file.tags || []);
        setTagDraft("");
        const { prefix, name } = splitNodePath(file.node_path || "");
        setPathPrefix(prefix ? `${prefix}/` : "");
        setFileName(name);
        setComment(file.comment || "");
        setError("");
    }, [open, file]);

    const handleSubmit = async () => {
        if (!file) return;
        setSaving(true);
        setError("");

        if (!fileName.trim()) {
            setError("File name is required");
            setSaving(false);
            return;
        }

        const nextNodePath = buildNodePath(pathPrefix, fileName);
        if (!nextNodePath) {
            setError("Node path is required");
            setSaving(false);
            return;
        }

        const trimmedComment = comment.trim();

        const normalizedDraft = tagDraft
            .trim()
            .toLowerCase()
            .replace(/[,\s]+$/, "");
        const finalTags =
            normalizedDraft && !tags.includes(normalizedDraft)
                ? [...tags, normalizedDraft]
                : tags;

        const payload: UpdateFileRequest = {
            target_user: selectedUserId ?? null,
            node_path: nextNodePath,
            tags: finalTags,
            comment: trimmedComment ? trimmedComment : null,
        };

        try {
            const updated = await onSave(payload);
            if (!updated) {
                setError("Update failed");
                return;
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Update failed");
        } finally {
            setSaving(false);
        }
    };

    if (!open || !file) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center h-full bg-black/50 p-2 bg-opacity-30 overflow-auto">
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-3xl p-6">
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    onClick={onClose}
                    aria-label="Close edit modal"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Edit File
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Update node path, user, tags, and comment.
                </p>

                <div className="mt-5 space-y-4">
                    <div>
                        <label className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-gray-300 mb-1">
                            Folder path
                        </label>
                        <input
                            type="text"
                            value={pathPrefix}
                            onChange={(e) => setPathPrefix(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all"
                            placeholder="/...../....."
                            disabled={saving}
                        />
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-gray-500">
                            Only the folder prefix is editable.
                        </p>
                    </div>
                    <div>
                        <label className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-gray-300 mb-1">
                            File name
                        </label>
                        <input
                            type="text"
                            value={fileName}
                            className="w-full px-2 py-1.5 text-xs bg-gray-100 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 rounded text-slate-500 dark:text-gray-400"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-gray-300 mb-1">
                            User
                        </label>
                        <UserSelector
                            users={users || []}
                            selectedUserId={selectedUserId}
                            onSelect={(user) => setSelectedUserId(user ? user.id : null)}
                            placeholder="Select user..."
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-gray-300 mb-1">
                            Tags
                        </label>
                        <CompactTagInput
                            tags={tags}
                            onChange={setTags}
                            maxTags={8}
                            disabled={saving}
                            inputValue={tagDraft}
                            onInputChange={setTagDraft}
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-gray-300 mb-1">
                            Comment
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded resize-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all"
                            rows={3}
                            placeholder="Note..."
                            disabled={saving}
                        />
                    </div>

                    {error && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-200/60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileEditModal;
