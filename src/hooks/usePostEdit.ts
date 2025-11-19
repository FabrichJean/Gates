import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UsePost, type Image, type Video } from "../hooks/usePost";
import useCategoryPost from "../hooks/posts/useCategoryPost";
import useSubCategoryPost from "../hooks/posts/useSubCategoryPost";
import useUpdatePost from "../hooks/useUpdatePost";
import { deleteManyImages, deleteManyVideos } from "../api/posts";
import toast from "react-hot-toast";

type Language = { code: string; name: string };

export default function usePostEdit(id?: string | undefined) {
  const navigate = useNavigate();
  const { data: post, loading, error } = UsePost(id);

  const [{ images, videos }, setMedia] = useState<{ images: Image[]; videos: Video[] }>({
    images: [],
    videos: [],
  });

  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [deletedVideoIds, setDeletedVideoIds] = useState<number[]>([]);

  useEffect(() => {
    if (post) {
      setMedia({ images: post.images || [], videos: post.videos || [] });
    }
  }, [post]);

  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<{
    id: number;
    name: string;
    categoryId: number;
  } | null>(null);
  const [languages, setLanguages] = useState<{ id: number; name: string; code: string }[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<{ id: number; name: string; code: string } | null>(null);
  const [titles, setTitles] = useState<{ [key: number]: string }>({});
  const [descriptions, setDescriptions] = useState<{ [key: number]: string }>({});

  const [imageFields, setImageFields] = useState<{ id: number; file: File | null; url?: string }[]>([{ id: 1, file: null }]);
  const [videoFields, setVideoFields] = useState<{ id: number; file: File | null; url?: string }[]>([{ id: 1, file: null }]);
  const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
  const [selectedLanguageFromBackend, setSelectedLanguageFromBackend] = useState<Language | null>(null);

  const [creatorObj, setCreatorObj] = useState<any | null>(null);

  const { data: categoriesResponse } = useCategoryPost();
  const { data: subCategoriesResponse } = useSubCategoryPost(selectedCategory?.id);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const subCategoryDropdownRef = useRef<HTMLDivElement>(null);

  const availableSubCategories = subCategoriesResponse?.subCategories || [];

  useEffect(() => {
    if (post) {
      const matchingCategory = categoriesResponse?.categories.find((cat) => cat.id === post.postCategory.id);
      if (matchingCategory) {
        setSelectedCategory(matchingCategory);
        setSelectedOptions([matchingCategory.name]);
      }

      if (post.titles && post.titles.length > 0) {
        const titlesMap: { [key: number]: string } = {};
        const descriptionsMap: { [key: number]: string } = {};
        const postLanguages: { id: number; name: string; code: string }[] = [];

        post.titles.forEach((item, index) => {
          const languageId = index + 1;
          const code = item.i18_language || item.language?.code || "";
          const postLanguage = {
            id: languageId,
            name: item.language?.name || (code ? code.toUpperCase() : ""),
            code: code,
          };

          postLanguages.push(postLanguage);
          titlesMap[languageId] = item.title;
          descriptionsMap[languageId] = item.description || "";
        });

        setLanguages(postLanguages);
        setTitles(titlesMap);
        setDescriptions(descriptionsMap);

        if (postLanguages.length > 0) {
          setSelectedLanguage(postLanguages[0]);
        }
      }

      if ((post as any).creatorObj) {
        setCreatorObj((post as any).creatorObj || null);
      }
    }
  }, [post, categoriesResponse]);

  useEffect(() => {
    if (
      languages.length > 0 &&
      (!selectedLanguage || !languages.find((lang) => lang.id === selectedLanguage.id))
    ) {
      setSelectedLanguage(languages[0]);
    }
  }, [languages, selectedLanguage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
      if (subCategoryDropdownRef.current && !subCategoryDropdownRef.current.contains(event.target as Node)) {
        setSubOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTitleChange = (languageId: number, value: string) => {
    setTitles((prev) => ({ ...prev, [languageId]: value }));
  };

  const handleDescriptionChange = (languageId: number, value: string) => {
    setDescriptions((prev) => ({ ...prev, [languageId]: value }));
  };

  const handleAddLanguage = () => {
    if (selectedLanguageFromBackend) {
      const existingLanguage = languages.find((lang) => lang.code === selectedLanguageFromBackend.code);
      if (existingLanguage) {
        toast.error("This language is already added!");
        return;
      }

      const newId = Math.max(0, ...languages.map((lang) => lang.id)) + 1;
      const newLanguage = {
        id: newId,
        name: selectedLanguageFromBackend.name,
        code: selectedLanguageFromBackend.code,
      };
      setLanguages((prev) => [...prev, newLanguage]);
      setSelectedLanguageFromBackend(null);
      setShowAddLanguageModal(false);
      setSelectedLanguage(newLanguage);
    }
  };

  const handleCancelAddLanguage = () => {
    setSelectedLanguageFromBackend(null);
    setShowAddLanguageModal(false);
  };

  const addImageField = () => {
    const newId = Math.max(...imageFields.map((field) => field.id)) + 1;
    setImageFields((prev) => [...prev, { id: newId, file: null }]);
  };

  const removeImageField = (id: number) => {
    if (imageFields.length > 1) {
      setImageFields((prev) => prev.filter((field) => field.id !== id));
    }
  };

  const handleImageChange = (id: number, file: File | null) => {
    if (file) {
      setImageFields((prev) => prev.map((field) => (field.id === id ? { ...field, file, url: undefined } : field)));
    }
  };

  const addVideoField = () => {
    const newId = Math.max(...videoFields.map((field) => field.id)) + 1;
    setVideoFields((prev) => [...prev, { id: newId, file: null }]);
  };

  const removeVideoField = (id: number) => {
    if (videoFields.length > 1) {
      setVideoFields((prev) => prev.filter((field) => field.id !== id));
    }
  };

  const handleVideoChange = (id: number, file: File | null) => {
    if (file) {
      const maxSize = 2 * 1024 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`⚠️ La vidéo est trop volumineuse !\n\nTaille: ${(file.size / 1024 / 1024 / 1024).toFixed(2)} GB\nMax: 2 GB`);
        return;
      }

      setVideoFields((prev) => prev.map((field) => (field.id === id ? { ...field, file, url: undefined } : field)));
    }
  };

  const { updatePost, loading: updating } = useUpdatePost();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    const payload: any = {
      id: post?.id,
      category_id: selectedCategory?.id ?? post?.postCategory?.id,
      sub_category_id: selectedSubCategory?.id ?? post?.postSubCategory?.id,
      titles: Object.entries(titles).map(([langId, title]) => {
        const lang = languages.find((l) => l.id === parseInt(langId));
        return {
          i18_language: lang?.code,
          title: title,
          description: descriptions[parseInt(langId)] || "",
        };
      }),
      images: imageFields
        .filter((field) => field.file !== null || field.url)
        .map((field) => ({ id: field.id, fileName: field.file?.name || field.url, isNew: !!field.file })),
      videos: videoFields
        .filter((field) => field.file !== null || field.url)
        .map((field) => ({ id: field.id, fileName: field.file?.name || field.url, isNew: !!field.file })),
    };

    if (creatorObj) {
      payload.creator_id = creatorObj.id;
    }

    const hasNewFiles = imageFields.some((f) => f.file) || videoFields.some((f) => f.file);

    try {
      if (deletedImageIds.length > 0) await deleteManyImages(deletedImageIds);
      if (deletedVideoIds.length > 0) await deleteManyVideos(deletedVideoIds);

      if (hasNewFiles) {
        const fd = new FormData();
        fd.append("payload", JSON.stringify(payload));
        imageFields.filter((f) => f.file).forEach((f) => { if (f.file) fd.append("images", f.file, f.file.name); });
        videoFields.filter((f) => f.file).forEach((f) => { if (f.file) fd.append("videos", f.file, f.file.name); });
        await updatePost(post?.id, fd);
      } else {
        await updatePost(post?.id, payload);
      }

      toast.success("Post updated successfully");
      navigate(`/post/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update post. See console for details.");
    }
  };

  return {
    // data
    post,
    loading,
    error,
    images,
    videos,
    // state
    open,
    subOpen,
    selectedOptions,
    selectedCategory,
    selectedSubCategory,
    languages,
    selectedLanguage,
    titles,
    descriptions,
    imageFields,
    videoFields,
    showAddLanguageModal,
    selectedLanguageFromBackend,
    creatorObj,
    availableSubCategories,
    categoryDropdownRef,
    subCategoryDropdownRef,
    // setters / handlers
    setOpen,
    setSubOpen,
    setSelectedOptions,
    setSelectedCategory,
    setSelectedSubCategory,
    setLanguages,
    setSelectedLanguage,
    handleTitleChange,
    handleDescriptionChange,
    handleAddLanguage,
    handleCancelAddLanguage,
    addImageField,
    removeImageField,
    handleImageChange,
    addVideoField,
    removeVideoField,
    handleVideoChange,
    handleSubmit,
    setShowAddLanguageModal,
    setImageFields,
    setVideoFields,
    setDeletedImageIds,
    setDeletedVideoIds,
    setMedia,
    setCreatorObj,
    updating,
  };
}
