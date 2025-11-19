import { useState } from "react";
import { Video, X, Trash2 } from "lucide-react";
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
            return (
              <video
                key={index}
                src={videoUrl || ""}
                controls
                className="w-full md:w-64 h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow"
              />
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
                  <video
                    src={videoUrl || ""}
                    controls
                    className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
                  />
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
