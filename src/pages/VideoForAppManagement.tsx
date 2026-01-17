import React, { useState, useEffect } from "react";
import type { VideoForApp } from "../api/videoForApp";
import Pagination from "../components/Pagination";
import DeepLoader from "../components/DeepLoader";
import { checkObjectContent } from "../utils/filter";
import { useVideoForAppContext } from "../context/VideoForAppContext";
import { useAuth } from "../hooks/useAuth";
import VideoHeader from "../components/videos/VideoHeader";
import VideoTableHeader from "../components/videos/VideoTableHeader";
import VideoTableRow from "../components/videos/VideoTableRow";
import { updateVideoForApp, fetchVideoForAppList } from "../api/videoForApp";
import { getCreators } from "../api/creators";
import VideoForAppFilter from "../components/VideoForAppFilter";
import { toast } from "react-hot-toast";
import { Edit, CheckSquare, Square, Users, X } from "lucide-react";
import TagCategoryVideoForApp from "../components/TagCategoryVideoForApp";

type CheckingStatus = 'ready' | 'not ready' | 'checked' | 'waiting for checking' | null;




const VideoForAppManagement = () => {
  const { user } = useAuth();
  const ctx = useVideoForAppContext();
  if (!ctx) return null;

  const {
    page,
    setPage,
    filters,
    setFilters,
    params,
    data,
    loading,
    mutate,
    toWebapp,
    activate,
    send,
    reFetch,
  } = ctx;

  // Selection state
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    title: '',
    description: '',
    tags: [] as (number | { name: string })[],
    category: '',
    subcategory: '',
    isActive: null as boolean | null,
    checking: null as CheckingStatus,
    isBanned: null as boolean | null,
    creator_id: '',
    modifyTags: false,
  });
  const [bulkEditLoading, setBulkEditLoading] = useState(false);
  const [bulkEditProgress, setBulkEditProgress] = useState({ current: 0, total: 0 });

  // Range selection state
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [rangeSelection, setRangeSelection] = useState({
    startPage: page,
    endPage: page,
  });
  const [rangeLoading, setRangeLoading] = useState(false);
  const [rangeProgress, setRangeProgress] = useState({ current: 0, total: 0 });

  const [creators, setCreators] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    getCreators()
      .then((res) => {
        if (!mounted) return;
        const list = res?.data?.creators || res;
        setCreators(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!mounted) return;
        setCreators([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Selection handlers
  const toggleVideoSelection = (videoId: number) => {
    setSelectedVideos(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(videoId)) {
        newSelection.delete(videoId);
      } else {
        newSelection.add(videoId);
      }
      return newSelection;
    });
  };

  const selectAllPage = () => {
    setSelectedVideos(prev => {
      const newSelection = new Set(prev);
      const currentPageIds = data?.videos?.map(v => v.id) || [];
      const allSelected = currentPageIds.every(id => newSelection.has(id));

      if (allSelected) {
        // If all are selected, deselect all on current page
        currentPageIds.forEach(id => newSelection.delete(id));
      } else {
        // If not all are selected, select all on current page
        currentPageIds.forEach(id => newSelection.add(id));
      }

      return newSelection;
    });
  };

  const deselectAll = () => {
    setSelectedVideos(new Set());
  };

  const handleTagSelect = (tag: number | { name: string }) => {
    setBulkEditData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
  };

  const handleTagDeselect = (tag: number | { name: string }) => {
    setBulkEditData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => {
        if (typeof tag === 'number' && typeof t === 'number') {
          return t !== tag;
        }
        if (typeof tag === 'object' && typeof t === 'object') {
          return t.name !== tag.name;
        }
        return true;
      })
    }));
  };

  // Range selection handler
  const selectPageRange = async () => {
    if (rangeSelection.startPage > rangeSelection.endPage) {
      toast.error("La page de départ doit être inférieure ou égale à la page d'arrêt");
      return;
    }

    setRangeLoading(true);
    setRangeProgress({ current: 0, total: rangeSelection.endPage - rangeSelection.startPage + 1 });
    try {
      const allVideoIds: number[] = [];
      const totalPages = Math.ceil((data?.total || 0) / (data?.limit || 20));

      // Validate range
      if (rangeSelection.endPage > totalPages) {
        toast.error(`La page d'arrêt ne peut pas dépasser ${totalPages}`);
        return;
      }

      // Fetch all pages in the range
      for (let currentPage = rangeSelection.startPage; currentPage <= rangeSelection.endPage; currentPage++) {
        try {
          const response = await fetchVideoForAppList({ page: currentPage, ...filters });
          const pageVideoIds = response.videos.map(v => v.id);
          allVideoIds.push(...pageVideoIds);
          
          // Update progress
          setRangeProgress(prev => ({ ...prev, current: prev.current + 1 }));
        } catch (error) {
          console.error(`Erreur lors du chargement de la page ${currentPage}:`, error);
          toast.error(`Erreur lors du chargement de la page ${currentPage}`);
          return;
        }
      }

      // Update selection
      setSelectedVideos(prev => {
        const newSelection = new Set(prev);
        allVideoIds.forEach(id => newSelection.add(id));
        return newSelection;
      });

      toast.success(`${allVideoIds.length} vidéos sélectionnées sur ${rangeSelection.endPage - rangeSelection.startPage + 1} page(s)`);
      setShowRangeSelector(false);

    } catch (error) {
      console.error('Erreur lors de la sélection par plage:', error);
      toast.error('Erreur lors de la sélection par plage');
    } finally {
      setRangeLoading(false);
      setRangeProgress({ current: 0, total: 0 });
    }
  };

  const isAllPageSelected = data?.videos?.every(v => selectedVideos.has(v.id)) || false;
  const isSomeSelected = selectedVideos.size > 0;

  // Update page selection state when data changes
  const currentPageIds = data?.videos?.map(v => v.id) || [];
  const selectedOnCurrentPage = currentPageIds.filter(id => selectedVideos.has(id)).length;

  // Bulk edit handlers
  const openBulkEdit = () => {
    setShowBulkEdit(true);
  };

  const closeBulkEdit = () => {
    setShowBulkEdit(false);
    setBulkEditData({
      title: '',
      description: '',
      tags: [],
      category: '',
      subcategory: '',
      isActive: null,
      checking: null,
      isBanned: null,
      creator_id: '',
      modifyTags: false,
    });
    setBulkEditProgress({ current: 0, total: 0 });
  };

  const handleBulkEditSubmit = async () => {
    if (selectedVideos.size === 0) return;

    setBulkEditLoading(true);
    setBulkEditProgress({ current: 0, total: selectedVideos.size });
    let successCount = 0;
    let errorCount = 0;

    try {
      // Process each selected video one by one
      for (const videoId of selectedVideos) {
        try {
          const updateData: any = {};

          if (bulkEditData.title) updateData.title = bulkEditData.title;
          if (bulkEditData.description) updateData.description = bulkEditData.description;
          if (bulkEditData.modifyTags && bulkEditData.tags.length > 0) updateData.tag_category_ids = bulkEditData.tags.map(t => (typeof t === 'number' ? t : (t as any).id ?? (t as any).name));
          if (bulkEditData.category) updateData.category = bulkEditData.category;
          if (bulkEditData.subcategory) updateData.subcategory = bulkEditData.subcategory;
          if (bulkEditData.isActive !== null) updateData.isDeleted = !bulkEditData.isActive;
          if (bulkEditData.checking !== null) updateData.checking = bulkEditData.checking;
          if (bulkEditData.isBanned !== null) updateData.isBanned = bulkEditData.isBanned;

          if (Object.keys(updateData).length > 0) {
            await updateVideoForApp(videoId, updateData);
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to update video ${videoId}:`, error);
          errorCount++;
        }

        // Update progress
        setBulkEditProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} video${successCount > 1 ? 's' : ''}`);
        reFetch();
        closeBulkEdit();
        deselectAll();
      }

      if (errorCount > 0) {
        toast.error(`Failed to update ${errorCount} video${errorCount > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Bulk edit error:', error);
      toast.error('An error occurred during bulk edit');
    } finally {
      setBulkEditLoading(false);
      setBulkEditProgress({ current: 0, total: 0 });
    }
  };

  // Update range selection when page changes
  React.useEffect(() => {
    setRangeSelection(prev => ({
      ...prev,
      startPage: page,
      endPage: Math.max(page, prev.endPage)
    }));
  }, [page]);

  return (
    <div className="flex flex-col gap-2 min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-2 pb-0">
      {/* <VideoHeader
        user={user}
        filters={filters as any}
        setFilters={setFilters}
        params={{ status: "all", page, ...params }}
        loading={undefined}
        onMutate={mutate}
        onWebApp={toWebapp}
        scope="videos"
      /> */}

      <div className="flex justify-between w-full ">
        <div>
          {/* Filter Button */}
          <button
            className="btn btn-outline btn-sm w-fit mb-2"
            onClick={() => {
              const modal = document.getElementById("search_modal_52") as HTMLDialogElement | null;
              modal?.showModal();
            }}
          >
            Filter
          </button>
          <VideoForAppFilter
            filters={filters}
            setFilters={setFilters}
            params={params}
            onSubmit={mutate}
          />
          {checkObjectContent(filters).hasContent ? (
            <span className="mb-3 text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">* app videos filters</span>
          ) : null}
        </div>

        {/* Selection Controls */}
        <div className="flex items-center gap-2 mb-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={selectAllPage}
          >
            {isAllPageSelected ? (
              <>
                <Square className="w-4 h-4 mr-1" />
                Désélectionner la page
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 mr-1" />
                Sélectionner la page
              </>
            )}
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setRangeSelection({
                startPage: page,
                endPage: page,
              });
              setShowRangeSelector(true);
            }}
          >
            <Users className="w-4 h-4 mr-1" />
            Sélectionner par plage
          </button>

          {isSomeSelected && (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedVideos.size} vidéo{selectedVideos.size > 1 ? 's' : ''} sélectionnée{selectedVideos.size > 1 ? 's' : ''}
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={openBulkEdit}
              >
                <Edit className="w-4 h-4 mr-1" />
                Éditer en masse
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={deselectAll}
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-gray-800 overflow-hidden">
  {loading && <DeepLoader />}

        <div className="overflow-x-auto pb-[8rem]">
          <table className="min-w-full w-max text-sm md:text-base bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
            <VideoTableHeader showSelection={true} />
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300 pb-[8rem] transition-colors duration-300">
              {data?.videos?.map((video: VideoForApp, index: number) => (
                <VideoTableRow
                  key={video.id}
                  video={video as any}
                  index={index}
                  onActivate={activate}
                  onSend={send}
                  updateFn={updateVideoForApp}
                  hideTouchLink={false}
                  cancelFn={undefined}
                  reFetchFn={reFetch}
                  detailsPath="/app-videos"
                  convertToMp4Fn={undefined}
                  hideSend={true}
                  showSelection={true}
                  isSelected={selectedVideos.has(video.id)}
                  onToggleSelection={toggleVideoSelection}
                />
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          totalItems={data?.total}
          pageSize={data?.limit}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>

      {/* Range Selection Modal */}
      {showRangeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Sélectionner par plage de pages
                </h2>
                <button
                  onClick={() => {
                    setShowRangeSelector(false);
                    setRangeProgress({ current: 0, total: 0 });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Page de départ
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={rangeSelection.startPage}
                      onChange={(e) => setRangeSelection(prev => ({
                        ...prev,
                        startPage: Math.max(1, parseInt(e.target.value) || 1)
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Page d'arrêt
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={rangeSelection.endPage}
                      onChange={(e) => setRangeSelection(prev => ({
                        ...prev,
                        endPage: Math.max(1, parseInt(e.target.value) || 1)
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {data && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total de pages disponibles : {Math.ceil(data.total / data.limit)}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                {rangeLoading && rangeProgress.total > 0 && (
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(rangeProgress.current / rangeProgress.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {rangeProgress.current} / {rangeProgress.total} pages
                    </span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setShowRangeSelector(false);
                    setRangeProgress({ current: 0, total: 0 });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={rangeLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={selectPageRange}
                  disabled={rangeLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {rangeLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Chargement...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      Sélectionner la plage
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Édition en masse ({selectedVideos.size} vidéo{selectedVideos.size > 1 ? 's' : ''})
                </h2>
                <button
                  onClick={closeBulkEdit}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="modifyTags"
                    checked={bulkEditData.modifyTags}
                    onChange={(e) => setBulkEditData(prev => ({ ...prev, modifyTags: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="modifyTags" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Modifier les tags
                  </label>
                </div>

                {bulkEditData.modifyTags && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <TagCategoryVideoForApp
                      selectedTags={bulkEditData.tags}
                      onTagSelect={handleTagSelect}
                      onTagDeselect={handleTagDeselect}
                    />
                  </div>
                )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Créer / Assign Creator</label>
                    <select
                      value={bulkEditData.creator_id}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, creator_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Ne pas modifier</option>
                      {creators.map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut d'activation
                  </label>
                  <select
                    value={bulkEditData.isActive === null ? '' : bulkEditData.isActive.toString()}
                    onChange={(e) => setBulkEditData(prev => ({
                      ...prev,
                      isActive: e.target.value === '' ? null : e.target.value === 'true'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Ne pas modifier</option>
                    <option value="true">Activer</option>
                    <option value="false">Désactiver</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut Banned
                  </label>
                  <select
                    value={bulkEditData.isBanned === null ? '' : String(bulkEditData.isBanned)}
                    onChange={(e) => setBulkEditData(prev => ({
                      ...prev,
                      isBanned: e.target.value === '' ? null : e.target.value === 'true'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Ne pas modifier</option>
                    <option value="true">Bannir</option>
                    <option value="false">Debannir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut de vérification (Checking)
                  </label>
                  <select
                    value={bulkEditData.checking || ''}
                    onChange={(e) => setBulkEditData(prev => ({
                      ...prev,
                      checking: e.target.value === '' ? null : e.target.value as CheckingStatus
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Ne pas modifier</option>
                    <option value="ready">Prêt</option>
                    <option value="not ready">Pas prêt</option>
                    <option value="checked">Vérifié</option>
                    <option value="waiting for checking">En attente de vérification</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                {bulkEditLoading && bulkEditProgress.total > 0 && (
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(bulkEditProgress.current / bulkEditProgress.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {bulkEditProgress.current} / {bulkEditProgress.total}
                    </span>
                  </div>
                )}
                <button
                  onClick={closeBulkEdit}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={bulkEditLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleBulkEditSubmit}
                  disabled={bulkEditLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {bulkEditLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Appliquer les modifications
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoForAppManagement;
