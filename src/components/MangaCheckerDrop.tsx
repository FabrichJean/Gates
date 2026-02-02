import { FiHexagon } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

interface Props {
  user: any;
  manga: any;
  checking?: string | null;
  setChecking?: (check: string | null) => void;
  reFetch: () => void;
  openRefuseModal: () => void;
  updateFn?: (id: number, payload: any) => Promise<any>;
  hideTouchLink?: boolean;
  isDetails?: boolean;
}

function MangaCheckerDrop({ 
  manga, 
  user, 
  checking, 
  setChecking, 
  openRefuseModal, 
  updateFn, 
  hideTouchLink = false, 
  isDetails = false, 
  reFetch 
}: Props) {
  const update = async (check: string) => {
    if (check === "refused") {
      openRefuseModal();
      return;
    }

    try {
      if (!updateFn) return;
      const result = await updateFn(manga?.id, { checking: check });
      setChecking && setChecking(result.data?.checking || check);
      if (isDetails) {
        reFetch();
      }
      toast.success(`状态更新: ${check}`);
    } catch (err: any) {
      toast.error("Erreur: " + (err.response?.data?.message || err.message));
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
              tabIndex={manga?.id}
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
                tabIndex={manga?.id}
                role="button"
                className="flex items-center justify-between gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-full p-2 rounded-md cursor-default m-auto transition-colors duration-300"
              >
                <span className="flex items-center gap-2">
                  <FiHexagon className="text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">准备好</span>
                </span>
              </div>
            )}
            {checking === "refused" && (
              <div className="flex flex-col items-center justify-between gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-full p-2 rounded-md cursor-default m-auto transition-colors duration-300 overflow-auto">
                {!hideTouchLink && (
                  <Link
                    to={`/mangas/${manga.id}/edit`}
                    className="btn bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 border-none w-full transition-colors duration-300"
                  >
                    再次编辑
                  </Link>
                )}

                <p className="text-gray-600 dark:text-gray-400 text-center px-2 text-wrap break-words overflow-auto max-h-32">
                  {manga?.comment || "Aucun commentaire"}
                </p>

                {!hideTouchLink && (
                  <Link
                    to={`/mangas/${manga.id}/edit`}
                    className="text-blue-500 font-bold text-underline w-full transition-colors duration-300"
                  >
                    再次编辑
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

export default MangaCheckerDrop;
