/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TitlesForm, type Couple } from "./Upload";
import { useNextVideo, UseVideo, type TVideo } from "../hooks/useVideos";
import { FaPlayCircle } from "react-icons/fa";
import { formatDateFR } from "../utils/date";
import type { Category } from "../components/CategoryAutoComplete";
import CategoryAutoComplete from "../components/CategoryAutoComplete";
import {
  archiveVideo,
  cancelUpload,
  deletePerm,
  sendProcessing,
  updateVideo,
} from "../api/videos";
import type { SubCategory } from "../hooks/useSubCategory";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
import CreatorAutoComplete from "../components/CreatorAutoComplete";
import CheckingSuperadmin from "../components/CheckingSuperadmin";
// creator is an optional string attribute on video; no creators fetch here
import { useAuthMe } from "../hooks/useAuth";
import RoleEnum from "../utils/roleEnum";
import useSocketSend from "../hooks/useSocketSend";
import AnimatedAlert from "../components/AnimatedAlert";
import { useAnimatedAlert, createQuickAlert } from "../hooks/useAnimatedAlert";
import { useVideosContext } from "../context/VideosContext";
import { getTagCategoriesApi } from "../api/tagCategory";

const VideoDetails: React.FC<{ videoIdProp?: string }> = ({ videoIdProp }) => {
  const { data: user } = useAuthMe();
  const { id: routeId } = useParams<{ id: string }>();
  const videoId = videoIdProp || routeId;

  const { data: video, reFetch } = UseVideo(videoId);
  const [videoPlayed, setVideoPlayed] = useState(false);

  const [modifying, setModifying] = useState(false);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);

  const { nextVideo, prevVideo, hasNext, hasPrev } = useNextVideo(routeId);

  const navigate = useNavigate();

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
  }, [video]);

  if (!video)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Video not found</div>
      </div>
    );

  const deleteVideo = async (
    id: string | number,
    type: "archive" | "delete"
  ) => {
    try {
      if (type === "archive") {
        await archiveVideo(id);
        toast.success("Video archived successfully");
        navigate("/videos");
      } else {
        await deletePerm(id);
        toast.success("Video deleted successfully");
        navigate("/videos");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error deleting video");
    }
  };

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
        <div className="flex flex-col md:flex-row gap-8 p-6 items-start justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
          {/* <Toaster position="top-right" /> */}

          {/* Formulaire */}
          <div className="w-full md:w-[60%] bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6 transition-all duration-300">
            <div className="flex justify-between gap-4 items-center w-full">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 transition-colors duration-300">
                {formatDateFR(video?.createdAt)}
              </h2>
              <div className="flex gap-2">
                <span className=" px-3 py-1 text-xs rounded-md bg-indigo-600 text-white">
                  {video.type === "1" ? "short" : "long"}
                </span>
                <CheckingSuperadmin
                  index={0}
                  reFetch={reFetch}
                  video={video}
                  user={user}
                />
                <Link to={`/touch/video/${video.id}`}>edit with video</Link>
              </div>
            </div>
            <div className="relative w-full h-[400px] rounded-lg flex items-center justify-center bg-black">
              {videoPlayed ? (
                <video
                  src={video.s3_urls.hlsUrl || video.public_urls.temp_url}
                  className="w-full h-full object-cover rounded-lg"
                  controls
                  autoPlay
                ></video>
              ) : (
                <>
                  <FaPlayCircle
                    className="absolute text-8xl text-white cursor-pointer z-10"
                    onClick={() => setVideoPlayed(true)}
                  />
                  <img
                    src={
                      currentCoverUrl ||
                      video.s3_urls.coverUrl ||
                      video.public_urls.cover_url
                    }
                    alt="cover"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4 w-full">
              {video.checking !== "refused" ? (
                <button
                  onClick={() => setModifying(true)}
                  className="relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5
    font-medium text-sm rounded-md transition-all duration-300
    backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 flex-shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  modify
                </button>
              ) : (
                <Link
                  to={"/touch/video/" + videoId}
                  className="btn flex-shrink-0 relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5
    font-medium text-sm rounded-md transition-all duration-300
    backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  touch again
                </Link>
              )}

              {user?.role === RoleEnum.SUPERADMIN && (
                <div className="relative flex items-center gap-3">
                  <button
                    disabled={
                      video.processing === "working" ||
                      video.processing === "done"
                    }
                    onClick={() => {
                      if (video.checking !== "checked") {
                        return alert.warning(
                          "We need to check this video",
                          "Video Check Required"
                        );
                      }
                      send(video.id);
                    }}
                    className={`relative flex w-[150px] items-center justify-center gap-2 px-6 py-2.5 font-medium hover:text-blue-500 text-sm rounded-md transition-all duration-300 ${
                      video.processing === "working" ||
                      (video.upload_status === 1 && video.transfer_status === 1)
                        ? "cursor-not-allowed bg-gray-100 dark:bg-gray-100/10 text-gray-500"
                        : "cursor-pointer bg-transparent hover:bg-white text-gray-700 dark:text-gray-100 border border-blue-300 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    }`}
                  >
                    {video.processing === "working" ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : video.upload_status === 1 &&
                      video.transfer_status === 1 ? (
                      <span className="text-green-600 font-semibold flex gap-1 items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                        Uploaded
                      </span>
                    ) : (
                      <span className="hover:text-blue-500 flex gap-3 items-center">
                        <span>🚀</span>
                        <span>Send</span>
                      </span>
                    )}
                  </button>

                  {/* --- BOUTON ANNULER --- */}
                  {video.processing === "working" && (
                    <button
                      onClick={cancel.bind(null, video.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md transition-all duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                      Cancel
                    </button>
                  )}
                </div>
              )}

              {hasPrev ? (
                <Link
                  to={"/videos/" + prevVideo}
                  className="relative flex items-center justify-center gap-2 px-4 py-2
    font-medium text-sm rounded-md transition-all duration-300
    bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 
    text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 
    hover:border-blue-300 dark:hover:border-blue-600 flex-shrink-0 min-w-[90px]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  prev
                </Link>
              ) : (
                <div
                  className="relative flex items-center justify-center gap-2 px-4 py-2
    font-medium text-sm rounded-md transition-all duration-300
    bg-gray-100 dark:bg-gray-800 
    text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 
    flex-shrink-0 min-w-[90px] cursor-not-allowed opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  prev
                </div>
              )}

              {hasNext ? (
                <Link
                  to={"/videos/" + nextVideo}
                  className="relative flex items-center justify-center gap-2 px-4 py-2
    font-medium text-sm rounded-md transition-all duration-300
    bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 
    text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 
    hover:border-blue-300 dark:hover:border-blue-600 flex-shrink-0 min-w-[90px]"
                >
                  next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ) : (
                <div
                  className="relative flex items-center justify-center gap-2 px-4 py-2
    font-medium text-sm rounded-md transition-all duration-300
    bg-gray-100 dark:bg-gray-800 
    text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 
    flex-shrink-0 min-w-[90px] cursor-not-allowed opacity-50"
                >
                  next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}

              <Link
                to={"/videos"}
                className="relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5
        font-medium text-sm rounded-md transition-all duration-300
        backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 hidden sm:block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                <span className="sm:hidden">←</span>
                <span className="hidden sm:inline">Back</span>
                <span className="sm:hidden">Back</span>
              </Link>

              <dialog
                id="my_modal_6"
                className="modal modal-bottom sm:modal-middle"
              >
                <div className="modal-box bg-white dark:bg-gray-800 border dark:border-gray-700">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    Delete
                  </h3>
                  <div className="modal-action">
                    <form
                      method="dialog"
                      className="flex flex-col gap-4 w-full"
                    >
                      <div
                        className="px-1 btn w-full bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 border dark:border-gray-600"
                        onClick={deleteVideo.bind(null, video.id, "delete")}
                      >
                        <div className="flex flex-row items-center  justify-center lg:justify-start rounded-md h-12 focus:outline-none pr-3.5  lg:pr-6 font-semibold hover:text-primary-400 cursor-pointer text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
                          <span className="inline-flex justify-center items-center ml-3.5"></span>
                          <span className="ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">
                            delete permanently
                          </span>
                        </div>
                      </div>

                      <div
                        className="px-1 btn w-full bg-white dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 border dark:border-gray-600"
                        onClick={deleteVideo.bind(null, video.id, "archive")}
                      >
                        <div className="flex flex-row items-center  justify-center lg:justify-start rounded-md h-12 focus:outline-none pr-3.5  lg:pr-6 font-semibold hover:text-primary-400 cursor-pointer text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
                          <span className="inline-flex justify-center items-center ml-3.5"></span>
                          <span className="ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">
                            archive
                          </span>
                        </div>
                      </div>

                      <button className="btn w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                        cancel
                      </button>
                    </form>
                  </div>
                </div>
              </dialog>
            </div>

            {video?.cdn_url && video?.s3_hls_path && (
              <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2 mt-5 transition-colors duration-300">
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  CDN playback URL
                </h1>
                <a className="block w-full font-semibold text-blue-600 dark:text-blue-400 text-xs tracking-wide break-all overflow-hidden">
                  {video?.cdn_url + video?.s3_hls_path}
                </a>
              </div>
            )}

            {video?.cdn_url && video?.s3_cover_path && (
              <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2 mt-5 transition-colors duration-300">
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  CDN Cover URL
                </h1>
                <a className="block w-full font-semibold text-blue-600 dark:text-blue-400 text-xs tracking-wide break-all overflow-hidden">
                  {video?.cdn_url + video?.s3_cover_path}
                </a>
              </div>
            )}

            <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2 mt-5 transition-colors duration-300">
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

            {(video as any)?.creatorObj && (
              <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2 transition-colors duration-300">
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Creator
                </h1>
                <div className="flex items-center gap-3">
                  {(video as any).creatorObj.avatar ? (
                    <img
                      src={video.creatorObj.avatar!}
                      alt={video.creatorObj.name!}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500">
                      No
                    </div>
                  )}
                  <div>
                    <div className="text-gray-800 dark:text-gray-200 font-medium">
                      {(video as any).creatorObj.name}
                    </div>
                    {(video as any).creatorObj.gender && (
                      <div className="text-xs text-gray-500">
                        {(video as any).creatorObj.gender}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2 transition-colors duration-300">
              <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Titles
              </h1>
              {video?.titles?.map((t, i) => (
                <div key={i} className="flex gap-3 items-center p-2">
                  <span className="w-20 font-bold text-blue-600 dark:text-blue-400 uppercase text-sm tracking-wide">
                    {t.i18_language} :
                  </span>
                  <span className="flex-1 text-gray-800 dark:text-gray-200 font-medium text-sm">
                    {t.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2 mt-5 transition-colors duration-300">
              <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Category
              </h1>
              <span className="w-20 font-semibold text-blue-600 dark:text-blue-400 uppercase text-xs tracking-wide">
                {video?.category?.name} / {video?.subCategory?.name}
              </span>
            </div>
          </div>

          <div className="w-full md:w-[35%] flex flex-col gap-4" />
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
    video?.titles?.map((title, index) => ({
      id: title.id, // or title.video_id if that's more appropriate
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
      tagCategory: JSON.stringify(
        selectedPostTagCategories.map((t) => ({
          id: t.id ?? null,
          name: t.name,
        }))
      ),
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
    video.tagCategory?.map((t: any) => ({
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
                Creator (optional)
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
