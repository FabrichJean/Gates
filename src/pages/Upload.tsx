/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";
import LanguageAutoComplete from "../components/LanguageAutoComplete";
import toast from "react-hot-toast";
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import CategoryAutoComplete, { type Category } from "../components/CategoryAutoComplete";
import { uploadVideo } from "../api/videos";
import { useNavigate } from "react-router-dom";
import type { SubCategory } from "../hooks/useSubCategory";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
import { useAuthMe } from "../hooks/useAuth";
import UsePlateform from "../hooks/usePlateform";
import { Md5 } from 'ts-md5';
import PlatformSelectComponent from "../components/PlatformSelectComponent";
import type { Platform } from "../hooks/usePlatform";


export type Couple = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any; i18_language: string; title: string, name?: string; description?: string
};


export function TitlesForm({ progress, uploading, handleSubmit: submit, btnSubmit, coupleTitles, setCoupleTitles }: { coupleTitles: Couple[], setCoupleTitles: React.Dispatch<React.SetStateAction<Couple[]>>, btnSubmit?: string, uploading?: boolean, progress?: number, handleSubmit: () => void }) {
  console.log(coupleTitles);

  const handleChange = (index: number, field: keyof Couple, value: string) => {
    const newCouples = [...coupleTitles];
    newCouples[index][field] = value;
    setCoupleTitles(newCouples);
  };

  const addCouple = () => setCoupleTitles((c) => [...c, { id: null, i18_language: '', title: '' }]);

  const removeCouple = (index: number) => {
    setCoupleTitles((prev) => prev.filter((_, i) => i !== index));
    // const newCouples = [...newCouples];
  };

  const handleSubmit = () => {
    submit()
  };

  return (
    <div onSubmit={handleSubmit} className="w-max md:min-w-xl p-4 space-y-4">

      <div className="flex items-center gap-3">
        <label className="font-sans text-sm font-medium text-gray-700 dark:text-gray-300 tracking-wide antialiased transition-colors duration-300">
          Titles
        </label>

        <button
          type="button"
          onClick={addCouple}
          className="flex items-center justify-center w-8 h-8 rounded-xl 
      bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm 
      hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md 
      transition-all duration-200 ease-in-out 
      text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 
      focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer hover:scale-105"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>


      {coupleTitles?.map((c, i) => (
        <div
          key={i}
          className="flex flex-col justify-start gap-5 items-end p-4 px-0"
        >
          <div className="flex gap-2 items-center w-full">
            {/* @ts-expect-error */}
            <LanguageAutoComplete defaultValue={{ code: c?.language?.title, name: c?.language?.name! }} onSelect={(lang) => handleChange(i, 'i18_language', lang.code)} />
            <input
              type="text"
              placeholder="Title"
              value={c.title}
              onChange={(e) => handleChange(i, 'title', e.target.value)}
              className="font-sans flex-1 border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none p-2 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 antialiased transition-all duration-300"
              required
            />
          </div>
          <textarea
            placeholder="Description"
            value={c.description}
            onChange={(e) => handleChange(i, 'description', e.target.value)}
            className="font-sans w-full border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none p-2 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 antialiased transition-all duration-300"
          />
          <button type="button" onClick={() => removeCouple(i)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-300">
            <TrashIcon className="w-6 h-6" />
          </button>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={uploading}
        className={`font-sans relative flex items-center justify-center gap-2 px-6 py-2.5
    font-medium text-sm rounded-md transition-all duration-300
    backdrop-blur-md border cursor-pointer antialiased tracking-wide
    ${uploading
            ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-400 dark:border-gray-600 cursor-not-allowed"
            : "bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:scale-[1.02] active:scale-[0.98]"
          } focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500`}
      >
        {uploading ? (
          <>
            <span className="font-sans flex items-center gap-2 text-gray-600 dark:text-gray-400 antialiased">
              <span className="inline-block w-4 h-4 border-2 border-gray-400 dark:border-gray-500 border-t-transparent rounded-full animate-spin"></span>
              progressing... {progress}%
            </span>
          </>
        ) : (
          <>
            <span className="font-sans hover:text-blue-500 dark:hover:text-blue-400 antialiased font-medium transition-colors duration-300">
              {btnSubmit ? btnSubmit : '🚀\u00A0\u00A0\u00A0Publish'}
            </span>
          </>
        )}
      </button>

    </div>
  );
}

type UploadState = {
  videoFile: File | null;
  coverFile: File | null;
  videoPreview: string | null;
  coverPreview: string | null;
};

const initialUploadState: UploadState = {
  videoFile: null,
  coverFile: null,
  videoPreview: null,
  coverPreview: null,
};

function uploadReducer(state: UploadState, action: Partial<UploadState>): UploadState {
  return { ...state, ...action };
}

const Upload = () => {

  const { data: user } = useAuthMe();
  const navigate = useNavigate();

  // Gestion des fichiers
  const [state, dispatch] = useReducer(uploadReducer, initialUploadState);
  const { videoFile, coverFile, videoPreview, coverPreview } = state;

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<Category>();
  const [subcategory, setSubCategory] = useState<SubCategory>();
  const [platform, setPlatform] = useState<Platform>();
  const [coupleTitles, setCoupleTitles] = useState<Couple[]>([]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  //  Mémorisation du ref utilisateur
  const [ref, setRef] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && user?.username) {
      const hash = Md5.hashStr(user.id.toString() + Date.now().toString()).slice(0, 8);
      setRef(user.username.slice(0, 3) + hash);
    }
  }, [user]);


  //  Libère les URLs temporaires pour éviter les fuites mémoire
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [coverPreview, videoPreview]);

  //  Gestion des fichiers
  const handleFileChange = useCallback((file: File, type: "video" | "cover") => {
    const preview = URL.createObjectURL(file);
    if (type === "video") dispatch({ videoFile: file, videoPreview: preview });
    else dispatch({ coverFile: file, coverPreview: preview });
  }, []);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) handleFileChange(file, "video");
    else toast.error("Only video files are accepted!");
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) handleFileChange(file, "cover");
    else toast.error("Only image files are accepted!");
  };

  const handleCoverClick = () => coverInputRef.current?.click();
  const handleVideoClick = () => videoInputRef.current?.click();

  // Upload vidéo
  const handleSubmit = useCallback(async () => {
    if (!videoFile || !coverFile || !category || !ref) {
      toast.error("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    const formData = {
      video: videoFile,
      cover: coverFile,
      category_id: category.id,
      platform_id: platform?.id,
      ...(subcategory && { sub_category_id: subcategory.id }),

      ref,
      titles: JSON.stringify(coupleTitles),
    };
    
    try {
      setUploading(true);
      setProgress(0);

      console.log(fd.get("plateform_id"));
      

      // send FormData for multipart upload
      const res = await uploadVideo(fd as unknown as FormData, (progressEvent) => {
        if (progressEvent.total) {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });

      toast.success("✅ Upload réussi !");
      navigate("/videos");
      console.log("Video uploaded:", res.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur lors de l'upload : " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [videoFile, coverFile, category, subcategory, coupleTitles, ref, navigate]);

  return (
    <div className="font-sans h-full antialiased bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
      <div className="flex flex-col flex-wrap md:flex-row gap-8 p-4 items-start justify-center w-full">
        <div className="flex md:flex-row flex-col flex-wrap gap-7 bg-white dark:bg-gray-800 rounded-md p-8 border border-gray-200 dark:border-gray-700 w-full backdrop-blur-sm transition-all duration-300">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">Ref</label>
              <input
                type="text"
                value={ref || ""}
                onChange={(e) => setRef(e.currentTarget.value.trim())}
                className="w-full text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 outline-none focus:border-blue-500 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">Category</label>
              <CategoryAutoComplete onSelect={setCategory} />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">SubCategory</label>
              <SubCategoryAutoComplete onSelect={setSubCategory} categoryId={category?.id} />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">Platform</label>
              <PlatformSelectComponent onSelect={setPlatform} />
            </div>

            {/* Cover */}
            <UploadBox
              label="Cover Image"
              onClick={handleCoverClick}
              onDrop={(f) => handleFileChange(f, "cover")}
              preview={coverPreview}
              // @ts-ignore
              inputRef={coverInputRef}
              accept="image/*"
              onChange={handleCoverChange}
              emptyMessage="Click or drag an image (PNG, JPG, WEBP, etc.)"
            />

            {/* Video */}
            <UploadBox
              label="Video"
              onClick={handleVideoClick}
              onDrop={(f) => handleFileChange(f, "video")}
              preview={videoPreview}
              // @ts-ignore
              inputRef={videoInputRef}
              accept="video/*"
              onChange={handleVideoChange}
              emptyMessage="Drag or select a video file"
            />

            {uploading && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden transition-colors duration-300">
                <div className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-colors duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          <TitlesForm
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
};

// 🔹 Sous composant pour la DRYness (évite répétition du bloc Upload)
type UploadBoxProps = {
  label: string;
  onClick: () => void;
  onDrop: (file: File) => void;
  preview: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  emptyMessage: string;
};

const UploadBox = ({ label, onClick, onDrop, preview, inputRef, accept, onChange, emptyMessage }: UploadBoxProps) => (
  <div>
    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">{label}</label>
    <div
      onClick={onClick}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) onDrop(file);
      }}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md p-6 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer"
    >
      {preview ? (
        accept.includes("video") ? (
          <video src={preview} controls className="rounded-lg w-full max-h-56 object-cover" />
        ) : (
          <div className="w-full h-52 flex items-center justify-center">
            <img src={preview} alt="Preview" className="rounded-lg object-cover w-full h-full shadow-md" />
          </div>
        )
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center transition-colors duration-300">{emptyMessage}</p>
      )}
      <input type="file" ref={inputRef} accept={accept} onChange={onChange} className="hidden" />
    </div>
  </div>
);

export default Upload;
