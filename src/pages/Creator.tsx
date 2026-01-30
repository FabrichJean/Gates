import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import CreatorPost from "./Creator/CreatorPost";
import CreatorVideosCard from "../components/CardVideoCreator";
import CardVideoBotCreator from "../components/videos/cardVideoBotCreator";
import { UseOneCreator } from "../hooks/useCreators";
import CreatorFormModal from "../components/creators/CreatorFormModal";
import ConfirmAlert from "../components/ConfirmAlert";
import { deleteCreator } from "../api/creators";
import toast from "react-hot-toast";
import { cdnS3 } from "../utils/cdn";


const Creatorr = () => {
  const { id } = useParams<{ id: string }>();
  const { data: creator, loading, reFetch } = UseOneCreator(id)
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const closeModal = () => setIsModalOpen(false);
  const openEditModal = () => { setIsModalOpen(true); };


  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {/* ===== CREATOR HEADER ===== */}
      <div className="w-full border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">

        {/* Cover */}
        <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
          <div className="absolute top-2 right-2 flex gap-2">
            <button onClick={openEditModal.bind(null)} className="px-2 py-1 border border-info rounded-sm text-info hover:bg-info/20">
              Edit
            </button>
            <button onClick={() => setConfirmOpen(true)} className="px-2 py-1 border border-error rounded-sm text-error hover:bg-error/20">
              Delete
            </button>
          </div>
        </div>

        {/* Profile */}
        <div className="relative flex items-end gap-4 px-6 pb-4 -mt-12">

          {/* Avatar */}
          <img
            src={
              cdnS3(creator?.avatar) ||
              "https://ui-avatars.com/api/?name=Creator&background=0D9488&color=fff"
            }
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white"
          />

          {/* Infos */}
          <div className="flex-1">
            {loading ? (
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {creator?.name || `Creator #${id}`}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Profil du créateur
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="tabs tabs-border mt-4">

        <input
          type="radio"
          name="my_tabs_2"
          className="tab text-teal-800 dark:text-teal-600"
          aria-label="Videos"
          defaultChecked
        />
        <div className="tab-content border border-gray-200 dark:border-gray-700 p-6 mt-2">
          <CreatorVideosCard creatorId={id!} />
        </div>

        <input
          type="radio"
          name="my_tabs_2"
          className="tab text-teal-800 dark:text-teal-600"
          aria-label="Posts"
        />
        <div className="tab-content border border-gray-200 dark:border-gray-700 p-6 mt-2">
          <CreatorPost id={id} />
        </div>

        <input
          type="radio"
          name="my_tabs_2"
          className="tab text-teal-800 dark:text-teal-600"
          aria-label="Videos bot"
        />
        <div className="tab-content border border-gray-200 dark:border-gray-700 p-6 mt-2">
          <CardVideoBotCreator creatorId={id!} />
        </div>

      </div>
      <CreatorFormModal open={isModalOpen} onClose={closeModal} creator={creator} onSaved={async () => { await reFetch(); }} setParentLoading={setIsLoading} />

          <ConfirmAlert
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={async () => {
              if (!id) return;
              try {
                setIsLoading(true);
                await deleteCreator(Number(id));
                toast.success("Créateur supprimé");
                navigate('/creators');
              } catch (err: any) {
                toast.error(err?.response?.data?.message || err?.message || 'Erreur lors de la suppression');
              } finally {
                setIsLoading(false);
                setConfirmOpen(false);
              }
            }}
          />
    </>
  );
};

export default Creatorr;
