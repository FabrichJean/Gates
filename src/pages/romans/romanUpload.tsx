import { Tag, FolderTree, FolderOpen, Globe, User, FileText, Upload, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import RomanCategoryAutoComplete, { type RomanCategory } from "../../components/RomanCategoryAutoComplete";
import RomanSubCategoryAutoComplete, { type RomanSubCategory } from "../../components/RomanSubCategoryAutoComplete";
import FileUploadZone from "../../components/FileUploadZone";
import PlatformSelectComponent from "../../components/PlatformSelectComponent";
import CreatorAutoComplete from "../../components/CreatorAutoComplete";
import type { Platform } from "../../hooks/usePlatform";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { addRoman } from "../../api/romans";
import { motion } from "framer-motion";
import { MangaTitlesField } from "../../components/MangaTitlesField";
import type { MangaTitles } from "../../types/mangaTitles";



const RomanUpload = () => {

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
    const navigate = useNavigate();

    // Titres multilingues
    const [titles, setTitles] = useState<MangaTitles>([]);

    const handleCoverSelect = (file: File, preview: string) => {
        setCoverFile(file);
        setCoverPreview(preview);
    };

    const handleSubmitRoman = useCallback(async () => {
        if (!coverFile || !selectedCategory || !ref) {
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
        fd.append("cover", coverFile as File);
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

            await addRoman(fd, (progressEvent) => {
                if (progressEvent.total) {
                    setProgress(
                        Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    );
                }
            });

            toast.success("✅ Roman uploaded successfully!");
            navigate("/romans");
        } catch (err: any) {
            console.error(err);
            toast.error(
                "Upload error: " + (err.response?.data?.message || err.message)
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
    ]);

    return (
        <>
            <div className="min-h-screen  transition-all duration-300 max-w-6xl mx-auto pb-10 px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-5">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Upload Roman
                    </h1>
                </div>
                {/*  */}

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
                        placeholder="Video reference"
                    />
                </div>

                {/* Category & Sub Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* category autocomplete */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <FolderTree className="w-5 h-5" />
                            Category
                        </h2>
                        <RomanCategoryAutoComplete
                            onSelect={(category) => {
                                setSelectedCategory(category);
                                setSelectedSubCategory(null); // Reset subcategory when category changes
                            }}
                            defaultValue={selectedCategory || undefined}
                        />
                    </div>

                    {/* sub category autocomplete */}
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
                    {/* field plateform  */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Platform
                        </h2>
                        <PlatformSelectComponent onSelect={setPlatform} />
                    </div>

                    {/* field creator */}
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
                            <span>Uploading... {progress}%</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-6 h-6" />
                            <span> Upload Roman</span>
                        </>
                    )}
                </motion.button>

                {/* Progress Bar */}
                {uploading && (
                    <div className="mt-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Uploading Roman...
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

export default RomanUpload;