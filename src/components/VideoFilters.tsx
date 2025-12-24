/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useUsers } from "../hooks/useAuth";
import UseCategory from "../hooks/useCategory";
import UseSubCategory from "../hooks/useSubCategory";
import { mapStatus, mapStatusProcessing, reverseStatus } from "../utils/filter";
import UseCreators from "../hooks/useCreators";

export type TFilter = {
    category_id: string;
    sub_category_id: string;
    user_id: string;
    creator_id: string;
    creatorSearch?: string;
    isDeleted: string;
    processing: string;
    startedAt: string;
    endAt: string;
};

export default function VideoFilters({
    onSubmit,
    params,
    filters,
    setFilters,
    scope = "videos",
}: {
    params: any;
    filters: any;
    setFilters: any;
    onSubmit: (d: any) => void;
    scope?: "videos" | "bot";
}) {
    const { data: users } = useUsers("");
    const { data: creators } = UseCreators();
    const { data: cat } = UseCategory();
    const { data: subcat } = UseSubCategory(Number(filters?.category_id));

    const [creatorOpen, setCreatorOpen] = useState(false);
    const creatorRef = useRef<HTMLDivElement>(null);

    // Chargement des filtres sauvegardés
    useEffect(() => {
        try {
            const saved = localStorage.getItem("videos_filtered");
            if (!saved) return;

            const savedFilter = JSON.parse(saved);

            const _ = {
                ...savedFilter,
                isDeleted: reverseStatus(savedFilter.isDeleted),
                processing: mapStatusProcessing(savedFilter.processing),
                startedAt: savedFilter.startedAt || "",
                endAt: savedFilter.endAt || "",
                // restore creatorSearch if present
                creatorSearch: savedFilter.creatorSearch || savedFilter.creator || "",
            };

            setFilters(_);
        } catch (e) {
            console.warn("⚠️ Impossible de lire le filtre sauvegardé :", e);
            localStorage.removeItem("videos_filtered");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // fermer dropdown creator au clic hors zone
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (creatorRef.current && !creatorRef.current.contains(event.target as Node)) {
                setCreatorOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (key: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    // Soumission des filtres
    const submit = async () => {
        const data = {
            ...filters,
            isDeleted: mapStatus(filters.isDeleted),
            processing: mapStatusProcessing(filters.processing),
        };

        localStorage.setItem("videos_filtered", JSON.stringify(data));

        const safeParams = params || {};
        const finalQuery = { ...safeParams, ...data, page: '1' };

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
        } catch (error) {
            console.error(" Erreur lors du filtrage :", error);
        }
    };

    const closeModal = () => {
        const modal = document.getElementById(
            "search_modal_52"
        ) as HTMLDialogElement | null;

        modal?.close();
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
                            {cat?.map?.((c: any, i: number) => (
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
                            {subcat?.SubCategorys?.map((c: any, i: number) => (
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
                            {users?.map((u: any, i: number) => (
                                <option key={i} value={u.id}>{u.username}</option>
                            ))}
                        </select>
                    </div>

                    {/* Creator searchable */}
                    <div ref={creatorRef} className="relative">
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Creator</label>

                        <input
                            type="text"
                            placeholder="Search creator..."
                            value={filters.creatorSearch || ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                    // si l'utilisateur efface l'input, vide aussi creator_id
                                    handleChange("creatorSearch", "");
                                    handleChange("creator_id", "");
                                } else {
                                    handleChange("creatorSearch", value);
                                }
                            }}
                            onFocus={() => setCreatorOpen(true)}
                            className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition"
                        />

                        {creatorOpen && (
                            <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                                <div
                                    className="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                                    onClick={() => {
                                        handleChange("creator_id", "");
                                        handleChange("creatorSearch", "");
                                        setCreatorOpen(false);
                                    }}
                                >
                                    all
                                </div>

                                {(!creators || creators.length === 0) && (
                                    <div className="px-3 py-2 text-gray-500">No creators found</div>
                                )}

                                {creators
                                    ?.filter((c: any) =>
                                        c.name?.toLowerCase().includes((filters.creatorSearch || "").toLowerCase())
                                    )
                                    .map((c: any) => (
                                        <div
                                            key={c.id}
                                            className="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                                            onClick={() => {
                                                handleChange("creator_id", String(c.id));
                                                handleChange("creatorSearch", c.name);
                                                setCreatorOpen(false);
                                            }}
                                        >
                                            {c.name}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Filtres de date */}
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
                        { key: "processing", label: "Video Uploaded" },
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
                                            checked={
                                                option === "all"
                                                    ? (filters[key as keyof typeof filters] === "all" || filters[key as keyof typeof filters] === "")
                                                    : filters[key as keyof typeof filters] === option
                                            }
                                            onChange={() => handleChange(key, option)}
                                        />
                                        <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <form method="dialog" className="pt-3 flex justify-end gap-3">
                    <button className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">Close</button>

                    <div
                        className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
                        onClick={async () => {
                            setFilters({
                                category_id: "",
                                user_id: "",
                                creator_id: "",
                                creatorSearch: "",
                                isDeleted: "all",
                                processing: "",
                                sub_category_id: "",
                                startedAt: "",
                                endAt: "",
                            });
                            localStorage.removeItem("videos_filtered");
                            await submit();
                        }}
                    >
                        Reset
                    </div>

                    <button
                        className="btn btn-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-none transition-colors duration-300"
                        onClick={(e) => {
                            e.preventDefault();
                            submit();
                            closeModal();
                        }}
                    >
                        Apply
                    </button>
                </form>
            </div>
        </dialog>
    );
}
