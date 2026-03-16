// pages/CategoryManager.tsx
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, FolderTree, Folder, Tag, Plus, Edit, Trash2, X, Save, ChevronRight } from "lucide-react";
import useCategory from "../hooks/useCategory";
import { createCastegoryApi, deleteCategoryApi, createSubCategoryApi, updateSubCategoryApi, deleteSubCategoryApi, updateCategoryApi, restoreCategoryApi, restoreSubCategoryApi } from "../api/categories";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import toast from "react-hot-toast";
import AnimatedAlert from "../components/AnimatedAlert";
import type { Category } from "../components/CategoryAutoComplete";
import Pagination from "../components/Pagination";
import { FaRegEye } from "react-icons/fa";
import { CiBookmarkCheck } from "react-icons/ci";
import { useI18n } from "../i18n";

interface SubCategory {
  id: number;
  name: string;
  categoryId: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function CategoryManager() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleted, setShowDeleted] = useState<{ type: 'cat' | 'sub', id: any } | null>(null);
  const { data: categories = [], loading: categoriesLoading, reFetch } = useCategory(showDeleted?.type === 'cat');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const { t } = useI18n();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<number, SubCategory[]>>({});

  // Load subcategories when a category is expanded
  const loadSubcategories = async (categoryId: number, forceReload = false) => {
    if (subcategoriesMap[categoryId] && !forceReload) return; // Already loaded and not forced

    try {
      const url = `${apiURL}/sub-categories?category_id=${categoryId}&isDeleted=${(showDeleted?.type === 'sub' && showDeleted.id === categoryId) ? true : false}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setSubcategoriesMap(prev => ({
        ...prev,
        [categoryId]: data.SubCategorys || []
      }));
    } catch (error) {
      console.error("Erreur lors du chargement des sous-catégories :", error);
      setSubcategoriesMap(prev => ({
        ...prev,
        [categoryId]: []
      }));
    }
  };

  const toggleCategory = (id: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      loadSubcategories(id); // Load subcategories when expanding
    }
    setExpandedCategories(newExpanded);
  };

  const getSubcategoriesForCategory = (categoryId: number) => {
    return subcategoriesMap[categoryId] || [];
  };

  useEffect(() => {
    // when showDeleted changes: refetch categories and clear/reload subcategories
    if (typeof reFetch === "function") reFetch();
    setSubcategoriesMap({});
    // reload subcategories for expanded categories
    expandedCategories.forEach((id) => {
      loadSubcategories(id, true);
    });
  }, [showDeleted]);

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // AnimatedAlert state for delete confirmation (handles category or subcategory)
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    type?: "cat" | "sub";
    id: number | null;
    name?: string;
    parentId?: number | null;
  }>({ isOpen: false, type: "cat", id: null, name: "", parentId: null });

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: "",
    category_id: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // Category CRUD
  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error(t("category_manager.toast.name_required", "名称必填"));
      return;
    }

    setSubmitting(true);
    try {
      await createCastegoryApi(categoryForm.name);
      toast.success(t("category_manager.toast.category_created", "分类创建成功"));
      setShowCategoryModal(false);
      setCategoryForm({ name: "" });
      reFetch();
    } catch (error) {
      toast.error(t("category_manager.toast.category_create_error", "创建时出错"));
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryForm.name.trim()) {
      toast.error(t("category_manager.toast.name_required", "名称必填"));
      return;
    }

    setSubmitting(true);
    try {
      // Note: Assuming update API exists, if not we'll need to add it
      await updateCategoryApi(editingCategory.id, categoryForm.name); // This should be update API
      toast.success(t("category_manager.toast.category_updated", "分类更新成功"));
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: "" });
      reFetch();
    } catch (error) {
      toast.error(t("category_manager.toast.category_update_error", "更新时出错"));
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const category = categories.find((c) => c.id === id);
    setDeleteAlert({ isOpen: true, type: "cat", id, name: category?.name || "", parentId: null });
  };

  const handleDeleteSubCategory = async (subCategoryId: number, categoryId: number, name?: string) => {
    setDeleteAlert({ isOpen: true, type: "sub", id: subCategoryId, name: name || "", parentId: categoryId });
  };

  // Restore confirmation state (handles category or subcategory)
  const [restoreAlert, setRestoreAlert] = useState<{
    isOpen: boolean;
    type?: "cat" | "sub";
    id: number | null;
    name?: string;
    parentId?: number | null;
  }>({ isOpen: false, type: "cat", id: null, name: "", parentId: null });

  const confirmDelete = async () => {
    if (!deleteAlert.id) return;
    const id = deleteAlert.id;
    const type = deleteAlert.type;
    const parentId = deleteAlert.parentId;
    setDeleteAlert({ isOpen: false, type: "cat", id: null, name: "", parentId: null });

    try {
      if (type === "sub") {
        await deleteSubCategoryApi(id);
        toast.success(t("category_manager.toast.subcategory_deleted", "子分类删除成功"));
        // update local subcategories map
        if (parentId != null) {
          setSubcategoriesMap(prev => ({
            ...prev,
            [parentId]: prev[parentId]?.filter(sub => sub.id !== id) || []
          }));
        }
      } else {
        await deleteCategoryApi(id);
        toast.success(t("category_manager.toast.category_deleted", "分类删除成功"));
        if (typeof reFetch === "function") reFetch();
      }
    } catch (error) {
      toast.error(t("category_manager.toast.delete_error", "删除时出错"));
      console.error(error);
    }
  };

  const handleRestoreCategory = async (id: number) => {
    const category = categories.find((c) => c.id === id);
    setRestoreAlert({ isOpen: true, type: "cat", id, name: category?.name || "", parentId: null });
  };

  const handleRestoreSubCategory = async (subCategoryId: number, categoryId: number, name?: string) => {
    setRestoreAlert({ isOpen: true, type: "sub", id: subCategoryId, name: name || "", parentId: categoryId });
  };

  const confirmRestore = async () => {
    if (!restoreAlert.id) return;
    const id = restoreAlert.id;
    const type = restoreAlert.type;
    const parentId = restoreAlert.parentId;
    setRestoreAlert({ isOpen: false, type: "cat", id: null, name: "", parentId: null });
    try {
      if (type === "sub") {
        await restoreSubCategoryApi(id);
        toast.success(t("category_manager.toast.subcategory_restored", "子分类已恢复"));
        if (parentId != null) {
          await loadSubcategories(parentId, true);
        }
      } else {
        await restoreCategoryApi(id);
        toast.success(t("category_manager.toast.category_restored", "分类已恢复"));
        if (typeof reFetch === "function") reFetch();
      }
    } catch (error) {
      toast.error(t("category_manager.toast.restore_error", "恢复分类时出错"));
      console.error(error);
    }
  };

  // CRUD pour les sous-catégories
  const handleCreateSubCategory = async () => {
    if (!subCategoryForm.name.trim()) {
      toast.error(t("category_manager.toast.name_required", "名称必填"));
      return;
    }

    setSubmitting(true);
    try {
      await createSubCategoryApi({ name: subCategoryForm.name, category_id: subCategoryForm.category_id });
      toast.success(t("category_manager.toast.subcategory_created", "子分类创建成功"));
      setShowSubCategoryModal(false);
      setSubCategoryForm({ name: "", category_id: 0 });

      // Recharger les sous-catégories de cette catégorie
      await loadSubcategories(subCategoryForm.category_id, true); // Force reload
    } catch (error) {
      toast.error(t("category_manager.toast.subcategory_create_error", "创建子分类时出错"));
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubCategory = async () => {
    if (!editingSubCategory || !subCategoryForm.name.trim()) {
      toast.error(t("category_manager.toast.name_required", "名称必填"));
      return;
    }

    setSubmitting(true);
    const categoryId = subCategoryForm.category_id; // Save category ID before resetting form

    try {
      await updateSubCategoryApi(editingSubCategory.id, { name: subCategoryForm.name });
      toast.success(t("category_manager.toast.subcategory_updated", "子分类更新成功"));
      setShowSubCategoryModal(false);
      setEditingSubCategory(null);
      setSubCategoryForm({ name: "", category_id: 0 });

      // Recharger les sous-catégories de cette catégorie
      await loadSubcategories(categoryId, true); // Force reload
    } catch (error) {
      toast.error(t("category_manager.toast.subcategory_update_error", "更新子分类时出错"));
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };





  // UI Handlers
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "" });
    }
    setShowCategoryModal(true);
  };

  const openSubCategoryModal = (categoryId?: number, subCategory?: SubCategory) => {
    if (subCategory) {
      setEditingSubCategory(subCategory);
      setSubCategoryForm({
        name: subCategory.name || "",
        category_id: subCategory.categoryId ? Number(subCategory.categoryId) : (categoryId || 0),
      });
    } else {
      setEditingSubCategory(null);
      setSubCategoryForm({
        name: "",
        category_id: categoryId || 0,
      });
    }
    setShowSubCategoryModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Filtered and paginated categories
  const filteredCategories = useMemo(() => {
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const restoreTypeLabel = restoreAlert.type === "sub"
    ? t("category_manager.subcategory.label", "子分类")
    : t("category_manager.category.label", "类别");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t("common.loading", "加载中...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <FolderTree className="w-8 h-8 text-blue-600" />
                {t("category_manager.title", "视频分类")}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t("category_manager.subtitle", "管理分类和子分类")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openCategoryModal()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                {t("category_manager.action.new_category", "新建分类")}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className=""
          >
            <div className="max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t("category_manager.search.placeholder", "搜索分类...")}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </motion.div>


          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => setShowDeleted(prev => prev?.type === 'cat' ? null : { type: 'cat', id: null })}
            className="px-4 py-2 cursor-pointer gap-3 flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none"
          >
            <FaRegEye className="w-4 h-4 inline-block" /> {showDeleted?.type === 'cat'
              ? t("category_manager.toggle.show_available", "Show available")
              : t("category_manager.toggle.show_deleted", "Show all deleted")}
          </motion.button>

        </div>

        {/* Categories List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <AnimatePresence>
            {paginatedCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 ${category.isDeleted ? "cursor-not-allowed border-red-200 dark:border-red-800" : "dark:border-gray-700 "} dark:border-gray-700 overflow-hidden`}
              >
                {/* Category Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {!category.isDeleted && (
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <motion.div
                            animate={{ rotate: expandedCategories.has(category.id) ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </motion.div>
                        </button>
                      )}

                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Folder className={`w-5 h-5 ${category.isDeleted ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold ${category.isDeleted ? "text-red-600 dark:text-red-400/60" : "text-gray-900 dark:text-gray-100"} truncate`}>
                          {category.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Tag className="w-3.5 h-3.5" />
                        <span>
                          {t("category_manager.subcategory.count", "{count} 个子分类")
                            .replace("{count}", String(category.subCategoryCount))}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">

                      {!category.isDeleted && (
                        <button
                          onClick={() => openSubCategoryModal(category.id)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                          title={t("category_manager.action.add_subcategory", "添加子分类")}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}

                      {!category.isDeleted && (
                        <button
                          onClick={() => openCategoryModal(category)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg transition-colors"
                          title={t("category_manager.action.edit", "修改")}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {!category.isDeleted && (
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                          title={t("category_manager.action.delete", "删除")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {category.isDeleted && (
                        <button
                          onClick={() => handleRestoreCategory(category.id)}
                          className="cursor-pointer flex items-center gap-1 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                          title={t("category_manager.action.restore", "恢复")}
                        >
                          <CiBookmarkCheck className="w-5 h-5" /> {t("category_manager.action.restore", "恢复")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* SubCategories */}
                <AnimatePresence>
                  {expandedCategories.has(category.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                    >
                      <div className="flex items-center gap-2 justify-end px-4 py-2">
                        <span className="font-light text-sm">
                          {t("category_manager.subcategory.section_label", "Sub category")} {"-->"}
                        </span>
                        <button
                          onClick={() => setShowDeleted(prev => prev?.type === 'sub' ? null : { type: 'sub', id: category.id })}
                          className="font-light text-sm px-4 py-1 cursor-pointer gap-3 flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none"
                        >
                          <FaRegEye className="w-4 h-4 inline-block" /> {(showDeleted?.type === 'sub' && showDeleted.id === category.id)
                            ? t("category_manager.toggle.show_available", "Show available")
                            : t("category_manager.toggle.show_deleted", "Show all deleted")}
                        </button>
                      </div>
                      <div className="p-4 space-y-2">
                        {(() => {
                          const subcategories = getSubcategoriesForCategory(category.id);
                          return subcategories.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                              {t("category_manager.subcategory.empty", "无子分类")}
                            </p>
                          ) : (
                            subcategories.map((sub) => (
                              <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border ${sub.isDeleted ? 'border-red-800' : 'border-gray-200 dark:border-gray-700'}`}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Tag className={`w-4 h-4 ${sub.isDeleted ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'} `} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                      <span className="text-xs">{sub.id}</span> - {sub.name}
                                    </h4>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {!sub.isDeleted && (
                                    <button
                                      onClick={() => openSubCategoryModal(category.id, sub)}
                                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded transition-colors"
                                      title={t("category_manager.action.edit", "修改")}
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {!sub.isDeleted && (
                                    <button
                                      onClick={() => handleDeleteSubCategory(sub.id, category.id, sub.name)}
                                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                                      title={t("category_manager.action.delete", "删除")}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {sub.isDeleted && (
                                    <button
                                      onClick={() => handleRestoreSubCategory(sub.id, category.id, sub.name)}
                                      className="cursor-pointer flex items-center gap-1 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                                      title={t("category_manager.action.restore", "恢复")}
                                    >
                                      <CiBookmarkCheck className="w-5 h-5" /> <span className="font-light text-sm">{t("category_manager.action.restore", "恢复")}</span>
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            ))
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm
                  ? t("category_manager.empty.search", "未找到结果")
                  : t("category_manager.empty.default", "无分类")}
              </p>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {filteredCategories.length > itemsPerPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Pagination
              totalItems={filteredCategories.length}
              pageSize={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </motion.div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowCategoryModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {editingCategory
                    ? t("category_manager.modal.category.edit_title", "修改分类")
                    : t("category_manager.modal.category.create_title", "新建分类")}
                </h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("category_manager.field.name", "名称")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("category_manager.placeholder.category_name", "分类名称")}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={submitting}
                >
                  {t("common.cancel", "取消")}
                </button>
                {/* {JSON.stringify(editingCategory)} */}
                <button
                  onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  disabled={submitting || !categoryForm.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("category_manager.action.saving", "保存中...")}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingCategory
                        ? t("common.update", "更新")
                        : t("category_manager.action.create", "创建")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* SubCategory Modal */}
      {showSubCategoryModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSubCategoryModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {editingSubCategory
                    ? t("category_manager.modal.subcategory.edit_title", "修改子分类")
                    : t("category_manager.modal.subcategory.create_title", "新建子分类")}
                </h2>
                <button
                  onClick={() => setShowSubCategoryModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("category_manager.field.parent_category", "父分类")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subCategoryForm.category_id}
                    onChange={(e) =>
                      setSubCategoryForm({
                        ...subCategoryForm,
                        category_id: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!!editingSubCategory || categoriesLoading}
                  >
                    <option value={0}>
                      {categoriesLoading
                        ? t("category_manager.select.loading_categories", "加载分类中...")
                        : t("category_manager.select.choose_category", "选择一个分类")}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                    {/* Option de secours si la catégorie n'est pas dans la liste */}
                    {subCategoryForm.category_id !== 0 && !categories.find(cat => cat.id === subCategoryForm.category_id) && (
                      <option value={subCategoryForm.category_id}>
                        {t("category_manager.select.category_not_found", "分类 #{id} (未找到)")
                          .replace("{id}", String(subCategoryForm.category_id))}
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("category_manager.field.name", "名称")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subCategoryForm.name}
                    onChange={(e) =>
                      setSubCategoryForm({ ...subCategoryForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("category_manager.placeholder.subcategory_name", "子分类名称")}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={() => setShowSubCategoryModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={submitting}
                >
                  {t("common.cancel", "取消")}
                </button>
                <button
                  onClick={editingSubCategory ? handleUpdateSubCategory : handleCreateSubCategory}
                  disabled={
                    submitting ||
                    categoriesLoading ||
                    !subCategoryForm.name.trim() ||
                    (!editingSubCategory && !subCategoryForm.category_id)
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("category_manager.action.saving", "保存中...")}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingSubCategory
                        ? t("common.update", "更新")
                        : t("category_manager.action.create", "创建")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Animated delete confirmation */}
      <AnimatedAlert
        isOpen={deleteAlert.isOpen}
        onClose={() => setDeleteAlert({ isOpen: false, type: "cat", id: null, name: "", parentId: null })}
        title={t("category_manager.alert.delete_title", "确认删除")}
        message={t("category_manager.alert.delete_message", "您确定要删除 \"{name}\" 吗？此操作不可逆。")
          .replace("{name}", deleteAlert.name || "")}
        type="warning"
        onConfirm={confirmDelete}
        confirmText={t("category_manager.action.delete", "删除")}
        cancelText={t("common.cancel", "取消")}
      />

      {/* Animated restore confirmation */}
      <AnimatedAlert
        isOpen={restoreAlert.isOpen}
        onClose={() => setRestoreAlert({ isOpen: false, type: "cat", id: null, name: "", parentId: null })}
        title={t("category_manager.alert.restore_title", "确认恢复")}
        message={t("category_manager.alert.restore_message", "您确定要恢复 {type} \"{name}\" 吗？")
          .replace("{type}", restoreTypeLabel)
          .replace("{name}", restoreAlert.name || "")}
        type="success"
        onConfirm={confirmRestore}
        confirmText={t("category_manager.action.restore", "恢复")}
        cancelText={t("common.cancel", "取消")}
      />
    </div>
  );
}