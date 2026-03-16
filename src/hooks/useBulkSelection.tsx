import { useCallback, useRef, useState } from "react";
import { getPostsForApp } from "../api/postsForApp";
import toast from "react-hot-toast";

type UseBulkSelectionArgs = {
  posts: any[];
  page: number;
  data: any;
  filters: any;
  reFetch: () => void;
};

export default function useBulkSelection({ posts, page, data, filters, reFetch }: UseBulkSelectionArgs) {
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());

  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [rangeSelection, setRangeSelection] = useState({ startPage: 1, endPage: 1 });
  const [rangeLoading, setRangeLoading] = useState(false);
  const [rangeProgress, setRangeProgress] = useState({ current: 0, total: 0 });

  const togglePostSelection = useCallback((postId: number) => {
    setSelectedPosts(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(postId)) newSelection.delete(postId);
      else newSelection.add(postId);
      return newSelection;
    });
  }, []);

  const selectAllPage = useCallback(() => {
    setSelectedPosts(prev => {
      const newSelection = new Set(prev);
      const currentPageIds = posts?.map(p => p.id) || [];
      const allSelected = currentPageIds.every(id => newSelection.has(id));

      if (allSelected) currentPageIds.forEach(id => newSelection.delete(id));
      else currentPageIds.forEach(id => newSelection.add(id));

      return newSelection;
    });
  }, [posts]);

  const deselectAll = useCallback(() => setSelectedPosts(new Set()), []);

  const openRangeSelector = useCallback(() => {
    setRangeSelection(prev => ({ ...prev, startPage: page, endPage: Math.max(page, prev.endPage) }));
    setShowRangeSelector(true);
  }, [page]);

  const closeRangeSelector = useCallback(() => {
    setShowRangeSelector(false);
    setRangeProgress({ current: 0, total: 0 });
  }, []);

  const selectPageRange = useCallback(async () => {
    if (rangeSelection.startPage > rangeSelection.endPage) {
      toast.error("La page de départ doit être inférieure ou égale à la page d'arrêt");
      return;
    }

    setRangeLoading(true);
    setRangeProgress({ current: 0, total: rangeSelection.endPage - rangeSelection.startPage + 1 });
    try {
      const allPostIds: number[] = [];
      const totalPages = Math.ceil((data?.total || 0) / (data?.limit || 20));

      if (rangeSelection.endPage > totalPages) {
        toast.error(`La page d'arrêt ne peut pas dépasser ${totalPages}`);
        return;
      }

      const normalizeBool = (val: any) => {
        if (val === "yes") return true;
        if (val === "no") return false;
        return val;
      };

      const normalizedFilters = {
        ...filters,
        isDeleted: normalizeBool(filters.isDeleted),
        processing: normalizeBool(filters.processing),
        uploaded: normalizeBool(filters.uploaded),
        invalid: normalizeBool(filters.invalid),
      };

      const apiFilters = Object.fromEntries(
        Object.entries(normalizedFilters).filter(([k, v]) => v !== "all" && v !== "" && v !== undefined && v !== null)
      );

      for (let currentPage = rangeSelection.startPage; currentPage <= rangeSelection.endPage; currentPage++) {
        try {
          const response = await getPostsForApp({ ...apiFilters, page: currentPage, limit: data?.limit || 20 });
          const pagePostIds = response.data.posts.map((p: any) => p.id);
          allPostIds.push(...pagePostIds);
          setRangeProgress(prev => ({ ...prev, current: prev.current + 1 }));
        } catch (error) {
          console.error(`Erreur lors du chargement de la page ${currentPage}:`, error);
          toast.error(`Erreur lors du chargement de la page ${currentPage}`);
          return;
        }
      }

      setSelectedPosts(prev => {
        const newSelection = new Set(prev);
        allPostIds.forEach(id => newSelection.add(id));
        return newSelection;
      });

      toast.success(`${allPostIds.length} posts sélectionnés sur ${rangeSelection.endPage - rangeSelection.startPage + 1} page(s)`);
      setShowRangeSelector(false);
    } catch (error) {
      console.error('Erreur lors de la sélection par plage:', error);
      toast.error('Erreur lors de la sélection par plage');
    } finally {
      setRangeLoading(false);
      setRangeProgress({ current: 0, total: 0 });
    }
  }, [data, filters, rangeSelection]);

  return {
    selectedPosts,
    togglePostSelection,
    selectAllPage,
    deselectAll,
    showRangeSelector,
    openRangeSelector,
    closeRangeSelector,
    rangeSelection,
    setRangeSelection,
    rangeLoading,
    rangeProgress,
    selectPageRange,
  };
}
