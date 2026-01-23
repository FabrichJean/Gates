import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createAudioAlbumApi } from "../api/audioAlbum";
import { getAudiosListApi } from "../api/audios";
import { AudioTitlesField } from "../components/AudioTitlesField";
import AnimatedAlert from "../components/AnimatedAlert";
import toast from "react-hot-toast";
import { ChevronDown, Music } from "lucide-react";

const initialForm = {
  ref: "",
  album_number: "",
  total_tracks: "",
  release_date: "",
  audio_id: "",
  user_id: "",
  metadata: "",
  isDeleted: false,
  titles: [], // multilingual titles/descriptions
};

const UploadAudioAlbum: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [audios, setAudios] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [titles, setTitles] = useState<any[]>([]);
  const [isAudioDropdownOpen, setIsAudioDropdownOpen] = useState(false);
  const audioDropdownRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [albumResult, setAlbumResult] = useState<any>(null);

  useEffect(() => {
    const audioId = searchParams.get("audio_id");
    if (audioId) setForm((prev) => ({ ...prev, audio_id: audioId }));
    // If user_id is available in context, set it here
  }, [searchParams]);

  useEffect(() => {
    getAudiosListApi().then((res) => setAudios(res.data || []));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        audioDropdownRef.current &&
        !audioDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAudioDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as any).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTitlesChange = (newTitles: any[]) => {
    setTitles(newTitles);
  };

  const handleAudioSelect = (audioId: string) => {
    setForm((prev) => ({ ...prev, audio_id: audioId }));
    setIsAudioDropdownOpen(false);
  };

  const getSelectedAudioLabel = () => {
    if (!form.audio_id) return "Sélectionner un audio";
    const selected = audios.find(
      (a) => a.id.toString() === form.audio_id.toString(),
    );
    return selected
      ? selected.ref || `Audio #${selected.id}`
      : "Sélectionner un audio";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData: any = {};
      Object.entries(form).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          formData[key] = value ? "true" : "false";
        } else if (value) {
          formData[key] = value;
        }
      });
      // Add multilingual titles/descriptions as JSON in metadata
      if (titles && titles.length > 0) {
        formData.metadata = JSON.stringify({
          ...(form.metadata ? JSON.parse(form.metadata) : {}),
          titles,
        });
      }
      const result = await createAudioAlbumApi(formData);
      toast.success("Album créé avec succès !");
      setAlbumResult(result);
      setIsAlertOpen(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg mt-8">
      <h1 className="text-3xl font-black mb-8 text-indigo-700 dark:text-indigo-400">
        Créer un AudioAlbum
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-xs text-gray-400 font-semibold">
            Audio
          </label>
          <div ref={audioDropdownRef} className="relative w-full group">
            <button
              type="button"
              onClick={() => setIsAudioDropdownOpen(!isAudioDropdownOpen)}
              className="py-2.5 px-3 w-full md:text-sm text-gray-900 dark:text-gray-100 bg-transparent border border-gray-300 dark:border-gray-600 focus:border-indigo-600 focus:outline-none focus:ring-0 flex items-center justify-between rounded-xl font-semibold hover:border-indigo-500 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                {getSelectedAudioLabel()}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isAudioDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`absolute z-[99] top-[100%] left-[50%] translate-x-[-50%] rounded-md overflow-hidden shadow-lg min-w-[200px] w-full mt-1 p-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs md:text-sm transition-all duration-200 ${
                isAudioDropdownOpen
                  ? "visible opacity-100"
                  : "opacity-0 invisible"
              }`}
            >
              {audios.length === 0 ? (
                <div className="w-full block px-3 py-2 text-center text-gray-500 dark:text-gray-400">
                  Aucun audio disponible
                </div>
              ) : (
                audios.map((audio) => (
                  <div
                    key={audio.id}
                    onClick={() => handleAudioSelect(audio.id.toString())}
                    className={`w-full flex items-center gap-2 cursor-pointer hover:bg-white dark:hover:bg-gray-900 px-3 py-2 rounded-md transition-colors ${
                      form.audio_id === audio.id.toString()
                        ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    <Music className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {audio.ref ||
                        `Audio #${audio.id}` ||
                        audio.Titles?.[0]?.title}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
            Référence album
          </label>
          <input
            name="ref"
            value={form.ref}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
              Numéro d'album
            </label>
            <input
              name="album_number"
              value={form.album_number}
              onChange={handleChange}
              type="number"
              className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
              Nombre de pistes
            </label>
            <input
              name="total_tracks"
              min={1}
              value={form.total_tracks}
              onChange={handleChange}
              type="number"
              className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
            Date de sortie
          </label>
          <input
            name="release_date"
            value={form.release_date}
            onChange={handleChange}
            type="date"
            className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <AudioTitlesField
          value={titles}
          onChange={handleTitlesChange}
          label="Titres multilingues (i18n)"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
        >
          {saving ? "Création..." : "Créer l'album"}
        </button>
      </form>

      {/* Alert de confirmation pour ajouter des pistes */}
      <AnimatedAlert
        page="audio-album-management"
        isOpen={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
        }}
        title="Album créé avec succès"
        message="Voulez-vous ajouter des pistes à cet album maintenant ?"
        type="success"
        onConfirm={() => {
          if (albumResult) {
            navigate(`/audio-albums/${albumResult.data?.id || albumResult.id}?openAddTrack=true`);
          }
        }}
        onConfirme2={() => {
          if (albumResult) {
            navigate(`/audio-albums/${albumResult.data?.id || albumResult.id}`);
          }
        }}
        confirmText="Oui, ajouter des pistes"
        cancelText="Plus tard"
      />
    </div>
  );
};

export default UploadAudioAlbum;
