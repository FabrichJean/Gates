import React from "react";
import type { VideoForApp } from "../api/videoForApp";
import Pagination from "../components/Pagination";
import DeepLoader from "../components/DeepLoader";
import { checkObjectContent } from "../utils/filter";
import { useVideoForAppContext } from "../context/VideoForAppContext";
import { useAuth } from "../hooks/useAuth";
import VideoHeader from "../components/videos/VideoHeader";
import VideoTableHeader from "../components/videos/VideoTableHeader";
import VideoTableRow from "../components/videos/VideoTableRow";
import { updateVideoForApp } from "../api/videoForApp";




const VideoForAppManagement = () => {
  const { user } = useAuth();
  const ctx = useVideoForAppContext();
  if (!ctx) return null;

  const {
    page,
    setPage,
    filters,
    setFilters,
    params,
    data,
    loading,
    mutate,
    toWebapp,
    activate,
    send,
    reFetch,
  } = ctx;

  // Listen for custom event to trigger reFetch
  React.useEffect(() => {
    const handler = () => reFetch();
    window.addEventListener('request-videos-refetch', handler);
    return () => window.removeEventListener('request-videos-refetch', handler);
  }, [reFetch]);

  return (
    <div className="flex flex-col gap-2 min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-2 pb-0">
      <VideoHeader
        user={user}
        filters={filters as any}
        setFilters={setFilters}
        params={{ status: "all", page, ...params }}
        loading={undefined}
        onMutate={mutate}
        onWebApp={toWebapp}
        scope="videos"
      />

      {checkObjectContent(filters).hasContent ? (
        <span className="mb-3 text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">* app videos filters</span>
      ) : null}

      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-gray-800 overflow-hidden">
  {loading && <DeepLoader />}

        <div className="overflow-x-auto pb-[8rem]">
          <table className="min-w-full w-max text-sm md:text-base bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
            <VideoTableHeader />
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300 pb-[8rem] transition-colors duration-300">
              {data?.videos?.map((video: VideoForApp, index: number) => (
                <VideoTableRow
                  key={video.id}
                  video={video as any}
                  index={index}
                  onActivate={activate}
                  onSend={send}
                  updateFn={updateVideoForApp}
                  hideTouchLink={true}
                  cancelFn={undefined}
                  reFetchFn={reFetch}
                  detailsPath="/app-videos"
                  convertToMp4Fn={undefined}
                />
              ))}
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

export default VideoForAppManagement;
