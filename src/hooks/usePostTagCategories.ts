import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getTagCategoriesPostApi,
  createTagCategoryPostApi,
  deleteTagCategoryPostApi,
  updateTagCategoryPostApi,
} from "../api/tagCategoryPost";

export default function usePostTagCategories() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await getTagCategoriesPostApi();
      const items = res?.data?.items ?? res?.data ?? [];
      setItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load post tags", err);
      toast.error("Unable to load post tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const createItem = async (name: string) => {
    await createTagCategoryPostApi({ name });
    await fetch();
  };

  const updateItem = async (id: number, name: string) => {
    await updateTagCategoryPostApi({ id, name });
    await fetch();
  };

  const removeItem = async (id: number) => {
    await deleteTagCategoryPostApi(id);
    await fetch();
  };

  return { items, loading, fetch, createItem, updateItem, removeItem };
}
