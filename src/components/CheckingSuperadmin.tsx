import { FiHexagon } from "react-icons/fi";
import type { TVideo, User } from "../hooks/useVideos";
import CheckerDrop from "./CheckerDrop";
import { useState } from "react";
import RefuseModal from "./RefuseModal";
import { updateVideo } from "../api/videos";
import { FaCheckDouble } from "react-icons/fa6";

interface Props {
  // legacy: video prop
  video?: TVideo;
  // generic resource (video or post)
  resource?: any;
  // optional override to perform updates e.g. updatePost
  updateFn?: (id: number | string | undefined, payload: any) => Promise<any>;
  user: User | Partial<User> | any;
  index: number;
  reFetch: () => void;
}

function CheckingSuperadmin({
  video,
  resource,
  index,
  reFetch,
  user,
  updateFn,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  const actual = resource ?? video;

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div
      className={
        "dropdown " +
        (index === 0 ? " dropdown-end" : "dropdown-top dropdown-end")
      }
    >
      <div
        tabIndex={actual?.id}
        role="button"
        className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-max p-1 px-2 rounded-md cursor-default m-auto transition-colors duration-300 border border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-800"
      >
        {actual?.checking === "checked" ? (
          <FaCheckDouble className="text-green-600 dark:text-green-400" />
        ) : (
          <FiHexagon className="text-gray-500 dark:text-gray-400" />
        )}
        <span className="text-gray-700 dark:text-gray-300">
          {actual?.checking === "null" ? "not ready" : actual?.checking}
        </span>
      </div>

      {/* Modal dynamique pour refus */}
      {showModal && (
        <RefuseModal
          onClose={closeModal}
          onSubmit={async (comment: string) => {
            try {
              if (updateFn) {
                await updateFn(actual?.id, { checking: "refused", comment });
              } else {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                await updateVideo(actual?.id, { checking: "refused", comment });
              }
              reFetch();
            } catch (err: any) {
              // ignore here; toast will surface errors elsewhere
            }
            closeModal();
          }}
        />
      )}

      {/* CheckerDrop seulement si la vidéo est vérifiable */}
      {/* {(video.checking === "null" && user.role === "superadmin") ? null : ( */}
      <CheckerDrop
        resource={actual}
        reFetch={reFetch}
        user={user}
        openRefuseModal={openModal}
        updateFn={updateFn}
      />
      {/* )} */}
    </div>
  );
}

export default CheckingSuperadmin;
