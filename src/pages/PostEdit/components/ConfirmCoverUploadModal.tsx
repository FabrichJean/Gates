export default function ConfirmCoverUploadModal(props: {
  open: boolean;
  file: File | null;
  onCancel: () => void;
  onConfirm: () => void;
  uploading?: boolean;
}) {
  const { open, file, onCancel, onConfirm, uploading } = props;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Upload cover</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Do you want to upload this file as the new cover?</p>

        <div className="mb-3">
          {file ? (
            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-40 object-cover rounded-md" />
          ) : (
            <div className="w-full h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md">No file</div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md">Non</button>
          <button onClick={onConfirm} disabled={uploading} className="px-4 py-2 bg-indigo-600 text-white rounded-md">{uploading ? 'Uploading...' : 'Oui'}</button>
        </div>
      </div>
    </div>
  );
}
