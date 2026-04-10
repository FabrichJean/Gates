import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Globe,
  Link,
  Server,
  Shield,
  Edit3,
  ChevronRight,
  LayoutGrid,
  Activity,
  Eye,
} from "lucide-react";
import { useI18n } from "../i18n";
import { getAllDomains, updateDomain, type Domain, type Statistics } from "../api/domains";
import EditDomainModal from "./EditDomainModal";
import DomainDetailsModal from "./DomainDetailsModal";

export default function DomainManagement() {
  const { t } = useI18n();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsDomain, setDetailsDomain] = useState<Domain | null>(null);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const result = await getAllDomains();

      if (result.success) {
        setDomains(result.data.domains || []);
        setStatistics(result.data.statistics || null);
      } else {
        toast.error("Erreur lors du chargement des domaines");
      }
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (domain: Domain) => {
    setSelectedDomain(domain);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setSelectedDomain(null);
  };

  const openDetailsModal = (domain: Domain) => {
    setDetailsDomain(domain);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setDetailsDomain(null);
  };

  const handleSaveDomain = async (updatedDomain: Domain) => {
    try {
      setLoading(true);
      await updateDomain(updatedDomain.domain, updatedDomain);

      setDomains(
        domains.map((d) =>
          d.domain === updatedDomain.domain ? updatedDomain : d
        )
      );
      toast.success("Domaine mise à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const getProtocolIcon = (protocol: string) => {
    switch (protocol) {
      case "https":
        return <Shield className="w-4 h-4 text-emerald-500" />;
      case "http":
        return <Globe className="w-4 h-4 text-amber-500" />;
      default:
        return <Server className="w-4 h-4 text-gray-500" />;
    }
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case "https":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/50";
      case "http":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/50";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  if (loading && domains.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Statistiques */}
        {statistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Link className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  URLs totales
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statistics.totalUrls.toLocaleString()}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <LayoutGrid className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Domaines uniques
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statistics.uniqueDomains.toLocaleString()}
              </p>
            </div>

            {Object.entries(statistics.byProtocol).map(([protocol, count], idx) => (
              <motion.div
                key={protocol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (idx + 1) }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${getProtocolColor(protocol).split(' ')[0] + ' ' + getProtocolColor(protocol).split(' ')[1]}`}>
                    {getProtocolIcon(protocol)}
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {protocol}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {count.toLocaleString()}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Domaines */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              Domaines
              <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-lg font-medium">
                {domains.length}
              </span>
            </h2>
          </div>

          {domains.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Globe className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucun domaine configuré
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              {domains.map((domain, idx) => (
                <motion.div
                  key={domain.domain}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group flex items-start justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-1.5 rounded-md ${getProtocolColor(domain.protocol)}`}>
                        {getProtocolIcon(domain.protocol)}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {domain.domain}
                      </p>
                      <span className={`px-2 py-0.5 text-xs rounded-md font-medium border ${getProtocolColor(domain.protocol)}`}>
                        {domain.protocol.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md font-medium">
                        {domain.count} URLs
                      </span>
                    </div>

                    {/* {domain.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {domain.sources.map((source, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2.5 py-1 rounded-md"
                          >
                            <Activity className="w-3 h-3" />
                            {source.model}.{source.column}
                            <span className="text-gray-400 dark:text-gray-500">
                              ({source.occurrences})
                            </span>
                          </span>
                        ))}
                      </div>
                    )} */}
                  </div>

                  <button
                    onClick={() => openDetailsModal(domain)}
                    disabled={loading}
                    className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50 flex-shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                    Détails
                  </button>

                  <button
                    onClick={() => openEditModal(domain)}
                    disabled={loading}
                    className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50 flex-shrink-0"
                  >
                    <Edit3 className="w-4 h-4" />
                    Modifier
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedDomain && (
        <EditDomainModal
          domain={selectedDomain}
          open={isModalOpen}
          loading={loading}
          onSave={handleSaveDomain}
          onClose={closeEditModal}
        />
      )}

      {detailsDomain && (
        <DomainDetailsModal
          domain={detailsDomain}
          open={isDetailsModalOpen}
          onClose={closeDetailsModal}
        />
      )}
    </>
  );
}