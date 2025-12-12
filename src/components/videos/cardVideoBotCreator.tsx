import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { TVideo } from "../../hooks/useVideos";
import { getToken } from "../../utils/storage";
import { apiURL } from "../../constant";

interface VideoResponse {
  total: number;
  page: number;
  limit: number;
  videos: TVideo[];
}

interface StatsPostsProps {
  data: TVideo[];
  onFilter: (type: "all" | "long" | "short") => void;
}

/* ---------------------------------------------------
 * StatsPosts : Composant affichant Total / Long / Short
 * --------------------------------------------------- */
const StatsPosts = ({ data, onFilter }: StatsPostsProps) => {
  const totalPosts = data?.length || 0;
  const totalLong = data?.filter((post) => post.type === "2").length || 0;
  const totalShort = data?.filter((post) => post.type === "1").length || 0;

  return (
    <div className="flex gap-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-md">

      {/* TOTAL */}
      <div
        onClick={() => onFilter("all")}
        className="p-4 bg-white dark:bg-gray-800 rounded shadow text-center 
                   border dark:border-gray-700 hover:bg-slate-600 cursor-pointer"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Total
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPosts}</p>
      </div>

      {/* LONG */}
      <div
        onClick={() => onFilter("long")}
        className="p-4 bg-white dark:bg-gray-800 rounded shadow text-center
                   border dark:border-gray-700 hover:bg-slate-600 cursor-pointer"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Long
        </h3>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalLong}</p>
      </div>

      {/* SHORT */}
      <div
        onClick={() => onFilter("short")}
        className="p-4 bg-white dark:bg-gray-800 rounded shadow text-center
                   border dark:border-gray-700 hover:bg-slate-600 cursor-pointer"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Short
        </h3>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalShort}</p>
      </div>

    </div>
  );
};

/* ---------------------------------------------------
 * CreatorVideosCard : liste des vidéos + filtres
 * --------------------------------------------------- */
const CardVideoBotCreator = ({ creatorId }: { creatorId: string }) => {
  const [videos, setVideos] = useState<TVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<TVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get<VideoResponse>(
          `${apiURL}/creators/videos-bot/${creatorId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        setVideos(res.data.videos);
        setFilteredVideos(res.data.videos); // par défaut : tout afficher
      } catch (err) {
        console.error("Erreur lors du chargement des vidéos", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [creatorId]);

  /* ---------- Fonction de filtrage ---------- */
  const handleFilter = (type: "all" | "long" | "short") => {
    if (type === "long") {
      setFilteredVideos(videos.filter((v) => v.type === "2"));
    } else if (type === "short") {
      setFilteredVideos(videos.filter((v) => v.type === "1"));
    } else {
      setFilteredVideos(videos);
    }
  };

  const getType = (video: TVideo) => {
    return video.type === "1" ? "Short" : "Long";
  }

  if (loading)
    return <div className="p-4 text-center">Chargement des vidéos...</div>;

  return (
    <div>
      {/* Filtres + stats */}
      <StatsPosts data={videos} onFilter={handleFilter} />

      {/* Grid des vidéos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="card bg-white dark:bg-slate-700 shadow-md hover:shadow-xl transition rounded-md"
          >
            <figure>
              <img
                src={
                  video.s3_urls?.coverUrl ||
                  video.public_urls?.local_cover_url ||
                  video.public_urls?.cover_url ||
                  "https://placehold.co/600x400"
                }
                alt="cover"
                className="w-full h-40 object-cover"
              />
            </figure>

            <div className="card-body p-4">
              <h2 className="card-title text-base">
                {(() => {
                  const title =
                    video.titles?.find((t) => t.i18_language === "en")?.title ||
                    video.titles?.[0]?.title ||
                    "Untitled";

                  return title.length > 30 ? title.slice(0, 30) + "..." : title;
                })()}
              </h2>
              <p className="text-sm opacity-70 flex gap-4">
                <span>{video.category?.name}</span>
                <span>{video.subCategory?.name}</span>
              </p>
              <div className="flex text-green-600 w-full items-center font-medium mt-2">
                <span className="bg-blue-500/20 dark:bg-blue-800/80 px-3 text-gray-600 dark:text-teal-200 rounded-full">
                  {getType(video)}
                </span>
                <span> </span>
              </div>

              <div className="card-actions justify-end mt-3">
                <button
                  className="px-3 py-1 rounded-sm border border-blue-400 cursor-pointer"
                  onClick={() =>
                    nav(
                      video.user.username === "userbot"
                        ? `/bot-videos/${video.id}`
                        : `/videos/${video.id}`
                    )
                  }
                >
                  Voir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardVideoBotCreator;
