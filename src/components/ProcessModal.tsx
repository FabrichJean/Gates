import React from "react";
import { useProcessingCount } from "./useProcessingCount";

interface ProcessModalProps {
    open: boolean;
    onClose: () => void;
}

const ProcessModal: React.FC<ProcessModalProps> = ({ open, onClose }) => {
    const { count, loading } = useProcessingCount();
    const modalRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!open) return;
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 bg-black/30">
            <div ref={modalRef} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md mx-auto p-6 relative">
                <h2 className="text-xl font-bold mb-4 text-left text-gray-800 dark:text-gray-100">Process</h2>
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="text-center mt-6 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 rounded">
                    {loading ? (
                        <span className="text-gray-700 dark:text-gray-200">Loading...</span>
                    ) : (count > 0 ? (
                        <span className="text-blue-700 dark:text-blue-300">{count} video{count > 1 ? 's' : ''} in process</span>
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400">No video in process</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProcessModal;
