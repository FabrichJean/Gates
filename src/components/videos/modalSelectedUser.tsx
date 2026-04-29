
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import UserSelector, { type User } from "../UserSelector";

interface SelectedUserModalProps {
    open: boolean;
    users: User[];
    selectedUserId?: number | null;
    onClose: () => void;
    onConfirm: (user: User | null) => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    required?: boolean;
}

const SelectedUserModal = ({
    open,
    users,
    selectedUserId = null,
    onClose,
    onConfirm,
    title = "Select user",
    description = "Choose a user to continue.",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    loading = false,
    required = true,
}: SelectedUserModalProps) => {
    const [localSelectedUser, setLocalSelectedUser] = useState<User | null>(null);

    const initialUser = useMemo(
        () => users.find((u) => u.id === selectedUserId) || null,
        [users, selectedUserId]
    );

    useEffect(() => {
        if (!open) return;
        setLocalSelectedUser(initialUser);
    }, [open, initialUser]);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !loading) {
                onClose();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, onClose, loading]);

    if (!open || typeof document === "undefined") return null;

    const isConfirmDisabled = loading || (required && !localSelectedUser);

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                className="absolute inset-0 bg-black/50"
                onClick={() => {
                    if (!loading) onClose();
                }}
                aria-label="Close modal"
            />

            <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
                        {title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                        {description}
                    </p>
                </div>

                <div className="p-6">
                    <UserSelector
                        users={users}
                        selectedUserId={localSelectedUser?.id ?? null}
                        onSelect={setLocalSelectedUser}
                        placeholder="Search and select user..."
                        className="w-full"
                        disabled={loading}
                    />
                </div>

                <div className="px-6 py-4 border-t border-slate-200 dark:border-gray-700 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(localSelectedUser)}
                        disabled={isConfirmDisabled}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Processing..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export type { SelectedUserModalProps };
export default SelectedUserModal;