import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UploadProgress {
    videoId: string;
    file?: string;
    progress: number;
    status: "uploading" | "done" | "error";
    message?: string;
    userId: number,
    total: number,
    finish: number
}

interface ProgressStore {
    uploads: UploadProgress[];
    setProgress: (data: UploadProgress) => void;
    clearProgress: (videoId: string) => void;
    reset: () => void;
}

export const useProgressStore = create<ProgressStore>()(
    persist(
        (set, get) => ({
            uploads: [],
            setProgress: (data) => {
                const existing = get().uploads.find((u) => u.videoId === data.videoId);
                if (existing) {
                    // Mise à jour
                    set({
                        uploads: get().uploads.map((u) =>
                            u.videoId === data.videoId ? { ...u, ...data } : u
                        ),
                    });
                    if (data.finish === data.total) {
                        setTimeout(() => {
                            get().clearProgress(data.videoId)
                        }, 1000);
                    }
                } else {
                    // Ajout
                    set({ uploads: [...get().uploads, data] });
                }
            },
            clearProgress: (videoId) =>
                set({
                    uploads: get().uploads.filter((u) => u.videoId !== videoId),
                }),
            reset: () => set({ uploads: [] }),
        }),
        {
            name: "upload-progress-storage", // clé dans localStorage
        }
    )
);
