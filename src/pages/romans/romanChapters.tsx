import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getChaptersByRomanIdApi } from "../../api/romanChapter";
import { Loader2, BookOpen, Eye, LayoutGrid, List } from "lucide-react";
import RomanChapterDetails from "../../components/romanChapterDetails";

type RomanChapter = any;

const RomanChaptersPage = () => {
    const { id } = useParams<{ id: string }>();
    const [chapters, setChapters] = useState<RomanChapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChapter, setSelectedChapter] = useState<RomanChapter | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    // Écoute de la navigation interne du modal (Prev/Next)
    useEffect(() => {
        function handleNavigate(e: any) {
            if (e?.detail?.chapter) {
                setSelectedChapter(e.detail.chapter);
            }
        }
        window.addEventListener('romanChapterDetails:navigate', handleNavigate);
        return () => window.removeEventListener('romanChapterDetails:navigate', handleNavigate);
    }, []);

    useEffect(() => {
        const fetch = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await getChaptersByRomanIdApi(id);
                const data = res.data || res;
                setChapters(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-blue-600" /> Chapters
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-800 p-1">
                            <button
                                onClick={() => setViewMode('table')}
                                aria-pressed={viewMode === 'table'}
                                className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow' : 'hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
                                title="Table view"
                            >
                                <List className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </button>
                            <button
                                onClick={() => setViewMode('cards')}
                                aria-pressed={viewMode === 'cards'}
                                className={`p-2 rounded-md ${viewMode === 'cards' ? 'bg-white dark:bg-gray-700 shadow' : 'hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
                                title="Card view"
                            >
                                <LayoutGrid className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                        <Link to={`/romans/${id}`} className="text-sm text-blue-600 hover:underline">Back to roman</Link>
                    </div>
                </div>

                {chapters.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-500">No chapters found for this roman.</p>
                    </div>
                ) : (
                    viewMode === 'table' ? (
                        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                                    <thead className="sticky top-0 z-10 bg-slate-200/60 dark:bg-slate-900/60 backdrop-blur border-b">
                                        <tr>
                                            <th className="text-left p-3 text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                                            <th className="text-left p-3 text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                                            <th className="text-left p-3 text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Date</th>
                                            <th className="text-right p-3 text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-700">
                                        {chapters.map((c: any, idx: number) => (
                                            <tr key={c.id} className={`transition-colors duration-150 bg-gray-50 dark:bg-gray-800`}>
                                                <td className="p-3 text-sm text-gray-700 dark:text-gray-200 w-16 text-nowrap">Chapter - {c.chapter_number}</td>
                                                <td className="p-3 text-sm text-gray-700 dark:text-gray-200">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{(c.titles && c.titles[0]?.title) || c.title || `Chap ${c.chapter_number}`}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.excerpt || ''}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm text-gray-700 dark:text-gray-200 hidden md:table-cell">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                                                <td className="p-3 text-sm text-right">
                                                    <button
                                                        onClick={() => setSelectedChapter(c)}
                                                        title="View"
                                                        className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-md text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 hover:dark:bg-slate-600 dark:bg-gray-700/30 dark:text-blue-300"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span className="hidden sm:inline">View</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {chapters.map((c: any) => (
                                <div key={c.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col justify-between">
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Chapter - {c.chapter_number}</div>
                                        <h3 className="font-semibold text-md text-gray-800 dark:text-gray-100 mt-1">{(c.titles && c.titles[0]?.title) || c.title || `Chap ${c.chapter_number}`}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-2 line-clamp-3">{c.excerpt || ''}</p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            <div className=""></div>
                                            <div className="mt-1">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            
                                            <button
                                                onClick={() => setSelectedChapter(c)}
                                                className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 hover:dark:bg-slate-600 dark:bg-gray-800 dark:text-blue-300"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>View</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {selectedChapter && (
                    <RomanChapterDetails chapter={selectedChapter} onClose={() => setSelectedChapter(null)} />
                )}
            </div>
        </div>
    );
};

export default RomanChaptersPage;
