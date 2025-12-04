import { FiHexagon } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import type { TVideo, User } from "../hooks/useVideos";
import { updateVideo } from "../api/videos";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

interface Props {
  user: User | Partial<User> | any;
  video?: TVideo | any;
  resource?: any;
  checking?: string | null;
  setChecking?: (check: string | null) => void;
  reFetch: () => void;
  openRefuseModal: () => void;
  updateFn?: (id: number | string | undefined, payload: any) => Promise<any>;
  isVideo?: boolean;
  isPost?: boolean;
  hideTouchLink?: boolean;
  isDetails?: boolean;
}

function CheckerDrop({ video, resource, user, checking, setChecking, openRefuseModal, updateFn, isPost = false, hideTouchLink = false, isDetails = false, reFetch }: Props) {
  const actual = resource ?? video;

  const update = async (check: string) => {
    if (check === "refused") {
      openRefuseModal();
      return;
    }

    try {
      if (updateFn) {
        const Uv = await updateFn(actual?.id, { checking: check });
        setChecking && setChecking(Uv.data.checking);
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const Uv = await updateVideo(actual?.id, { checking: check });
        setChecking && setChecking(Uv.data.checking);
        isDetails ? reFetch() : null;
      }
      
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
              tabIndex={actual?.id}
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
                tabIndex={actual?.id}
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
                    to={`/touch/${isPost ? 'post' : 'video'}/${actual.id}`}
                    className="btn bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 border-none w-full transition-colors duration-300"
                  >
                    Touch again
                  </Link>
                )}

                <p className="text-gray-600 dark:text-gray-400 text-center px-2 text-wrap break-words overflow-auto max-h-32">
                  {actual?.comment}
                </p>

                {!hideTouchLink && (
                  <Link
                    to={`/touch/${isPost ? 'post' : 'video'}/${actual.id}`}
                    className=" text-blue-500 font-bold text-underline w-full transition-colors duration-300"
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

export default CheckerDrop;
