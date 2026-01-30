/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, RotateCcw, Check } from "lucide-react";
import { getPostsForApp } from "../../api/postsForApp";
import useCategoryPostForApp from "../../hooks/posts/useCategoryPostForApp";
import useSubCategoryPostForApp from "../../hooks/posts/useSubCategoryPostForApp";
import { useUsers } from "../../hooks/useAuth";
import UseCreators from "../../hooks/useCreators";
import { cdnS3 } from "../../utils/cdn";

export type TPostForAppFilter = {
  category_id: string;
  sub_category_id: string;
  creator_id: number | string;
  user_id?: string;
  isDeleted?: string;
  processing?: string;
  uploaded?: string;
  videoType?: string;
  page: string;
  limit: string;
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
  const { data: users } = useUsers("");
  const { data: creators } = UseCreators({ isAll: true });
  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    filters?.category_id ? [String(filters.category_id)] : []
  );
  const [localFilters, setLocalFilters] = useState(() => ({ ...filters }));
  const {
    data: categoriesResponse,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoryPostForApp();
  // Use localFilters.category_id so subcategories update immediately on category change
  const { data: subcat } = useSubCategoryPostForApp(
    localFilters?.category_id ? Number(localFilters.category_id) : undefined
  );
  useEffect(() => {
    setLocalFilters({ ...filters });
  }, [filters]);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const subCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const creatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) setOpen(false);
      if (subCategoryDropdownRef.current && !subCategoryDropdownRef.current.contains(event.target as Node)) setSubOpen(false);
      if (creatorRef.current && !creatorRef.current.contains(event.target as Node)) setCreatorOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  }, []);

  const submit = useCallback(() => {
    localStorage.setItem("posts_for_app_filtered", JSON.stringify({ ...localFilters }));
    setFilters({ ...localFilters, page: "1" });
  }, [localFilters, setFilters]);

  const closeModal = useCallback(() => {
    const modal = document.getElementById("search_modal_posts_for_app") as HTMLDialogElement | null;
    modal?.close();
  }, []);

  useEffect(() => {
    if (localFilters?.category_id && categoriesResponse?.categories) {
      const found = categoriesResponse.categories.find((c: any) => String(c.id) === String(localFilters.category_id));
      if (found) setSelectedOptions([found.name]);
      else setSelectedOptions([]);
    } else {
      setSelectedOptions([]);
    }
  }, [localFilters?.category_id, categoriesResponse]);

  return (
    <dialog id="search_modal_posts_for_app" className="modal modal-bottom sm:modal-middle">
      <form method="dialog" className="modal-box max-w-3xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl text-gray-800 dark:text-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filtres</h3>
          <button type="button" onClick={closeModal} className="btn btn-sm btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div ref={categoryDropdownRef}>
            <label className="block text-sm font-medium mb-1">Category</label>
            {categoriesError && (
              <div className="text-sm text-rose-400 mb-2">Erreur : {String(categoriesError)}</div>
            )}
            <button
              type="button"
              onClick={() => !categoriesLoading && setOpen(!open)}
              disabled={categoriesLoading}
              className={`relative w-full flex items-center justify-between px-3 py-2 rounded-lg border bg-white/30 dark:bg-white/5 border-black/10 dark:border-white/10 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                categoriesLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="truncate">
                {categoriesLoading ? "Chargement..." : selectedOptions[0] || "all"}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {open && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-lg"
                >
                  <li
                    onClick={() => {
                      handleChange("category_id", "");
                      handleChange("sub_category_id", "");
                      setOpen(false);
                      setSelectedOptions(["all"]);
                    }}
                    className="px-3 py-2 text-sm hover:bg-sky-500/20 cursor-pointer"
                  >
                    all
                  </li>
                  {categoriesResponse?.categories?.map((c: any) => (
                    <li
                      key={c.id}
                      onClick={() => {
                        handleChange("category_id", String(c.id));
                        handleChange("sub_category_id", "");
                        setSelectedOptions([c.name]);
                        setOpen(false);
                      }}
                      className="px-3 py-2 text-sm hover:bg-sky-500/20 cursor-pointer flex items-center justify-between"
                    >
                      {c.name}
                      {selectedOptions[0] === c.name && <Check className="w-4 h-4 text-sky-500" />}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* SubCategory */}
          <div ref={subCategoryDropdownRef}>
            <label className="block text-sm font-medium mb-1">SubCategory</label>
            <button
              type="button"
              onClick={() => (subcat?.subCategories ? setSubOpen(!subOpen) : null)}
              disabled={!subcat?.subCategories}
              className="relative w-full flex items-center justify-between px-3 py-2 rounded-lg border bg-white/30 dark:bg-white/5 border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
            >
              <span className="truncate">
                {subcat?.subCategories?.find((s: any) => String(s.id) === String(localFilters.sub_category_id))?.name || "all"}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${subOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {subOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-lg"
                >
                  <li
                    onClick={() => {
                      handleChange("sub_category_id", "");
                      setSubOpen(false);
                    }}
                    className="px-3 py-2 text-sm hover:bg-sky-500/20 cursor-pointer"
                  >
                    all
                  </li>
                  {subcat?.subCategories?.map((s: any) => (
                    <li
                      key={s.id}
                      onClick={() => {
                        handleChange("sub_category_id", String(s.id));
                        setSubOpen(false);
                      }}
                      className="px-3 py-2 text-sm hover:bg-sky-500/20 cursor-pointer flex items-center justify-between"
                    >
                      {s.name}
                      {String(localFilters.sub_category_id) === String(s.id) && <Check className="w-4 h-4 text-sky-500" />}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Creator Search */}
          <div ref={creatorRef} className="relative">
            <label className="block text-sm font-medium mb-1">Creator</label>
            <input
              type="text"
              placeholder="Search creator..."
              value={localFilters.creatorSearch || ""}
              onChange={(e) => {
                const value = e.target.value;
                handleChange("creatorSearch", value);
                if (!value) handleChange("creator_id", "");
              }}
              onFocus={() => setCreatorOpen(true)}
              className="w-full px-3 py-2 rounded-lg border bg-white/30 dark:bg-white/5 border-black/10 dark:border-white/10 text-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <AnimatePresence>
              {creatorOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-lg"
                >
                  <li
                    onClick={() => {
                      handleChange("creator_id", "");
                      handleChange("creatorSearch", "");
                      setCreatorOpen(false);
                    }}
                    className="px-3 py-2 text-sm hover:bg-sky-500/20 cursor-pointer"
                  >
                    all
                  </li>
                  {creators
                    ?.filter((c) => c.name.toLowerCase().includes((localFilters.creatorSearch || "").toLowerCase()))
                    .map((c) => (
                      <li
                        key={c.id}
                        onClick={() => {
                          handleChange("creator_id", String(c.id));
                          handleChange("creatorSearch", c.name);
                          setCreatorOpen(false);
                        }}
                        className="px-3 py-2 text-sm hover:bg-sky-500/20 cursor-pointer flex items-center gap-2"
                      >
                        {c.avatar && <img src={cdnS3(c.avatar)} alt={c.name} className="w-6 h-6 rounded-full object-cover" />}
                        {c.name}
                      </li>
                    ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Deleted */}
          <div className="p-3 rounded-lg border bg-white/30 dark:bg-white/5 border-black/10 dark:border-white/10">
            <p className="text-sm font-medium mb-2">Deleted</p>
            <div className="flex gap-3">
              {["all", "yes", "no"].map((option) => (
                <label key={option} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isDeleted"
                    className="radio radio-sm accent-sky-400"
                    checked={option === "all" ? localFilters.isDeleted === "all" || !localFilters.isDeleted : localFilters.isDeleted === option}
                    onChange={() => handleChange("isDeleted", option)}
                  />
                  <span className="text-sm capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Checking */}
          <div className="p-3 rounded-lg border bg-white/30 dark:bg-white/5 border-black/10 dark:border-white/10">
            <label className="text-sm font-medium mb-2 block">Checking</label>
            <select
              value={localFilters.checking || "all"}
              onChange={(e) => handleChange("checking", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-white/30 dark:bg-white/5 border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="all">All</option>
              <option value="checked">Checked</option>
              <option value="refused">Refused</option>
              <option value="waiting for checking">Waiting for checking</option>
              <option value="null">Not ready</option>
            </select>
          </div>

          {/* Video Type */}
          <div className="p-3 rounded-lg border bg-white/30 dark:bg-white/5 border-black/10 dark:border-white/10">
            <label className="text-sm font-medium mb-2 block">Video Type</label>
            <select
              value={localFilters.videoType || "all"}
              onChange={(e) => handleChange("videoType", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-white/30 dark:bg-white/5 border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="all">All</option>
              <option value="1">Short</option>
              <option value="2">Long</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={closeModal} className="btn btn-sm btn-ghost">
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              setLocalFilters({
                category_id: "",
                sub_category_id: "",
                creator_id: "",
                creatorSearch: "",
                isDeleted: "",
                uploaded: "all",
                videoType: "all",
                page: "1",
                limit: "10",
              });
              localStorage.removeItem("posts_for_app_filtered");
            }}
            className="btn btn-sm btn-ghost"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              submit();
              closeModal();
            }}
            className="btn btn-sm bg-sky-500 hover:bg-sky-600 text-white border-none"
          >
            Apply
          </button>
        </div>
      </form>
    </dialog>
  );
}, (prev, next) => JSON.stringify(prev.filters) === JSON.stringify(next.filters) && prev.setFilters === next.setFilters);