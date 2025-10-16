import { useEffect, useState } from "react";
import { useUsers } from "../hooks/useAuth";
import UseCategory from "../hooks/useCategory";
import { getFilteredVideos } from "../api/videos";

export default function FilterPanel({ onSubmit }: { onSubmit: (d: any) => void }) {

    const { data: users } = useUsers()
    const { data: cat } = UseCategory()

    const [filters, setFilters] = useState({
        category_id: "",
        user_id: "",
        isDeleted: "all",
        upload_status: "all",
        cover_upload_status: "all",
        transfer_status: "all",
    });

    const reverseStatus = (value: string) => {
        if (value === '1') return 'display';
        if (value === '0') return 'hidden';
        return 'all';
    };


    useEffect(() => {
        try {
            const saved = localStorage.getItem('videos_filtered');
            if (!saved) return; // rien à charger

            const savedFilter = JSON.parse(saved);

            const _ = {
                ...savedFilter,
                isDeleted: reverseStatus(savedFilter.isDeleted),
                cover_upload_status: reverseStatus(savedFilter.cover_upload_status),
                transfer_status: reverseStatus(savedFilter.transfer_status),
                upload_status: reverseStatus(savedFilter.upload_status),
            };

            setFilters(_);
        } catch (e) {
            console.warn("⚠️ Impossible de lire le filtre sauvegardé :", e);
            localStorage.removeItem('videos_filtered');
        }
    }, []);


    const handleChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const mapStatus = (value: string) => {
        if (value === 'display') return '1';
        if (value === 'hidden') return '0';
        return null;
    };

    const submit = async () => {
        const data = {
            ...filters,
            isDeleted: mapStatus(filters.isDeleted),
            cover_upload_status: mapStatus(filters.cover_upload_status),
            transfer_status: mapStatus(filters.transfer_status),
            upload_status: mapStatus(filters.upload_status),
        };

        localStorage.setItem('videos_filtered', JSON.stringify(data))

        try {

            const fetched = await getFilteredVideos(data)

            console.log(fetched);

            onSubmit(fetched)

        } catch (error) {
            console.error(error);

        }

    }

    return (
        <dialog id="search_modal_52" className="modal">
            <div className="flex flex-col gap-4 modal-box w-max">
                {/* <h2 className="text-lg font-semibold">Filtrer les vidéos</h2> */}

                {/* Sélections principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1 font-medium">Category</label>
                        <select
                            className="select select-bordered w-full"
                            value={filters.category_id}
                            onChange={(e) => handleChange("category_id", e.target.value)}
                        >
                            <option value=''>all</option>
                            {
                                cat?.map(c => (
                                    <option value={c.id}>{c.name}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">User</label>
                        <select
                            className="select select-bordered w-full"
                            value={filters.user_id}
                            onChange={(e) => handleChange("user_id", e.target.value)}
                        >
                            <option value=''>all</option>
                            {
                                users?.map(u => (
                                    <option value={u.id}>{u.username}</option>
                                ))
                            }
                        </select>
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
                                {["all", "display", "hidden"].map((option) => (
                                    <label key={option} className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={key}
                                            className="radio radio-sm"
                                            checked={filters[key as keyof typeof filters] === option}
                                            onChange={() => handleChange(key, option)}
                                        />
                                        <span className="text-sm capitalize">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-3 flex justify-end gap-3">
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                            setFilters({
                                category_id: "",
                                user_id: "",
                                isDeleted: "all",
                                upload_status: "all",
                                cover_upload_status: "all",
                                transfer_status: "all",
                            })
                            localStorage.removeItem('videos_filtered')
                        }
                        }
                    >
                        Réinitialiser
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={submit}>Appliquer</button>
                </div>
            </div>
        </dialog>
    );
}
