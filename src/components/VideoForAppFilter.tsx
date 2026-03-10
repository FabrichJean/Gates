import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import UseCreators from "../hooks/useCreators";
import CreatorAutoComplete from "./CreatorAutoComplete";
import UseCategory from "../hooks/useCategory";
import { UseSubCategoryReactive } from "../hooks/useSubCategory";
import type { Category } from "../components/CategoryAutoComplete";
import {
  buildVideoForAppListParams,
  finalizeDurationHhMmSsInput,
} from "../utils/videoForAppFilters";

export type TAppFilter = {
  creator_id: string;
  creatorSearch?: string;
  category_id?: string;
  categorySearch?: string;
  subcategory_id?: string;
  subcategorySearch?: string;
  tag?: string;
  tagSearch?: string;
  type?: string;
  durationMin?: string;
  durationMax?: string;
};

export default function VideoForAppFilter({
  onSubmit,
  params,
  filters,
  setFilters,
  setPage,
  scope = "videoForApp",
}: {
  params: any;
  filters: any;
  setFilters: any;
  onSubmit: (d: any) => void;
  setPage?: (p: number) => void;
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

  // creator dropdown state removed; using CreatorAutoComplete instead
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
        const normalizedSavedFilters = {
          ...parsedFilters,
          durationMin: finalizeDurationHhMmSsInput(parsedFilters.durationMin || ""),
          durationMax: finalizeDurationHhMmSsInput(parsedFilters.durationMax || ""),
        };
        // Fusionner avec les filtres actuels pour éviter d'écraser les valeurs par défaut
        setFilters((prev: any) => ({ ...prev, ...normalizedSavedFilters }));
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
        tag: filters.tag,
        tagSearch: filters.tagSearch,
        isDeleted: filters.isDeleted,
        checking: filters.checking,
        type: filters.type,
        durationMin: filters.durationMin,
        durationMax: filters.durationMax,
      };
      localStorage.setItem(storageKey, JSON.stringify(filtersToSave));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des filtres dans localStorage:", error);
    }
  }, [filters, storageKey]);

  // fermer dropdown creator au clic hors zone
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
    setFilters((prev: any) => {
      // avoid creating a new object / triggering updates when value is unchanged
      if (prev && Object.prototype.hasOwnProperty.call(prev, key)) {
        // treat undefined/null/empty string as comparable
        const prevVal = prev[key];
        if (prevVal === value) return prev;
      }
      return { ...prev, [key]: value };
    });
  };

  const normalizeDurationTimeValue = (value: string) => {
    if (!value) {
      return "";
    }

    if (/^\d{2}:\d{2}$/.test(value)) {
      return `${value}:00`;
    }

    return value;
  };

  const handleDurationChange = (key: "durationMin" | "durationMax", value: string) => {
    setHasInteracted(true);
    handleChange(key, normalizeDurationTimeValue(value));
  };

  const handleDurationBlur = (key: "durationMin" | "durationMax") => {
    handleChange(key, finalizeDurationHhMmSsInput(filters[key] || ""));
  };

  // Soumission des filtres
  const submit = async () => {
    const { params: finalQuery, error } = buildVideoForAppListParams({
      filters,
      baseParams: params || {},
      page: "1",
      strictDuration: true,
    });

    if (error === "duration_min_format") {
      toast.error("La durée minimale doit être au format hh:mm:ss.");
      return;
    }

    if (error === "duration_max_format") {
      toast.error("La durée maximale doit être au format hh:mm:ss.");
      return;
    }

    if (error === "duration_range") {
      toast.error("La durée minimale doit être inférieure ou égale à la durée maximale.");
      return;
    }

    try {
      const { fetchVideoForAppList } = await import("../api/videoForApp");
      const fetched = await fetchVideoForAppList(finalQuery);
      // reset parent page and pass the full response so parent can update pagination/total
      setPage?.(1);
      onSubmit(fetched);
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
            <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">已删除</p>
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
            <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">审核状态</p>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: 'all', label: '全部' },
                { value: 'null', label: '未就绪' },
                { value: 'waiting for checking', label: '待审核' },
                { value: 'refused', label: '已拒绝' },
                { value: 'checked', label: '已审核' },
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
          {/* Video Type filter */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300">
            <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">类型</p>
            <div className="flex gap-3">
              {[
                { value: '', label: '全部' },
                { value: '1', label: '短片' },
                { value: '2', label: '长片' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                    checked={
                      option.value === ''
                        ? (filters.type === '' || !filters.type)
                        : filters.type === option.value
                    }
                    onChange={() => handleChange('type', option.value)}
                  />
                  <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          {/* <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300">
            <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">时长范围</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">最短时长</label>
                <input
                  type="time"
                  step="1"
                  value={filters.durationMin || ""}
                  onChange={(e) => handleDurationChange("durationMin", e.target.value)}
                  onBlur={() => handleDurationBlur("durationMin")}
                  className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">最长时长</label>
                <input
                  type="time"
                  step="1"
                  value={filters.durationMax || ""}
                  onChange={(e) => handleDurationChange("durationMax", e.target.value)}
                  onBlur={() => handleDurationBlur("durationMax")}
                  className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">格式为 hh:mm:ss，提交时会自动转换为毫秒。</p>
          </div> */}
        </div>


        <div className="flex flex-col gap-6">
          {/* Creator searchable (replaced with CreatorAutoComplete) */}
          <div ref={creatorRef} className="relative">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">创造者</label>
            <CreatorAutoComplete
              value={filters.creatorSearch || null}
              onChange={(v) => {
                setHasInteracted(true);
                if (!v) {
                  handleChange("creatorSearch", "");
                  handleChange("creator_id", "");
                } else {
                  handleChange("creatorSearch", v);
                }
              }}
              onSelect={(c) => {
                if (c) {
                  handleChange("creator_id", String(c.id));
                  handleChange("creatorSearch", c.name);
                } else {
                  handleChange("creator_id", "");
                  handleChange("creatorSearch", "");
                }
              }}
              placeholder="搜索创建者..."
              autoSuggest={false}
            />
          </div>

          {/* Category searchable */}
          <div ref={categoryRef} className="relative">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">分类</label>
            <input
              type="text"
              placeholder="搜索分类..."
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
                  <div className="px-3 py-2 text-gray-500">未找到分类</div>
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
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">子分类</label>
            <input
              type="text"
              placeholder="搜索子分类..."
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
                  <div className="px-3 py-2 text-gray-500">未找到子分类</div>
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

          {/* Tag searchable */}
          <div className="relative">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Tag <span className="font-medium text-sm">(by name)</span></label>
            <input
              type="text"
              placeholder="搜索标签..."
              value={filters.tagSearch || ""}
              onChange={(e) => {
                const value = e.target.value;
                setHasInteracted(true);
                if (value === "") {
                  handleChange("tagSearch", "");
                  handleChange("tag", "");
                } else {
                  handleChange("tagSearch", value);
                }
              }}
              className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition"
            />
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300">
            <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">时长范围</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">最短时长</label>
                <input
                  type="time"
                  step="1"
                  value={filters.durationMin || ""}
                  onChange={(e) => handleDurationChange("durationMin", e.target.value)}
                  onBlur={() => handleDurationBlur("durationMin")}
                  className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">最长时长</label>
                <input
                  type="time"
                  step="1"
                  value={filters.durationMax || ""}
                  onChange={(e) => handleDurationChange("durationMax", e.target.value)}
                  onBlur={() => handleDurationBlur("durationMax")}
                  className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">格式为 hh:mm:ss，提交时会自动转换为毫秒。</p>
          </div>
        </div>

        <form method="dialog" className="pt-3 flex justify-end gap-3">
          <button className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">关闭</button>
          <div
            className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
            onClick={async () => {
              setFilters({
                creator_id: "",
                creatorSearch: "",
                isDeleted: "all",
                checking: "all",
                type: "",
                category_id: "",
                categorySearch: "",
                subcategory_id: "",
                subcategorySearch: "",
                tag: "",
                tagSearch: "",
                durationMin: "",
                durationMax: "",
              });
              setHasInteracted(false);
              setCategoryOpen(false);
              setSubcategoryOpen(false);
              // reset pagination to page 1 when filters are reset
              setPage?.(1);
              await submit();
            }}
          >
            重置
          </div>
          <button
            className="btn btn-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-none transition-colors duration-300"
            onClick={(e) => {
              e.preventDefault();
              submit();
              closeModal();
            }}
          >
            应用
          </button>
        </form>
      </div>
    </dialog>
  );
}
