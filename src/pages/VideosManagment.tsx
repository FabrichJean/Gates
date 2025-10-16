/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UseVideos from "../hooks/useVideos";
import { server } from "../constant";
import { toggleStatus, transcodeVideo, uploadCover, uploadS3 } from "../api/videos";
import toast from "react-hot-toast";
import { SyncLoader } from "react-spinners";
import Pagination from "../components/Pagination";
import SearchModal from "../components/SearchModal";
import VideoFilters from "../components/VideoFilters";
import { Filter } from "lucide-react";

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

const VideosManagment = () => {
  const [page, setPage] = useState(1);
  const { data, reFetch, mutate } = UseVideos('all', page);

  // console.log(data.videos);
  

  useEffect(() => {
    reFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const [loading, setLoading] = useState<{ id: string | number | undefined, type: 'transc' | 'upload' | 'cover' }>();

  const transcode = async (videoId: string | number | undefined) => {
    setLoading({ id: videoId, type: 'transc' });
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
    setLoading({ id: videoId, type: 'upload' });
    await uploadS3(videoId)
      .then(() => {
        reFetch();
        toast.success("success");
      })
      .catch(() => {
        toast.error("Error");
      })
      .finally(() => setLoading(undefined));
  }

  const cover = async (videoId: string | number) => {
    setLoading({ id: videoId, type: 'cover' });
    await uploadCover(videoId)
      .then(() => {
        reFetch();
        toast.success("success");
      })
      .catch(() => {
        toast.error("Error");
      })
      .finally(() => setLoading(undefined));
  }

  const activate = async (videoId: string | number) => {
    await toggleStatus(videoId)
      .then(() => {
        reFetch();
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
      <header className="flex flex-wrap justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Video Management</h1>
        <div className="flex items-center gap-4">

          <VideoFilters onSubmit={(fetched) => {
            console.log(fetched);
            
            mutate(fetched)
          }}/>
          {/* @ts-expect-error */}
          <button onClick={() => document.getElementById('search_modal_52').showModal()} className="input input-ghost hover:bg-base-200 focus-visible:bg-base-200 cursor-pointer transition-colors focus:outline-none bg-white rounded-lg">
            <Filter className="w-3" /> filters
          </button>

          <SearchModal />
          {/* @ts-expect-error */}
          <button onClick={() => document.getElementById('search_modal_45').showModal()} className="input input-ghost hover:bg-base-200 focus-visible:bg-base-200 cursor-pointer transition-colors focus:outline-none bg-white rounded-lg">
            <svg className="hidden size-4 shrink-0 opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
              <g fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.5 7a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm-.82 4.74a6 6 0 1 1 1.06-1.06l2.79 2.79a.75.75 0 1 1-1.06 1.06l-2.79-2.79Z" fill="currentColor" />
              </g>
            </svg>
            <span className="grow text-left">Search…</span>
            <kbd className="kbd kbd-sm font-mono opacity-50">
              <span className="me-1 text-sm">⌘</span>K
            </kbd>
          </button>

          <Link to={"/videos/upload"} className="relative flex items-center justify-center gap-2 px-6 py-2.5 text-nowrap
    font-medium text-sm rounded-xl transition-all duration-300
    backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/90 hover:bg-white text-gray-800 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md">
            + new
          </Link>
        </div>
      </header>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table wrapper pour mobile */}
        <div className="overflow-x-auto">
          <table className="min-w-full w-max text-sm md:text-base">
            <thead className="bg-gray-50 text-gray-600 uppercase">
              <tr>
                <th className="py-3 px-6 text-left">Ref</th>
                <th className="py-3 px-6 text-left">Username</th>
                <th className="py-3 px-6 text-left">Category</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-center">Cover</th>
                <th className="py-3 px-6 text-center">Duration</th>
                <th className="py-3 px-6 text-left">Activate</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {data?.videos?.map((video, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-6">{video.ref}</td>
                  <td className="py-3 px-6 text-blue-600 underline">
                    <Link to={"/users/" + video.user.id} className="text-blue-600 hover:underline">
                      {video.user.username}
                    </Link>
                  </td>
                  <td className="py-3 px-6">{video.category.name}</td>
                  <td className="py-3 px-6">
                    {video.upload_status === 1 ?
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        uploaded
                      </span>
                      :
                      video.transfer_status === 1 ?
                        <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-xs font-semibold">
                          waiting for Upload
                        </span> :
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                          waiting for Transcode
                        </span>
                    }
                  </td>
                  <td className="py-3 px-6 text-center">
                    <img
                      src={server + '/' + video.cover}
                      alt="cover"
                      className="w-20 h-12 object-cover rounded-lg mx-auto"
                    />
                  </td>
                  <td className="py-3 px-6 text-center">{(Number(video.duration) / 1000).toFixed()} s</td>
                  <td className="py-3 px-6 text-center">
                    <input type="checkbox" defaultChecked={!video.isDeleted} checked={!video.isDeleted} className="toggle " onChange={activate.bind(null, video.id)} />
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex justify-center gap-2 flex-wrap">
                      <button
                        disabled={Boolean(loading) || video?.transfer_status === 1}
                        className={`px-4 py-2 hover:bg-gray-100 ${video?.transfer_status === 1 ? 'opacity-15 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={transcode.bind(null, video.id)}
                      >
                        {
                          loading?.id === video.id && loading?.type === 'transc' ?
                            <SyncLoader className="scale-[0.4]" />
                            :
                            "🎞️ Transcode"
                        }
                      </button>
                      <button
                        disabled={Boolean(loading) || video?.cover_upload_status === 1}
                        className={`px-4 py-2 hover:bg-gray-100 ${video?.cover_upload_status === 1 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={cover.bind(null, video.id)}
                      >
                        {
                          loading?.id === video.id && loading?.type === 'cover' ?
                            <SyncLoader className="scale-[0.4]" />
                            :
                            "upload cover"
                        }
                      </button>
                      <button
                        disabled={Boolean(loading) || video?.upload_status === 1}
                        className={`px-4 py-2 hover:bg-gray-100 ${video?.upload_status === 1 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={(upload.bind(null, video.id))}
                      >
                        {
                          loading?.id === video.id && loading?.type === 'upload' ?
                            <SyncLoader className="scale-[0.4]" />
                            : "☁️ Upload S3"
                        }
                      </button>
                      <Link to={"/videos/" + video.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer underline"
                      >
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          totalItems={data?.total}
          pageSize={data?.limit}
          currentPage={page}
          onPageChange={setPage}
        />

      </div>

    </div>
  );
};

export default VideosManagment;
