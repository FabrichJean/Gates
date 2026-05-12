import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, Film, Image, X } from "lucide-react";
import CategoryAutoComplete from "../components/CategoryAutoComplete";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
import CreatorAutoComplete from "../components/CreatorAutoComplete";
import PlatformSelectComponent from "../components/PlatformSelectComponent";
import { I18nField } from "../components/I18nComponents";
import TagCategoryVideoForApp from "../components/TagCategoryVideoForApp";
import { getTagCategoriesVideoForAppApi } from "../api/videoForApp";
import { useI18n } from "../i18n";
import type { TranslatedText } from "../types/i18n";
import type { Category } from "../components/CategoryAutoComplete";
import type { SubCategory } from "../hooks/useSubCategory";
import type { Platform } from "../hooks/usePlatform";
import { UseAppVideo } from "../hooks/app/useAppVideos";
import { updateVideoForApp } from "../api/videoForApp";
import { usePlatformReactive } from "../hooks/usePlatform";
import { useVideoForAppContext } from "../context/VideoForAppContext";
import { cdnS3 } from "../utils/cdn";

function VideoForAppEdit() {
  const { id: videoId } = useParams<{ id: string }>();
  const { data: video } = UseAppVideo(videoId);
  const { data: platforms } = usePlatformReactive();
  const { t } = useI18n();

  const ctx = useVideoForAppContext();
  if (!ctx) return null;

  const { reFetch } = ctx;

  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [duration, setDuration] = useState<number | null>(null);

  // Cover state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverLoading, setCoverLoading] = useState(false);

  // Update duration when video data loads
  useEffect(() => {
    if (video?.seconds !== undefined) {
      setDuration(video.seconds);
    }
  }, [video]);

  // Update cover preview when video data loads
  useEffect(() => {
    const coverUrl = 
      cdnS3(video?.s3_urls?.coverUrl) ||
      video?.public_urls?.coverUrl ||
      video?.public_urls?.local_cover_url;
    
    if (coverUrl) {
      setCoverLoading(true);
      setCoverPreview(coverUrl);
    }
  }, [video]);

  // Convert VideoForApp titles to TranslatedText format for I18nField
  const [titles, setTitles] = useState<TranslatedText>(() => {
    if (video?.titles && Array.isArray(video.titles)) {
      // Convert Title[] array to TranslatedText object
      const translatedTitles: TranslatedText = {};
      video.titles.forEach((titleObj) => {
        if (titleObj.i18_language && titleObj.title) {
          translatedTitles[titleObj.i18_language as keyof TranslatedText] =
            titleObj.title;
        }
      });
      return translatedTitles;
    }
    // Fallback to individual title fields if titles array is not available
    return {
      ...(video?.cn_title && { zh: video.cn_title }),
      ...(video?.en_title && { en: video.en_title }),
      ...(video?.hi_title && { hi: video.hi_title }),
    };
  });

  // Update titles when video data loads
  useEffect(() => {
    if (video) {
      if (video.titles && Array.isArray(video.titles)) {
        // Convert Title[] array to TranslatedText object
        const translatedTitles: TranslatedText = {};
        video.titles.forEach((titleObj) => {
          if (titleObj.i18_language && titleObj.title) {
            translatedTitles[titleObj.i18_language as keyof TranslatedText] =
              titleObj.title;
          }
        });
        setTitles(translatedTitles);
      } else {
        // Fallback to individual title fields if titles array is not available
        setTitles({
          ...(video.cn_title && { zh: video.cn_title }),
          ...(video.en_title && { en: video.en_title }),
          ...(video.hi_title && { hi: video.hi_title }),
        });
      }
    }
  }, [video]);

  // creatorObj is provided as an object on the video; prefer it when available
  const [creator, setCreator] = useState<string | null>(null);
  const [creatorId, setCreatorId] = useState<number | null>(null);

  // whether the current creator value was auto-suggested by the app
  const [creatorSuggested, setCreatorSuggested] = useState<boolean>(false);

  // Update creator when video data loads
  useEffect(() => {
    if (video?.creatorObj) {
      setCreator(video.creatorObj.name);
      setCreatorId(video.creatorObj.id);
      setCreatorSuggested(false);
    } else if (video) {
      // Video loaded but has no creator, reset states
      setCreator(null);
      setCreatorId(null);
      setCreatorSuggested(false);
    }
  }, [video?.creatorObj, videoId]); // Added videoId to reset when navigating to different video

  // Category and SubCategory states
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubCategory] = useState<SubCategory | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [videoType, setVideoType] = useState<string>("long");

  // Tag Category Videos states
  const [selectedTags, setSelectedTags] = useState<
    (number | { name: string })[]
  >([]);

  // If no tags are present on the video, pick 5 random tag categories as defaults
  useEffect(() => {
    const setRandomDefaults = async () => {
      try {
        // Don't override if video already has tags or user already selected tags
        if (video?.tagCategoryVideos && video.tagCategoryVideos.length > 0)
          return;
        if (selectedTags.length > 0) return;

        const res = await getTagCategoriesVideoForAppApi();
        const tags = (res?.data?.items ?? res?.data ?? []) as {
          id?: number;
          name: string;
        }[];
        if (!tags || tags.length === 0) return;

        // Shuffle and pick up to 5 tags with ids
        const shuffled = [...tags].sort(() => 0.5 - Math.random());
        const picked = shuffled.slice(0, Math.min(5, shuffled.length));
        // Use objects with id+name so the Tag component can render them immediately
        const pickedObjs = picked.map((t) => ({ id: t.id, name: t.name }));
        if (pickedObjs.length > 0) {
          setSelectedTags(pickedObjs as any);
        }
      } catch (err) {
        console.error("Failed to fetch tag categories for defaults", err);
      }
    };

    setRandomDefaults();
    // run when video loads
  }, [video]);

  // needVip state
  const [needVip, setNeedVip] = useState<boolean>(false);

  // Update category, subcategory, platform and tags when video data loads
  useEffect(() => {
    if (video?.categories) {
      setCategory(video.categories.find((cat) => cat.code === "en"));
    }
    if (video?.sub_categories) {
      setSubCategory(video.sub_categories.find((sub) => sub.code === "en"));
    }
    if (video?.type !== undefined) {
      setVideoType(video.type === "1" ? "short" : "long");
    }
    if (video?.tagCategoryVideos) {
      setSelectedTags(video.tagCategoryVideos.map((tag) => tag.id));
    }
    if (typeof video?.need_vip === "boolean") {
      setNeedVip(video.need_vip);
    }
  }, [video]);

  // Update platform when video or platforms data changes
  useEffect(() => {
    if (video?.plateform_id && platforms.length > 0) {
      // Find the platform object that matches the video's platform ID
      const videoPlatform = platforms.find((p) => p.id === video.plateform_id);
      if (videoPlatform) {
        setPlatform(videoPlatform);
      }
    }
  }, [video?.plateform_id, platforms]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(
          t(
            "app_video_edit.cover_invalid_type",
            "Only image files are accepted!",
          ),
        );
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(
          t(
            "app_video_edit.cover_too_large",
            "File size must be less than 10MB!",
          ),
        );
        return;
      }

      setCoverFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverPreview(event.target?.result as string);
        setCoverLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setCoverLoading(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      setProgress(0);

      // Convert titles back to simple title fields for VideoForApp
      const titlesData = {
        cn_title: titles.zh,
        en_title: titles.en,
        hi_title: titles.hi,
      };

      // prefer the route param videoId because `video` may be null while data loads
      const targetId = video?.id ?? Number(videoId);
      if (!targetId) {
        toast.error(
          t(
            "app_video_edit.no_video_id",
            "Video id not available yet. Try again.",
          ),
        );
        return;
      }

      // Only include category_id and sub_category_id if changed (compare to 'en' code)
      const payload: any = {
        seconds: duration,
        creator_id: creatorId,
        plateform_id: platform?.id,
        cn_title: titlesData.cn_title,
        en_title: titlesData.en_title,
        hi_title: titlesData.hi_title,
        type: videoType === "short" ? "1" : "2",
        tag_category_ids: selectedTags.map((t) =>
          typeof t === "number" ? t : ((t as any).id ?? (t as any).name),
        ),
        need_vip: needVip,
      };

      // Find the 'en' category and subcategory id from video data
      const originalCategoryId = video?.categories?.find(
        (cat) => cat.code === "en",
      )?.id;
      const originalSubCategoryId = video?.sub_categories?.find(
        (sub) => sub.code === "en",
      )?.id;
      if (category?.id && category?.id !== originalCategoryId) {
        payload.category_id = category.id;
      }
      if (subcategory?.id && subcategory?.id !== originalSubCategoryId) {
        payload.sub_category_id = subcategory.id;
      }

      // Create FormData if there's a cover file, otherwise use JSON payload
      let requestPayload: FormData | any = payload;
      if (coverFile) {
        const formData = new FormData();
        // Add all payload fields to FormData
        Object.keys(payload).forEach((key) => {
          const value = payload[key];
          
          // Skip null/undefined values
          if (value === null || value === undefined) {
            return;
          }
          
          if (Array.isArray(value)) {
            // For arrays, append each item separately with the key
            value.forEach((item: any) => {
              formData.append(key, item);
            });
          } else {
            formData.append(key, value);
          }
        });
        // Add cover file
        formData.append("cover", coverFile);
        requestPayload = formData;
      }

      await updateVideoForApp(targetId, requestPayload);

      toast.success(
        t("app_video_edit.update_success", "✅ Updated successfully!"),
      );
      // Trigger re-fetch of video list
      reFetch();
      navigate(`/app-videos/${video.id}`);
    } catch (err: unknown) {
      console.error(err);
      toast.error(
        t("app_video_edit.update_error", "Error: ") +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-6 transition-all duration-300">
      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 self-start transition-colors duration-300">
          {t("app_video_edit.title", "编辑应用视频")} {video?.id}
        </h1>
        <div className="flex flex-col gap-7 w-full bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300">
          {/* Cover Image Section */}
          <div className="flex flex-col gap-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("app_video_edit.cover_label", "封面图片")}
            </label>

            {/* Cover Upload Area */}
            <div className="relative w-64 h-64">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                id="cover-input"
              />
              <label
                htmlFor="cover-input"
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors w-full h-full"
              >
                {coverPreview ? (
                  <div className="relative w-full h-full">
                    {coverLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded z-20">
                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      className="w-full h-full object-cover rounded"
                      onLoad={() => setCoverLoading(false)}
                      onError={() => setCoverLoading(false)}
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <Image className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        "app_video_edit.cover_upload_hint",
                        "点击或拖拽上传封面图片",
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {t("app_video_edit.cover_hint", "PNG、JPG、WEBP 最多10MB")}
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                {t("app_video_edit.creator_label", "创造者")}
              </label>
              <CreatorAutoComplete
                value={creator}
                onChange={(v: string | null) => {
                  setCreator(v);
                  // Only reset suggested flag if the value actually changed from the current creator
                  if (v !== creator) {
                    setCreatorSuggested(false);
                  }
                }}
                onSelect={(c) => {
                  setCreatorId(c?.id ?? null);
                  // Only reset suggested flag if the selection actually changed
                  if (c?.id !== creatorId) {
                    setCreatorSuggested(false);
                  }
                }}
                isDefault={creatorSuggested}
                autoSuggest={true}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                {t("app_video_edit.category_label", "分类")}
              </label>
              <CategoryAutoComplete
                defaultValue={category}
                onSelect={setCategory}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                {t("app_video_edit.subcategory_label", "子分类")}
              </label>
              <SubCategoryAutoComplete
                categoryId={category?.id}
                defaultValue={subcategory}
                onSelect={setSubCategory}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                {t("app_video_edit.platform_label", "平台")}
              </label>
              <PlatformSelectComponent
                defaultValue={platform}
                onSelect={setPlatform}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("app_video_edit.video_type_label", "视频类型")}
              </label>
              <div className="relative">
                <Film className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  className="w-full appearance-none pl-10 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300"
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value)}
                >
                  <option value="short">
                    {t("app_video_edit.video_type.short", "短视频")}
                  </option>
                  <option value="long">
                    {t("app_video_edit.video_type.long", "长视频")}
                  </option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                {t("app_video_edit.vip_label", "VIP")}
              </label>
              <button
                type="button"
                onClick={() => setNeedVip((v) => !v)}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${needVip ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${needVip ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {needVip ? "true" : "false"}
              </span>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                {t("app_video_edit.duration_label", "时长（秒）")}
              </label>
              <input
                type="number"
                className="input w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                value={duration}
                onChange={(e) => setDuration(Number(e.currentTarget.value))}
              />
            </div>

            <TagCategoryVideoForApp
              selectedTags={selectedTags}
              onTagSelect={(tag) => setSelectedTags((prev) => [...prev, tag])}
              onTagDeselect={(tag) =>
                setSelectedTags((prev) =>
                  prev.filter((t) => {
                    if (typeof tag === "number" && typeof t === "number") {
                      return t !== tag;
                    } else if (
                      typeof tag === "object" &&
                      typeof t === "object"
                    ) {
                      return t.name !== tag.name;
                    }
                    return true;
                  }),
                )
              }
            />

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

          <div className="space-y-6">
            <div>
              <I18nField
                value={titles}
                onChange={setTitles}
                label={t("app_video_edit.title_label", "标题")}
                placeholder="输入标题..."
                supportedLanguages={["zh", "en", "hi"]}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("app_video_edit.updating", "更新中...")}
                  </>
                ) : (
                  <> {t("app_video_edit.update_button", "更新")}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoForAppEdit;
