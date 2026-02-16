import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiURL, token } from "../constant";

interface AudioPlayerProps {
  audioUrl?: string;
  s3AudioUrl?: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, s3AudioUrl, className }) => {
  const [m3u8Url, setM3u8Url] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div className="text-xs text-gray-500">Chargement audio...</div>;
  if (error) return <div className="text-xs text-red-500">{error}</div>;

  // Si m3u8, utiliser hls.js si besoin (pour Safari, <audio> suffit)
  if (m3u8Url) {
    return (
      <audio controls className={className}>
        <source src={m3u8Url} type="application/vnd.apple.mpegurl" />
        Votre navigateur ne supporte pas la lecture HLS.
      </audio>
    );
  }

  if (audioUrl) {
    return (
      <audio controls className={className}>
        <source src={audioUrl} />
        Votre navigateur ne supporte pas l'audio.
      </audio>
    );
  }

  return null;
};

export default AudioPlayer;
