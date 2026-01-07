import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Tag as TagIcon, Plus, Edit, Trash2, Search, X, Save } from "lucide-react";
import AnimatedList from "../components/AnimatedList";
import TagCard from "../components/TagCard";
import Pagination from "../components/Pagination";
import {
    getTagCategoriesApi,
    createTagCategoryApi,
    deleteTagCategoryApi,
    updateTagCategoryApi,
} from "../api/tagCategory";
import { getTagCategoriesPostApi, createTagCategoryPostApi, deleteTagCategoryPostApi, updateTagCategoryPostApi } from "../api/tagCategoryPost";
import toast from "react-hot-toast";

export default function TagCategory() {
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [newCat, setNewCat] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const NON_SPACE_LIMIT = 324;

    // Pagination states for video tags
    const [currentVideoPage, setCurrentVideoPage] = useState(1);
    const itemsPerPage = 6;

    // Search states
    const [videoSearchTerm, setVideoSearchTerm] = useState("");
    const [postSearchTerm, setPostSearchTerm] = useState("");

    // Post tag categories section state
    const [postCategories, setPostCategories] = useState<any[]>([]);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [newPostCat, setNewPostCat] = useState("");
    const [isPostLoading, setIsPostLoading] = useState(true);

    // Pagination states for post tags
    const [currentPostPage, setCurrentPostPage] = useState(1);

    // Edit states
    const [editingVideoTagId, setEditingVideoTagId] = useState<number | null>(null);
    const [editingVideoTagName, setEditingVideoTagName] = useState("");
    const [editingPostTagId, setEditingPostTagId] = useState<number | null>(null);
    const [editingPostTagName, setEditingPostTagName] = useState("");

    useEffect(() => {
        fetchTags();
        fetchPostTags();
    }, []);

    const fetchTags = async () => {
        try {
            setIsLoading(true);
            const res = await getTagCategoriesApi();
            setCategories(res.data.items || []);
        } catch (err) {
            console.error("Failed to load tags", err);
            toast.error("Unable to load tags");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPostTags = async () => {
        try {
            setIsPostLoading(true);
            const res = await getTagCategoriesPostApi();
            const items = res?.data?.items ?? res?.data ?? [];
            setPostCategories(Array.isArray(items) ? items : []);
        } catch (err) {
            console.error("Failed to load post tags", err);
            toast.error("Unable to load post tags");
        } finally {
            setIsPostLoading(false);
        }
    };

    // Filtered categories for search
    const filteredVideoTags = useMemo(() => {
        return categories.filter(cat =>
            cat.name.toLowerCase().includes(videoSearchTerm.toLowerCase())
        );
    }, [categories, videoSearchTerm]);

    const filteredPostTags = useMemo(() => {
        return postCategories.filter(cat =>
            cat.name.toLowerCase().includes(postSearchTerm.toLowerCase())
        );
    }, [postCategories, postSearchTerm]);

    // Pagination logic for video tags
    const paginatedVideoTags = useMemo(() => {
        const startIndex = (currentVideoPage - 1) * itemsPerPage;
        return filteredVideoTags.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredVideoTags, currentVideoPage]);

    // Pagination logic for post tags
    const paginatedPostTags = useMemo(() => {
        const startIndex = (currentPostPage - 1) * itemsPerPage;
        return filteredPostTags.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPostTags, currentPostPage]);

    const handleNewCatChange = (value: string) => {
        let count = 0;
        setNewCat(
            [...value].map(ch => {
                if (/\s/.test(ch)) return ch;
                return count++ < NON_SPACE_LIMIT ? ch : '';
            }).join('')
        );
    };

    const addCategory = async () => {
        if (!newCat.trim()) return;
        try {
            await createTagCategoryApi({ name: newCat.trim() });
            toast.success("Tag created");
            setNewCat("");
            fetchTags();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create tag");
        }
    };

    const removeCategory = async (id: number) => {
        const category = categories.find(cat => cat.id === id);
        const confirmed = window.confirm(
            `Êtes-vous sûr de vouloir supprimer le tag "${category?.name}" ? Cette action est irréversible.`
        );

        if (!confirmed) return;

        try {
            await deleteTagCategoryApi(id);
            if (selectedId === id) setSelectedId(null);
            toast.success("Tag removed");
            fetchTags();
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove tag");
        }
    };

    // Update video tag
    const updateVideoTag = async (id: number, newName: string) => {
        if (!newName.trim()) {
            toast.error("Le nom ne peut pas être vide");
            return;
        }

        try {
            await updateTagCategoryApi(id, { name: newName.trim() });
            toast.success("Tag mis à jour");
            setEditingVideoTagId(null);
            setEditingVideoTagName("");
            fetchTags();
        } catch (err) {
            console.error(err);
            toast.error("Échec de la mise à jour du tag");
        }
    };

    // Update post tag
    const updatePostTag = async (id: number, newName: string) => {
        if (!newName.trim()) {
            toast.error("Le nom ne peut pas être vide");
            return;
        }

        try {
            await updateTagCategoryPostApi({ id, name: newName.trim() });
            toast.success("Tag mis à jour");
            setEditingPostTagId(null);
            setEditingPostTagName("");
            fetchPostTags();
        } catch (err) {
            console.error(err);
            toast.error("Échec de la mise à jour du tag");
        }
    };

    // Start editing video tag
    const startEditingVideoTag = (category: any) => {
        setEditingVideoTagId(category.id);
        setEditingVideoTagName(category.name);
    };

    // Start editing post tag
    const startEditingPostTag = (category: any) => {
        setEditingPostTagId(category.id);
        setEditingPostTagName(category.name);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingVideoTagId(null);
        setEditingVideoTagName("");
        setEditingPostTagId(null);
        setEditingPostTagName("");
    };

    // Helpers for post tag inputs (same non-space limit behavior)
    const handleNewPostCatChange = (value: string) => {
        let count = 0;
        setNewPostCat(
            [...value].map(ch => {
                if (/\s/.test(ch)) return ch;
                return count++ < NON_SPACE_LIMIT ? ch : '';
            }).join('')
        );
    };



    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Header compact */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TagIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Tag Categories
                            </h1>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-lg font-medium text-blue-600 dark:text-blue-400">
                                    {categories.length}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Video
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-medium text-green-600 dark:text-green-400">
                                    {postCategories.length}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Post
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid compact */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Video Tags Section - compact */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Section Header minimal */}
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <TagIcon className="w-4 h-4 text-blue-500" />
                                Video Tags
                            </h2>
                        </div>

                        {/* Search and Add compact */}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex gap-2">
                                {/* Search minimal */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={videoSearchTerm}
                                        onChange={(e) => {
                                            setVideoSearchTerm(e.target.value);
                                            setCurrentVideoPage(1);
                                        }}
                                        className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    {videoSearchTerm && (
                                        <button
                                            onClick={() => {
                                                setVideoSearchTerm("");
                                                setCurrentVideoPage(1);
                                            }}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Add Button minimal */}
                                <button
                                    onClick={() => {
                                        const name = newCat.trim();
                                        if (!name) return;
                                        addCategory();
                                    }}
                                    disabled={!newCat.trim()}
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add
                                </button>
                            </div>

                            {/* Quick Add Input minimal */}
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={newCat}
                                    onChange={(e) => handleNewCatChange(e.target.value)}
                                    placeholder="New category name..."
                                    maxLength={1000}
                                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Tags List compact */}
                        <div className="p-3">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading...</span>
                                </div>
                            ) : filteredVideoTags.length === 0 ? (
                                <div className="text-center py-6">
                                    <TagIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {videoSearchTerm ? 'No tags found' : 'No categories yet'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {filteredVideoTags.length} of {categories.length}
                                            {videoSearchTerm && ' (filtered)'}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <AnimatePresence>
                                            {paginatedVideoTags.map((category, index) => (
                                                <motion.div
                                                    key={category.id}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ delay: index * 0.02 }}
                                                    className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0">
                                                            <TagIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            {editingVideoTagId === category.id ? (
                                                                <input
                                                                    type="text"
                                                                    value={editingVideoTagName}
                                                                    onChange={(e) => setEditingVideoTagName(e.target.value)}
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            updateVideoTag(category.id, editingVideoTagName);
                                                                        } else if (e.key === 'Escape') {
                                                                            cancelEditing();
                                                                        }
                                                                    }}
                                                                    className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                    {category.name}
                                                                </h3>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        {editingVideoTagId === category.id ? (
                                                            <>
                                                                <button
                                                                    onClick={() => updateVideoTag(category.id, editingVideoTagName)}
                                                                    className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded transition-colors"
                                                                    title="Save"
                                                                >
                                                                    <Save className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={cancelEditing}
                                                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded transition-colors"
                                                                    title="Cancel"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => startEditingVideoTag(category)}
                                                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => removeCategory(category.id)}
                                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    {filteredVideoTags.length > itemsPerPage && (
                                        <div className="mt-4">
                                            <Pagination
                                                totalItems={filteredVideoTags.length}
                                                pageSize={itemsPerPage}
                                                currentPage={currentVideoPage}
                                                onPageChange={setCurrentVideoPage}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Post Tags Section - compact */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Section Header minimal */}
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <TagIcon className="w-4 h-4 text-green-500" />
                                Post Tags
                            </h2>
                        </div>

                        {/* Search and Add compact */}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex gap-2">
                                {/* Search minimal */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={postSearchTerm}
                                        onChange={(e) => {
                                            setPostSearchTerm(e.target.value);
                                            setCurrentPostPage(1);
                                        }}
                                        className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    />
                                    {postSearchTerm && (
                                        <button
                                            onClick={() => {
                                                setPostSearchTerm("");
                                                setCurrentPostPage(1);
                                            }}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Add Button minimal */}
                                <button
                                    onClick={async () => {
                                        const name = newPostCat.trim();
                                        if (!name) return;
                                        try {
                                            await createTagCategoryPostApi({ name });
                                            toast.success("Post tag created");
                                            setNewPostCat("");
                                            fetchPostTags();
                                        } catch (err) {
                                            console.error(err);
                                            toast.error("Failed to create post tag");
                                        }
                                    }}
                                    disabled={!newPostCat.trim()}
                                    className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add
                                </button>
                            </div>

                            {/* Quick Add Input minimal */}
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={newPostCat}
                                    onChange={(e) => handleNewPostCatChange(e.target.value)}
                                    placeholder="New category name..."
                                    maxLength={1000}
                                    onKeyPress={async (e) => {
                                        if (e.key === 'Enter') {
                                            const name = newPostCat.trim();
                                            if (!name) return;
                                            try {
                                                await createTagCategoryPostApi({ name });
                                                toast.success("Post tag created");
                                                setNewPostCat("");
                                                fetchPostTags();
                                            } catch (err) {
                                                console.error(err);
                                                toast.error("Failed to create post tag");
                                            }
                                        }
                                    }}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Tags List compact */}
                        <div className="p-3">
                            {isPostLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading...</span>
                                </div>
                            ) : filteredPostTags.length === 0 ? (
                                <div className="text-center py-6">
                                    <TagIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {postSearchTerm ? 'No tags found' : 'No categories yet'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {filteredPostTags.length} of {postCategories.length}
                                            {postSearchTerm && ' (filtered)'}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <AnimatePresence>
                                            {paginatedPostTags.map((category, index) => (
                                                <motion.div
                                                    key={category.id}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ delay: index * 0.02 }}
                                                    className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center flex-shrink-0">
                                                            <TagIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            {editingPostTagId === category.id ? (
                                                                <input
                                                                    type="text"
                                                                    value={editingPostTagName}
                                                                    onChange={(e) => setEditingPostTagName(e.target.value)}
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            updatePostTag(category.id, editingPostTagName);
                                                                        } else if (e.key === 'Escape') {
                                                                            cancelEditing();
                                                                        }
                                                                    }}
                                                                    className="w-full px-2 py-1 text-sm border border-green-300 dark:border-green-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                    {category.name}
                                                                </h3>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        {editingPostTagId === category.id ? (
                                                            <>
                                                                <button
                                                                    onClick={() => updatePostTag(category.id, editingPostTagName)}
                                                                    className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded transition-colors"
                                                                    title="Save"
                                                                >
                                                                    <Save className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={cancelEditing}
                                                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded transition-colors"
                                                                    title="Cancel"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => startEditingPostTag(category)}
                                                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        const confirmed = window.confirm(
                                                                            `Êtes-vous sûr de vouloir supprimer le tag "${category.name}" ? Cette action est irréversible.`
                                                                        );

                                                                        if (!confirmed) return;

                                                                        try {
                                                                            await deleteTagCategoryPostApi(category.id);
                                                                            if (selectedPostId === category.id) setSelectedPostId(null);
                                                                            toast.success("Post tag removed");
                                                                            fetchPostTags();
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            toast.error("Failed to remove post tag");
                                                                        }
                                                                    }}
                                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    {filteredPostTags.length > itemsPerPage && (
                                        <div className="mt-4">
                                            <Pagination
                                                totalItems={filteredPostTags.length}
                                                pageSize={itemsPerPage}
                                                currentPage={currentPostPage}
                                                onPageChange={setCurrentPostPage}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
