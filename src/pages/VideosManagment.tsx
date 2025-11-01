/* eslint-disable @typescript-eslint/ban-ts-comment */
import Pagination from "../components/Pagination";
import DeepLoader from "../components/DeepLoader";
import { useAuthMe } from "../hooks/useAuth";
import { checkObjectContent } from "../utils/filter";
import { useVideoManagement } from "../hooks/useVideoManagement";
import VideoHeader from "../components/videos/VideoHeader";
import VideoTableHeader from "../components/videos/VideoTableHeader";
import VideoTableRow from "../components/videos/VideoTableRow";
import type { Video } from "../types/video";

// Re-export du type pour la compatibilité
export type { Video };

const VideosManagment = () => {
  const { data: user } = useAuthMe();
  const {
    page,
    setPage,
    filters,
    setFilters,
    params,
    data,
    loading,
    sendingIds,
    processedIds,
    reFetch,
    mutate,
    toWebapp,
    activate,
    send,
  } = useVideoManagement();

  return (
    <div className="flex flex-col gap-2 min-h-screen bg-white p-6 pb-0">
      <VideoHeader
        user={user}
        filters={filters}
        setFilters={setFilters}
        params={{ status: 'all', page, ...params }}
        loading={loading}
        onMutate={mutate}
        onWebApp={toWebapp}
      />

      {checkObjectContent(filters).hasContent ? (
        <span className="mb-3 text-xs font-bold">* videos filters</span>
      ) : null}

      {/* ---- Table ---- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading?.type === "webapp" && <DeepLoader />}

        <div className="overflow-x-auto pb-[8rem]">
          <table className="min-w-full w-max text-sm md:text-base ">
            <VideoTableHeader />
            <tbody className="divide-y divide-gray-200 text-gray-700 pb-[8rem]">
              {data?.videos?.map((video, index) => {
                const isProcessing =
                  sendingIds.includes(video.id) ||
                  processedIds.includes(video.id) ||
                  video.transfer_status === 1 ||
                  video.upload_status === 1;

                return (
                  <VideoTableRow
                    key={video.id}
                    video={video}
                    index={index}
                    user={user}
                    isProcessing={isProcessing}
                    sendingIds={sendingIds}
                    onActivate={activate}
                    onSend={send}
                    reFetch={reFetch}
                  />
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