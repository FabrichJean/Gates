import { FiHexagon } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import type { TRoman } from "../hooks/romans/useRomans";
import type { User } from "../hooks/useVideos";
import { updateRoman } from "../api/romans";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

interface Props {
  user: User | Partial<User> | any;
  roman: TRoman;
  checking?: string | null;
  setChecking?: (check: string | null) => void;
  openRefuseModal: () => void;
  hideTouchLink?: boolean;
}

function CheckerDropRoman({ 
  roman, 
  user, 
  checking, 
  setChecking, 
  openRefuseModal, 
  hideTouchLink = false
}: Props) {
  const update = async (check: string) => {
    if (check === "refused") {
      openRefuseModal();
      return;
    }

    try {
      const updatedRoman = await updateRoman(roman?.id, { checking: check });
      setChecking && setChecking(updatedRoman.data.checking);
    } catch (err: any) {
      toast.error("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <>
      <div
        tabIndex={-1}
        className="dropdown-content menu bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md z-100 w-52 p-2 shadow-sm dark:shadow-gray-700 transition-colors duration-300"
      >
        {user?.role === "superadmin" && checking !== "null" ? (
          ["refused", "checked"]?.map((check) => (
            <div
              key={check}
              onClick={() => update(check === "go ready" ? "null" : check)}
              tabIndex={roman?.id}
              role="button"
              className="flex items-center justify-between gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-full p-2 rounded-md cursor-default m-auto transition-colors duration-300"
            >
              <span className="flex items-center gap-2">
                <FiHexagon className="text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{check}</span>
              </span>
              {(check === "go ready" ? "null" : check) === checking ? (
                <FaCheck className="text-green-600 dark:text-green-400" />
              ) : null}
            </div>
          ))
        ) : (
          <>
            {checking === "null" && (
              <div
                onClick={() => update("waiting for checking")}
                tabIndex={roman?.id}
                role="button"
                className="flex items-center justify-between gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-full p-2 rounded-md cursor-default m-auto transition-colors duration-300"
              >
                <span className="flex items-center gap-2">
                  <FiHexagon className="text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">ready</span>
                </span>
              </div>
            )}
            {checking === "refused" && (
              <div className="flex flex-col items-center justify-between gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-full p-2 rounded-md cursor-default m-auto transition-colors duration-300 overflow-auto">
                {!hideTouchLink && (
                  <Link
                    to={`/touch/roman/${roman.id}`}
                    className="btn bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 border-none w-full transition-colors duration-300"
                  >
                    Touch again
                  </Link>
                )}

                <p className="text-gray-600 dark:text-gray-400 text-center px-2 text-wrap break-words overflow-auto max-h-32">
                  {roman?.comment}
                </p>

                {!hideTouchLink && (
                  <Link
                    to={`/touch/roman/${roman.id}`}
                    className="text-blue-500 font-bold text-underline w-full transition-colors duration-300"
                  >
                    Touch again
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default CheckerDropRoman;
