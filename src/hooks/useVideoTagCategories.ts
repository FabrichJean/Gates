import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getTagCategoriesApi,
  createTagCategoryApi,
  deleteTagCategoryApi,
  updateTagCategoryApi,
} from "../api/tagCategory";

export default function useVideoTagCategories() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await getTagCategoriesApi();
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Failed to load video tags", err);
      toast.error("Unable to load tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const createItem = async (name: string) => {
    await createTagCategoryApi({ name });
    await fetch();
  };

  const updateItem = async (id: number, name: string) => {
    await updateTagCategoryApi(id, { name });
    await fetch();
  };

  const removeItem = async (id: number) => {
    await deleteTagCategoryApi(id);
    await fetch();
  };

  return { items, loading, fetch, createItem, updateItem, removeItem };
}
