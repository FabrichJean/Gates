import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Edit, Trash2, X, Save, Search } from "lucide-react";
import Pagination from "../components/Pagination";
import AnimatedAlert from "./AnimatedAlert";

interface Props {
  title: string;
  icon: React.ReactNode;
  items: any[];
  loading: boolean;
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  itemsPerPage?: number;
}

export default function TagListPanel({ title, icon, items, loading, onCreate, onUpdate, onDelete, itemsPerPage = 6 }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newName, setNewName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const filtered = useMemo(() => items.filter(it => it.name.toLowerCase().includes(searchTerm.toLowerCase())), [items, searchTerm]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    await onCreate(name);
    setNewName("");
  };

  const startEdit = (it: any) => {
    setEditingId(it.id);
    setEditingName(it.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async (id: number) => {
    const name = editingName.trim();
    if (!name) return;
    await onUpdate(id, name);
    cancelEdit();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">{icon} {title}</h2>
      </div>

      <div className="p-3 border-b border-gray-200 dark:border-gray-600">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="搜索..." className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>

          <button onClick={handleAdd} disabled={!newName.trim()} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> 添加
          </button>
        </div>

        <div className="mt-2">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={`New ${title} name...`} onKeyPress={(e) => e.key === 'Enter' && handleAdd()} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">加载中...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">{searchTerm ? '未找到结果' : '暂无数据'}</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-gray-600 dark:text-gray-400">{filtered.length} of {items.length}{searchTerm && ' (搜索结果)'}</p>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {paginated.map((category, index) => (
                  <motion.div key={category.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ delay: index * 0.02 }} className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-600">#</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingId === category.id ? (
                          <input value={editingName} onChange={(e) => setEditingName(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') saveEdit(category.id); else if (e.key === 'Escape') cancelEdit(); }} className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" autoFocus />
                        ) : (
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{category.name}</h3>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {editingId === category.id ? (
                        <>
                          <button onClick={() => saveEdit(category.id)} className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded transition-colors" title="保存"><Save className="w-3.5 h-3.5" /></button>
                          <button onClick={cancelEdit} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded transition-colors" title="取消"><X className="w-3.5 h-3.5" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(category)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded transition-colors" title="编辑"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { setDeleteTarget({ id: category.id, name: category.name }); setAlertOpen(true); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors" title="删除"><Trash2 className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filtered.length > itemsPerPage && (
              <div className="mt-4">
                <Pagination totalItems={filtered.length} pageSize={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation modal for deletes */}
      <AnimatedAlert
        isOpen={alertOpen}
        onClose={() => { setAlertOpen(false); setDeleteTarget(null); }}
        title="确认删除"
        message={deleteTarget ? `确定要删除 "${deleteTarget.name}" ? 该操作是不可逆的。` : "确定要删除吗？"}
        type="warning"
        confirmText="删除"
        cancelText="取消"
        onConfirm={() => {
          if (!deleteTarget) return;
          // fire and forget; hook will refetch
          onDelete(deleteTarget.id).catch((err) => console.error(err));
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
