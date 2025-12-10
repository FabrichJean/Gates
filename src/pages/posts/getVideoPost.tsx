import { useState } from "react";
import { Video, X, Trash2 } from "lucide-react";
import { FaPlayCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import { deletePostVideo } from "../../api/posts";
import type { Video as VideoType } from "../../hooks/usePost";
import { getToken } from "../../utils/storage";
import { apiURL } from "../../constant";

interface GetVideoPostProps {
  videos: VideoType[];
  reFetch?: () => void;
  idPost: number;
}

const GetVideoPost = ({ idPost, videos, reFetch }: GetVideoPostProps) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [localVideos, setLocalVideos] = useState<VideoType[]>(videos || []);
  const [playingId, setPlayingId] = useState<number | null>(null);

  const [isConverting, setIsConverting] = useState(false);

  const hasVideoWithoutMp4 = videos?.some(
    (video) => !video.public_urls?.local_mp4_url
  );

  const handleConvertMp4 = async () => {
    if (isConverting) return; // éviter double clic

    const confirmed = window.confirm("Convertir la vidéo en MP4 ?");
    if (!confirmed) return;

    try {
      setIsConverting(true);
      toast.loading("Conversion MP4 en cours...", { id: "convert" });

      const res = await fetch(`${apiURL}/posts-bot/${idPost}/convert-m3u8`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) {
        throw new Error("La conversion a échoué");
      }

      toast.success("Conversion MP4 lancée !", { id: "convert" });

      // Rafraîchir les vidéos après la conversion
      reFetch && reFetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur lors de la conversion", { id: "convert" });
    } finally {
      setIsConverting(false);
    }
  };

  const downloadAsMp4 = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        toast.error("Error downloading the file!");
        return;
      }

      // Convertir en Blob MP4
      const blob = await res.blob();

      // Créer un objectURL temporaire pour télécharger
      const a = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);

      a.href = objectUrl;
      a.download = filename.endsWith(".mp4") ? filename : filename + ".mp4";
      document.body.appendChild(a);
      a.click();

      // Nettoyage
      a.remove();
      URL.revokeObjectURL(objectUrl);

      toast.success("Téléchargement lancé !");

    } catch (err) {
      console.error("Error downloading the MP4:", err);
      toast.error("Error downloading the MP4");
    }
  }

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Videos ({videos.length})

            {/* Afficher le bouton si au moins une vidéo n'a pas encore de MP4 */}
            {hasVideoWithoutMp4 && (
              <button
                onClick={handleConvertMp4}
                disabled={isConverting}
                className="px-3 py-1 border border-green-500 cursor-pointer ml-4 text-green-500 rounded hover:bg-green-500 hover:text-white transition"
              >
                {isConverting ? "Conversion..." : "Convert MP4"}
              </button>
            )}
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
          {/* bouton icon svg download mp4 */}
          {videos.slice(0, 3).map((video, index) => {
            const videoUrl = video.s3_urls?.hlsUrl || video.public_urls?.local_mp4_url || video.cdn_url;
            const coverUrl =
              video?.s3_cover_path ||
              video?.local_cover_path ||
              "";

            return (
              <>

                <div key={video.id || index} className="relative w-full md:w-64">
                  {!hasVideoWithoutMp4 && video.public_urls?.local_mp4_url && (
                  <button
                    onClick={() => downloadAsMp4(video.public_urls!.local_mp4_url!, `video_${video.id}.mp4`)}
                  className="cursor-pointer px-3 py-0.5 active:scale-95 border rounded-lg border-green-600 flex gap-2 items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    {/* <span className="text-gray-800 dark:text-amber-100">MP4</span> */}
                  </button>
                  )}
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
                      <span className="absolute top-2 left-2 px-3 py-1 text-xs rounded-md bg-indigo-600 text-white">{video.type === '1' ? 'short' : 'long'}</span>
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
              </>
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
