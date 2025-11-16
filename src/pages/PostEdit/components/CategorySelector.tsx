import React from "react";

type Category = { id: number; name: string };
type SubCategory = { id: number; name: string; category: { id: number } };

export default function CategorySelector(props: {
  categories?: { id: number; name: string }[];
  selectedOptions: string[];
  selectedCategory?: Category | null;
  setSelectedCategory: (c: Category | null) => void;
  selectedSubCategory?: { id: number; name: string; categoryId: number } | null;
  setSelectedSubCategory: (s: { id: number; name: string; categoryId: number } | null) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  subOpen: boolean;
  setSubOpen: (v: boolean) => void;
  categoryDropdownRef: React.RefObject<HTMLDivElement | null>;
  subCategoryDropdownRef: React.RefObject<HTMLDivElement | null>;
  availableSubCategories?: SubCategory[];
  setSelectedOptions: (arr: string[]) => void;
  postCategoryName?: string;
}) {
  const {
    categories,
    selectedOptions,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    open,
    setOpen,
    subOpen,
    setSubOpen,
    categoryDropdownRef,
    subCategoryDropdownRef,
    availableSubCategories,
    setSelectedOptions,
    postCategoryName,
  } = props;

  const filteredSubCategories = Array.isArray(availableSubCategories)
    ? availableSubCategories.filter((sc) => sc && sc.category && selectedCategory && sc.category.id === selectedCategory.id)
    : [];

  return (
    <>
      <div className="relative w-full" ref={categoryDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category:
        </label>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="relative w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-gray-900 dark:text-white"
        >
          <span className="block truncate">{selectedOptions.length ? selectedOptions[0] : postCategoryName}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </button>

        {open && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 max-h-60 rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 overflow-auto">
            {categories?.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedOptions([cat.name]);
                  setSelectedCategory({ id: cat.id, name: cat.name });
                  setSelectedSubCategory(null);
                  setOpen(false);
                }}
                className="cursor-pointer py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white text-gray-900 dark:text-white"
              >
                {cat.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative w-full mt-4" ref={subCategoryDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sub-Category:</label>
        <button
          type="button"
          onClick={() => selectedCategory && setSubOpen(!subOpen)}
          disabled={!selectedCategory}
          className={`relative w-full border rounded-md pl-3 pr-10 py-2 text-left focus:outline-none text-sm ${
            !selectedCategory
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          }`}
        >
          <span className="block truncate">{selectedSubCategory ? selectedSubCategory.name : ""}</span>
        </button>

        {subOpen && selectedCategory && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 max-h-60 rounded-md py-1 shadow-lg overflow-auto">
            {filteredSubCategories.length > 0 ? (
              filteredSubCategories.map((subCat) => (
                <div
                  key={subCat.id}
                  onClick={() => {
                    setSelectedSubCategory({ id: subCat.id, name: subCat.name, categoryId: subCat.category?.id ?? selectedCategory.id });
                    setSubOpen(false);
                  }}
                  className="cursor-pointer py-2 pl-3 hover:bg-indigo-600 hover:text-white text-gray-900 dark:text-white"
                >
                  {subCat.name}
                </div>
              ))
            ) : (
              <div className="py-2 px-3 text-sm text-gray-500 dark:text-gray-400">No sub-categories found</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
