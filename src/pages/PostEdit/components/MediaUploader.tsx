import { Trash2 } from "lucide-react";
import { cdnS3 } from "../../../utils/cdn";
import { useI18n } from "../../../i18n";

export default function MediaUploader(props: {
  images: any[];
  imageFields: { id: number; file: File | null; url?: string }[];
  handleImageChange: (id: number, file: File | null) => void;
  existingVideoCovers?: Record<number, File | null>;
  addImageField: () => void;
  removeImageField: (id: number) => void;
  setDeletedImageIds: React.Dispatch<React.SetStateAction<number[]>>;
  setMedia: React.Dispatch<React.SetStateAction<{ images: any[]; videos: any[] }>>;
  // Optional props for compatibility with TouchPost and PostBotEdit
  videos?: any[];
  videoFields?: any[];
  handleVideoChange?: (id: number, file: File | null) => void;
  handleCoverChange?: (id: number, file: File | null) => void;
  handleVideoTypeChange?: (id: number, type: string) => void;
  handleExistingVideoTypeChange?: (videoId: number, type: string) => void;
  addVideoField?: () => void;
  removeVideoField?: (id: number) => void;
  setDeletedVideoIds?: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  const { images, imageFields, handleImageChange, addImageField, removeImageField, setDeletedImageIds, setMedia } = props;
  const { t } = useI18n();

  return (
    <>
      <div className="relative w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t("posts.edit.media.images_label")}</label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {images?.map((image, index) => {
            const imageUrl = image.s3_urls?.imageUrl || image.public_urls?.local_image_url;
            const handleDelete = () => {
              const confirmed = window.confirm(t("posts.edit.media.delete_confirm"));
              if (!Boolean(confirmed)) return;
              // mark for deletion and remove locally; actual delete performed on update
              setDeletedImageIds((prev) => [...prev, image.id]);
              setMedia((prev) => ({ ...prev, images: prev.images.filter((i) => i.id !== image.id) }));
            };

            return (
              <div key={image.id} className="relative group">
                <img src={cdnS3(imageUrl) || ""} alt={`image-${index}`} className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow" />
                <div className="absolute top-2 right-2 badge badge-neutral">{index + 1}/{images.length}</div>
                <button type="button" title={t("posts.edit.media.delete_button")} onClick={handleDelete} className="absolute top-2 left-2 p-2 rounded bg-red-600 text-white opacity-90 hover:opacity-100"><Trash2 size={16} /></button>
              </div>
            );
          })}

          {imageFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <div className="relative">
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageChange(field.id, file); e.target.value = ""; }} className="absolute inset-0 opacity-0 cursor-pointer z-10" id={`img-${field.id}`} />
                <label htmlFor={`img-${field.id}`} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 flex items-center justify-center hover:border-blue-500 cursor-pointer h-[250px]">
                  {field.file ? (
                    <img src={URL.createObjectURL(field.file)} alt="New" className="w-full h-full object-cover rounded" />
                  ) : field.url ? (
                    <img src={cdnS3(field.url)} alt="Existing" className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" /></svg>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t("posts.edit.media.upload_click")}</p>
                    </div>
                  )}
                </label>
              </div>

              {imageFields.length > 1 && (
                <button type="button" onClick={() => removeImageField(field.id)} className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-md">
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={addImageField} className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200">{t("posts.edit.media.add_image")}</button>
      </div>
    </>
  );
}
