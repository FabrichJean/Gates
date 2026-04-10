import { useState } from "react";
import { toast } from "react-hot-toast";
import { type Domain } from "../api/domains";

interface EditDomainModalProps {
  domain: Domain;
  open: boolean;
  loading: boolean;
  onSave: (domain: Domain) => Promise<void>;
  onClose: () => void;
}

export default function EditDomainModal({
  domain,
  open,
  loading,
  onSave,
  onClose,
}: EditDomainModalProps) {
  const [values, setValues] = useState({
    domain: domain.domain,
    protocol: domain.protocol,
  });

  const handleSave = async () => {
    if (!values.domain || !values.protocol) {
      toast.error("Tous les champs sont requis");
      return;
    }

    try {
      await onSave({
        ...domain,
        domain: values.domain,
        protocol: values.protocol,
      });
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Modifier le domaine
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 transition disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-900 dark:text-white block mb-2">
                Domaine
              </label>
              <input
                type="text"
                value={values.domain}
                onChange={(e) =>
                  setValues({ ...values, domain: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-900 dark:text-white block mb-2">
                Protocole
              </label>
              <select
                value={values.protocol}
                onChange={(e) =>
                  setValues({ ...values, protocol: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                disabled={loading}
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
              </select>
            </div>

            <div className="pt-2">
              <p className="text-xs font-medium text-gray-900 dark:text-white mb-2">
                Statistiques
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <div>URLs: {domain.count}</div>
                {domain.sources.map((source, idx) => (
                  <div key={idx}>
                    {source.model}.{source.column}: {source.recordId}
                  </div>
                ))}
              </div>
            </div>
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
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-3 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded transition disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
