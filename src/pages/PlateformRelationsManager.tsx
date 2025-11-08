import { useEffect, useState } from "react";
import UsePlateform from "../hooks/usePlateform";
import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import toast from "react-hot-toast";
import {
  addCategoryToPlateformApi,
  removeCategoryFromPlateformApi,
  getCategoriesByPlateformApi,
  clearCategoriesFromPlateformApi,
} from "../api/plateformCategory";
import { createCastegoryApi, createSubCategoryApi } from "../api/categories";
import {
  createPlateformSubCategoryApi,
  getSubCategoriesForPlateformApi,
  deletePlateformSubCategoryApi,
} from "../api/plateformSubCategory";
import {
  createPlateformApi,
  updatePlateformApi,
  deletePlateformApi,
} from "../api/plateforms";
import UseCategory from "../hooks/useCategory";
import UseSubCategory from "../hooks/useSubCategory";

export default function PlateformRelationsManager() {
  const { data: plateforms, reFetch: reFetchPlateform } = UsePlateform();
  const [selectedPlateform, setSelectedPlateform] = useState<number | null>(
    plateforms?.length ? plateforms[0].id : null
  );

  const { data: allCategories, reFetch: reFetchCategories } = UseCategory();
  const {data: allSubCategories, reFetch: reFetchSubCategories } = UseSubCategory()
  const [catRelations, setCatRelations] = useState<any[]>([]);
  const [subcatRelations, setSubcatRelations] = useState<any[]>([]);
//   const [allSubCategories, setAllSubCategories] = useState<any[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [subCategoryModalOpen, setSubCategoryModalOpen] = useState(false);
  const [search, setSearch] = useState("");

//   console.log('categories', categories);
  console.log('allcat', allCategories);
  
  

  // States supplémentaires pour Platform CRUD
  const [platformModalOpen, setPlatformModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<any | null>(null);
  const [platformName, setPlatformName] = useState("");
  const [platformVideoSyncUrl, setPlatformVideoSyncUrl] = useState("");
  const [platformPostSyncUrl, setPlatformPostSyncUrl] = useState("");

  // Fetch Platforms (remplacer UsePlateform si besoin pour rafraîchir)
  const fetchPlatforms = async () => {
    reFetchPlateform();
  };

  // Add / Edit Platform
  const handleSavePlatform = async () => {
    if (!platformName.trim()) return toast.error("Enter a platform name");
    try {
      const payload: any = {
        name: platformName,
      };
      if (platformVideoSyncUrl) payload.video_sync_url = platformVideoSyncUrl;
      if (platformPostSyncUrl) payload.post_sync_url = platformPostSyncUrl;

      if (editingPlatform) {
        await updatePlateformApi(editingPlatform.id, payload);
        toast.success("Platform updated");
      } else {
        await createPlateformApi(payload);
        toast.success("Platform created");
      }

      // reset modal state and refresh list
      setPlatformModalOpen(false);
      setPlatformName("");
      setPlatformVideoSyncUrl("");
      setPlatformPostSyncUrl("");
      setEditingPlatform(null);
      // refresh platforms list
      fetchPlatforms();
    } catch {
      toast.error("Error saving platform");
    }
  };

  // Delete Platform
  const handleDeletePlatform = async (id: number) => {
    if (!confirm("Are you sure you want to delete this platform?")) return;
    try {
      await deletePlateformApi(id);
      toast.success("Platform deleted");
      // if the deleted platform was selected, clear selection and relations
      if (selectedPlateform === id) {
        setSelectedPlateform(null);
        setCatRelations([]);
        setSubcatRelations([]);
      }
      // refresh platform list
      fetchPlatforms();
    } catch {
      toast.error("Error deleting platform");
    }
  };

  const headers = { Authorization: `Bearer ${getToken()}` };

//   useEffect(() => {
//     const fetchAll = async () => {
//       try {
//         const [subsRes] = await Promise.all([
//         //   axios.get(`${apiURL}/categories`, { headers }),
//           axios.get(`${apiURL}/sub-categories`, { headers }),
//         ]);
//         // setAllCategories(catsRes.data ?? []);
//         const subs = subsRes.data?.SubCategorys ?? subsRes.data ?? [];
//         setAllSubCategories(subs);
//       } catch (err) {
//         toast.error("Failed to load categories/subcategories");
//       }
//     };
//     fetchAll();
//   }, []);

  const fetchRelations = async (plateformId: number | null) => {
    if (!plateformId) return;
    try {
      const [catsRes, subsRes] = await Promise.all([
        getCategoriesByPlateformApi(plateformId),
        getSubCategoriesForPlateformApi(plateformId),
      ]);
      // Normalize categories response (backend may return different shapes)
      const normalizeCategories = (res: any) => {
        const payload = res?.data ?? res;
        if (Array.isArray(payload)) return payload;
        if (!payload) return [];
        if (Array.isArray(payload.Categories)) return payload.Categories;
        if (Array.isArray(payload.Categorys)) return payload.Categorys;
        if (Array.isArray(payload.categories)) return payload.categories;
        // try to find first array value
        const arr = Object.values(payload).find((v) => Array.isArray(v));
        return Array.isArray(arr) ? arr : [];
      };

      // Normalize subcategories and extract possible relation id (PlateformSubCategory.id)
      const normalizeSubcategories = (res: any) => {
        const payload = res?.data ?? res;
        let list: any[] = [];
        if (Array.isArray(payload)) list = payload;
        else if (Array.isArray(payload.SubCategorys)) list = payload.SubCategorys;
        else if (Array.isArray(payload.subcategories)) list = payload.subcategories;
        else if (Array.isArray(payload.SubCategories)) list = payload.SubCategories;
        else {
          const arr = Object.values(payload).find((v) => Array.isArray(v));
          list = Array.isArray(arr) ? arr : [];
        }

        // map to unified shape: { id, name, relationId }
        return list.map((item: any) => ({
          id: item.id ?? item.subCategoryId ?? item.SubCategoryId,
          name: item.name ?? item.title ?? item.label,
          relationId:
            item.PlateformSubCategory?.id || item.Plateform_SubCategory?.id || item.relationId || null,
        }));
      };

      setCatRelations(normalizeCategories(catsRes));
      setSubcatRelations(normalizeSubcategories(subsRes));
    } catch {
      toast.error("Error loading relations");
    }
  };

  useEffect(() => {
    fetchRelations(selectedPlateform);
  }, [selectedPlateform]);

  const handleAddCategory = async (categoryId: number) => {
    if (!selectedPlateform) return toast.error("Select a platform first");
    try {
      await addCategoryToPlateformApi(selectedPlateform, categoryId);
      toast.success("Category linked");
      reFetchCategories();
      fetchRelations(selectedPlateform);
      setCategoryModalOpen(false);
    } catch {
      toast.error("Error adding category");
    }
  };

  const handleCreateAndLinkCategory = async (name: string) => {
    if (!selectedPlateform) return toast.error("Select a platform first");
    if (!name.trim()) return toast.error("Name required");
    try {
      const res = await createCastegoryApi(name.trim());
      const newCat = res.data;
      const id = newCat.category.id;
      if (!id) throw new Error("Invalid create response");
      await handleAddCategory(id);
      
    //   toast.success("Category created and linked");
      setCategoryModalOpen(false);
      setSearch("");
    } catch (err) {
      toast.error(JSON.stringify(err));
    }
  };

  const handleAddSubcategory = async (subId: number) => {
    if (!selectedPlateform) return toast.error("Select a platform first");
    try {
      await createPlateformSubCategoryApi(selectedPlateform, subId);
      toast.success("Subcategory linked");
      fetchRelations(selectedPlateform);
      setSubCategoryModalOpen(false);
    } catch {
      toast.error("Error adding subcategory");
    }
  };

//   const handleCreateAndLinkSubcategory = async (name: string) => {
//     if (!selectedPlateform) return toast.error("Select a platform first");
//     if (!name.trim()) return toast.error("Name required");
//     try {
//       // create subcategory without category (category_id: 0) — adjust if your backend requires a valid category
//       const res = await createSubCategoryApi({ name: name.trim(), category_id: 0 });
//       const newSub = res.data?.data ?? res.data ?? res;
//       const id = newSub.id ?? newSub.subCategoryId ?? newSub._id;
//       if (!id) throw new Error("Invalid create response");
//       await handleAddSubcategory(id);
//       toast.success("Subcategory created and linked");
//       setSubCategoryModalOpen(false);
//       setSearch("");
//     } catch (err) {
//       toast.error("Error creating subcategory");
//     }
//   };

  const handleRemoveCategory = async (categoryId: number) => {
    if (!selectedPlateform) return;
    try {
      await removeCategoryFromPlateformApi(selectedPlateform, categoryId);
      toast.success("Category removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error removing category");
    }
  };

  const handleRemoveSubcategory = async (relationId: number) => {
    try {
      await deletePlateformSubCategoryApi(relationId);
      toast.success("Subcategory removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error removing subcategory");
    }
  };

  const handleClearCategories = async () => {
    if (!selectedPlateform) return;
    if (!confirm("Remove all categories from this platform?")) return;
    try {
      await clearCategoriesFromPlateformApi(selectedPlateform);
      toast.success("All categories removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error clearing categories");
    }
  };

  const filteredCategories = allCategories?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubcategories = allSubCategories?.SubCategorys?.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-start">
        🧩 WebApp Relations Manager
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar - Platforms */}
        <div className="md:w-1/4 w-full bg-base-100 shadow rounded-xl p-4">
          <div className="flex justify-between items-end mb-4 flex-wrap gap-3">
            <h2 className="font-semibold text-lg">WebApps</h2>
            <button
              onClick={() => {
                // prepare modal for creating a new platform
                setEditingPlatform(null);
                setPlatformName("");
                setPlatformVideoSyncUrl("");
                setPlatformPostSyncUrl("");
                setPlatformModalOpen(true);
              }}
              className="btn rounded shadow btn-sm mt-2"
            >
              ➕ add
            </button>
          </div>
          <div className="flex flex-col gap-2 max-h-[70vh] overflow-auto">
            {plateforms?.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center">
                <button
                  onClick={() => setSelectedPlateform(p.id)}
                  className={`btn btn-sm flex-1 justify-start ${
                    selectedPlateform === p.id
                      ? "bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
                  }`}
                >
                  {p.name}
                </button>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => {
                      setEditingPlatform(p);
                      setPlatformName(p.name);
                      setPlatformVideoSyncUrl(p.video_sync_url ?? "");
                      setPlatformPostSyncUrl(p.post_sync_url ?? "");
                      setPlatformModalOpen(true);
                    }}
                    className="btn btn-xs btn-primary"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeletePlatform(p.id)}
                    className="btn btn-xs btn-outline text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* // Platform Modal */}
          <dialog className={`modal ${platformModalOpen ? "modal-open" : ""}`}>
            <div className="modal-box max-w-md">
              <h3 className="font-bold text-lg mb-3">
                {editingPlatform ? "Edit WebApp" : "Add WebApp"}
              </h3>
              <input
                type="text"
                placeholder="WebApp name"
                className="input input-bordered w-full mb-3"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Video sync URL"
                className="input input-bordered w-full mb-3"
                value={platformVideoSyncUrl}
                onChange={(e) => setPlatformVideoSyncUrl(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Post sync URL"
                className="input input-bordered w-full mb-3"
                value={platformPostSyncUrl}
                onChange={(e) => setPlatformPostSyncUrl(e.target.value)}
                required
              />
              <div className="modal-action">
                <button
                  onClick={() => setPlatformModalOpen(false)}
                  className="btn btn-outline"
                >
                  Close
                </button>
                <button
                  onClick={handleSavePlatform}
                  className="btn btn-primary"
                >
                  {editingPlatform ? "Save" : "Add"}
                </button>
              </div>
            </div>
          </dialog>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-base-100 shadow rounded-xl p-4">
          {selectedPlateform ? (
            <>
              <div className="flex justify-center items-center mb-4 flex-wrap gap-3 w-full">
                {/* <h2 className="font-semibold text-lg">
                  Relations for Platform #{selectedPlateform}
                </h2> */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setCategoryModalOpen(true)}
                    className="btn rounded shadow btn-sm"
                  >
                    ➕ link Category
                  </button>
                  <button
                    onClick={() => setSubCategoryModalOpen(true)}
                    className="btn rounded shadow btn-sm"
                  >
                    ➕ link Subcategory
                  </button>
                  <button
                    onClick={handleClearCategories}
                    className="btn rounded shadow btn-sm text-red-500"
                  >
                    🗑️ Clear All
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Linked Categories</h3>
                  {catRelations.length === 0 ? (
                    <p className="text-gray-500">No categories linked</p>
                  ) : (
                    catRelations.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2 border rounded-lg mb-2"
                      >
                        <span>{c.name}</span>
                        <button
                          onClick={() => handleRemoveCategory(c.id)}
                          className="btn rounded shadow btn-sm text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-2">Linked Subcategories</h3>
                  {subcatRelations?.length === 0 ? (
                    <p className="text-gray-500">No subcategories linked</p>
                  ) : (
                    subcatRelations?.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2 border rounded-lg mb-2"
                      >
                        <span>{s.name}</span>
                        <button
                          onClick={() => handleRemoveSubcategory(s.relationId)}
                          className="btn rounded shadow btn-sm text-red-500"
                          disabled={!s.relationId}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 mt-10">
              Select a platform to manage its relations.
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <dialog
        id="categoryModal"
        className={`modal ${categoryModalOpen ? "modal-open" : ""}`}
      >
        <div className="modal-box max-w-md">
          <h3 className="font-bold text-lg mb-3">Add Category</h3>
          <input
            type="text"
            placeholder="Search category..."
            className="input input-bordered w-full mb-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-60 overflow-auto">
            {filteredCategories?.length === 0 && search.trim() !== "" ? (
              <div className="flex justify-between items-center border-b py-2">
                <span className="italic text-gray-500">Create new category "{search}"</span>
                <button
                  onClick={() => handleCreateAndLinkCategory(search)}
                  className="btn btn-xs btn-success"
                >
                  Create & Link
                </button>
              </div>
            ) : (
              filteredCategories?.map((cat) => {
              const isLinked = catRelations.some((rc) => rc.id === cat.id);
              return (
                <div
                  key={cat.id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <span>{cat.name}</span>
                  {isLinked ? (
                    <button className="btn btn-xs btn-disabled">Linked</button>
                  ) : (
                    <button
                      onClick={() => handleAddCategory(cat.id)}
                      className="btn btn-xs btn-primary"
                    >
                      Add
                    </button>
                  )}
                </div>
              );
              })
            )}
          </div>
          <div className="modal-action">
            <button
              onClick={() => setCategoryModalOpen(false)}
              className="btn btn-outline"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>

      {/* Subcategory Modal */}
      <dialog
        id="subCategoryModal"
        className={`modal ${subCategoryModalOpen ? "modal-open" : ""}`}
      >
        <div className="modal-box max-w-md">
          <h3 className="font-bold text-lg mb-3">Add Subcategory</h3>
          <input
            type="text"
            placeholder="Search subcategory..."
            className="input input-bordered w-full mb-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-60 overflow-auto">
            {filteredSubcategories?.length === 0 && search.trim() !== "" ? (
              <div className="flex justify-between items-center border-b py-2">
                <span className="italic text-gray-500">no subcategory</span>
              </div>
            ) : (
              filteredSubcategories?.map((sub) => {
                const isLinked = subcatRelations.some((rs) => rs.id === sub.id);
                return (
                  <div
                    key={sub.id}
                    className="flex justify-between items-center border-b py-2"
                  >
                    <span>{sub.name}</span>
                    {isLinked ? (
                      <button className="btn btn-xs btn-disabled">Linked</button>
                    ) : (
                      <button
                        onClick={() => handleAddSubcategory(sub.id)}
                        className="btn btn-xs btn-secondary"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="modal-action">
            <button
              onClick={() => setSubCategoryModalOpen(false)}
              className="btn btn-outline"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
