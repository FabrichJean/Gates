import { useEffect, useState, useCallback } from "react";
import UsePlateform from "../hooks/usePlateform";
import toast from "react-hot-toast";
import {
  addCategoryToPlateformApi,
  removeCategoryFromPlateformApi,
  getCategoriesByPlateformApi,
  clearCategoriesFromPlateformApi,
  clearSubCategoriesFromPlateformApi,
} from "../api/plateformCategory";
import { createCastegoryApi } from "../api/categories";
import {
  createPlateformSubCategoryApi,
  getSubCategoriesForPlateformApi,
  deletePlateformSubCategoryApi,
} from "../api/plateformSubCategory";
import {
  addPostCategoryToPlateformApi,
  removePostCategoryFromPlateformApi,
  getPostCategoriesByPlateformApi,
  clearPostCategoriesFromPlateformApi,
} from "../api/plateformPostCategory";
import {
  createPlateformPostSubCategoryApi,
  getPostSubCategoriesForPlateformApi,
  deletePlateformPostSubCategoryApi,
  clearPostSubCategoriesFromPlateformApi,
} from "../api/plateformPostSubCategory";
import { createPostCategoryApi } from "../api/postCategories";
import {
  createPlateformApi,
  updatePlateformApi,
  deletePlateformApi,
} from "../api/plateforms";
import useTagVideoCategory from "../hooks/useTagVideoCategory";
import UseCategory from "../hooks/useCategory";
import UseSubCategory from "../hooks/useSubCategory";
import useCategoryPost from "../hooks/posts/useCategoryPost";
import useSubCategoryPost from "../hooks/posts/useSubCategoryPost";
import UseCreators from "../hooks/useCreators";
import {
  addCreatorToPlateformApi,
  removeCreatorFromPlateformApi,
  getCreatorsByPlateformApi,
  clearCreatorsFromPlateformApi,
} from "../api/plateformCreator";

import {
  addTagCategoryToPlateformApi,
  getTagCategoriesByPlateformApi,
  removeTagCategoryFromPlateformApi,
  clearTagCategoriesFromPlateformApi,
} from "../api/plateformTagCategory";
import { createTagCategoryApi } from "../api/tagCategory";





// Local types
type RelationItem = { id: number; name?: string; relationId?: number | null };

type Platform = {
  id: number;
  name: string;
  video_sync_url?: string;
  post_sync_url?: string;
};

export default function PlateformRelationsManager() {
  const { data: plateforms, reFetch: reFetchPlateform } = UsePlateform();
  const [selectedPlateform, setSelectedPlateform] = useState<number | null>(
    plateforms?.length ? plateforms[0].id : null
  );

  const { data: allCategories, reFetch: reFetchCategories } = UseCategory();
  const { data: allCategoriesTag, reFetch: reFetchCategoriesTag } = useTagVideoCategory(); // ------------ TAG CATEGORIES
  const { data: allSubCategories } = UseSubCategory();

  const [catRelations, setCatRelations] = useState<RelationItem[]>([]);
  const [tagCatRelations, setTagCatRelations] = useState<RelationItem[]>([]); //-------------TAG CATEGORIES
  const [subcatRelations, setSubcatRelations] = useState<RelationItem[]>([]);
  const [creatorRelations, setCreatorRelations] = useState<RelationItem[]>([]);
  const [relationMode, setRelationMode] = useState<"video" | "post">("video");

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [tagCatModalOpen, setTagCatModalOpen] = useState(false);
  const [subCategoryModalOpen, setSubCategoryModalOpen] = useState(false);
  const [search, setSearch] = useState("");


  const [platformModalOpen, setPlatformModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [platformName, setPlatformName] = useState("");
  const [platformVideoSyncUrl, setPlatformVideoSyncUrl] = useState("");
  const [platformPostSyncUrl, setPlatformPostSyncUrl] = useState("");

  const fetchPlatforms = async () => {
    reFetchPlateform();
  };

  const handleSavePlatform = async () => {
    if (!platformName.trim()) return toast.error("Enter a platform name");
    const isValidUrl = (u: string) => {
      if (!u) return true;
      try {
        new URL(u);
        return true;
      } catch {
        return false;
      }
    };

    if (!isValidUrl(platformVideoSyncUrl))
      return toast.error("Invalid Video sync URL");
    if (!isValidUrl(platformPostSyncUrl))
      return toast.error("Invalid Post sync URL");
    try {
      const payload: {
        name: string;
        video_sync_url?: string;
        post_sync_url?: string;
      } = {
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

      setPlatformModalOpen(false);
      setPlatformName("");
      setPlatformVideoSyncUrl("");
      setPlatformPostSyncUrl("");
      setEditingPlatform(null);
      fetchPlatforms();
    } catch {
      toast.error("Error saving platform");
    }
  };

  const handleDeletePlatform = async (id: number) => {
    if (!confirm("Are you sure you want to delete this platform?")) return;
    try {
      await deletePlateformApi(id);
      toast.success("Platform deleted");
      if (selectedPlateform === id) {
        setSelectedPlateform(null);
        setCatRelations([]);
        setSubcatRelations([]);
        setTagCatRelations([]);
      }
      fetchPlatforms();
    } catch {
      toast.error("Error deleting platform");
    }
  };

  const fetchRelations = useCallback(
    async (plateformId: number | null) => {
      if (!plateformId) return;
      try {
        const [catsRes, subsRes] =
          relationMode === "post"
            ? await Promise.all([
              getPostCategoriesByPlateformApi(plateformId),
              getPostSubCategoriesForPlateformApi(plateformId),
            ])
            : await Promise.all([
              getCategoriesByPlateformApi(plateformId),
              getSubCategoriesForPlateformApi(plateformId),
            ]);

        const normalizeCategories = (res: unknown): RelationItem[] => {
          const payload =
            ((res as unknown) && (res as Record<string, unknown>)["data"]) ??
            res;
          let list: unknown[] = [];
          if (Array.isArray(payload)) list = payload as unknown[];
          else {
            const p = payload as Record<string, unknown>;
            if (Array.isArray(p["Categories"]))
              list = p["Categories"] as unknown[];
            else if (Array.isArray(p["Categorys"]))
              list = p["Categorys"] as unknown[];
            else if (Array.isArray(p["categories"]))
              list = p["categories"] as unknown[];
            else {
              const arr = Object.values(p).find((v) => Array.isArray(v));
              list = Array.isArray(arr) ? (arr as unknown[]) : [];
            }
          }
          return list.map((item) => {
            const it = item as Record<string, unknown>;
            const id = (it.id ?? it.categoryId ?? it.CategoryId) as unknown;
            const name = (it.name ?? it.title ?? it.label) as unknown;
            return {
              id: typeof id === "number" ? id : Number(id ?? 0),
              name: typeof name === "string" ? name : String(name ?? ""),
            };
          });
        };

        const normalizeSubcategories = (res: unknown) => {
          const payload =
            ((res as unknown) && (res as Record<string, unknown>)["data"]) ??
            res;
          let list: unknown[] = [];
          if (Array.isArray(payload)) list = payload as unknown[];
          else {
            const p = payload as Record<string, unknown>;
            if (Array.isArray(p["SubCategorys"]))
              list = p["SubCategorys"] as unknown[];
            else if (Array.isArray(p["subcategories"]))
              list = p["subcategories"] as unknown[];
            else if (Array.isArray(p["SubCategories"]))
              list = p["SubCategories"] as unknown[];
            else {
              const arr = Object.values(p).find((v) => Array.isArray(v));
              list = Array.isArray(arr) ? (arr as unknown[]) : [];
            }
          }

          return list.map((item) => {
            const it = item as Record<string, unknown>;
            const id = (it.id ??
              it.subCategoryId ??
              it.SubCategoryId) as unknown;
            const name = (it.name ?? it.title ?? it.label) as unknown;
            const relationId = (() => {
              const p1 = it.PlateformSubCategory as
                | Record<string, unknown>
                | undefined;
              if (p1 && typeof p1.id === "number") return p1.id;
              const p2 = it.Plateform_SubCategory as
                | Record<string, unknown>
                | undefined;
              if (p2 && typeof p2.id === "number") return p2.id;
              if (typeof it.relationId === "number")
                return it.relationId as number;
              return null;
            })();
            return {
              id: typeof id === "number" ? id : Number(id ?? 0),
              name: typeof name === "string" ? name : String(name ?? ""),
              relationId: relationId as number | null,
            };
          });
        };

        setCatRelations(normalizeCategories(catsRes));
        setSubcatRelations(normalizeSubcategories(subsRes));

        try {
          const tagCatsRes = await getTagCategoriesByPlateformApi(plateformId);
          setTagCatRelations(normalizeCategories(tagCatsRes));
        } catch {
          setTagCatRelations([]);
        }

        try {
          const creatorsRes = await getCreatorsByPlateformApi(plateformId);
          const payload =
            ((creatorsRes as any) && (creatorsRes as any).data) ?? creatorsRes;
          let list: unknown[] = [];
          if (Array.isArray(payload)) list = payload as unknown[];
          else if (Array.isArray((payload as any).creators))
            list = (payload as any).creators as unknown[];
          const normalizedCreators: RelationItem[] = list.map((item) => {
            const it = item as Record<string, unknown>;
            const id = (it.creator ? (it.creator as Record<string, unknown>).id : it.creatorId ?? it.CreatorId) as unknown;
            const creator = it.creator as Record<string, unknown> | undefined;
            const name = (creator?.name ??
              it.fullName ??
              it.username) as unknown;
            return {
              id: typeof id === "number" ? id : Number(id ?? 0),
              name: typeof name === "string" ? name : String(name ?? ""),
            };
          });

          setCreatorRelations(normalizedCreators);
        } catch {
          setCreatorRelations([]);
        }
      } catch {
        toast.error("Error loading relations");
      }
    },
    [relationMode]
  );

  useEffect(() => {
    fetchRelations(selectedPlateform);
  }, [selectedPlateform, fetchRelations]);

  // post hooks
  const { data: allPostCategories, reFetch: reFetchPostCategories } =
    useCategoryPost();
  const { data: allPostSubCategories } = useSubCategoryPost();
  const { data: allCreators, reFetch: reFetchCreators } = UseCreators();

  const handleAddCategory = async (categoryId: number) => {
    if (!selectedPlateform) return toast.error("Select a platform first");
    try {
      await addCategoryToPlateformApi(selectedPlateform, categoryId);
      toast.success("Category linked");
      reFetchCategories();
      fetchRelations(selectedPlateform);
      // setCategoryModalOpen(false);
    } catch {
      toast.error("Error adding category");
    }
  };

  // tag category linking handler
  const handleAddTagCategory = async (categoryId: number) => {
    if (!selectedPlateform) return toast.error("Select a platform first");
    try {
      await addTagCategoryToPlateformApi(selectedPlateform, categoryId);
      toast.success("Tag category linked");
      reFetchCategoriesTag();
      fetchRelations(selectedPlateform);
      // setCategoryModalOpen(false);
    } catch {
      toast.error("Error adding tag category");
    }
  };

  const handleAddPostCategory = async (categoryId: number) => {
    if (!selectedPlateform) return toast.error("Select a platform first");
    try {
      await addPostCategoryToPlateformApi(selectedPlateform, categoryId);
      toast.success("Post Category linked");
      reFetchPostCategories?.();
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error adding post category");
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

      setCategoryModalOpen(false);
      setSearch("");
    } catch (err) {
      toast.error(JSON.stringify(err));
    }
  };

  const handleCreateAndLinkTagCategory = async (name: string) => {
    if (!selectedPlateform) return toast.error("Select a platform first");
    if (!name.trim()) return toast.error("Name required");
    try {
      const res = await createTagCategoryApi({ name: name.trim() });
      const newTagCat = res.data;
      const id = newTagCat.tagCategory?.id ?? newTagCat.id ?? null;
      await handleAddTagCategory(id);
      setSearch("");
    } catch (err) {
      toast.error(JSON.stringify(err));
    }
  };

  const handleCreateAndLinkPostCategory = async (name: string) => {
    if (!selectedPlateform) return toast.error("Select a platform first");
    if (!name.trim()) return toast.error("Name required");
    try {
      const res = await createPostCategoryApi(name.trim());
      const newCat = res.data;
      const id = newCat.category?.id ?? newCat.id ?? null;
      if (!id) throw new Error("Invalid create response");
      await handleAddPostCategory(id);
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

    } catch {
      toast.error("Error adding subcategory");
    }
  };

  const handleAddPostSubcategory = async (subId: number) => {
    if (!selectedPlateform) return toast.error("Select a platform first");
    try {
      await createPlateformPostSubCategoryApi(selectedPlateform, subId);
      toast.success("Post subcategory linked");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error adding post subcategory");
    }
  };

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

  const handleRemoveTagCategory = async (categoryId: number) => {
    if (!selectedPlateform) return;
    try {
      await removeTagCategoryFromPlateformApi(selectedPlateform, categoryId);
      toast.success("Tag category removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error removing tag category");
    }
  };

  const handleRemovePostCategory = async (categoryId: number) => {
    if (!selectedPlateform) return;
    try {
      await removePostCategoryFromPlateformApi(selectedPlateform, categoryId);
      toast.success("Post Category removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error removing post category");
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

  const handleRemovePostSubcategory = async (relationId: number) => {
    try {
      await deletePlateformPostSubCategoryApi(relationId);
      toast.success("Post subcategory removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error removing post subcategory");
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

  const handleClearTagCategories = async () => {
    if (!selectedPlateform) return;
    if (!confirm("Remove all tag categories from this platform?")) return;
    try {
      await clearTagCategoriesFromPlateformApi(selectedPlateform);
      toast.success("All tag categories removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error clearing Tag categories");
    }
  };


  const handleClearSubCategories = async () => {
    if (!selectedPlateform) return;
    if (!confirm("Remove all categories from this platform?")) return;
    try {
      await clearSubCategoriesFromPlateformApi(selectedPlateform);
      toast.success("All categories removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error clearing categories");
    }
  };


  const handleClearPostCategories = async () => {
    if (!selectedPlateform) return;
    if (!confirm("Remove all post categories from this platform?")) return;
    try {
      await clearPostCategoriesFromPlateformApi(selectedPlateform);
      toast.success("All post categories removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error clearing post categories");
    }
  };

  const handleClearPostSubCategories = async () => {
    if (!selectedPlateform) return;
    if (!confirm("Remove all post subcategories from this platform?")) return;
    try {
      // new clear endpoint for post subcategories
      await clearPostSubCategoriesFromPlateformApi(selectedPlateform);
      toast.success("All post subcategories removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error clearing post subcategories");
    }
  };

  // Creator linking handlers
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);

  const handleAddCreator = async (creatorId: number) => {
    if (!selectedPlateform) return toast.error("Select a platform first");
    try {
      await addCreatorToPlateformApi(selectedPlateform, creatorId);
      toast.success("Creator linked");
      reFetchCreators?.();
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error adding creator");
    }
  };

  const handleRemoveCreator = async (creatorId: number) => {
    if (!selectedPlateform) return;
    try {
      await removeCreatorFromPlateformApi(selectedPlateform, creatorId);
      toast.success("Creator removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error removing creator");
    }
  };

  const handleClearCreators = async () => {
    if (!selectedPlateform) return;
    if (!confirm("Remove all creators from this platform?")) return;
    try {
      await clearCreatorsFromPlateformApi(selectedPlateform);
      toast.success("All creators removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error clearing creators");
    }
  };

  const videoFilteredCategories =
    allCategories?.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  console.log(allCategoriesTag);


  const videoFilteredTagCategories =
    allCategoriesTag?.items.filter((c) =>
      (c.name ?? "").toLowerCase().includes(search.toLowerCase())
    ) || [];



  const videoFilteredSubcategories =
    allSubCategories?.SubCategorys?.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const postCategoriesList = allPostCategories?.categories || [];
  const filteredCategories = (
    relationMode === "post" ? postCategoriesList : videoFilteredCategories
  ).filter((c: unknown) => {
    const cat = c as { name?: string };
    return (cat.name ?? "").toLowerCase().includes(search.toLowerCase());
  });

  const filteredTagCategories = (videoFilteredTagCategories).filter((tc: unknown) => {
    const tagcat = tc as { name?: string };
    return (tagcat.name ?? "").toLowerCase().includes(search.toLowerCase());
  });


  const postSubcategoriesList = allPostSubCategories?.subCategories || [];
  const filteredSubcategories = (
    relationMode === "post" ? postSubcategoriesList : videoFilteredSubcategories
  ).filter((s: unknown) => {
    const sub = s as { name?: string };
    return (sub.name ?? "").toLowerCase().includes(search.toLowerCase());
  });



  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-semibold mb-6 text-start">
        🧩 WebApp Relations Manager
      </h1>

      <div className="flex flex-col gap-6">
        {/* Sidebar - Platforms */}
        <div className="w-full bg-white dark:bg-gray-800 shadow rounded-xl p-4 text-gray-900 dark:text-gray-100">
          <div className="flex justify-between items-end mb-4 flex-wrap gap-3">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              WebApps
            </h2>
            <button
              onClick={() => {

                setEditingPlatform(null);
                setPlatformName("");
                setPlatformVideoSyncUrl("");
                setPlatformPostSyncUrl("");
                setPlatformModalOpen(true);
              }}
              className="text-body bg-neutral-secondary-medium rounded-lg box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading  cursor-pointer focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 mr-2 inline-block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-gray-600">add</span>
            </button>
          </div>
          <div className="flex flex-col gap-2 max-h-[70vh] overflow-auto">
            {plateforms?.map((p: Platform) => (
              <div key={p.id} className="flex justify-between items-center">
                <div className="flex gap-1 mr-2">
                  <button
                    onClick={() => {
                      setEditingPlatform(p);
                      setPlatformName(p.name);
                      setPlatformVideoSyncUrl(p.video_sync_url ?? "");
                      setPlatformPostSyncUrl(p.post_sync_url ?? "");
                      setPlatformModalOpen(true);
                    }}
                    aria-label="Edit platform"
                    className="rounded-sm cursor-pointer focus:outline-none px-3 py-2 text-sm font-medium bg-transparent"
                    style={{
                      borderStyle: "solid",
                      borderWidth: 2,
                      borderImage: "linear-gradient(90deg,#7c3aed,#ec4899) 1",
                      background: "transparent",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 inline-block text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536M4 20l6.5-1.5L20.5 8.5 17 5 4 18v2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeletePlatform(p.id)}
                    aria-label="Delete platform"
                    className="rounded-sm cursor-pointer focus:outline-none px-3 py-2 text-sm font-medium bg-transparent"
                    style={{
                      borderStyle: "solid",
                      borderWidth: 2,
                      borderImage: "linear-gradient(90deg,#ef4444,#fb923c) 1",
                      background: "transparent",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 inline-block text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                      />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => setSelectedPlateform(p.id)}
                  className={`btn btn-sm flex-1 justify-start text-nowrap relative bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 ${selectedPlateform === p.id
                    ? "bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-700"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  <span
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-yellow-500 dark:border-gray-700 bg-yellow-400 dark:bg-gray-800 shadow-lg ring-2 ring-white dark:ring-gray-900"
                    title="Theme: light/dark"
                  ></span>
                  <span className="ml-5 text-gray-800 dark:text-gray-100">
                    {p.name}
                  </span>
                </button>
              </div>
            ))}
          </div>
          {/* // Platform Modal */}
          <dialog className={`modal ${platformModalOpen ? "modal-open" : ""}`}>
            <div className="modal-box max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <h3 className="font-bold text-lg mb-3">
                {editingPlatform ? "Edit WebApp" : "Add WebApp"}
              </h3>
              <input
                type="text"
                placeholder="WebApp name"
                className="input input-bordered w-full mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                maxLength={20}
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Video sync URL"
                className="input input-bordered w-full mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={platformVideoSyncUrl}
                onChange={(e) => setPlatformVideoSyncUrl(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Post sync URL"
                className="input input-bordered w-full mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
        <div className="flex-1 bg-white dark:bg-gray-800 shadow rounded-xl p-4 w-full">
          {selectedPlateform ? (
            <>
              <div className="flex justify-center items-center mb-4 flex-wrap gap-3 w-full">
                <div className="flex gap-2 flex-wrap justify-between w-full"></div>
              </div>

              <div className="mb-4 flex gap-2">
                <button
                  className={`btn btn-sm ${relationMode === "video" ? "btn-primary" : "btn-ghost"
                    }`}
                  onClick={() => setRelationMode("video")}
                >
                  Video
                </button>
                <button
                  className={`btn btn-sm ${relationMode === "post" ? "btn-primary" : "btn-ghost"
                    }`}
                  onClick={() => setRelationMode("post")}
                >
                  Post
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setCategoryModalOpen(true)}
                      className="btn btn-sm bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 focus:ring-2 focus:ring-green-300 dark:focus:ring-green-900 border-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 mr-2 inline-block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>
                        link{" "}
                        {relationMode === "post" ? "Post Category" : "Category"}
                      </span>
                    </button>
                    <button
                      onClick={
                        relationMode === "post"
                          ? handleClearPostCategories
                          : handleClearCategories
                      }
                      className="btn btn-sm bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900 border-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 mr-2 inline-block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                        />
                      </svg>
                      <span>Clear All</span>
                    </button>
                  </div>
                  <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Linked Categories
                  </h3>
                  {catRelations.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      No categories linked
                    </p>
                  ) : (
                    catRelations.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-2 relative text-gray-800 dark:text-gray-100"
                      >
                        {/* Theme indicator node (light/dark) */}
                        <span
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-yellow-500 dark:border-gray-700 bg-yellow-400 dark:bg-gray-800 shadow-lg ring-2 ring-white dark:ring-gray-900"
                          title="Theme: light/dark"
                        ></span>
                        <span className="ml-5">{c.name}</span>
                        <button
                          onClick={() =>
                            relationMode === "post"
                              ? handleRemovePostCategory(c.id)
                              : handleRemoveCategory(c.id)
                          }
                          className="btn rounded shadow btn-sm text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSubCategoryModalOpen(true)}
                      className="btn btn-sm bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 focus:ring-2 focus:ring-green-300 dark:focus:ring-green-900 border-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 mr-2 inline-block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>
                        link{" "}
                        {relationMode === "post"
                          ? "Post Subcategory"
                          : "Subcategory"}
                      </span>
                    </button>
                    <button
                      onClick={
                        relationMode === "post"
                          ? handleClearPostSubCategories
                          : handleClearSubCategories
                      }
                      className="btn btn-sm bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900 border-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 mr-2 inline-block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                        />
                      </svg>
                      <span>Clear All</span>
                    </button>
                  </div>
                  <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Linked Subcategories
                  </h3>
                  {subcatRelations?.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      No subcategories linked
                    </p>
                  ) : (
                    subcatRelations?.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-2 relative text-gray-800 dark:text-gray-100"
                      >
                        {/* Theme indicator node (light/dark) */}
                        <span
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-yellow-500 dark:border-gray-700 bg-yellow-400 dark:bg-gray-800 shadow-lg ring-2 ring-white dark:ring-gray-900"
                          title="Theme: light/dark"
                        ></span>
                        <span className="ml-5">{s.name}</span>
                        <button
                          onClick={() => {
                            if (!s.relationId) return;
                            if (relationMode === "post")
                              return handleRemovePostSubcategory(s.relationId);
                            return handleRemoveSubcategory(s.relationId);
                          }}
                          className="btn rounded shadow btn-sm text-red-500"
                          disabled={!s.relationId}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* link tag category */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setTagCatModalOpen(true)} // -----------------------------verifié
                      className="btn btn-sm bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 focus:ring-2 focus:ring-green-300 dark:focus:ring-green-900 border-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 mr-2 inline-block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>
                        Link tag category
                      </span>
                    </button>
                    <button
                      onClick={handleClearTagCategories}
                      className="btn btn-sm bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900 border-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 mr-2 inline-block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                        />
                      </svg>
                      <span>Clear All</span>
                    </button>
                  </div>
                  <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Limk Tag category
                  </h3>
                  {relationMode === "post" ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      Tag categories are only available for video relations.
                    </p>
                  ) : (
                    tagCatRelations?.map((tc) => (
                      <div
                        key={tc.id}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-2 relative text-gray-800 dark:text-gray-100"
                      >
                        {/* Theme indicator node (light/dark) */}
                        <span
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-yellow-500 dark:border-yellow-500 bg-yellow-400 dark:bg-gray-800 shadow-lg ring-2 ring-white dark:ring-gray-900"
                          title="Theme: light/dark"
                        ></span>
                        <span className="ml-5">{tc.name}</span>
                        <button
                          onClick={() => handleRemoveTagCategory(tc.id)}
                          className="btn bg-slate-200 dark:bg-gray-700 rounded-lg shadow btn-sm text-red-600 dark:text-red-500 border border-red-500"
                          disabled={!selectedPlateform}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )
                  }
                </div>
              </div>
              {/* Creators block */}
              <div className="mt-6">
                <div className="flex gap-2 flex-wrap mb-3">
                  <button
                    onClick={() => setCreatorModalOpen(true)}
                    className="btn btn-sm bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 focus:ring-2 focus:ring-green-300 dark:focus:ring-green-900 border-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 mr-2 inline-block"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>link Creator</span>
                  </button>
                  <button
                    onClick={handleClearCreators}
                    className="btn btn-sm bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900 border-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 mr-2 inline-block"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                      />
                    </svg>
                    <span>Clear All</span>
                  </button>
                </div>
                <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Linked Creators
                </h3>
                {creatorRelations.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No creators linked
                  </p>
                ) : (
                  creatorRelations.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-2 relative text-gray-800 dark:text-gray-100"
                    >
                      <span className="ml-5">{c.name}</span>
                      <button
                        onClick={() => handleRemoveCreator(Number(c.id))}
                        className="btn rounded shadow btn-sm text-green-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
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
        <div className="modal-box max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <h3 className="font-bold text-lg mb-3">Add Category</h3>
          <input
            type="text"
            placeholder="Search category..."
            className="input input-bordered w-full mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-60 overflow-auto">
            {filteredCategories?.length === 0 && search.trim() !== "" ? (
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                <span className="italic text-gray-500 dark:text-gray-400">
                  Create new{" "}
                  {relationMode === "post" ? "post category" : "category"} "
                  {search}"
                </span>
                <button
                  onClick={() =>
                    relationMode === "post"
                      ? handleCreateAndLinkPostCategory(search)
                      : handleCreateAndLinkCategory(search)
                  }
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
                    className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 relative bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  >
                    {/* Theme indicator node (light/dark) */}
                    <span
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-yellow-500 dark:border-gray-700 bg-yellow-400 dark:bg-gray-800 shadow-lg ring-2 ring-white dark:ring-gray-900"
                      title="Theme: light/dark"
                    ></span>
                    <span className="ml-5">{cat.name}</span>
                    {isLinked ? (
                      <button className="btn btn-xs btn-disabled">
                        Linked
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          relationMode === "post"
                            ? handleAddPostCategory(cat.id)
                            : handleAddCategory(cat.id)
                        }
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

      {/* Creator Modal */}
      <dialog
        id="creatorModal"
        className={`modal ${creatorModalOpen ? "modal-open" : ""}`}
      >
        <div className="modal-box max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <h3 className="font-bold text-lg mb-3">Link Creator</h3>
          <input
            type="text"
            placeholder="Search creator..."
            className="input input-bordered w-full mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-60 overflow-auto">
            {(allCreators || []).filter((c: any) =>
              (c.name ?? "").toLowerCase().includes(search.toLowerCase())
            ).length === 0 && search.trim() !== "" ? (
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                <span className="italic text-gray-500 dark:text-gray-400">
                  No creator
                </span>
              </div>
            ) : (
              (allCreators || [])
                .filter((c: any) =>
                  (c.name ?? "").toLowerCase().includes(search.toLowerCase())
                )
                .map((creator: any) => {
                  const isLinked = creatorRelations.some(
                    (rc) => rc.id === creator.id
                  );
                  return (
                    <div
                      key={creator.id}
                      className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 relative bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    >
                      <span className="ml-5">{creator.name}</span>
                      {isLinked ? (
                        <button className="btn btn-xs btn-disabled">
                          Linked
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleAddCreator(creator.id);
                            setCreatorModalOpen(true);
                          }}
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
              onClick={() => setCreatorModalOpen(false)}
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
        <div className="modal-box max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <h3 className="font-bold text-lg mb-3">Add Subcategory</h3>
          <input
            type="text"
            placeholder="Search subcategory..."
            className="input input-bordered w-full mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-60 overflow-auto">
            {filteredSubcategories?.length === 0 && search.trim() !== "" ? (
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                <span className="italic text-gray-500 dark:text-gray-400">
                  no subcategory
                </span>
              </div>
            ) : (
              filteredSubcategories?.map((sub) => {
                const isLinked = subcatRelations.some((rs) => rs.id === sub.id);
                return (
                  <div
                    key={sub.id}
                    className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 relative bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  >
                    {/* Theme indicator node (light/dark) */}
                    <span
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-yellow-500 dark:border-gray-700 bg-yellow-400 dark:bg-gray-800 shadow-lg ring-2 ring-white dark:ring-gray-900"
                      title="Theme: light/dark"
                    ></span>
                    <span className="ml-5">{sub.name}</span>
                    {isLinked ? (
                      <button className="btn btn-xs btn-disabled">
                        Linked
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          relationMode === "post"
                            ? handleAddPostSubcategory(sub.id)
                            : handleAddSubcategory(sub.id)
                        }
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

      {/* dialog for tag category */}
      <dialog
        id="tagCatModal"
        className={`modal ${tagCatModalOpen ? "modal-open" : ""}`}
      >
        <div className="modal-box max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <h3 className="font-bold text-lg mb-3">Add Tag Category</h3>
          <input
            type="text"
            placeholder="Search category..."
            className="input input-bordered w-full mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-60 overflow-auto">
            {filteredTagCategories?.length === 0 && search.trim() !== "" ? (
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                <span className="italic text-gray-500 dark:text-gray-400">
                  Create new{" "}
                  Tag category
                  "{search}"
                </span>
                <button
                  onClick={() => handleCreateAndLinkTagCategory(search)}
                  className="btn btn-xs btn-success"
                >
                  Create & Link
                </button>
              </div>
            ) : (
              filteredTagCategories?.map((tagCat) => {
                const isLinked = tagCatRelations.some((rc) => rc.name === tagCat.name); // ca sert a verifier si la categorie est deja lié
                console.log(tagCatRelations, tagCat);
                
                return (
                  <div
                    key={tagCat.id}
                    className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 relative bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  >
                    {/* Theme indicator node (light/dark) */}
                    <span
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-yellow-500 dark:border-gray-700 bg-yellow-400 dark:bg-gray-800 shadow-lg ring-2 ring-white dark:ring-gray-900"
                      title="Theme: light/dark"
                    ></span>
                    <span className="ml-7">{tagCat.name} { `(id: ${tagCat.id}), isLinked: ${isLinked}` }</span>
                    {isLinked ? (
                      <button className="btn btn-xs btn-disabled">Linked</button>
                    ) : (
                      <button
                        onClick={() => handleAddTagCategory(tagCat.id)}
                        className="btn btn-xs btn-primary"
                      >
                        Add { `id: ${tagCat.id}` }
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="modal-action">
            <button
              onClick={() => setTagCatModalOpen(false)}
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
