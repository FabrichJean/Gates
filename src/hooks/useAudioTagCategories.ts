import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAudioTagCategoriesApi,
  createAudioTagCategoryApi,
  deleteAudioTagCategoryApi,
  updateAudioTagCategoryApi,
} from "../api/tagCategoryAudio";

export default function useAudioTagCategories() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await getAudioTagCategoriesApi();
      const items = res?.data?.items ?? res?.data ?? [];
      setItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load audio tags", err);
      toast.error("Unable to load audio tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const createItem = async (name: string) => {
    await createAudioTagCategoryApi({ name });
    await fetch();
  };

  const updateItem = async (id: number, name: string) => {
    await updateAudioTagCategoryApi(id, { name });
    await fetch();
  };

  const removeItem = async (id: number) => {
    await deleteAudioTagCategoryApi(id);
    await fetch();
  };

  return { items, loading, fetch, createItem, updateItem, removeItem };
}
