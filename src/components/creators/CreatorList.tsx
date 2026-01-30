import { LiaSyncSolid } from "react-icons/lia";
import { Check, X, Trash2, User, Coins, Eye } from "lucide-react";
import { deleteCreator } from "../../api/creators";
import { Link } from "react-router-dom";
import SingleSyncModal from "../SingleSyncModal";
import { useState } from "react";
import { singleSync } from "../../api/videos";
import toast from "react-hot-toast";
import ConfirmAlert from "../ConfirmAlert";
import { motion, AnimatePresence } from "framer-motion";
import { cdnS3 } from "../../utils/cdn";

export interface Creator {
  id: number;
  name: string;
  gender: string | null;
  avatar: string | null;
  description: string | null;
  createdAt: string;
  highestNFTPrice?: string;
  totalSales?: string;
  followers?: number;
  source?: string;
  need_vip?: boolean;
  verified?: boolean;
  isDeleted?: boolean;
  video_count?: number;
  post_count?: number;
}

export default function CreatorList({
  creators,
  onEdit,
  onDelete,
  reFetch,
  isLoading,
}: {
  creators: Creator[];
  onEdit: (c: Creator) => void;
  onDelete: (id: number) => void;
  reFetch?: (delay?: number) => void;
  isLoading?: boolean;
}) {
  const [singleSyncOpen, setSingleSyncOpen] = useState(false);
  const [singleSyncLoading, setSingleSyncLoading] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Creator | null>(null);

  const handleSingleSync = async (isForce: boolean) => {
    if (!selectedCreator) return;
    setSingleSyncLoading(true);
    try {
      await singleSync({
        entity: "creators",
        origin_id: selectedCreator.id,
        isForce,
      });
      toast.success("Sync effectuée");
      reFetch?.(500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur sync");
    } finally {
      setSingleSyncLoading(false);
      setSingleSyncOpen(false);
      setSelectedCreator(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCreator(id);
      reFetch?.(500);
      onDelete?.(id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur suppression");
    }
  };

  if (isLoading)
    return (
      <div className="w-full flex items-center justify-center py-10">
        <div className="w-10 h-10 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!creators?.length)
    return (
      <div className="w-full text-center py-10 text-slate-500 dark:text-slate-400">
        Aucun créateur
      </div>
    );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {creators.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative bg-white/5 dark:bg-black/20 rounded-2xl p-4 flex flex-col gap-3
                         border border-white/10 dark:border-white/5
                         backdrop-blur-md shadow-lg shadow-black/20
                         hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              {/* Avatar + verif */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20">
                  <img
                    src={cdnS3(c.avatar) ?? ""}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/creators/${c.id}`}
                    className="text-sm font-semibold text-gray-900 dark:text-white truncate block hover:text-sky-400 transition"
                  >
                    {c.name}
                    {c.verified && (
                      <Check className="inline-block w-3 h-3 ml-1.5 text-sky-400" />
                    )}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {c.gender ?? "-"}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-800/20 dark:bg-slate-900/30 rounded-lg p-2">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {c.followers ?? 0}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">Followers</div>
                </div>
                <div className="bg-slate-800/20 dark:bg-slate-900/30 rounded-lg p-2">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {c.video_count ?? 0}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">Videos</div>
                </div>
                <div className="bg-slate-800/20 dark:bg-slate-900/30 rounded-lg p-2">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {c.post_count ?? 0}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">Posts</div>
                </div>
              </div>

              {/* Source */}
              <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                Source : <span className="font-medium">{c.source ?? "–"}</span>
              </div>

              {/* NFT / Sales */}
              {(c.highestNFTPrice || c.totalSales) && (
                <div className="flex items-center gap-2 text-xs">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    {c.highestNFTPrice || c.totalSales}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-2">
                <button
                  onClick={() => {
                    setSelectedCreator(c);
                    setSingleSyncOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
                             bg-sky-500/10 hover:bg-sky-500/20 text-sky-400
                             border border-sky-500/20 hover:border-sky-500/30
                             transition text-xs font-medium"
                  aria-label="Sync"
                >
                  <LiaSyncSolid className="w-4 h-4" />
                  Sync
                </button>
                <button
                  onClick={() => setConfirmTarget(c)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
                             bg-rose-500/10 hover:bg-rose-500/20 text-rose-400
                             border border-rose-500/20 hover:border-rose-500/30
                             transition text-xs font-medium"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modales */}
      <SingleSyncModal
        open={singleSyncOpen}
        onClose={() => {
          setSingleSyncOpen(false);
          setSelectedCreator(null);
        }}
        onSubmit={handleSingleSync}
        title={selectedCreator ? `Sync ${selectedCreator.name}` : "Sync"}
      />

      <ConfirmAlert
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && handleDelete(confirmTarget.id)}
      />
    </div>
  );
}