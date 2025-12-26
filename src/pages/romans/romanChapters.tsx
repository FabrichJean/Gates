import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getChaptersByRomanIdApi } from "../../api/romanChapter";
import { Loader2, BookOpen } from "lucide-react";
import RomanChapterDetails from "../../components/romanChapterDetails";

type RomanChapter = any;

const RomanChaptersPage = () => {
    const { id } = useParams<{ id: string }>();
    const [chapters, setChapters] = useState<RomanChapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChapter, setSelectedChapter] = useState<RomanChapter | null>(null);

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
                    <Link to={`/romans/${id}`} className="text-sm text-blue-600 hover:underline">Back to roman</Link>
                </div>

                {chapters.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                        <p className="text-gray-500">No chapters found for this roman.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="text-left p-3 text-sm text-gray-600">#</th>
                                    <th className="text-left p-3 text-sm text-gray-600">Title</th>
                                    <th className="text-left p-3 text-sm text-gray-600">Words</th>
                                    <th className="text-left p-3 text-sm text-gray-600">Status</th>
                                    <th className="text-left p-3 text-sm text-gray-600">Date</th>
                                    <th className="text-right p-3 text-sm text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {chapters.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="p-3 text-sm">{c.chapter_number}</td>
                                        <td className="p-3 text-sm">{(c.titles && c.titles[0]?.title) || c.title || `Chap ${c.chapter_number}`}</td>
                                        <td className="p-3 text-sm">{c.word_count?.toLocaleString() || 0}</td>
                                        <td className="p-3 text-sm">{c.isPublished ? 'Published' : 'Draft'}</td>
                                        <td className="p-3 text-sm">{new Date(c.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 text-sm text-right">
                                            <button
                                                onClick={() => setSelectedChapter(c)}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedChapter && (
                    <RomanChapterDetails chapter={selectedChapter} onClose={() => setSelectedChapter(null)} />
                )}
            </div>
        </div>
    );
};

export default RomanChaptersPage;
