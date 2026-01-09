import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getMangaTagCategoriesApi,
  createMangaTagCategoryApi,
  deleteMangaTagCategoryApi,
  updateMangaTagCategoryApi,
} from "../api/tagCategoryManga";

export default function useMangaTagCategories() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await getMangaTagCategoriesApi();
      const items = res?.data?.items ?? res?.data ?? [];
      setItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load manga tags", err);
      toast.error("Unable to load manga tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const createItem = async (name: string) => {
    await createMangaTagCategoryApi({ name });
    await fetch();
  };

  const updateItem = async (id: number, name: string) => {
    await updateMangaTagCategoryApi(id, { name });
    await fetch();
  };

  const removeItem = async (id: number) => {
    await deleteMangaTagCategoryApi(id);
    await fetch();
  };

  return { items, loading, fetch, createItem, updateItem, removeItem };
}
