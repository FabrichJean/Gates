import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Edit,
    Trash2,
    X,
    Save,
    Loader2,
    Search,
    BookOpen,
    FileText,
    Eye,
    EyeOff,
    Calendar,
    Hash,
    Type,
    AlignLeft,
    Filter,
    ChevronDown,
    UserCircle,
    LayoutGrid,
    Table,
} from "lucide-react";
import toast from "react-hot-toast";
import { I18nContentFields } from "../../components/I18nComponents";
import { LanguageSelector } from "../../components/LanguageSelector";
import type { TranslatedText } from "../../types/i18n";
import {
    getAllRomanChaptersApi,
    getRomanChapterByIdApi,
    getChaptersByRomanIdApi,
    createRomanChapterApi,
    updateRomanChapterApi,
    deleteRomanChapterApi,
} from "../../api/romanChapter";
import { getFilteredRomans } from "../../api/romans";
import { server } from "../../constant";
import RomanChapterDetails from "../../components/romanChapterDetails";
import CreatorAutoComplete from "../../components/CreatorAutoComplete";
import RomanAutoComplete from "../../components/RomanAutoComplete";

// Types
interface RomanTitle {
    title: string;
    i18_language: string;
    language: {
        code: string;
        name: string;
    };
}

interface Roman {
    id: number;
    ref: string;
    user_id: number;
    creator_id: number;
    titles: RomanTitle[];
    user: {
        id: number;
        username: string;
        email: string;
    };
    creatorObj: {
        id: number;
        name: string;
        avatar: string;
        gender: string;
    };
}

interface RomanChapter {
    id: number;
    roman_id: number;
    chapter_number: number;
    // multilingual fields coming from the API
    titles?: Array<{ i18_language: string; title: string }>;
    contents?: Array<{ i18_language: string; content: string }>;
    word_count: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    roman?: Roman;
}

interface ChapterFormData {
    roman_id: number;
    titles: TranslatedText; // mapping lang->title
    contents: TranslatedText; // mapping lang->content
    chapter_number: number;
    isPublished: boolean;
}

const RomanChapterManagement: React.FC = () => {
    const [chapters, setChapters] = useState<RomanChapter[]>([]);
    const [allRomans, setAllRomans] = useState<Roman[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRomanId, setSelectedRomanId] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<"all" | "published" | "draft">("all");
    // language to display localized title/content
    const [selectedLanguage, setSelectedLanguage] = useState<string>("fr");

    // view mode state
    const [viewMode, setViewMode] = useState<"table" | "card">("table");



    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingChapter, setEditingChapter] = useState<RomanChapter | null>(null);
    const [viewingChapter, setViewingChapter] = useState<RomanChapter | null>(null);

    // Form state for create
    const [createFormData, setCreateFormData] = useState<ChapterFormData>({
        roman_id: 0,
        titles: {},
        contents: {},
        chapter_number: 1,
        isPublished: false,
    });

    // languages selected for create/edit i18n fields
    const [createSelectedLanguages, setCreateSelectedLanguages] = useState<string[]>(["en"]);
    const [editSelectedLanguages, setEditSelectedLanguages] = useState<string[]>(["en"]);

    // Form state for edit
    const [editFormData, setEditFormData] = useState<ChapterFormData>({
        roman_id: 0,
        titles: {},
        contents: {},
        chapter_number: 1,
        isPublished: false,
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchChapters();
        fetchAllRomans();
    }, []);

    const fetchChapters = async () => {
        setLoading(true);
        try {
            const response = await getAllRomanChaptersApi();
            const data = response.data || response;
            setChapters(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Erreur lors du chargement des chapitres");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllRomans = async () => {
        try {
            const response = await getFilteredRomans({});
            const data = response.data || response;
            // L'API retourne un objet avec une propriété 'romans'
            const romansList = data.romans || data;
            setAllRomans(Array.isArray(romansList) ? romansList : []);
        } catch (error) {
            toast.error("Erreur lors du chargement des romans");
            console.error(error);
        }
    };

    // Use all romans for the dropdown
    const availableRomans = allRomans;

    // helpers to get localized title/content with fallbacks
    const getChapterTitle = (chapter: RomanChapter, lang: string = selectedLanguage) => {
        const titles = (chapter as any).titles as Array<{ i18_language: string; title: string }> | undefined;
        if (titles && titles.length) {
            const t = titles.find((x) => x.i18_language === lang);
            if (t && t.title) return t.title;
            return titles[0].title;
        }
        // fallback to roman titles
        const rTitles = chapter.roman?.titles;
        if (rTitles && rTitles.length) {
            const rt = rTitles.find((x) => x.i18_language === lang);
            return rt?.title || rTitles[0].title || chapter.roman?.ref || `Chap ${chapter.chapter_number}`;
        }
        return (chapter as any).title || `Chap ${chapter.chapter_number}`;
    };

    const getChapterContent = (chapter: RomanChapter, lang: string = selectedLanguage) => {
        const contents = (chapter as any).contents as Array<{ i18_language: string; content: string }> | undefined;
        if (contents && contents.length) {
            const c = contents.find((x) => x.i18_language === lang);
            if (c && c.content) return c.content;
            return contents[0].content;
        }
        return (chapter as any).content || "";
    };

    // Filter chapters
    const filteredChapters = useMemo(() => {
        return chapters.filter((chapter) => {
            const title = getChapterTitle(chapter).toLowerCase();
            const matchesSearch =
                title.includes(searchTerm.toLowerCase()) ||
                chapter.roman?.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chapter.chapter_number.toString().includes(searchTerm) ||
                getChapterContent(chapter).toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRoman = selectedRomanId === null || chapter.roman_id === selectedRomanId;

            const matchesStatus =
                selectedStatus === "all" ||
                (selectedStatus === "published" && chapter.isPublished) ||
                (selectedStatus === "draft" && !chapter.isPublished);

            return matchesSearch && matchesRoman && matchesStatus;
        });
    }, [chapters, searchTerm, selectedRomanId, selectedStatus, selectedLanguage]);

    const openCreateModal = () => {
        setCreateFormData({
            roman_id: 0,
            titles: {},
            contents: {},
            chapter_number: 1,
            isPublished: false,
        });
        setCreateSelectedLanguages(["en"]);
        setShowCreateModal(true);
    };

    const openEditModal = (chapter: RomanChapter) => {
        setEditingChapter(chapter);
        const titlesMap: { [k: string]: string } = {};
        const contentsMap: { [k: string]: string } = {};
        (chapter.titles || []).forEach((t) => (titlesMap[t.i18_language] = t.title || ""));
        (chapter.contents || []).forEach((c) => (contentsMap[c.i18_language] = c.content || ""));

        setEditFormData({
            roman_id: chapter.roman_id,
            titles: titlesMap,
            contents: contentsMap,
            chapter_number: chapter.chapter_number,
            isPublished: chapter.isPublished,
        });
        // derive selected languages from existing titles/contents
        const langs = new Set<string>();
        (chapter.titles || []).forEach((t) => t.i18_language && langs.add(t.i18_language));
        (chapter.contents || []).forEach((c) => c.i18_language && langs.add(c.i18_language));
        setEditSelectedLanguages(langs.size ? Array.from(langs) : ["en"]);
        setShowEditModal(true);
    };

    const openViewModal = async (chapter: RomanChapter) => {
        try {
            const response = await getRomanChapterByIdApi(chapter.id);
            const data = response.data || response;
            setViewingChapter(data);
            setShowViewModal(true);
        } catch (error) {
            toast.error("Erreur lors du chargement du chapitre");
            console.error(error);
        }
    };

    const handleCreate = async () => {
        if (!createFormData.roman_id || !createFormData.chapter_number) {
            toast.error("Roman et numéro du chapitre requis");
            return;
        }

        // convert translations objects to arrays
        const titlesArray = Object.entries(createFormData.titles || {})
            .map(([i18_language, title]) => ({ i18_language, title }))
            .filter((t) => t.title && t.title.trim().length > 0);

        const contentsArray = Object.entries(createFormData.contents || {})
            .map(([i18_language, content]) => ({ i18_language, content }))
            .filter((c) => c.content && c.content.trim().length > 0);

        if (titlesArray.length === 0 || contentsArray.length === 0) {
            toast.error("Au moins un titre et un contenu doivent être fournis");
            return;
        }

        setSubmitting(true);
        try {
            await createRomanChapterApi({
                roman_id: createFormData.roman_id,
                chapter_number: createFormData.chapter_number,
                isPublished: createFormData.isPublished,
                titles: titlesArray,
                contents: contentsArray,
            });
            toast.success("Chapitre créé avec succès");
            setShowCreateModal(false);
            fetchChapters();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Erreur lors de la création";
            toast.error(errorMsg);
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingChapter) return;
        if (!editFormData.chapter_number) {
            toast.error("Numéro du chapitre requis");
            return;
        }

        // convert translations to arrays
        const titlesArray = Object.entries(editFormData.titles || {})
            .map(([i18_language, title]) => ({ i18_language, title }))
            .filter((t) => t.title && t.title.trim().length > 0);

        const contentsArray = Object.entries(editFormData.contents || {})
            .map(([i18_language, content]) => ({ i18_language, content }))
            .filter((c) => c.content && c.content.trim().length > 0);

        setSubmitting(true);
        try {
            await updateRomanChapterApi(editingChapter.id, {
                chapter_number: editFormData.chapter_number,
                isPublished: editFormData.isPublished,
                titles: titlesArray.length ? titlesArray : undefined,
                contents: contentsArray.length ? contentsArray : undefined,
            });
            toast.success("Chapitre mis à jour avec succès");
            setShowEditModal(false);
            fetchChapters();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Erreur lors de la mise à jour";
            toast.error(errorMsg);
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce chapitre ?")) return;

        try {
            await deleteRomanChapterApi(id);
            toast.success("Chapitre supprimé avec succès");
            fetchChapters();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
            console.error(error);
        }
    };

    const getRomanTitle = (roman: Roman | undefined, lang: string = "fr") => {
        if (!roman?.titles) return roman?.ref || "N/A";
        const title = roman.titles.find((t) => t.i18_language === lang);
        return title?.title || roman.titles[0]?.title || roman.ref;
    };

    const stats = {
        total: chapters.length,
        published: chapters.filter((c) => c.isPublished).length,
        draft: chapters.filter((c) => !c.isPublished).length,
        totalWords: chapters.reduce((sum, c) => sum + c.word_count, 0),
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen rounded-md bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                                <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                Gestion des Chapitres
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={openCreateModal}
                                className="flex items-center gap-2 px-2 py-2 border border-teal-700 dark:border-teal-500 dark:bg-gray-800 cursor-pointer text-white rounded-lg transition-all"
                            >
                                <Plus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 p-2 border-t-2 border-blue-500 dark:border-blue-400">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Chapitres</p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.total}</p>
                                </div>
                                <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 border-t-2 border-green-500 dark:border-green-400">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Publiés</p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.published}</p>
                                </div>
                                <Eye className="w-4 h-4 text-green-500 dark:text-green-400" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 border-t-2 border-yellow-500 dark:border-yellow-400">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Brouillons</p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.draft}</p>
                                </div>
                                <EyeOff className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 border-t-2 border-purple-500 dark:border-purple-400">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Mots</p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                        {stats.totalWords.toLocaleString()}
                                    </p>
                                </div>
                                <AlignLeft className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>

                    {/* Filters */}

                </motion.div>

                {/* roman autocomplete */}
                <div className="flex items-center justify-between w-full mb-6 gap-4">
                    <RomanAutoComplete
                        onSelect={(romanId) => setSelectedRomanId(romanId)}
                        selectedRomanId={selectedRomanId}
                        placeholder="Filtrer par roman..."
                        className="w-full max-w-sm"
                    />


                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 rounded transition-colors ${viewMode === "table"
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            title="Vue Tableau"
                        >
                            <Table className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode("card")}
                            className={`p-2 rounded transition-colors ${viewMode === "card"
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            title="Vue Cartes"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Table/Card View */}
                {filteredChapters.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
                    >
                        <div className="p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun chapitre trouvé</p>
                        </div>
                    </motion.div>
                ) : viewMode === "table" ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700 border-t-3 border-teal-600 dark:border-teal-500">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                                            Roman
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                                            Titre du Chapitre
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                                            Mots
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                                            Créateur
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                                            Statut
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredChapters.map((chapter, index) => (
                                        <motion.tr
                                            key={chapter.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className=""
                                        >
                                            <td className="px-6 py-4 border border-gray-300 dark:border-gray-600">
                                                <div className="text-sm">
                                                    <div className="font-bold text-blue-500 dark:text-blue-400 text-nowrap">
                                                        {getRomanTitle(chapter.roman)}
                                                    </div>
                                                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                        {chapter.roman?.ref}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border border-gray-300 dark:border-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold">
                                                        {chapter.chapter_number}
                                                    </span>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                                                        {getChapterTitle(chapter)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap border border-gray-300 dark:border-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <AlignLeft className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                                        {chapter.word_count.toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap border border-gray-300 dark:border-gray-600">
                                                <div className="flex items-center gap-3">
                                                    {chapter.roman?.creatorObj?.avatar ? (
                                                        <img
                                                            src={
                                                                chapter.roman.creatorObj.avatar.startsWith('http')
                                                                    ? chapter.roman.creatorObj.avatar
                                                                    : `${server}/${chapter.roman.creatorObj.avatar}`
                                                            }
                                                            alt={chapter.roman?.creatorObj?.name || "Creator"}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-blue-100 dark:border-blue-900 flex items-center justify-center">
                                                            <UserCircle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {chapter.roman?.creatorObj?.name || "N/A"}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                            {chapter.roman?.creatorObj?.gender || "N/A"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap border border-gray-300 dark:border-gray-600">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${chapter.isPublished
                                                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                                        : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                                        }`}
                                                >
                                                    {chapter.isPublished ? (
                                                        <>
                                                            <Eye className="w-3 h-3" />
                                                            Publié
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="w-3 h-3" />
                                                            Brouillon
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap border border-gray-300 dark:border-gray-600">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(chapter.createdAt).toLocaleDateString("fr-FR")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right border border-gray-300 dark:border-gray-600">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openViewModal(chapter)}
                                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                        title="Voir"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(chapter)}
                                                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(chapter.id)}
                                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    /* Card View */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredChapters.map((chapter, index) => (
                            <motion.div
                                key={chapter.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                            >
                                {/* Card Header */}
                                <div className="bg-purple-800/10 dark:bg-purple-800/20 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/40 dark:bg-slate-700/50 backdrop-blur-sm text-gray-600 dark:text-white text-lg font-bold">
                                            {chapter.chapter_number}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${chapter.isPublished
                                                ? "bg-green-100/90 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                                                : "bg-yellow-100/90 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200"
                                                }`}
                                        >
                                            {chapter.isPublished ? (
                                                <>
                                                    <Eye className="w-3 h-3" />
                                                    Publié
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="w-3 h-3" />
                                                    Brouillon
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    <h3 className="text-gray-700 dark:text-white font-bold text-lg line-clamp-2">
                                        {getChapterTitle(chapter)}
                                    </h3>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 space-y-4">
                                    {/* Creator */}
                                    {/* <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                        {chapter.roman?.creatorObj?.avatar ? (
                                            <img
                                                src={
                                                    chapter.roman.creatorObj.avatar.startsWith('http')
                                                        ? chapter.roman.creatorObj.avatar
                                                        : `${server}/${chapter.roman.creatorObj.avatar}`
                                                }
                                                alt={chapter.roman?.creatorObj?.name || "Creator"}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-blue-100 dark:border-blue-900 flex items-center justify-center">
                                                <UserCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                {chapter.roman?.creatorObj?.name || "N/A"}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                {chapter.roman?.creatorObj?.gender || "N/A"}
                                            </div>
                                        </div>
                                    </div> */}

                                    {/* Roman Info */}
                                    <div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            <BookOpen className="w-4 h-4" />
                                            Roman
                                        </div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm underline truncate cursor-pointer">
                                            {getRomanTitle(chapter.roman)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {chapter.roman?.ref}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <AlignLeft className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                {chapter.word_count.toLocaleString()} mots
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(chapter.createdAt).toLocaleDateString("fr-FR")}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer - Actions */}
                                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => openViewModal(chapter)}
                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        title="Voir"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openEditModal(chapter)}
                                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                        title="Modifier"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(chapter.id)}
                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowCreateModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                            >
                                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        Nouveau Chapitre
                                    </h3>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 dark:text-gray-300" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Roman Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Roman <span className="text-red-500 dark:text-red-400">*</span>
                                        </label>
                                        <RomanAutoComplete
                                            onSelect={(romanId) => setCreateFormData({ ...createFormData, roman_id: romanId || 0 })}
                                            selectedRomanId={createFormData.roman_id || null}
                                            placeholder="Sélectionner un roman..."
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Chapter Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Numéro du Chapitre <span className="text-red-500 dark:text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={createFormData.chapter_number}
                                            onChange={(e) =>
                                                setCreateFormData({ ...createFormData, chapter_number: Number(e.target.value) })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ex: 1"
                                        />
                                    </div>

                                    {/* Titles & Content with language selector */}
                                    <div>
                                        <LanguageSelector
                                            selectedLanguages={createSelectedLanguages}
                                            onChange={setCreateSelectedLanguages}
                                            maxLanguages={9}
                                            className="mb-3"
                                        />

                                        {createSelectedLanguages.length > 0 && (
                                            <I18nContentFields
                                                title={createFormData.titles}
                                                description={createFormData.contents}
                                                onTitleChange={(titles) => setCreateFormData({ ...createFormData, titles })}
                                                onDescriptionChange={(contents) => setCreateFormData({ ...createFormData, contents })}
                                                onBothChange={(titles, contents) => setCreateFormData({ ...createFormData, titles, contents })}
                                                titleRequired={true}
                                                descriptionRequired={true}
                                                supportedLanguages={createSelectedLanguages}
                                                showAutoFill={true}
                                                page="roman"
                                            />
                                        )}

                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            Nombre de mots: {Object.values(createFormData.contents || {}).join(' ').trim().split(/\s+/).filter(w => w).length}
                                        </p>
                                    </div>

                                    {/* Published Status */}
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="isPublishedCreate"
                                            checked={createFormData.isPublished}
                                            onChange={(e) =>
                                                setCreateFormData({ ...createFormData, isPublished: e.target.checked })
                                            }
                                            className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label htmlFor="isPublishedCreate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Publier ce chapitre
                                        </label>
                                    </div>
                                </div>

                                <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        disabled={submitting}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Création...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Créer
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit Modal */}
                <AnimatePresence>
                    {showEditModal && editingChapter && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowEditModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                            >
                                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                        <Edit className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        Modifier le Chapitre
                                    </h3>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 dark:text-gray-300" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Roman Info (Read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Roman
                                        </label>
                                        <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-100 rounded-lg bg-gray-50 dark:bg-gray-800">
                                            {getRomanTitle(editingChapter.roman)} ({editingChapter.roman?.ref})
                                        </div>
                                    </div>

                                    {/* Chapter Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Numéro du Chapitre <span className="text-red-500 dark:text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={editFormData.chapter_number}
                                            onChange={(e) =>
                                                setEditFormData({ ...editFormData, chapter_number: Number(e.target.value) })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ex: 1"
                                        />
                                    </div>

                                    {/* Titles & Content with language selector (edit) */}
                                    <div>
                                        <LanguageSelector
                                            selectedLanguages={editSelectedLanguages}
                                            onChange={setEditSelectedLanguages}
                                            maxLanguages={9}
                                            className="mb-3"
                                        />

                                        {editSelectedLanguages.length > 0 && (
                                            <I18nContentFields
                                                title={editFormData.titles}
                                                description={editFormData.contents}
                                                onTitleChange={(titles) => setEditFormData({ ...editFormData, titles })}
                                                onDescriptionChange={(contents) => setEditFormData({ ...editFormData, contents })}
                                                onBothChange={(titles, contents) => setEditFormData({ ...editFormData, titles, contents })}
                                                titleRequired={true}
                                                descriptionRequired={true}
                                                supportedLanguages={editSelectedLanguages}
                                                showAutoFill={true}
                                                page="roman"
                                            />
                                        )}

                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            Nombre de mots: {Object.values(editFormData.contents || {}).join(' ').trim().split(/\s+/).filter(w => w).length}
                                        </p>
                                    </div>

                                    {/* Published Status */}
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="isPublishedEdit"
                                            checked={editFormData.isPublished}
                                            onChange={(e) =>
                                                setEditFormData({ ...editFormData, isPublished: e.target.checked })
                                            }
                                            className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label htmlFor="isPublishedEdit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Publish this chapter
                                        </label>
                                    </div>
                                </div>

                                <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Update
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* View Modal */}
                <AnimatePresence>
                    {showViewModal && viewingChapter && (
                        <RomanChapterDetails
                            chapter={viewingChapter}
                            onClose={() => setShowViewModal(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RomanChapterManagement;