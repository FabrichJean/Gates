import { useMemo, useState } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    Edit2,
    Trash2,
} from "lucide-react";
import UseRomans, { type TRoman } from "../../hooks/romans/useRomans";
import { Link } from "react-router-dom";

const RomansManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [page] = useState(1);

    /* ===================== API ===================== */
    const { data, loading } = UseRomans("all", page, searchTerm);
    const romans = data?.romans || [];

    /* ===================== STATUS ===================== */
    const mapStatus = (roman: TRoman) => {
        if (roman.isDeleted) return "deleted";
        if (roman.checking === "waiting for checking") return "pending";
        if (roman.checking === "refused") return "rejected";
        if (roman.processing === "done") return "published";
        return "draft";
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            published:
                "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
            draft:
                "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
            pending:
                "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
            rejected:
                "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
            deleted:
                "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
                {status}
            </span>
        );
    };

    /* ===================== FILTER ===================== */
    const filteredRomans = useMemo(() => {
        return romans.filter((roman) => {
            const status = mapStatus(roman);

            const matchesSearch =
                roman.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (roman.creator || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (roman.plateform?.name || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesStatus =
                selectedStatus === "all" || status === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [romans, searchTerm, selectedStatus]);

    /* ===================== LOADING ===================== */
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Chargement des romans...
            </div>
        );
    }

    /* ===================== STATS ===================== */
    const stats = {
        total: data?.total || 0,
        totalSent: data?.totalSent || 0,
        published: romans.filter((r) => mapStatus(r) === "published").length,
        pending: romans.filter((r) => mapStatus(r) === "pending").length,
        deleted: romans.filter((r) => r.isDeleted).length,
    };

    function handleRemeveRoman(id: number): import("react").MouseEventHandler<HTMLButtonElement> {
        return (e) => {
            e.preventDefault();
            if (window.confirm("Êtes-vous sûr de vouloir supprimer ce roman ?")) {
                // TODO: Call API to remove roman, then refresh list or update state
                // Example:
                // removeRoman(id).then(() => refetchRomans());
                alert(`Roman avec l'ID ${id} supprimé (simulation).`);
            }
        };
    }

    /* ===================== RENDER ===================== */
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                    Romans management
                </h1>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    {[
                        ["Total", stats.total],
                        ["Envoyés", stats.totalSent],
                        ["Publiés", stats.published],
                        ["En attente", stats.pending],
                        ["Supprimés", stats.deleted],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                        >
                            <div className="text-2xl font-bold">{value}</div>
                            <div className="text-sm text-gray-500">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className=" p-4 rounded-lg mb-6 flex gap-4">
                    <div className="relative">
                        <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <button className="pl-9 pr-3 py-2 border rounded">
                            Filtres
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                {[
                                    "ID",
                                    "Référence",
                                    "User",
                                    "Créateur",
                                    "Catégorie",
                                    "Plateforme",
                                    "Statut",
                                    "Actions",
                                ].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRomans.map((roman) => (
                                <tr key={roman.id} className="border-t">
                                    <td className="px-4 py-3">{roman.id}</td>
                                    <td className="px-4 py-3">{roman.ref}</td>
                                    <td className="px-4 py-3">{roman.user_id}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {roman.creatorObj?.avatar ? (
                                                <img
                                                    src={roman.creatorObj.avatar.startsWith('http') ? roman.creatorObj.avatar : `/${roman.creatorObj.avatar}`}
                                                    alt={roman.creatorObj.name}
                                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">
                                                        {roman.creatorObj?.name?.charAt(0) || roman.creator?.charAt(0) || 'U'}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-gray-900 dark:text-gray-100 font-medium hover:text-blue-500 dark:hover:text-blue-400">
                                                <Link to={`/creators/${roman.creatorObj?.id}`}>
                                                    {roman.creatorObj?.name || roman.creator || "-"}
                                                </Link>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {roman.category?.name || "-"}
                                            </span>
                                            {roman.subCategory?.name && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {roman.subCategory.name}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {roman.plateform?.name || "-"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(mapStatus(roman))}
                                    </td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <Link to={`/romans/${roman.id}`}>
                                            <Eye className="w-4 h-4 cursor-pointer" />
                                        </Link>
                                        <Link to={`/romans/edit/${roman.id}`}>
                                            <Edit2 className="w-4 h-4 cursor-pointer text-blue-500" />
                                        </Link>
                                        <button className="" onClick={handleRemeveRoman(roman.id)}>
                                            <Trash2 className="w-4 h-4 cursor-pointer text-red-500" />
                                        </button>
                                        <MoreVertical className="w-4 h-4 cursor-pointer" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredRomans.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            Aucun roman trouvé
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RomansManagement;
