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
} from "lucide-react";
import toast from "react-hot-toast";
import {
    getAllRomanChaptersApi,
    getRomanChapterByIdApi,
    getChaptersByRomanIdApi,
    createRomanChapterApi,
    updateRomanChapterApi,
    deleteRomanChapterApi,
} from "../../api/romanChapter";
import { server } from "../../constant";
import RomanChapterDetails from "../../components/romanChapterDetails";

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
    title: string;
    content: string;
    word_count: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    roman?: Roman;
}

interface ChapterFormData {
    roman_id: number;
    title: string;
    content: string;
    chapter_number: number;
    isPublished: boolean;
}

const RomanChapterManagement: React.FC = () => {
    const [chapters, setChapters] = useState<RomanChapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRomanId, setSelectedRomanId] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<"all" | "published" | "draft">("all");

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingChapter, setEditingChapter] = useState<RomanChapter | null>(null);
    const [viewingChapter, setViewingChapter] = useState<RomanChapter | null>(null);

    // Form state
    const [formData, setFormData] = useState<ChapterFormData>({
        roman_id: 0,
        title: "",
        content: "",
        chapter_number: 1,
        isPublished: false,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchChapters();
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

    // Get unique romans from chapters
    const availableRomans = useMemo(() => {
        const romansMap = new Map<number, Roman>();
        chapters.forEach((chapter) => {
            if (chapter.roman && !romansMap.has(chapter.roman.id)) {
                romansMap.set(chapter.roman.id, chapter.roman);
            }
        });
        return Array.from(romansMap.values());
    }, [chapters]);

    // Filter chapters
    const filteredChapters = useMemo(() => {
        return chapters.filter((chapter) => {
            const matchesSearch =
                chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chapter.roman?.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chapter.chapter_number.toString().includes(searchTerm);

            const matchesRoman = selectedRomanId === null || chapter.roman_id === selectedRomanId;

            const matchesStatus =
                selectedStatus === "all" ||
                (selectedStatus === "published" && chapter.isPublished) ||
                (selectedStatus === "draft" && !chapter.isPublished);

            return matchesSearch && matchesRoman && matchesStatus;
        });
    }, [chapters, searchTerm, selectedRomanId, selectedStatus]);

    const openCreateModal = () => {
        setEditingChapter(null);
        setFormData({
            roman_id: 0,
            title: "",
            content: "",
            chapter_number: 1,
            isPublished: false,
        });
        setShowModal(true);
    };

    const openEditModal = (chapter: RomanChapter) => {
        setEditingChapter(chapter);
        setFormData({
            roman_id: chapter.roman_id,
            title: chapter.title,
            content: chapter.content,
            chapter_number: chapter.chapter_number,
            isPublished: chapter.isPublished,
        });
        setShowModal(true);
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

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.content.trim() || !formData.roman_id || !formData.chapter_number) {
            toast.error("Tous les champs sont requis");
            return;
        }

        setSubmitting(true);
        try {
            if (editingChapter) {
                await updateRomanChapterApi(editingChapter.id, {
                    title: formData.title,
                    content: formData.content,
                    chapter_number: formData.chapter_number,
                    isPublished: formData.isPublished,
                });
                toast.success("Chapitre mis à jour avec succès");
            } else {
                await createRomanChapterApi(formData);
                toast.success("Chapitre créé avec succès");
            }
            setShowModal(false);
            fetchChapters();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Erreur lors de l'opération";
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
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-2 py-2 border border-teal-700 dark:border-teal-500 dark:bg-gray-800 cursor-pointer text-white rounded-lg transition-all"
                        >
                            <Plus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </motion.button>
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

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
                >
                    {filteredChapters.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun chapitre trouvé</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700 border-t-3 border-teal-600 dark:border-teal-500">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                                            Créateur
                                        </th>
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
                                            <td className="px-6 py-4 border border-gray-300 dark:border-gray-600">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900 dark:text-gray-100 text-nowrap">
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
                                                        {chapter.title}
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
                    )}
                </motion.div>

                {/* Create/Edit Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowModal(false)}
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
                                        {editingChapter ? "Modifier le Chapitre" : "Nouveau Chapitre"}
                                    </h3>
                                    <button
                                        onClick={() => setShowModal(false)}
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
                                        <select
                                            value={formData.roman_id}
                                            onChange={(e) =>
                                                setFormData({ ...formData, roman_id: Number(e.target.value) })
                                            }
                                            disabled={!!editingChapter}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-600"
                                        >
                                            <option value={0}>Sélectionner un roman</option>
                                            {availableRomans.map((roman) => (
                                                <option key={roman.id} value={roman.id}>
                                                    {getRomanTitle(roman)} ({roman.ref})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Chapter Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Numéro du Chapitre <span className="text-red-500 dark:text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.chapter_number}
                                            onChange={(e) =>
                                                setFormData({ ...formData, chapter_number: Number(e.target.value) })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ex: 1"
                                        />
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Titre du Chapitre <span className="text-red-500 dark:text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ex: Chapitre 1 : Le Début"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Contenu <span className="text-red-500 dark:text-red-400">*</span>
                                        </label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            rows={12}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="Écrivez le contenu du chapitre ici..."
                                        />
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            Nombre de mots: {formData.content.trim().split(/\s+/).filter(w => w).length}
                                        </p>
                                    </div>

                                    {/* Published Status */}
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="isPublished"
                                            checked={formData.isPublished}
                                            onChange={(e) =>
                                                setFormData({ ...formData, isPublished: e.target.checked })
                                            }
                                            className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Publier ce chapitre
                                        </label>
                                    </div>
                                </div>

                                <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        disabled={submitting}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Enregistrement...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                {editingChapter ? "Mettre à jour" : "Créer"}
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