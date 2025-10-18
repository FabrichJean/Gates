import React, { useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

interface Props {
  video: {
    title: string;
    channel: string;
    views: string;
    time: string;
    thumbnail: string;
    duration: string;
    preview?: string;
  };
}

const VideoCard: React.FC<Props> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 🧠 Mémorise la dernière position de lecture
  const [lastTime, setLastTime] = useState(0);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = lastTime; // reprend là où on a laissé
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      // 🔥 Sauvegarde la position actuelle
      setLastTime(videoRef.current.currentTime);
      videoRef.current.pause();
    }
    setIsHovered(false);
    setDropdownOpen(false);
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Vidéo ou image */}
      <div className="relative">
        {isHovered ? (
          <video
            ref={videoRef}
            src={video.preview || "/1.mp4"}
            className="w-full h-48 object-cover"
            muted
            loop
            autoPlay
            playsInline
          />
        ) : (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-48 object-cover"
          />
        )}

        {/* Durée */}
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </span>

        {/* Bouton menu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen(!dropdownOpen);
          }}
          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full"
        >
          <MoreVertical size={16} />
        </button>

        {/* Menu dropdown */}
        {dropdownOpen && (
          <div className="absolute top-8 right-2 bg-white border shadow-lg rounded-lg w-36 text-sm z-10">
            <button className="block w-full text-left px-3 py-2 hover:bg-gray-100">
              Ajouter à la file
            </button>
            <button className="block w-full text-left px-3 py-2 hover:bg-gray-100">
              Partager
            </button>
            <button className="block w-full text-left px-3 py-2 hover:bg-gray-100">
              Télécharger
            </button>
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
        <p className="text-gray-600 text-xs mt-1">{video.channel}</p>
        <p className="text-gray-500 text-xs">
          {video.views} • {video.time}
        </p>
      </div>
    </div>
  );
};

export default VideoCard;
