import { useEffect, useState } from "react";
import AnimatedList from "../components/AnimatedList";
import TagCard from "../components/TagCard";
import {
    getTagCategoriesApi,
    createTagCategoryApi,
    deleteTagCategoryApi,
    bulkUpsertTagCategoriesApi,
} from "../api/tagCategory";
import toast from "react-hot-toast";

export default function TagCategory() {

    const [categories, setCategories] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [newCat, setNewCat] = useState("");
    const [bulkJson, setBulkJson] = useState("");
    const NON_SPACE_LIMIT = 324;

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await getTagCategoriesApi();
            setCategories(res.data.items || []);
        } catch (err) {
            console.error("Failed to load tags", err);
            toast.error("Unable to load tags");
        }
    };
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
                if (count < NON_SPACE_LIMIT) {
                    out += ch;
                    count++;
                } else {
                    // skip 
                }
            }
        }
        setNewCat(out);

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

    const bulkUpsert = async () => {
        if (!bulkJson.trim()) return;
        try {
            const payload = JSON.parse(bulkJson);
            if (!payload.tagCategory || !Array.isArray(payload.tagCategory)) {
                toast.error("Invalid payload: expected { tagCategory: [...] }");
                return;
            }
            await bulkUpsertTagCategoriesApi(payload.tagCategory);
            toast.success("Bulk upsert successful");
            setBulkJson("");
            fetchTags();
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Bulk upsert failed");
        }
    };

    

    return (
        <div className="flex flex-col md:flex-row gap-5 min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-6">
            {/* Liste des catégories */}
            <div className="md:min-w-1/3 bg-white dark:bg-gray-800 shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-all duration-300">
                <h1 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200 transition-colors duration-300">Tag video category</h1>

                <div className="flex gap-2 my-4">
                    <input
                        type="text"
                        value={newCat}
                        onChange={(e) => handleNewCatChange(e.target.value)}
                        placeholder="new category..."
                        // keep a generous hard limit so browser stop long inputs, enforcement is done by the handler
                        maxLength={1000}
                        className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg flex-1 px-2 py-1 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 transition-all duration-300"
                    />
                    <div className="text-sm text-gray-500 dark:text-gray-400 px-1">Max {NON_SPACE_LIMIT} caractères (hors espaces)</div>
                    <button
                        onClick={addCategory}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-1 rounded-lg transition-all duration-300"
                    >
                        +
                    </button>
                </div>

                <AnimatedList items={categories}>
                    {(c) => (
                        <TagCard
                            key={c.id}
                            tag={c}
                            isSelected={selectedId === c.id}
                            onSelect={() => setSelectedId(c.id as number)}
                            onDelete={() => removeCategory(c.id as number)}
                            onEdit={(newName: string) => setCategories((prev) => prev.map((it) => (it.id === c.id ? { ...it, name: newName } : it)))}
                        />
                    )}
                </AnimatedList>
            </div>

            {/* <PlateformPanel categoryId={selectedId}/> */}

            
        </div>
    );
}
