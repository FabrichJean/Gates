import { MdOutlineVerifiedUser, MdDelete } from "react-icons/md";
import { deleteCreator } from "../../api/creators";
import { Link } from "react-router-dom";
import SingleSyncModal from "../SingleSyncModal";
import { useState } from "react";
import { singleSync } from "../../api/videos";
import toast from "react-hot-toast";
import { LiaSyncSolid } from "react-icons/lia";
import ConfirmAlert from "../ConfirmAlert";


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
  video_bot_count?: number;
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

  const extractErrorMessage = (err: unknown) => {
    try {
      if (!err) return "Error";
      if (typeof err === "string") return err;
      if (typeof err === "object" && err !== null) {
        return (
          (err as any)?.response?.data?.message ??
          (err as any)?.message ??
          "Error"
        );
      }
      return String(err);
    } catch {
      return "Error";
    }
  };

  const handleSingleSync = async (isForce: boolean) => {
    if (!selectedCreator) return;
    setSingleSyncLoading(true);
    try {
      await singleSync({ entity: "creator", origin_id: selectedCreator.id, isForce });
      toast.success("✅ Sync single exécuté");
      reFetch?.(500);
    } catch (err) {
      toast.error(extractErrorMessage(err) || "❌ Erreur sync single !");
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
    } catch (err) {
      toast.error(extractErrorMessage(err) || "❌ Erreur suppression !");
    }
  };



  // Répartir les créateurs en 3 lignes
  let rows = [[], [], []] as Creator[][];

  if (creators.length > 15) {
    creators.forEach((creator, index) => {
      rows[index % 3].push(creator);
    });
  } else {
    rows = [creators]
  }


  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-10">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col gap-2 items-center w-full overflow-x-auto overflow-y-visible pb-10">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-col md:flex-row gap-2 w-full">
            {row.map((creator) => (
              <div
                key={creator.id}
                className="w-full md:w-max min-h-[8rem] bg-white dark:bg-slate-700 rounded-lg p-4 flex flex-col items-start transition-all hover:shadow-lg  border border-gray-200 dark:border-gray-500"
                style={{ backdropFilter: "blur(6px)" }}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                    <img
                      src={creator.avatar ?? ""}
                      alt={creator.name}
                      className="min-w-full h-auto object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <Link to={`/creators/${creator.id}`} className="text-sm text-nowrap font-semibold text-gray-700 hover:text-blue-400 dark:text-white hover:underline">
                      {creator.name}
                      {creator.verified && <MdOutlineVerifiedUser size={14} className="inline ml-2 text-blue-500" />}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-nowrap">
                      {creator.gender ?? null}
                    </p>
                  </div>
                  
                  {/* btn single sync */}
                  <button
                    type="button"
                    title="Synchroniser"
                    onClick={() => { setSelectedCreator(creator); setSingleSyncOpen(true); }}
                    className="inline-flex cursor-pointer items-center gap-2 px-2 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 text-sm font-medium transition-all duration-200"
                  >
                    <LiaSyncSolid className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col w-full mt-2 gap-2 items-start">
                  <p className="text-sm font-bold text-gray-400 dark:text-gray-300 text-nowrap">
                    Source : <span className="font-medium">{creator.source ?? '...'}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-nowrap">
                    Followers: <span className="font-medium">{creator.followers ?? '...'}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-nowrap">
                    Videos: <span className="font-medium">{creator.video_count ?? ''}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-nowrap">
                    Posts: <span className="font-medium">{creator.post_count ?? ''}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-nowrap">
                    Verified: {creator.verified ? (
                      <span className="text-green-600 font-medium">Yes</span>) : (
                      <span className="text-orange-400 font-medium">Pending </span>
                    )}
                  </p>
                  {/* btn suprimer */}
                  <button
                    type="button"
                    title="Delete"
                    onClick={() => setConfirmTarget(creator)}
                    className="inline-flex cursor-pointer items-center gap-2 px-2 py-2 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-500 text-sm font-medium transition-all duration-200"
                  >
                    <MdDelete className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 text-sm text-gray-700">
                  {creator.highestNFTPrice && (
                    <p>
                      Highest NFT Price:{" "}
                      <span className="font-semibold text-green-600">
                        {creator.highestNFTPrice}
                      </span>
                    </p>
                  )}
                  {creator.totalSales && (
                    <p>
                      Total Sale Proceeds:{" "}
                      <span className="font-semibold text-purple-600">
                        {creator.totalSales}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <SingleSyncModal
        open={singleSyncOpen}
        onClose={() => { setSingleSyncOpen(false); setSelectedCreator(null); }}
        onSubmit={handleSingleSync}
        title={selectedCreator ? `Synchroniser ${selectedCreator.name}` : "Synchroniser"}
      />

      <ConfirmAlert
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={async () => {
          if (!confirmTarget) return;
          await handleDelete(confirmTarget.id);
        }}
      />
    </div>
  );
}
