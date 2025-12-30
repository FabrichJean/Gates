import React, { useState, useEffect, useRef } from "react";
import { Search, BookOpen, X, Loader2 } from "lucide-react";
import { getFilteredRomans } from "../api/romans";
import toast from "react-hot-toast";

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
    user?: {
        id: number;
        username: string;
        email: string;
    };
    creatorObj?: {
        id: number;
        name: string;
        avatar: string;
        gender: string;
    };
}

interface RomanAutoCompleteProps {
    onSelect: (romanId: number | null) => void;
    selectedRomanId?: number | null;
    placeholder?: string;
    className?: string;
}

const RomanAutoComplete: React.FC<RomanAutoCompleteProps> = ({
    onSelect,
    selectedRomanId,
    placeholder = "Rechercher un roman...",
    className = "",
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [romans, setRomans] = useState<Roman[]>([]);
    const [filteredRomans, setFilteredRomans] = useState<Roman[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRoman, setSelectedRoman] = useState<Roman | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchRomans();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (selectedRomanId && romans.length > 0) {
            const roman = romans.find((r) => r.id === selectedRomanId);
            setSelectedRoman(roman || null);
        }
    }, [selectedRomanId, romans]);

    useEffect(() => {
        if (searchTerm.trim()) {
            const filtered = romans.filter((roman) => {
                const titleMatch = roman.titles?.some((title) =>
                    title.title.toLowerCase().includes(searchTerm.toLowerCase())
                );
                const refMatch = roman.ref.toLowerCase().includes(searchTerm.toLowerCase());
                const creatorMatch = roman.creatorObj?.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

                return titleMatch || refMatch || creatorMatch;
            });
            setFilteredRomans(filtered);
        } else {
            setFilteredRomans(romans);
        }
    }, [searchTerm, romans]);

    const fetchRomans = async () => {
        setLoading(true);
        try {
            const response = await getFilteredRomans({});
            const data = response.data?.romans || [];
            setRomans(Array.isArray(data) ? data : []);
            setFilteredRomans(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Erreur lors du chargement des romans");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (roman: Roman) => {
        setSelectedRoman(roman);
        setSearchTerm("");
        setIsOpen(false);
        onSelect(roman.id);
    };

    const handleClear = () => {
        setSelectedRoman(null);
        setSearchTerm("");
        onSelect(null);
        inputRef.current?.focus();
    };

    const getRomanTitle = (roman: Roman, lang: string = "fr") => {
        if (!roman?.titles || roman.titles.length === 0) return roman?.ref || "N/A";
        const title = roman.titles.find((t) => t.i18_language === lang);
        return title?.title || roman.titles[0]?.title || roman.ref;
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <div className="relative">
                {selectedRoman ? (
                    <div className="flex items-center gap-2 w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {getRomanTitle(selectedRoman)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {selectedRoman.ref}
                            </div>
                        </div>
                        <button
                            onClick={handleClear}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                            title="Effacer"
                        >
                            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            placeholder={placeholder}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        {loading && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />
                        )}
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && !selectedRoman && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        </div>
                    ) : filteredRomans.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                            <p className="text-sm">
                                {searchTerm ? "Aucun roman trouvé" : "Aucun roman disponible"}
                            </p>
                        </div>
                    ) : (
                        <ul className="py-1">
                            {filteredRomans.map((roman) => (
                                <li key={roman.id}>
                                    <button
                                        onClick={() => handleSelect(roman)}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                    >
                                        <div className="flex items-start gap-3">
                                            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {getRomanTitle(roman)}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Ref: {roman.ref}
                                                </div>
                                                {roman.creatorObj && (
                                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                        Par: {roman.creatorObj.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default RomanAutoComplete;
