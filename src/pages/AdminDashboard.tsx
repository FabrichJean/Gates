import { useState } from "react";
import { Link } from "react-router-dom";
import UseVideos from "../hooks/useVideos";
import { server } from "../constant";
import { transcodeVideo, uploadS3 } from "../api/videos";
import toast from "react-hot-toast";
import { SyncLoader } from "react-spinners";

export type Video = {
  id: unknown;
  user_id: unknown;
  hls_url: unknown;
  category_id: unknown;
  temp_url: unknown;
  url: string;
  transfer_status: unknown;
  upload_status: unknown;
  cover: unknown;
  duration: unknown;
  sequence: unknown;
  isDeleted: unknown;
}

const AdminDashboard = () => {

  const { data, reFetch } = UseVideos();
  const [loading, setLoading] = useState<{id: string | number | undefined, type: 'transc' | 'upload'}>();

  const transcode = async (videoId: string | number | undefined) => {
    setLoading({id: videoId, type: 'transc'});
    await transcodeVideo(videoId)
      .then(() => {
        toast.success("success");
        reFetch();
      })
      .catch(() => {
        toast.error("Error");
      })
      .finally(() => setLoading(undefined));
  }


  const upload = async (videoId: string | number | undefined) => {
    setLoading({id: videoId, type: 'upload'});
    await uploadS3(videoId)
      .then(() => {
        toast.success("success");
      })
      .catch(() => {
        toast.error("Error");
      })
      .finally(() => setLoading(undefined));
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Video Management</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="🔍 Rechercher une vidéo..."
            className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:ring-2 focus:ring-blue-500"
          />
          <Link to={"/upload"} className="relative flex items-center justify-center gap-2 px-6 py-2.5
    font-medium text-sm rounded-xl transition-all duration-300
    backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/90 hover:bg-white text-gray-800 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md">
            + upload
          </Link>
        </div>
      </header>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="py-3 px-6 text-left">Ref</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-center">Cover</th>
              <th className="p
              y-3 px-6 text-center">Duration</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-gray-700">
            {data?.videos?.map((video, index) => (
              <tr key={index} className="hover:bg-gray-50 transition relative">
                <td className="py-3 px-6">{video.ref}</td>
                <td className="py-3 px-6">
                  {video.status === "Uploaded" ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Uploaded
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Waiting for Upload
                    </span>
                  )}
                </td>
                <td className="py-3 px-6 text-center">
                  <img
                    src={server + '/' + video.cover}
                    alt="cover"
                    className="w-20 h-12 object-cover rounded-lg mx-auto"
                  />
                </td>
                <td className="py-3 px-6 text-center">{video.duration}</td>

                {/* Menu */}
                <td className="py-3 px-6 text-center relative">

                  <ul className="flex justify-center text-start text-sm text-gray-700">
                    <button
                      disabled={Boolean(loading) || video?.transfer_status === 1}
                      className={`px-4 py-2 hover:bg-gray-100 ${video?.transfer_status === 1 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={transcode.bind(null, video.id as string)}
                    >
                     {
                      loading?.id === video.id && loading?.type === 'transc' ? 
                      <SyncLoader className="scale-[0.4]" />
                      :
                      "🎞️ Transcoder"
                     }
                    </button>
                    <button
                      disabled={Boolean(loading) || video?.upload_status === 1}
                      className={`px-4 py-2 hover:bg-gray-100 ${video?.upload_status === 1 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={(upload.bind(null, video.id as string))}
                    >
                      {
                      loading?.id === video.id && loading?.type === 'upload' ?
                        <SyncLoader className="scale-[0.4]" />
                        : "☁️ Upload S3"
                      }
                    </button>
                    <Link to={"/videos/" + video.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Details
                    </Link>
                  </ul>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
