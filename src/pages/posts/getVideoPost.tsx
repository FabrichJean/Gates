import { useState } from "react";
import { Video, X, Trash2 } from "lucide-react";
import { FaPlayCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import { deletePostVideo } from "../../api/posts";
import type { Video as VideoType } from "../../hooks/usePost";

interface GetVideoPostProps {
  videos: VideoType[];
  reFetch?: () => void;
}

const GetVideoPost = ({ videos, reFetch }: GetVideoPostProps) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [localVideos, setLocalVideos] = useState<VideoType[]>(videos || []);
  const [playingId, setPlayingId] = useState<number | null>(null);

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Videos ({videos.length})
          </p>
          {videos.length > 3 && (
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Video size={18} />
              <span>Voir plus ({videos.length - 3})</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          {videos.slice(0, 3).map((video, index) => {
            const videoUrl = video.s3_urls?.hlsUrl || video.public_urls?.local_mp4_url || video.cdn_url;
            const coverUrl =
              video?.s3_urls?.coverUrl ||
              video?.public_urls?.local_cover_path ||
              "";

            return (
              <div key={video.id || index} className="relative w-full md:w-64">
                {playingId === video.id ? (
                  <div className="relative">
                    <video
                      src={videoUrl || ""}
                      controls
                      autoPlay
                      className="w-full h-40 md:h-48 object-cover rounded-lg shadow-md"
                      onEnded={() => setPlayingId(null)}
                    />
                    <button
                      onClick={() => setPlayingId(null)}
                      className="absolute top-2 right-2 p-1 rounded bg-black/60 text-white"
                      title="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative h-40 md:h-48 rounded-lg overflow-hidden bg-black">
                    <span className="absolute top-2 left-2 px-3 py-1 text-xs rounded-md bg-indigo-600 text-white">{ video.type === '1' ? 'short' : 'long' }</span>
                    <img
                      src={coverUrl}
                      alt={`cover-${video.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => ((e.target as HTMLImageElement).src = "")}
                    />
                    <FaPlayCircle
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-6xl opacity-90 cursor-pointer"
                      onClick={() => setPlayingId(video.id)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal DaisyUI pour afficher toutes les vidéos */}
      <dialog className={`modal ${isVideoModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box max-w-6xl w-11/12 max-h-[90vh]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-2xl">
              Videos ({videos.length})
            </h3>
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localVideos.map((video, index) => {
              const videoUrl =
                video.s3_urls.hlsUrl || video.public_urls?.local_mp4_url || video.cdn_url;
              const coverUrl =
                video.local_cover_path ||
                (video as any)?.s3_urls?.coverUrl ||
                (video as any)?.public_urls?.cover_url ||
                (video as any)?.cover ||
                "";

              const handleDelete = async () => {
                const confirmed = window.confirm("Supprimer cette vidéo ?");
                if (!confirmed) return;
                try {
                  await deletePostVideo(video.id);
                  toast.success("Vidéo supprimée");
                  setLocalVideos((prev) => prev.filter((v) => v.id !== video.id));
                  reFetch && reFetch();
                } catch (err) {
                  console.error(err);
                  toast.error("Erreur lors de la suppression");
                }
              };

              return (
                <div key={video.id} className="relative group">
                  {playingId === video.id ? (
                    <div className="relative">
                      <video
                        src={videoUrl || ""}
                        controls
                        autoPlay
                        className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
                        onEnded={() => setPlayingId(null)}
                      />
                      <button
                        onClick={() => setPlayingId(null)}
                        className="absolute top-2 right-2 p-2 rounded bg-black/60 text-white"
                        title="Close"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden bg-black">
                        <img
                          src={coverUrl}
                          alt={`cover-${video.id}`}
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.target as HTMLImageElement).src = "")}
                        />
                        <FaPlayCircle
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-6xl opacity-90 cursor-pointer"
                          onClick={() => setPlayingId(video.id)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 badge badge-neutral">
                    {index + 1}/{localVideos.length}
                  </div>
                  <button
                    title="Supprimer"
                    onClick={handleDelete}
                    className="absolute top-2 left-2 p-2 rounded bg-red-600 text-white opacity-90 hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsVideoModalOpen(false)}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default GetVideoPost;
