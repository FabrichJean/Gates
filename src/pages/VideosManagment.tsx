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
    reFetch,
    mutate,
    toWebapp,
    activate,
    send,
  } = useVideoManagement();

  return (
    <div className="flex flex-col gap-2 min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-6 pb-0">
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
        <span className="mb-3 text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">* videos filters</span>
      ) : null}

      {/* ---- Table ---- */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-gray-800 overflow-hidden">
        {loading?.type === "webapp" && <DeepLoader />}

        <div className="overflow-x-auto pb-[8rem]">
          <table className="min-w-full w-max text-sm md:text-base bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
            <VideoTableHeader />
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300 pb-[8rem] transition-colors duration-300">
              {data?.videos?.map((video, index) =>
                <VideoTableRow
                  key={video.id}
                  video={video}
                  index={index}
                  user={user}
                  onActivate={activate}
                  onSend={send}
                  reFetch={reFetch}
                />)}
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