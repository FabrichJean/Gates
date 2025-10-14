import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom"; 
import { apiURL } from "../constant/index";
import { TitlesForm } from './Upload';
import { UseVideo } from "../hooks/useVideos";

type Video = {
  id: string;
  userId?: string;
  titles: { title: string; i18_language: string }[];
  cover?: string | null;
  video_path?: string | null;
  categoryId?: string | null;
  status?: string;
  duration?: number | null;
  price?: number | null;
};

const VideoDetails: React.FC<{ videoIdProp?: string }> = ({ videoIdProp }) => {
  const { id: routeId } = useParams<{ id: string }>();
  const videoId = videoIdProp || routeId;

  const {data: video} = UseVideo(videoId);

  console.log(video);
  

  // const [video, setVideo] = useState<Video | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [saving, setSaving] = useState(false);
  // const [progress, setProgress] = useState(0);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // const [coupleTitles, setCoupleTitles] = useState<{ title: string; i18_language: string }[]>([]);
  // const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  // const [status, setStatus] = useState<string | undefined>(undefined);
  // const [price, setPrice] = useState<number | undefined>(undefined);

  // useEffect(() => {
  //   if (!videoId) return;
  //   const fetchVideo = async () => {
  //     try {
  //       setLoading(true);
  //       const token = localStorage.getItem("authToken");
  //       const res = await axios.get(`${apiURL}/videos/${videoId}`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       const data = res.data;
  //       console.log(data);
        
  //       setVideo(data);
  //       setCoverPreview(data.cover || null);
  //       setCoupleTitles(data.titles || []);
  //       setCategoryId(data.categoryId || undefined);
  //       setStatus(data.status || "Draft");
  //       setPrice(data.price ?? undefined);
  //     } catch (err) {
  //       console.error(err);
  //       toast.error("Impossible de charger la vidéo");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchVideo();
  // }, [videoId]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setCoverFile(f);
    if (f) setCoverPreview(URL.createObjectURL(f));
  };

  // const handleSave = async () => {
  //   if (!videoId) return toast.error("Video id manquant");
  //   const token = localStorage.getItem("authToken");
  //   try {
  //     setSaving(true);
  //     setProgress(0);

  //     const formData: any = {
  //       ...(coverFile && { cover: coverFile }),
  //       categoryId,
  //       status,
  //       price,
  //       titles: JSON.stringify(coupleTitles),
  //     };

  //     const res = await axios.put(`${apiURL}/videos/${videoId}`, formData, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": coverFile ? "multipart/form-data" : "application/json",
  //       },
  //       onUploadProgress: (ev) => {
  //         if (ev.total) setProgress(Math.round((ev.loaded * 100) / ev.total));
  //       },
  //     });

  //     setVideo(res.data);
  //     toast.success("✅ Modifications enregistrées !");
  //   } catch (err: any) {
  //     console.error(err);
  //     toast.error("Erreur lors de la sauvegarde : " + (err?.response?.data?.message || err.message));
  //   } finally {
  //     setSaving(false);
  //     setProgress(0);
  //   }
  // };

  // if (loading)
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-gray-500">Chargement…</div>
  //     </div>
  //   );

  if (!video)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Vidéo introuvable</div>
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-screen p-6 items-start justify-center bg-gray-50">
      <Toaster position="top-right" />

      {/* Formulaire */}
      <div className="w-full md:w-[60%] bg-white rounded-lg p-6 border border-gray-200 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Détails Vidéo</h1>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Catégorie</label>
          <input
            type="text"
            value={video.category.name || ""}
            readOnly
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {/* <div>
          <label className="block text-gray-700 font-medium mb-1">Statut</label>
          <input
            type="text"
            value={status || ""}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div> */}

        {/* <div>
          <label className="block text-gray-700 font-medium mb-1">Prix</label>
          <input
            type="number"
            value={price ?? ""}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <TitlesForm
          onChange={(titles) => setCoupleTitles(titles)}
          uploading={saving}
          progress={progress}
          handleSubmit={handleSave}
        /> */}
      </div>

      {/* Preview + actions */}
      <div className="w-full md:w-[35%] flex flex-col gap-4">
        <div
          className="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={() => coverInputRef.current?.click()}
        >
          {coverPreview ? (
            <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400 text-sm">Cliquer pour changer la cover</div>
          )}
          <input
            type="file"
            ref={coverInputRef}
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
        </div>

        {/* <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-2.5 rounded-xl font-medium transition
          ${saving ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white/90 text-gray-800 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"}`}
        >
          {saving ? `Modification... ${progress}%` : "💾 Modifier"}
        </button>

        <button
          onClick={() => video.video_path ? window.open(video.video_path, "_blank") : toast("Aucun fichier vidéo disponible", { icon: "ℹ️" })}
          className="w-full py-2.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 shadow-sm hover:shadow-md text-gray-800"
        >
          ▶️ Prévisualiser vidéo
        </button> */}
      </div>
    </div>
  );
};

export default VideoDetails;
