import { useState } from "react";
import AnimatedList from "../components/AnimatedList";
import PostCategoryCard from "../components/PostCategoryCard";
import PostSubCategoryPanel from "../components/PostSubCategoryPanel";
import { motion, AnimatePresence } from "framer-motion";
import useCategoryPost from "../hooks/posts/useCategoryPost";
import { createPostCategoryApi, deletePostCategoryApi } from "../api/postCategories";
import toast from "react-hot-toast";
import type { Category } from "../components/CategoryAutoComplete";

export default function PostCategoryManager() {
    const { data: categoriesResp, reFetch } = useCategoryPost();
    type PostCategory = { id: number; name: string };
    const categories = (categoriesResp?.categories as PostCategory[]) || [];

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [newCat, setNewCat] = useState("");
    const [newCatCreator, setNewCatCreator] = useState("");
    const NON_SPACE_LIMIT = 324;

    const handleNewCatChange = (value: string) => {
        const nonSpaceCount = value.replace(/\s/g, '').length;
        if (nonSpaceCount <= NON_SPACE_LIMIT) {
            setNewCat(value);
            return;
        }
        let count = 0;
        let out = '';
        for (const ch of value) {
            if (/\s/.test(ch)) {
                out += ch;
            } else {
                if (count < NON_SPACE_LIMIT) { out += ch; count++; }
            }
        }
        setNewCat(out);
    };

    const addCategory = async () => {
        if (!newCat.trim()) return;
        try {
            await createPostCategoryApi(newCat.trim(), newCatCreator?.trim() || undefined);
            reFetch?.();
            setNewCat("");
            setNewCatCreator("");
        } catch {
            toast.error('err');
        }
    };

    const removeCategory = async (id: number) => {
        try {
            await deletePostCategoryApi(id);
            if (selectedId === id) setSelectedId(null);
            reFetch?.();
        } catch {
            toast.error('err');
        }
    };

    const selectedCategory = categories?.find((c) => c.id === selectedId) ?? null;

    return (
        <div className="flex flex-col md:flex-row gap-5 min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-6">
            <div className="md:min-w-1/3 bg-white dark:bg-gray-800 shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-all duration-300">
                <h1 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200 transition-colors duration-300">Post Category</h1>
                <div className="flex gap-2 my-4">
                    <input type="text" value={newCat} onChange={(e) => handleNewCatChange(e.target.value)} placeholder="new category..." maxLength={1000} className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg flex-1 px-2 py-1 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 transition-all duration-300" />
                    {/* <input type="text" value={newCatCreator} onChange={(e) => setNewCatCreator(e.target.value)} placeholder="creator (optional)" className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-2 py-1 w-48 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 transition-all duration-300" /> */}
                    <div className="text-sm text-gray-500 dark:text-gray-400 px-1">Max {NON_SPACE_LIMIT} caractères (hors espaces)</div>
                    <button onClick={addCategory} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-1 rounded-lg transition-all duration-300">+</button>
                </div>

                <AnimatedList items={categories}>
                    {(c: PostCategory) => (
                        <PostCategoryCard
                            key={c.id}
                            category={c as Category}
                            isSelected={selectedId === c.id}
                            onSelect={() => setSelectedId(c.id)}
                            onDelete={() => removeCategory(c.id)}
                            onEdit={() => reFetch?.()}
                        />
                    )}
                </AnimatedList>
            </div>

            <div className="md:min-w-1/3 bg-white dark:bg-gray-800 shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 overflow-hidden transition-all duration-300">
                <AnimatePresence mode="wait">
                    {selectedCategory ? (
                        <motion.div key={selectedCategory.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                            <PostSubCategoryPanel category={selectedCategory as Category} />
                        </motion.div>
                    ) : (
                        <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-400 dark:text-gray-500 text-center py-20 transition-colors duration-300">Sélectionne une catégorie à gauche pour voir ses sous-catégories.</motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
