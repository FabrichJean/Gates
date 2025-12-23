import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

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

interface RomanChapterDetailsProps {
    chapter: RomanChapter;
    onClose: () => void;
}

const RomanChapterDetails: React.FC<RomanChapterDetailsProps> = ({ chapter, onClose }) => {
    const getRomanTitle = (roman: Roman | undefined, lang: string = "fr") => {
        if (!roman?.titles) return roman?.ref || "N/A";
        const title = roman.titles.find((t) => t.i18_language === lang);
        return title?.title || roman.titles[0]?.title || roman.ref;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            Chapitre {chapter.chapter_number}: {chapter.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {getRomanTitle(chapter.roman)} ({chapter.roman?.ref})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 dark:text-gray-300" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Numéro</p>
                            <p className="text-sm font-semibold dark:text-gray-100">#{chapter.chapter_number}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Mots</p>
                            <p className="text-sm font-semibold dark:text-gray-100">
                                {chapter.word_count.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Statut</p>
                            <p className="text-sm font-semibold dark:text-gray-100">
                                {chapter.isPublished ? "Publié" : "Brouillon"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Date</p>
                            <p className="text-sm font-semibold dark:text-gray-100">
                                {new Date(chapter.createdAt).toLocaleDateString("fr-FR")}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Contenu</h4>
                        <div className="prose prose-sm max-w-none bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                                {chapter.content}
                            </p>
                        </div>
                    </div>

                    {/* Roman Info */}
                    {chapter.roman && (
                        <div className="border-t dark:border-gray-700 pt-6">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                Informations du Roman
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Référence</p>
                                    <p className="text-sm font-medium dark:text-gray-100">{chapter.roman.ref}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Créateur</p>
                                    <p className="text-sm font-medium dark:text-gray-100">
                                        {chapter.roman.creatorObj?.name || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Utilisateur</p>
                                    <p className="text-sm font-medium dark:text-gray-100">
                                        {chapter.roman.user?.username || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default RomanChapterDetails;
