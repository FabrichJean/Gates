import { Check, X, Clock, AlertTriangle, RefreshCw } from "lucide-react";
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
      const Uv = updateFn ? await updateFn(actual?.id, { checking: check }) : await updateVideo(actual?.id, { checking: check });
      setChecking && setChecking(Uv.data.checking);
      isDetails ? reFetch() : null;
      toast.success('Statut mis à jour avec succès');
    } catch (err: any) {
      toast.error("Erreur: " + (err.response?.data?.message || err.message));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked': return <Check className="w-4 h-4 text-emerald-500" />;
      case 'refused': return <X className="w-4 h-4 text-red-500" />;
      case 'waiting for checking': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'checked': return 'checked';
      case 'refused': return 'refused';
      case 'waiting for checking': return 'waiting for checking';
      default: return status;
    }
  };

  return (
    <>
      <div
        tabIndex={-1}
        className="dropdown-content menu bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-gray-900/50 z-50 w-56 p-2"
      >
        {user?.role === "superadmin" && checking !== "null" ? (
          <div className="space-y-1">
            {["checked", "refused"].map((check) => (
              <button
                key={check}
                onClick={() => update(check)}
                className={`
                  flex items-center text-nowrap flex-nowrap justify-between gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium
                  transition-all duration-200 hover:scale-[0.98] active:scale-[0.96]
                  ${check === checking
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(check)}
                  <span>{getStatusLabel(check)}</span>
                </div>
                {check === checking && (
                  <FaCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <>
            {checking === "null" && (
              <button
                onClick={() => update("waiting for checking")}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-[0.98] active:scale-[0.96]"
              >
                <Clock className="w-4 h-4 text-blue-500" />
                <span>ready</span>
              </button>
            )}
            {checking === "refused" && (
              <div className="space-y-3 p-2">
                {!hideTouchLink && (
                  <Link
                    to={`/touch/${isPost ? 'post' : 'video'}/${actual.id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md font-medium transition-all duration-200 hover:scale-[0.98] active:scale-[0.96] shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retoucher
                  </Link>
                )}

                {actual?.comment && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                        <div className="font-medium mb-1">Commentaire de refus :</div>
                        <div className="break-words">{actual.comment}</div>
                      </div>
                    </div>
                  </div>
                )}

                {!hideTouchLink && (
                  <Link
                    to={`/touch/${isPost ? 'post' : 'video'}/${actual.id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retoucher à nouveau
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
