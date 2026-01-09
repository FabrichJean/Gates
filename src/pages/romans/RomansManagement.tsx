import { useMemo, useState } from "react";
import {
  Eye,
  Edit2,
  Grid,
  List,
  Send,
  BookOpen,
  Tag,
  Globe,
  Loader2,
  FilePlus,
  Check,
} from "lucide-react";
import { GrChapterAdd } from "react-icons/gr";
import UseRomans, { type TRoman } from "../../hooks/romans/useRomans";
import { Link } from "react-router-dom";
import CheckingRoman from "../../components/CheckingRoman";
import { useAuth } from "../../hooks/useAuth";
import useSocketCheckRomans from "../../hooks/romans/useSocketRomans";
import toast from "react-hot-toast";
import { toggleIsDeleted, deepUploadRoman } from "../../api/romans";
import { singleSync } from "../../api/videos";
import SingleSyncModal from "../../components/SingleSyncModal";
import RoleEnum from "../../utils/roleEnum";

import { motion } from "framer-motion";
import { LiaSyncSolid } from "react-icons/lia";

const RomansManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [page] = useState(1);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const { user } = useAuth();
  const [selectedRoman, setSelectedRoman] = useState<TRoman | null>(null);
  const [singleSyncOpen, setSingleSyncOpen] = useState(false);
  const [singleSyncLoading, setSingleSyncLoading] = useState(false);

  /* ===================== API ===================== */
  const { data, loading, reFetch } = UseRomans("all", page, searchTerm);
  const romans = data?.romans || [];

  /* ===================== SOCKET CHECKING ===================== */
  useSocketCheckRomans((data) => {
    if (data.user_id !== user?.id) {
      setTimeout(() => reFetch(), 500);
    }
  });

  /* ===================== STATUS ===================== */
  const mapStatus = (roman: TRoman) => {
    if (roman.isDeleted) return "deleted";
    if (roman.checking === "waiting for checking") return "pending";
    if (roman.checking === "refused") return "refused";
    if (roman.processing === "done") return "published";
    return "draft";
  };

  /* ===================== FILTER ===================== */
  const filteredRomans = useMemo(() => {
    return romans.filter((roman) => {
      const status = mapStatus(roman);
      const matchesSearch =
        roman.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (roman.creator || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (roman.plateform?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" || status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [romans, searchTerm, selectedStatus]);

  /* ===================== LOADING ===================== */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  /* ===================== STATS ===================== */
  const stats = {
    total: romans.length,
    published: romans.filter((r) => mapStatus(r) === "published").length,
    pending: romans.filter((r) => mapStatus(r) === "pending").length,
    deleted: romans.filter((r) => r.isDeleted).length,
  };

  /* ===================== UTILS ===================== */
  const truncateText = (text: string, maxLength: number = 25) => {
    if (!text) return "-";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refused":
        return "bg-red-100 text-red-800";
      case "deleted":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Fonction pour mettre à jour le statut isDeleted
  const handleToggleDeleted = async (
    romanId: number,
    currentStatus: boolean
  ) => {
    try {
      await toggleIsDeleted(romanId, !currentStatus);
      toast.success(
        currentStatus
          ? "Roman activé avec succès"
          : "Roman désactivé avec succès"
      );
      reFetch();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  // Gestion processing et bouton Send
  const handleSendRoman = async (romanId: number) => {
    try {
      toast.loading("Envoi du roman vers S3...", { id: "send-roman" });
      await deepUploadRoman(romanId);
      toast.success("Roman envoyé avec succès!", { id: "send-roman" });
      reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'envoi S3", {
        id: "send-roman",
      });
    }
  };

  const extractErrorMessage = (err: unknown) => {
    try {
      if (!err) return "Error";
      if (typeof err === "string") return err;
      if (typeof err === "object" && err !== null) {
        return (
          (err as any)?.response?.data?.message ??
          (err as any)?.message ??
          "Error"
        );
      }
      return String(err);
    } catch {
      return "Error";
    }
  };

  const handleSingleSync = async (isForce: boolean) => {
    if (!selectedRoman) return;
    setSingleSyncLoading(true);
    try {
      await singleSync({
        entity: "romans",
        origin_id: selectedRoman.id,
        isForce,
      });
      toast.success("✅ Sync single exécuté");
      reFetch?.();
    } catch (err) {
      toast.error(extractErrorMessage(err) || "❌ Erreur sync single !");
    } finally {
      setSingleSyncLoading(false);
      setSingleSyncOpen(false);
      setSelectedRoman(null);
    }
  };

  /* ===================== RENDER CARD ===================== */
  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredRomans.map((roman) => (
        <div
          key={roman.id}
          className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          {/* Cover Image */}
          <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400">
            {roman.public_urls?.cover_url ? (
              <img
                src={roman.s3_urls.coverUrl || roman.public_urls.cover_url}
                alt={roman.ref}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white/50" />
              </div>
            )}
            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
              {/* Processing Status Badge */}
              {roman.processing && (
                <span
                  className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                    roman.processing === "done"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {roman.processing === "done" ? (
                    "✓ Uploaded"
                  ) : roman.processing === "working" ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Uploading</span>
                    </span>
                  ) : (
                    "Pending"
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="p-5">
            {/* Title */}
            <h3
              className="font-bold text-lg text-gray-900 dark:text-white mb-2"
              title={roman.titles[0]?.title || roman.ref}
            >
              {truncateText(roman.titles[0]?.title || roman.ref, 30)}
            </h3>

            {/* Creator Info */}
            <div className="flex items-center gap-3 mb-4">
              {roman.creatorObj?.avatar ? (
                <img
                  src={roman.creatorObj.avatar}
                  alt={roman.creatorObj.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {roman.creatorObj?.name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <div>
                <Link
                  to={`/creators/${roman.creatorObj?.id}`}
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-500"
                >
                  {roman.creatorObj?.name || "-"}
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {roman.creatorObj?.gender || "Unknown"}
                </p>
              </div>
            </div>

            {/* Category & Platform */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Tag className="w-4 h-4" />
                <span>{roman.category?.name || "-"}</span>
                {roman.subCategory?.name && (
                  <span className="text-xs text-gray-500">
                    • {roman.subCategory.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Globe className="w-4 h-4" />
                <span>{roman.plateform?.name || "-"}</span>
              </div>
            </div>
            <div className=" border-t pt-2 border-gray-200 dark:border-gray-700">
              <CheckingRoman
                roman={roman}
                user={user}
                index={filteredRomans.indexOf(roman)}
              />
            </div>
            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Link
                  to={`/romans/${roman.id}`}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-700  rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  to={`/romans/${roman.id}/edit`}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>

                {user.role === RoleEnum.SUPERADMIN && (
                  <>
                    <button
                      type="button"
                      title="Synchroniser"
                      onClick={() => {
                        setSelectedRoman(roman);
                        setSingleSyncOpen(true);
                      }}
                      className="p-2 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-teal-500 hover:dark:bg-slate-600 hover:bg-slate-200"
                    >
                      <LiaSyncSolid className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-2 cursor-pointer rounded-lg transition-colors ${
                        roman.processing === "done"
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                          : "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:text-teal-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => handleSendRoman(roman.id)}
                      disabled={
                        roman.processing === "done" ||
                        roman.processing === "working"
                      }
                      title={
                        roman.processing === "done"
                          ? "Déjà envoyé"
                          : "Envoyer la couverture sur S3"
                      }
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  /* ===================== RENDER TABLE ===================== */
  const renderTableView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cover
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Creator
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Activate
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Checking
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRomans.map((roman) => (
              <tr
                key={roman.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  {roman.public_urls?.cover_url ? (
                    <img
                      src={
                        roman.s3_urls.coverUrl || roman.public_urls?.cover_url
                      }
                      alt={roman.ref}
                      className="w-12 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p
                      className="font-medium text-gray-900 dark:text-white text-nowrap"
                      title={roman.ref}
                    >
                      {truncateText(roman.titles[0]?.title || roman.ref, 20)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {roman.id}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {roman.creatorObj?.avatar ? (
                      <img
                        src={roman.creatorObj.avatar}
                        alt={roman.creatorObj.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {roman.creatorObj?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      <Link
                        to={`/creators/${roman.creatorObj?.id}`}
                        className="hover:text-blue-500"
                      >
                        {roman.creatorObj?.name || "-"}
                      </Link>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-900 text-nowrap dark:text-gray-100">
                      {roman.category?.name || "-"}
                    </span>
                    {roman.subCategory?.name && (
                      <span className="text-xs text-gray-500 text-nowrap dark:text-gray-400">
                        {roman.subCategory.name}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                  {roman.plateform?.name || "-"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {/* Processing Status Badge */}
                    {roman.processing && (
                      <span
                        className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                          roman.processing === "done"
                            ? "bg-green-100/60 dark:bg-green-200/60 text-green-800 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {roman.processing === "done" ? (
                          <span className="flex items-center gap-2">
                            {" "}
                            <Check className="h-4 w-4" /> uploaded{" "}
                          </span>
                        ) : roman.processing === "working" ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Uploading</span>
                          </span>
                        ) : (
                          "Pending"
                        )}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <motion.input
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="checkbox"
                    checked={!roman.isDeleted}
                    disabled={user?.role !== RoleEnum.SUPERADMIN}
                    className="toggle bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 checked:bg-blue-300 dark:checked:bg-blue-500 checked:border-gray-300 dark:checked:border-gray-700 transition-colors duration-300 w-[2.5rem] h-[1.5rem] scale-[0.7] rounded-full"
                    onChange={
                      user?.role === RoleEnum.SUPERADMIN
                        ? () =>
                            handleToggleDeleted(
                              roman.id,
                              roman.isDeleted || false
                            )
                        : undefined
                    }
                    title={
                      user?.role === RoleEnum.SUPERADMIN
                        ? roman.isDeleted
                          ? "Activer"
                          : "Désactiver"
                        : "Requiert rôle SUPERADMIN"
                    }
                  />
                </td>
                <td className="px-6 py-4">
                  <CheckingRoman
                    roman={roman}
                    user={user}
                    index={romans.indexOf(roman)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/romans/${roman.id}`}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-700  rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/romans/${roman.id}/edit`}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-700  rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    {user.role === RoleEnum.SUPERADMIN && (
                      <>
                        <button
                          type="button"
                          title="Synchroniser"
                          onClick={() => {
                            setSelectedRoman(roman);
                            setSingleSyncOpen(true);
                          }}
                          className="p-2 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-teal-500 hover:dark:bg-slate-600 hover:bg-slate-200"
                        >
                          <LiaSyncSolid className="w-4 h-4" />
                        </button>

                        <button
                          className={`p-2 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 cursor-pointer ${
                            roman.processing === "done"
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                              : "text-gray-600 dark:text-gray-300 hover:text-teal-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                          onClick={() => handleSendRoman(roman.id)}
                          disabled={roman.processing === "done"}
                          title={
                            roman.processing === "done"
                              ? "Déjà envoyé"
                              : roman.checking !== "checked"
                              ? "Roman must be checked first"
                              : "Envoyer"
                          }
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRomans.length === 0 && (
        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium mb-2">No novels found</p>
          <p className="text-sm">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );

  /* ===================== RENDER ===================== */
  return (
    <div className="min-h-screen bg-transparent p-6 rounded-sm">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-gray-700 dark:text-gray-100">
            Romans Management
          </h1>
          {/* bouton bascule vers `romans/upload` */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Link
              to="/romans/upload"
              className="px-2 py-2 border border-blue-400 text-gray-700 rounded-md hover:border-blue-700 transition-colors text-center whitespace-nowrap text-sm sm:text-base"
            >
              <FilePlus className="w-5 h-auto text-blue-400 dark:text-blue-300" />
            </Link>
            <Link
              to="/romans/chapters"
              className="px-4 py-2 border border-teal-500 text-teal-500 dark:text-teal-600 rounded-sm shadow-sm hover:border-teal-400 hover:dark:border-teal-400 transition-colors text-center whitespace-nowrap text-sm sm:text-base"
            >
              <GrChapterAdd className="w-4 h-4 inline-block mr-2" />
              Manage Chapters
            </Link>
          </div>
        </div>

        {/* Stats Cards (reduced size) */}

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/*  */}
            <div className="flex items-center gap-4 w-full lg:w-auto"> </div>
            {/* View Toggle */}
            <div className="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-800 p-1 ml-auto">
              <button
                onClick={() => setViewMode("card")}
                aria-pressed={viewMode === "card"}
                title="Card view"
                className={`p-2 rounded-md ${
                  viewMode === "card"
                    ? "bg-white dark:bg-gray-700 shadow"
                    : "hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                <Grid className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                title="Table view"
                className={`p-2 rounded-md ${
                  viewMode === "table"
                    ? "bg-white dark:bg-gray-700 shadow"
                    : "hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                <List className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === "card" ? renderCardView() : renderTableView()}

        {viewMode === "card" && filteredRomans.length === 0 && (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-xl font-medium mb-2">No novels found</p>
            <p className="text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
        <SingleSyncModal
          open={singleSyncOpen}
          onClose={() => {
            setSingleSyncOpen(false);
            setSelectedRoman(null);
          }}
          onSubmit={handleSingleSync}
          title={
            selectedRoman
              ? `Synchroniser ${
                  selectedRoman.titles?.[0]?.title || selectedRoman.ref
                }`
              : "Synchroniser"
          }
        />
      </div>
    </div>
  );
};

export default RomansManagement;
