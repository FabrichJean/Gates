import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CategoryAutoComplete from "../components/CategoryAutoComplete";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
import CreatorAutoComplete from "../components/CreatorAutoComplete";
import PlatformSelectComponent from "../components/PlatformSelectComponent";
import { I18nField } from "../components/I18nComponents";
import TagCategoryVideoForApp from "../components/TagCategoryVideoForApp";
import type { TranslatedText } from "../types/i18n";
import type { Category } from "../components/CategoryAutoComplete";
import type { SubCategory } from "../hooks/useSubCategory";
import type { Platform } from "../hooks/usePlatform";
import { UseAppVideo } from "../hooks/app/useAppVideos";
import { updateVideoForApp } from "../api/videoForApp";
import { usePlatformReactive } from "../hooks/usePlatform";

function VideoForAppEdit() {
  const { id: videoId } = useParams<{ id: string }>();
  const { data: video } = UseAppVideo(videoId);
  const { data: platforms } = usePlatformReactive();

  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [duration, setDuration] = useState<number | null>(null);

  // Update duration when video data loads
  useEffect(() => {
    if (video?.seconds !== undefined) {
      setDuration(video.seconds);
    }
  }, [video]);

  // Convert VideoForApp titles to TranslatedText format for I18nField
  const [titles, setTitles] = useState<TranslatedText>(() => {
    if (video?.titles && Array.isArray(video.titles)) {
      // Convert Title[] array to TranslatedText object
      const translatedTitles: TranslatedText = {};
      video.titles.forEach((titleObj) => {
        if (titleObj.i18_language && titleObj.title) {
          translatedTitles[titleObj.i18_language as keyof TranslatedText] = titleObj.title;
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
            translatedTitles[titleObj.i18_language as keyof TranslatedText] = titleObj.title;
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

  // Update creator when video data loads
  useEffect(() => {
    if (video?.creatorObj) {
      setCreator(video.creatorObj.name);
      setCreatorId(video.creatorObj.id);
    }
  }, [video?.creatorObj]);

  // Category and SubCategory states
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubCategory] = useState<SubCategory | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);

  // Tag Category Videos states
  const [selectedTags, setSelectedTags] = useState<(number | { name: string })[]>([]);

  // Update category, subcategory, platform and tags when video data loads
  useEffect(() => {
    if (video?.categories) {
      setCategory(video.categories.find(cat => cat.code === "en"));
    }
    if (video?.sub_categories) {
      setSubCategory(video.sub_categories.find(sub => sub.code === "en"));
    }
    if (video?.tagCategoryVideos) {
      setSelectedTags(video.tagCategoryVideos.map(tag => tag.id));
    }
  }, [video]);

  // Update platform when video or platforms data changes
  useEffect(() => {
    if (video?.plateform_id && platforms.length > 0) {
      // Find the platform object that matches the video's platform ID
      const videoPlatform = platforms.find(p => p.id === video.plateform_id);
      if (videoPlatform) {
        setPlatform(videoPlatform);
      }
    }
  }, [video?.plateform_id, platforms]);

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
        toast.error("Video id not available yet. Try again.");
        return;
      }

      await updateVideoForApp(targetId, {
        seconds: duration,
        creator_id: creatorId,
        category_id: category?.id,
        sub_category_id: subcategory?.id,
        plateform_id: platform?.id,
        cn_title: titlesData.cn_title,
        en_title: titlesData.en_title,
        hi_title: titlesData.hi_title,
        tag_category_ids: selectedTags,
      });

      toast.success("✅ Updated successfully!");
      navigate(`/app-videos/${video.id}`);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-6 transition-all duration-300">
      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 self-start transition-colors duration-300">
          Edit App Video {video?.id}
        </h1>
        <div className="flex flex-col gap-7 w-full bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300">
          <div className="space-y-6">
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
                Category
              </label>
              <CategoryAutoComplete
                defaultValue={category}
                onSelect={setCategory}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Sub Category
              </label>
              <SubCategoryAutoComplete
                categoryId={category?.id}
                defaultValue={subcategory}
                onSelect={setSubCategory}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Platform
              </label>
              <PlatformSelectComponent
                defaultValue={platform}
                onSelect={setPlatform}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Duration (seconds)
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
                onTagSelect={(tag) => setSelectedTags(prev => [...prev, tag])}
                onTagDeselect={(tag) => setSelectedTags(prev => prev.filter(t => {
                  if (typeof tag === 'number' && typeof t === 'number') {
                    return t !== tag;
                  } else if (typeof tag === 'object' && typeof t === 'object') {
                    return t.name !== tag.name;
                  }
                  return true;
                }))}
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
                label="Titles"
                placeholder="Enter title..."
                supportedLanguages={['zh', 'en', 'hi']}
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
                    Updating...
                  </>
                ) : (
                  <>
                    ✏️ Update
                  </>
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
