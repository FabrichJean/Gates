// pages/PostCategoryManager.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, FolderTree, Folder, Tag, Plus, Edit, Trash2, X, Save, ChevronRight } from "lucide-react";
import useCategoryPost from "../hooks/posts/useCategoryPost";
import {
  createPostCategoryApi,
  deletePostCategoryApi,
  createPostSubCategoryApi,
  updatePostCategoryApi,
  updatePostSubCategoryApi,
  deletePostSubCategoryApi
} from "../api/postCategories";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import toast from "react-hot-toast";
import type { Category } from "../components/CategoryAutoComplete";
import Pagination from "../components/Pagination";

interface SubCategory {
  id: number;
  name: string;
  subCategories: number;
  category: Category;
  creator?: string | null;
}

export default function PostCategoryManager() {
  const { data, isLoading, reFetch } = useCategoryPost();
  const categories = data?.categories ?? [];

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<number, SubCategory[]>>({});

  // Load subcategories when a category is expanded
  const loadSubcategories = async (categoryId: number, forceReload = false) => {
    if (subcategoriesMap[categoryId] && !forceReload) return; // Already loaded and not forced

    try {
      const res = await fetch(`${apiURL}/post-sub-categories?category_id=${categoryId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setSubcategoriesMap(prev => ({
        ...prev,
        [categoryId]: data.subCategories || []
      }));
    } catch (error) {
      console.error("加载子分类时出错 :", error);
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

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: "", creator: "" });
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: "",
    category_id: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // Category CRUD
  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error("名称必填");
      return;
    }

    setSubmitting(true);
    try {
      await createPostCategoryApi(categoryForm.name, categoryForm.creator.trim() || undefined);
      toast.success("分类创建成功");
      setShowCategoryModal(false);
      setCategoryForm({ name: "", creator: "" });
      reFetch();
    } catch (error) {
      toast.error("创建时出错");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryForm.name.trim()) {
      toast.error("名称必填");
      return;
    }

    setSubmitting(true);
    try {
      await updatePostCategoryApi(editingCategory.id, categoryForm.name, categoryForm.creator.trim() || undefined);
      toast.success("分类更新成功");
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", creator: "" });
      reFetch();
    } catch (error) {
      toast.error("更新时出错");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const category = categories.find((c) => c.id === id);
    const confirmed = window.confirm(
      `您确定要删除类别 "${category?.name}" 吗？此操作不可逆。`
    );

    if (!confirmed) return;

    try {
      await deletePostCategoryApi(id);
      toast.success("分类删除成功");
      reFetch();
    } catch (error) {
      toast.error("删除时出错");
      console.error(error);
    }
  };

  // CRUD pour les sous-catégories
  const handleCreateSubCategory = async () => {
    if (!subCategoryForm.name.trim()) {
      toast.error("名称必填");
      return;
    }

    setSubmitting(true);
    try {
      await createPostSubCategoryApi({ name: subCategoryForm.name, category_id: subCategoryForm.category_id });
      toast.success("子分类创建成功");
      setShowSubCategoryModal(false);
      setSubCategoryForm({ name: "", category_id: 0 });

      // Recharger les sous-catégories de cette catégorie
      await loadSubcategories(subCategoryForm.category_id, true); // Force reload
    } catch (error) {
      toast.error("创建子分类时出错");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubCategory = async () => {
    if (!editingSubCategory || !subCategoryForm.name.trim()) {
      toast.error("名称必填");
      return;
    }

    setSubmitting(true);
    const categoryId = subCategoryForm.category_id; // Save category ID before resetting form

    try {
      await updatePostSubCategoryApi(editingSubCategory.id, { name: subCategoryForm.name });
      toast.success("子分类更新成功");
      setShowSubCategoryModal(false);
      setEditingSubCategory(null);
      setSubCategoryForm({ name: "", category_id: 0 });

      // Recharger les sous-catégories de cette catégorie
      await loadSubcategories(categoryId, true); // Force reload
    } catch (error) {
      toast.error("更新子分类时出错");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: number, categoryId: number) => {
    const confirmed = window.confirm(
      "您确定要删除此子分类吗？此操作不可逆。"
    );

    if (!confirmed) return;

    try {
      await deletePostSubCategoryApi(subCategoryId);
      toast.success("子分类删除成功");

      // Mettre à jour l'état local
      setSubcategoriesMap(prev => ({
        ...prev,
        [categoryId]: prev[categoryId]?.filter(sub => sub.id !== subCategoryId) || []
      }));
    } catch (error) {
      toast.error("删除子分类时出错");
      console.error(error);
    }
  };

  // UI Handlers
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, creator: "" });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", creator: "" });
    }
    setShowCategoryModal(true);
  };

  const openSubCategoryModal = (categoryId?: number, subCategory?: SubCategory) => {
    if (subCategory) {
      setEditingSubCategory(subCategory);
      setSubCategoryForm({
        name: subCategory.name || "",
        category_id: subCategory.category?.id || (categoryId || 0),
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header compact */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                帖子分类
              </h1>
            </div>
            <button
              onClick={() => openCategoryModal()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              新建
            </button>
          </div>
        </div>

        {/* Search compact */}
        <div className="mb-4">
          <div className="max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="搜索分类..."
              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Categories List compact */}
        <div className="space-y-3">
          <AnimatePresence>
            {paginatedCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ delay: index * 0.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Category Header compact */}
                <div className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <motion.div
                          animate={{ rotate: expandedCategories.has(category.id) ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                        </motion.div>
                      </button>

                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0">
                        <Folder className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {category.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Tag className="w-3 h-3" />
                        <span>{category.subCategoryCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openSubCategoryModal(category.id)}
                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded transition-colors"
                        title="添加子分类"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openCategoryModal(category)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded transition-colors"
                        title="修改"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SubCategories compact */}
                <AnimatePresence>
                  {expandedCategories.has(category.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200 dark:border-gray-600"
                    >
                      <div className="p-3 space-y-2">
                        {(() => {
                          const subcategories = getSubcategoriesForCategory(category.id);
                          return subcategories.length === 0 ? (
                            <div className="text-center py-4">
                              <Tag className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                无子分类
                              </p>
                            </div>
                          ) : (
                            subcategories.map((sub, subIndex) => (
                              <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ delay: subIndex * 0.02 }}
                                className="flex items-center justify-between gap-3 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-md"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center flex-shrink-0">
                                    <Tag className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {sub.name}
                                    </h4>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => openSubCategoryModal(category.id, sub)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded transition-colors"
                                    title="修改"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubCategory(sub.id, category.id)}
                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                                    title="删除"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
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
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <FolderTree className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? '未找到分类' : '无分类'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredCategories.length > itemsPerPage && (
          <div className="mt-4">
            <Pagination
              totalItems={filteredCategories.length}
              pageSize={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Category Modal compact */}
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingCategory ? "修改分类" : "新建分类"}
                </h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="分类名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    创建者 (可选)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.creator}
                    onChange={(e) => setCategoryForm({ ...categoryForm, creator: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="创建者名称"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={submitting}
                >
                  取消
                </button>
                <button
                  onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  disabled={submitting || !categoryForm.name.trim()}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-xs">保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span className="text-xs">{editingCategory ? "更新" : "创建"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* SubCategory Modal compact */}
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingSubCategory
                    ? "修改子分类"
                    : "新建子分类"}
                </h2>
                <button
                  onClick={() => setShowSubCategoryModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    父分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subCategoryForm.category_id}
                    onChange={(e) =>
                      setSubCategoryForm({
                        ...subCategoryForm,
                        category_id: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!!editingSubCategory || isLoading}
                  >
                    <option value={0}>
                      {isLoading ? "加载分类中..." : "选择一个分类"}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                    {/* Option de secours si la catégorie n'est pas dans la liste */}
                    {subCategoryForm.category_id !== 0 && !categories.find(cat => cat.id === subCategoryForm.category_id) && (
                      <option value={subCategoryForm.category_id}>
                        分类 #{subCategoryForm.category_id} (未找到)
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subCategoryForm.name}
                    onChange={(e) =>
                      setSubCategoryForm({ ...subCategoryForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="子分类名称"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setShowSubCategoryModal(false)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={submitting}
                >
                  取消
                </button>
                <button
                  onClick={editingSubCategory ? handleUpdateSubCategory : handleCreateSubCategory}
                  disabled={
                    submitting ||
                    isLoading ||
                    !subCategoryForm.name.trim() ||
                    (!editingSubCategory && !subCategoryForm.category_id)
                  }
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-xs">保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span className="text-xs">{editingSubCategory ? "更新" : "创建"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}