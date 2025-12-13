import { useState } from 'react';
import UseCreators from '../hooks/useCreators';
import { deleteCreator } from '../api/creators';
import toast from 'react-hot-toast';
import CreatorList, { type Creator } from '../components/creators/CreatorList';
import CreatorFormModal from '../components/creators/CreatorFormModal';

export default function CreatorManager() {
  const { data: creators, reFetch } = UseCreators();
  const [query, setQuery] = useState<string>("");

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

  const filtered = (creators || []).filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="col-span-4">
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Creators</h3>
                <div className="text-sm text-gray-500 dark:text-gray-300">{creators?.length || 0}</div>
              </div>

              <div className="mb-3 flex items-center justify-between gap-3">
                <input
                  placeholder="Search creators..."
                  className={`flex-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${isLoading ? 'opacity-60' : ''}`}
                  onChange={(e) => setQuery(e.currentTarget.value)}
                  disabled={isLoading}
                />
                <button onClick={openCreateModal} disabled={isLoading} className={`ml-3 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>New</button>
              </div>

              <CreatorList creators={filtered} onEdit={openEditModal} onDelete={onDelete} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>

      <CreatorFormModal open={isModalOpen} onClose={closeModal} creator={selected} onSaved={async () => { await reFetch(); }} setParentLoading={setIsLoading} />
    </div>
  );
}
