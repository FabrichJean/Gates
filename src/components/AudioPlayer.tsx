import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import axios from "axios";
import { apiURL, token } from "../constant";

interface AudioPlayerProps {
  audioUrl?: string;
  s3AudioUrl?: string;
  className?: string;
  title?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, s3AudioUrl, className, title }) => {
  const [m3u8Url, setM3u8Url] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    if (s3AudioUrl) {
      setLoading(true);
      setError(null);
      setM3u8Url(null);
      axios.post(apiURL+"/audios/play", null, {
        headers: {
            Authorization: `Bearer ${token()}`
        },
        params: {
            url: s3AudioUrl,
        },
        responseType: "text"
      })
        .then(res => {
          if (cancelled) return;
          // Si la réponse est un objet avec .url, on l'utilise
          if (typeof res.data === "object" && res.data?.url) {
            setM3u8Url(res.data.url);
          } else if (typeof res.data === "string" && res.data.startsWith("#EXTM3U")) {
            // Sinon, c'est probablement le texte m3u8 brut
            const blob = new Blob([res.data], { type: "application/vnd.apple.mpegurl" });
            objectUrl = URL.createObjectURL(blob);
            setM3u8Url(objectUrl);
          } else {
            setError("Format de flux audio inconnu");
          }
        })
        .catch(err => {
          if (!cancelled) setError("Erreur de lecture audio");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      setM3u8Url(null);
    }
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [s3AudioUrl]);

  // Gestion lecture/pause, durée, temps
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleLoaded = () => setDuration(Math.floor(audio.duration));
    const handleTime = () => setCurrentTime(Math.floor(audio.currentTime));
    const handleEnd = () => setIsPlaying(false);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("ended", handleEnd);
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("ended", handleEnd);
    };
  }, [m3u8Url, audioUrl]);

  const src = m3u8Url || audioUrl || undefined;
  if (loading) return (
    <div className="backdrop-blur-lg bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl p-4 flex items-center gap-3 animate-pulse">
      <Volume2 className="w-6 h-6 text-slate-400 dark:text-slate-500" />
      <span className="text-sm text-slate-500 dark:text-slate-400">Chargement audio...</span>
    </div>
  );
  if (error) return (
    <div className="backdrop-blur-lg bg-white/60 dark:bg-slate-900/60 border border-red-200 dark:border-red-700 shadow-lg rounded-xl p-4 flex items-center gap-3">
      <Volume2 className="w-6 h-6 text-red-400 dark:text-red-300" />
      <span className="text-sm text-red-500 dark:text-red-400">{error}</span>
    </div>
  );
  if (!src) return null;

  // Fonctions
  const handlePlay = () => {
    if (!audioRef.current) return;
    audioRef.current.play();
    setIsPlaying(true);
  };
  const handlePause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const val = Number(e.target.value);
    audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  // Design verre
  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full max-w-md mx-auto p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 ${className || ""}`}
      style={{
        background: "rgba(255,255,255,0.6)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      {title && (
        <div className="mb-2 text-base font-semibold text-slate-900 dark:text-white truncate w-full text-center">
          {title}
        </div>
      )}
      <audio
        ref={audioRef}
        src={src}
        autoPlay={isPlaying}
        preload="auto"
        className="hidden"
        controls={false}
        {...(m3u8Url ? { type: "application/vnd.apple.mpegurl" } : {})}
      />
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="p-3 rounded-full bg-white/70 dark:bg-slate-800/70 shadow border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
        >
          {isPlaying ? <Pause className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        </button>
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none accent-blue-600"
        />
        <span className="text-xs font-mono text-slate-700 dark:text-slate-300 w-12 text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );

  function formatTime(sec: number) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
};

export default AudioPlayer;
