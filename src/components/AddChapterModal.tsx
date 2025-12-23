import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { createRomanChapterApi } from "../api/romanChapter";

interface AddChapterModalProps {
    isOpen: boolean;
    onClose: () => void;
    romanId: number;
    onSuccess?: () => void;
}

interface ChapterFormData {
    roman_id: number;
    title: string;
    content: string;
    chapter_number: number;
    isPublished: boolean;
}

const AddChapterModal: React.FC<AddChapterModalProps> = ({
    isOpen,
    onClose,
    romanId,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<ChapterFormData>({
        roman_id: romanId,
        title: "",
        content: "",
        chapter_number: 1,
        isPublished: false,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.content.trim() || !formData.chapter_number) {
            toast.error("Tous les champs sont requis");
            return;
        }

        setSubmitting(true);
        try {
            await createRomanChapterApi(formData);
            toast.success("Chapitre créé avec succès");
            onClose();
            if (onSuccess) {
                onSuccess();
            }
            // Reset form
            setFormData({
                roman_id: romanId,
                title: "",
                content: "",
                chapter_number: 1,
                isPublished: false,
            });
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Erreur lors de la création";
            toast.error(errorMsg);
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const wordCount = formData.content.trim().split(/\s+/).filter((w) => w).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
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
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 dark:text-gray-300" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
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
                                    Nombre de mots: {wordCount}
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
                                onClick={onClose}
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
                                        Créer
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddChapterModal;
