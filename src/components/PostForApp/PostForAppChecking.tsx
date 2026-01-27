import { useState } from "react";

import { FaCheckDouble } from "react-icons/fa6";
import { FiHexagon } from "react-icons/fi";
import RefuseModal from "../RefuseModal";
import CheckerDrop from "../CheckerDrop";
import { useAuth } from "../../hooks/useAuth";
import useUpdatePostForApp from "../../hooks/useUpdatePostForApp";

interface Props {
  postForApp: any;
  index?: number;
  reFetch: () => void;
}

export default function PostForAppChecking({ postForApp, index = 0, reFetch }: Props) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const { updatePostForApp } = useUpdatePostForApp();

  if (!postForApp) return <span className="text-xs text-gray-400">-</span>;

  const actual = postForApp;
  const [checking, setChecking] = useState<string | null>(actual?.checking || null);

  return (
    <div className={"dropdown " + (index === 0 ? " dropdown-end" : "dropdown-top dropdown-end")}>
      <div tabIndex={actual.id} role="button" className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-max p-1 px-2 rounded-md cursor-default m-auto transition-colors duration-300 border border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-800">
        {checking === "refused" ? (
          <FiHexagon className="text-red-500" />
        ) : checking === "verified" ? (
          <FaCheckDouble className="text-green-600 dark:text-green-400" />
        ) : (
          <FiHexagon className="text-gray-500 dark:text-gray-400" />
        )}
        <span className="text-gray-700 dark:text-gray-300">{checking === "null" ? "not ready" : checking}</span>
      </div>

      {/* Refuse modal (if needed) */}
      {showModal && (
          <RefuseModal
          onClose={closeModal}
          onSubmit={async (comment: string) => {
            try {
              const U = await updatePostForApp(actual.id, { checking: "refused", comment });
              const newChecking = U?.data?.checking ?? null;
              setChecking(newChecking);
            } catch (err: any) {
              console.error("Error updating post for app checking status:", err);
            }
            closeModal();
          }}
        />
      )}

      <CheckerDrop
        isPost
        resource={actual as any}
        reFetch={reFetch}
        user={user}
        openRefuseModal={openModal}
        updateFn={updatePostForApp}
        checking={checking}
        setChecking={setChecking}
      />
    </div>
  );
}