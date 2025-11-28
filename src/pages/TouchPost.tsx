
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

const TouchPost = () => {
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
  >([]);
  const [videoFields, setVideoFields] = useState<
    { id: number; file: File | null; url?: string; cover?: File | null; coverUrl?: string; type?: string }[]
  >([]);
  // mapping of existing video id -> cover File (if user selected a new cover for an existing video)
  const [existingVideoCovers, setExistingVideoCovers] = useState<Record<number, File | null>>({});
  const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
  const [selectedLanguageFromBackend, setSelectedLanguageFromBackend] = useState<Language | null>(null);

  const [creatorObj, setCreatorObj] = useState<any | null>(null);

  const { data: categoriesResponse } = useCategoryPost();
  const { data: subCategoriesResponse } = useSubCategoryPost(
    selectedCategory?.id
  );

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const subCategoryDropdownRef = useRef<HTMLDivElement>(null);

  const availableSubCategories = subCategoriesResponse?.subCategories;

  useEffect(() => {
    if (post) {
      const matchingCategory = categoriesResponse?.categories.find(
        (cat) => cat.id === post.postCategory.id
      );

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
      setSelectedLanguage(newLanguage);
    }
  };

  
  const handleCancelAddLanguage = () => {
    setSelectedLanguageFromBackend(null);
    setShowAddLanguageModal(false);
  };

  const addImageField = () => {
    const newId = imageFields.length > 0 ? Math.max(...imageFields.map((field) => field.id)) + 1 : 1;
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
    const newId = videoFields.length > 0 ? Math.max(...videoFields.map((field) => field.id)) + 1 : 1;
    setVideoFields((prev) => [...prev, { id: newId, file: null, cover: null, type: 'long' }]);
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

  // Map frontend type <-> backend representation
  const frontToBackendType = (val: 'short' | 'long') => (val === 'long' ? '2' : '1');

  // Update type for a new video field (user-added)
  const handleVideoTypeChange = (id: number, value: 'short' | 'long') => {
    setVideoFields((prev) => prev.map((f) => (f.id === id ? { ...f, type: value } : f)));
  };

  // Update type for an existing video (already stored on the post)
  const handleExistingVideoTypeChange = (id: number, value: 'short' | 'long') => {
    const t = frontToBackendType(value);
    setMedia((prev) => ({ ...prev, videos: prev.videos.map((v) => (v.id === id ? { ...v, type: t } : v)) }));
  };

  const handleCoverChange = (id: number, file: File | null) => {
    if (file) {
      const existingVideo = videos.find((v) => v.id === id);
      if (existingVideo) {
        setExistingVideoCovers((prev) => ({ ...prev, [id]: file }));
      } else {
        setVideoFields((prev) => prev.map((field) => (field.id === id ? { ...field, cover: file, coverUrl: undefined } : field)));
      }
    }
  };

  const { updatePost, loading: updating } = useUpdatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Build payload including existing videos followed by newly added video fields
    const videosPayload: any[] = [];

    // existing videos currently in media state (preserve their backend 'type' if present)
    videos.forEach((v) => {
      videosPayload.push({ id: v.id, fileName: v.s3_urls?.hlsUrl || v.public_urls?.local_mp4_url || v.cdn_url, isNew: false, type: (v as any).type ?? '2' });
    });

    // new video fields (user added in form) — include the chosen type (map front->backend)
    videoFields
      .filter((field) => field.file !== null || field.url)
      .forEach((field) => {
        const t = field.type === 'short' ? '1' : '2';
        videosPayload.push({ id: field.id, fileName: field.file?.name || field.url, isNew: !!field.file, type: t });
      });

    const imagesPayload = imageFields
      .filter((field) => field.file !== null || field.url)
      .map((field) => ({ id: field.id, fileName: field.file?.name || field.url, isNew: !!field.file }));

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
      images: imagesPayload,
      videos: videosPayload,
    };
    
    if (creatorObj) {
      (payload as any).creator_id = creatorObj.id;
    }

    const hasNewFiles =
      imageFields.some((f) => f.file) ||
      videoFields.some((f) => f.file || f.cover) ||
      Object.values(existingVideoCovers).some((f) => f);

    try {
      if (deletedImageIds.length > 0) {
        await deleteManyImages(deletedImageIds);
      }
      if (deletedVideoIds.length > 0) {
        await deleteManyVideos(deletedVideoIds);
      }

      if (hasNewFiles) {
        const titlesArray = Object.entries(titles).map(([langId, title]) => {
          const lang = languages.find((l) => l.id === parseInt(langId));
          return {
            title,
            i18_language: lang?.code,
            ...(descriptions[parseInt(langId)] ? { description: descriptions[parseInt(langId)] } : {}),
          };
        });

        const fd = new FormData();

        fd.append("payload", JSON.stringify(payload));

        if (post?.id) fd.append('id', String(post.id));
        fd.append('category_id', String(selectedCategory?.id ?? post?.postCategory?.id ?? ''));
        fd.append('sub_category_id', String(selectedSubCategory?.id ?? post?.postSubCategory?.id ?? ''));
        fd.append('titles', JSON.stringify(titlesArray));

        fd.append('videos_metadata', JSON.stringify(videosPayload));

        const mapShorts = videosPayload.map((v) => ({ id: v.id, isShort: String(v.type) === '1' }));
        fd.append("mapShorts", JSON.stringify(mapShorts));

        imageFields.filter((f) => f.file).forEach((f) => {
          if (f.file) fd.append("images", f.file, f.file.name);
        });

        videoFields.filter((f) => f.file).forEach((f) => {
          if (f.file) fd.append("videos", f.file, f.file.name);
        });

        const coversInOrder: (File | null)[] = [];
        // existing videos
        videos.forEach((v) => {
          const c = existingVideoCovers?.[v.id] ?? null;
          coversInOrder.push(c);
        });
        // new videoFields
        videoFields.forEach((f) => {
          coversInOrder.push(f.cover ?? null);
        });

        // Append covers
        coversInOrder.forEach((c, idx) => {
          if (c) {
            fd.append("covers", c, c.name);
          } else {
            const emptyBlob = new Blob([], { type: "image/jpeg" });
            fd.append("covers", emptyBlob, `no_cover_${idx}.jpg`);
          }
        });
        
        await updatePost(post?.id, fd);
      } else {
        (payload as any).mapShorts = videosPayload.map((v) => ({ id: v.id, isShort: String(v.type) === '1' }));
        // Debug logs removed for production
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

  // record map for existing covers to pass down to MediaUploader (use state)
  const existingVideoCoversRecord = existingVideoCovers;

  return (
    <div className="min-h-screen flex items-start pb-6">
      <div className="flex w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2">
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
              postSubCategoryName={post.postSubCategory?.name}
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
              handleCoverChange={handleCoverChange}
              handleVideoTypeChange={handleVideoTypeChange}
              handleExistingVideoTypeChange={handleExistingVideoTypeChange}
              addImageField={addImageField}
              addVideoField={addVideoField}
              removeImageField={removeImageField}
              removeVideoField={removeVideoField}
              setDeletedImageIds={setDeletedImageIds}
              setDeletedVideoIds={setDeletedVideoIds}
              existingVideoCovers={existingVideoCoversRecord}
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
                className={`px-6 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 ${updating
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

export default TouchPost;
