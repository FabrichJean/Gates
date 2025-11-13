import React, { useEffect, useRef, useState } from 'react';
import UseCreators, { type Creator } from '../hooks/useCreators';
import { createCreator, updateCreator, deleteCreator } from '../api/creators';
import toast from 'react-hot-toast';

export default function CreatorManager() {
  const { data: creators, reFetch } = UseCreators();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        try {
          URL.revokeObjectURL(objectUrlRef.current);
        } catch {
          // ignore
        }
        objectUrlRef.current = null;
      }
    };
  }, []);

  const resetForm = () => {
    setSelectedId(null);
    setName('');
    setGender('');
    setAvatarFile(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const onSelect = (c: Creator) => {
    setSelectedId(c.id);
    setName(c.name || '');
    setGender((c as any).gender || '');
    setPreviewUrl(c.avatar || null);
    setAvatarFile(null);
    setIsModalOpen(true);
  };

  const onCreate = async () => {
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('gender', gender || '');
      if (avatarFile) fd.append('avatar', avatarFile);
      await createCreator(fd);
      toast.success('Creator created');
      await reFetch();
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Create failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onUpdate = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('gender', gender || '');
      if (avatarFile) fd.append('avatar', avatarFile);
      await updateCreator(selectedId, fd);
      toast.success('Creator updated');
      await reFetch();
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async (id: number) => {
    try {
      const ok = window.confirm('Delete this creator?');
      if (!ok) return;
      await deleteCreator(id);
      toast.success('Creator deleted');
      await reFetch();
      if (selectedId === id) {
        resetForm();
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* <main className="col-span-8">
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center" style={{ minHeight: 420 }}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Manage creators</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">Click a card to edit, or create a new creator.</p>
              <button
                onClick={openCreateModal}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md bg-indigo-600 text-white ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
              >
                New creator
              </button>
            </div>
          </main> */}

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
                  onChange={() => { /* optional: wire search later */ }}
                  disabled={isLoading}
                />
                <button
                  onClick={openCreateModal}
                  disabled={isLoading}
                  className={`ml-3 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  New
                </button>
              </div>

              <div className="flex flex-wrap gap-3 max-h-[65vh] overflow-auto">
                {creators?.map((c: Creator) => (
                  <div key={c.id} className="w-max p-3 px-10 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                        {c.avatar ? (
                          <img src={c.avatar || undefined} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500">No</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{c.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">{(c as any).gender || '-'}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => onSelect(c)}
                            disabled={isLoading}
                            className={`text-sm px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-100 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(c.id)}
                            disabled={isLoading}
                            className={`text-sm px-2 py-1 rounded border border-red-200 text-red-600 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { if (!isLoading) closeModal(); }} />
          <div className="relative z-10 w-full max-w-2xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedId ? 'Edit creator' : 'Create creator'}</h4>
              <button
                onClick={closeModal}
                disabled={isLoading}
                className={`text-gray-600 dark:text-gray-300 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 items-start">
              <div className="col-span-1 flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                  {previewUrl ? (
                    <img src={previewUrl || undefined} alt="preview" className="w-full h-full object-cover" />
                  ) : selectedId ? (
                    creators?.find((x) => x.id === selectedId)?.avatar ? (
                      <img src={creators?.find((x) => x.id === selectedId)?.avatar || undefined} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-sm text-gray-500">No avatar</div>
                    )
                  ) : (
                    <div className="text-sm text-gray-500">No avatar</div>
                  )}
                </div>

                <label className={`mt-1 inline-flex items-center px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 ${isLoading ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}>
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isLoading}
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      if (objectUrlRef.current) {
                        URL.revokeObjectURL(objectUrlRef.current);
                        objectUrlRef.current = null;
                      }
                      if (f) {
                        const url = URL.createObjectURL(f);
                        objectUrlRef.current = url;
                        setPreviewUrl(url);
                        setAvatarFile(f);
                      } else {
                        setAvatarFile(null);
                        setPreviewUrl(null);
                      }
                    }}
                  />
                </label>

                <div className="text-xs text-gray-500">PNG, JPG — max 2MB</div>
              </div>

              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.currentTarget.value)}
                      className={`w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${isLoading ? 'opacity-60' : ''}`}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.currentTarget.value as 'male' | 'female' | 'other' | '')}
                      className={`w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${isLoading ? 'opacity-60' : ''}`}
                      disabled={isLoading}
                    >
                      <option value="">-</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  {selectedId ? (
                    <>
                      <button
                        onClick={async () => { if (!isLoading) { await onUpdate(); } }}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md bg-indigo-600 text-white ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
                      >
                        Save
                      </button>
                      <button
                        onClick={async () => { if (!isLoading && selectedId) { await onDelete(selectedId); } }}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => { if (!isLoading) { resetForm(); closeModal(); } }}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md text-sm text-gray-600 dark:text-gray-300 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={async () => { if (!isLoading) { await onCreate(); } }}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-md bg-green-600 text-white ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                      Create
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
