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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">上传封面</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">你想将此文件上传为新封面吗？</p>

        <div className="mb-3">
          {file ? (
            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-40 object-cover rounded-md" />
          ) : (
            <div className="w-full h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md">无文件</div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md">取消</button>
          <button onClick={onConfirm} disabled={uploading} className="px-4 py-2 bg-indigo-600 text-white rounded-md">{uploading ? '上传中...' : '上传'}</button>
        </div>
      </div>
    </div>
  );
}
