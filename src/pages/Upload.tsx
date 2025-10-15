import React, { useEffect, useRef, useState } from "react";
import LanguageAutoComplete from "../components/LanguageAutoComplete";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { apiURL } from "../constant/index"
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import CategoryAutoComplete, { type Category } from "../components/CategoryAutoComplete";
import { uploadVideo } from "../api/videos";


export type Couple = {
  id: any; i18_language: string; title: string, name?: string
};

export function TitlesForm({ onChange, progress, uploading, handleSubmit: submit, defaultCouples, btnSubmit }: { defaultCouples?: Couple[], btnSubmit?: string, onChange: (couples: Couple[]) => void, uploading?: boolean, progress?: number, handleSubmit: () => void }) {
  const [couples, setCouples] = useState<Couple[]>(defaultCouples || []);

  console.log('couples', btnSubmit, couples);


  const handleChange = (index: number, field: keyof Couple, value: string) => {
    const newCouples = [...couples];
    newCouples[index][field] = value;
    setCouples(newCouples);
    onChange(newCouples);
  };

  const addCouple = () => setCouples([...couples, { id: null, i18_language: '', title: '' }]);

  const removeCouple = (index: number) => {
    setCouples((prev) => prev.filter((_, i) => i !== index));
    const newCouples = [...couples];
    onChange(newCouples);
  };

  const handleSubmit = () => {
    submit()
  };

  return (
    <div onSubmit={handleSubmit} className="w-max md:min-w-xl p-4 space-y-4">

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 tracking-wide">
          Titles
        </label>

        <button
          type="button"
          onClick={addCouple}
          className="flex items-center justify-center w-8 h-8 rounded-xl 
      bg-white border border-gray-200 shadow-sm 
      hover:border-gray-300 hover:shadow-md 
      transition-all duration-200 ease-in-out 
      text-gray-700 hover:text-blue-600 
      focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>


      {couples.map((c, i) => (
        <div
          key={i}
          className="flex gap-2 items-center p-4 px-0"
        >
          <LanguageAutoComplete defaultValue={{ code: c.i18_language, name: c.name! }} onSelect={(lang) => handleChange(i, 'i18_language', lang.code)} />
          <input
            type="text"
            placeholder="Title"
            value={c.title}
            onChange={(e) => handleChange(i, 'title', e.target.value)}
            className="flex-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none p-2 bg-transparent"
            required
          />
          <button type="button" onClick={() => removeCouple(i)} className="text-red-500 hover:text-red-700">
            <TrashIcon className="w-6 h-6" />
          </button>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={uploading}
        className={`relative flex items-center justify-center gap-2 px-6 py-2.5
    font-medium text-sm rounded-xl transition-all duration-300
    backdrop-blur-md border border-transparent cursor-pointer
    ${uploading
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white/90 hover:bg-white text-gray-800 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
          } focus:outline-none focus:ring-2 focus:ring-blue-300`}
      >
        {uploading ? (
          <>
            <span className="flex items-center gap-2 text-gray-600">
              <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
              progressing... {progress}%
            </span>
          </>
        ) : (
          <>
            <span className="underline hover:text-blue-500">{btnSubmit ? btnSubmit : '🚀 Publish'}</span>
          </>
        )}
      </button>

    </div>
  );
}


const Upload = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ref, setRef] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<Category>();
  const [coupleTitles, setCoupleTitles] = useState<Couple[]>([]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverClick = () => coverInputRef.current?.click();
  const handleVideoClick = () => videoInputRef.current?.click();

  const handleSubmit = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formData: any = {
      ...(videoFile && { video: videoFile }),
      ...(coverFile && { cover: coverFile }),
      ...(category && { category_id: category.id }),
      ...(ref && { ref }),
      titles: JSON.stringify(coupleTitles),
    };


    try {
      setUploading(true);
      setProgress(0);

      console.log(formData.titles);


      const res = await uploadVideo(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      toast.success("✅ Upload réussi !");
      console.log("Video uploaded:", res.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error("❌ Erreur lors de l'upload : " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // useEffect(() => {
  //   window.location.tit
  // })

  return (
    <div className="bg-gray-50">
      <Toaster position="top-right" />
      {/* <h1 className="text-2xl font-semibold text-gray-800 flex items-center p-6">
        Upload
      </h1> */}
      <div className="flex flex-col flex-wrap md:flex-row gap-8 p-6 items-start justify-center">
        <div className="flex md:flex-row flex-col flex-wrap gap-7 w-max bg-white rounded-lg p-8 border border-gray-200">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Ref</label>
              <input
                type="text"
                value={ref || ""}
                onChange={(e) => setRef(e.target.value)}
                placeholder=""
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Category</label>
              <CategoryAutoComplete onSelect={(cat) => setCategory(cat)} />
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

            {/* Video */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Video</label>
              <div
                onClick={handleVideoClick}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition cursor-pointer"
              >
                {videoPreview ? (
                  <video
                    src={videoPreview}
                    controls
                    className="rounded-lg w-full max-h-56 object-cover"
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
                        d="M14.752 11.168l-4.197-2.398A1 1 0 009 9.618v4.764a1 1 0 001.555.832l4.197-2.398a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-500 text-sm text-center">
                      Drag or select an MP4 file
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/mp4"
                  onChange={handleVideoChange}
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

          <TitlesForm onChange={(titles) => setCoupleTitles(titles)} progress={progress} uploading={uploading} handleSubmit={handleSubmit} />
        </div>

        <div className="w-full md:w-[35%] flex flex-col gap-4">

        </div>
      </div>
    </div>
  );
};

export default Upload;
