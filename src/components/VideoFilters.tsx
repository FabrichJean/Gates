/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useUsers } from "../hooks/useAuth";
import UseCategory from "../hooks/useCategory";
import { getFilteredVideos } from "../api/videos";
import UseSubCategory from "../hooks/useSubCategory";
import { mapStatus, reverseStatus } from "../utils/filter";

export type TFilter = {
    category_id: string;
    sub_category_id: string;
    user_id: string;
    isDeleted: string;
    upload_status: string;
    cover_upload_status: string;
    transfer_status: string;
    startedAt: string;
    endAt: string;
}


export default function VideoFilters({ onSubmit, params, filters, setFilters }: { params: any, filters: any, setFilters: any, onSubmit: (d: any) => void }) {

    const { data: users } = useUsers('');
    const { data: cat } = UseCategory();

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

        // ✅ sauvegarde locale pour rechargement ultérieur
        localStorage.setItem('videos_filtered', JSON.stringify(data));

        // ✅ fusion sécurisée des params (sans écraser les clés existantes)
        const safeParams = params || {};
        const finalQuery = { ...safeParams, ...data };

        try {
            const fetched = await getFilteredVideos(finalQuery);
            onSubmit(fetched.data);

            // ✅ feedback visuel (au choix)
            console.log("✅ Filtres appliqués :", finalQuery);
        } catch (error) {
            console.error("❌ Erreur lors du filtrage :", error);
        }
    };


    return (
        <dialog id="search_modal_52" className="modal">
            <div className="flex flex-col gap-4 modal-box w-max">

                {/* Sélections principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1 font-medium">Category</label>
                        <select
                            className="select select-bordered w-full outline-none"
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
                        <label className="block mb-1 font-medium">SubCategory</label>
                        <select
                            className="select select-bordered w-full"
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
                        <label className="block mb-1 font-medium">User</label>
                        <select
                            className="select select-bordered w-full outline-none"
                            value={filters.user_id}
                            onChange={(e) => handleChange("user_id", e.target.value)}
                        >
                            <option value=''>all</option>
                            {users?.map((u, i) => (
                                <option key={i} value={u.id}>{u.username}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 📅 Filtres de date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1 font-medium">Start Date</label>
                        <input
                            type="date"
                            className="input input-bordered w-full"
                            value={filters.startedAt}
                            onChange={(e) => handleChange("startedAt", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">End Date</label>
                        <input
                            type="date"
                            className="input input-bordered w-full"
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
                        <div key={key} className="p-3 bg-base-100 rounded-lg">
                            <p className="font-medium mb-2">{label}</p>
                            <div className="flex gap-3">
                                {["all", "yes", "no"].map((option) => (
                                    <label key={option} className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={key}
                                            className="radio radio-sm"
                                            checked={option === 'all' ? ( filters[key as keyof typeof filters] === 'all' || filters[key as keyof typeof filters] === '') : filters[key as keyof typeof filters] === option}
                                            onChange={() => handleChange(key, option)}
                                        />
                                        <span className="text-sm capitalize">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Boutons */}
                <form method="dialog" className="pt-3 flex justify-end gap-3">
                    <button className="btn btn-outline btn-sm">Close</button>

                    <div
                        className="btn btn-outline btn-sm"
                        onClick={async () => {
                            setFilters({
                                category_id: "",
                                user_id: "",
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

                    <button className="btn btn-primary btn-sm" onClick={submit}>
                        Apply
                    </button>
                </form>
            </div>
        </dialog>
    );
}
