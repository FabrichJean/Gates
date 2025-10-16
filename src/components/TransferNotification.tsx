import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Download, ChevronUp, ChevronDown } from "lucide-react";
import { useProgress } from "../hooks/useProgress";

const TransferNotification = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { progressList, clearAll } = useProgress();

  console.log(progressList);
  

  return (
    <>
      {/* Bouton flottant pour ouvrir/fermer */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-all"
        >
          {isOpen ? <ChevronDown /> : <ChevronUp />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 w-80 bg-white shadow-2xl rounded-2xl p-4 z-40 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">
                Transferts en cours
              </h3>
              <button
                onClick={clearAll}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {progressList.length === 0 ? (
                <p className="text-sm text-gray-400 text-center">
                  Aucun transfert
                </p>
              ) : (
                progressList.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 border p-2 rounded-xl"
                  >
                    {t.type === "upload" ? (
                      <Upload size={18} className="text-blue-600" />
                    ) : (
                      <Download size={18} className="text-green-600" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {t.name}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            t.status === "failed"
                              ? "bg-red-500"
                              : t.status === "completed"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${t.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">
                      {t.status === "completed"
                        ? "✓"
                        : `${Math.round(t.progress)}%`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TransferNotification;
