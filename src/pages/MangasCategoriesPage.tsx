import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  FolderTree,
  Tag,
  Search,
  X,
  Save,
  Loader2,
  ChevronRight,
  FolderOpen,
  Folder,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getMangasCategoriesApi,
  createMangasCategoryApi,
  updateMangasCategoryApi,
  deleteMangasCategoryApi,
} from "../api/mangasCategory";
import {
  getMangasSubCategoriesApi,
  createMangasSubCategoryApi,
  updateMangasSubCategoryApi,
  deleteMangasSubCategoryApi,
} from "../api/mangasSubCategory";

interface MangaCategory {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  subCategories?: MangaSubCategory[];
}

interface MangaSubCategory {
  id: number;
  name: string;
  description?: string;
  mangas_category_id: number;
  createdAt?: string;
  updatedAt?: string;
}

const MangasCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<MangaCategory[]>([]);
  const [subCategories, setSubCategories] = useState<MangaSubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MangaCategory | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<MangaSubCategory | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: "",
    description: "",
    mangas_category_id: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, subCategoriesRes] = await Promise.all([
        getMangasCategoriesApi(),
        getMangasSubCategoriesApi(),
      ]);

      const cats = categoriesRes.data || categoriesRes;
      const subs = subCategoriesRes.data || subCategoriesRes;

      // Group subcategories by category
      const catsWithSubs = cats.map((cat: MangaCategory) => ({
        ...cat,
        subCategories: subs.filter((sub: MangaSubCategory) => sub.mangas_category_id === cat.id),
      }));

      setCategories(catsWithSubs);
      setSubCategories(subs);
    } catch (error) {
      toast.error("加载数据时出错");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Category CRUD
  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error("名称必填");
      return;
    }

    setSubmitting(true);
    try {
      await createMangasCategoryApi(categoryForm);
      toast.success("分类创建成功");
      setShowCategoryModal(false);
      setCategoryForm({ name: "", description: "" });
      fetchData();
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
      await updateMangasCategoryApi(editingCategory.id, categoryForm);
      toast.success("分类更新成功");
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
      fetchData();
    } catch (error) {
      toast.error("更新时出错");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("您确定要删除此分类吗？")) return;

    try {
      await deleteMangasCategoryApi(id);
      toast.success("分类删除成功");
      fetchData();
    } catch (error) {
      toast.error("删除时出错");
      console.error(error);
    }
  };

  // SubCategory CRUD
  const handleCreateSubCategory = async () => {
    if (!subCategoryForm.name.trim() || !subCategoryForm.mangas_category_id) {
      toast.error("名称和分类必填");
      return;
    }

    setSubmitting(true);
    try {
      await createMangasSubCategoryApi(subCategoryForm);
      toast.success("子分类创建成功");
      setShowSubCategoryModal(false);
      setSubCategoryForm({ name: "", description: "", mangas_category_id: 0 });
      fetchData();
    } catch (error) {
      toast.error("创建时出错");
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
    try {
      await updateMangasSubCategoryApi(editingSubCategory.id, subCategoryForm);
      toast.success("子分类更新成功");
      setShowSubCategoryModal(false);
      setEditingSubCategory(null);
      setSubCategoryForm({ name: "", description: "", mangas_category_id: 0 });
      fetchData();
    } catch (error) {
      toast.error("更新时出错");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubCategory = async (id: number) => {
    if (!confirm("您确定要删除此子分类吗？")) return;

    try {
      await deleteMangasSubCategoryApi(id);
      toast.success("子分类删除成功");
      fetchData();
    } catch (error) {
      toast.error("删除时出错");
      console.error(error);
    }
  };

  // UI Handlers
  const openCategoryModal = (category?: MangaCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, description: category.description || "" });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
    }
    setShowCategoryModal(true);
  };

  const openSubCategoryModal = (categoryId?: number, subCategory?: MangaSubCategory) => {
    if (subCategory) {
      setEditingSubCategory(subCategory);
      setSubCategoryForm({
        name: subCategory.name,
        description: subCategory.description || "",
        mangas_category_id: subCategory.mangas_category_id,
      });
    } else {
      setEditingSubCategory(null);
      setSubCategoryForm({
        name: "",
        description: "",
        mangas_category_id: categoryId || 0,
      });
    }
    setShowSubCategoryModal(true);
  };

  const toggleCategory = (id: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  // Filtered categories
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.subCategories?.some(
        (sub) =>
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

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
                漫画分类
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
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索..."
                className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Categories List compact */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredCategories.map((category, index) => (
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
                        {category.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Tag className="w-3 h-3" />
                        <span>{category.subCategories?.length || 0}</span>
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
                  {expandedCategories.has(category.id) && category.subCategories && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200 dark:border-gray-600"
                    >
                      <div className="p-3 space-y-2">
                        {category.subCategories.map((subCategory, subIndex) => (
                          <motion.div
                            key={subCategory.id}
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
                                  {subCategory.name}
                                </h4>
                                {subCategory.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {subCategory.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => openSubCategoryModal(category.id, subCategory)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded transition-colors"
                                title="修改"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubCategory(subCategory.id)}
                                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                                title="删除"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </motion.div>
                        ))}

                        {(!category.subCategories || category.subCategories.length === 0) && (
                          <div className="text-center py-4">
                            <Tag className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              无子分类
                            </p>
                          </div>
                        )}
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
                  {editingCategory ? "修改分类" : "新建分类"}
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
                    名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="分类名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    描述
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="分类描述"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={submitting}
                >
                  取消
                </button>
                <button
                  onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  disabled={submitting || !categoryForm.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingCategory ? "更新" : "创建"}
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
                    ? "修改子分类"
                    : "新建子分类"}
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
                    父分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subCategoryForm.mangas_category_id}
                    onChange={(e) =>
                      setSubCategoryForm({
                        ...subCategoryForm,
                        mangas_category_id: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!!editingSubCategory}
                  >
                    <option value={0}>选择一个分类</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
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
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="子分类名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    描述
                  </label>
                  <textarea
                    value={subCategoryForm.description}
                    onChange={(e) =>
                      setSubCategoryForm({ ...subCategoryForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="子分类描述"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={() => setShowSubCategoryModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={submitting}
                >
                  取消
                </button>
                <button
                  onClick={
                    editingSubCategory ? handleUpdateSubCategory : handleCreateSubCategory
                  }
                  disabled={
                    submitting ||
                    !subCategoryForm.name.trim() ||
                    !subCategoryForm.mangas_category_id
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingSubCategory ? "更新" : "创建"}
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
};

export default MangasCategoriesPage;
