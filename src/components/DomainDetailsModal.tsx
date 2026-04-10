import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Globe, Copy, Check, Search, ExternalLink } from "lucide-react";
import { type Domain } from "../api/domains";

interface DomainDetailsModalProps {
  domain: Domain;
  open: boolean;
  onClose: () => void;
}

export default function DomainDetailsModal({
  domain,
  open,
  onClose,
}: DomainDetailsModalProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sources" | "urls">("sources");
  const [urlSearch, setUrlSearch] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const openUrl = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getProtocolIcon = (protocol: string) => {
    return protocol === "https" ? (
      <Shield className="w-5 h-5 text-emerald-500" />
    ) : (
      <Globe className="w-5 h-5 text-amber-500" />
    );
  };

  // Grouper les sources par model/column
  const groupedSources = domain.sources.reduce(
    (acc, source) => {
      const key = `${source.model}.${source.column}`;
      if (!acc[key]) {
        acc[key] = { ...source, totalOccurrences: 0 };
      }
      acc[key].totalOccurrences += source.recordId || 0;
      return acc;
    },
    {} as Record<string, any>
  );

  // Filtrer les URLs
  const filteredUrls = domain.urls?.filter((url) =>
    url.toLowerCase().includes(urlSearch.toLowerCase())
  ) || [];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  {getProtocolIcon(domain.protocol)}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {domain.domain}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {domain.protocol.toUpperCase()} • {domain.count} URLs
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                <div className="flex gap-0">
                  <button
                    onClick={() => setActiveTab("sources")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                      activeTab === "sources"
                        ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                        : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Sources d'utilisation
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-md font-medium">
                      {domain.sources.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("urls")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                      activeTab === "urls"
                        ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                        : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    URLs configurées
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-md font-medium">
                      {domain.urls?.length || 0}
                    </span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Sources Tab */}
                <AnimatePresence mode="wait">
                  {activeTab === "sources" && (
                    <motion.div
                      key="sources"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      {domain.sources.length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(groupedSources).map(
                            ([key, source], idx) => (
                              <motion.div
                                key={key}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {source.model}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      {source.column}
                                    </p>
                                  </div>
                                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-lg">
                                    {source.totalOccurrences}
                                  </span>
                                </div>
                              </motion.div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Aucune source disponible
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* URLs Tab */}
                <AnimatePresence mode="wait">
                  {activeTab === "urls" && (
                    <motion.div
                      key="urls"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Rechercher une URL..."
                          value={urlSearch}
                          onChange={(e) => setUrlSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600 outline-none transition"
                        />
                      </div>

                      {/* URLs List */}
                      {domain.urls && domain.urls.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {filteredUrls.length > 0 ? (
                            filteredUrls.map((url, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group hover:border-gray-300 dark:hover:border-gray-600 transition"
                              >
                                <button
                                  onClick={() => openUrl(url)}
                                  className="flex items-center gap-2 flex-1 text-left hover:text-gray-900 dark:hover:text-gray-100 transition cursor-pointer hover:underline"
                                  title="Ouvrir le lien"
                                >
                                  <code className="text-xs text-gray-600 dark:text-gray-300 font-mono truncate">
                                    {url}
                                  </code>
                                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition" />
                                </button>
                                <button
                                  onClick={() => copyToClipboard(url)}
                                  className="ml-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition flex-shrink-0"
                                  title="Copier l'URL"
                                >
                                  {copiedUrl === url ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  )}
                                </button>
                              </motion.div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Aucune URL ne correspond à votre recherche
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Aucune URL configurée
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
