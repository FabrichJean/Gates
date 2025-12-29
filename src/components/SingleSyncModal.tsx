import React, { useState } from "react";

interface SingleSyncModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (isForce: boolean) => void;
    title?: string;
}

const SingleSyncModal: React.FC<SingleSyncModalProps> = ({ open, onClose, onSubmit, title = "Synchroniser la ressource" }) => {
    const [loading, setLoading] = useState(false);

    const handleSync = (isForce: boolean) => async () => {
        setLoading(true);
        try {
            await onSubmit(isForce);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">✕</button>
                </div>
                <div className="space-y-4">
                    <button
                        onClick={handleSync(true)}
                        disabled={loading}
                        className="w-full py-2 px-4 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "Synchronisation..." : "Sync avec Force"}
                    </button>
                    <button
                        onClick={handleSync(false)}
                        disabled={loading}
                        className="w-full py-2 px-4 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-60"
                    >
                        {loading ? "Synchronisation..." : "Sync sans Force"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SingleSyncModal;
