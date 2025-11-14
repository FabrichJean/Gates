import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createCreator, updateCreator } from '../../api/creators';
import useImagePreview from '../../hooks/useImagePreview';
import type UseCreators from '../../hooks/useCreators';

type Creator = Exclude<ReturnType<typeof UseCreators>['data'], undefined> extends Array<infer T> ? T : any;

export default function CreatorFormModal({
  open,
  onClose,
  creator,
  onSaved,
  setParentLoading,
}: {
  open: boolean;
  onClose: () => void;
  creator?: Creator | null;
  onSaved: () => Promise<void>;
  setParentLoading?: (v: boolean) => void;
}) {
  const { previewUrl, setFile, clear, getFile } = useImagePreview();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (creator) {
      setName(creator.name || '');
      setGender((creator as any).gender || '');
      // if creator has an avatar URL we use it as preview only if no file selected
      if (!getFile() && creator.avatar) {
        // set preview directly (no object URL)
        // setFile is reserved for File objects; set preview via state
        // our hook does not expose setter for raw url, so use setFile(null) and rely on this local state
      }
    } else {
      setName('');
      setGender('');
      clear();
    }
  }, [creator]);

  if (!open) return null;

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const onCreateOrUpdate = async () => {
    setIsLoading(true);
    setParentLoading?.(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('gender', gender || '');
      const file = getFile();
      if (file) fd.append('avatar', file);

      if (creator && creator.id) {
        await updateCreator(creator.id, fd);
        toast.success('Creator updated');
      } else {
        await createCreator(fd);
        toast.success('Creator created');
      }

      await onSaved();
      onClose();
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setIsLoading(false);
      setParentLoading?.(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => { if (!isLoading) onClose(); }} />
      <div className="relative z-10 w-full max-w-2xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{creator ? 'Edit creator' : 'Create creator'}</h4>
          <button onClick={onClose} disabled={isLoading} className={`text-gray-600 dark:text-gray-300 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>Close</button>
        </div>

        <div className="grid grid-cols-3 gap-6 items-start">
          <div className="col-span-1 flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
              {previewUrl ? (
                <img src={previewUrl || undefined} alt="preview" className="w-full h-full object-cover" />
              ) : creator ? (
                creator.avatar ? (
                  <img src={creator.avatar || undefined} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-sm text-gray-500">No avatar</div>
                )
              ) : (
                <div className="text-sm text-gray-500">No avatar</div>
              )}
            </div>

            <label className={`mt-1 inline-flex items-center px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 ${isLoading ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}>
              Upload
              <input type="file" accept="image/*" className="hidden" disabled={isLoading} onChange={handleUploadChange} />
            </label>

            <div className="text-xs text-gray-500">PNG, JPG — max 2MB</div>
          </div>

          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Name</label>
                <input value={name} onChange={(e) => setName(e.currentTarget.value)} className={`w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${isLoading ? 'opacity-60' : ''}`} disabled={isLoading} />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.currentTarget.value as any)} className={`w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${isLoading ? 'opacity-60' : ''}`} disabled={isLoading}>
                  <option value="">-</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button onClick={onCreateOrUpdate} disabled={isLoading} className={`px-4 py-2 rounded-md bg-indigo-600 text-white ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>{creator ? 'Save' : 'Create'}</button>
              {creator && (
                <button onClick={() => { /* deletion handled by parent */ }} disabled className={`px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>Delete</button>
              )}
              <button onClick={onClose} disabled={isLoading} className={`px-4 py-2 rounded-md text-sm text-gray-600 dark:text-gray-300 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
