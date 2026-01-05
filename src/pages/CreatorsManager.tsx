import { useState, useEffect } from 'react';
import { MdChevronLeft, MdChevronRight, MdClose, MdAdd } from 'react-icons/md';
import UseCreators from '../hooks/useCreators';
import { deleteCreator } from '../api/creators';
import toast from 'react-hot-toast';
import CreatorList, { type Creator } from '../components/creators/CreatorList';
import CreatorFormModal from '../components/creators/CreatorFormModal';

export default function CreatorManager() {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [query, setQuery] = useState<string>("");

  const { data: creators, reFetch, pagination } = UseCreators({ page, limit, q: query });

  const [selected, setSelected] = useState<Creator | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openCreateModal = () => { setSelected(null); setIsModalOpen(true); };
  const openEditModal = (c: Creator) => { setSelected(c); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);

  const onDelete = async (id: number) => {
    try {
      const ok = window.confirm('Delete this creator?');
      if (!ok) return;
      setIsLoading(true);
      await deleteCreator(id);
      toast.success('Creator deleted');
      await reFetch();
      if (selected?.id === id) { setSelected(null); setIsModalOpen(false); }
    } catch (err) { toast.error('Delete failed'); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    // reset to first page when query changes
    setPage(1);
  }, [query]);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 rounded-lg transition-all duration-300">
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="col-span-4">
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Creators</h3>
                <div className="text-sm text-gray-500 dark:text-gray-300">{pagination?.total ?? 0}</div>
              </div>

              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <input
                    value={query}
                    placeholder="Search creators..."
                    className={`w-full pr-8 px-3 h-10 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${isLoading ? 'opacity-60' : ''}`}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    disabled={isLoading}
                  />
                  {query && (
                    <button
                      type="button"
                      title="Clear"
                      onClick={() => setQuery("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button onClick={openCreateModal} disabled={isLoading} className={`ml-3 px-3 h-10 flex items-center justify-center rounded-md bg-indigo-600 text-white text-sm ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                  <MdAdd className="w-4 h-4 mr-2" />
                  New
                </button>
              </div>

              <CreatorList creators={creators || []} onEdit={openEditModal} onDelete={onDelete} isLoading={isLoading} />

              {/* Pagination controls */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  title="Previous"
                  aria-label="Previous page"
                  className="px-3 py-1 h-8 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-700"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={(pagination?.page ?? page) <= 1}
                >
                  <MdChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  {(() => {
                    const total = pagination?.total ?? 0;
                    const lim = pagination?.limit ?? limit;
                    const current = pagination?.page ?? page;
                    const pageCount = Math.max(1, Math.ceil(total / lim));
                    const pages: number[] = [];
                    if (pageCount <= 10) {
                      for (let i = 1; i <= pageCount; i++) pages.push(i);
                    } else {
                      const start = Math.max(1, current - 3);
                      const end = Math.min(pageCount, current + 3);
                      if (start > 1) {
                        pages.push(1);
                        if (start > 2) pages.push(-1);
                      }
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (end < pageCount) {
                        if (end < pageCount - 1) pages.push(-1);
                        pages.push(pageCount);
                      }
                    }

                    return pages.map((pnum, idx) => {
                      if (pnum === -1) return (
                        <span key={`sep-${idx}`} className="px-2 text-sm text-gray-500">...</span>
                      );
                      return (
                        <button
                          key={pnum}
                          onClick={() => setPage(pnum)}
                          className={`px-3 py-1 h-8 flex items-center justify-center rounded ${pnum === (pagination?.page ?? page) ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        >
                          {pnum}
                        </button>
                      );
                    });
                  })()}
                </div>

                <button
                  title="Next"
                  aria-label="Next page"
                  className="px-3 py-1 h-8 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-700"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(pagination?.page ?? page) * (pagination?.limit ?? limit) >= (pagination?.total ?? 0)}
                >
                  <MdChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreatorFormModal open={isModalOpen} onClose={closeModal} creator={selected} onSaved={async () => { await reFetch(); }} setParentLoading={setIsLoading} />
    </div>
  );
}
