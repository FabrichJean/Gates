import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedList from "./AnimatedList";
import { type Category } from "./CategoryAutoComplete";

interface Props {
  category: Partial<Category>;
  // Accept partial updates because caller may manage partial Category objects
  onUpdate: (cat: Partial<Category>) => void;
}

export default function SubCategoryPanel({ category, onUpdate }: Props) {
  const [newSub, setNewSub] = useState("");

  const addSub = () => {
    if (!newSub.trim()) return;
    const currentSubs = category.subcategories ?? [];
    const newSubObj: Partial<Category> = { id: Date.now(), name: newSub };
    const updated: Partial<Category> = {
      ...category,
      subcategories: [...currentSubs, newSubObj],
    };
    onUpdate(updated);
    setNewSub("");
  };

  const removeSub = (id: string | number) => {
    const currentSubs = category.subcategories ?? [];
    const updated: Partial<Category> = {
      ...category,
      subcategories: currentSubs.filter((s) => String(s.id) !== String(id)),
    };
    onUpdate(updated);
  };

  return (
    <motion.div layout className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-3">{category.name}</h2>

      <div className="flex-1 overflow-y-auto">
        {/* filter to ensure items handed to AnimatedList have an id */}
        {(() => {
          const subs = (category.subcategories ?? []).filter(
            (s): s is Partial<Category> & { id: string | number } => s?.id !== undefined
          );

          return (
            <AnimatedList items={subs}>
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

      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={newSub}
          onChange={(e) => setNewSub(e.target.value)}
          placeholder="Nouvelle sous-catégorie..."
          className="border rounded-lg flex-1 px-2 py-1 focus:ring-2 focus:ring-green-300"
        />
        <button
          onClick={addSub}
          className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700"
        >
          +
        </button>
      </div>
    </motion.div>
  );
}
