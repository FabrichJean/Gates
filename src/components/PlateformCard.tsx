import { motion } from "framer-motion";
import { useState } from "react";
import { type Plateform } from "../hooks/usePlateform";
import UseCategory from "../hooks/useCategory";
import {
  addCategoryToPlateformApi,
  removeCategoryFromPlateformApi,
} from "../api/plateformCategory.ts";
import toast from "react-hot-toast";

interface Props {
  plateform: Plateform;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: (newName: string) => void;
}

export default function PlateformCard({
  plateform,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(plateform.name ?? "");
  const [showCategories, setShowCategories] = useState(false);

  const { data: categories } = UseCategory();

  const handleSave = async () => {
    if (tempName.trim() && tempName !== plateform.name) {
    //   await updatePlateformApi(plateform.id, tempName.trim())
    //     .then(() => {
    //       onEdit(tempName.trim());
    //       toast.success("Plateforme mise à jour !");
    //     })
    //     .catch(() => toast.error("Erreur lors de la mise à jour"));
    }
    setIsEditing(false);
  };

  const handleAddCategory = async (categoryId: number) => {
    try {
      await addCategoryToPlateformApi(plateform.id, categoryId);
      toast.success("Catégorie ajoutée !");
    } catch {
      toast.error("Erreur lors de l’ajout de la catégorie");
    }
  };

  const handleRemoveCategory = async (categoryId: number) => {
    try {
      await removeCategoryFromPlateformApi(categoryId, plateform.id);
      toast.success("Catégorie retirée !");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <motion.div
      layout
      onClick={onSelect}
      className={`p-3 mb-2 rounded-lg cursor-pointer flex flex-col gap-3 transition-all duration-300 ${
        isSelected
          ? "bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700"
          : "hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
      }`}
    >
      {/* --- Nom / Edition --- */}
      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <input
            autoFocus
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleSave}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 w-full p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
          />
        </form>
      ) : (
        <div
          className="flex justify-between items-center"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <span className="text-gray-800 dark:text-gray-100 font-medium">
            {plateform.name ?? "Sans nom"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 font-bold"
            title="Supprimer la plateforme"
          >
            ✕
          </button>
        </div>
      )}

      {/* --- Gestion des catégories --- */}
      <div className="mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowCategories(!showCategories);
          }}
          className="text-sm text-green-600 dark:text-green-400 hover:underline"
        >
          {showCategories ? "Masquer les catégories" : "Voir les catégories"}
        </button>

        {showCategories && (
          <motion.div
            layout
            className="mt-2 flex flex-wrap gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddCategory(cat.id);
                }}
                className="px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-200 dark:hover:bg-green-700 transition"
              >
                ➕ {cat.name}
              </button>
            ))}

            {/* Exemple de retrait */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const id = prompt("ID de la catégorie à retirer ?");
                if (id) handleRemoveCategory(Number(id));
              }}
              className="text-sm text-red-500 hover:text-red-700 mt-2"
            >
              Retirer une catégorie 🔻
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
