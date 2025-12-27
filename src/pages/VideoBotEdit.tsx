import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { Category } from "../components/CategoryAutoComplete";
import type { SubCategory } from "../hooks/useSubCategory";
import toast from "react-hot-toast";
import CategoryAutoComplete from "../components/CategoryAutoComplete";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
import CreatorAutoComplete from "../components/CreatorAutoComplete";
import { TitlesForm } from "./Upload";
import { UseBotVideo } from "../hooks/bot/useBotVideos";
import { updateVideoBotWithProgress } from "../api/videoBot";
import { getTagCategoriesApi } from "../api/tagCategory";
import PlatformSelectComponent from "../components/PlatformSelectComponent";
import type { Platform } from "../hooks/usePlatform";

function VideoBotEdit() {
  const { id: videoId } = useParams<{ id: string }>();
  const { data: video } = UseBotVideo(videoId);

  const navigate = useNavigate();

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [coverPreview, setCoverPreview] = useState<string | null>(
    video?.public_urls.cover_url || video?.cover
  );
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(
    video?.public_urls.temp_url || video?.local_mp4_path
  );
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVideoPreview(
      video?.s3_urls?.hlsUrl ||
        video?.public_urls.temp_url ||
        video?.local_mp4_path
    );
    setCoverPreview(
      video?.s3_urls?.coverUrl || video?.public_urls.cover_url || video?.cover
    );
  }, [video]);

  const [duration, setDuration] = useState<number | null>(video?.duration);

  const [videoType, setVideoType] = useState<string>(
    video?.type === "1" ? "short" : "long"
  );

  const [category, setCategory] = useState<Category>(video?.category);
  const [subcategory, setSubCategory] = useState<SubCategory>(
    video?.subCategory
  );
  // suppress the explicit-any that comes from the shared Couple type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignorefpublicjzzz
  const [coupleTitles, setCoupleTitles] = useState<Couple[]>(
    video?.titles || []
  );
  // creatorObj is provided as an object on the video; prefer it when available
  const initialCreatorName =
    (video as any)?.creatorObj?.name ??
    (typeof (video as any)?.creator === "string"
      ? (video as any).creator
      : (video as any)?.creator?.name) ??
    null;
  const initialCreatorId =
    (video as any)?.creatorObj?.id ??
    (video as any)?.creator?.id ??
    (video as any)?.creator_id ??
    null;
  const [creator, setCreator] = useState<string | null>(initialCreatorName);
  const [creatorId, setCreatorId] = useState<number | null>(initialCreatorId);

  const [platform, setPlatform] = useState<Platform>(video?.plateform)

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverClick = () => coverInputRef.current?.click();

  const handleSubmit = async () => {
    try {
      setUploading(true);
      setProgress(0);

      const fd = new FormData();
      if (videoFile) {
        fd.append("video", videoFile as File);
      }
      if (coverFile) {
        fd.append("cover", coverFile as File);
      }
      // only append ids when present to avoid reading properties of null
      if (category && typeof category.id !== "undefined" && category !== null) {
        fd.append("category_id", String((category as any).id));
      }
      if (subcategory && typeof (subcategory as any).id !== "undefined") {
        fd.append("sub_category_id", String((subcategory as any).id));
      }

      // otherwise fall back to free-text creator name for backward compatibility
      if (creatorId) fd.append("creator_id", String(creatorId));
      else if (creator) fd.append("creator", String(creator));
      // fd.append("ref", String(ref));
      fd.append("titles", JSON.stringify(coupleTitles));
      fd.append("titles", JSON.stringify(coupleTitles));
      if (platform) fd.append("plateform_id", String(platform.id));
      // append type: backend expects '1' for short and '2' for long
      if (videoType) fd.append("type", videoType === "short" ? "1" : "2");

      fd.append(
        "tagCategory",
        JSON.stringify(
          selectedPostTagCategories.map((t) => ({
            id: t.id ?? null,
            name: t.name,
          }))
        )
      );
      // prefer the route param videoId because `video` may be null while data loads
      const targetId = video?.id ?? videoId;
      if (!targetId) {
        toast.error("Video id not available yet. Try again.");
        return;
      }

      const res = await updateVideoBotWithProgress(
        targetId,
        fd,
        (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        }
      );

      toast.success("✅ successfull !");
      navigate("/bot-videos/" + video.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const postTagWrapperRef = useRef<HTMLDivElement | null>(null);
  // TAGS
  const [postTagQuery, setPostTagQuery] = useState("");
  const [showPostTagDropdown, setShowPostTagDropdown] = useState(false);

  // suggestions récupérées depuis API (à adapter)
  const [postTagSuggestions, setPostTagSuggestions] = useState<any[]>([]);
  const [availablePostTags, setAvailablePostTags] = useState<
    Array<{ id?: number; name: string; meta?: any }>
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTagCategoriesApi();
        const items = res?.data?.items ?? res?.data ?? [];
        const normalized = (Array.isArray(items) ? items : []).map(
          (it: any) => ({ id: it.id, name: it.name, meta: it.meta ?? null })
        );

        setAvailablePostTags(normalized);
        setPostTagSuggestions(normalized);
      } catch (err) {
        console.warn("Failed to load post tag categories", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!postTagQuery) {
      setPostTagSuggestions(availablePostTags);
      return;
    }
    const q = postTagQuery.toLowerCase();
    setPostTagSuggestions(
      availablePostTags.filter((t) => t.name.toLowerCase().includes(q))
    );
  }, [postTagQuery, availablePostTags]);

  // tags sélectionnés
  const [selectedPostTagCategories, setSelectedPostTagCategories] = useState<
    { id?: number; name: string }[]
  >(
    video?.tagCategoryVideos?.map((t: any) => ({
      id: t.id,
      name: t.name,
    })) ?? []
  );

  const addPostTagSuggestion = (tag: any) => {
    // éviter les doublons
    if (
      selectedPostTagCategories.some(
        (existing) => existing.name.toLowerCase() === tag.name.toLowerCase()
      )
    ) {
      return;
    }

    setSelectedPostTagCategories((prev) => [...prev, tag]);
    setPostTagQuery("");
  };

  const addPostTagByName = (name: string) => {
    if (!name.trim()) return;

    const existed = selectedPostTagCategories.some(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (existed) return;

    setSelectedPostTagCategories((prev) => [...prev, { name }]);
    setPostTagQuery("");
  };

  const removeSelectedPostTag = (index: number) => {
    setSelectedPostTagCategories((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-6 transition-all duration-300">
      {/* <Toaster position="top-right" /> */}
      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 self-start transition-colors duration-300">
          Touch video {video?.id}
        </h1>
        <div className="flex md:flex-row flex-col gap-7 w-max bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Category
              </label>
              <CategoryAutoComplete
                defaultValue={category}
                onSelect={(cat) => setCategory(cat)}
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Sub Category
              </label>
              <SubCategoryAutoComplete
                categoryId={category?.id}
                defaultValue={subcategory}
                onSelect={(cat) => setSubCategory(cat)}
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Creator
              </label>
              <CreatorAutoComplete
                value={creator}
                onChange={(v: string | null) => setCreator(v)}
                onSelect={(c) => setCreatorId(c?.id ?? null)}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Duration ( ms)
              </label>
              <input
                type="number"
                className="input w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                defaultValue={duration || 0}
                onChange={(e) => setDuration(Number(e.currentTarget.value))}
              />
            </div>

             <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Platform
              </label>
              <PlatformSelectComponent defaultValue={platform} onSelect={setPlatform} />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Type
              </label>
              <div className="relative w-full">
                <select
                  className="w-full appearance-none text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 pr-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-all duration-300 shadow-sm cursor-pointer"
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value)}
                >
                  <option value="short" className="cursor-pointer">
                    Short
                  </option>
                  <option value="long" className="cursor-pointer">
                    Long
                  </option>
                </select>
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path
                      d="M7 8l3 3 3-3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div className="relative w-full" ref={postTagWrapperRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tags:
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={postTagQuery}
                    onChange={(e) => {
                      setPostTagQuery(e.target.value);
                      setShowPostTagDropdown(true);
                    }}
                    onFocus={() => setShowPostTagDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPostTagByName(postTagQuery);
                        setShowPostTagDropdown(false);
                      }
                    }}
                    placeholder="Type tag name or select suggestion..."
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 outline-none focus:border-blue-500 transition-all duration-300"
                  />

                  {showPostTagDropdown &&
                    postTagSuggestions &&
                    postTagSuggestions.length > 0 && (
                      <ul className="absolute z-20 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded mt-1 max-h-48 overflow-y-auto shadow-lg">
                        {postTagSuggestions.map((s) => (
                          <li
                            key={s.id ?? s.name}
                            onClick={() => {
                              addPostTagSuggestion(s);
                              setShowPostTagDropdown(false);
                            }}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                          >
                            {s.name}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addPostTagByName(postTagQuery);
                    setShowPostTagDropdown(false);
                  }}
                  className="px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700"
                >
                  Add
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedPostTagCategories.map((t, i) => (
                  <span
                    key={`${t.id ?? "new"}-${t.name}-${i}`}
                    className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{t.name}</span>
                    <button
                      onClick={() => removeSelectedPostTag(i)}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Cover Image
              </label>
              <div
                onClick={handleCoverClick}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer relative"
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="rounded-lg object-cover w-full h-52"
                  />
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2 transition-colors duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A4.5 4.5 0 1115.9 6H16a4 4 0 110 8h-1m-3 4l-4-4m0 0l4-4m-4 4h12"
                      />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center transition-colors duration-300">
                      Click or drag an image (PNG, JPG, WEBP)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={coverInputRef}
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Video File
              </label>
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer relative"
              >
                {videoPreview ? (
                  <video
                    src={videoPreview}
                    controls
                    className="rounded-lg object-cover w-full h-52"
                  />
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2 transition-colors duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A4.5 4.5 0 1115.9 6H16a4 4 0 110 8h-1m-3 4l-4-4m0 0l4-4m-4 4h12"
                      />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center transition-colors duration-300">
                      Click or drag a video (MP4, WEBM, AVI)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setVideoFile(file);
                      setVideoPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {/* Barre de progression */}
            {uploading && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden transition-colors duration-300">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-colors duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          <TitlesForm
            btnSubmit="✏️ update"
            coupleTitles={coupleTitles}
            setCoupleTitles={setCoupleTitles}
            progress={progress}
            uploading={uploading}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export default VideoBotEdit;
