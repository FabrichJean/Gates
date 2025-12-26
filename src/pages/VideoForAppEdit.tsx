import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CreatorAutoComplete from "../components/CreatorAutoComplete";
import { I18nField } from "../components/I18nComponents";
import type { TranslatedText } from "../types/i18n";
import { UseAppVideo } from "../hooks/app/useAppVideos";
import { updateVideoForApp } from "../api/videoForApp";
import { getTagCategoriesApi } from "../api/tagCategory";

function VideoForAppEdit() {
  const { id: videoId } = useParams<{ id: string }>();
  const { data: video } = UseAppVideo(videoId);

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
        cn_title: titlesData.cn_title,
        en_title: titlesData.en_title,
        hi_title: titlesData.hi_title,
      });

      toast.success("✅ Updated successfully!");
      navigate(`/app-videos/${video.id}`);
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
  >([]);

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
      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 self-start transition-colors duration-300">
          Edit App Video {video?.id}
        </h1>
        <div className="flex md:flex-row flex-col gap-7 w-max bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300">
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
                Duration (seconds)
              </label>
              <input
                type="number"
                className="input w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                value={duration}
                onChange={(e) => setDuration(Number(e.currentTarget.value))}
              />
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
                        {postTagSuggestions.slice(0, 8).map((s) => (
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titles
              </label>
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
