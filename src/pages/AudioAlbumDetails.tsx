import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Edit3,
  ChevronLeft,
  Disc,
  Music,
  Hash,
  User,
  Calendar,
  Upload,
  Trash2,
  CheckCircle,
  XCircle,
  Play,
  Clock,
  Tag,
  Globe,
  Plus,
  MoreVertical,
  FileAudio,
  Download,
  Pause,
} from "lucide-react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getAudioAlbumByIdApi, deleteAudioAlbumApi, getAudioAlbumTracksApi, createAudioAlbumTrackApi, updateAudioAlbumTrackApi, deleteAudioAlbumTrackApi } from "../api/audioAlbum";
import type { AudioAlbum, AudioAlbumTrack } from "../types/audio";
import toast from "react-hot-toast";
import { useAuthMe } from "../hooks/useAuth";
import RoleEnum from "../utils/roleEnum";
import { formatDateFR } from "../utils/date";

const MiniLoader = () => (
  <div className="flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const AudioAlbumDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user } = useAuthMe();
  const [searchParams, setSearchParams] = useSearchParams();

  const [album, setAlbum] = useState<AudioAlbum | null>(null);
  const [loading, setLoading] = useState(true);

  // Track management state
  const [tracks, setTracks] = useState<AudioAlbumTrack[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [editingTrack, setEditingTrack] = useState<AudioAlbumTrack | null>(null);
  const [trackFormData, setTrackFormData] = useState({
    track_number: '',
    title: '',
    description: '',
    lyrics: '',
    audio_file: null as File | null,
  });
  const [trackUploading, setTrackUploading] = useState(false);
  // Audio playback state
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackDurations, setTrackDurations] = useState<Record<number, number>>({});

  const fetchAlbum = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await getAudioAlbumByIdApi(Number(id));
      setAlbum(response.data);
    } catch (error) {
      console.error("Error fetching audio album:", error);
      toast.error("Erreur lors du chargement de l'album");
    } finally {
      setLoading(false);
    }
  };

  // Playback handlers
  const loadAndPlay = (track: AudioAlbumTrack) => {
    const src = track.audio_url || track.s3_audio_url || '';
    if (!src) {
      toast.error('Aucun fichier audio disponible pour cette piste');
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    // If switching track, pause current and reset time
    if (playingTrackId && playingTrackId !== track.id) {
      audioRef.current.pause();
      setCurrentTime(0);
    }

    audioRef.current.src = src;
    audioRef.current.play().then(() => {
      setPlayingTrackId(track.id);
      setIsPlaying(true);
    }).catch((err) => {
      console.error('Playback error', err);
      toast.error('Impossible de lire la piste');
    });

    // attach events
    audioRef.current.onloadedmetadata = () => {
      setTrackDurations(prev => ({ ...prev, [track.id]: Math.floor(audioRef.current?.duration || 0) }));
    };

    audioRef.current.ontimeupdate = () => {
      setCurrentTime(Math.floor(audioRef.current?.currentTime || 0));
    };

    audioRef.current.onended = () => {
      setIsPlaying(false);
      setPlayingTrackId(null);
      setCurrentTime(0);
    };
  };

  const handlePlayPause = (track: AudioAlbumTrack) => {
    // If same track
    if (playingTrackId === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => toast.error('Impossible de lire la piste'));
      }
      return;
    }

    // Otherwise load and play new track
    loadAndPlay(track);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const fetchTracks = async () => {
    if (!id) return;

    setTracksLoading(true);
    try {
      const response = await getAudioAlbumTracksApi(Number(id));
      setTracks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      toast.error("Erreur lors du chargement des pistes");
    } finally {
      setTracksLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbum();
    fetchTracks();
  }, [id]);

  // Check if we should open the add track modal from URL param
  useEffect(() => {
    const openAddTrack = searchParams.get('openAddTrack');
    if (openAddTrack === 'true' && !loading) {
      setShowAddTrack(true);
      // Remove the param from URL
      searchParams.delete('openAddTrack');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, loading, setSearchParams]);

  const handleDelete = async () => {
    if (!album) return;

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'album "${album.ref || `Album #${album.id}`}" ? Cette action est irréversible.`
    );

    if (!confirmed) return;

    try {
      await deleteAudioAlbumApi(album.id);
      toast.success("Album supprimé avec succès");
      navigate("/audio-albums");
    } catch (error) {
      console.error("Error deleting album:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Track management functions
  const handleAddTrack = () => {
    setTrackFormData({
      track_number: (tracks.length + 1).toString(),
      title: '',
      description: '',
      lyrics: '',
      audio_file: null,
    });
    setEditingTrack(null);
    setShowAddTrack(true);
  };

  const handleEditTrack = (track: AudioAlbumTrack) => {
    setTrackFormData({
      track_number: track.track_number.toString(),
      title: track.title,
      description: track.description || '',
      lyrics: track.lyrics || '',
      audio_file: null,
    });
    setEditingTrack(track);
    setShowAddTrack(true);
  };

  const handleDeleteTrack = async (trackId: number) => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette piste ?");
    if (!confirmed) return;

    try {
      await deleteAudioAlbumTrackApi(trackId);
      toast.success("Piste supprimée avec succès");
      fetchTracks();
    } catch (error) {
      console.error("Error deleting track:", error);
      toast.error("Erreur lors de la suppression de la piste");
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!album) return;

    setTrackUploading(true);
    try {
      const formData = new FormData();
      formData.append('album_id', album.id.toString());
      formData.append('track_number', trackFormData.track_number);
      formData.append('title', trackFormData.title);
      if (trackFormData.description) formData.append('description', trackFormData.description);
      if (trackFormData.lyrics) formData.append('lyrics', trackFormData.lyrics);
      if (trackFormData.audio_file) formData.append('audio', trackFormData.audio_file);

      if (editingTrack) {
        await updateAudioAlbumTrackApi(editingTrack.id, formData);
        toast.success("Piste mise à jour avec succès");
      } else {
        await createAudioAlbumTrackApi(formData);
        toast.success("Piste ajoutée avec succès");
      }

      setShowAddTrack(false);
      setTrackFormData({
        track_number: '',
        title: '',
        description: '',
        lyrics: '',
        audio_file: null,
      });
      fetchTracks();
    } catch (error) {
      console.error("Error saving track:", error);
      toast.error("Erreur lors de la sauvegarde de la piste");
    } finally {
      setTrackUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setTrackFormData(prev => ({ ...prev, audio_file: file }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <MiniLoader />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-4">
          <Disc className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Album introuvable</h2>
          <Link to="/audio-albums" className="text-sm text-gray-600 dark:text-gray-300 underline">Retour à la liste</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 rounded-lg">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-3 py-6">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
          <Link to="/audio-albums" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:dark:text-gray-400">
            <ChevronLeft className="w-4 h-4" />
            Retour aux albums
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Album Cover & Actions */}
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 shadow sticky top-6">
              {/* Album Cover Placeholder */}
              <div className="relative w-full h-48 rounded-md overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-4 flex items-center justify-center">
                <Disc className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
                {album.isDeleted && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white rounded text-xs font-semibold">Supprimé</div>
                )}
              </div>

              {/* Status */}
              <div className="mb-4 flex items-center justify-center">
                {album.isDeleted ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Supprimé
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Actif
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-2">
                <div></div>
                <div className="flex gap-2">
                  <Link
                  to={`/audio-albums/${album.id}/edit`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-blue-600 hover:border-blue-700 text-white rounded text-sm font-medium transition-colors"
                  hidden={album.isDeleted}
                >
                  <Edit3 className="w-4 h-4" />
                </Link>

                {user?.role === RoleEnum.SUPERADMIN && (
                  <button
                    onClick={handleDelete}
                    hidden={album.isDeleted}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-red-600 hover:border-red-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Album Details */}
          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }} className="lg:col-span-2 space-y-4">
            {/* Album Header */}
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {album.ref || `Album #${album.id}`}
                  </h1>
                  {album.album_number && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Numéro d'album: {album.album_number}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  {formatDateFR(album.createdAt)}
                </div>
              </div>

              {/* Album Stats */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {album.total_tracks && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/40 rounded">
                    <Music className="w-4 h-4 text-gray-600" />
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {album.total_tracks} piste{album.total_tracks > 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/40 rounded">
                  <Hash className="w-4 h-4 text-gray-600" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    ID: {album.id}
                  </div>
                </div>

                {album.user && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/40 rounded">
                    <User className="w-4 h-4 text-gray-600" />
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {album.user.name}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Associated Audio */}
            {album.audio && (
              <div className="bg-white dark:bg-gray-800 rounded-md p-4 shadow">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <Music className="w-4 h-4" />
                  <span className="font-medium">Audio associé</span>
                </div>

                <Link
                  to={`/audios/${album.audio.id}`}
                  className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Audio Cover */}
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0 flex items-center justify-center">
                      {album.audio.cover_url || album.audio.s3_cover_url ? (
                        <img
                          src={album.audio.cover_url || album.audio.s3_cover_url}
                          alt={album.audio.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    {/* Audio Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {album.audio.title}
                      </h3>
                      {album.audio.ref && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Réf. {album.audio.ref}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {album.audio.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(album.audio.duration)}
                          </div>
                        )}

                        {album.audio.audioCategory && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {album.audio.audioCategory.name}
                            {album.audio.audioSubCategory && ` › ${album.audio.audioSubCategory.name}`}
                          </div>
                        )}

                        {album.audio.plateform && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {album.audio.plateform.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Play Button */}
                    {(album.audio.audio_url || album.audio.s3_audio_url) && (
                      <div className="flex-shrink-0">
                        <button className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            )}

            {/* Album Tracks */}
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 shadow">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Music className="w-4 h-4" />
                  <span className="font-medium">Pistes de l'album ({tracks.length})</span>
                </div>
                {user?.role === RoleEnum.SUPERADMIN && (
                  <button
                    onClick={handleAddTrack}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Ajouter une piste
                  </button>
                )}
              </div>

              {tracksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <MiniLoader />
                </div>
              ) : tracks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Disc className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Aucune piste dans cet album</p>
                  {user?.role === RoleEnum.SUPERADMIN && (
                    <button
                      onClick={handleAddTrack}
                      className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      Ajouter la première piste
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {tracks
                    .sort((a, b) => a.track_number - b.track_number)
                    .map((track) => (
                      <div key={track.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-medium text-sm">
                            {track.track_number}
                          </div>

                          <button
                            onClick={() => handlePlayPause(track)}
                            className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            title={playingTrackId === track.id && isPlaying ? 'Pause' : 'Lire'}
                          >
                            {playingTrackId === track.id && isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {track.title}
                          </div>
                          {track.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {track.description}
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-1">
                            {track.duration && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(track.duration)}
                              </span>
                            )}
                            {track.audio_url && (
                              <a
                                href={track.audio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                Télécharger
                              </a>
                            )}
                          </div>

                          {/* Progress for currently playing track */}
                          {playingTrackId === track.id && (
                            <div className="mt-2">
                              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                                <div
                                  className="h-1 bg-blue-600"
                                  style={{ width: `${Math.max(0, Math.min(100, Math.round(((currentTime) / (trackDurations[track.id] ?? track.duration ?? 1)) * 100)))}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatDuration(currentTime)} / {formatDuration(trackDurations[track.id] ?? track.duration)}
                              </div>
                            </div>
                          )}
                        </div>

                        {user?.role === RoleEnum.SUPERADMIN && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditTrack(track)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTrack(track.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Technical Information */}
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 shadow">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Informations techniques</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">ID Album:</span>
                  <div className="font-mono text-gray-900 dark:text-gray-100">{album.id}</div>
                </div>

                <div>
                  <span className="text-gray-500 dark:text-gray-400">ID Audio:</span>
                  <div className="font-mono text-gray-900 dark:text-gray-100">{album.audio_id}</div>
                </div>

                <div>
                  <span className="text-gray-500 dark:text-gray-400">ID Utilisateur:</span>
                  <div className="font-mono text-gray-900 dark:text-gray-100">{album.user_id}</div>
                </div>

                <div>
                  <span className="text-gray-500 dark:text-gray-400">Statut:</span>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    album.isDeleted
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {album.isDeleted ? 'Supprimé' : 'Actif'}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 dark:text-gray-400">Créé le:</span>
                  <div className="text-gray-900 dark:text-gray-100">{formatDateFR(album.createdAt)}</div>
                </div>

                <div>
                  <span className="text-gray-500 dark:text-gray-400">Modifié le:</span>
                  <div className="text-gray-900 dark:text-gray-100">{formatDateFR(album.updatedAt)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Track Form Modal */}
      {showAddTrack && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingTrack ? 'Modifier la piste' : 'Ajouter une piste'}
                </h3>
                <button
                  onClick={() => setShowAddTrack(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleTrackSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Numéro de piste *
                  </label>
                  <input
                    type="number"
                    value={trackFormData.track_number}
                    onChange={(e) => setTrackFormData(prev => ({ ...prev, track_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={trackFormData.title}
                    onChange={(e) => setTrackFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={trackFormData.description}
                    onChange={(e) => setTrackFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Paroles/Lyrics
                  </label>
                  <textarea
                    value={trackFormData.lyrics}
                    onChange={(e) => setTrackFormData(prev => ({ ...prev, lyrics: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Entrez les paroles de la chanson..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fichier audio
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {trackFormData.audio_file && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Fichier sélectionné: {trackFormData.audio_file.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddTrack(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={trackUploading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {trackUploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <MiniLoader />
                        Sauvegarde...
                      </div>
                    ) : (
                      editingTrack ? 'Modifier' : 'Ajouter'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AudioAlbumDetails;
