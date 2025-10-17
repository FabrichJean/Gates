/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { TitlesForm, type Couple } from './Upload';
import { UseVideo, type TVideo } from "../hooks/useVideos";
import { server } from "../constant";
import { FaPlayCircle } from "react-icons/fa";
import { formatDateFR } from "../utils/date";
import type { Category } from "../components/CategoryAutoComplete";
import CategoryAutoComplete from "../components/CategoryAutoComplete";
import { archiveVideo, deletePerm, updateVideo } from "../api/videos";
import type { SubCategory } from "../hooks/useSubCategory";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";

const VideoDetails: React.FC<{ videoIdProp?: string }> = ({ videoIdProp }) => {
  const { id: routeId } = useParams<{ id: string }>();
  const videoId = videoIdProp || routeId;

  const { data: video, reFetch } = UseVideo(videoId);
  const [videoPlayed, setVideoPlayed] = useState(false);

  const [modifying, setModifying] = useState(false);

  const navigate = useNavigate();

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

  return (
    modifying ? <EditVideo video={video} onSubmit={() => {
      setModifying(false);
      reFetch();
    }}/> :
      <div className="flex flex-col md:flex-row gap-8 p-6 items-start justify-center bg-gray-50">
        <Toaster position="top-right" />

        {/* Formulaire */}
        <div className="w-full md:w-[60%] bg-white rounded-lg p-6 border border-gray-200 space-y-6">
          <div className="flex justify-between gap-4 items-center w-full">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">{formatDateFR(video?.createdAt)}</h1>
            <div className="flex gap-2">
              <span className={`bg-gray-500 font-bold text-white text-center py-1 px-2 text-xs rounded ${video?.transfer_status === 0 ? 'opacity-20' : ''}`}>transcoded</span>
              <span className={`bg-yellow-500 font-bold text-white text-center py-1 px-2 text-xs rounded ${video?.upload_status === 0 ? 'opacity-20' : ''}`}>uploaded</span>
            </div>
          </div>
          <div
            className="relative w-full h-max rounded-lg flex items-center justify-center"
          >
            {
              videoPlayed ?
                <video src={server + '/' + video?.temp_url} className="w-full h-auto object-cover rounded-lg" controls autoPlay></video>
                :
                <>
                  <FaPlayCircle className="absolute text-8xl text-white cursor-pointer" onClick={() => setVideoPlayed(true)} />
                  <img src={server + '/' + video?.cover} alt="cover" className="w-full h-auto object-cover rounded-lg" />
                </>
            }
          </div>

          <div className="flex gap-4">
            <button onClick={() => setModifying(true)} className="relative flex items-center justify-center gap-2 px-6 py-2.5
    font-medium text-sm rounded-xl transition-all duration-300
    backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/90 hover:bg-white text-gray-800 border-gray-200 hover:border-gray-300">
              modify
            </button>

            {/* @ts-expect-error */}
            <button onClick={() => document.getElementById('my_modal_6').showModal()} className="btn relative flex items-center justify-center gap-2 px-6 py-2.5
    font-medium text-sm rounded-xl transition-all duration-300
    backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-300 bg-white/90 hover:bg-white text-red-800 border-gray-200 hover:border-gray-300">
              delete
            </button>

            <dialog id="my_modal_6" className="modal modal-bottom sm:modal-middle">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Delete</h3>
                <div className="modal-action">
                  <form method="dialog" className="flex flex-col gap-4 w-full">

                    <div className="px-1 btn w-full" onClick={deleteVideo.bind(null, video.id, 'delete')}>
                      <div className="flex flex-row items-center  justify-center lg:justify-start rounded-md h-12 focus:outline-none pr-3.5  lg:pr-6 font-semibold hover:text-primary-400 cursor-pointer text-red-400 hover:text-red-600">
                        <span className="inline-flex justify-center items-center ml-3.5"></span><span className="ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">delete permanently</span>
                      </div>
                    </div>

                    <div className="px-1 btn w-full" onClick={deleteVideo.bind(null, video.id, 'archive')}>
                      <div className="flex flex-row items-center  justify-center lg:justify-start rounded-md h-12 focus:outline-none pr-3.5  lg:pr-6 font-semibold hover:text-primary-400 cursor-pointer text-red-400 hover:text-red-600">
                        <span className="inline-flex justify-center items-center ml-3.5"></span><span className="ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">archive</span>
                      </div>
                    </div>

                    <button className="btn w-full">cancel</button>
                  </form>
                </div>
              </div>
            </dialog>


          </div>

          <div className="space-y-2 rounded-lg bg-gray-50 p-2 mt-5">
            <h1 className="text-lg font-semibold text-gray-800">Category</h1>
            <span className="w-20 font-semibold text-blue-600 uppercase text-xs tracking-wide">
              {video?.category.name} / {video?.subCategory.name }
            </span>
          </div>

          <div className="space-y-2 rounded-lg bg-gray-50 p-2">
            <h1 className="text-lg font-semibold text-gray-800">Titles</h1>
            {video?.titles?.map((t, i) => (
              <div
                key={i}
                className="flex gap-3 items-center p-2"
              >
                <span className="w-20 font-bold text-blue-600 uppercase text-sm tracking-wide">
                  {t.i18_language} :
                </span>
                <span className="flex-1 text-gray-800 font-medium text-sm">
                  {t.title}
                </span>
              </div>
            ))}
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

  const [coverPreview, setCoverPreview] = useState<string | null>(server + '/' + video?.cover);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<Category>(video?.category);
  const [subcategory, setSubCategory] = useState<SubCategory>(video?.subCategory);
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
      titles: JSON.stringify(coupleTitles)
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
      // navigate('/')
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
    <div className="flex flex-col min-h-screen w-full bg-gray-50 p-6">
      <Toaster position="top-right" />
      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 self-start">
          Edit
        </h1>
        <div className="flex md:flex-row flex-col gap-7 w-max bg-white rounded-lg p-8 border border-gray-200">
          <div className="space-y-6">

            <div>
              <label className="block text-gray-700 font-medium mb-2">Category</label>
              <CategoryAutoComplete defaultValue={category} onSelect={(cat) => setCategory(cat)} />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Sub Category</label>
              <SubCategoryAutoComplete categoryId={category?.id} defaultValue={subcategory} onSelect={(cat) => setSubCategory(cat)} />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Cover Image</label>
              <div
                onClick={handleCoverClick}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition cursor-pointer relative"
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
                      className="h-10 w-10 text-gray-400 mb-2"
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
                    <p className="text-gray-500 text-sm text-center">
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
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          <TitlesForm btnSubmit="✏️ update" coupleTitles={coupleTitles} setCoupleTitles={setCoupleTitles} progress={progress} uploading={uploading} handleSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );

}