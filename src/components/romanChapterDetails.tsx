import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Globe, ChevronDown } from "lucide-react";

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
    titles?: Array<{ i18_language: string; title: string; language?: { code: string; name: string } }>;
    contents?: Array<{ i18_language: string; content: string; nb_words?: number; language?: { code: string; name: string } }>;
    // word_count may be provided by backend or computed from contents
    word_count?: number;
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
    const [selectedLang, setSelectedLang] = useState<string>("fr");

    const getRomanTitle = (roman: Roman | undefined, lang: string = selectedLang) => {
        if (!roman?.titles) return roman?.ref || "N/A";
        const title = roman.titles.find((t) => t.i18_language === lang);
        return title?.title || roman.titles[0]?.title || roman.ref;
    };

    const getChapterTitle = (chapter: RomanChapter, lang: string = selectedLang) => {
        const titles = (chapter as any).titles as Array<{ i18_language: string; title: string }> | undefined;
        if (titles && titles.length) {
            const t = titles.find((x) => x.i18_language === lang);
            return t?.title || titles[0].title;
        }
        const rTitles = chapter.roman?.titles;
        if (rTitles && rTitles.length) {
            const rt = rTitles.find((x) => x.i18_language === lang);
            return rt?.title || rTitles[0].title;
        }
        return `Chap ${chapter.chapter_number}`;
    };

    const getChapterContent = (chapter: RomanChapter, lang: string = selectedLang) => {
        const contents = (chapter as any).contents as Array<{ i18_language: string; content: string }> | undefined;
        if (contents && contents.length) {
            const c = contents.find((x) => x.i18_language === lang);
            return c?.content || contents[0].content;
        }
        return "";
    };

    const getChapterWordCount = (chapter: RomanChapter, lang?: string) => {
        // if a language is specified, prefer the nb_words for that language
        if (lang) {
            const contents = (chapter as any).contents as Array<{ i18_language: string; content: string; nb_words?: number }> | undefined;
            if (contents && contents.length) {
                const item = contents.find((c) => c.i18_language === lang);
                if (item) {
                    if (typeof item.nb_words === "number") return item.nb_words;
                    if (item.content) return item.content.trim().split(/\s+/).filter(Boolean).length;
                }
            }
        }

        // fallback to aggregated value if provided
        if (typeof chapter.word_count === "number") return chapter.word_count;

        const contents = (chapter as any).contents as Array<{ i18_language: string; content: string; nb_words?: number }> | undefined;
        if (contents && contents.length) {
            return contents.reduce((s, item) => {
                if (typeof item.nb_words === "number") return s + item.nb_words;
                if (item.content) return s + item.content.trim().split(/\s+/).filter(Boolean).length;
                return s;
            }, 0);
        }

        const anyContent = (chapter as any).content;
        if (typeof anyContent === "string") return anyContent.trim().split(/\s+/).filter(Boolean).length;
        return 0;
    };

    const availableLangs = useMemo(() => {
        const codes = new Set<string>();
        const list: Array<{ code: string; label?: string }> = [];

        // from chapter titles
        const ct = (chapter as any).titles as Array<{ i18_language: string; title: string }> | undefined;
        if (ct) ct.forEach((t) => codes.add(t.i18_language));

        // from chapter contents
        const cc = (chapter as any).contents as Array<{ i18_language: string; content: string }> | undefined;
        if (cc) cc.forEach((c) => codes.add(c.i18_language));

        // from roman titles (to get labels)
        const rt = chapter.roman?.titles;
        if (rt) rt.forEach((t) => codes.add(t.i18_language));

        codes.forEach((code) => {
            const label = chapter.roman?.titles?.find((t) => t.i18_language === code)?.language?.name;
            list.push({ code, label });
        });

        // ensure default 'fr' present at top if available
        list.sort((a, b) => (a.code === "fr" ? -1 : b.code === "fr" ? 1 : 0));
        return list;
    }, [chapter]);

    // set sensible default if fr not available
    React.useEffect(() => {
        if (availableLangs.length === 0) return;
        if (availableLangs.some((l) => l.code === "fr")) {
            setSelectedLang("fr");
        } else if (!availableLangs.some((l) => l.code === selectedLang)) {
            setSelectedLang(availableLangs[0].code);
        }
    }, [availableLangs]);

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
                            Chapitre {chapter.chapter_number}: {getChapterTitle(chapter)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {getRomanTitle(chapter.roman)} ({chapter.roman?.ref})
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {availableLangs.length > 0 && (
                            <div className="ml-4 relative inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 focus-within:outline-none focus-within:ring-0">
                                <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                <select
                                    value={selectedLang}
                                    onChange={(e) => setSelectedLang(e.target.value)}
                                    aria-label="Select language"
                                    className="appearance-none bg-transparent border-none text-sm pr-6 pl-1 py-0 text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none focus:ring-0"
                                >
                                    {availableLangs.map((l) => (
                                        <option key={l.code} value={l.code} className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                            {l.label ? `${l.label} (${l.code})` : l.code}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 dark:text-gray-300" />
                    </button>
                </div>
                
                {/* information d'un chapitre */}
                <div className="p-6 space-y-6">
                    {/* Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Chapter</p>
                            <p className="text-sm font-semibold dark:text-gray-100">#{chapter.chapter_number}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Mots</p>
                            <p className="text-sm font-semibold dark:text-gray-100">
                                {getChapterWordCount(chapter, selectedLang).toLocaleString()}
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
                                {getChapterContent(chapter)}
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
