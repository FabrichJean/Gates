import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { replaceDomain, type ReplacementProgress } from "../api/domains";
import useSocket from "../hooks/useSocket";

interface ReplaceDomainModalProps {
  domain: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReplaceDomainModal({
  domain,
  open,
  onClose,
  onSuccess,
}: ReplaceDomainModalProps) {
  const [newDomain, setNewDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ReplacementProgress | null>(null);
  const [completed, setCompleted] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    if (!open) {
      setNewDomain("");
      setProgress(null);
      setCompleted(false);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!socket) return;

    socket.on("domain:replace:progress", (data: ReplacementProgress) => {
      setProgress(data);

      if (data.status === "completed") {
        setCompleted(true);
        setTimeout(() => {
          setLoading(false);
          toast.success("Remplacement du domaine réussi");
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1000);
        }, 1000);
      }

      if (data.status === "error") {
        setLoading(false);
        toast.error(`Erreur: ${data.message}`);
      }
    });

    return () => {
      socket.off("domain:replace:progress");
    };
  }, [socket, onSuccess, onClose]);

  const handleStart = async () => {
    if (!newDomain) {
      toast.error("Veuillez entrer le nouveau domaine");
      return;
    }

    if (newDomain === domain) {
      toast.error("Le nouveau domaine doit être différent");
      return;
    }

    try {
      setLoading(true);
      setProgress(null);
      setCompleted(false);

      const response = await replaceDomain(domain, newDomain);
      toast.success(response.message);
    } catch (error) {
      setLoading(false);
      toast.error("Erreur lors du démarrage du remplacement");
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => !loading && onClose()}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded max-w-md w-full max-h-96 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Remplacer le domaine
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 transition disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {!loading ? (
              <div className="space-y-3">
                {/* Warning */}
                <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-300">
                    Cette action remplacera toutes les occurrences du domaine dans tous les modèles
                  </div>
                </div>

                {/* Old Domain */}
                <div>
                  <label className="text-xs font-medium text-gray-900 dark:text-white block mb-2">
                    Domaine actuel
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-600 dark:text-gray-300">
                    {domain}
                  </div>
                </div>

                {/* New Domain */}
                <div>
                  <label className="text-xs font-medium text-gray-900 dark:text-white block mb-2">
                    Nouveau domaine
                  </label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="nouveau-domaine.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Progress Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {progress?.message}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {progress?.currentModel}/{progress?.totalModels}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((progress?.currentModel || 0) / (progress?.totalModels || 1)) * 100}%`,
                      }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-gray-900 dark:bg-white"
                    />
                  </div>
                </div>

                {/* Model Progress */}
                {progress?.modelName && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {progress.modelName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {progress.modelProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.modelProgress}%` }}
                        transition={{ duration: 0.2 }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Enregistrements mis à jour:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {progress?.updatedSoFar}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Remplacements effectués:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {progress?.replacementsSoFar}
                    </span>
                  </div>
                </div>

                {/* Completion Message */}
                <AnimatePresence>
                  {completed && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs text-green-800 dark:text-green-300"
                    >
                      Remplacement terminé avec succès
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-800 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-medium rounded transition hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Annuler
            </button>
            {!loading && (
              <button
                onClick={handleStart}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition"
              >
                Remplacer
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
