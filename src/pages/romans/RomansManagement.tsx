import { useMemo, useState } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    Edit2,
    Trash2,
    Grid,
    List,
} from "lucide-react";
import UseRomans, { type TRoman } from "../../hooks/romans/useRomans";
import { Link } from "react-router-dom";
import CheckingRoman from "../../components/CheckingRoman";
import { useAuth } from "../../hooks/useAuth";
import useSocketCheckRomans from "../../hooks/romans/useSocketCheckRomans";

const RomansManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [page] = useState(1);
    const [viewMode, setViewMode] = useState<"card" | "table">("card");
    const { user } = useAuth();

    /* ===================== API ===================== */
    const { data, loading, reFetch } = UseRomans("all", page, searchTerm);
    const romans = data?.romans || [];

    /* ===================== SOCKET CHECKING ===================== */
    useSocketCheckRomans((data) => {
        // Refetch uniquement si c'est une mise à jour d'un autre utilisateur
        if (data.user_id !== user?.id) {
            setTimeout(() => reFetch(), 500);
        }
    });

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
                Loading novels...
            </div>
        );
    }

    /* ===================== STATS ===================== */
    const stats = {
        total: romans.length,
        published: romans.filter((r) => mapStatus(r) === "published").length,
        pending: romans.filter((r) => mapStatus(r) === "pending").length,
        deleted: romans.filter((r) => r.isDeleted).length,
    };

    function handleRemeveRoman(id: number): import("react").MouseEventHandler<HTMLButtonElement> {
        return (e) => {
            e.preventDefault();
            if (window.confirm("Are you sure you want to delete this novel?")) {
                // TODO: Call API to remove roman, then refresh list or update state
                // Example:
                // removeRoman(id).then(() => refetchRomans());
                alert(`Novel with ID ${id} deleted (simulation).`);
            }
        };
    }

    /* ===================== RENDER CARD ===================== */
    const renderCardView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRomans.map((roman) => (
                <div key={roman.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                    {roman.ref}
                                </h3>
                            </div>
                            {/* {getStatusBadge(mapStatus(roman))} */}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                {roman.creatorObj?.avatar ? (
                                    <img
                                        src={roman.creatorObj.avatar.startsWith('http') ? roman.creatorObj.avatar : `/${roman.creatorObj.avatar}`}
                                        alt={roman.creatorObj.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">
                                            {roman.creatorObj?.name?.charAt(0) || roman.creator?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <Link to={`/creators/${roman.creatorObj?.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-500">
                                        {roman.creatorObj?.name || roman.creator || "-"}
                                    </Link>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {roman.creatorObj.gender || "Unknown gender"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {roman.category?.name || "-"}
                                </p>
                                {roman.subCategory?.name && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {roman.subCategory.name}
                                    </p>
                                )}
                            </div>

                            {roman.plateform?.name && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {roman.plateform.name}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <CheckingRoman
                                roman={roman}
                                user={user}
                                index={filteredRomans.indexOf(roman)}
                            />
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    <Link to={`/romans/${roman.id}`} className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500">
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    <Link to={`/romans/edit/${roman.id}`} className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500">
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                    <button onClick={handleRemeveRoman(roman.id)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <MoreVertical className="w-4 h-4 text-gray-400 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    /* ===================== RENDER TABLE ===================== */
    const renderTableView = () => (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        {[
                            "ID",
                            "Reference",
                            "User",
                            "Creator",
                            "Category",
                            "Platform",
                            "Status",
                            "Checking",
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
                            <td className="px-4 py-3">
                                <span className="flex items-center hover:text-blue-500 dark:hover:text-blue-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                                        <path fillRule="evenodd" d="M11.89 4.111a5.5 5.5 0 1 0 0 7.778.75.75 0 1 1 1.06 1.061A7 7 0 1 1 15 8a2.5 2.5 0 0 1-4.083 1.935A3.5 3.5 0 1 1 11.5 8a1 1 0 0 0 2 0 5.48 5.48 0 0 0-1.61-3.889ZM10 8a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" clipRule="evenodd" />
                                    </svg>

                                    <Link to={`/users/${roman.user_id}`}>
                                        {roman.user?.username || roman.user_id}
                                    </Link>
                                </span>
                            </td>
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
                            <td className="px-4 py-3">
                                <CheckingRoman
                                    roman={roman}
                                    user={user}
                                    index={romans.indexOf(roman)}
                                />
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
                    No novels found
                </div>
            )}
        </div>
    );

    /* ===================== RENDER ===================== */
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Romans management
                    </h1>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[
                        ["Total", stats.total],
                        ["Published", stats.published],
                        ["Pending", stats.pending],
                        ["Deleted", stats.deleted],
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
                <div className="p-4 rounded-lg mb-6 flex justify-between items-center">
                    <div className="flex gap-4 items-center justify-between w-full">
                        <button className="relative flex items-center cursor-pointer outline-none">
                            <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <span className="pl-9 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                Filters
                            </span>
                        </button>

                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("card")}
                                className={`p-2 rounded outline-none ${viewMode === "card"
                                    ? "bg-blue-500 text-white"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                                title="Card View"
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={`p-2 rounded outline-none ${viewMode === "table"
                                    ? "bg-blue-500 text-white"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                                title="Table View"
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {viewMode === "card" ? renderCardView() : renderTableView()}

                {filteredRomans.length === 0 && (
                    <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg">
                        No novels found
                    </div>
                )}
            </div>
        </div>
    );
};

export default RomansManagement;