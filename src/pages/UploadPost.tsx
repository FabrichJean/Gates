import React from "react";

// data static for category
const categories = [
    { id: 1, name: "Category 1" },
    { id: 2, name: "Category 2" },
    { id: 3, name: "Category 3" },
];

// data static for sub category
const subCategories = [
    { id: 1, name: "Sub Category 1", categoryId: 1 },
    { id: 2, name: "Sub Category 2", categoryId: 1 },
    { id: 3, name: "Sub Category 3", categoryId: 2 },
];

const UploadPost = () => {



    return (
        <div className="h-screen flex items-start px-2 py-2 border border-gray-300 dark:border-gray-700 rounded-lg">
            {/* contenu de l'upload */}
            <div className="w-[70%] justify-start">
                <h2 className="text-lg font-semibold text-left">Upload Post</h2>
                <div className="mt-2">
                    {/* formulaire de l'upload */}
                    <form className="flex flex-col space-y-4">
                        {/* champ select de catégorie */}
                        <div className="relative">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <select
                                id="category"
                                name="category"
                                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>
                    
                </div>
            </div>
        </div>  
    );
};
export default UploadPost;