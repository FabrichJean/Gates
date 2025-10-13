import React, { useRef, useState } from "react";
import LanguageAutoComplete from "../components/LanguageAutoComplete";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { apiURL } from "../constant/index"

const Upload = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<{ code: string; name: string } | null>(null); const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<{ code: string; name: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Le titre est obligatoire");

    const formData = new FormData();
    formData.append("title", title);
    if (videoFile) formData.append("video", videoFile);
    if (coverFile) formData.append("cover", coverFile);
    if (language) formData.append("language", language.code);

    try {
      setUploading(true);
      setProgress(0);

      const token = localStorage.getItem("token");

      const res = await axios.post(apiURL + "/videos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      toast.success("✅ Upload réussi !");
      console.log("Video uploaded:", res.data);
    } catch (err: any) {
      console.error(err);
      toast.error("❌ Erreur lors de l'upload : " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Toaster position="top-right" />
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          🎬 Upload Video
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <LanguageAutoComplete onSelect={(lang) => setLanguage(lang)} />

          <div>
            <label className="block text-gray-700 font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la vidéo"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Cover</label>
            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Video (MP4)</label>
            <input type="file" accept="video/mp4" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
          </div>

          {/* Barre de progression */}
          {uploading && (
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition"
            disabled={uploading}
          >
            {uploading ? `Uploading... ${progress}%` : "🚀 Publish"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
