import { useEffect, useState } from "react";
import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import type { SubCategory } from "../hooks/useSubCategory";

interface Props {
  categoryId?: number;
  defaultValue?: SubCategory;
  onSelect?: (sub: SubCategory) => void;
}

const SubCategoryAutoComplete = ({ categoryId, defaultValue, onSelect }: Props) => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selected, setSelected] = useState<number | "">(
    defaultValue?.id || ""
  );

  useEffect(() => {
    if (!categoryId) {
      setSubCategories([]);
      setSelected("");
      return;
    }

    const fetchSubCategories = async () => {
      try {
        const res = await axios.get<{ SubCategorys: SubCategory[] }>(
          `${apiURL}/sub-categories`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
            params: { category_id: categoryId },
          }
        );
        setSubCategories(res.data.SubCategorys);
      } catch (error) {
        console.error("Erreur lors du chargement des sous-catégories :", error);
      }
    };

    fetchSubCategories();
  }, [categoryId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSelected(id);
    const sub = subCategories.find((s) => s.id === id);
    if (sub && onSelect) onSelect(sub);
  };

  return (
    <select
      value={selected}
      onChange={handleChange}
      disabled={!categoryId || subCategories?.length === 0}
      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 outline-none transition-all duration-300 text-gray-700 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500"
    >
      <option value="" className="flex items-center justify-center">
        --Select a subcategory--
      </option>
      {subCategories?.map((sub) => (
        <option key={sub.id} value={sub.id} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">
          {sub.name}
        </option>
      ))}
    </select>
  );
};

export default SubCategoryAutoComplete;
