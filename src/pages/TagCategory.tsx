import { useEffect, useState } from "react";
import AnimatedList from "../components/AnimatedList";
import TagCard from "../components/TagCard";
import {
    getTagCategoriesApi,
    createTagCategoryApi,
    deleteTagCategoryApi,
} from "../api/tagCategory";
import { getTagCategoriesPostApi, createTagCategoryPostApi, deleteTagCategoryPostApi, updateTagCategoryPostApi } from "../api/tagCategoryPost";
import toast from "react-hot-toast";

export default function TagCategory() {

    const [categories, setCategories] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [newCat, setNewCat] = useState("");
    const NON_SPACE_LIMIT = 324;

    // Post tag categories section state
    const [postCategories, setPostCategories] = useState<any[]>([]);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [newPostCat, setNewPostCat] = useState("");

    useEffect(() => {
        fetchTags();
        fetchPostTags();
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

    const fetchPostTags = async () => {
        try {
            const res = await getTagCategoriesPostApi();
            const items = res?.data?.items ?? res?.data ?? [];
            setPostCategories(Array.isArray(items) ? items : []);
        } catch (err) {
            console.error("Failed to load post tags", err);
            toast.error("Unable to load post tags");
        }
    };

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
        <div className="flex flex-col md:flex-row gap-5 min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-6">
            {/* Liste des catégories (video) */}
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
                            onEdit={(update) => setCategories((prev) => prev.map((it) => (it.id === c.id ? { ...it, name: update.name } : it)))}
                        />
                    )}
                </AnimatedList>
            </div>

            {/* Liste des catégories (post) */}
            <div className="md:min-w-1/3 bg-white dark:bg-gray-800 shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-all duration-300">
                <h1 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200 transition-colors duration-300">Tag post category</h1>

                <div className="flex gap-2 my-4">
                    <input
                        type="text"
                        value={newPostCat}
                        onChange={(e) => handleNewPostCatChange(e.target.value)}
                        placeholder="new post tag..."
                        maxLength={1000}
                        className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg flex-1 px-2 py-1 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 transition-all duration-300"
                    />
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
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-1 rounded-lg transition-all duration-300"
                    >
                        +
                    </button>
                </div>

                <AnimatedList items={postCategories}>
                    {(c) => (
                        <TagCard
                            key={c.id}
                            tag={c}
                            isSelected={selectedPostId === c.id}
                            onSelect={() => setSelectedPostId(c.id as number)}
                            onDelete={async () => {
                                try {
                                    await deleteTagCategoryPostApi(c.id as number);
                                    if (selectedPostId === c.id) setSelectedPostId(null);
                                    toast.success("Post tag removed");
                                    fetchPostTags();
                                } catch (err) {
                                    console.error(err);
                                    toast.error("Failed to remove post tag");
                                }
                            }}
                            onEdit={async (update) => {
                                try {
                                    await updateTagCategoryPostApi({ id: c.id as number, name: update.name });
                                    toast.success("Post tag updated");
                                    fetchPostTags();
                                } catch (err) {
                                    console.error(err);
                                    toast.error("Failed to update post tag");
                                }
                            }}
                        />
                    )}
                </AnimatedList>
            </div>


        </div>
    );
}
