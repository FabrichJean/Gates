import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-hot-toast";
import { fetchVideoForAppList } from "../api/videoForApp";
import { buildVideoForAppListParams } from "../utils/videoForAppFilters";

export interface VideoForAppRangeSelection {
  startPage: number;
  endPage: number;
}

export interface RangeProgress {
  current: number;
  total: number;
}

interface UseVideoForAppRangeSelectionOptions {
  page: number;
  data?: { total?: number; limit?: number };
  filters: any;
  setSelectedVideos: Dispatch<SetStateAction<Set<number>>>;
}

export const useVideoForAppRangeSelection = ({
  page,
  data,
  filters,
  setSelectedVideos,
}: UseVideoForAppRangeSelectionOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rangeSelection, setRangeSelection] = useState<VideoForAppRangeSelection>({
    startPage: page,
    endPage: page,
  });
  const [rangeLoading, setRangeLoading] = useState(false);
  const [rangeProgress, setRangeProgress] = useState<RangeProgress>({ current: 0, total: 0 });

  const hasData = Boolean(data);
  const totalPages = Math.ceil((data?.total || 0) / (data?.limit || 20));

  useEffect(() => {
    setRangeSelection((prev) => ({
      ...prev,
      startPage: page,
      endPage: Math.max(page, prev.endPage),
    }));
  }, [page]);

  const openRangeSelector = () => {
    setRangeSelection({ startPage: page, endPage: page });
    setIsOpen(true);
  };

  const closeRangeSelector = () => {
    setIsOpen(false);
    setRangeProgress({ current: 0, total: 0 });
  };

  const selectPageRange = async () => {
    if (rangeSelection.startPage > rangeSelection.endPage) {
      toast.error("起始页必须小于或等于结束页");
      return;
    }

    setRangeLoading(true);
    setRangeProgress({ current: 0, total: rangeSelection.endPage - rangeSelection.startPage + 1 });
    try {
      const allVideoIds: number[] = [];
      const computedTotalPages = Math.ceil((data?.total || 0) / (data?.limit || 20));

      if (rangeSelection.endPage > computedTotalPages) {
        toast.error(`结束页不能超过 ${computedTotalPages}`);
        return;
      }

      for (let currentPage = rangeSelection.startPage; currentPage <= rangeSelection.endPage; currentPage++) {
        try {
          const { params: queryParams } = buildVideoForAppListParams({ filters, page: currentPage });
          const response = await fetchVideoForAppList(queryParams);
          const pageVideoIds = response.videos.map((v: { id: number }) => v.id);
          allVideoIds.push(...pageVideoIds);

          setRangeProgress((prev) => ({ ...prev, current: prev.current + 1 }));
        } catch (error) {
          console.error(`加载第 ${currentPage} 页时出错:`, error);
          toast.error(`加载第 ${currentPage} 页时出错`);
          return;
        }
      }

      setSelectedVideos((prev) => {
        const newSelection = new Set(prev);
        allVideoIds.forEach((id) => newSelection.add(id));
        return newSelection;
      });

      toast.success(`在 ${rangeSelection.endPage - rangeSelection.startPage + 1} 页中选中了 ${allVideoIds.length} 个视频`);
      setIsOpen(false);
    } catch (error) {
      console.error("范围选择时出错:", error);
      toast.error("范围选择时出错");
    } finally {
      setRangeLoading(false);
      setRangeProgress({ current: 0, total: 0 });
    }
  };

  return {
    isOpen,
    openRangeSelector,
    closeRangeSelector,
    rangeSelection,
    setRangeSelection,
    rangeLoading,
    rangeProgress,
    hasData,
    totalPages,
    selectPageRange,
  };
};
