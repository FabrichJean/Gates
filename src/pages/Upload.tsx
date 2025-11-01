/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import LanguageAutoComplete from "../components/LanguageAutoComplete";
import toast from "react-hot-toast";
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import CategoryAutoComplete, { type Category } from "../components/CategoryAutoComplete";
import { uploadVideo } from "../api/videos";
import { useNavigate } from "react-router-dom";
import type { SubCategory } from "../hooks/useSubCategory";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
import { useAuthMe } from "../hooks/useAuth";
import {Md5} from 'ts-md5';


export type Couple = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any; i18_language: string; title: string, name?: string;
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
        <label className="font-sans text-sm font-medium text-gray-700 tracking-wide antialiased">
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
      focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer hover:scale-105"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>


      {coupleTitles?.map((c, i) => (
        <div
          key={i}
          className="flex gap-2 items-center p-4 px-0"
        >
          {/* @ts-expect-error */}
          <LanguageAutoComplete defaultValue={{ code: c?.language?.title, name: c?.language?.name! }} onSelect={(lang) => handleChange(i, 'i18_language', lang.code)} />
          <input
            type="text"
            placeholder="Title"
            value={c.title}
            onChange={(e) => handleChange(i, 'title', e.target.value)}
            className="font-sans flex-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none p-2 bg-transparent antialiased transition-colors"
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
        className={`font-sans relative flex items-center justify-center gap-2 px-6 py-2.5
    font-medium text-sm rounded-sm transition-all duration-300
    backdrop-blur-md border border-transparent cursor-pointer antialiased tracking-wide
    ${uploading
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white/90 hover:bg-white text-gray-800 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          } focus:outline-none focus:ring-2 focus:ring-blue-300`}
      >
        {uploading ? (
          <>
            <span className="font-sans flex items-center gap-2 text-gray-600 antialiased">
              <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
              progressing... {progress}%
            </span>
          </>
        ) : (
          <>
            <span className="font-sans underline hover:text-blue-500 antialiased font-medium">
                {btnSubmit ? btnSubmit : '🚀\u00A0\u00A0\u00A0Publish'}
            </span>
          </>
        )}
      </button>

    </div>
  );
}


// import { useState, useRef, useMemo, useCallback, useReducer, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import Md5 from "ts-md5";
// import { useAuthMe } from "../hooks/useAuthMe";
// import { uploadVideo } from "../api/videos";
// import CategoryAutoComplete from "../components/CategoryAutoComplete";
// import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
// import TitlesForm from "../components/TitlesForm";

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
  const [coupleTitles, setCoupleTitles] = useState<Couple[]>([]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // 🧠 Mémorisation du ref utilisateur
  const ref = useMemo(() => {
    if (!user?.id || !user?.username) return null;
    const hash = Md5.hashStr(user.id.toString() + Date.now().toString()).slice(0, 8);
    return user.username.slice(0, 3) + hash;
  }, [user]);

  // 🧹 Libère les URLs temporaires pour éviter les fuites mémoire
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [coverPreview, videoPreview]);

  // 🧩 Gestion des fichiers
  const handleFileChange = useCallback((file: File, type: "video" | "cover") => {
    const preview = URL.createObjectURL(file);
    if (type === "video") dispatch({ videoFile: file, videoPreview: preview });
    else dispatch({ coverFile: file, coverPreview: preview });
  }, []);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "video/mp4") handleFileChange(file, "video");
    else toast.error("Only MP4 files are accepted!");
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) handleFileChange(file, "cover");
    else toast.error("Invalid image format!");
  };

  const handleCoverClick = () => coverInputRef.current?.click();
  const handleVideoClick = () => videoInputRef.current?.click();

  // 📨 Upload vidéo
  const handleSubmit = useCallback(async () => {
    if (!videoFile || !coverFile || !category || !ref) {
      toast.error("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    const formData = {
      video: videoFile,
      cover: coverFile,
      category_id: category.id,
      ...(subcategory && { sub_category_id: subcategory.id }),
      ref,
      titles: JSON.stringify(coupleTitles),
    };

    try {
      setUploading(true);
      setProgress(0);

      const res = await uploadVideo(formData, (progressEvent) => {
        if (progressEvent.total) {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });

      toast.success("✅ Upload réussi !");
      navigate("/videos");
      console.log("Video uploaded:", res.data);
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur lors de l'upload : " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [videoFile, coverFile, category, subcategory, coupleTitles, ref, navigate]);

  return (
    <div className="font-sans h-full antialiased">
      <div className="flex flex-col flex-wrap md:flex-row gap-8 p-4 items-start justify-center w-full">
        <div className="flex md:flex-row flex-col flex-wrap gap-7 bg-white rounded-md p-8 border border-gray-200 w-full backdrop-blur-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Ref</label>
              <input
                type="text"
                value={ref || ""}
                disabled
                className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Category</label>
              <CategoryAutoComplete onSelect={setCategory} />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">SubCategory</label>
              <SubCategoryAutoComplete onSelect={setSubCategory} categoryId={category?.id} />
            </div>

            {/* Cover */}
            <UploadBox
              label="Cover Image"
              onClick={handleCoverClick}
              onDrop={(f) => handleFileChange(f, "cover")}
              preview={coverPreview}
              inputRef={coverInputRef}
              accept="image/*"
              onChange={handleCoverChange}
              emptyMessage="Click or drag an image (PNG, JPG, WEBP)"
            />

            {/* Video */}
            <UploadBox
              label="Video"
              onClick={handleVideoClick}
              onDrop={(f) => handleFileChange(f, "video")}
              preview={videoPreview}
              inputRef={videoInputRef}
              accept="video/mp4"
              onChange={handleVideoChange}
              emptyMessage="Drag or select an MP4 file"
            />

            {uploading && (
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${progress}%` }} />
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
  inputRef: React.RefObject<HTMLInputElement>;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  emptyMessage: string;
};

const UploadBox = ({ label, onClick, onDrop, preview, inputRef, accept, onChange, emptyMessage }: UploadBoxProps) => (
  <div>
    <label className="block text-gray-700 font-medium mb-2">{label}</label>
    <div
      onClick={onClick}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) onDrop(file);
      }}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center hover:border-blue-500 transition cursor-pointer"
    >
      {preview ? (
        accept.includes("video") ? (
          <video src={preview} controls className="rounded-lg w-full max-h-56 object-cover" />
        ) : (
          <img src={preview} alt="Preview" className="rounded-lg object-cover w-full h-52" />
        )
      ) : (
        <p className="text-gray-500 text-sm text-center">{emptyMessage}</p>
      )}
      <input type="file" ref={inputRef} accept={accept} onChange={onChange} className="hidden" />
    </div>
  </div>
);

export default Upload;
