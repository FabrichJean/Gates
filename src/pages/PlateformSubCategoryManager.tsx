import { useEffect, useState } from "react";
import UsePlateform from "../hooks/usePlateform";
import {
  createPlateformSubCategoryApi,
  getSubCategoriesForPlateformApi,
  deletePlateformSubCategoryApi,
} from "../api/plateformSubCategory";
import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import toast, { Toaster } from "react-hot-toast";

export default function PlateformSubCategoryManager() {
  const { data: plateforms } = UsePlateform();
  const [selectedPlateform, setSelectedPlateform] = useState<number | null>(
    null
  );
  const [relations, setRelations] = useState<any[]>([]);
  const [allSubCategories, setAllSubCategories] = useState<any[]>([]);
  const headers = { Authorization: `Bearer ${getToken()}` };

  const fetchRelations = async (plateformId: number | null) => {
    if (!plateformId) {
      setRelations([]);
      return;
    }
    try {
      // Prefer the specific route that returns subcategories for a given plateform
      const res = await getSubCategoriesForPlateformApi(plateformId);
      // Expecting res.data to be an array of relations or subcategories depending on backend
      setRelations(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des relations");
    }
  };

  const fetchAllSubCategories = async () => {
    try {
      const res = await axios.get(`${apiURL}/sub-categories`, { headers });
      const subs = res.data?.SubCategorys ?? [];
      setAllSubCategories(subs);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des sous-catégories");
    }
  };

  useEffect(() => {
    fetchAllSubCategories();
  }, []);

  useEffect(() => {
    fetchRelations(selectedPlateform);
  }, [selectedPlateform]);

  const handleAdd = async (subId: number) => {
    if (!selectedPlateform) return toast.error("Sélectionnez une plateforme");
    try {
      await createPlateformSubCategoryApi(selectedPlateform, subId);
      toast.success("Relation créée");
      fetchRelations(selectedPlateform);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création");
    }
  };

  const handleRemove = async (relationId: number) => {
    try {
      await deletePlateformSubCategoryApi(relationId);
      toast.success("Relation supprimée");
      fetchRelations(selectedPlateform);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-semibold mb-4">Plateform ↔ SubCategory</h1>
      <div className="flex gap-6">
        <div className="w-1/3 bg-white dark:bg-gray-800 p-4 rounded border">
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
          <h2 className="font-medium mb-2">Relations</h2>
          {selectedPlateform ? (
            <div className="space-y-2">
              {relations?.length === 0 && (
                <div className="text-gray-500">Aucune relation trouvée</div>
              )}
              {relations?.map((r: any) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    {r.name}
                  </div>
                  <div>
                    <button
                      onClick={() => handleRemove(r.id)}
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

        <div className="w-1/3 bg-white dark:bg-gray-800 p-4 rounded border">
          <h2 className="font-medium mb-2">All SubCategories</h2>
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
            {allSubCategories.map((s: any) => (
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
                    Ajouter
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
