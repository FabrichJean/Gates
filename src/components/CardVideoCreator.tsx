import { useEffect, useState } from "react";
import { apiURL } from "../constant";
import axios from "axios";
import type { TVideo } from "../hooks/useVideos";
import { getToken } from "../utils/storage";
import { useNavigate } from "react-router-dom";

interface Video {
    total: number;
    page: number;
    limit: number;
    videos: TVideo[];
}


const StatsPosts = ({ data }: { data: TVideo[] }) => {
  // Total posts
  const totalPosts = data?.length || 0;

  // Total long videos (type = "2")
  const totalLong =
    data?.filter((post: { type: string; }) => {
        return post.type === "2"
    }).length || 0;

  // Total short videos (type = "1")
  const totalShort =
    data?.filter((post: { type: string; }) => {
        return post.type === "1"
    }).length || 0;

  return (
    <div className="flex gap-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-md">
      {/* Total Posts */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded shadow text-center border border-transparent dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Total
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {totalPosts}
        </p>
      </div>

      {/* Total Long */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded shadow text-center border dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Long
        </h3>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {totalLong}
        </p>
      </div>

      {/* Total Short */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded shadow text-center border dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Short
        </h3>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          {totalShort}
        </p>
      </div>
    </div>
  );
};

const CreatorVideosCard = ({ creatorId }: { creatorId: string }) => {
    const [videos, setVideos] = useState<TVideo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await axios.get<Video>(`${apiURL}/creators/videos/${creatorId}`, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                });
                setVideos(res.data.videos);
            } catch (err) {
                console.error("Erreur lors du chargement des vidéos", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [creatorId]);
    const nav = useNavigate();

    if (loading) return <div className="p-4 text-center">Chargement des vidéos...</div>;

    return (
        <div>
         {videos && <StatsPosts data={videos} />}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {videos.map((video) => (
                <div key={video.id} className="card bg-base-200 shadow-md hover:shadow-xl transition rounded-md">
                    <figure>
                        <img src={video.s3_urls.coverUrl || video.public_urls.local_cover_url || `https://placehold.co/600x400` } alt={video.public_urls.local_cover_url} className="w-full h-40 object-cover" />
                    </figure>
                    <div className="card-body p-4">
                        <h2 className="card-title text-base">{video.id}</h2>
                        <p className="text-sm opacity-70">Durée : {video.duration}</p>

                        <div className="card-actions justify-end mt-3">
                            <button className="px-3 py-1 border border-blue-400" onClick={() => nav( video.user.username === 'userbot' ? `/bot-videos/${video.id}` : `/videos/${video.id}`)}>Voir</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        </div>
    );
};
export default CreatorVideosCard;