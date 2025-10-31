import { FiHexagon } from "react-icons/fi";
import type { TVideo, User } from "../hooks/useVideos";
import CheckerDrop from "./CheckerDrop";
import { useState } from "react";
import RefuseModal from "./RefuseModal";
import { updateVideo } from "../api/videos";

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
    <div className={"dropdown " + (index === 0 ? " dropdown-end" : "dropdown-top dropdown-end")}>
      <div
        tabIndex={video.id}
        role="button"
        className="flex items-center gap-2 text-xs hover:bg-gray-200 w-max p-1 px-2 rounded-md cursor-default m-auto"
      >
        <FiHexagon /> {video.checking === "null" ? "not ready" : video.checking}
      </div>

      {/* CheckerDrop seulement si la vidéo est vérifiable */}
      {(video.checking === "null" && user.role === "superadmin") ? null : (
        <CheckerDrop
          video={video}
          reFetch={reFetch}
          user={user}
          openRefuseModal={openModal}
        />
      )}

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
