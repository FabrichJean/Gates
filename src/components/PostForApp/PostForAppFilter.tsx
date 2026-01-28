/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { getPostsForApp } from "../../api/postsForApp";
import useCategoryPostForApp from "../../hooks/posts/useCategoryPostForApp";
import useSubCategoryPostForApp from "../../hooks/posts/useSubCategoryPostForApp";
import { useUsers } from "../../hooks/useAuth";
import UseCreators from "../../hooks/useCreators";
import {
  mapStatus,
  mapStatusProcessing,
  reverseStatus,
} from "../../utils/filter";

export type TPostForAppFilter = {
  category_id: string;
  sub_category_id: string;
  creator_id: number | string;
  startDate: string;
  endDate: string;
  // video-like statuses to mirror VideoFilters
  user_id?: string;
  isDeleted?: string;
  processing?: string;
  uploaded?: string; // legacy: 'all' | '1' | '0'
  page: string;
  limit: string;
  sort: string;
  order: string;
  // ajout utile pour la recherche créateur côté UI
  creatorSearch?: string;
};

export default memo(function PostForAppFilter({
  filters,
  setFilters,
}: {
  params?: any;
  filters: any;
  setFilters: (f: any) => void;
}) {
  // Internal local state for form fields
  const { data: users } = useUsers("");
  const { data: creators } = UseCreators({isAll: true});
  const {
    data: categoriesResponse,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoryPostForApp();
  const { data: subcat } = useSubCategoryPostForApp(
    Number(filters?.category_id),
  );

  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    filters?.category_id ? [String(filters.category_id)] : [],
  );

  const [localFilters, setLocalFilters] = useState(() => ({ ...filters }));

  useEffect(() => {
    setLocalFilters({ ...filters });
  }, [filters]);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const subCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const creatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localFilters?.category_id && categoriesResponse?.categories) {
      const found = categoriesResponse.categories.find(
        (c: any) => String(c.id) === String(localFilters.category_id),
      );
      if (found) setSelectedOptions([found.name]);
      else setSelectedOptions([]);
    } else {
      setSelectedOptions([]);
    }
  }, [localFilters?.category_id, categoriesResponse]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
      if (
        subCategoryDropdownRef.current &&
        !subCategoryDropdownRef.current.contains(event.target as Node)
      ) {
        setSubOpen(false);
      }
      if (
        creatorRef.current &&
        !creatorRef.current.contains(event.target as Node)
      ) {
        setCreatorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Change handler for local state
  const handleChange = useCallback((key: string, value: any) => {
    setLocalFilters((prev: any) => ({ ...prev, [key]: value }));
  }, []);

  const handleSelectCategory = useCallback((cat: { id: number; name: string }) => {
    setLocalFilters((prev: any) => ({
      ...prev,
      category_id: String(cat.id),
      sub_category_id: "",
    }));
    setSelectedOptions([cat.name]);
    // Ne pas fermer le dropdown ni le modal
  }, []);

  // Only update parent filters on submit
  const submit = useCallback(() => {
    localStorage.setItem(
      "posts_for_app_filtered",
      JSON.stringify({ ...localFilters }),
    );
    setFilters({ ...localFilters, page: "1" });
  }, [localFilters, setFilters]);

  const closeModal = useCallback(() => {
    const modal = document.getElementById(
      "search_modal_posts_for_app",
    ) as HTMLDialogElement | null;
    modal?.close();
  }, []);

  return (
    <dialog
      id="search_modal_posts_for_app"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="flex flex-col gap-4 modal-box w-full max-w-lg sm:w-max h-[90vh] sm:h-auto overflow-auto p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div ref={categoryDropdownRef}>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>

            {categoriesError && (
              <div className="mb-2 text-sm text-red-600 dark:text-red-400">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Erreur lors du chargement des catégories:{" "}
                  {String(categoriesError)}
                </span>
              </div>
            )}

            <div className="mt-1 relative w-full">
              <button
                type="button"
                onClick={() => !categoriesLoading && setOpen(!open)}
                disabled={categoriesLoading}
                className={`relative w-full border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${
                  categoriesLoading
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                <span className="block truncate">
                  {categoriesLoading
                    ? "Chargement des catégories..."
                    : categoriesError
                      ? "Erreur lors du chargement"
                      : selectedOptions.length
                        ? selectedOptions[0]
                        : "all"}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400 dark:text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </button>

              {open && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 dark:ring-gray-600 overflow-auto focus:outline-none sm:text-sm">
                      <div
                        onClick={() => {
                          handleChange("sub_category_id", "");
                          // Ne pas fermer le dropdown ni le modal
                        }}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white text-gray-900 dark:text-white dark:hover:bg-indigo-500"
                      >
                    <span
                      className={`block truncate ${filters.category_id === "" ? "font-semibold" : ""}`}
                    >
                      all
                    </span>
                  </div>
                  {categoriesLoading ? (
                    <div className="py-2 pl-3 pr-9 text-gray-500 dark:text-gray-400">
                      Chargement des catégories...
                    </div>
                  ) : categoriesError ? (
                    <div className="py-2 pl-3 pr-9 text-red-500 dark:text-red-400">
                      Erreur: {String(categoriesError)}
                    </div>
                  ) : categoriesResponse?.categories?.length === 0 ? (
                    <div className="py-2 pl-3 pr-9 text-gray-500 dark:text-gray-400">
                      Aucune catégorie disponible
                    </div>
                  ) : (
                    categoriesResponse?.categories?.map((c: any) => (
                      <div
                        key={c.id}
                        onClick={() =>
                          handleSelectCategory({ id: c.id, name: c.name })
                        }
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white text-gray-900 dark:text-white dark:hover:bg-indigo-500"
                      >
                        <span
                          className={`block truncate ${selectedOptions[0] === c.name ? "font-semibold" : ""}`}
                        >
                          {c.name}
                        </span>
                        {selectedOptions[0] === c.name && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 dark:text-indigo-400 hover:text-white">
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div ref={subCategoryDropdownRef}>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              SubCategory
            </label>

            <div className="mt-1 relative w-full">
              <button
                type="button"
                onClick={() =>
                  !filters?.category_id || !subcat?.subCategories
                    ? null
                    : setSubOpen(!subOpen)
                }
                disabled={!filters?.category_id || !subcat?.subCategories}
                className={`relative w-full border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${
                  !filters?.category_id || !subcat?.subCategories
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                <span className="block truncate">
                  {subcat?.subCategories && String(filters?.sub_category_id)
                    ? subcat.subCategories.find(
                        (s: any) =>
                          String(s.id) === String(filters.sub_category_id),
                      )?.name || "all"
                    : "all"}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400 dark:text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </button>

              {subOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 dark:ring-gray-600 overflow-auto focus:outline-none sm:text-sm">
                  {!filters?.category_id ? (
                    <div className="py-2 pl-3 pr-9 text-gray-500 dark:text-gray-400">
                      Select a category first
                    </div>
                  ) : !subcat?.subCategories ||
                    subcat.subCategories.length === 0 ? (
                    <div className="py-2 pl-3 pr-9 text-gray-500 dark:text-gray-400">
                      No subcategories available
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={() => {
                          handleChange("sub_category_id", "");
                          // setSubOpen(false); // Do not close modal on change
                        }}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white text-gray-900 dark:text-white dark:hover:bg-indigo-500"
                      >
                        <span
                          className={`block truncate ${filters.sub_category_id === "" ? "font-semibold" : ""}`}
                        >
                          all
                        </span>
                      </div>
                      {subcat.subCategories.map((c: any) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            handleChange("sub_category_id", String(c.id));
                            // Ne pas fermer le dropdown ni le modal
                          }}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white text-gray-900 dark:text-white dark:hover:bg-indigo-500"
                        >
                          <span
                            className={`block truncate ${String(filters.sub_category_id) === String(c.id) ? "font-semibold" : ""}`}
                          >
                            {c.name}
                          </span>
                          {String(filters.sub_category_id) === String(c.id) && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 dark:text-indigo-400 hover:text-white">
                              <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div ref={creatorRef} className="relative">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              Creator
            </label>

            {/* Champ de recherche */}
            <input
              type="text"
              placeholder="Search creator..."
              // on affiche uniquement creatorSearch — ainsi si l'utilisateur efface, la valeur n'est pas ré-écrasée par creator_id
              value={localFilters.creatorSearch || ""}
              onChange={(e) => {
                const value = e.target.value;
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

            {/* Liste déroulante filtrée */}
            {creatorOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                {/* Option ALL */}
                <div
                  className="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                  onClick={() => {
                    handleChange("creator_id", "");
                    handleChange("creatorSearch", "");
                    // Ne pas fermer le dropdown ni le modal
                  }}
                >
                  all
                </div>

                {/* Si aucun creator */}
                {(!creators || creators.length === 0) && (
                  <div className="px-3 py-2 text-gray-500">
                    No creators found
                  </div>
                )}

                {/* Résultats filtrés */}
                {creators
                  ?.filter((c) =>
                    c.name
                      .toLowerCase()
                      .includes((localFilters.creatorSearch || "").toLowerCase()),
                  )
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                      onClick={() => {
                        handleChange("creator_id", String(c.id));
                        handleChange("creatorSearch", c.name);
                      }}
                    >
                      {c.avatar && (
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-6 h-6 rounded-full object-cover border border-gray-300"
                          style={{ minWidth: 24, minHeight: 24 }}
                        />
                      )}
                      <span>{c.name}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deleted filter */}
          <div
            className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300"
          >
            <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">
              Deleted
            </p>
            <div className="flex gap-3">
              {["all", "yes", "no"].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="isDeleted"
                    className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                    checked={
                      option === "all"
                        ? localFilters.isDeleted === "all" || localFilters.isDeleted === ""
                        : localFilters.isDeleted === option
                    }
                    onChange={() => handleChange("isDeleted", option)}
                  />
                  <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Checking status filter as select */}
          <div
            className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300"
          >
            <label className="font-medium mb-2 text-gray-700 dark:text-gray-300 block" htmlFor="checking-select">
              Checking
            </label>
            <select
              id="checking-select"
              className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition"
              value={localFilters.checking || "all"}
              onChange={e => handleChange("checking", e.target.value)}
            >
              <option value="all">All</option>
              <option value="checked">Checked</option>
              <option value="refused">Refused</option>
              <option value="waiting for checking">Waiting for checking</option>
              <option value="null">Not ready</option>
            </select>
          </div>
        </div>

        <div
          className="pt-3 flex justify-end gap-3 sm:gap-3 sm:pt-3 sm:static fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t sm:border-t-0 sm:bg-transparent"
        >
          <button type="button" className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300" onClick={closeModal}>
            Close
          </button>

          <div
            className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
            onClick={() => {
              setLocalFilters({
                category_id: "",
                sub_category_id: "",
                creator_id: "",
                creatorSearch: "",
                startDate: "",
                endDate: "",
                uploaded: "all",
                page: "1",
                limit: "10",
                sort: "createdAt",
                order: "DESC",
              });
              localStorage.removeItem("posts_for_app_filtered");
            }}
          >
            Reset
          </div>

          <button
            type="button"
            className="btn btn-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-none transition-colors duration-300"
            onClick={(e) => { e.preventDefault(); submit(); closeModal(); }}
          >
            Apply
          </button>
        </div>
      </div>
    </dialog>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if filters actually changed
  return JSON.stringify(prevProps.filters) === JSON.stringify(nextProps.filters) &&
         prevProps.setFilters === nextProps.setFilters;
});
