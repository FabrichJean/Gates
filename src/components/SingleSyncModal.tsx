
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

    return (
        <div
            id="single-sync-modal"
            tabIndex={-1}
            aria-hidden={!open}
            className={`${open ? "flex" : "hidden"} overflow-y-auto overflow-x-hidden bg-black/60 fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
        >
            <div className="relative p-4 w-full max-w-md bg-white dark:bg-gray-800 max-h-full inset-0 backdrop-blur-2xl border border-white shadow-lg">
                <div className="relative bg-neutral-primary-soft  border-default rounded-base shadow-sm p-4 md:p-6">
                    <div className="flex items-center justify-between border-b border-default pb-4 md:pb-5">
                        <h3 className="text-lg font-medium text-heading">{title}</h3>
                        <button
                            type="button"
                            className="text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 ms-auto inline-flex justify-center items-center"
                            onClick={onClose}
                            aria-label="Close modal"
                            disabled={loading}
                        >
                            <svg
                                className="w-5 h-5"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18 17.94 6M18 18 6.06 6"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="pt-4 md:pt-6">
                        <div className="space-y-4 mb-4">
                            <button
                                onClick={handleSync(true)}
                                disabled={loading}
                                className="inline-flex items-center w-full p-5 dark:hover:bg-slate-600 hover:bg-slate-100 text-body bg-neutral-primary-soft border-1 border-default rounded-base cursor-pointer peer-checked:hover:bg-brand-softer peer-checked:border-brand-subtle peer-checked:bg-brand-softer hover:bg-neutral-secondary-medium peer-checked:text-fg-brand-strong disabled:opacity-60"
                            >
                                <div className="flex items-center justify-center w-9 h-9 rounded bg-brand-soft text-fg-brand-strong">
                                    <svg
                                        className="w-5 h-5"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeWidth="2"
                                            d="M7.111 20A3.111 3.111 0 0 1 4 16.889v-12C4 4.398 4.398 4 4.889 4h4.444a.89.89 0 0 1 .89.889v12A3.111 3.111 0 0 1 7.11 20Zm0 0h12a.889.889 0 0 0 .889-.889v-4.444a.889.889 0 0 0-.889-.89h-4.389a.889.889 0 0 0-.62.253l-3.767 3.665a.933.933 0 0 0-.146.185c-.868 1.433-1.581 1.858-3.078 2.12Zm0-3.556h.009m7.933-10.927 3.143 3.143a.889.889 0 0 1 0 1.257l-7.974 7.974v-8.8l3.574-3.574a.889.889 0 0 1 1.257 0Z"
                                        />
                                    </svg>
                                </div>
                                <div className="block ms-2.5 text-left">
                                    <div className="w-full text-base font-medium">
                                        {loading ? "Synchronisation..." : "Avec Force"}
                                    </div>
                                    <div className="w-full text-xs">Toutes les données sauf l'ID seront mises à jour directement</div>
                                </div>
                                <svg
                                    className="w-5 h-5 rtl:rotate-180 ms-auto"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 12H5m14 0-4 4m4-4-4-4"
                                    />
                                </svg>
                            </button>

                            <button
                                onClick={handleSync(false)}
                                disabled={loading}
                                className="inline-flex items-center w-full dark:hover:bg-slate-600 hover:bg-slate-100 p-5 text-body bg-neutral-primary-soft border-1 border-default rounded-base cursor-pointer peer-checked:hover:bg-brand-softer peer-checked:border-brand-subtle peer-checked:bg-brand-softer hover:bg-neutral-secondary-medium peer-checked:text-fg-brand-strong disabled:opacity-60"
                            >
                                <div className="flex items-center justify-center w-9 h-9 rounded bg-brand-soft text-fg-brand-strong">
                                    <svg
                                        className="w-5 h-5"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeWidth="2"
                                            d="M7.111 20A3.111 3.111 0 0 1 4 16.889v-12C4 4.398 4.398 4 4.889 4h4.444a.89.89 0 0 1 .89.889v12A3.111 3.111 0 0 1 7.11 20Zm0 0h12a.889.889 0 0 0 .889-.889v-4.444a.889.889 0 0 0-.889-.89h-4.389a.889.889 0 0 0-.62.253l-3.767 3.665a.933.933 0 0 0-.146.185c-.868 1.433-1.581 1.858-3.078 2.12Zm0-3.556h.009m7.933-10.927 3.143 3.143a.889.889 0 0 1 0 1.257l-7.974 7.974v-8.8l3.574-3.574a.889.889 0 0 1 1.257 0Z"
                                        />
                                    </svg>
                                </div>
                                <div className="block ms-2.5 text-left">
                                    <div className="w-full text-base font-medium">
                                        {loading ? "Synchronisation..." : "Sans Force"}
                                    </div>
                                    <div className="w-full text-xs">Les enregistrements avec un ID existant ne seront pas écrasés</div>
                                </div>
                                <svg
                                    className="w-5 h-5 rtl:rotate-180 ms-auto"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 12H5m14 0-4 4m4-4-4-4"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleSyncModal;
