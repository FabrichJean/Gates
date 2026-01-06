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

// Types
type RelationItem = { id: number; name?: string; relationId?: number | null };
type Platform = { id: number; name: string; video_sync_url?: string; post_sync_url?: string };

// Icones SVG
const Icons = {
  plus: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  ),
  trash: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  close: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  empty: (
    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6h17.138l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V19.5a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V9.776m-16.5 0A2.25 2.25 0 0 0 3.75 7.5h16.5a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 21.75 4.5H3.75A2.25 2.25 0 0 0 1.5 6.75v.024a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
};

export default function PlateformRelationsManager() {
  const { data: plateforms, reFetch: reFetchPlateform } = UsePlateform();
  const [selectedPlateform, setSelectedPlateform] = useState<number | null>(
    plateforms?.length ? plateforms[0].id : null
  );

  const { data: allCategories, reFetch: reFetchCategories } = UseCategory();
  const { data: allCategoriesTag, reFetch: reFetchCategoriesTag } = useTagVideoCategory();
  const { data: allSubCategories } = UseSubCategory();

  const [catRelations, setCatRelations] = useState<RelationItem[]>([]);
  const [tagCatRelations, setTagCatRelations] = useState<RelationItem[]>([]);
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

  // Post hooks
  const { data: allPostCategories, reFetch: reFetchPostCategories } = useCategoryPost();
  const { data: allPostSubCategories } = useSubCategoryPost();
  const { data: allCreators, reFetch: reFetchCreators } = UseCreators();

  const [creatorModalOpen, setCreatorModalOpen] = useState(false);

  const fetchPlatforms = async () => reFetchPlateform();

  const handleSavePlatform = async () => {
    if (!platformName.trim()) return toast.error("Enter a platform name");
    const isValidUrl = (u: string) => {
      if (!u) return true;
      try { new URL(u); return true; } catch { return false; }
    };

    if (!isValidUrl(platformVideoSyncUrl)) return toast.error("Invalid Video sync URL");
    if (!isValidUrl(platformPostSyncUrl)) return toast.error("Invalid Post sync URL");

    try {
      const payload: any = { name: platformName };
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

  const fetchRelations = useCallback(async (plateformId: number | null) => {
    if (!plateformId) return;
    try {
      const [catsRes, subsRes] = relationMode === "post"
        ? await Promise.all([getPostCategoriesByPlateformApi(plateformId), getPostSubCategoriesForPlateformApi(plateformId)])
        : await Promise.all([getCategoriesByPlateformApi(plateformId), getSubCategoriesForPlateformApi(plateformId)]);

      const normalizeCategories = (res: unknown): RelationItem[] => {
        const payload = ((res as any)?.data) ?? res;
        let list: unknown[] = [];
        if (Array.isArray(payload)) list = payload;
        else {
          const p = payload as Record<string, unknown>;
          if (Array.isArray(p["Categories"])) list = p["Categories"] as unknown[];
          else if (Array.isArray(p["Categorys"])) list = p["Categorys"] as unknown[];
          else if (Array.isArray(p["categories"])) list = p["categories"] as unknown[];
          else {
            const arr = Object.values(p).find((v) => Array.isArray(v));
            list = Array.isArray(arr) ? arr : [];
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
        const payload = ((res as any)?.data) ?? res;
        let list: unknown[] = [];
        if (Array.isArray(payload)) list = payload;
        else {
          const p = payload as Record<string, unknown>;
          if (Array.isArray(p["SubCategorys"])) list = p["SubCategorys"] as unknown[];
          else if (Array.isArray(p["subcategories"])) list = p["subcategories"] as unknown[];
          else if (Array.isArray(p["SubCategories"])) list = p["SubCategories"] as unknown[];
          else {
            const arr = Object.values(p).find((v) => Array.isArray(v));
            list = Array.isArray(arr) ? arr : [];
          }
        }

        return list.map((item) => {
          const it = item as Record<string, unknown>;
          const id = (it.id ?? it.subCategoryId ?? it.SubCategoryId) as unknown;
          const name = (it.name ?? it.title ?? it.label) as unknown;
          const relationId = (() => {
            const p1 = it.PlateformSubCategory as Record<string, unknown> | undefined;
            if (p1 && typeof p1.id === "number") return p1.id;
            const p2 = it.Plateform_SubCategory as Record<string, unknown> | undefined;
            if (p2 && typeof p2.id === "number") return p2.id;
            if (typeof it.relationId === "number") return it.relationId as number;
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
        const payload = (creatorsRes as any)?.data ?? creatorsRes;
        let list: unknown[] = [];
        if (Array.isArray(payload)) list = payload;
        else if (Array.isArray((payload as any).creators)) list = (payload as any).creators;
        
        const normalizedCreators: RelationItem[] = list.map((item) => {
          const it = item as Record<string, unknown>;
          const id = (it.creator ? (it.creator as Record<string, unknown>).id : it.creatorId ?? it.CreatorId) as unknown;
          const creator = it.creator as Record<string, unknown> | undefined;
          const name = (creator?.name ?? it.fullName ?? it.username) as unknown;
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
  }, [relationMode]);

  useEffect(() => {
    fetchRelations(selectedPlateform);
  }, [selectedPlateform, fetchRelations]);

  // Handlers pour les catégories
  const handleAddCategory = async (categoryId: number) => {
    if (!selectedPlateform) return toast.error("Select a platform first");
    try {
      await addCategoryToPlateformApi(selectedPlateform, categoryId);
      toast.success("Category linked");
      reFetchCategories();
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error adding category");
    }
  };

  const handleAddTagCategory = async (categoryId: number) => {
    if (!selectedPlateform) return toast.error("Select a platform first");
    try {
      await addTagCategoryToPlateformApi(selectedPlateform, categoryId);
      toast.success("Tag category linked");
      reFetchCategoriesTag();
      fetchRelations(selectedPlateform);
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

  // Handlers pour les sous-catégories
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

  // Handlers pour la suppression
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

  // Handlers pour les clear all
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
    if (!confirm("Remove all subcategories from this platform?")) return;
    try {
      await clearSubCategoriesFromPlateformApi(selectedPlateform);
      toast.success("All subcategories removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error clearing subcategories");
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
      await clearPostSubCategoriesFromPlateformApi(selectedPlateform);
      toast.success("All post subcategories removed");
      fetchRelations(selectedPlateform);
    } catch {
      toast.error("Error clearing post subcategories");
    }
  };

  // Handlers pour les créateurs
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

  // Filtrage des données
  const videoFilteredCategories = allCategories?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const videoFilteredTagCategories = allCategoriesTag?.items.filter((c) =>
    (c.name ?? "").toLowerCase().includes(search.toLowerCase())
  ) || [];

  const videoFilteredSubcategories = allSubCategories?.SubCategorys?.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const postCategoriesList = allPostCategories?.categories || [];
  const filteredCategories = (
    relationMode === "post" ? postCategoriesList : videoFilteredCategories
  ).filter((c: unknown) => {
    const cat = c as { name?: string };
    return (cat.name ?? "").toLowerCase().includes(search.toLowerCase());
  });

  const filteredTagCategories = videoFilteredTagCategories.filter((tc: unknown) => {
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

  // Composants UI réutilisables
  const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );

  const Button = ({ 
    children, 
    onClick, 
    variant = "primary", 
    size = "md", 
    icon, 
    disabled = false,
    className = ""
  }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    variant?: "primary" | "secondary" | "danger" | "ghost"; 
    size?: "sm" | "md" | "lg";
    icon?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
      secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white focus:ring-gray-500",
      danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 focus:ring-gray-500"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  };

  const EmptyState = ({ message, icon }: { message: string; icon?: React.ReactNode }) => (
    <div className="text-center py-12">
      {icon || Icons.empty}
      <p className="mt-4 text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );

  const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children,
    size = "md"
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
  }) => {
    const sizes = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl"
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 bg-opacity-50 backdrop-blur-sm">
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {Icons.close}
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const SearchInput = ({ 
    placeholder, 
    value, 
    onChange 
  }: { 
    placeholder: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );

  const TabButton = ({ 
    active, 
    onClick, 
    children 
  }: { 
    active: boolean; 
    onClick: () => void; 
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        active
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );

  const RelationCard = ({ 
    title, 
    count,
    onAdd, 
    onClear, 
    children,
    addLabel = "Add",
    clearLabel = "Clear All"
  }: { 
    title: string;
    count?: number;
    onAdd: () => void; 
    onClear: () => void; 
    children: React.ReactNode;
    addLabel?: string;
    clearLabel?: string;
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {count !== undefined && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{count} items</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onAdd} icon={Icons.plus}>
            {addLabel}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear}>
            {clearLabel}
          </Button>
        </div>
      </div>
      {children}
    </Card>
  );

  const RelationItem = ({ 
    name, 
    onRemove,
    indicatorColor = "bg-blue-500"
  }: { 
    name: string; 
    onRemove: () => void;
    indicatorColor?: string;
  }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${indicatorColor}`}></div>
        <span className="text-gray-900 dark:text-white font-medium">{name}</span>
      </div>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-all"
      >
        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Platform Relations Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage relationships between platforms, categories, and creators
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Platforms */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Platforms
                </h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingPlatform(null);
                    setPlatformName("");
                    setPlatformVideoSyncUrl("");
                    setPlatformPostSyncUrl("");
                    setPlatformModalOpen(true);
                  }}
                  icon={Icons.plus}
                >
                  New Platform
                </Button>
              </div>

              <div className="space-y-2">
                {plateforms?.map((p: Platform) => (
                  <div
                    key={p.id}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      selectedPlateform === p.id
                        ? "bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setSelectedPlateform(p.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          selectedPlateform === p.id ? "bg-blue-600" : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {p.name}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPlatform(p);
                          setPlatformName(p.name);
                          setPlatformVideoSyncUrl(p.video_sync_url ?? "");
                          setPlatformPostSyncUrl(p.post_sync_url ?? "");
                          setPlatformModalOpen(true);
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {Icons.edit}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlatform(p.id);
                        }}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        {Icons.trash}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedPlateform ? (
              <div className="space-y-6">
                {/* Mode Tabs */}
                <Card className="p-4">
                  <div className="flex gap-2">
                    <TabButton
                      active={relationMode === "video"}
                      onClick={() => setRelationMode("video")}
                    >
                      Video Relations
                    </TabButton>
                    <TabButton
                      active={relationMode === "post"}
                      onClick={() => setRelationMode("post")}
                    >
                      Post Relations
                    </TabButton>
                  </div>
                </Card>

                {/* Relations Grid */}
                <div className={`grid grid-cols-1 ${relationMode === "post" ? "lg:grid-cols-2" : "lg:grid-cols-3"} gap-6`}>
                  {/* Categories */}
                  <RelationCard
                    title={relationMode === "post" ? "Post Categories" : "Categories"}
                    count={catRelations.length}
                    onAdd={() => setCategoryModalOpen(true)}
                    onClear={relationMode === "post" ? handleClearPostCategories : handleClearCategories}
                  >
                    {catRelations.length === 0 ? (
                      <EmptyState message="No categories linked" />
                    ) : (
                      <div className="space-y-2">
                        {catRelations.map((c) => (
                          <RelationItem
                            key={c.id}
                            name={c.name}
                            onRemove={() =>
                              relationMode === "post"
                                ? handleRemovePostCategory(c.id)
                                : handleRemoveCategory(c.id)
                            }
                          />
                        ))}
                      </div>
                    )}
                  </RelationCard>

                  {/* Subcategories */}
                  <RelationCard
                    title={relationMode === "post" ? "Post Subcategories" : "Subcategories"}
                    count={subcatRelations.length}
                    onAdd={() => setSubCategoryModalOpen(true)}
                    onClear={relationMode === "post" ? handleClearPostSubCategories : handleClearSubCategories}
                  >
                    {subcatRelations.length === 0 ? (
                      <EmptyState message="No subcategories linked" />
                    ) : (
                      <div className="space-y-2">
                        {subcatRelations.map((s) => (
                          <RelationItem
                            key={s.id}
                            name={s.name}
                            onRemove={() => {
                              if (!s.relationId) return;
                              if (relationMode === "post")
                                return handleRemovePostSubcategory(s.relationId);
                              return handleRemoveSubcategory(s.relationId);
                            }}
                            indicatorColor="bg-green-500"
                          />
                        ))}
                      </div>
                    )}
                  </RelationCard>

                  {/* Tag Categories (Video mode only) */}
                  {relationMode === "video" && (
                    <RelationCard
                      title="Tag Categories"
                      count={tagCatRelations.length}
                      onAdd={() => setTagCatModalOpen(true)}
                      onClear={handleClearTagCategories}
                    >
                      {tagCatRelations.length === 0 ? (
                        <EmptyState message="No tag categories linked" />
                      ) : (
                        <div className="space-y-2">
                          {tagCatRelations.map((tc) => (
                            <RelationItem
                              key={tc.id}
                              name={tc.name}
                              onRemove={() => handleRemoveTagCategory(tc.id)}
                              indicatorColor="bg-purple-500"
                            />
                          ))}
                        </div>
                      )}
                    </RelationCard>
                  )}
                </div>

                {/* Creators Section */}
                <RelationCard
                  title="Creators"
                  count={creatorRelations.length}
                  onAdd={() => setCreatorModalOpen(true)}
                  onClear={handleClearCreators}
                  addLabel="Link Creator"
                >
                  {creatorRelations.length === 0 ? (
                    <EmptyState message="No creators linked" />
                  ) : (
                    <div className="space-y-2">
                      {creatorRelations.map((c) => (
                        <RelationItem
                          key={c.id}
                          name={c.name}
                          onRemove={() => handleRemoveCreator(Number(c.id))}
                          indicatorColor="bg-orange-500"
                        />
                      ))}
                    </div>
                  )}
                </RelationCard>
              </div>
            ) : (
              <Card className="p-12">
                <EmptyState 
                  message="Select a platform to manage its relations"
                  icon={
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859" />
                    </svg>
                  }
                />
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={platformModalOpen}
        onClose={() => setPlatformModalOpen(false)}
        title={editingPlatform ? "Edit Platform" : "Create Platform"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform Name
            </label>
            <input
              type="text"
              placeholder="Enter platform name"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video Sync URL (optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/video-sync"
              value={platformVideoSyncUrl}
              onChange={(e) => setPlatformVideoSyncUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Post Sync URL (optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/post-sync"
              value={platformPostSyncUrl}
              onChange={(e) => setPlatformPostSyncUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setPlatformModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePlatform}>
              {editingPlatform ? "Update Platform" : "Create Platform"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={`Add ${relationMode === "post" ? "Post Category" : "Category"}`}
      >
        <div className="space-y-4">
          <SearchInput
            placeholder={`Search ${relationMode === "post" ? "post category" : "category"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredCategories?.length === 0 && search.trim() !== "" ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Create new {relationMode === "post" ? "post category" : "category"} "{search}"
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    relationMode === "post"
                      ? handleCreateAndLinkPostCategory(search)
                      : handleCreateAndLinkCategory(search)
                  }
                >
                  Create & Link
                </Button>
              </div>
            ) : (
              filteredCategories?.map((cat: any) => {
                const isLinked = catRelations.some((rc) => rc.id === cat.id);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                    {isLinked ? (
                      <Button variant="secondary" size="sm" disabled icon={Icons.check}>
                        Linked
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          relationMode === "post"
                            ? handleAddPostCategory(cat.id)
                            : handleAddCategory(cat.id)
                        }
                      >
                        Link
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={subCategoryModalOpen}
        onClose={() => setSubCategoryModalOpen(false)}
        title={`Add ${relationMode === "post" ? "Post Subcategory" : "Subcategory"}`}
      >
        <div className="space-y-4">
          <SearchInput
            placeholder={`Search ${relationMode === "post" ? "post subcategory" : "subcategory"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredSubcategories?.length === 0 && search.trim() !== "" ? (
              <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                No {relationMode === "post" ? "post subcategory" : "subcategory"} found
              </div>
            ) : (
              filteredSubcategories?.map((sub: any) => {
                const isLinked = subcatRelations.some((rs) => rs.id === sub.id);
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{sub.name}</span>
                    {isLinked ? (
                      <Button variant="secondary" size="sm" disabled icon={Icons.check}>
                        Linked
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          relationMode === "post"
                            ? handleAddPostSubcategory(sub.id)
                            : handleAddSubcategory(sub.id)
                        }
                      >
                        Link
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={tagCatModalOpen}
        onClose={() => setTagCatModalOpen(false)}
        title="Add Tag Category"
      >
        <div className="space-y-4">
          <SearchInput
            placeholder="Search tag category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredTagCategories?.length === 0 && search.trim() !== "" ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Create new tag category "{search}"
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCreateAndLinkTagCategory(search)}
                >
                  Create & Link
                </Button>
              </div>
            ) : (
              filteredTagCategories?.map((tagCat: any) => {
                const isLinked = tagCatRelations.some((rc) => rc.name === tagCat.name);
                return (
                  <div
                    key={tagCat.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{tagCat.name}</span>
                    {isLinked ? (
                      <Button variant="secondary" size="sm" disabled icon={Icons.check}>
                        Linked
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddTagCategory(tagCat.id)}
                      >
                        Link
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={creatorModalOpen}
        onClose={() => setCreatorModalOpen(false)}
        title="Link Creator"
      >
        <div className="space-y-4">
          <SearchInput
            placeholder="Search creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-80 overflow-y-auto space-y-2">
            {(allCreators || [])
              .filter((c: any) => (c.name ?? "").toLowerCase().includes(search.toLowerCase()))
              .length === 0 && search.trim() !== "" ? (
              <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                No creator found
              </div>
            ) : (
              (allCreators || [])
                .filter((c: any) => (c.name ?? "").toLowerCase().includes(search.toLowerCase()))
                .map((creator: any) => {
                  const isLinked = creatorRelations.some((rc) => rc.id === creator.id);
                  return (
                    <div
                      key={creator.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{creator.name}</span>
                      {isLinked ? (
                        <Button variant="secondary" size="sm" disabled icon={Icons.check}>
                          Linked
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            handleAddCreator(creator.id);
                            setCreatorModalOpen(false);
                          }}
                        >
                          Link
                        </Button>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}