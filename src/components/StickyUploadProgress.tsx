/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect } from "react";
import { useProgressStore } from "../hooks/useProgressStore";
import { useSocketProgress } from "../hooks/useSocketProgress";

export default function StickyUploadProgress() {
    const { uploads } = useProgressStore();
    useSocketProgress(); // ⚡ auto-sync avec Socket.IO

    // Helper: detect uploads that are related to S3/HLS transfer and skip showing them
    const isS3Upload = (u: { file?: string; videoId: string }) => {
        const f = (u.file || '').toLowerCase();
        const vid = String(u.videoId).toLowerCase();

        // common hints: filename/path contains 's3' or 'hls' or 'hls_files',
        // or videoId sent by backend may contain 's3-' prefix in some setups
        if (!f && vid.startsWith('s3-')) return true;
        if (f.includes('s3') || f.includes('hls') || f.includes('hls_files') || f.includes('hls.js')) return true;
        return false;
    }

    useEffect(() => {
        if (uploads.length !== 0) {
            const handleBeforeUnload = (event: BeforeUnloadEvent) => {
                event.preventDefault();
                event.returnValue = ''; // nécessaire pour Chrome
            };

            window.addEventListener('beforeunload', handleBeforeUnload);

            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        };

    }, [uploads]);

    // filter out S3 uploads from the sticky panel
    const visibleUploads = uploads.filter((u) => !isS3Upload(u));

    if (visibleUploads.length === 0) return null;

    // Small fixed panel in bottom-right without backdrop blur so users can continue interacting
    return (
        <div className="fixed right-4 bottom-4 z-50">
            <div className="w-80 bg-white rounded-2xl shadow-xl p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-sm text-gray-700">
                        📤 Uploading
                    </h2>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {visibleUploads.map((u) => (
                        <div key={u.videoId} className="p-2 border rounded-xl bg-gray-50">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium">{u.file || "HLS Files"}</span>
                            </div>

                            <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                                <div
                                    className={`${u.status === "done"
                                        ? "bg-green-500"
                                        : u.status === "error"
                                            ? "bg-red-500"
                                            : "bg-blue-500"
                                        }`}
                                    style={{
                                        width: `${u.progress}%`,
                                        transition: "width 0.3s ease",
                                    }}
                                >
                                    {Number(u.progress) === 0 ? <div className="w-[40%] h-full bg-amber-400 waitprogress"></div> : null}
                                </div>
                            </div>
                            <div className="flex justify-between w-full gap-3">
                                <p className="text-[11px] mt-1 text-gray-500">
                                    {u.status === "done"
                                        ? "✅ finished"
                                        : u.status === "error"
                                            ? "❌ Erreur"
                                            : `⬆️ (${u.progress}%)`}
                                </p>
                                <p className="text-[11px] mt-1 text-gray-900 font-bold">
                                    {u.finish}/{u.total}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
