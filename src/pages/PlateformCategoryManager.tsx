import { useEffect, useState } from "react";
import UsePlateform from "../hooks/usePlateform";
import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import {
  addCategoryToPlateformApi,
  removeCategoryFromPlateformApi,
  getCategoriesByPlateformApi,
  clearCategoriesFromPlateformApi,
} from "../api/plateformCategory";
import toast from "react-hot-toast";

export default function PlateformCategoryManager() {
  const { data: plateforms } = UsePlateform();

  const [selectedPlateform, setSelectedPlateform] = useState<number | null>(
    null
  );
  const [relations, setRelations] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const headers = { Authorization: `Bearer ${getToken()}` };

  const fetchRelationsForPlateform = async (plateformId: number | null) => {
    if (!plateformId) return setRelations([]);
    try {
      const res = await getCategoriesByPlateformApi(plateformId);
      // backend may return different shapes. Normalize to { categoryId, name }
      const raw = res.data;
      let list: any[] = [];

      const extractFromItem = (item: any) => {
        // If item is a category-like object
        if (item == null) return null;
        if (item.id && item.name) return { categoryId: item.id, name: item.name };
        // If nested under Category
        if (item.Category && item.Category.id) return { categoryId: item.Category.id, name: item.Category.name };
        // If nested under category
        if (item.category && item.category.id) return { categoryId: item.category.id, name: item.category.name };
        // If item has categoryId and name
        if ((item.categoryId || item.CategoryId || item.cat_id) && item.name) return { categoryId: item.categoryId || item.CategoryId || item.cat_id, name: item.name };
        // If item is just an id
        if (typeof item === 'number') return { categoryId: item, name: String(item) };
        return null;
      };

      if (Array.isArray(raw)) {
        list = raw
          .map((it: any) => extractFromItem(it))
          .filter(Boolean);
      } else if (raw && typeof raw === 'object') {
        // try common container keys
        const possible = raw.Categories || raw.categories || raw.Categorys || raw.SubCategorys || raw.data || null;
        if (Array.isArray(possible)) {
          list = possible.map((it: any) => extractFromItem(it)).filter(Boolean);
        } else {
          // single object
          const single = extractFromItem(raw);
          if (single) list = [single];
        }
      }

      setRelations(list);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des relations");
    }
  };

  const fetchAllCategories = async () => {
    try {
      const res = await axios.get(`${apiURL}/categories`, { headers });
      const cats = res.data ?? [];
      setAllCategories(cats);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des catégories");
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  useEffect(() => {
    fetchRelationsForPlateform(selectedPlateform);
  }, [selectedPlateform]);

  const handleAdd = async (categoryId: number) => {
    if (!selectedPlateform) return toast.error("Sélectionnez une plateforme");
    try {
      await addCategoryToPlateformApi(selectedPlateform, categoryId);
      toast.success("Relation créée");
      fetchRelationsForPlateform(selectedPlateform);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleRemove = async (categoryId: number) => {
    if (!selectedPlateform) return;
    try {
      // remove by plateformId + categoryId (API route provided)
      await removeCategoryFromPlateformApi(selectedPlateform as number, categoryId);
      toast.success("Relation supprimée");
      fetchRelationsForPlateform(selectedPlateform);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleClear = async () => {
    if (!selectedPlateform) return toast.error("Sélectionnez une plateforme");
    if (!confirm("Supprimer toutes les catégories de cette plateforme ?")) return;
    try {
      await clearCategoriesFromPlateformApi(selectedPlateform);
      toast.success("Toutes les relations ont été supprimées");
      fetchRelationsForPlateform(selectedPlateform);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du clear");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Plateform ↔ Category</h1>
      <div className="flex gap-6">
        <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 p-4 rounded border">
          <h2 className="font-medium mb-2">Plateforms</h2>
          <div className="flex flex-col gap-2">
            {plateforms?.map((p: any) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlateform(p.id)}
                className={`text-left p-2 rounded transition-colors duration-150 ${
                  selectedPlateform === p.id
                    ? "bg-green-100 dark:bg-green-900"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Relations</h2>
            {selectedPlateform && (
              <button
                onClick={handleClear}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Clear all
              </button>
            )}
          </div>
          {selectedPlateform ? (
            <div className="space-y-2">
              {relations.length === 0 && (
                <div className="text-gray-500 italic">Empty</div>
              )}
              {relations.map((r: any) => (
                <div
                  key={r.id || r.categoryId}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>{r.name ?? `categoryId: ${r.categoryId}`}</div>
                  <div>
                    <button
                      onClick={() => handleRemove(r.categoryId ?? r.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Sélectionnez une plateforme à gauche</div>
          )}
        </div>

        <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 p-4 rounded border">
          <h2 className="font-medium mb-2">Select Categories</h2>
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
            {allCategories?.filter(s => !relations.some(r => r.categoryId === s.id)).map((s: any) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>{s.name}</div>
                <div>
                  <button
                    onClick={() => handleAdd(s.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
