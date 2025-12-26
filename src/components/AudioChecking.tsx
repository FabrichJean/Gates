import { useState } from "react";
import { FaCheckDouble } from "react-icons/fa6";
import { FiHexagon } from "react-icons/fi";
import RefuseModal from "./RefuseModal";
import AudioCheckerDrop from "./AudioCheckerDrop";
import { useAuth } from "../hooks/useAuth";
import { updateAudio } from "../api/audios";

interface Props {
  audio: any;
  index?: number;
  reFetch: () => void;
}

export default function AudioChecking({ audio, index = 0, reFetch }: Props) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const updateAudioFn = async (id: number, payload: any) => {
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      formData.append(key, payload[key]);
    });
    return await updateAudio(id, formData);
  };

  if (!audio) return <span className="text-xs text-gray-400">-</span>;

  const [checking, setChecking] = useState<string | null>(audio?.checking || null);

  return (
    <div className={"dropdown " + (index === 0 ? " dropdown-end" : "dropdown-top dropdown-end")}> 
      <div tabIndex={audio.id} role="button" className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-max p-1 px-2 rounded-md cursor-default m-auto transition-colors duration-300 border border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-800">
        {checking === "refused" ? (
          <FiHexagon className="text-red-500" />
        ) : checking === "verified" || checking === "checked" ? (
          <FaCheckDouble className="text-green-600 dark:text-green-400" />
        ) : (
          <FiHexagon className="text-gray-500 dark:text-gray-400" />
        )}
        <span className="text-gray-700 dark:text-gray-300">
          {checking === "null" ? "not ready" : checking || "pending"}
        </span>
      </div>

      {/* Refuse modal */}
      {showModal && (
        <RefuseModal
          onClose={closeModal}
          onSubmit={async (comment: string) => {
            try {
              const U = await updateAudioFn(audio.id, { checking: "refused", comment });
              const newChecking = U?.checking ?? null;
              setChecking(newChecking);
              reFetch();
            } catch (err: any) {
              console.error("Error updating audio checking status:", err);
            }
            closeModal();
          }}
        />
      )}

      <AudioCheckerDrop
        audio={audio}
        reFetch={reFetch}
        user={user}
        openRefuseModal={openModal}
        updateFn={updateAudioFn}
        checking={checking}
        setChecking={setChecking}
      />
    </div>
  );
}
