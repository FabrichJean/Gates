import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Music, FolderTree, Folder, Tag, Plus, Edit, Trash2, X, Save, ChevronRight } from "lucide-react";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import {
  getAudioCategoriesApi,
  createAudioCategoryApi,
  deleteAudioCategoryApi,
  updateAudioCategoryApi,
} from "../api/audioCategory";
import {
  getAudioSubCategoriesApi,
  createAudioSubCategoryApi,
  deleteAudioSubCategoryApi,
  updateAudioSubCategoryApi,
} from "../api/audioSubCategory";

interface SubCategory {
  id: number;
  name: string;
  audio_category_id?: number;
}

export default function AudioCategory() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // expanded categories + subcategories cache
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<number, SubCategory[]>>({});

  // modals & forms
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);

  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [subCategoryForm, setSubCategoryForm] = useState({ name: "", audio_category_id: 0 });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getAudioCategoriesApi();
      setCategories(res?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des catégories audio");
    } finally {
      setLoading(false);
    }
  };

  // Load subcategories for a specific category (cached)
  const loadSubcategories = async (categoryId: number, forceReload = false) => {
    if (subcategoriesMap[categoryId] && !forceReload) return;
    try {
      const res = await getAudioSubCategoriesApi(categoryId);
      setSubcategoriesMap((prev) => ({ ...prev, [categoryId]: res?.data || [] }));
    } catch (err) {
      console.error(err);
      setSubcategoriesMap((prev) => ({ ...prev, [categoryId]: [] }));
    }
  };

  // initial load
  useMemo(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [categories, searchTerm]);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, currentPage]);

  const toggleCategory = (id: number) => {
    const next = new Set(expandedCategories);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      loadSubcategories(id);
    }
    setExpandedCategories(next);
  };

  // Category CRUD
  const openCategoryModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "" });
    }
    setShowCategoryModal(true);
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSubmitting(true);
    try {
      await createAudioCategoryApi({ name: categoryForm.name });
      toast.success("Catégorie audio créée");
      setShowCategoryModal(false);
      setCategoryForm({ name: "" });
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryForm.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSubmitting(true);
    try {
      await updateAudioCategoryApi(editingCategory.id, { name: categoryForm.name });
      toast.success("Catégorie mise à jour");
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: "" });
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const category = categories.find((c) => c.id === id);
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la catégorie "${category?.name}" ? Cette action est irréversible.`
    );
    if (!confirmed) return;
    try {
      await deleteAudioCategoryApi(id);
      toast.success("Catégorie supprimée");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Subcategory CRUD
  const openSubCategoryModal = (categoryId?: number, subCategory?: SubCategory) => {
    if (subCategory) {
      setEditingSubCategory(subCategory);
      setSubCategoryForm({ name: subCategory.name || "", audio_category_id: subCategory.audio_category_id || 0 });
    } else {
      setEditingSubCategory(null);
      setSubCategoryForm({ name: "", audio_category_id: categoryId || 0 });
    }
    setShowSubCategoryModal(true);
  };

  const handleCreateSubCategory = async () => {
    if (!subCategoryForm.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSubmitting(true);
    try {
      await createAudioSubCategoryApi({ name: subCategoryForm.name, audio_category_id: subCategoryForm.audio_category_id });
      toast.success("Sous-catégorie créée");
      setShowSubCategoryModal(false);
      setSubCategoryForm({ name: "", audio_category_id: 0 });
      await loadSubcategories(subCategoryForm.audio_category_id, true);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubCategory = async () => {
    if (!editingSubCategory || !subCategoryForm.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSubmitting(true);
    const categoryId = subCategoryForm.audio_category_id;
    try {
      await updateAudioSubCategoryApi(editingSubCategory.id, { name: subCategoryForm.name });
      toast.success("Sous-catégorie mise à jour");
      setShowSubCategoryModal(false);
      setEditingSubCategory(null);
      setSubCategoryForm({ name: "", audio_category_id: 0 });
      await loadSubcategories(categoryId, true);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: number, categoryId: number) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette sous-catégorie ? Cette action est irréversible."
    );
    if (!confirmed) return;
    try {
      await deleteAudioSubCategoryApi(subCategoryId);
      toast.success("Sous-catégorie supprimée");
      setSubcategoriesMap((prev) => ({ ...prev, [categoryId]: prev[categoryId]?.filter((s) => s.id !== subCategoryId) || [] }));
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <FolderTree className="w-8 h-8 text-indigo-600" />
                Catégories audio
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Gérer les catégories et sous-catégories audio</p>
            </div>

            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openCategoryModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow">
                <Plus className="w-4 h-4" />
                Nouvelle Catégorie
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <div className="max-w-md">
            <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Rechercher une catégorie..." className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </motion.div>

        {/* Categories List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          <AnimatePresence>
            {paginatedCategories.map((category, index) => (
              <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: index * 0.05 }} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button onClick={() => toggleCategory(category.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <motion.div animate={{ rotate: expandedCategories.has(category.id) ? 90 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </motion.div>
                      </button>

                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{category.name}</h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{category.subCategoryCount || (subcategoriesMap[category.id] || []).length} sous-catégories</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => openSubCategoryModal(category.id)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors" title="Ajouter une sous-catégorie"><Plus className="w-4 h-4" /></button>
                      <button onClick={() => openCategoryModal(category)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg transition-colors" title="Modifier"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteCategory(category.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedCategories.has(category.id) && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <div className="p-4 space-y-2">
                        {(() => {
                          const subcategories = subcategoriesMap[category.id] || [];
                          return subcategories.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Aucune sous-catégorie</p>
                          ) : (
                            subcategories.map((sub) => (
                              <motion.div key={sub.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{sub.name}</h4>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button onClick={() => openSubCategoryModal(category.id, sub)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded transition-colors" title="Modifier"><Edit className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleDeleteSubCategory(sub.id, category.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
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
              <p className="text-gray-600 dark:text-gray-400">{searchTerm ? "Aucun résultat trouvé" : "Aucune catégorie"}</p>
            </div>
          )}
        </motion.div>

        {filteredCategories.length > itemsPerPage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6">
            <Pagination totalItems={filteredCategories.length} pageSize={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
          </motion.div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCategoryModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2>
                  <button onClick={() => setShowCategoryModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom <span className="text-red-500">*</span></label>
                    <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nom de la catégorie" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <button onClick={() => setShowCategoryModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" disabled={submitting}>Annuler</button>
                  <button onClick={editingCategory ? handleUpdateCategory : handleCreateCategory} disabled={submitting || !categoryForm.name.trim()} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">{submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Enregistrement...</>) : (<><Save className="w-4 h-4" />{editingCategory ? "Mettre à jour" : "Créer"}</>)}</button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* SubCategory Modal */}
        {showSubCategoryModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowSubCategoryModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{editingSubCategory ? "Modifier la sous-catégorie" : "Nouvelle sous-catégorie"}</h2>
                  <button onClick={() => setShowSubCategoryModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie parente <span className="text-red-500">*</span></label>
                    <select value={subCategoryForm.audio_category_id} onChange={(e) => setSubCategoryForm({ ...subCategoryForm, audio_category_id: Number(e.target.value) })} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={loading}>
                      <option value={0}>{loading ? "Chargement des catégories..." : "Sélectionner une catégorie"}</option>
                      {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom <span className="text-red-500">*</span></label>
                    <input type="text" value={subCategoryForm.name} onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nom de la sous-catégorie" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <button onClick={() => setShowSubCategoryModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" disabled={submitting}>Annuler</button>
                  <button onClick={editingSubCategory ? handleUpdateSubCategory : handleCreateSubCategory} disabled={submitting || loading || !subCategoryForm.name.trim() || (!editingSubCategory && !subCategoryForm.audio_category_id)} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">{submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Enregistrement...</>) : (<><Save className="w-4 h-4" />{editingSubCategory ? "Mettre à jour" : "Créer"}</>)}</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
