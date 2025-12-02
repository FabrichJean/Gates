import type { TVideo } from "../hooks/useVideos";
import Pagination from "../components/Pagination";
import DeepLoader from "../components/DeepLoader";
import { checkObjectContent } from "../utils/filter";
import { useBotVideosContext } from "../context/BotVideosContext";
import { useAuth } from "../hooks/useAuth";
import VideoHeader from "../components/videos/VideoHeader";
import VideoTableHeader from "../components/videos/VideoTableHeader";
import VideoTableRow from "../components/videos/VideoTableRow";
import { updateVideoBot, cancelVideoBotUpload, convertBotVideoToMp4 } from "../api/videoBot";

const VideoBotManagement = () => {
  const { user } = useAuth();
  const ctx = useBotVideosContext();
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

  const headerLoading = loading && (['transc', 'upload', 'cover', 'webapp'].includes(String(loading.type))
    ? { id: loading?.id ?? undefined, type: loading.type as 'transc' | 'upload' | 'cover' | 'webapp' }
    : undefined
  );

  return (
    <div className="flex flex-col gap-2 min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-2 pb-0">
      <VideoHeader
        user={user}
        filters={filters}
        setFilters={setFilters}
        params={{ status: "all", page, ...params }}
        loading={headerLoading}
        onMutate={mutate}
        onWebApp={toWebapp}
        scope="bot"
      />

      {checkObjectContent(filters).hasContent ? (
        <span className="mb-3 text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">* bot videos filters</span>
      ) : null}

      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-gray-800 overflow-hidden">
        {loading?.type === "webapp" && <DeepLoader />}

        <div className="overflow-x-auto pb-[8rem]">
          <table className="min-w-full w-max text-sm md:text-base bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
            <VideoTableHeader />
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300 pb-[8rem] transition-colors duration-300">
              {data?.videos?.map((video: TVideo, index: number) => (
                <VideoTableRow
                  key={video.id}
                  video={video}
                  index={index}
                  onActivate={activate}
                  onSend={send}
                  updateFn={updateVideoBot}
                  hideTouchLink={true}
                  cancelFn={cancelVideoBotUpload}
                  reFetchFn={reFetch}
                  detailsPath="/bot-videos"
                  convertToMp4Fn={convertBotVideoToMp4}
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

export default VideoBotManagement;
