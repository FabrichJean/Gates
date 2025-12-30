import { Tag, FolderTree, FolderOpen, Globe, User, FileText, Upload, Loader2, ArrowLeft } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import RomanCategoryAutoComplete, { type RomanCategory } from "../../components/RomanCategoryAutoComplete";
import RomanSubCategoryAutoComplete, { type RomanSubCategory } from "../../components/RomanSubCategoryAutoComplete";
import FileUploadZone from "../../components/FileUploadZone";
import PlatformSelectComponent from "../../components/PlatformSelectComponent";
import CreatorAutoComplete from "../../components/CreatorAutoComplete";
import type { Platform } from "../../hooks/usePlatform";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { getRomanById, editRoman } from "../../api/romans";
import { motion } from "framer-motion";
import { MangaTitlesField } from "../../components/MangaTitlesField";
import type { MangaTitles } from "../../types/mangaTitles";

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
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Titres multilingues
    const [titles, setTitles] = useState<MangaTitles>([]);

    // Charger les données du roman
    useEffect(() => {
        const fetchRomanData = async () => {
            try {
                setLoading(true);
                const response = await getRomanById(id);
                const roman = response.data;

                // Pré-remplir les champs
                setRef(roman.ref);
                setSelectedCategory(roman.category);
                setSelectedSubCategory(roman.subCategory);
                setPlatform(roman.plateform);
                setCreator(roman.creator || roman.creatorObj?.name || null);
                setCreatorId(roman.creator_id);

                // Pré-remplir les titres avec le format MangaTitles
                if (roman.titles && roman.titles.length > 0) {
                    const loadedTitles: MangaTitles = roman.titles.map((t: any) => ({
                        i18_language: t.i18_language,
                        title: t.title || "",
                        description: t.description || ""
                    }));
                    setTitles(loadedTitles);
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

    const handleSubmitRoman = useCallback(async () => {
        if (!selectedCategory || !ref) {
            toast.error("Please fill in all required fields!");
            return;
        }

        // Vérifier qu'au moins un titre est renseigné
        const hasTitle = titles.some(entry => entry.title.trim() !== "");
        if (!hasTitle) {
            toast.error("Please add at least one title");
            return;
        }

        // Préparer les titres multilingues (filtrer les entrées vides)
        const titlesArray = titles
            .filter(entry => entry.title.trim() !== "")
            .map(entry => ({
                title: entry.title.trim(),
                i18_language: entry.i18_language,
                ...(entry.description.trim() && { description: entry.description.trim() })
            }));

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
        fd.append("titles", JSON.stringify(titlesArray));

        try {
            setUploading(true);
            setProgress(0);

            await editRoman(id, fd, (progressEvent) => {
                if (progressEvent.total) {
                    setProgress(
                        Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    );
                }
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
        titles,
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
            <div className="min-h-screen transition-all duration-300 max-w-6xl mx-auto pb-10 px-4 sm:px-6 lg:px-8 pt-8">
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
                <MangaTitlesField
                    value={titles}
                    onChange={setTitles}
                    label="Titres multilingues"
                    required={false}
                />

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