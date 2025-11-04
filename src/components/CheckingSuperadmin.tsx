import { FiHexagon } from "react-icons/fi";
import type { TVideo, User } from "../hooks/useVideos";
import CheckerDrop from "./CheckerDrop";
import { useState } from "react";
import RefuseModal from "./RefuseModal";
import { updateVideo } from "../api/videos";
import { FaCheckDouble } from "react-icons/fa6";

interface Props {
  video: TVideo;
  user: User;
  index: number;
  reFetch: () => void;
}

function CheckingSuperadmin({ video, index, reFetch, user }: Props) {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className={"dropdown " +  (index === 0 ? " dropdown-end" : "dropdown-top dropdown-end")}>
      <div
        tabIndex={video.id}
        role="button"
        className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-max p-1 px-2 rounded-md cursor-default m-auto transition-colors duration-300 border border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-800"
      >
        {video.checking === 'checked' ? 
          <FaCheckDouble className="text-green-600 dark:text-green-400" /> : 
          <FiHexagon className="text-gray-500 dark:text-gray-400" />
        } 
        <span className="text-gray-700 dark:text-gray-300">
          {video.checking === "null" ? "not ready" : video.checking}
        </span>
      </div>

      {/* CheckerDrop seulement si la vidéo est vérifiable */}
      {/* {(video.checking === "null" && user.role === "superadmin") ? null : ( */}
        <CheckerDrop
          video={video}
          reFetch={reFetch}
          user={user}
          openRefuseModal={openModal}
        />
      {/* )} */}

      {/* Modal dynamique pour refus */}
      {showModal && (
        <RefuseModal
          onClose={closeModal}
          onSubmit={async (comment: string) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await updateVideo(video.id, { checking: "refused", comment });
            reFetch();
            closeModal();
          }}
        />
      )}
    </div>
  );
}

export default CheckingSuperadmin;
