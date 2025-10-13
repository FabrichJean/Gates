import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom"; // si tu utilises react-router

type TitleItem = {
  title: string;
  i18_language: string;
};

type Video = {
  id: string;
  userId?: string;
  titles: TitleItem[];
  cover?: string | null; // url ou chemin
  video_path?: string | null;
  categoryId?: string | null;
  status?: string;
  duration?: number | null;
  price?: number | null;
  // autres champs si besoin
};

const statusOptions = [
  { value: "Draft", label: "Draft" },
  { value: "WaitingForUpload", label: "Waiting for Upload" },
  { value: "Uploaded", label: "Uploaded" },
  { value: "Processing", label: "Processing" },
  { value: "Ready", label: "Ready" },
  { value: "Failed", label: "Failed" },
];

const VideoDetails: React.FC<{ videoIdProp?: string }> = ({ videoIdProp }) => {
  const { id: routeId } = useParams<{ id: string }>();
  const videoId = videoIdProp || routeId;
  const navigate = useNavigate();

  // états
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  // cover local
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // titres (local editable copy)
  const [titles, setTitles] = useState<TitleItem[]>([]);

  // autres champs modifiables
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [price, setPrice] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!videoId) return;
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`/api/videos/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
		
        // adapter selon ta réponse (ici j'imagine res.data.video)
        const v: Video = {
          id: data.id || data._id || videoId,
          userId: data.userId || data.user_id,
          titles: data.titles || data.videoTitles || [],
          cover: data.cover || data.coverUrl || null,
          video_path: data.video_path || null,
          categoryId: data.categoryId || data.category_id || null,
          status: data.status || "Draft",
          duration: data.duration || null,
          price: data.price || null,
        };
        setVideo(v);
        setTitles(v.titles || []);
        setCategoryId(v.categoryId || undefined);
        setStatus(v.status || "Draft");
        setPrice(v.price ?? undefined);
        setCoverPreview(v.cover || null);
      } catch (err) {
        console.error("Fetch video error:", err);
        toast.error("Impossible de charger la vidéo");
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId]);

  console.log(video);
  

  // handle cover change
  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setCoverFile(f);
    if (f) {
      setCoverPreview(URL.createObjectURL(f));
    }
  };

  // add / remove title rows
  const addTitle = () => setTitles((t) => [...t, { title: "", i18_language: "" }]);
  const removeTitle = (idx: number) =>
    setTitles((t) => t.filter((_, i) => i !== idx));
  const updateTitle = (idx: number, field: keyof TitleItem, value: string) =>
    setTitles((t) => t.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));

  // sauvegarde (PUT / PATCH)
  const handleSave = async () => {
    if (!videoId) return toast.error("Video id manquant");
    // validations basiques : éviter doublons de langues
    const langSet = new Set();
    for (const t of titles) {
      if (!t.title || !t.i18_language) {
        return toast.error("Tous les titres doivent avoir une langue et un texte");
      }
      if (langSet.has(t.i18_language)) {
        return toast.error(`Doublon de langue : ${t.i18_language}`);
      }
      langSet.add(t.i18_language);
    }

    const token = localStorage.getItem("authToken");
    try {
      setSaving(true);
      setProgress(0);
      // Si tu upload une image (cover) -> FormData, sinon JSON simple
      if (coverFile) {
        const formData = new FormData();
        formData.append("cover", coverFile);
        formData.append("categoryId", categoryId || "");
        formData.append("status", status || "");
        if (price !== undefined) formData.append("price", String(price));
        titles.forEach((t, i) => {
          formData.append(`titles[${i}][title]`, t.title);
          formData.append(`titles[${i}][i18_language]`, t.i18_language);
        });

        const res = await axios.put(`/api/videos/${videoId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (ev) => {
            if (ev.total) {
              const pct = Math.round((ev.loaded * 100) / ev.total);
              setProgress(pct);
            }
          },
        });

        toast.success("✅ Modifications enregistrées (cover uploadée)");
        setVideo((prev) => prev ? { ...prev, ...res.data } : res.data);
      } else {
        // Pas de fichier -> envoie simple JSON (plus rapide)
        const payload = {
          categoryId,
          status,
          price,
          titles,
        };
        const res = await axios.put(`/api/videos/${videoId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("✅ Modifications enregistrées");
        setVideo((prev) => prev ? { ...prev, ...res.data } : res.data);
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Erreur lors de la sauvegarde : " + (err?.response?.data?.message || err.message));
    } finally {
      setSaving(false);
      setProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement…</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Vidéo introuvable</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Détails vidéo</h2>
            <p className="text-sm text-gray-500 mb-4">ID: {video.id}</p>

            {/* Titres multilingues */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Titres (multilingues)</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addTitle}
                    className="text-sm px-3 py-1 bg-green-600 text-white rounded-lg"
                  >
                    + Ajouter
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {titles.map((t, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      value={t.i18_language}
                      onChange={(e) => updateTitle(idx, "i18_language", e.target.value)}
                      placeholder="code langue (ex: fr)"
                      className="w-28 border border-gray-200 rounded p-2"
                    />
                    <input
                      value={t.title}
                      onChange={(e) => updateTitle(idx, "title", e.target.value)}
                      placeholder="Titre"
                      className="flex-1 border border-gray-200 rounded p-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeTitle(idx)}
                      className="text-red-600 px-3 py-1 rounded hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Autres champs */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Catégorie</label>
                <input
                  value={categoryId || ""}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border border-gray-200 rounded p-2"
                  placeholder="categoryId"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Statut</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded p-2"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Durée (ms)</label>
                <input
                  value={video.duration ?? ""}
                  readOnly
                  className="w-full border border-gray-100 bg-gray-50 rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Prix</label>
                <input
                  type="number"
                  value={price ?? ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded p-2"
                />
              </div>
            </div>
          </div>

          {/* Preview cover + actions */}
          <aside className="w-64">
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Cover</label>
              <div
                className="w-full h-40 border border-dashed rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => coverInputRef.current?.click()}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-sm text-gray-400">Cliquer pour changer la cover</div>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onCoverChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                {saving ? `Sauvegarde... ${progress}%` : "Sauvegarder"}
              </button>

              <button
                onClick={() => {
                  // action: open preview player (external URL) si disponible
                  if (video.video_path) {
                    window.open(video.video_path, "_blank");
                  } else {
                    toast("Aucun fichier vidéo disponible", { icon: "ℹ️" });
                  }
                }}
                className="w-full border border-gray-200 py-2 rounded-lg"
              >
                ▶️ Prévisualiser (raw)
              </button>

              <button
                onClick={async () => {
                  // suppression locale (simple UI) -> appeler backend pour suppressions réelles
                  if (!confirm("Confirmer la suppression de cette vidéo ?")) return;
                  try {
                    const token = localStorage.getItem("authToken");
                    await axios.delete(`/api/videos/${videoId}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    toast.success("Vidéo supprimée");
                    navigate("/admin/videos");
                  } catch (err) {
                    console.error(err);
                    toast.error("Erreur suppression");
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
              >
                🗑️ Supprimer
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;
