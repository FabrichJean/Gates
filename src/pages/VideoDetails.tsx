/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { TitlesForm, type Couple } from "./Upload";
import { useNextVideo, UseVideo, type TVideo } from "../hooks/useVideos";
import { FaCheckDouble, FaPlayCircle } from "react-icons/fa";
import { formatDateFR } from "../utils/date";
import type { Category } from "../components/CategoryAutoComplete";
import CategoryAutoComplete from "../components/CategoryAutoComplete";
import {
  cancelUpload,
  sendProcessing,
  updateVideo,
} from "../api/videos";
import type { SubCategory } from "../hooks/useSubCategory";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
import CreatorAutoComplete from "../components/CreatorAutoComplete";
import CheckingSuperadmin from "../components/CheckingSuperadmin";
// creator is an optional string attribute on video; no creators fetch here
import { useAuthMe } from "../hooks/useAuth";
import useSocketSend from "../hooks/useSocketSend";
import AnimatedAlert from "../components/AnimatedAlert";
import { useAnimatedAlert, createQuickAlert } from "../hooks/useAnimatedAlert";
import { useVideosContext } from "../context/VideosContext";
import { getTagCategoriesApi } from "../api/tagCategory";
import VideoActions from "../components/videos/VideoActions";
import { FiHexagon } from "react-icons/fi";
import { EllipsisVertical, Pencil, Send } from "lucide-react";
import { RoleEnum } from "../utils/roleEnum";

const VideoDetails: React.FC<{ videoIdProp?: string }> = ({ videoIdProp }) => {
  const { data: user } = useAuthMe();
  const { id: routeId } = useParams<{ id: string }>();
  const videoId = videoIdProp || routeId;

  const { data: video, reFetch } = UseVideo(videoId);
  const [videoPlayed, setVideoPlayed] = useState(false);

  const [modifying, setModifying] = useState(false);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const { nextVideo, prevVideo, hasNext, hasPrev } = useNextVideo(routeId);

  const { showAlert, alertProps } = useAnimatedAlert();
  const alert = createQuickAlert(showAlert);

  useSocketSend(reFetch);

  // Mettre à jour l'URL de cover quand les données vidéo changent
  useEffect(() => {
    setCurrentCoverUrl(
      (video?.s3_urls?.coverUrl ||
        video?.public_urls.cover_url ||
        video?.cover) +
        "?t=" +
        Date.now()
    );
    // initialize selected language for titles when video changes
    setSelectedLang(video?.titles?.[0]?.i18_language ?? null);
  }, [video]);

  if (!video)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Video not found</div>
      </div>
    );

  const send = async (videoId: number) => {
    try {
      await sendProcessing(videoId);
      toast.success("✅ upload workflow started");
      reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "❌ Erreur d’envoi !");
    }
  };

  const cancel = async (videoId: number) => {
    await cancelUpload(videoId)
      .then(reFetch)
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });
  };

  return (
    <>
      <AnimatedAlert {...alertProps} />

      {modifying ? (
        <EditVideo
          video={video}
          onSubmit={(newCoverUrl?: string) => {
            setModifying(false);
            if (newCoverUrl) {
              setCurrentCoverUrl(newCoverUrl + "?t=" + Date.now());
            }
            reFetch();
          }}
        />
      ) : (
        <div className="w-full min-h-screen flex justify-center py-10">
          {/* --- FEED CENTRAL --- */}
          <div className="w-full max-w-2xl space-y-4">
            {/* --- CARD SOCIAL MEDIA --- */}
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {/* Indeterminate top bar while processing */}
              {video.processing === "working" && (
                <>
                  <style>{`
                    @keyframes vms-loading {
                      0% { transform: translateX(-100%); }
                      100% { transform: translateX(400%); }
                    }
                  `}</style>
                  <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-t-3xl">
                    <div
                      className="h-full w-1/3 bg-gradient-to-r from-blue-500 via-sky-400 to-blue-500"
                      style={{ animation: "vms-loading 1.2s linear infinite" }}
                    />
                  </div>
                </>
              )}
              {/* HEADER */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar random */}
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={video.creatorObj.avatar || ""}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {video.creatorObj.name}
                      {video?.checking === "checked" ? (
                        <FaCheckDouble className="text-green-600 dark:text-green-400 text-xs" />
                      ) : (
                        <FiHexagon className="text-gray-500 dark:text-gray-400 text-xs" />
                      )}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {formatDateFR(video?.createdAt)} ·{" "}
                      <span className="text-violet-500">
                        {video.type === "1" ? "Short" : "Long"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right controls: Checking + Actions dropdown */}
                <div className="flex items-center gap-2">
                  {/* Actions dropdown: checking, send, edit */}
                  <div className="dropdown dropdown-end">
                    {/* Trigger */}
                    <div
                      tabIndex={46}
                      role="button"
                      className="cursor-pointer rounded-xl px-3 py-2 bg-white dark:bg-gray-800 
                     border border-gray-200 dark:border-gray-700 
                     hover:bg-gray-100 dark:hover:bg-gray-700
                     transition-all flex items-center gap-2 shadow-sm"
                    >
                      <EllipsisVertical className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>

                    {/* DROPDOWN CONTENT */}
                    <div
                      tabIndex={78}
                      className="dropdown-content p-3 shadow-xl bg-white dark:bg-gray-800 
                     rounded-xl w-60 border border-gray-200 dark:border-gray-700
                     backdrop-blur-sm animate-fadeIn space-y-2"
                    >
                      {/* CHECKING (pas de liste) */}
                      <div className="flex items-center justify-between p-2">
                        <CheckingSuperadmin
                          index={1}
                          reFetch={reFetch}
                          video={video}
                          user={user}
                        />
                      </div>

                      {/* SEND */}
                      {user?.role === RoleEnum.SUPERADMIN && <button
                        className="w-full flex items-center p-2 rounded-lg  cursor-pointer
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        onClick={() => {
                          if (video.checking !== "checked") {
                            return alert.warning(
                              "We need to check this video",
                              "Video Check Required"
                            );
                          }
                          if (!video.public_urls?.temp_url) {
                            return toast.error("MP4 not ready yet");
                          }
                          if (
                            video.processing === "working" ||
                            video.processing === "done"
                          )
                            return;

                          send(video.id);
                        }}
                      >
                        <Send className="h-5 w-5 text-green-600" />
                        <span className="ml-3 text-sm font-medium">
                          send
                        </span>
                      </button>}

                      {/* EDIT */}
                      <button
                        className="w-full flex items-center p-2 rounded-lg cursor-pointer
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        onClick={() => setModifying(true)}
                      >
                        <Pencil className="h-5 w-5 text-orange-500" />
                        <span className="ml-3 text-sm font-medium">
                          edit
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <p className="flex gap-2 mt-2">
                    {/* Tag Categories */}
                    {Array.isArray(video.tagCategory) &&
                      video.tagCategory.length > 0 &&
                      video.tagCategory.map((vc) => (
                        <span
                          key={`${vc.id}-${vc.id}`}
                          className="text-sm text-blue-700 dark:text-blue-300"
                          title={
                            vc?.name
                              ? JSON.stringify(vc.VideoTagCategory)
                              : undefined
                          }
                        >
                          #{vc?.name}
                        </span>
                      ))}
                  </p>
                </p>
              </div>

              {/* --- VIDEO CARD --- */}
              <div className="w-full rounded-3xl overflow-hidden shadow-sm relative bg-black max-h-[540px]">
                {videoPlayed ? (
                  <video
                    src={video.s3_urls.hlsUrl || video.public_urls.temp_url}
                    className="w-full max-h-[540px] object-cover"
                    controls
                    autoPlay
                  ></video>
                ) : (
                  <>
                    <FaPlayCircle
                      className="absolute z-20 text-white/90 text-7xl cursor-pointer left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition"
                      onClick={() => setVideoPlayed(true)}
                    />

                    <img
                      src={
                        currentCoverUrl ||
                        video.s3_urls.coverUrl ||
                        video.public_urls.cover_url
                      }
                      alt="cover"
                      className="w-full max-h-[300px] object-cover"
                    />
                  </>
                )}
              </div>
            </div>

            {/* ---- VIDEO INFORMATION SECTION ---- */}
            <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6 transition-all duration-300 mt-8">
              <div className="flex space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 transition-colors duration-300">
                <VideoActions
                  hidetails
                  video={video}
                  user={user ?? null}
                  onSend={send}
                  cancelFn={cancel}
                  reFetchFn={(delay?: number) => {
                    if (delay && delay > 0) {
                      setTimeout(() => {
                        reFetch();
                      }, delay);
                    } else {
                      reFetch();
                    }
                  }}
                />
              </div>
              {/* CDN URLs */}
              {video?.cdn_url && video?.s3_hls_path && (
                <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 transition-colors duration-300">
                  <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    CDN Playback URL
                  </h1>
                  <a className="block w-full font-semibold text-blue-600 dark:text-blue-400 text-xs tracking-wide break-all overflow-hidden">
                    {video?.cdn_url + video?.s3_hls_path}
                  </a>
                </div>
              )}

              {video?.cdn_url && video?.s3_cover_path && (
                <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 transition-colors duration-300">
                  <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    CDN Cover URL
                  </h1>
                  <a className="block w-full font-semibold text-blue-600 dark:text-blue-400 text-xs tracking-wide break-all overflow-hidden">
                    {video?.cdn_url + video?.s3_cover_path}
                  </a>
                </div>
              )}

              {/* Titles & Descriptions with Language Switcher */}
              <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 transition-colors duration-300">
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Titles & Descriptions
                </h1>

                {video?.titles && video.titles.length > 0 ? (
                  <>
                    {/* Language switcher buttons */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {video.titles.map((t: any) => (
                        <button
                          key={t.i18_language || t.language || t.video_id}
                          onClick={() =>
                            setSelectedLang(
                              t.i18_language ?? t.language ?? null
                            )
                          }
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                            (t.i18_language ?? t.language) === selectedLang
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-500"
                          }`}
                        >
                          {(t.i18_language ?? t.language)?.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {/* Current language content */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Title
                        </span>
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {video.titles.find(
                            (x: any) =>
                              (x.i18_language ?? x.language) === selectedLang
                          )?.title ||
                            video.titles[0].title ||
                            "No title available"}
                        </h3>
                      </div>

                      {/* Description section */}
                      {(() => {
                        const currentTitle =
                          video.titles.find(
                            (x: any) =>
                              (x.i18_language ?? x.language) === selectedLang
                          ) || video.titles[0];
                        const description = currentTitle?.description;

                        if (description && description.trim()) {
                          return (
                            <div>
                              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Description
                              </span>
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-1 whitespace-pre-line">
                                {description}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No titles available for this video.
                  </p>
                )}
              </div>

              {/* Author */}
              <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 transition-colors duration-300">
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Author
                </h1>
                <Link
                  to={`/users/${video.user?.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-300"
                >
                  {video.user?.username}
                </Link>
              </div>

              {/* Category */}
              <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 transition-colors duration-300">
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Category
                </h1>
                <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase text-xs tracking-wide">
                  {video?.category?.name} / {video?.subCategory?.name}
                </span>
              </div>
            </div>

            {/* ---- NAVIGATION (prev / next / back) ---- */}
            <div className="flex justify-between py-2 px-4">
              {/* Prev */}
              {hasPrev ? (
                <Link
                  to={"/videos/" + prevVideo}
                  className="px-4 py-2 rounded-xl dark:bg-transparent dark:text-gray-400 dark:border-gray-600 bg-white border shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  ← Prev
                </Link>
              ) : (
                <div className="px-4 py-2 rounded-xl dark:bg-transparent dark:text-gray-400 dark:border-gray-600 bg-white border shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-not-allowed">
                  ← Prev
                </div>
              )}

              {/* Back */}
              <Link
                to="/videos"
                className="px-4 py-2 rounded-xl dark:bg-transparent dark:text-gray-400 dark:border-gray-600 bg-white border shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Back
              </Link>

              {/* Next */}
              {hasNext ? (
                <Link
                  to={"/videos/" + nextVideo}
                  className="px-4 py-2 rounded-xl dark:bg-transparent dark:text-gray-400 dark:border-gray-600 bg-white border shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Next →
                </Link>
              ) : (
                <div className="px-4 py-2 rounded-xl dark:bg-transparent dark:text-gray-400 dark:border-gray-600 bg-white border shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-not-allowed">
                  Next →
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoDetails;

function EditVideo({
  video,
  onSubmit,
}: {
  video: TVideo;
  onSubmit: (newCoverUrl?: string) => void;
}) {
  const ctx = useVideosContext();
  if (!ctx) return null;

  const { reFetch: reFetchVideos } = ctx;

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [coverPreview, setCoverPreview] = useState<string | null>(
    video.public_urls.cover_url
  );
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [duration, setDuration] = useState<number | null>(video?.duration);

  const [category, setCategory] = useState<Category>(video?.category);
  const [subcategory, setSubCategory] = useState<SubCategory>(
    video?.subCategory
  );
  // @ts-ignore
  const [coupleTitles, setCoupleTitles] = useState<Couple[]>(
    video?.titles?.map((title) => ({
      id: title.video_id,
      language: title.language,
      i18_language: title.i18_language,
      title: title.title,
      description: title.description,
    })) || []
  );
  // prefer creatorObj when available; keep both creator name and possible id
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
  const [videoType, setVideoType] = useState<string>(
    video?.type === "1" ? "short" : "long"
  );

  // TagCategory selection (mirror Upload): suggestions + add-by-name + chips
  const [availableTags, setAvailableTags] = useState<Array<{ id?: number; name: string; meta?: any }>>([]);
  const [selectedTagCategories, setSelectedTagCategories] = useState<Array<{ id?: number; name: string; meta?: any }>>(
    Array.isArray((video as any)?.tagCategory)
      ? ((video as any).tagCategory as Array<{ id?: number; name: string; meta?: any }>).map((t) => ({ id: (t as any).id, name: (t as any).name, meta: (t as any).meta ?? null }))
      : []
  );
  const [tagQuery, setTagQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ id?: number; name: string; meta?: any }>>([]);

  useEffect(() => {
    // load available tags
    getTagCategoriesApi()
      .then((res) => {
        const items = (res?.data?.items ?? res?.data ?? []);
        const normalized = (Array.isArray(items) ? items : []).map((it: any) => ({ id: it.id, name: it.name, meta: it.meta ?? null }));
        setAvailableTags(normalized);
        setSuggestions(normalized);
      })
      .catch(() => {
        // silent; keep UI usable
      });
  }, []);

  useEffect(() => {
    if (!tagQuery) {
      setSuggestions(availableTags);
      return;
    }
    const q = tagQuery.toLowerCase();
    setSuggestions(availableTags.filter((t) => t.name.toLowerCase().includes(q)));
  }, [tagQuery, availableTags]);

  const addTagByName = (name: string) => {
    const n = name.trim();
    if (!n) return;
    const exists = selectedTagCategories.find((t) => t.name.toLowerCase() === n.toLowerCase());
    if (exists) return;
    setSelectedTagCategories((s) => [...s, { name: n }]);
    setTagQuery("");
  };

  const addSuggestion = (tag: { id?: number; name: string; meta?: any }) => {
    const existsByName = selectedTagCategories.find((t) => t.name.toLowerCase() === tag.name.toLowerCase());
    const existsById = tag.id ? selectedTagCategories.find((t) => t.id === tag.id) : null;
    if (existsByName || existsById) return;
    setSelectedTagCategories((s) => [...s, { id: tag.id, name: tag.name, meta: tag.meta ?? null }]);
    setTagQuery("");
  };

  const removeSelectedTag = (index: number) => {
    setSelectedTagCategories((s) => s.filter((_, i) => i !== index));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverClick = () => coverInputRef.current?.click();

  const handleSubmit = async () => {
  const formData: any = {
      ...(coverFile && { cover: coverFile }),
      ...(category && { category_id: category.id }),
      ...(subcategory && { sub_category_id: subcategory.id }),
      ...(creatorId ? { creator_id: creatorId } : creator ? { creator } : {}),
      ...(videoType ? { type: videoType === "short" ? "1" : "2" } : {}),
      isShort: videoType === "short",
      titles: JSON.stringify(coupleTitles),
      duration,
      // Build mixed array as expected by server: ids for known tags, objects for name/meta; [] clears all
      tagCategory: (() => {
        if (!selectedTagCategories || selectedTagCategories.length === 0) return JSON.stringify([]);
        const ids: number[] = [];
        const named: Array<{ name: string; meta?: any }> = [];
        selectedTagCategories.forEach((t) => {
          if (typeof t.id === "number") ids.push(t.id);
          else named.push({ name: t.name, ...(t.meta ? { meta: t.meta } : {}) });
        });
        const uniqIds = Array.from(new Set(ids));
        const seen = new Set<string>();
        const uniqNamed = named.filter((n) => {
          const key = n.name.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const mixed: any[] = [...uniqIds, ...uniqNamed];
        return JSON.stringify(mixed.length > 0 ? mixed : []);
      })(),
    };

    try {
      setUploading(true);
      setProgress(0);

      const res = await updateVideo(video.id, formData, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      reFetchVideos();

      toast.success("✅ successfull !");
      console.log("Video updated:", res.data);

      // Si une nouvelle cover a été uploadée, passer la nouvelle URL
      const newCoverUrl = coverFile
        ? res.data?.public_urls?.cover_url || video.public_urls.cover_url
        : undefined;
      onSubmit(newCoverUrl);
    } catch (err: any) {
      console.error(err);
      toast.error("❌ Error: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-6 transition-all duration-300">
      {/* <Toaster position="top-right" /> */}
      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 self-start transition-colors duration-300">
          Edit
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

            {/* TagCategory selection with suggestions (mirrors Upload) */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Tags
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tagQuery}
                    onChange={(e) => setTagQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTagByName(tagQuery);
                      }
                    }}
                    placeholder="Type tag name or select suggestion..."
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 outline-none focus:border-blue-500 transition-all duration-300"
                  />

                  {suggestions && suggestions.length > 0 && tagQuery && (
                    <ul className="absolute z-20 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded mt-1 max-h-48 overflow-y-auto shadow-lg">
                      {suggestions.slice(0, 8).map((s) => (
                        <li
                          key={s.id ?? s.name}
                          onClick={() => addSuggestion(s)}
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
                  onClick={() => addTagByName(tagQuery)}
                  className="px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700"
                >
                  Add
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedTagCategories.map((t, i) => (
                  <span key={`${t.id ?? "new"}-${t.name}-${i}`} className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                    <span>{t.name}</span>
                    <button onClick={() => removeSelectedTag(i)} className="text-red-500">✕</button>
                  </span>
                ))}
              </div>
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
