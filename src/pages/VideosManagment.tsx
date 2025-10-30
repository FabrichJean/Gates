/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { UseVideosWithParams } from "../hooks/useVideos";
import { sendProcessing, toggleStatus, webApp } from "../api/videos";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";
import SearchModal from "../components/SearchModal";
import VideoFilters, { type TFilter } from "../components/VideoFilters";
import { FilePlus, Filter, SendIcon } from "lucide-react";
import DeepLoader from "../components/DeepLoader";
import { useAuthMe } from "../hooks/useAuth";
import { motion, useAnimation } from "framer-motion";
import RoleEnum from "../utils/roleEnum";
import useSocketSend from "../hooks/useSocketSend";
import useSocketCheckVideos from "../hooks/useSocketCheckVideos";
import { checkObjectContent, mapStatus } from "../utils/filter";
import CheckingSuperadmin from "../components/CheckingSuperadmin";
import { PROCESSED_STORAGE_KEY, SENDING_STORAGE_KEY } from "../constant";

export type Video = {
  id: number;
  user_id: number;
  hls_url: string;
  category_id: number;
  temp_url: string;
  url: string;
  transfer_status: number;
  upload_status: number;
  cover: string;
  duration: number;
  sequence: number;
  isDeleted: boolean;
  ref?: string;
  user?: { id: number; username: string };
  category?: { name: string };
  subCategory?: { name: string };
};

const VideosManagment = () => {
  const { data: user } = useAuthMe();
  const [page, setPage] = useState(1);

  const fabControls = useAnimation();

  // 🔹 Gestion persistante des états (en cours / traités)

  const [filters, setFilters] = useState<TFilter>({
    category_id: "",
    sub_category_id: "",
    user_id: "",
    isDeleted: "",
    upload_status: "",
    cover_upload_status: "",
    transfer_status: "",
    startedAt: "",
    endAt: "",
  });

  console.log(filters);
  

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [params, setParams] = useState<any>(null);
  const { data, reFetch, mutate } = UseVideosWithParams(params);

  // 🔹 Lecture initiale du filtre sauvegardé
  useEffect(() => {
    const saved = localStorage.getItem("videos_filtered");
    if (!saved || saved === "undefined") return;
    try {
      const parsed = JSON.parse(saved);
      setFilters((prev) => ({ ...prev, ...parsed }));
    } catch (e) {
      console.warn("⚠️ Filtres corrompus :", e);
      localStorage.removeItem("videos_filtered");
    }
  }, []);

  // 🔹 Création mémoïsée des params
  const computedParams = useMemo(() => {
    const _ = {
      ...filters,
      isDeleted: mapStatus(filters.isDeleted),
      upload_status: mapStatus(filters.upload_status),
      cover_upload_status: mapStatus(filters.cover_upload_status),
      transfer_status: mapStatus(filters.transfer_status),
    };

    return { status: "all", page, ..._ };
  }, [filters, page]);

  // 🔹 Mise à jour de params quand computedParams change
  useEffect(() => {
    setParams(computedParams);
  }, [computedParams]);


  // // recalcul dynamique des params
  // useEffect(() => {
  //   try {
  //     const saved = localStorage.getItem("videos_filtered");
  //     if (!saved || saved === "undefined") return;

  //     const savedFilter = JSON.parse(saved);

  //     const _ = {
  //       ...savedFilter,
  //       isDeleted: reverseStatus(savedFilter.isDeleted),
  //       cover_upload_status: reverseStatus(savedFilter.cover_upload_status),
  //       transfer_status: reverseStatus(savedFilter.transfer_status),
  //       upload_status: reverseStatus(savedFilter.upload_status),
  //       startedAt: savedFilter.startedAt || "",
  //       endAt: savedFilter.endAt || "",
  //     };

  //     const data = {
  //       ..._,
  //       isDeleted: mapStatus(_.isDeleted),
  //       cover_upload_status: mapStatus(_.cover_upload_status),
  //       transfer_status: mapStatus(_.transfer_status),
  //       upload_status: mapStatus(_.upload_status),
  //     };

  //     const finalParams = { status: "all", page, ...data };
  //     setParams(finalParams);
  //   } catch (e) {
  //     console.warn("⚠️ Impossible de lire le filtre sauvegardé :", e);
  //     localStorage.removeItem("videos_filtered");
  //   }
  // }, [filters, page]);


  const [sendingIds, setSendingIds] = useState<Array<number>>(() => {
    try {
      const raw = localStorage.getItem(SENDING_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [processedIds, setProcessedIds] = useState<Array<number>>(() => {
    try {
      const raw = localStorage.getItem(PROCESSED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const addSendingId = (id: number) => {
    setSendingIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      localStorage.setItem(SENDING_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeSendingId = (id: number) => {
    setSendingIds((prev) => {
      const next = prev.filter((x) => x !== id);
      localStorage.setItem(SENDING_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addProcessedId = (id: number) => {
    setProcessedIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      localStorage.setItem(PROCESSED_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  useSocketSend((videoId) => {
    const id = Number(videoId);
    removeSendingId(id);
    addProcessedId(id);
    reFetch();
  });
  
  // état de checking des vidéos
  useSocketCheckVideos((data) => {
    console.log("📋 Checking mis à jour pour la vidéo :", data.video_id);
    // Rafraîchir les données pour mettre à jour l'affichage
    reFetch();
  });

  const [loading, setLoading] = useState<{
    id: number | undefined;
    type: "transc" | "upload" | "cover" | "webapp";
  }>();

  const toWebapp = async () => {
    setLoading({ id: 0, type: "webapp" });
    try {
      await webApp();
      toast.success("✅ Envoyé avec succès vers le WebApp !");
      reFetch();
    } catch {
      toast.error("❌ Erreur lors de l’envoi !");
    } finally {
      setLoading(undefined);
    }
  };

  const activate = async (videoId: number) => {
    try {
      await toggleStatus(videoId);
      reFetch();
      toast.success("✅ Statut modifié !");
    } catch {
      toast.error("❌ Erreur lors du changement de statut");
    }
  };

  const send = async (videoId: number) => {
    if (sendingIds.includes(videoId) || processedIds.includes(videoId)) return;

    addSendingId(videoId);
    setLoading({ id: videoId, type: "transc" });

    try {
      const res = await sendProcessing(videoId);
      toast.success(res?.data?.message || "✅ Deep upload workflow started");
      reFetch();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "❌ Erreur d’envoi !");
      removeSendingId(videoId); // 🔓 réactive seulement si erreur immédiate
    } finally {
      setLoading(undefined);
    }
  };

  return (
    <div className="flex flex-col gap-2 min-h-screen bg-white p-6 pb-0">
      <header className="flex flex-wrap justify-start items-center">
        <h1 className="text-3xl font-semibold pb-3 text-gray-500">
          Video Management
        </h1>

        <div className="flex items-center gap-4 justify-between w-full">
          <VideoFilters
            filters={filters}
            setFilters={setFilters}
            params={{ status: 'all', page, ...params }}
            onSubmit={(fetched) => {
              mutate(fetched);
            }}
          />

          {/* ---- Filtres et recherche ---- */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const modal = document.getElementById(
                  "search_modal_52"
                ) as HTMLDialogElement | null;
                modal?.showModal();
              }}
              className="input input-ghost hover:bg-base-200 cursor-pointer transition-colors bg-white rounded-lg"
            >
              {checkObjectContent(filters).allEmpty ? null : <div className="status status-info animate-bounce"></div>} <Filter className="w-3" /> filters 
            </button>

            <SearchModal />

            <button
              onClick={() => {
                const modal = document.getElementById(
                  "search_modal_45"
                ) as HTMLDialogElement | null;
                modal?.showModal();
              }}
              className="input input-ghost hover:bg-base-200 cursor-pointer transition-colors bg-white rounded-lg"
            >
              <span className="grow text-left">Search…</span>
              <kbd className="kbd kbd-sm font-mono opacity-50">
                <span className="me-1 text-sm">⌘</span>K
              </kbd>
            </button>
          </div>

          {/* ---- Actions ---- */}
          <div className="flex gap-2">
            <Link
              to={"/videos/upload"}
              className="hidden md:flex items-center justify-center gap-2 p-2.5 rounded-lg border border-gray-200 bg-white/90 text-gray-800 font-medium text-sm hover:bg-blue-50 transition-all"
            >
              <FilePlus className="w-5 h-auto text-blue-400" />
            </Link>

            {user?.role === RoleEnum.SUPERADMIN && (
              <button
                disabled={loading?.type === "webapp"}
                onClick={toWebapp}
                className="p-2.5 rounded-lg flex items-center justify-center gap-2 px-3.5 py-2 text-nowrap font-medium text-sm border bg-white/90 text-gray-800 border-gray-200 hover:border-gray-300 hover:bg-base-200 transition-all"
              >
                <SendIcon className="text-blue-400" />
                <span className="md:inline hidden text-gray-600">
                  send to webApp
                </span>
              </button>
            )}
          </div>

          {/* ---- FAB mobile ---- */}
          <motion.div
            drag
            dragMomentum={false}
            onDragEnd={() => fabControls.start({ x: 0, y: 0 })}
            className="md:hidden fixed z-40 bottom-5 right-5 flex items-center justify-center p-3 rounded-full border border-gray-200 bg-white/90 text-gray-800 shadow-sm hover:bg-blue-50 hover:shadow-md transition-all"
          >
            <Link to={"/videos/upload"}>
              <FilePlus className="w-8 h-auto text-blue-400 animate-pulse" />
            </Link>
          </motion.div>
        </div>
      </header>

      {checkObjectContent(filters).hasContent ? <span className="mb-3 text-xs font-bold">* videos filters</span> : null}

      {/* ---- Table ---- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading?.type === "webapp" && <DeepLoader />}

        <div className="overflow-x-auto pb-[8rem]">
          <table className="min-w-full w-max text-sm md:text-base ">
            <thead className="bg-gray-50 text-gray-600 uppercase">
              <tr>
                <th className="py-3 px-6 text-left">Ref</th>
                <th className="py-3 px-6 text-left">Username</th>
                <th className="py-3 px-6 text-left">Category</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-center">Cover</th>
                <th className="py-3 px-6 text-center">Duration</th>
                <th className="py-3 px-6 text-left">Activate</th>
                <th className="py-3 px-6 text-center">Checking</th>
                <th className="py-3 px-6 text-center">Actions</th>
                <th className="py-3 px-6 text-center">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700 pb-[8rem]">
              {data?.videos?.map((video, index) => {
                const isProcessing =
                  sendingIds.includes(video.id) ||
                  processedIds.includes(video.id) ||
                  video.transfer_status === 1 ||
                  video.upload_status === 1;

                return (
                  <tr key={video.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-6 font-light">{video.ref}</td>
                    <td className="py-3 px-6 text-blue-600 underline">
                      {user?.role === RoleEnum.SUPERADMIN ? (
                        <Link
                          to={`/users/${video.user?.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {video.user?.username}
                        </Link>
                      ) : (
                        video.user?.username
                      )}
                    </td>

                    <td className="py-3 px-6 font-light">
                      {video.category?.name} / {video.subCategory?.name}
                    </td>

                    <td className="py-3 px-6">
                      {video.upload_status === 1 ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                          uploaded
                        </span>
                      ) : video.transfer_status === 1 ? (
                        <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-xs font-semibold">
                          waiting for Upload
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                          waiting for Transcode
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-6 text-center">
                      <img
                        src={`${video.public_urls.cover_url}`}
                        alt="cover"
                        className="w-20 h-12 object-cover rounded-lg mx-auto"
                      />
                    </td>

                    <td className="py-3 px-6 text-center font-light">
                      {(Number(video.duration) / 1000).toFixed()} s
                    </td>

                    <td className="py-3 px-6 text-center">
                      <input
                        type="checkbox"
                        checked={!video.isDeleted}
                        className="toggle"
                        onChange={
                          user?.role === RoleEnum.SUPERADMIN
                            ? () => activate(video.id)
                            : undefined
                        }
                      />
                    </td>

                    <td className="py-3 px-6 text-center">
                      {/* @ts-ignore */}
                      <CheckingSuperadmin index={index} reFetch={reFetch} video={video} user={user} />
                    </td>

                    {/* actions */}
                    <td className="py-3 px-6 text-center">
                      <div className="flex justify-center gap-2 flex-wrap">
                        {user?.role === RoleEnum.SUPERADMIN && (
                          <button
                            disabled={isProcessing}
                            onClick={() => {
                              if (video.checking !== 'checked') {
                                return alert("We need to check this video")
                              }
                              send(video.id)
                            }}
                            className={`relative flex w-[150px] items-center justify-center gap-2 px-6 py-2.5 font-medium text-sm rounded-xl transition-all duration-300 ${isProcessing
                              ? "cursor-not-allowed bg-gray-100 text-gray-500"
                              : "cursor-pointer bg-white/90 hover:bg-white text-gray-800 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                              }`}
                          >
                            {sendingIds.includes(video.id) ? (
                              <>
                                <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                <span>processing...</span>
                              </>
                            ) : video.upload_status === 1 && video.transfer_status === 1 ? (
                              <span className="text-green-600 font-semibold flex gap-1 items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                Uploaded
                              </span>
                            ) : (
                              <span className="underline hover:text-blue-500">🚀 Send</span>
                            )}
                          </button>
                        )}

                        <Link
                          to={`/videos/${video.id}`}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer underline font-light hover:text-blue-400 transition-all"
                        >
                          Details
                        </Link>
                      </div>
                    </td>

                    <td className="py-3 px-6 text-center font-light">
                      {new Date(video.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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