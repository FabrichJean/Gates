import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import PostAccordion from "./PostAccordion";

export default function EditCustom({
  isOpen,
  onClose,
  selectedPosts,
  selectedPostList = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedPosts: Set<number>;
  selectedPostList?: any[];
}) {
  if (!isOpen) return null;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(null);

  // Reset page when the list changes
  useEffect(() => setPage(1), [selectedPostList.length]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((selectedPostList?.length || 0) / pageSize)), [selectedPostList, pageSize]);
  const visiblePosts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (selectedPostList || []).slice(start, start + pageSize);
  }, [selectedPostList, page, pageSize]);

  // Track which posts were updated (by id) so each accordion can show its own permanent badge
  const [updatedIds, setUpdatedIds] = useState<Set<number>>(new Set());

  const markUpdated = (id: number) => {
    setUpdatedIds((prev) => {
      const copy = new Set(prev);
      copy.add(id);
      return copy;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20 overflow-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-medium">编辑自定义</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 divide-y divide-gray-100">
          {selectedPostList.length === 0 ? (
            <div className="p-6 text-sm text-gray-600 dark:text-gray-400">没有可用的 post 详情（可能选中的是不在当前页的 ID）</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">显示 {visiblePosts.length} / {selectedPostList.length} posts</div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500">每页</label>
                  <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="select select-sm bg-white dark:bg-gray-700">
                    {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div>
                {visiblePosts.map((post: any, idx: number) => (
                  <PostAccordion
                    key={post.id}
                    post={post}
                    updated={updatedIds.has(post.id)}
                    onMarkedUpdated={() => markUpdated(post.id)}
                    isOpen={openAccordionId === post.id}
                    setOpen={(v: boolean) => setOpenAccordionId(v ? post.id : null)}
                    onOpenNext={(currentId: number) => {
                      // find global index within selectedPostList
                      const globalIndex = (selectedPostList || []).findIndex((p: any) => p.id === currentId);
                      const nextIndex = globalIndex + 1;
                      if (nextIndex < (selectedPostList || []).length) {
                        const nextId = (selectedPostList || [])[nextIndex].id;
                        const newPage = Math.floor(nextIndex / pageSize) + 1;
                        setPage(newPage);
                        setOpenAccordionId(nextId);
                      }
                    }}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">第 {page} / {totalPages} 页</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(1)} disabled={page === 1} className="btn btn-sm">«</button>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-sm">Prev</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-sm">Next</button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="btn btn-sm">»</button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded">关闭</button>
        </div>
      </div>
    </div>
  );
}

