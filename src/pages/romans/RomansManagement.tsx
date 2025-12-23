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
    Send,
    BookOpen,
    User,
    Calendar,
    Tag,
    Globe,
    ChevronDown,
    FilePlus,
} from "lucide-react";
import { GrChapterAdd } from "react-icons/gr";
import { MdAssignmentAdd } from "react-icons/md";
import UseRomans, { type TRoman } from "../../hooks/romans/useRomans";
import { Link } from "react-router-dom";
import CheckingRoman from "../../components/CheckingRoman";
import { useAuth } from "../../hooks/useAuth";
import useSocketCheckRomans from "../../hooks/romans/useSocketCheckRomans";
import { FaBookOpen } from "react-icons/fa";

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
        if (data.user_id !== user?.id) {
            setTimeout(() => reFetch(), 500);
        }
    });

    /* ===================== STATUS ===================== */
    const mapStatus = (roman: TRoman) => {
        if (roman.isDeleted) return "deleted";
        if (roman.checking === "waiting for checking") return "pending";
        if (roman.checking === "refused") return "refused";
        if (roman.processing === "done") return "published";
        return "draft";
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
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

    /* ===================== UTILS ===================== */
    const truncateText = (text: string, maxLength: number = 25) => {
        if (!text) return "-";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published": return "bg-green-100 text-green-800";
            case "pending": return "bg-yellow-100 text-yellow-800";
            case "refused": return "bg-red-100 text-red-800";
            case "deleted": return "bg-gray-100 text-gray-800";
            default: return "bg-blue-100 text-blue-800";
        }
    };

    /* ===================== RENDER CARD ===================== */
    const renderCardView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRomans.map((roman) => (
                <div key={roman.id} className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Cover Image */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400">
                        {roman.public_urls?.cover_url ? (
                            <img
                                src={roman.public_urls.cover_url}
                                alt={roman.ref}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-16 h-16 text-white/50" />
                            </div>
                        )}
                        <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mapStatus(roman))}`}>
                                {mapStatus(roman)}
                            </span>
                        </div>
                    </div>

                    <div className="p-5">
                        {/* Title */}
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2" title={roman.ref}>
                            {truncateText(roman.ref)}
                        </h3>

                        {/* Creator Info */}
                        <div className="flex items-center gap-3 mb-4">
                            {roman.creatorObj?.avatar ? (
                                <img
                                    src={roman.creatorObj.avatar}
                                    alt={roman.creatorObj.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">
                                        {roman.creatorObj?.name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            )}
                            <div>
                                <Link to={`/creators/${roman.creatorObj?.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-500">
                                    {roman.creatorObj?.name || "-"}
                                </Link>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {roman.creatorObj?.gender || "Unknown"}
                                </p>
                            </div>
                        </div>

                        {/* Category & Platform */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Tag className="w-4 h-4" />
                                <span>{roman.category?.name || "-"}</span>
                                {roman.subCategory?.name && (
                                    <span className="text-xs text-gray-500">• {roman.subCategory.name}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Globe className="w-4 h-4" />
                                <span>{roman.plateform?.name || "-"}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <CheckingRoman
                                roman={roman}
                                user={user}
                                index={filteredRomans.indexOf(roman)}
                            />
                            <div className="flex items-center gap-2">
                                <Link
                                    to={`/romans/${roman.id}`}
                                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                </Link>
                                <Link
                                    to={`/romans/edit/${roman.id}`}
                                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Link>
                                <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-teal-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    /* ===================== RENDER TABLE ===================== */
    const renderTableView = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Cover
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Creator
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Platform
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Checking
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredRomans.map((roman) => (
                            <tr key={roman.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    {roman.public_urls?.cover_url ? (
                                        <img
                                            src={roman.public_urls?.cover_url}
                                            alt={roman.ref}
                                            className="w-12 h-16 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                            <BookOpen className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white" title={roman.ref}>
                                            {truncateText(roman.ref, 20)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            ID: {roman.id}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {roman.creatorObj?.avatar ? (
                                            <img
                                                src={roman.creatorObj.avatar}
                                                alt={roman.creatorObj.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">
                                                    {roman.creatorObj?.name?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                        )}
                                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                                            <Link to={`/creators/${roman.creatorObj?.id}`} className="hover:text-blue-500">
                                                {roman.creatorObj?.name || "-"}
                                            </Link>
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
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
                                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                                    {roman.plateform?.name || "-"}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(mapStatus(roman))}`}>
                                        {mapStatus(roman)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <CheckingRoman
                                        roman={roman}
                                        user={user}
                                        index={romans.indexOf(roman)}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            to={`/romans/${roman.id}`}
                                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            to={`/romans/edit/${roman.id}`}
                                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-teal-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredRomans.length === 0 && (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium mb-2">No novels found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                </div>
            )}
        </div>
    );

    /* ===================== RENDER ===================== */
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 rounded-sm">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                        Romans Management
                    </h1>
                    {/* bouton bascule vers `romans/upload` */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <Link
                            to="/romans/upload"
                            className="px-2 py-2 border border-blue-400 text-gray-700 rounded-md hover:border-blue-700 transition-colors text-center whitespace-nowrap text-sm sm:text-base"
                        >
                            <FilePlus className="w-5 h-auto text-blue-400 dark:text-blue-300" />
                        </Link>
                        <Link
                            to="/romans/chapters"
                            className="px-4 py-2 border border-teal-600 text-teal-600 dark:text-teal-700 rounded-sm shadow-sm hover:border-teal-700 transition-colors text-center whitespace-nowrap text-sm sm:text-base"
                        >
                            <GrChapterAdd className="w-4 h-4 inline-block mr-2" />
                            Manage Chapters
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                            </div>
                            <BookOpen className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                            </div>
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Deleted</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.deleted}</p>
                            </div>
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/*  */}
                        <div className="flex items-center gap-4 w-full lg:w-auto"> </div>
                        {/* View Toggle */}
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 ml-auto">
                            <button
                                onClick={() => setViewMode("card")}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "card"
                                    ? "bg-white dark:bg-gray-600 text-blue-500 shadow-sm"
                                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "table"
                                    ? "bg-white dark:bg-gray-600 text-blue-500 shadow-sm"
                                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {viewMode === "card" ? renderCardView() : renderTableView()}

                {filteredRomans.length === 0 && (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-xl font-medium mb-2">No novels found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RomansManagement;