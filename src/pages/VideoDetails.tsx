/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TitlesForm, type Couple } from './Upload';
import { useNextVideo, UseVideo, type TVideo } from "../hooks/useVideos";
import { FaPlayCircle } from "react-icons/fa";
import { formatDateFR } from "../utils/date";
import type { Category } from "../components/CategoryAutoComplete";
import CategoryAutoComplete from "../components/CategoryAutoComplete";
import { archiveVideo, cancelUpload, deletePerm, sendProcessing, updateVideo } from "../api/videos";
import type { SubCategory } from "../hooks/useSubCategory";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
import CheckingSuperadmin from "../components/CheckingSuperadmin";
import { useAuthMe } from "../hooks/useAuth";
import RoleEnum from "../utils/roleEnum";
import useSocketSend from "../hooks/useSocketSend";

const VideoDetails: React.FC<{ videoIdProp?: string }> = ({ videoIdProp }) => {
  const { data: user } = useAuthMe();
  const { id: routeId } = useParams<{ id: string }>();
  const videoId = videoIdProp || routeId;

  const { data: video, reFetch } = UseVideo(videoId);
  const [videoPlayed, setVideoPlayed] = useState(false);

  const [modifying, setModifying] = useState(false);

  const { nextVideo } = useNextVideo(routeId)

  const navigate = useNavigate();

  useSocketSend(reFetch);

  console.log(video);

  if (!video)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Video not found</div>
      </div>
    );

  const deleteVideo = async (id: string | number, type: 'archive' | 'delete') => {
    try {
      if (type === 'archive') {
        await archiveVideo(id);
        toast.success('Video archived successfully');
        navigate('/videos');
      } else {
        await deletePerm(id);
        toast.success('Video deleted successfully');
        navigate('/videos');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Error deleting video');
    }
  };


  const send = async (videoId: number) => {

    try {
      await sendProcessing(videoId);
      toast.success("✅ upload workflow started");
      reFetch();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "❌ Erreur d’envoi !");
    }
  };

  const cancel = async (videoId: number) => {
    await cancelUpload(videoId)
      .then(reFetch)
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      })
  }


  return (
    modifying ? <EditVideo video={video} onSubmit={() => {
      setModifying(false);
      reFetch();
    }} /> :
      <div className="flex flex-col md:flex-row gap-8 p-6 items-start justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
        <Toaster position="top-right" />

        {/* Formulaire */}
        <div className="w-full md:w-[60%] bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6 transition-all duration-300">
          <div className="flex justify-between gap-4 items-center w-full">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 transition-colors duration-300">{formatDateFR(video?.createdAt)}</h1>
            <div className="flex gap-2">
              <CheckingSuperadmin index={video.id} reFetch={reFetch} video={video} user={user} />
              {/* <span className={`bg-zinc-500 font-bold text-white text-center py-1 px-2 text-xs rounded`}>{video.checking === 'null' ? 'not ready' : video.checking}</span> */}
            </div>
          </div>
          <div
            className="relative w-full h-max rounded-lg flex items-center justify-center"
          >
            {
              videoPlayed ?
                <video src={video.public_urls.temp_url} className="w-full h-auto object-cover rounded-lg" controls autoPlay></video>
                :
                <>
                  <FaPlayCircle className="absolute text-8xl text-white cursor-pointer" onClick={() => setVideoPlayed(true)} />
                  <img src={video.public_urls.cover_url} alt="cover" className="w-full h-auto object-cover rounded-lg" />
                </>
            }
          </div>

          <div className="flex flex-wrap gap-4 w-full">
            {
              video.checking !== 'refused' ?
                <button onClick={() => setModifying(true)} className="relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5
    font-medium text-sm rounded-md transition-all duration-300
    backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 flex-shrink-0">
                  modify
                </button>
                :
                <Link to={'/touch/' + videoId} className="btn flex-shrink-0">touch again</Link>
            }

            {user?.role === RoleEnum.SUPERADMIN && (
              <div className="relative flex items-center gap-3">
                <button
                  disabled={video.processing === 'working' || video.processing === 'done'}
                  onClick={() => {
                    if (video.checking !== 'checked') {
                      return alert("We need to check this video");
                    }
                    send(video.id);
                  }}
                  className={`relative flex w-[150px] items-center justify-center gap-2 px-6 py-2.5 font-medium text-sm rounded-xl transition-all duration-300 ${video.processing === 'working'
                    ? "cursor-not-allowed bg-gray-100 text-gray-500"
                    : "cursor-pointer bg-white/90 hover:bg-white text-gray-800 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    }`}
                >
                  {video.processing === 'working' ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : video.upload_status === 1 && video.transfer_status === 1 ? (
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
                    <span className="underline hover:text-blue-500">🚀 Send</span>
                  )}
                </button>

                {/* --- BOUTON ANNULER --- */}
                {video.processing === 'working' && (
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    Annuler
                  </button>
                )}
              </div>
            )}

            <Link to={'/videos/' + nextVideo} className="relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5
    font-medium text-sm rounded-md transition-all duration-300
    backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 flex-shrink-0">
              next
            </Link>

            <Link to={'/videos'} className="relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5
        font-medium text-sm rounded-md transition-all duration-300
        backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="sm:hidden">←</span>
              <span className="hidden sm:inline">Retour</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <dialog id="my_modal_6" className="modal modal-bottom sm:modal-middle">
              <div className="modal-box bg-white dark:bg-gray-800 border dark:border-gray-700">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Delete</h3>
                <div className="modal-action">
                  <form method="dialog" className="flex flex-col gap-4 w-full">

                    <div className="px-1 btn w-full bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 border dark:border-gray-600" onClick={deleteVideo.bind(null, video.id, 'delete')}>
                      <div className="flex flex-row items-center  justify-center lg:justify-start rounded-md h-12 focus:outline-none pr-3.5  lg:pr-6 font-semibold hover:text-primary-400 cursor-pointer text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
                        <span className="inline-flex justify-center items-center ml-3.5"></span><span className="ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">delete permanently</span>
                      </div>
                    </div>

                    <div className="px-1 btn w-full bg-white dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 border dark:border-gray-600" onClick={deleteVideo.bind(null, video.id, 'archive')}>
                      <div className="flex flex-row items-center  justify-center lg:justify-start rounded-md h-12 focus:outline-none pr-3.5  lg:pr-6 font-semibold hover:text-primary-400 cursor-pointer text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
                        <span className="inline-flex justify-center items-center ml-3.5"></span><span className="ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">archive</span>
                      </div>
                    </div>

                    <button className="btn w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">cancel</button>
                  </form>
                </div>
              </div>
            </dialog>


          </div>

          {video?.cdn_url && video?.s3_hls_path && <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2 mt-5 transition-colors duration-300">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">CDN playback URL</h1>
            <a className="w-20 font-semibold text-blue-600 dark:text-blue-400 uppercase text-xs tracking-wide">
              {video?.cdn_url + video?.s3_hls_path}
            </a>
          </div>}

          {video?.cdn_url && video?.s3_cover_path && <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2 mt-5 transition-colors duration-300">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">CDN Cover URL</h1>
            <a className="w-20 font-semibold text-blue-600 dark:text-blue-400 uppercase text-xs tracking-wide">
              {video?.cdn_url + video?.s3_cover_path}
            </a>
          </div>}

          <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2 mt-5 transition-colors duration-300">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Author</h1>
            <Link
              to={`/users/${video.user?.id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-300"
            >
              {video.user?.username}
            </Link>
          </div>

          <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2 transition-colors duration-300">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Titles</h1>
            {video?.titles?.map((t, i) => (
              <div
                key={i}
                className="flex gap-3 items-center p-2"
              >
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
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Category</h1>
            <span className="w-20 font-semibold text-blue-600 dark:text-blue-400 uppercase text-xs tracking-wide">
              {video?.category?.name} / {video?.subCategory?.name}
            </span>
          </div>

        </div>

        <div className="w-full md:w-[35%] flex flex-col gap-4" />
      </div>
  );
};

export default VideoDetails;

function EditVideo({ video, onSubmit }: { video: TVideo, onSubmit: () => void }) {

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [coverPreview, setCoverPreview] = useState<string | null>(video.public_urls.cover_url);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [duration, setDuration] = useState<number | null>(video?.duration);

  const [category, setCategory] = useState<Category>(video?.category);
  const [subcategory, setSubCategory] = useState<SubCategory>(video?.subCategory);
  // @ts-ignore
  const [coupleTitles, setCoupleTitles] = useState<Couple[]>(video?.titles || []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverClick = () => coverInputRef.current?.click();

  const handleSubmit = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formData: any = {
      ...(coverFile && { cover: coverFile }),
      ...(category && { category_id: category.id }),
      ...(subcategory && { sub_category_id: subcategory.id }),
      titles: JSON.stringify(coupleTitles),
      duration
    };

    try {
      setUploading(true);
      setProgress(0);

      console.log(formData.titles);


      const res = await updateVideo(video.id, formData, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      toast.success("✅ successfull !");
      console.log("Video updated:", res.data);
      onSubmit();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <Toaster position="top-right" />
      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 self-start transition-colors duration-300">
          Edit
        </h1>
        <div className="flex md:flex-row flex-col gap-7 w-max bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300">
          <div className="space-y-6">

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">Category</label>
              <CategoryAutoComplete defaultValue={category} onSelect={(cat) => setCategory(cat)} />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">Sub Category</label>
              <SubCategoryAutoComplete categoryId={category?.id} defaultValue={subcategory} onSelect={(cat) => setSubCategory(cat)} />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">Duration ( ms)</label>
              <input type="number" className="input w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300" defaultValue={duration || 0} onChange={(e) => setDuration(Number(e.currentTarget.value))} />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">Cover Image</label>
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
                <div className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-colors duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          <TitlesForm btnSubmit="✏️ update" coupleTitles={coupleTitles} setCoupleTitles={setCoupleTitles} progress={progress} uploading={uploading} handleSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );


}