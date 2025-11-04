import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedList from "./AnimatedList";
import { type Category } from "./CategoryAutoComplete";
import { UseSubCategoryReactive } from "../hooks/useSubCategory";
import {
  createSubCategoryApi,
  deleteSubCategoryApi,
  updateSubCategoryApi, // 🔥 tu dois l’ajouter dans ton API
} from "../api/categories";
import toast from "react-hot-toast";

interface Props {
  category: Category;
  onUpdate: (cat: Category) => void;
}

export default function SubCategoryPanel({ category }: Props) {
  const { data: subcategories, reFetch } = UseSubCategoryReactive(category);
  const [newSub, setNewSub] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");

  const addSub = async () => {
    if (!newSub.trim()) return;
    try {
      await createSubCategoryApi({ category_id: category.id, name: newSub.trim() });
      toast.success("Sous-catégorie ajoutée !");
      reFetch();
      setNewSub("");
    } catch {
      toast.error("Erreur lors de l’ajout");
    }
  };

  const removeSub = async (id: number) => {
    try {
      await deleteSubCategoryApi(id);
      toast.success("Supprimée !");
      reFetch();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const saveEdit = async (id: number, name: string) => {
    if (!name.trim()) {
      toast.error("Nom invalide");
      return;
    }
    try {
      await updateSubCategoryApi(id, { name: name.trim() });
      toast.success("Modifié avec succès !");
      setEditingId(null);
      reFetch();
    } catch {
      toast.error("Erreur lors de la modification");
    }
  };

  return (
    <motion.div layout className="flex flex-col h-full">
      <h2 className="text-xl font-semibold my-3 text-gray-800 dark:text-gray-200 transition-colors duration-300">{category?.name}</h2>

      {/* Ajout d'une sous-catégorie */}
      <div className="flex gap-2 my-4">
        <input
          type="text"
          value={newSub}
          onChange={(e) => setNewSub(e.target.value)}
          placeholder="new sub-category..."
          className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg flex-1 px-2 py-1 focus:ring-2 focus:ring-green-300 dark:focus:ring-green-500 transition-all duration-300"
        />
        <button
          onClick={addSub}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-1 rounded-lg transition-all duration-300"
        >
          +
        </button>
      </div>

      {/* Liste animée des sous-catégories */}
      <div className="flex-1 overflow-y-auto">
        <AnimatedList items={subcategories}>
          {(sub) => (
            <motion.div
              key={String(sub.id)}
              layout
              className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-2 mb-2 flex justify-between items-center group transition-all duration-300"
            >
              {editingId === sub.id ? (
                <form
                  className="flex-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveEdit(sub.id, tempName);
                  }}
                >
                  <input
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => saveEdit(sub.id, tempName)}
                    className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 w-full p-1 rounded focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none transition-all duration-300"
                  />
                </form>
              ) : (
                <div
                  onDoubleClick={() => {
                    setEditingId(sub.id);
                    setTempName(sub.name ?? "");
                  }}
                  className="flex-1 p-1 cursor-pointer text-gray-800 dark:text-gray-200 transition-colors duration-300"
                >
                  {sub.name ?? ""}
                </div>
              )}

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingId !== sub.id && (
                  <button
                    onClick={() => {
                      setEditingId(sub.id);
                      setTempName(sub.name ?? "");
                    }}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500 transition-colors duration-300"
                    title="Modifier"
                  >
                    ✎
                  </button>
                )}
                <button
                  onClick={() => removeSub(sub.id)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 transition-colors duration-300"
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatedList>
      </div>
    </motion.div>
  );
}
