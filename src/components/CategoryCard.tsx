import { motion } from "framer-motion";
import { type Category } from "./CategoryAutoComplete";

interface Props {
  // accept partial because callers (CategoryManager) keep Partial<Category> items
  category: Partial<Category>;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function CategoryCard({ category, isSelected, onSelect, onDelete }: Props) {
  return (
    <motion.div
      layout
      onClick={onSelect}
      className={`p-3 mb-2 rounded-lg cursor-pointer flex justify-between items-center transition-all ${
        isSelected ? "bg-blue-100" : "hover:bg-gray-100"
      }`}
    >
      <span>{category.name ?? ""}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="text-red-500 hover:text-red-600 font-bold"
      >
        ✕
      </button>
    </motion.div>
  );
}
