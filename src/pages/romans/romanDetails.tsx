import { useParams, useNavigate } from "react-router-dom";
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

    useEffect(() => {
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

        if (id) {
            fetchRomanDetails();
        }
    }, [id]);

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-6">
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
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Roman Details
                    </h1>
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
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                        <BookOpen className="w-4 h-4" />
                                        {roman.chapters_count} chapters
                                    </p>
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
                            <div className="space-y-4">
                                {roman.titles.map((title, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                                                {title.language.name}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                                            {title.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            {title.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
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
        </div>
    );
};

export default RomanDetails;