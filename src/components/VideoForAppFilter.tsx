import { useEffect, useRef, useState, useMemo } from "react";
import UseCreators from "../hooks/useCreators";
import UseCategory from "../hooks/useCategory";
import { UseSubCategoryReactive } from "../hooks/useSubCategory";
import type { Category } from "../components/CategoryAutoComplete";

export type TAppFilter = {
  creator_id: string;
  creatorSearch?: string;
  category_id?: string;
  categorySearch?: string;
  subcategory_id?: string;
  subcategorySearch?: string;
};

export default function VideoForAppFilter({
  onSubmit,
  params,
  filters,
  setFilters,
  scope = "videoForApp",
}: {
  params: any;
  filters: any;
  setFilters: any;
  onSubmit: (d: any) => void;
  scope?: "videoForApp";
}) {
  const selectedCategory = useMemo(() => {
    return filters.categorySearch && filters.category_id
      ? { id: parseInt(filters.category_id), name: filters.categorySearch } as Category
      : undefined;
  }, [filters.categorySearch, filters.category_id]);

  const { data: creators } = UseCreators();
  const { data: categories } = UseCategory();
  const { data: subCategories } = UseSubCategoryReactive(selectedCategory);

  const [creatorOpen, setCreatorOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const creatorRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const subcategoryRef = useRef<HTMLDivElement>(null);

  // Clé pour le localStorage
  const storageKey = `videoForAppFilters_${scope}`;

  // Charger les filtres depuis localStorage au montage
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem(storageKey);
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        // Fusionner avec les filtres actuels pour éviter d'écraser les valeurs par défaut
        setFilters((prev: any) => ({ ...prev, ...parsedFilters }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des filtres depuis localStorage:", error);
    }
  }, [storageKey, setFilters]);

  // Sauvegarder les filtres dans localStorage à chaque changement
  useEffect(() => {
    try {
      const filtersToSave = {
        creator_id: filters.creator_id,
        creatorSearch: filters.creatorSearch,
        category_id: filters.category_id,
        categorySearch: filters.categorySearch,
        subcategory_id: filters.subcategory_id,
        subcategorySearch: filters.subcategorySearch,
        isDeleted: filters.isDeleted,
        checking: filters.checking,
      };
      localStorage.setItem(storageKey, JSON.stringify(filtersToSave));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des filtres dans localStorage:", error);
    }
  }, [filters, storageKey]);

  // fermer dropdown creator au clic hors zone
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (creatorRef.current && !creatorRef.current.contains(event.target as Node)) {
        setCreatorOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryOpen(false);
      }
      if (subcategoryRef.current && !subcategoryRef.current.contains(event.target as Node)) {
        setSubcategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  // Soumission des filtres
  const submit = async () => {
    // Map isDeleted to true/false
    let isDeletedValue: boolean | undefined = undefined;
    if (filters.isDeleted === "yes") isDeletedValue = true;
    else if (filters.isDeleted === "no") isDeletedValue = false;
    else isDeletedValue = undefined;

    let checkingValue: string | null | undefined = undefined;
    if (filters.checking === "all" || filters.checking === "" || !filters.checking) checkingValue = undefined;
    else checkingValue = filters.checking;

    const data = {
      creator_id: filters.creator_id || undefined,
      category_id: filters.category_id || undefined,
      subcategory_id: filters.subcategory_id || undefined,
      isDeleted: isDeletedValue,
      checking: checkingValue,
      category: filters.categorySearch || undefined,
      subcategory: filters.subcategorySearch || undefined,
    };
    const safeParams = params || {};
    const finalQuery = { ...safeParams, ...data, page: '1' };
    try {
      const { fetchVideoForAppList } = await import("../api/videoForApp");
      const fetched = await fetchVideoForAppList(finalQuery);
      onSubmit(fetched.videos);
    } catch (error) {
      console.error("Erreur lors du filtrage :", error);
    }
  };

  const closeModal = () => {
    const modal = document.getElementById(
      "search_modal_52"
    ) as HTMLDialogElement | null;
    modal?.close();
    setHasInteracted(false);
    setCreatorOpen(false);
    setCategoryOpen(false);
    setSubcategoryOpen(false);
  };

  return (
    <dialog id="search_modal_52" className="modal">
      <div className="flex flex-col gap-4 modal-box w-max bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300">
        {/* Sélections principales */}

        {/* Filtres booléens */}
        <div className="flex flex-col gap-4">
          {/* Deleted filter */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300">
            <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">Deleted</p>
            <div className="flex gap-3">
              {['all', 'yes', 'no'].map((option) => (
                <label key={option} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="isDeleted"
                    className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                    checked={
                      option === 'all'
                        ? (filters.isDeleted === 'all' || filters.isDeleted === '')
                        : filters.isDeleted === option
                    }
                    onChange={() => handleChange('isDeleted', option)}
                  />
                  <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{option}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Checking filter */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300">
            <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">Checking</p>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: 'all', label: 'all' },
                { value: 'null', label: 'not ready' },
                { value: 'waiting for checking', label: 'ready' },
                { value: 'refused', label: 'refused' },
                { value: 'checked', label: 'checked' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="checking"
                    className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                    checked={
                      option.value === 'all'
                        ? (filters.checking === 'all' || filters.checking === '' || !filters.checking)
                        : filters.checking === option.value
                    }
                    onChange={() => handleChange('checking', option.value)}
                  />
                  <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>


        <div className="flex flex-col gap-6">
          {/* Creator searchable */}
          <div ref={creatorRef} className="relative">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Creator</label>
            <input
              type="text"
              placeholder="Search creator..."
              value={filters.creatorSearch || ""}
              onChange={(e) => {
                const value = e.target.value;
                setHasInteracted(true);
                if (value === "") {
                  handleChange("creatorSearch", "");
                  handleChange("creator_id", "");
                } else {
                  handleChange("creatorSearch", value);
                }
              }}
              onFocus={() => setCreatorOpen(true)}
              className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition"
            />
            {creatorOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                <div
                  className="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                  onClick={() => {
                    handleChange("creator_id", "");
                    handleChange("creatorSearch", "");
                    setCreatorOpen(false);
                  }}
                >
                  all
                </div>
                {(!creators || creators.length === 0) && (
                  <div className="px-3 py-2 text-gray-500">No creators found</div>
                )}
                {creators
                  ?.filter((c: any) =>
                    c.name?.toLowerCase().includes((filters.creatorSearch || "").toLowerCase())
                  )
                  .map((c: any) => (
                    <div
                      key={c.id}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                      onClick={() => {
                        handleChange("creator_id", String(c.id));
                        handleChange("creatorSearch", c.name);
                        setCreatorOpen(false);
                      }}
                    >
                      {c.name}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Category searchable */}
          <div ref={categoryRef} className="relative">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Category</label>
            <input
              type="text"
              placeholder="Search category..."
              value={filters.categorySearch || ""}
              onChange={(e) => {
                const value = e.target.value;
                setHasInteracted(true);
                if (value === "") {
                  handleChange("categorySearch", "");
                  handleChange("category_id", "");
                  handleChange("subcategorySearch", "");
                  handleChange("subcategory_id", "");
                } else {
                  handleChange("categorySearch", value);
                }
              }}
              onFocus={() => setCategoryOpen(true)}
              className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition"
            />
            {categoryOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                <div
                  className="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                  onClick={() => {
                    handleChange("category_id", "");
                    handleChange("categorySearch", "");
                    handleChange("subcategorySearch", "");
                    handleChange("subcategory_id", "");
                    setCategoryOpen(false);
                  }}
                >
                  all
                </div>
                {(!categories || categories.length === 0) && (
                  <div className="px-3 py-2 text-gray-500">No categories found</div>
                )}
                {categories
                  ?.filter((c: any) =>
                    c.name?.toLowerCase().includes((filters.categorySearch || "").toLowerCase())
                  )
                  .map((c: any) => (
                    <div
                      key={c.id}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                      onClick={() => {
                        handleChange("category_id", String(c.id));
                        handleChange("categorySearch", c.name);
                        handleChange("subcategorySearch", "");
                        handleChange("subcategory_id", "");
                        setCategoryOpen(false);
                      }}
                    >
                      {c.name}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Subcategory searchable */}
          <div ref={subcategoryRef} className="relative">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Subcategory</label>
            <input
              type="text"
              placeholder="Search subcategory..."
              value={filters.subcategorySearch || ""}
              onChange={(e) => {
                const value = e.target.value;
                setHasInteracted(true);
                if (value === "") {
                  handleChange("subcategorySearch", "");
                  handleChange("subcategory_id", "");
                } else {
                  handleChange("subcategorySearch", value);
                }
              }}
              onFocus={() => setSubcategoryOpen(true)}
              disabled={!filters.categorySearch}
              className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            />
            {subcategoryOpen && filters.categorySearch && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                <div
                  className="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                  onClick={() => {
                    handleChange("subcategory_id", "");
                    handleChange("subcategorySearch", "");
                    setSubcategoryOpen(false);
                  }}
                >
                  all
                </div>
                {(!subCategories || subCategories.length === 0) && (
                  <div className="px-3 py-2 text-gray-500">No subcategories found</div>
                )}
                {subCategories
                  ?.filter((sc: any) =>
                    sc.name?.toLowerCase().includes((filters.subcategorySearch || "").toLowerCase())
                  )
                  .map((sc: any) => (
                    <div
                      key={sc.id}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                      onClick={() => {
                        handleChange("subcategory_id", String(sc.id));
                        handleChange("subcategorySearch", sc.name);
                        setSubcategoryOpen(false);
                      }}
                    >
                      {sc.name}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <form method="dialog" className="pt-3 flex justify-end gap-3">
          <button className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">Close</button>
          <div
            className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
            onClick={async () => {
              setFilters({
                creator_id: "",
                creatorSearch: "",
                isDeleted: "all",
                checking: "all",
                category_id: "",
                categorySearch: "",
                subcategory_id: "",
                subcategorySearch: "",
              });
              setHasInteracted(false);
              setCreatorOpen(false);
              setCategoryOpen(false);
              setSubcategoryOpen(false);
              await submit();
            }}
          >
            Reset
          </div>
          <button
            className="btn btn-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-none transition-colors duration-300"
            onClick={(e) => {
              e.preventDefault();
              submit();
              closeModal();
            }}
          >
            Apply
          </button>
        </form>
      </div>
    </dialog>
  );
}
