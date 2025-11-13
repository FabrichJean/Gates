import { motion } from "framer-motion";
import { useState } from "react";
import { type Category } from "./CategoryAutoComplete";
import { updatePostCategoryApi } from "../api/postCategories";

interface Props {
  category: Category;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: (newName: string) => void;
}

export default function PostCategoryCard({
  category,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(category.name ?? "");

  const handleSave = async () => {
    if (tempName.trim() && tempName !== category.name) {
      if (category) {
        await updatePostCategoryApi(category.id, tempName.trim()).then(() => {
          onEdit(tempName.trim());
        });
      }
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      onClick={onSelect}
      className={`py-1 px-2 text-sm mb-2 rounded-lg cursor-pointer flex justify-between items-center transition-all duration-300 ${
        isSelected
          ? "bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700"
          : "hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
      }`}
    >
      {isEditing ? (
        <form
          className="flex-1"
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
            className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 w-full p-2 rounded focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none transition-all duration-300"
          />
        </form>
      ) : (
        <div
          className="flex-1 p-2 text-gray-800 dark:text-gray-200 transition-colors duration-300"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          {category.name ?? "Sans nom"}
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="ml-3 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 font-bold transition-colors duration-300"
        title="Supprimer la catégorie"
      >
        ✕
      </button>
    </motion.div>
  );
}
