import { useI18n } from "../../i18n";

export type UploadChoice = "upload_yd" | "upload_cn" | "upload";

type UploadChoiceModalProps = {
  open: boolean;
  choice: UploadChoice;
  onChoiceChange: (choice: UploadChoice) => void;
  onConfirm: () => void;
  onClose: () => void;
  uploading?: boolean;
};

const UploadChoiceModal = ({
  open,
  choice,
  onChoiceChange,
  onConfirm,
  onClose,
  uploading,
}: UploadChoiceModalProps) => {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity z-0">
          <div className="absolute inset-0 bg-gray-500 opacity-75" />
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" />
        <div className="relative z-10 inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/40 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-blue-600"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                {t("videos.upload.confirm.title")}
              </h3>
              <div className="mt-2">
                <p className="text-sm leading-5 text-gray-500 dark:text-gray-400">
                  {t("videos.upload.confirm.subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label
              className={`flex items-center justify-center gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                choice === "upload_yd"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <input
                type="radio"
                name="upload-mode"
                value="upload_yd"
                checked={choice === "upload_yd"}
                onChange={() => onChoiceChange("upload_yd")}
                className="h-4 w-4 appearance-auto accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("videos.upload.confirm.upload_yd", {
                  default: {
                    en: "upload YD",
                    zh: "上传 yd",
                  },
                })}
              </span>
            </label>

            <label
              className={`flex items-center justify-center gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                choice === "upload_cn"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <input
                type="radio"
                name="upload-mode"
                value="upload_cn"
                checked={choice === "upload_cn"}
                onChange={() => onChoiceChange("upload_cn")}
                className="h-4 w-4 appearance-auto accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("videos.upload.confirm.upload_cn", {
                  default: {
                    en: "upload CN",
                    zh: "上传 CN",
                  },
                })}
              </span>
            </label>

            <label
              className={`flex items-center justify-center gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                choice === "upload"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <input
                type="radio"
                name="upload-mode"
                value="upload"
                checked={choice === "upload"}
                onChange={() => onChoiceChange("upload")}
                className="h-4 w-4 appearance-auto accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("videos.upload.confirm.upload", {
                  default: {
                    en: "upload both",
                    zh: "上传两个",
                  },
                })}
              </span>
            </label>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
              <button
                type="button"
                onClick={onConfirm}
                disabled={uploading}
                className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-blue-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:shadow-outline-blue transition ease-in-out duration-150 sm:text-sm sm:leading-5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploading
                  ? t("common.processing")
                  : t("videos.upload.confirm.confirm")}
              </button>
            </span>
            <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-base leading-6 font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:text-gray-500 dark:hover:text-gray-100 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150 sm:text-sm sm:leading-5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadChoiceModal;
