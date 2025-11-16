
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UsePost, type Image, type Video } from "../hooks/usePost";
import useCategoryPost from "../hooks/posts/useCategoryPost";
import useSubCategoryPost from "../hooks/posts/useSubCategoryPost";
import toast from "react-hot-toast";
import useUpdatePost from "../hooks/useUpdatePost";
import LanguageAutoComplete from "../components/LanguageAutoComplete";
import CreatorAutoComplete from "../components/CreatorAutoComplete";
import CategorySelector from "./PostEdit/components/CategorySelector";
import TitlesEditor from "./PostEdit/components/TitlesEditor";
import MediaUploader from "./PostEdit/components/MediaUploader";
import { deleteManyImages, deleteManyVideos } from "../api/posts";

type Language = {
  code: string;
  name: string;
};

const PostEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: post, loading, error } = UsePost(id);

  const [{ images, videos }, setMedia] = useState<{
    images: Image[];
    videos: Video[];
  }>({
    images: [],
    videos: [],
  });

  // store ids of media to delete on next update (deferred deletion)
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [deletedVideoIds, setDeletedVideoIds] = useState<number[]>([]);

  useEffect(() => {
    if (post) {
      setMedia({
        images: post.images || [],
        videos: post.videos || [],
      });
    }
  }, [post]);

  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<{
    id: number;
    name: string;
  } | null>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<{
    id: number;
    name: string;
    categoryId: number;
  } | null>(null);
  const [languages, setLanguages] = useState<
    { id: number; name: string; code: string }[]
  >([]);
  const [selectedLanguage, setSelectedLanguage] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);
  const [titles, setTitles] = useState<{ [key: number]: string }>({});
  const [descriptions, setDescriptions] = useState<{ [key: number]: string }>(
    {}
  );

  const [imageFields, setImageFields] = useState<
    { id: number; file: File | null; url?: string }[]
  >([{ id: 1, file: null }]);
  const [videoFields, setVideoFields] = useState<
    { id: number; file: File | null; url?: string }[]
  >([{ id: 1, file: null }]);
  const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
  const [selectedLanguageFromBackend, setSelectedLanguageFromBackend] =
    useState<Language | null>(null);

  const [creatorObj, setCreatorObj] = useState<any | null>(null);

  const { data: categoriesResponse } = useCategoryPost();
  const { data: subCategoriesResponse } = useSubCategoryPost(
    selectedCategory?.id
  );

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const subCategoryDropdownRef = useRef<HTMLDivElement>(null);

  const availableSubCategories = subCategoriesResponse?.subCategories;

  // Pré-remplir les champs avec les données du post
  useEffect(() => {
    if (post) {
      const matchingCategory = categoriesResponse?.categories.find(
        (cat) => cat.id === post.postCategory.id
      );
      // const matchingSubCategory = subCategoriesResponse?.subCategories.find(subCat => subCat.id === post.sub_category_id);
      if (matchingCategory) {
        setSelectedCategory(matchingCategory);
        // setSelectedSubCategory(matchingSubCategory);
        setSelectedOptions([matchingCategory.name]);
      }

      if (post.titles && post.titles.length > 0) {
        const titlesMap: { [key: number]: string } = {};
        const descriptionsMap: { [key: number]: string } = {};
        const postLanguages: { id: number; name: string; code: string }[] = [];

        post.titles.forEach((item, index) => {
          const languageId = index + 1;
          // Créer l'objet langue basé sur les données du post
          // prefer explicit i18_language, otherwise fallback to language.code if available
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

        // Sélectionner la première langue par défaut
        if (postLanguages.length > 0) {
          setSelectedLanguage(postLanguages[0]);
        }
      }
      // Prefill creator fields if available on post
      // prefer creatorObj when present
      if ((post as any).creatorObj) {
        setCreatorObj((post as any).creatorObj || null);
      }
    }
  }, [post, categoriesResponse]);

  // Effet pour s'assurer que selectedLanguage est toujours valide
  useEffect(() => {
    if (
      languages.length > 0 &&
      (!selectedLanguage ||
        !languages.find((lang) => lang.id === selectedLanguage.id))
    ) {
      setSelectedLanguage(languages[0]);
    }
  }, [languages, selectedLanguage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
      if (
        subCategoryDropdownRef.current &&
        !subCategoryDropdownRef.current.contains(event.target as Node)
      ) {
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

  // Fonction pour ajouter une nouvelle langue
  const handleAddLanguage = () => {
    if (selectedLanguageFromBackend) {
      // Vérifier si la langue n'existe pas déjà
      const existingLanguage = languages.find(
        (lang) => lang.code === selectedLanguageFromBackend.code
      );
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
      setSelectedLanguage(newLanguage); // Sélectionner automatiquement la nouvelle langue
    }
  };

  // Fonction pour annuler l'ajout de langue
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
      setImageFields((prev) =>
        prev.map((field) =>
          field.id === id ? { ...field, file, url: undefined } : field
        )
      );
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
        alert(
          `⚠️ La vidéo est trop volumineuse !\n\nTaille: ${(file.size / 1024 / 1024 / 1024).toFixed(2)} GB\nMax: 2 GB`
        );
        return;
      }

      setVideoFields((prev) => prev.map((field) => (field.id === id ? { ...field, file, url: undefined } : field)));
    }
  };

  const { updatePost, loading: updating } = useUpdatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
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
        .map((field) => ({
          id: field.id,
          fileName: field.file?.name || field.url,
          isNew: !!field.file,
        })),
      videos: videoFields
        .filter((field) => field.file !== null || field.url)
        .map((field) => ({
          id: field.id,
          fileName: field.file?.name || field.url,
          isNew: !!field.file,
        })),
      // include deferred deletions so backend can remove them as part of the update
      // deleted_image_ids: deletedImageIds,
      // deleted_video_ids: deletedVideoIds,
    };
    // include creator or creator_id in payload
    if (creatorObj) {
      (payload as any).creator_id = creatorObj.id;
    }

    // If there are newly added files (file objects), send a FormData so the files are transmitted.
    const hasNewFiles =
      imageFields.some((f) => f.file) || videoFields.some((f) => f.file);

    try {
      if (deletedImageIds.length > 0) {
        await deleteManyImages(deletedImageIds);
      }
      if (deletedVideoIds.length > 0) {
        await deleteManyVideos(deletedVideoIds);
      }

      if (hasNewFiles) {
        const fd = new FormData();
        // Keep the same metadata structure by sending it as JSON in a field
        fd.append("payload", JSON.stringify(payload));

        // Append new image files (backend expects multiple 'images' fields similar to upload)
        imageFields
          .filter((f) => f.file)
          .forEach((f) => {
            if (f.file) fd.append("images", f.file, f.file.name);
          });

        // Append new video files
        videoFields
          .filter((f) => f.file)
          .forEach((f) => {
            if (f.file) fd.append("videos", f.file, f.file.name);
          });

        await updatePost(post?.id, fd);
      } else {
        // No files to upload — send JSON payload as before
        await updatePost(post?.id, payload);
      }

      toast.success("Post updated successfully");
      // navigate to post details or refresh
      navigate(`/post/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update post. See console for details.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Erreur: {error.message}
          </p>
          <button
            onClick={() => navigate("/post")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Post not Found
          </p>
          <button
            onClick={() => navigate("/post")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            back to list Post
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start pb-6">
      <div className="flex w-full border border-gray-300 dark:border-gray-700 rounded-lg p-4 sm:p-6">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Modify: POST-{String(post.id).padStart(3, "0")}
            </h2>
            <button
              onClick={() => navigate(`/post/${id}`)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <CategorySelector
              categories={categoriesResponse?.categories}
              selectedOptions={selectedOptions}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSubCategory={selectedSubCategory}
              setSelectedSubCategory={setSelectedSubCategory}
              open={open}
              setOpen={setOpen}
              subOpen={subOpen}
              setSubOpen={setSubOpen}
              categoryDropdownRef={categoryDropdownRef}
              subCategoryDropdownRef={subCategoryDropdownRef}
              availableSubCategories={availableSubCategories}
              setSelectedOptions={setSelectedOptions}
              postCategoryName={post.postCategory.name}
            />

            <TitlesEditor
              languages={languages}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              titles={titles}
              descriptions={descriptions}
              handleTitleChange={handleTitleChange}
              handleDescriptionChange={handleDescriptionChange}
              setShowAddLanguageModal={setShowAddLanguageModal}
            />

            <div className="w-full mt-4">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Creator (optional)
              </label>
              <CreatorAutoComplete
                value={creatorObj?.name}
                onSelect={(c) => {
                  setCreatorObj(c ?? null);
                }}
              />
            </div>

            <MediaUploader
              images={images}
              videos={videos}
              imageFields={imageFields}
              videoFields={videoFields}
              handleImageChange={handleImageChange}
              handleVideoChange={handleVideoChange}
              addImageField={addImageField}
              addVideoField={addVideoField}
              removeImageField={removeImageField}
              removeVideoField={removeVideoField}
              setDeletedImageIds={setDeletedImageIds}
              setDeletedVideoIds={setDeletedVideoIds}
              setMedia={setMedia}
            />

            <div className="border-t border-gray-200 dark:border-gray-600 my-6"></div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(`/post/${id}`)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className={`px-6 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 ${
                  updating
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {updating ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Add Language */}
      {showAddLanguageModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              New Title
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Language
              </label>
              <div className="">
                <LanguageAutoComplete
                  onSelect={(lang) => setSelectedLanguageFromBackend(lang)}
                  defaultValue={selectedLanguageFromBackend || undefined}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelAddLanguage}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLanguage}
                disabled={!selectedLanguageFromBackend}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
              >
                Add Title
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostEdit;
