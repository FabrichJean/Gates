import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getRomanTagCategoriesApi,
  createRomanTagCategoryApi,
  deleteRomanTagCategoryApi,
  updateRomanTagCategoryApi,
} from "../api/tagCategoryRoman";

export default function useRomanTagCategories() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await getRomanTagCategoriesApi();
      const items = res?.data?.items ?? res?.data ?? [];
      setItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load roman tags", err);
      toast.error("Unable to load roman tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const createItem = async (name: string) => {
    await createRomanTagCategoryApi({ name });
    await fetch();
  };

  const updateItem = async (id: number, name: string) => {
    await updateRomanTagCategoryApi(id, { name });
    await fetch();
  };

  const removeItem = async (id: number) => {
    await deleteRomanTagCategoryApi(id);
    await fetch();
  };

  return { items, loading, fetch, createItem, updateItem, removeItem };
}
