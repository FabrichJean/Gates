import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedList from "./AnimatedList";
import { type Category } from "./CategoryAutoComplete";
import { UseSubCategoryReactive } from "../hooks/useSubCategory";
import { createSubCategoryApi, deleteSubCategoryApi } from "../api/categories";
import toast from "react-hot-toast";

interface Props {
  category: Category;
  // Accept partial updates because caller may manage partial Category objects
  onUpdate: (cat: Category) => void;
}

export default function SubCategoryPanel({ category, onUpdate }: Props) {

  const { data: subcategories, reFetch } = UseSubCategoryReactive(category)
  const [newSub, setNewSub] = useState("");

  const addSub = async () => {
    if (!newSub.trim()) return;
    await createSubCategoryApi({ category_id: category.id, name: newSub.trim() })
      .then(() => {
        reFetch()
      })
      .catch(() => {
        toast.error('err')
      })
      .finally(() => {
        setNewSub("");
      })
  };

  const removeSub = async (id: number) => {
    await deleteSubCategoryApi(id)
      .then(() => {
        reFetch()
      })
      .catch(() => {
        toast.error('err')
      })
  };

  return (
    <motion.div layout className="flex flex-col h-full">
      <h2 className="text-xl font-semibold my-3">{category?.name}</h2>

      <div className="flex gap-2 my-4">
        <input
          type="text"
          value={newSub}
          onChange={(e) => setNewSub(e.target.value)}
          placeholder="new sub-category..."
          className="border rounded-lg flex-1 px-2 py-1 focus:ring-2 focus:ring-green-300"
        />
        <button
          onClick={addSub}
          className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* filter to ensure items handed to AnimatedList have an id */}
        {(() => {

          return (
            <AnimatedList items={subcategories}>
              {(sub) => (
                <div
                  key={String(sub.id)}
                  className="bg-gray-50 border rounded-md p-2 mb-2 flex justify-between items-center"
                >
                  <span>{sub.name ?? ""}</span>
                  <button
                    onClick={() => removeSub(sub.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}
            </AnimatedList>
          );
        })()}
      </div>
    </motion.div>
  );
}