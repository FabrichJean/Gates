import { useState } from "react";
import { FaCheckDouble } from "react-icons/fa6";
import { FiHexagon } from "react-icons/fi";

interface Props {
  audio: any;
  reFetch: () => void;
  user: any;
  openRefuseModal: () => void;
  updateFn: (id: number, payload: any) => Promise<any>;
  checking: string | null;
  setChecking: (c: string | null) => void;
}

export default function AudioCheckerDrop({ audio, reFetch, user, openRefuseModal, updateFn, checking, setChecking }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const U = await updateFn(audio.id, { checking: "checked" });
      const newChecking = U?.data?.checking ?? U?.checking ?? "checked";
      setChecking(newChecking);
      reFetch();
    } catch (err) {
      console.error("Error verifying audio:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePending = async () => {
    setLoading(true);
    try {
      const U = await updateFn(audio.id, { checking: "waiting for checking" });
      const newChecking = U?.data?.checking ?? U?.checking ?? "waiting for checking";
      setChecking(newChecking);
      reFetch();
    } catch (err) {
      console.error("Error setting audio to pending:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dropdown-content bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow p-2 mt-1 min-w-[160px]">
      {checking !== "checked" && (
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded text-xs text-nowrap"
          onClick={handleCheck}
          disabled={loading}
        >
          <FaCheckDouble className="w-4 h-4" /> checked
        </button>
      )}
      {checking !== "refused" && (
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-xs text-nowrap"
          onClick={openRefuseModal}
          disabled={loading}
        >
          <FiHexagon className="w-4 h-4" /> Refused
        </button>
      )}
      {checking !== "waiting for checking" && (
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/30 rounded text-xs text-nowrap"
          onClick={handlePending}
          disabled={loading}
        >
          <FiHexagon className="w-4 h-4" /> waiting for checking
        </button>
      )}
    </div>
  );
}
