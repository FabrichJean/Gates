import { Tag, FolderTree, FolderOpen, Globe, User, FileText, Upload, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import RomanCategoryAutoComplete, { type RomanCategory } from "../../components/RomanCategoryAutoComplete";
import RomanSubCategoryAutoComplete, { type RomanSubCategory } from "../../components/RomanSubCategoryAutoComplete";
import FileUploadZone from "../../components/FileUploadZone";
import PlatformSelectComponent from "../../components/PlatformSelectComponent";
import CreatorAutoComplete from "../../components/CreatorAutoComplete";
import type { Platform } from "../../hooks/usePlatform";
import LanguageAutoComplete from "../../components/LanguageAutoComplete";
import type { Couple } from "../Upload";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../constant";
import { getToken } from "../../utils/storage";
import { motion } from "framer-motion";



type Language = {
    code: string;
    name: string;
};

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

    // Système de langues avec onglets
    const [languages, setLanguages] = useState<{ id: number, name: string, code: string }[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<{ id: number, name: string, code: string } | null>(null);
    const [titles, setTitles] = useState<{ [key: number]: string }>({});
    const [descriptions, setDescriptions] = useState<{ [key: number]: string }>({});
    const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
    const [selectedLanguageFromBackend, setSelectedLanguageFromBackend] = useState<Language | null>(null);

    const handleCoverSelect = (file: File, preview: string) => {
        setCoverFile(file);
        setCoverPreview(preview);
    };

    // Fonctions pour gérer les titres et descriptions par langue
    const handleTitleChange = (languageId: number, value: string) => {
        setTitles(prev => ({ ...prev, [languageId]: value }));
    };

    const handleDescriptionChange = (languageId: number, value: string) => {
        setDescriptions(prev => ({ ...prev, [languageId]: value }));
    };

    // Fonction pour ajouter une nouvelle langue
    const handleAddLanguage = () => {
        if (selectedLanguageFromBackend) {
            const existingLanguage = languages.find(lang => lang.code === selectedLanguageFromBackend.code);
            if (existingLanguage) {
                toast.error("This language is already added!");
                return;
            }

            const newId = Math.max(0, ...languages.map(lang => lang.id)) + 1;
            const newLanguage = {
                id: newId,
                name: selectedLanguageFromBackend.name,
                code: selectedLanguageFromBackend.code
            };
            setLanguages(prev => [...prev, newLanguage]);
            setSelectedLanguageFromBackend(null);
            setShowAddLanguageModal(false);
            setSelectedLanguage(newLanguage);
        }
    };

    const handleCancelAddLanguage = () => {
        setSelectedLanguageFromBackend(null);
        setShowAddLanguageModal(false);
    };

    const removeLanguage = (languageId: number) => {
        setLanguages(prev => prev.filter(lang => lang.id !== languageId));
        delete titles[languageId];
        delete descriptions[languageId];
        if (selectedLanguage?.id === languageId) {
            setSelectedLanguage(languages.find(lang => lang.id !== languageId) || null);
        }
    };

    const handleSubmitRoman = useCallback(async () => {
        if (!coverFile || !selectedCategory || !ref) {
            toast.error("Please fill in all required fields!");
            return;
        }

        // Vérifier qu'au moins un titre est renseigné
        const hasTitle = Object.values(titles).some(title => title.trim() !== "");
        if (!hasTitle) {
            toast.error("Please add at least one title");
            return;
        }

        // Préparer les titres multilingues
        const titlesArray: { title: string, i18_language: string, description?: string }[] = [];
        languages.forEach(lang => {
            if (titles[lang.id]?.trim()) {
                titlesArray.push({
                    title: titles[lang.id].trim(),
                    i18_language: lang.code,
                    ...(descriptions[lang.id]?.trim() && { description: descriptions[lang.id].trim() })
                });
            }
        });

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

            await axios.post(`${apiURL}/romans/add`, fd, {
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
        descriptions,
        languages,
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
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 mb-4">
                    <label className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">Title:</label>

                    {/* Onglets de langues */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {languages.map((lang) => (
                            <div key={lang.id} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setSelectedLanguage(lang)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        selectedLanguage?.id === lang.id
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {lang.name}
                                </button>
                                {languages.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeLanguage(lang.id)}
                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Bouton Add Language */}
                        <button
                            type="button"
                            onClick={() => setShowAddLanguageModal(true)}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-all duration-200 flex items-center gap-2"
                        >
                            <Tag className="w-4 h-4" />
                            Add Language
                        </button>
                    </div>

                    {/* Champs pour la langue sélectionnée */}
                    {selectedLanguage && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Title ({selectedLanguage.name})
                                </label>
                                <input
                                    type="text"
                                    placeholder={`Enter title in ${selectedLanguage.name}`}
                                    value={titles[selectedLanguage.id] || ""}
                                    onChange={(e) => handleTitleChange(selectedLanguage.id, e.target.value)}
                                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description ({selectedLanguage.name})
                                </label>
                                <textarea
                                    placeholder={`Enter description in ${selectedLanguage.name}`}
                                    value={descriptions[selectedLanguage.id] || ""}
                                    onChange={(e) => handleDescriptionChange(selectedLanguage.id, e.target.value)}
                                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300 resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
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

            {/* Modal Add Language */}
            {showAddLanguageModal && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            New Title
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Language
                            </label>
                            <div>
                                <LanguageAutoComplete
                                    onSelect={(lang) => setSelectedLanguageFromBackend(lang)}
                                    defaultValue={selectedLanguageFromBackend || undefined}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCancelAddLanguage}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddLanguage}
                                disabled={!selectedLanguageFromBackend}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
                            >
                                Add Title
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RomanUpload;