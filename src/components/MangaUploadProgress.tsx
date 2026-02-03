import React from "react";
import { Loader2 } from "lucide-react";
import { useMangaUploadSocketContext } from "../context/MangaUploadSocketContext";

interface MangaUploadProgressProps {
  mangaId: number;
  variant?: "inline" | "badge" | "full";
  className?: string;
}

export const MangaUploadProgress: React.FC<MangaUploadProgressProps> = ({
  mangaId,
  variant = "inline",
  className = "",
}) => {
  const { states, subscribe, unsubscribe } = useMangaUploadSocketContext();

  // Subscribe to this manga's updates
  React.useEffect(() => {
    subscribe(mangaId);
    return () => {
      unsubscribe(mangaId);
    };
  }, [mangaId, subscribe, unsubscribe]);

  const state = states[mangaId];

  if (!state || !state.isUploading) {
    return null;
  }

  // Badge variant - compact for table rows
  if (variant === "badge") {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 ${className}`}>
        <Loader2 className="w-3 h-3 animate-spin text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
          {Math.round(state.progress)}%
        </span>
      </div>
    );
  }

  // Inline variant - one line with progress bar
  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-emerald-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
              {state.currentTask || "正在上传..."}
            </p>
            <span className="text-xs font-semibold text-emerald-600 flex-shrink-0">
              {Math.round(state.progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Full variant - detailed card
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
          {state.currentTask || "正在上传..."}
        </p>
        <span className="text-sm font-semibold text-emerald-600">
          {Math.round(state.progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
          style={{ width: `${state.progress}%` }}
        />
      </div>
    </div>
  );
};
