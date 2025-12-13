import { Link } from "react-router-dom";
import { FilePlus, Filter } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import VideoFilters, { type TFilter } from "../VideoFilters";
import SearchModal from "../SearchModal";
import RoleEnum from "../../utils/roleEnum";
import { checkObjectContent } from "../../utils/filter";
import UsePlateform from "../../hooks/usePlateform";
import toast from "react-hot-toast";
import { useState } from "react";

interface VideoHeaderProps {
  user: any;
  filters: TFilter;
  setFilters: (filters: TFilter) => void;
  params: any;
  loading: { id: number | undefined; type: "transc" | "upload" | "cover" | "webapp" } | undefined;
  onMutate: (data: any) => void;
  onWebApp: (platformIds?: number[]) => void;
  scope?: "videos" | "bot";
  sent?: number
}

const VideoHeader = ({
  user,
  filters,
  setFilters,
  params,
  onMutate,
  onWebApp,
  scope = "videos",
}: VideoHeaderProps) => {
  const fabControls = useAnimation();
  const { data: plateforms } = UsePlateform();
  const [webappModalOpen, setWebappModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggle = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const sendToWebapp = () => {
    if (selectedIds.length === 0) return toast.error("Select at least one platform");
    onWebApp(selectedIds);
    setWebappModalOpen(false);
    setSelectedIds([]);
  };

  return (
    <header className="flex flex-wrap justify-start items-center">
      <h1 className="text-3xl font-semibold pb-3 text-gray-500 dark:text-gray-400 transition-colors duration-300">
        Video Management
      </h1>

      <div className="flex items-center gap-4 justify-between w-full">
        <VideoFilters
          filters={filters}
          setFilters={setFilters}
          params={params}
          onSubmit={onMutate}
          scope={scope}
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
            className="input input-ghost hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            {checkObjectContent(filters).allEmpty ? null : <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"></div>} <Filter className="w-3 text-gray-600 dark:text-gray-400" /> filters
          </button>

          <SearchModal scope={scope} />

          <button
            onClick={() => {
              const modal = document.getElementById(
                "search_modal_45"
              ) as HTMLDialogElement | null;
              modal?.showModal();
            }}
            className="input input-ghost hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <span className="grow text-left text-gray-600 dark:text-gray-300">Search…</span>
            <kbd className="kbd kbd-sm font-mono opacity-50 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <span className="me-1 text-sm">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* ---- Actions ---- */}
        <div className="flex gap-2">
        {/* <small>(video sent : {sent})</small> */}
          <Link
            to={"/videos/upload"}
            className="hidden md:flex items-center justify-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 font-medium text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition-all"
          >
            <FilePlus className="w-5 h-auto text-blue-400 dark:text-blue-300" />
          </Link>

          {user?.role === RoleEnum.SUPERADMIN && (
            <>
              <dialog className={`modal ${webappModalOpen ? "modal-open" : ""}`}>
                <div className="modal-box max-w-lg">
                  <h3 className="font-bold text-lg">Select WebApp</h3>
                  <div className="max-h-60 overflow-auto mt-3">
                    {plateforms?.map((p: any) => (
                      <label key={p.id} className="flex items-center gap-3 p-2 border-b">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(p.id)}
                          onChange={() => toggle(p.id)}
                          className="checkbox"
                        />
                        <span>{p.name}</span>
                      </label>
                    ))}
                  </div>
                  <div className="modal-action">
                    <button className="btn btn-outline" onClick={() => setWebappModalOpen(false)}>Close</button>
                    <button className="btn btn-primary" onClick={sendToWebapp}>Send</button>
                  </div>
                </div>
              </dialog>
            </>
          )}
        </div>

        {/* ---- FAB mobile ---- */}
        <motion.div
          drag
          dragMomentum={false}
          onDragEnd={() => fabControls.start({ x: 0, y: 0 })}
          className="md:hidden fixed z-40 bottom-5 right-5 flex items-center justify-center p-3 rounded-full border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 shadow-sm dark:shadow-gray-800 hover:bg-blue-50 dark:hover:bg-gray-800 hover:shadow-md transition-all"
        >
          <Link to={"/videos/upload"}>
            <FilePlus className="w-8 h-auto text-blue-400 dark:text-blue-300 animate-pulse" />
          </Link>
        </motion.div>
      </div>
    </header>
  );
};

export default VideoHeader;