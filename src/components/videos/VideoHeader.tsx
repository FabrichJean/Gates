import { Link } from "react-router-dom";
import { FilePlus, Filter, SendIcon } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import VideoFilters, { type TFilter } from "../VideoFilters";
import SearchModal from "../SearchModal";
import RoleEnum from "../../utils/roleEnum";
import { checkObjectContent } from "../../utils/filter";

interface VideoHeaderProps {
  user: any;
  filters: TFilter;
  setFilters: (filters: TFilter) => void;
  params: any;
  loading: { id: number | undefined; type: "transc" | "upload" | "cover" | "webapp" } | undefined;
  onMutate: (data: any) => void;
  onWebApp: () => void;
}

const VideoHeader = ({
  user,
  filters,
  setFilters,
  params,
  loading,
  onMutate,
  onWebApp,
}: VideoHeaderProps) => {
  const fabControls = useAnimation();

  return (
    <header className="flex flex-wrap justify-start items-center">
      <h1 className="text-3xl font-semibold pb-3 text-gray-500">
        Video Management
      </h1>

      <div className="flex items-center gap-4 justify-between w-full">
        <VideoFilters
          filters={filters}
          setFilters={setFilters}
          params={params}
          onSubmit={onMutate}
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
              onClick={onWebApp}
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
  );
};

export default VideoHeader;