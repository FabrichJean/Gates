import { Tag, FolderTree, FolderOpen, Globe, User, FileText, Upload, Loader2, ArrowLeft } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import RomanCategoryAutoComplete, { type RomanCategory } from "../../components/RomanCategoryAutoComplete";
import RomanSubCategoryAutoComplete, { type RomanSubCategory } from "../../components/RomanSubCategoryAutoComplete";
import FileUploadZone from "../../components/FileUploadZone";
import PlatformSelectComponent from "../../components/PlatformSelectComponent";
import CreatorAutoComplete from "../../components/CreatorAutoComplete";
import type { Platform } from "../../hooks/usePlatform";
import LanguageAutoComplete from "../../components/LanguageAutoComplete";
import type { Couple } from "../Upload";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../constant";
import { getToken } from "../../utils/storage";
import { motion } from "framer-motion";

const RomanEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [ref, setRef] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<RomanCategory | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<RomanSubCategory | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string>("");
    const [platform, setPlatform] = useState<Platform | null>(null);
    const [creator, setCreator] = useState<string | null>(null);
    const [creatorId, setCreatorId] = useState<number | null>(null);
    const [coupleTitles, setCoupleTitles] = useState<Couple[]>([
        {
            id: null,
            language: null,
            i18_language: "",
            title: "",
            description: "",
        },
    ]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Charger les données du roman
    useEffect(() => {
        const fetchRomanData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${apiURL}/romans/${id}`, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                });
                const roman = response.data;

                // Pré-remplir les champs
                setRef(roman.ref);
                setSelectedCategory(roman.category);
                setSelectedSubCategory(roman.subCategory);
                setPlatform(roman.plateform);
                setCreator(roman.creator || roman.creatorObj?.name || null);
                setCreatorId(roman.creator_id);
                
                // Pré-remplir les titres
                if (roman.titles && roman.titles.length > 0) {
                    setCoupleTitles(roman.titles.map((t: any) => ({
                        id: t.id,
                        language: null,
                        i18_language: t.i18_language,
                        title: t.title,
                        description: t.description,
                    })));
                }

                // Pré-remplir la cover preview
                if (roman.public_urls?.cover_url || roman.public_urls?.local_cover_url) {
                    setCoverPreview(roman.public_urls.cover_url || roman.public_urls.local_cover_url);
                }
            } catch (error: any) {
                console.error("Error fetching roman data:", error);
                toast.error("Failed to load roman data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRomanData();
        }
    }, [id]);

    const handleCoverSelect = (file: File, preview: string) => {
        setCoverFile(file);
        setCoverPreview(preview);
    };

    const handleTitleChange = (index: number, field: keyof Couple, value: string) => {
        const newCouples = [...coupleTitles];
        (newCouples[index] as any)[field] = value;
        setCoupleTitles(newCouples);
    };

    const addTitleLanguage = () => {
        setCoupleTitles((c) => [
            ...c,
            {
                id: null,
                language: null,
                i18_language: "",
                title: "",
                description: "",
            },
        ]);
    };

    const removeTitleLanguage = (index: number) => {
        setCoupleTitles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmitRoman = useCallback(async () => {
        if (!selectedCategory || !ref) {
            toast.error("Please fill in all required fields!");
            return;
        }

        const fd = new FormData();
        if (coverFile) {
            fd.append("cover", coverFile as File);
        }
        fd.append("category_id", String(selectedCategory.id));
        if (selectedSubCategory) fd.append("sub_category_id", String(selectedSubCategory.id));
        if (platform?.id) fd.append("plateform_id", String(platform.id));
        if (creatorId) fd.append("creator_id", String(creatorId));
        else if (creator) fd.append("creator", String(creator));
        fd.append("ref", String(ref));
        fd.append("titles", JSON.stringify(coupleTitles));

        try {
            setUploading(true);
            setProgress(0);

            await axios.put(`${apiURL}/romans/${id}`, fd, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        setProgress(
                            Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        );
                    }
                },
            });

            toast.success("✅ Roman updated successfully!");
            navigate("/romans");
        } catch (err: any) {
            console.error(err);
            toast.error(
                "Update error: " + (err.response?.data?.message || err.message)
            );
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }, [
        coverFile,
        selectedCategory,
        selectedSubCategory,
        coupleTitles,
        ref,
        navigate,
        creator,
        creatorId,
        platform,
        id,
    ]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading roman data...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
                {/* Header */}
                <div className="flex items-center justify-between pb-5">
                    <div>
                        <button
                            onClick={() => navigate("/romans")}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Romans
                        </button>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Edit Roman
                        </h1>
                    </div>
                </div>

                {/* Reference */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Reference
                    </h2>
                    <input
                        type="text"
                        value={ref || ""}
                        onChange={(e) => setRef(e.currentTarget.value.trim())}
                        className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300"
                        placeholder="Roman reference"
                    />
                </div>

                {/* Category & Sub Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <FolderTree className="w-5 h-5" />
                            Category
                        </h2>
                        <RomanCategoryAutoComplete
                            onSelect={(category) => {
                                setSelectedCategory(category);
                                setSelectedSubCategory(null);
                            }}
                            defaultValue={selectedCategory || undefined}
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <FolderOpen className="w-5 h-5" />
                            Sub Category
                        </h2>
                        <RomanSubCategoryAutoComplete
                            categoryId={selectedCategory?.id}
                            onSelect={(subCategory) => setSelectedSubCategory(subCategory)}
                            defaultValue={selectedSubCategory || undefined}
                        />
                    </div>
                </div>

                {/* File cover Upload */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 mb-4">
                    <FileUploadZone
                        type="image"
                        accept="image/*"
                        title="Cover Image"
                        file={coverFile}
                        preview={coverPreview}
                        onFileSelect={handleCoverSelect}
                    />
                </div>

                {/* Platform & Creator */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Platform
                        </h2>
                        <PlatformSelectComponent 
                            onSelect={setPlatform}
                            defaultValue={platform || undefined}
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Creator
                        </h2>
                        <CreatorAutoComplete
                            value={creator}
                            onChange={(v: string | null) => {
                                setCreator(v);
                                setCreatorId(null);
                            }}
                            onSelect={(c) => {
                                setCreator(c?.name ?? null);
                                setCreatorId(c?.id ?? null);
                            }}
                        />
                    </div>
                </div>

                {/* Titles & Descriptions */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 mb-4">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Titles & Descriptions
                        </h3>
                        <button
                            type="button"
                            onClick={addTitleLanguage}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Tag className="w-4 h-4" />
                            Add Language
                        </button>
                    </div>

                    <div className="space-y-6">
                        {coupleTitles.map((c, i) => (
                            <div
                                key={i}
                                className="relative bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                            >
                                {coupleTitles.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeTitleLanguage(i)}
                                        className="absolute top-2 right-2 p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
                                    >
                                        <Tag className="w-4 h-4" />
                                    </button>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Language
                                        </label>
                                        <LanguageAutoComplete
                                            defaultValue={{
                                                code: c?.language?.title || c.i18_language,
                                                name: c?.language?.name || c.i18_language.toUpperCase(),
                                            }}
                                            onSelect={(lang) =>
                                                handleTitleChange(i, "i18_language", lang.code)
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter roman title"
                                            value={c.title}
                                            onChange={(e) => handleTitleChange(i, "title", e.target.value)}
                                            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        placeholder="Enter roman description"
                                        value={c.description}
                                        onChange={(e) =>
                                            handleTitleChange(i, "description", e.target.value)
                                        }
                                        className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300 resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <motion.button
                    whileHover={{ scale: uploading ? 1 : 1.02 }}
                    whileTap={{ scale: uploading ? 1 : 0.98 }}
                    onClick={handleSubmitRoman}
                    disabled={uploading}
                    className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg ${uploading
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl"
                        }`}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Updating... {progress}%</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-6 h-6" />
                            <span>Update Roman</span>
                        </>
                    )}
                </motion.button>

                {/* Progress Bar */}
                {uploading && (
                    <div className="mt-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Updating Roman...
                            </span>
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {progress}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default RomanEdit;