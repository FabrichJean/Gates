import React, { useRef } from "react";
import { HashLoader } from "react-spinners";
import useCardFlottant from "../hooks/useCardFlottant";
import useSockretSync from "../hooks/useSockretSync";
import { toast } from "react-hot-toast";

const CardFlottant: React.FC = () => {
    const { collapsed, collapse, expand, hide, visible } = useCardFlottant();
    const toastTimerRef = useRef<number | null>(null);

    useSockretSync({
        onSyncProgress: (data: any) => {
            try {
                hide();

                if (toastTimerRef.current) {
                    window.clearTimeout(toastTimerRef.current as unknown as number);
                    toastTimerRef.current = null;
                }

                const total = data?.total ?? null;
                toast.success(`Total: ${total}`, { 
                    duration: 8000, 
                    position: "bottom-right",
                    style: { minWidth: "350px" }
                });
            } catch (err) {
                console.error("Error handling sync:progress in CardFlottant:", err);
            }
        },
    });


    if (!visible) return null;

    // If you want to fully hide the card from UI, AppRoutes controls mounting via visible flag.
    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Expanded card */}
            {!collapsed ? (
                <div className="w-80 max-w-full rounded-xl shadow-lg p-4 inset-0 backdrop-blur-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-200">
                    {/* close/minimize button */}
                    <div className="absolute top-0 right-0 m-3 flex items-center space-x-2 bg-white">
                        <button
                            aria-label="Minimize"
                            title="Minimize"
                            onClick={collapse}
                            className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm focus:outline-none text-gray-700 dark:text-gray-200"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-col items-center p-2">

                        {/* Zone serveurs + animation */}
                        <div className="flex items-center space-x-6">
                            {/* Zone animation fichiers */}
                            <div className="relative w-40 h-14">
                                <div className="absolute file f1 w-10 h-12 bg-yellow-400 border-2 border-yellow-500 flex items-start justify-center p-1"></div>
                                <div className="absolute file f2 w-10 h-12 bg-yellow-400 border-2 border-yellow-500 flex items-start justify-center p-1"></div>
                                <div className="absolute file f3 w-10 h-12 bg-yellow-400 border-2 border-yellow-500 flex items-start justify-center p-1"></div>
                            </div>
                        </div>

                        {/* Texte et barre de progression */}
                        <p className="mt-4 text-gray-700 dark:text-gray-200 text-sm font-semibold animate-pulse">Synchronzing ...</p>

                        <div className="mt-3 w-full">
                            <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 prog">
                                <div className="h-full bg-amber-400 prog-bar" style={{ width: '42%' }}></div>
                            </div>
                        </div>

                    </div>

                </div>
            ) : (
                /* Collapsed small button to restore */
                <div className="w-12 h-12">
                    <button
                        aria-label="Restore upload card"
                        title="Restore"
                        onClick={expand}
                        className="w-12 h-12 animate-spin duration-700 rounded-full bg-orange-400 shadow-lg flex items-center justify-center hover:scale-105 transform transition-all duration-150 focus:outline-none"
                    >
                        <HashLoader size={30} color="white" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CardFlottant;