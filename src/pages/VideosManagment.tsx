/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UseVideos from "../hooks/useVideos";
import { server } from "../constant";
import { toggleStatus, transcodeVideo, uploadCover, uploadS3, webApp } from "../api/videos";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";
import SearchModal from "../components/SearchModal";
import VideoFilters from "../components/VideoFilters";
import { FilePlus, Filter, SendIcon } from "lucide-react";
import { useProgress } from "../hooks/useProgress";
// Note: removed global animated loader usage from this page to allow concurrent actions
import { useAuthMe } from "../hooks/useAuth";
import { motion, useAnimation } from "framer-motion"
import RoleEnum from "../utils/roleEnum";
import { socket } from "../utils/socket"; // import socket for real-time updates

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
  const { data: user } = useAuthMe();
  const [page, setPage] = useState(1);
  const { data, reFetch, mutate } = UseVideos('all', page);
  const { addProgress, updateProgress } = useProgress();

  // controls for the floating action button (FAB) so it can snap back after drag
  const fabControls = useAnimation();

  // console.log(data.videos);


  useEffect(() => {
    reFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // per-video, per-action loading map to allow concurrent actions
  const [loadingMap, setLoadingMap] = useState<Record<string, Partial<Record<'transc' | 'upload' | 'cover' | 'webapp', boolean>>>>({});

  const setActionLoading = (videoId: string | number | undefined | null, action: 'transc' | 'upload' | 'cover' | 'webapp', value: boolean) => {
    const key = videoId === null || videoId === undefined ? 'global' : String(videoId);
    setLoadingMap(prev => ({ ...prev, [key]: { ...(prev[key] || {}), [action]: value } }));
    // persister les IDs de transcodage en cours pour que le bouton reste désactivé lors de la navigation
    if (action === 'transc') {
      try {
        const raw = localStorage.getItem('transcodingVideos') || '[]';
        const list: string[] = JSON.parse(raw);
        const idStr = String(videoId);
        if (value) {
          if (!list.includes(idStr)) {
            list.push(idStr);
            localStorage.setItem('transcodingVideos', JSON.stringify(list));
          }
        } else {
          const idx = list.indexOf(idStr);
          if (idx !== -1) {
            list.splice(idx, 1);
            localStorage.setItem('transcodingVideos', JSON.stringify(list));
          }
        }
      } catch (e) {
        // ignore localStorage errors
      }
    }
  }

  const isActionLoading = (videoId: string | number | undefined | null, action: 'transc' | 'upload' | 'cover' | 'webapp') => {
    const key = videoId === null || videoId === undefined ? 'global' : String(videoId);
    return !!loadingMap[key]?.[action];
  }

  const toWebapp = async () => {
    setActionLoading(null, 'webapp', true);
    await webApp()
      .then(() => {
        reFetch();
        toast.success("success");
      })
      .catch(() => {
        toast.error("Error");
      })
      .finally(() => setActionLoading(null, 'webapp', false));
  }

  // initialiser depuis localStorage pour que les boutons restent désactivés lors de la navigation
  useEffect(() => {
    try {
      const raw = localStorage.getItem('transcodingVideos') || '[]';
      const list: string[] = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        const newMap: Record<string, Partial<Record<'transc' | 'upload' | 'cover' | 'webapp', boolean>>> = {};
        for (const id of list) newMap[String(id)] = { transc: true };
        setLoadingMap(prev => ({ ...newMap, ...prev }));
      }
    } catch (e) { }
  }, []);

  // Écouter les événements socket émis par le worker backend
  useEffect(() => {
    const handler = (payload: any) => {
      // backend emits: { videoId, status, type, userId }
      if (!payload || payload.type !== 'transcode') return;

      const vid = String(payload.videoId);

      if (payload.status === 'finished') {
        // mark finished: remove from localStorage and clear loading
        setActionLoading(vid, 'transc', false);
        // also refetch data to update upload_status / hls_url
        reFetch();
        toast.success(`Video ${vid} transcoded`);
      } else if (payload.status === 'error') {
        setActionLoading(vid, 'transc', false);
        toast.error(`Transcode error for video ${vid}`);
      } else if (payload.status === 'started' || payload.status === 'processing') {
        // mark as in-progress
        setActionLoading(vid, 'transc', true);
      }
    };

    try {
      socket.on('async-status', handler);
    } catch (e) {
      // socket may be undefined or not connected; ignore
    }

    return () => {
      try {
        socket.off('async-status', handler);
      } catch (e) { }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reFetch]);

  const transcode = async (videoId: string | number | undefined) => {

    setActionLoading(videoId, 'transc', true);

    const id = addProgress({ name: String(videoId), type: "upload" });

    await transcodeVideo(videoId, (event) => {
      const percent = Math.round((event.loaded * 100) / (event.total || 1));
      updateProgress(id, percent);
    })
      .then(() => {
        toast.success("success");
        reFetch();
      })
      .catch(() => {
        toast.error("Error");
      })
      .finally(() => setActionLoading(videoId, 'transc', false));
  }

  const upload = async (videoId: string | number | undefined) => {
    setActionLoading(videoId, 'upload', true);
    await uploadS3(videoId)
      .then(() => {
        reFetch();
        toast.success("success");
      })
      .catch(() => {
        toast.error("Error");
      })
      .finally(() => setActionLoading(videoId, 'upload', false));
  }

  const cover = async (videoId: string | number) => {
    setActionLoading(videoId, 'cover', true);
    await uploadCover(videoId)
      .then(() => {
        reFetch();
        toast.success("success");
      })
      .catch(() => {
        toast.error("Error");
      })
      .finally(() => setActionLoading(videoId, 'cover', false));
  }

  const activate = async (videoId: string | number) => {
    await toggleStatus(videoId)
      .then(() => {
        reFetch();
        toast.success("success");
      })
      .catch(() => {
        toast.error("Error");
      });
  }


  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <header className="flex flex-wrap justify-start items-center mb-6">
        <h1 className="text-3xl font-semibold pb-3 text-gray-500">Video Management</h1>
        <div className="flex items-center gap-4 justify-between w-full">

          <VideoFilters onSubmit={(fetched) => {
            console.log(fetched);

            mutate(fetched)
          }} />

          <div className="flex gap-2">
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
          </div>


          <div className="flex gap-2">
            <Link to={"/videos/upload"} className="hidden md:flex items-center justify-center gap-2 p-2.5 rounded-lg border border-gray-200 bg-white/90 text-gray-800 font-medium text-sm  hover:bg-blue-50 transition-all duration-200">
              <FilePlus className="w-5 h-auto text-blue-400" />
            </Link>
            {user?.role === RoleEnum.SUPERADMIN ? <button disabled={isActionLoading(null, 'webapp')} onClick={toWebapp.bind(null)} className="p-2.5 rounded-lg hover:bg-base-200 flex items-center justify-center gap-2 px-3.5 py-2 text-nowrap font-medium text-sm md:rounded-xl transition-all duration-300 backdrop-blur-md border cursor-pointer bg-white/90 text-gray-800 border-gray-200 hover:border-gray-300 ">
              <SendIcon className="text-blue-400" /> <span className="md:inline hidden text-gray-600">send to webApp</span>
            </button> : null}

          </div>

          <motion.div
            drag
            dragMomentum={false}
            onDragEnd={() => {
              // snap back to its original position
              fabControls.start({ x: 0, y: 0 });
            }}
            className="md:hidden fixed z-40 bottom-5 right-5 flex items-center justify-center gap-2 p-3 rounded-full border border-gray-200 bg-white/90 text-gray-800 font-medium text-sm shadow-sm hover:bg-blue-50 hover:shadow-md transition-all duration-200"
          >
            <Link to={"/videos/upload"}>
              <FilePlus className="w-8 h-auto text-blue-400 animate-pulse" />
            </Link>
          </motion.div>

        </div>
      </header >

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
                  <td className="py-3 px-6 font-light">{video.ref}</td>
                  <td className="py-3 px-6 text-blue-600 underline">
                    {user.role === RoleEnum.SUPERADMIN ?
                      <Link to={"/users/" + video.user.id} className="text-blue-600 hover:underline font-light">
                        {video.user.username}
                      </Link> : video.user.username
                    }
                  </td>
                  <td className="py-3 px-6 font-light">{video.category.name} / {video.subCategory?.name}</td>
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
                  <td className="py-3 px-6 text-center font-light">{(Number(video.duration) / 1000).toFixed()} s</td>
                  <td className="py-3 px-6 text-center">
                    <input type="checkbox" checked={!video.isDeleted} className="toggle " onChange={user?.role === RoleEnum.SUPERADMIN ? activate.bind(null, video.id) : undefined} />
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex justify-center gap-2 flex-wrap">
                      {/* Upload button */} 
                      <button
                        disabled={
                          isActionLoading(video.id, 'transc') ||
                          video?.transfer_status === 1
                        }
                        className={`px-4 py-2 rounded-md transition-all font-light ${isActionLoading(video.id, 'transc') || video?.transfer_status === 1
                          ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                          : 'hover:bg-gray-100 hover:text-blue-400 cursor-pointer text-gray-700'
                          }`}
                        onClick={
                          isActionLoading(video.id, 'transc') ? undefined : transcode.bind(null, video.id)
                        }
                      >
                        {isActionLoading(video.id, 'transc') ? 'Processing...' : '🎞️ Transcode'}
                      </button>
                      {/* Upload cover button */}  
                      <button
                        disabled={
                          isActionLoading(video.id, 'cover') || video?.cover_upload_status === 1
                        }
                        className={`px-4 py-2 rounded-md transition-all font-light ${isActionLoading(video.id, 'cover') || video?.cover_upload_status === 1
                          ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                          : 'hover:bg-gray-100 hover:text-blue-400 cursor-pointer text-gray-700'
                          }`}
                        onClick={
                          isActionLoading(video.id, 'cover') ? undefined : cover.bind(null, video.id)
                        }
                      >
                        {isActionLoading(video.id, 'cover') ? 'Uploading cover...' : 'Upload cover'}
                      </button>
                      {/* Upload button */}
                      <button
                        disabled={
                          isActionLoading(video.id, 'upload') || video?.upload_status === 1
                        }
                        className={`px-4 py-2 rounded-md transition-all font-light ${isActionLoading(video.id, 'upload') || video?.upload_status === 1
                            ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                            : 'hover:bg-gray-100 hover:text-blue-400 cursor-pointer text-gray-700'
                          }`}
                        onClick={
                          isActionLoading(video.id, 'upload') ? undefined : upload.bind(null, video.id)
                        }
                      >
                        {isActionLoading(video.id, 'upload') ? 'Uploading...' : '☁️ Upload S3'}
                      </button>
                      {/* Details button */}
                      <Link to={"/videos/" + video.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer underline font-light hover:text-blue-400 transition-all"
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

      </div >

    </div >
  );
};

export default VideosManagment;
