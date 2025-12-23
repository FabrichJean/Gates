import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { apiURL } from "../../constant";
import { getToken } from "../../utils/storage";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Calendar,
    User,
    FolderTree,
    FolderOpen,
    Globe,
    Tag,
    BookOpen,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    Loader2,
    ImageOff,
} from "lucide-react";
import toast from "react-hot-toast";
import AddChapterModal from "../../components/AddChapterModal";

type RomanTitle = {
    id: number;
    title: string;
    description: string;
    i18_language: string;
    language: {
        code: string;
        name: string;
    };
};

type Category = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
};

type SubCategory = {
    id: number;
    name: string;
    category_id: number;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
};

type Creator = {
    id: number;
    name: string;
    avatar: string | null;
    gender: string;
};

type Platform = {
    id: number;
    name: string;
    video_sync_url: string | null;
    post_sync_url: string | null;
};

type UserInfo = {
    id: number;
    username: string;
    email: string;
    role: string;
};

type Roman = {
    id: number;
    checking: string;
    processing: string;
    ref: string;
    comment: string | null;
    user_id: number;
    creator: string | null;
    creator_id: number | null;
    category_id: number;
    sub_category_id: number | null;
    total_words: number;
    chapters_count: number;
    need_vip: boolean;
    isDeleted: boolean;
    plateform_id: number;
    cover: string;
    s3_cover_path: string | null;
    cover_upload_status: number;
    local_cover_path: string;
    createdAt: string;
    updatedAt: string;
    titles: RomanTitle[];
    chapters: any[];
    category: Category;
    subCategory: SubCategory | null;
    creatorObj: Creator | null;
    plateform: Platform;
    user: UserInfo;
    public_urls: {
        cover_url: string;
        local_cover_url: string;
    };
    s3_urls: {
        coverUrl: string | null;
    };
};

const RomanDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [roman, setRoman] = useState<Roman | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);
    const [showAddChapterModal, setShowAddChapterModal] = useState(false);

    const fetchRomanDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${apiURL}/romans/${id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });
            setRoman(response.data);
        } catch (error: any) {
            console.error("Error fetching roman details:", error);
            toast.error("Failed to load roman details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchRomanDetails();
        }
    }, [id]);

    const handleChapterAdded = () => {
        fetchRomanDetails();
    };

    const getCheckingStatusColor = (status: string) => {
        switch (status) {
            case "checked":
                return "text-green-600 dark:text-green-400";
            case "waiting for checking":
                return "text-yellow-600 dark:text-yellow-400";
            case "refused":
                return "text-red-600 dark:text-red-400";
            default:
                return "text-gray-600 dark:text-gray-400";
        }
    };

    const getCheckingStatusIcon = (status: string) => {
        switch (status) {
            case "checked":
                return <CheckCircle className="w-5 h-5" />;
            case "waiting for checking":
                return <Clock className="w-5 h-5" />;
            case "refused":
                return <XCircle className="w-5 h-5" />;
            default:
                return <Clock className="w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading roman details...</p>
                </div>
            </div>
        );
    }

    if (!roman) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-xl">Roman not found</p>
                    <button
                        onClick={() => navigate("/romans")}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                        Back to Romans
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 rounded-lg transition-all duration-300 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate("/romans")}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Romans
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Roman Details
                        </h1>
                        <div className="flex items-center gap-4">
                            {/* btn switch edit */}
                            <Link to={`/romans/edit/${roman.id}`} className="inline-block p-2 animate-pulse transition-all">
                                {/* icon svg edit */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 inline-block mr-2"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cover Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                            {roman.public_urls.cover_url || roman.public_urls.local_cover_url ? (
                                <img
                                    src={roman.public_urls.cover_url || roman.public_urls.local_cover_url}
                                    alt="Roman Cover"
                                    className="w-full rounded-lg shadow-md object-cover"
                                />
                            ) : (
                                <div className="w-full aspect-[2/3] rounded-lg shadow-md bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex flex-col items-center justify-center">
                                    <ImageOff className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-2" />
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">No cover image</p>
                                </div>
                            )}
                            <div className="mt-4 space-y-2">
                                <div className={`flex items-center gap-2 ${getCheckingStatusColor(roman.checking)}`}>
                                    {getCheckingStatusIcon(roman.checking)}
                                    <span className="font-semibold capitalize">{roman.checking}</span>
                                </div>
                                {roman.need_vip && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
                                        <Tag className="w-4 h-4" />
                                        VIP Required
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Basic Info */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Reference</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{roman.ref}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Chapters</p>
                                    <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        <Link to={`/romans/${roman.id}/chapters`} className="flex items-center gap-1">
                                            {roman.chapters_count} <span className="underline hover:text-blue-600 dark:hover:text-blue-400" title="">chapters</span>
                                        </Link>
                                        <button
                                            onClick={() => setShowAddChapterModal(true)}
                                            className="p-1 cursor-pointer rounded-md bg-blue-100 dark:bg-blue-600/30 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                            title="New chapter for this roman"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Words</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{roman.total_words.toLocaleString()} words</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(roman.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Titles */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                                Titles & Descriptions
                            </h2>

                            {/* Onglets de langues */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                {roman.titles.map((title, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setSelectedTitleIndex(index)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedTitleIndex === index
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {title.language.name}
                                    </button>
                                ))}
                            </div>

                            {/* Contenu de la langue sélectionnée */}
                            {roman.titles[selectedTitleIndex] && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                            Title ({roman.titles[selectedTitleIndex].language.name})
                                        </label>
                                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                {roman.titles[selectedTitleIndex].title}
                                            </p>
                                        </div>
                                    </div>

                                    {roman.titles[selectedTitleIndex].description && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                Description ({roman.titles[selectedTitleIndex].language.name})
                                            </label>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                    {roman.titles[selectedTitleIndex].description}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Category & Platform */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                    <FolderTree className="w-5 h-5" />
                                    Category
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">{roman.category.name}</p>
                                {roman.subCategory && (
                                    <>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mt-4 mb-3 flex items-center gap-2">
                                            <FolderOpen className="w-5 h-5" />
                                            Sub Category
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">{roman.subCategory.name}</p>
                                    </>
                                )}
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    Platform
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">{roman.plateform.name}</p>
                            </div>
                        </div>

                        {/* Creator & User */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {roman.creatorObj && (
                                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Creator
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        {roman.creatorObj.avatar ? (
                                            <img
                                                src={roman.creatorObj.avatar}
                                                alt={roman.creatorObj.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <User className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                {roman.creatorObj.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                {roman.creatorObj.gender}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Uploaded By
                                </h3>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                                        {roman.user.username}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{roman.user.email}</p>
                                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                                        {roman.user.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Add Chapter Modal */}
            {roman && (
                <AddChapterModal
                    isOpen={showAddChapterModal}
                    onClose={() => setShowAddChapterModal(false)}
                    romanId={roman.id}
                    onSuccess={handleChapterAdded}
                />
            )}
        </div>
    );
};

export default RomanDetails;