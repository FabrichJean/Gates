import { useState } from "react";
import AnimatedList from "../components/AnimatedList";
import CategoryCard from "../components/CategoryCard";
import SubCategoryPanel from "../components/SubCategoryPanel";
import { type Category } from "../components/CategoryAutoComplete";
import { motion, AnimatePresence } from "framer-motion";
import UseCategory from "../hooks/useCategory";
import { createCastegoryApi, deleteCategoryApi } from "../api/categories";
import toast from "react-hot-toast";

export default function CategoryManager() {
    // In this manager we always keep categories with numeric ids, so narrow the type
    // const [categories, setCategories] = useState<(Partial<Category> & { id: number })[]>([
    //     { id: 1, name: "Technologie", subcategories: [{ id: 11, name: "IA" }] },
    //     { id: 2, name: "Musique", subcategories: [{ id: 21, name: "Guitare" }] },
    // ]);

    const { data: categories, reFetch } = UseCategory()

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [newCat, setNewCat] = useState("");

    const addCategory = async () => {
        if (!newCat.trim()) return;

        await createCastegoryApi(newCat.trim())
            .then(reFetch)
            .catch(() => {
                toast.error('err')
            })
        // setCategories([...categories, newCategory]);
        setNewCat("");
    };

    const removeCategory = async (id: number) => {
        await deleteCategoryApi(id)
            .then(() => {
                if (selectedId === id) setSelectedId(null);
                reFetch()
            })
            .catch(() => {
                toast.error('err')
            })
    };

    // Accept partial updates from SubCategoryPanel and merge them into existing category
    const updateCategory = (updated: Partial<Category>) => {
        // setCategories((prev) =>
        //     prev.map((c) =>
        //         String(c.id) === String(updated.id)
        //             ? ({ ...c, ...updated } as Partial<Category> & { id: number })
        //             : c
        //     )
        // );
    };

    const selectedCategory = categories?.find((c) => c.id === selectedId) ?? null;

    return (
        <div className="flex flex-col md:flex-row gap-10 min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-6">
            {/* Liste des catégories */}
            <div className="md:w-1/3 bg-white dark:bg-gray-800 shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-all duration-300">
                <h1 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200 transition-colors duration-300">Category </h1>

                <div className="flex gap-2 my-4">
                    <input
                        type="text"
                        value={newCat}
                        onChange={(e) => setNewCat(e.target.value)}
                        placeholder="new category..."
                        className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg flex-1 px-2 py-1 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 transition-all duration-300"
                    />
                    <button
                        onClick={addCategory}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-1 rounded-lg transition-all duration-300"
                    >
                        +
                    </button>
                </div>

                <AnimatedList items={categories}>
                    {(c) => (
                        <CategoryCard
                            key={c.id}
                            category={c}
                            isSelected={selectedId === c.id}
                            onSelect={() => setSelectedId(c.id as number)}
                            onDelete={() => removeCategory(c.id as number)}
                            onEdit={reFetch}
                        />
                    )}
                </AnimatedList>
            </div>

            {/* Sous-catégories */}
            <div className="flex-1 bg-white dark:bg-gray-800 shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 overflow-hidden transition-all duration-300">
                <AnimatePresence mode="wait">
                    {selectedCategory ? (
                        <motion.div
                            key={selectedCategory.id}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.3 }}
                        >
                            <SubCategoryPanel category={selectedCategory} onUpdate={updateCategory} />
                        </motion.div>
                    ) : (
                        <motion.p
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-gray-400 dark:text-gray-500 text-center py-20 transition-colors duration-300"
                        >
                            Sélectionne une catégorie à gauche pour voir ses sous-catégories.
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
