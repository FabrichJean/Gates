/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useUsers } from "../hooks/useAuth";
import UseCategory from "../hooks/useCategory";
import UseSubCategory from "../hooks/useSubCategory";
import { mapStatus, reverseStatus } from "../utils/filter";
import UseCreators from "../hooks/useCreators";

export type TFilter = {
    category_id: string;
    sub_category_id: string;
    user_id: string;
    creator_id: string;
    isDeleted: string;
    upload_status: string;
    cover_upload_status: string;
    transfer_status: string;
    startedAt: string;
    endAt: string;
}


export default function VideoFilters({ onSubmit, params, filters, setFilters, scope = "videos" }: { params: any, filters: any, setFilters: any, onSubmit: (d: any) => void, scope?: "videos" | "bot" }) {

    const { data: users } = useUsers('');
    const { data: cat } = UseCategory();
    const { data: creators } = UseCreators();

    const { data: subcat } = UseSubCategory(Number(filters?.category_id));


    // 🧩 Chargement des filtres sauvegardés
    useEffect(() => {
        try {
            const saved = localStorage.getItem('videos_filtered');
            if (!saved) return;

            const savedFilter = JSON.parse(saved);

            const _ = {
                ...savedFilter,
                isDeleted: reverseStatus(savedFilter.isDeleted),
                cover_upload_status: reverseStatus(savedFilter.cover_upload_status),
                transfer_status: reverseStatus(savedFilter.transfer_status),
                upload_status: reverseStatus(savedFilter.upload_status),
                startedAt: savedFilter.startedAt || "",
                endAt: savedFilter.endAt || "",
            };

            setFilters(_);
        } catch (e) {
            console.warn("⚠️ Impossible de lire le filtre sauvegardé :", e);
            localStorage.removeItem('videos_filtered');
        }
    }, []);

    const handleChange = (key: string, value: string) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    // 🧠 Soumission des filtres
    const submit = async () => {
        const data = {
            ...filters,
            isDeleted: mapStatus(filters.isDeleted),
            cover_upload_status: mapStatus(filters.cover_upload_status),
            transfer_status: mapStatus(filters.transfer_status),
            upload_status: mapStatus(filters.upload_status),
        };

        localStorage.setItem('videos_filtered', JSON.stringify(data));

        const safeParams = params || {};
        const finalQuery = { ...safeParams, ...data };

        try {
            let fetched;
            if (scope === "bot") {
                // lazy import the bot api to avoid cycles
                const { getFilteredBotVideos } = await import("../api/videoBot");
                fetched = await getFilteredBotVideos(finalQuery);
            } else {
                const { getFilteredVideos } = await import("../api/videos");
                fetched = await getFilteredVideos(finalQuery);
            }

            onSubmit(fetched.data);

            console.log("✅ Filtres appliqués :", finalQuery);
        } catch (error) {
            console.error(" Erreur lors du filtrage :", error);
        }
    };


    return (
        <dialog id="search_modal_52" className="modal">
            <div className="flex flex-col gap-4 modal-box w-max bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300">

                {/* Sélections principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select
                            className="select select-bordered w-full outline-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                            value={filters.category_id}
                            onChange={(e) => handleChange("category_id", e.target.value)}
                        >
                            <option value=''>all</option>
                            {cat?.map?.((c, i) => (
                                <option key={i} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">SubCategory</label>
                        <select
                            className="select select-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                            value={filters.sub_category_id}
                            onChange={(e) => handleChange("sub_category_id", e.target.value)}
                        >
                            <option value=''>all</option>
                            {subcat?.SubCategorys?.map((c, i) => (
                                <option key={i} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">User</label>
                        <select
                            className="select select-bordered w-full outline-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                            value={filters.user_id}
                            onChange={(e) => handleChange("user_id", e.target.value)}
                        >
                            <option value=''>all</option>
                            {users?.map((u, i) => (
                                <option key={i} value={u.id}>{u.username}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Creator</label>
                        <select
                            className="select select-bordered w-full outline-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                            value={filters.creator_id}
                            onChange={(e) => handleChange("creator_id", e.target.value)}
                        >
                            <option value=''>all</option>
                            {creators?.map((c, i) => (
                                <option key={i} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 📅 Filtres de date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                        <input
                            type="date"
                            className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                            value={filters.startedAt}
                            onChange={(e) => handleChange("startedAt", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">End Date</label>
                        <input
                            type="date"
                            className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                            value={filters.endAt}
                            onChange={(e) => handleChange("endAt", e.target.value)}
                        />
                    </div>
                </div>

                {/* Filtres booléens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { key: "isDeleted", label: "Deleted" },
                        { key: "upload_status", label: "Video Uploaded" },
                        { key: "cover_upload_status", label: "Cover Uploaded" },
                        { key: "transfer_status", label: "Transferred" },
                    ].map(({ key, label }) => (
                        <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300">
                            <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">{label}</p>
                            <div className="flex gap-3">
                                {["all", "yes", "no"].map((option) => (
                                    <label key={option} className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={key}
                                            className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                                            checked={option === 'all' ? ( filters[key as keyof typeof filters] === 'all' || filters[key as keyof typeof filters] === '') : filters[key as keyof typeof filters] === option}
                                            onChange={() => handleChange(key, option)}
                                        />
                                        <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Boutons */}
                <form method="dialog" className="pt-3 flex justify-end gap-3">
                    <button className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">Close</button>

                    <div
                        className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
                        onClick={async () => {
                            setFilters({
                                category_id: "",
                                user_id: "",
                                creator_id: "",
                                isDeleted: "all",
                                upload_status: "all",
                                cover_upload_status: "all",
                                transfer_status: "all",
                                sub_category_id: "",
                                startedAt: "",
                                endAt: "",
                            });
                            localStorage.removeItem('videos_filtered');
                            await submit();
                        }}
                    >
                        Reset
                    </div>

                    <button className="btn btn-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-none transition-colors duration-300" onClick={submit}>
                        Apply
                    </button>
                </form>
            </div>
        </dialog>
    );
}
