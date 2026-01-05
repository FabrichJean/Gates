import { FiHexagon } from "react-icons/fi";
import type { TRoman } from "../hooks/romans/useRomans";
import type { User } from "../hooks/useVideos";
import CheckerDropRoman from "./CheckerDropRoman";
import { useEffect, useState } from "react";
import RefuseModal from "./RefuseModal";
import { updateRoman } from "../api/romans";
import { FaCheckDouble } from "react-icons/fa6";

interface Props {
  roman: TRoman;
  user: User | Partial<User> | any;
  index: number;
  hideTouchLink?: boolean;
}

function CheckingRoman({
  roman,
  index,
  user,
  hideTouchLink,
}: Props) {
  const [checking, setChecking] = useState<string | null>(roman?.checking || null);

  useEffect(() => {
    setChecking(roman?.checking || null);
  }, [roman?.checking]);

  const [showModal, setShowModal] = useState(false);

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
        tabIndex={roman?.id}
        role="button"
        className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-max p-1 px-2 rounded-md cursor-default m-auto transition-colors duration-300 border border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-800"
      >
        {checking === "checked" ? (
          <FaCheckDouble className="text-green-600 dark:text-green-400" />
        ) : (
          <FiHexagon className="text-gray-500 dark:text-gray-400" />
        )}
        <span className="text-gray-700 dark:text-gray-300">
          {checking === "null" ? "not ready" : checking}
        </span>
      </div>

      {/* Modal dynamique pour refus */}
      {showModal && (
        <RefuseModal
          onClose={closeModal}
          onSubmit={async (comment: string) => {
            try {
              const updatedRoman = await updateRoman(roman?.id, { 
                checking: "refused", 
                comment 
              });
              const next = updatedRoman?.data?.checking ?? null;
              setChecking(next);
            } catch (err: any) {
              // ignore here; toast will surface errors elsewhere
            }
            closeModal();
          }}
        />
      )}

      <CheckerDropRoman
        roman={roman}
        user={user}
        openRefuseModal={openModal}
        checking={checking}
        setChecking={setChecking}
        hideTouchLink={hideTouchLink}
      />
    </div>
  );
}

export default CheckingRoman;
