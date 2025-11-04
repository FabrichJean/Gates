import { motion } from "framer-motion";
import { useState } from "react";
import { type Category } from "./CategoryAutoComplete";
import { updateCategoryApi } from "../api/categories";

interface Props {
  category: Category;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: (newName: string) => void; // 🔥 nouveau callback pour sauvegarder
}

export default function CategoryCard({
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
      // onEdit(tempName.trim());
      if (category) {
        await updateCategoryApi(category.id, tempName.trim())
        .then(() => {
          onEdit(tempName.trim())
        })
      }
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      onClick={onSelect}
      className={`p-3 mb-2 rounded-lg cursor-pointer flex justify-between items-center transition-all ${isSelected ? "bg-blue-100" : "hover:bg-gray-100"
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
            className="border w-full p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </form>
      ) : (
        <div
          className="flex-1 p-2"
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
        className="ml-3 text-red-500 hover:text-red-600 font-bold"
        title="Supprimer la catégorie"
      >
        ✕
      </button>
    </motion.div>
  );
}
