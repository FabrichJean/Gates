import { useEffect, useState, useCallback } from "react";
import Pagination from "../components/Pagination";
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
import AnimatedAlert from "../components/AnimatedAlert";
import RelationListItem from "../components/RelationListItem";
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

  // Pagination for the selection modals
  const itemsPerPage = 4;
  const [categoryPage, setCategoryPage] = useState(1);
  const [tagCatPage, setTagCatPage] = useState(1);
  const [subcatPage, setSubcatPage] = useState(1);
  const [creatorPage, setCreatorPage] = useState(1);
  // modal-local filters and per-page controls
  const [categoryModalFilter, setCategoryModalFilter] = useState("");
  const [categoryModalPerPage, setCategoryModalPerPage] = useState(6);
  const [subcatModalFilter, setSubcatModalFilter] = useState("");
  const [subcatModalPerPage, setSubcatModalPerPage] = useState(6);
  const [tagCatModalFilter, setTagCatModalFilter] = useState("");
  const [tagCatModalPerPage, setTagCatModalPerPage] = useState(6);
  // pagination for linked lists (visible in main panel)
  const [linkedCatPage, setLinkedCatPage] = useState(1);
  const [linkedSubcatPage, setLinkedSubcatPage] = useState(1);
  const [linkedTagCatPage, setLinkedTagCatPage] = useState(1);
  const [linkedCreatorPage, setLinkedCreatorPage] = useState(1);

  // per-list quick filters & per-page controls for linked lists
  const [linkedCatFilter, setLinkedCatFilter] = useState("");
  const [linkedSubcatFilter, setLinkedSubcatFilter] = useState("");
  const [linkedTagCatFilter, setLinkedTagCatFilter] = useState("");
  const [linkedCreatorFilter, setLinkedCreatorFilter] = useState("");

  const [linkedCatPerPage, setLinkedCatPerPage] = useState(5);
  const [linkedSubcatPerPage, setLinkedSubcatPerPage] = useState(5);
  const [linkedTagCatPerPage, setLinkedTagCatPerPage] = useState(5);
  const [linkedCreatorPerPage, setLinkedCreatorPerPage] = useState(5);

  // reset pagination when search changes to keep UI on first page
  useEffect(() => {
    setCategoryPage(1);
    setTagCatPage(1);
    setSubcatPage(1);
    setCreatorPage(1);
  }, [search]);


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
  const handleDeletePlatform = (id: number) => {
    openConfirm({
      title: "Delete platform",
      message: "Are you sure you want to delete this platform?",
      type: "error",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
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
      },
    });
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

  // Reset linked-list pages when platform changes
  useEffect(() => {
    setLinkedCatPage(1);
    setLinkedSubcatPage(1);
    setLinkedTagCatPage(1);
    setLinkedCreatorPage(1);
  }, [selectedPlateform]);

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

  const handleClearCategories = () => {
    if (!selectedPlateform) return;
    openConfirm({
      title: "Clear categories",
      message: "Remove all categories from this platform?",
      type: "warning",
      onConfirm: async () => {
        try {
          await clearCategoriesFromPlateformApi(selectedPlateform);
          toast.success("All categories removed");
          fetchRelations(selectedPlateform);
        } catch {
          toast.error("Error clearing categories");
        }
      },
    });
  };

  const handleClearTagCategories = () => {
    if (!selectedPlateform) return;
    openConfirm({
      title: "Clear tag categories",
      message: "Remove all tag categories from this platform?",
      type: "warning",
      onConfirm: async () => {
        try {
          await clearTagCategoriesFromPlateformApi(selectedPlateform);
          toast.success("All tag categories removed");
          fetchRelations(selectedPlateform);
        } catch {
          toast.error("Error clearing Tag categories");
        }
      },
    });
  };


  const handleClearSubCategories = () => {
    if (!selectedPlateform) return;
    openConfirm({
      title: "Clear subcategories",
      message: "Remove all subcategories from this platform?",
      type: "warning",
      onConfirm: async () => {
        try {
          await clearSubCategoriesFromPlateformApi(selectedPlateform);
          toast.success("All categories removed");
          fetchRelations(selectedPlateform);
        } catch {
          toast.error("Error clearing categories");
        }
      },
    });
  };


  const handleClearPostCategories = () => {
    if (!selectedPlateform) return;
    openConfirm({
      title: "Clear post categories",
      message: "Remove all post categories from this platform?",
      type: "warning",
      onConfirm: async () => {
        try {
          await clearPostCategoriesFromPlateformApi(selectedPlateform);
          toast.success("All post categories removed");
          fetchRelations(selectedPlateform);
        } catch {
          toast.error("Error clearing post categories");
        }
      },
    });
  };

  const handleClearPostSubCategories = () => {
    if (!selectedPlateform) return;
    openConfirm({
      title: "Clear post subcategories",
      message: "Remove all post subcategories from this platform?",
      type: "warning",
      onConfirm: async () => {
        try {
          // new clear endpoint for post subcategories
          await clearPostSubCategoriesFromPlateformApi(selectedPlateform);
          toast.success("All post subcategories removed");
          fetchRelations(selectedPlateform);
        } catch {
          toast.error("Error clearing post subcategories");
        }
      },
    });
  };

  // Creator linking handlers
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);

  // AnimatedAlert state (replacement for window.confirm)
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "warning" | "info" | "success">("warning");
  const [alertOnConfirm, setAlertOnConfirm] = useState<(() => void) | undefined>(undefined);
  const [alertConfirmText, setAlertConfirmText] = useState("OK");
  const [alertCancelText, setAlertCancelText] = useState("Cancel");

  const openConfirm = (opts: {
    title?: string;
    message: string;
    type?: "error" | "warning" | "info" | "success";
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => {
    setAlertTitle(opts.title ?? "Are you sure?");
    setAlertMessage(opts.message);
    setAlertType(opts.type ?? "warning");
    setAlertOnConfirm(() => opts.onConfirm);
    setAlertConfirmText(opts.confirmText ?? "OK");
    setAlertCancelText(opts.cancelText ?? "Cancel");
    setAlertOpen(true);
  };

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

  const handleClearCreators = () => {
    if (!selectedPlateform) return;
    openConfirm({
      title: "Clear creators",
      message: "Remove all creators from this platform?",
      type: "warning",
      onConfirm: async () => {
        try {
          await clearCreatorsFromPlateformApi(selectedPlateform);
          toast.success("All creators removed");
          fetchRelations(selectedPlateform);
        } catch {
          toast.error("Error clearing creators");
        }
      },
    });
  };

  const videoFilteredCategories =
    allCategories?.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    ) || [];


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
              className="text-gray-700 dark:text-gray-200 bg-neutral-secondary-medium rounded-lg box-border border border-blue-400 dark:border-blue-400 hover:bg-neutral-tertiary-medium hover:text-heading  cursor-pointer focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
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
              <span>add</span>
            </button>
          </div>
          <div className="flex flex-col gap-3 max-h-[70vh] overflow-auto">
            {plateforms?.map((p: Platform) => {
              const isSelected = selectedPlateform === p.id;
              return (
                <div key={p.id} className={`w-full`}> 
                  <div
                  onClick={() => setSelectedPlateform(p.id)}
                    className={`flex items-center justify-between p-3 rounded-lg transition-shadow border cursor-pointer ${isSelected ? 'border-indigo-300 bg-indigo-50 shadow-md' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'} hover:shadow-sm`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center text-indigo-700 dark:text-indigo-200 font-semibold">
                        {p.name?.charAt(0)?.toUpperCase() ?? "#"}
                      </div>

                      <div className="min-w-0" >
                        <button
                          onClick={() => setSelectedPlateform(p.id)}
                          className="text-left w-full cursor-pointer"
                          aria-label={`Select ${p.name}`}>
                          <div className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-700' : 'text-gray-800 dark:text-gray-100'}`}>{p.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.video_sync_url || p.post_sync_url ? 'sync configured' : 'no sync configured'}</div>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPlatform(p);
                          setPlatformName(p.name);
                          setPlatformVideoSyncUrl(p.video_sync_url ?? "");
                          setPlatformPostSyncUrl(p.post_sync_url ?? "");
                          setPlatformModalOpen(true);
                        }}
                        aria-label={`Edit ${p.name}`}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 18.55 2.8a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleDeletePlatform(p.id)}
                        aria-label={`Delete ${p.name}`}
                        className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9M6 7h12M9 7V4h6v3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                className="input w-full mb-3 bg-white border border-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                maxLength={20}
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Video sync URL"
                className="input  border border-gray-300 w-full mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={platformVideoSyncUrl}
                onChange={(e) => setPlatformVideoSyncUrl(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Post sync URL"
                className="input  border border-gray-300 w-full mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={platformPostSyncUrl}
                onChange={(e) => setPlatformPostSyncUrl(e.target.value)}
                required
              />
              <div className="modal-action">
                <button
                  onClick={() => setPlatformModalOpen(false)}
                  className="px-3 py-1 rounded-sm bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Close
                </button>
                <button
                  onClick={handleSavePlatform}
                  className="px-3 py-1 rounded-sm bg-blue-600 text-white cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-500"
                >
                  {editingPlatform ? "Save" : "+ Add"}
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

              <div className="mb-2 flex gap-2">
                <button
                  type="button"
                  className={`px-4 font-bold py-1 cursor-pointer text-gray-700 dark:text-gray-200 ${relationMode === "video" ? "border-b-2 border-purple-700 text-purple-500" : "border-transparent"
                    }`}
                  onClick={() => setRelationMode("video")}
                >
                  Video
                </button>
                <button
                  type="button"
                  className={`px-4 font-bold py-1 cursor-pointer text-gray-700 dark:text-gray-200 ${relationMode === "post" ? "border-b-2 border-purple-700 text-purple-500" : "border-transparent"
                    }`}
                  onClick={() => setRelationMode("post")}
                >
                  Post
                </button>
              </div>
              <div className="border border-slate-100 dark:border-gray-700 mb-5"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <fieldset className="flex flex-col gap-3 rounded-lg border border-gray-300 dark:border-gray-600 p-3">
                  <legend className="font-medium px-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    Linked Categories
                  </legend>

                  <div className="flex flex-wrap gap-2 justify-between">
                    <button
                      onClick={() => {
                        setCategoryModalOpen(true);
                        setCategoryPage(1);
                      }}
                      className="font-medium rounded-md px-3 py-1 bg-transparent text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-shadow"
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>
                        link {relationMode === "post" ? "Post Category" : "Category"}
                      </span>
                    </button>

                    <button
                      onClick={
                        relationMode === "post"
                          ? handleClearPostCategories
                          : handleClearCategories
                      }
                      className="font-medium rounded-md px-3 py-1 bg-transparent text-red-500 border border-gray-100 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-shadow"
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

                  <div className="flex items-center gap-2 my-3">
                    <input
                      type="text"
                      placeholder="Filter linked categories..."
                      className="input input-sm border w-full max-w-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={linkedCatFilter}
                      onChange={(e) => {
                        setLinkedCatFilter(e.target.value);
                        setLinkedCatPage(1);
                      }}
                    />

                    <select
                      value={linkedCatPerPage}
                      onChange={(e) => {
                        setLinkedCatPerPage(Number(e.target.value));
                        setLinkedCatPage(1);
                      }}
                      className="select select-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value={5}>5 / page</option>
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                    </select>
                  </div>

                  {catRelations.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      No categories linked
                    </p>
                  ) : (
                    (() => {
                      const filtered = catRelations.filter((c) => (c.name ?? "").toLowerCase().includes(linkedCatFilter.toLowerCase()));
                      const start = (linkedCatPage - 1) * linkedCatPerPage;
                      const pageItems = filtered.slice(start, start + linkedCatPerPage);
                      return (
                        <>
                          {pageItems.map((c) => (
                                <RelationListItem
                                  key={c.id}
                                  id={c.id}
                                  name={c.name ?? ""}
                                  onRemove={() =>
                                    openConfirm({
                                      title: "Remove category",
                                      message: `Remove category \"${c.name ?? ""}\" from this platform?`,
                                      type: "warning",
                                      confirmText: "Remove",
                                      cancelText: "Cancel",
                                      onConfirm: async () => {
                                        if (relationMode === "post")
                                          await handleRemovePostCategory(c.id);
                                        else await handleRemoveCategory(c.id);
                                      },
                                    })
                                  }
                                  styleType="card"
                                />
                          ))}

                            <div className="mt-2">
                            <Pagination
                              totalItems={filtered.length}
                              pageSize={linkedCatPerPage}
                              currentPage={linkedCatPage}
                              onPageChange={(p) => setLinkedCatPage(p)}
                            />
                          </div>
                        </>
                      );
                    })()
                  )}
                </fieldset>


                <fieldset className="flex flex-col gap-3 rounded-lg border border-gray-300 dark:border-gray-600 p-3">
                  <legend className="font-medium px-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    Linked Subcategories
                  </legend>

                  <div className="flex gap-2 flex-wrap justify-between">
                    <button
                      onClick={() => {
                        setSubCategoryModalOpen(true);
                        setSubcatPage(1);
                      }}
                      className="font-medium rounded-md px-3 py-1 bg-transparent text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-shadow"
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
                      className="font-light rounded-sm px-3 py-1 bg-transparent text-red-500 border border-gray-100 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-shadow"
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

                  {subcatRelations?.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No subcategories linked</p>
                  ) : (
                    (() => {
                      const filtered = (subcatRelations ?? []).filter((s) => (s.name ?? "").toLowerCase().includes(linkedSubcatFilter.toLowerCase()));
                      const start = (linkedSubcatPage - 1) * linkedSubcatPerPage;
                      const pageItems = filtered.slice(start, start + linkedSubcatPerPage);
                      return (
                        <>
                          {pageItems.map((s) => (
                            <RelationListItem
                              key={s.id}
                              id={s.id}
                              name={s.name ?? ""}
                              onRemove={() => {
                                if (!s.relationId) return;
                                openConfirm({
                                  title: "Remove subcategory",
                                  message: `Remove subcategory \"${s.name ?? ""}\" from this platform?`,
                                  type: "warning",
                                  confirmText: "Remove",
                                  cancelText: "Cancel",
                                  onConfirm: async () => {
                                    if (relationMode === "post")
                                      await handleRemovePostSubcategory(s.relationId!);
                                    else await handleRemoveSubcategory(s.relationId!);
                                  },
                                });
                              }}
                              styleType="card"
                            />
                          ))}

                          <div className="mt-2">
                            <Pagination
                              totalItems={filtered.length}
                              pageSize={linkedSubcatPerPage}
                              currentPage={linkedSubcatPage}
                              onPageChange={(p) => setLinkedSubcatPage(p)}
                            />
                          </div>
                        </>
                      );
                    })()
                  )}
                </fieldset>


                {/* link tag category */}
                {
                  relationMode === "video" && (
                    <fieldset className="flex flex-col gap-3 rounded-lg border border-gray-300 dark:border-gray-600 p-3">
                      <legend className="font-medium px-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                        Linked Tag Category
                      </legend>

                      <div className="flex gap-2 flex-wrap justify-between">
                        <button
                          onClick={() => {
                            setTagCatModalOpen(true);
                            setTagCatPage(1);
                          }}
                          className="font-light rounded-sm px-3 py-1 bg-transparent text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-shadow"
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Link tag category</span>
                        </button>

                        <button
                          onClick={handleClearTagCategories}
                          className="font-light rounded-sm px-3 py-1 bg-transparent text-red-500 border border-gray-100 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-shadow"
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

                          <div className="flex items-center gap-2 my-3">
                            <input
                              type="text"
                              placeholder="Filter linked tag categories..."
                              className="input input-sm border w-full max-w-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              value={linkedTagCatFilter}
                              onChange={(e) => {
                                setLinkedTagCatFilter(e.target.value);
                                setLinkedTagCatPage(1);
                              }}
                            />

                            <select
                              value={linkedTagCatPerPage}
                              onChange={(e) => {
                                setLinkedTagCatPerPage(Number(e.target.value));
                                setLinkedTagCatPage(1);
                              }}
                              className="select select-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              <option value={5}>5 / page</option>
                              <option value={10}>10 / page</option>
                              <option value={20}>20 / page</option>
                            </select>
                          </div>

                          {(() => {
                            const filtered = (tagCatRelations ?? []).filter((t) => (t.name ?? "").toLowerCase().includes(linkedTagCatFilter.toLowerCase()));
                            const start = (linkedTagCatPage - 1) * linkedTagCatPerPage;
                            const pageItems = filtered.slice(start, start + linkedTagCatPerPage);
                            return (
                              <>
                                {pageItems.map((tc) => (
                              <RelationListItem
                                key={tc.id}
                                id={tc.id}
                                name={tc.name ?? ""}
                                onRemove={() =>
                                  openConfirm({
                                    title: "Remove tag category",
                                    message: `Remove tag category \"${tc.name ?? ""}\" from this platform?`,
                                    type: "warning",
                                    confirmText: "Remove",
                                    cancelText: "Cancel",
                                    onConfirm: async () => {
                                      await handleRemoveTagCategory(tc.id);
                                    },
                                  })
                                }
                                disabled={!selectedPlateform}
                                styleType="card"
                              />
                            ))}

                            <div className="mt-2">
                              <Pagination
                                totalItems={tagCatRelations?.length ?? 0}
                                pageSize={itemsPerPage}
                                currentPage={linkedTagCatPage}
                                onPageChange={(p) => setLinkedTagCatPage(p)}
                              />
                            </div>
                          </>
                        );
                      })()}
                    </fieldset>
                  )
                }
                <fieldset className="flex flex-col gap-3 rounded-lg border border-gray-300 dark:border-gray-600 p-3">
                  <legend className="font-medium px-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    Linked Creators
                  </legend>

                  <div className="flex gap-2 flex-wrap mb-3 justify-between">
                    <button
                      onClick={() => {
                        setCreatorModalOpen(true);
                        setCreatorPage(1);
                      }}
                      className="font-light rounded-sm px-3 py-1 bg-transparent text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-shadow"
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>link Creator</span>
                    </button>

                    <button
                      onClick={handleClearCreators}
                      className="font-light rounded-sm px-3 py-1 bg-transparent text-red-500 border border-gray-100 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-shadow"
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

                  <div className="flex items-center gap-2 my-3">
                    <input
                      type="text"
                      placeholder="Filter linked creators..."
                      className="input input-sm border w-full max-w-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={linkedCreatorFilter}
                      onChange={(e) => {
                        setLinkedCreatorFilter(e.target.value);
                        setLinkedCreatorPage(1);
                      }}
                    />

                    <select
                      value={linkedCreatorPerPage}
                      onChange={(e) => {
                        setLinkedCreatorPerPage(Number(e.target.value));
                        setLinkedCreatorPage(1);
                      }}
                      className="select select-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value={5}>5 / page</option>
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                    </select>
                  </div>

                  {creatorRelations.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No creators linked</p>
                  ) : (
                    (() => {
                      const filtered = creatorRelations.filter((c) => (c.name ?? "").toLowerCase().includes(linkedCreatorFilter.toLowerCase()));
                      const start = (linkedCreatorPage - 1) * linkedCreatorPerPage;
                      const pageItems = filtered.slice(start, start + linkedCreatorPerPage);
                      return (
                        <>
                          {pageItems.map((c) => (
                            <RelationListItem
                              key={c.id}
                              id={c.id}
                              name={c.name ?? ""}
                              onRemove={() =>
                                openConfirm({
                                  title: "Remove creator",
                                  message: `Remove creator \"${c.name ?? ""}\" from this platform?`,
                                  type: "warning",
                                  confirmText: "Remove",
                                  cancelText: "Cancel",
                                  onConfirm: async () => {
                                    await handleRemoveCreator(Number(c.id));
                                  },
                                })
                              }
                              styleType="card"
                            />
                          ))}

                          <div className="mt-2">
                            <Pagination
                              totalItems={filtered.length}
                              pageSize={linkedCreatorPerPage}
                              currentPage={linkedCreatorPage}
                              onPageChange={(p) => setLinkedCreatorPage(p)}
                            />
                          </div>
                        </>
                      );
                    })()
                  )}
                </fieldset>

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
          {/* keep search but clear modal-local filters when global search changes */}
          <div style={{ display: "none" }} aria-hidden>
            {search}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Filter..."
              className="input input-sm border w-full max-w-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={categoryModalFilter}
              onChange={(e) => {
                setCategoryModalFilter(e.target.value);
                setCategoryPage(1);
              }}
            />
            <select
              value={categoryModalPerPage}
              onChange={(e) => {
                setCategoryModalPerPage(Number(e.target.value));
                setCategoryPage(1);
              }}
              className="select select-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value={6}>6 / page</option>
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
            </select>
          </div>

          <div className="max-h-60 overflow-auto">
            {(() => {
              const base = filteredCategories ?? [];
              const combined = base.filter((c: any) => (c.name ?? "").toLowerCase().includes(categoryModalFilter.toLowerCase()));
              if (combined.length === 0 && search.trim() !== "") {
                return (
                  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                    <span className="italic text-gray-500 dark:text-gray-400">
                      Create new {relationMode === "post" ? "post category" : "category"} "{search}"
                    </span>
                    <button
                      onClick={() => (relationMode === "post" ? handleCreateAndLinkPostCategory(search) : handleCreateAndLinkCategory(search))}
                      className="btn btn-xs btn-success"
                    >
                      Create & Link
                    </button>
                  </div>
                );
              }

              const start = (categoryPage - 1) * categoryModalPerPage;
              const pageItems = combined.slice(start, start + categoryModalPerPage);
              return (
                <>
                  {pageItems.map((cat: any) => {
                    const isLinked = catRelations.some((rc) => rc.id === cat.id);
                    return (
                      <RelationListItem
                        key={cat.id}
                        id={cat.id}
                        name={cat.name ?? ""}
                        linked={isLinked}
                        onAdd={!isLinked ? () => (relationMode === "post" ? handleAddPostCategory(cat.id) : handleAddCategory(cat.id)) : undefined}
                        styleType="card"
                      />
                    );
                  })}

                  <div className="mt-2">
                    <Pagination totalItems={combined.length} pageSize={categoryModalPerPage} currentPage={categoryPage} onPageChange={(p) => setCategoryPage(p)} />
                  </div>
                </>
              );
            })()}
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
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Filter..."
              className="input input-sm border w-full max-w-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={categoryModalFilter}
              onChange={(e) => {
                setCategoryModalFilter(e.target.value);
                setCreatorPage(1);
              }}
            />
            <select
              value={categoryModalPerPage}
              onChange={(e) => {
                setCategoryModalPerPage(Number(e.target.value));
                setCreatorPage(1);
              }}
              className="select select-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value={6}>6 / page</option>
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
            </select>
          </div>

          <div className="max-h-60 overflow-auto">
            {(() => {
              const filtered = (allCreators || []).filter((c: any) =>
                (c.name ?? "").toLowerCase().includes(search.toLowerCase())
              );
              if (filtered.length === 0 && search.trim() !== "") {
                return (
                  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                    <span className="italic text-gray-500 dark:text-gray-400">No creator</span>
                  </div>
                );
              }

              const start = (creatorPage - 1) * itemsPerPage;
              const pageItems = filtered.slice(start, start + itemsPerPage);

              return (
                <>
                  {pageItems.map((creator: any) => {
                    const isLinked = creatorRelations.some((rc) => rc.id === creator.id);
                    return (
                      <RelationListItem
                        key={creator.id}
                        id={creator.id}
                        name={creator.name ?? ""}
                        linked={isLinked}
                        onAdd={!isLinked ? () => handleAddCreator(creator.id) : undefined}
                        styleType="card"
                      />
                    );
                  })}

                  <div className="mt-2">
                    <Pagination
                      totalItems={filtered.length}
                      pageSize={itemsPerPage}
                      currentPage={creatorPage}
                      onPageChange={(p) => setCreatorPage(p)}
                    />
                  </div>
                </>
              );
            })()}
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
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Filter..."
              className="input input-sm border w-full max-w-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={subcatModalFilter}
              onChange={(e) => {
                setSubcatModalFilter(e.target.value);
                setSubcatPage(1);
              }}
            />
            <select
              value={subcatModalPerPage}
              onChange={(e) => {
                setSubcatModalPerPage(Number(e.target.value));
                setSubcatPage(1);
              }}
              className="select select-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value={6}>6 / page</option>
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
            </select>
          </div>

          <div className="max-h-60 overflow-auto">
            {(() => {
              const base = filteredSubcategories ?? [];
              const combined = base.filter((s: any) => (s.name ?? "").toLowerCase().includes(subcatModalFilter.toLowerCase()));
              if (combined.length === 0 && search.trim() !== "") {
                return (
                  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                    <span className="italic text-gray-500 dark:text-gray-400">no subcategory</span>
                  </div>
                );
              }

              const start = (subcatPage - 1) * subcatModalPerPage;
              const pageItems = combined.slice(start, start + subcatModalPerPage);
              return (
                <>
                  {pageItems.map((sub: any) => {
                    const isLinked = subcatRelations.some((rs) => rs.id === sub.id);
                    return (
                      <RelationListItem
                        key={sub.id}
                        id={sub.id}
                        name={sub.name ?? ""}
                        linked={isLinked}
                        onAdd={!isLinked ? () => (relationMode === "post" ? handleAddPostSubcategory(sub.id) : handleAddSubcategory(sub.id)) : undefined}
                        styleType="card"
                      />
                    );
                  })}

                  <div className="mt-2">
                    <Pagination totalItems={combined.length} pageSize={subcatModalPerPage} currentPage={subcatPage} onPageChange={(p) => setSubcatPage(p)} />
                  </div>
                </>
              );
            })()}
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
                  Create new Tag category "{search}"
                </span>
                <button
                  onClick={() => handleCreateAndLinkTagCategory(search)}
                  className="btn btn-xs btn-success"
                >
                  Create & Link
                </button>
              </div>
            ) : (
              <>
                  {(() => {
                    const start = (tagCatPage - 1) * itemsPerPage;
                    const pageItems = (filteredTagCategories ?? []).slice(
                      start,
                      start + itemsPerPage
                    );
                    return pageItems.map((tagCat) => {
                      const isLinked = tagCatRelations.some((rc) => rc.name === tagCat.name);

                      return (
                        <RelationListItem
                          key={tagCat.id}
                          id={tagCat.id}
                          name={tagCat.name ?? ""}
                          linked={isLinked}
                          onAdd={!isLinked ? () => handleAddTagCategory(tagCat.id) : undefined}
                          styleType="pill"
                          variant="tag"
                        />
                      );
                    });
                  })()}

                <div className="mt-2">
                  <Pagination
                    totalItems={filteredTagCategories?.length ?? 0}
                    pageSize={itemsPerPage}
                    currentPage={tagCatPage}
                    onPageChange={(p) => setTagCatPage(p)}
                  />
                </div>
              </>
            )}
          </div>
          <div className="modal-action">
            <button
              onClick={() => setTagCatModalOpen(false)}
              className="text-red-500 dark:text-pink-500 rounded-lg cursor-pointer bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
      <AnimatedAlert
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onConfirm={alertOnConfirm}
        confirmText={alertConfirmText}
        cancelText={alertCancelText}
      />
    </div>
  );
}