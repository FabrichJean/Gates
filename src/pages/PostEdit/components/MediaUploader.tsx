import { Trash2 } from "lucide-react";

export default function MediaUploader(props: {
  images: any[];
  videos: any[];
  imageFields: { id: number; file: File | null; url?: string }[];
  videoFields: { id: number; file: File | null; url?: string; cover?: File | null; coverUrl?: string; type?: string }[];
  handleImageChange: (id: number, file: File | null) => void;
  handleVideoChange: (id: number, file: File | null) => void;
  handleCoverChange: (id: number, file: File | null) => void;
  handleVideoTypeChange?: (id: number, value: 'short' | 'long') => void;
  handleExistingVideoTypeChange?: (id: number, value: 'short' | 'long') => void;
  existingVideoCovers?: Record<number, File | null>;
  addImageField: () => void;
  addVideoField: () => void;
  removeImageField: (id: number) => void;
  removeVideoField: (id: number) => void;
  setDeletedImageIds: React.Dispatch<React.SetStateAction<number[]>>;
  setDeletedVideoIds: React.Dispatch<React.SetStateAction<number[]>>;
  setMedia: React.Dispatch<React.SetStateAction<{ images: any[]; videos: any[] }>>;
}) {
  const { images, videos, imageFields, videoFields, handleImageChange, handleVideoChange, handleCoverChange, addImageField, addVideoField, removeImageField, removeVideoField, setDeletedImageIds, setDeletedVideoIds, setMedia, handleVideoTypeChange, handleExistingVideoTypeChange } = props;

  const { existingVideoCovers } = props as any;

  return (
    <>
      <div className="relative w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Images:</label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {images?.map((image, index) => {
            const imageUrl = image.s3_urls?.imageUrl || image.public_urls?.local_image_url;
            const handleDelete = () => {
              const confirmed = window.confirm("Supprimer cette image ?");
              if (!Boolean(confirmed)) return;
              // mark for deletion and remove locally; actual delete performed on update
              setDeletedImageIds((prev) => [...prev, image.id]);
              setMedia((prev) => ({ ...prev, images: prev.images.filter((i) => i.id !== image.id) }));
            };

            return (
              <div key={image.id} className="relative group">
                <img src={imageUrl || ""} alt={`image-${index}`} className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow" />
                <div className="absolute top-2 right-2 badge badge-neutral">{index + 1}/{images.length}</div>
                <button type="button" title="Supprimer" onClick={handleDelete} className="absolute top-2 left-2 p-2 rounded bg-red-600 text-white opacity-90 hover:opacity-100"><Trash2 size={16} /></button>
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
                    <img src={field.url} alt="Existing" className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" /></svg>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cliquer pour uploader</p>
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

        <button type="button" onClick={addImageField} className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200">+ Ajouter une image</button>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-600 my-6"></div>

      <div className="relative w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Vidéos:</label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos?.map((video, index) => {
            const videoUrl = video.s3_urls?.hlsUrl || video.public_urls?.local_mp4_url || video.cdn_url;
            const handleDelete = () => {
              const confirmed = window.confirm("Supprimer cette vidéo ?");
              if (!Boolean(confirmed)) return;
              setDeletedVideoIds((prev) => [...prev, video.id]);
              setMedia((prev) => ({ ...prev, videos: prev.videos.filter((v) => v.id !== video.id) }));
            };


            return (
              <div key={video.id} className="relative group">
                <video src={videoUrl || ""} controls className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow" />
                <div className="absolute top-2 right-2 badge badge-neutral">{index + 1}/{videos.length}</div>
                <button type="button" title="Supprimer" onClick={handleDelete} className="absolute top-2 left-2 p-2 rounded bg-red-600 text-white opacity-90 hover:opacity-100"><Trash2 size={16} /></button>
                <div className="mt-4">
                  <div className="relative w-full">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cover <span className="text-red-500">*</span></label>
                    {/* <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleCoverChange(video.id, file); e.target.value = ""; }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" id={`exist-cover-${video.id}`} /> */}
                    {/* determine if a cover exists (newly chosen or existing url) */}
                    {(() => {
                      const chosen = existingVideoCovers?.[video.id];
                      // prefer explicit local cover paths returned by backend
                      const existingUrl = video.public_urls?.local_cover_path || video.local_cover_path;
                      const hasCover = Boolean(chosen) || Boolean(existingUrl);
                      return (
                        <label htmlFor={`exist-cover-${video.id}`} className={`border ${!hasCover ? 'border-gray-300 dark:border-gray-600' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 rounded-md p-2 flex flex-col items-center justify-center  h-[120px] w-full`}>
                          {chosen ? (
                            <div className="w-full h-full">
                              <img src={URL.createObjectURL(chosen)} alt="Cover" className="w-full h-full object-cover rounded-md" />
                            </div>
                          ) : existingUrl ? (
                            <div className="w-full h-full">
                              <img src={existingUrl} alt="Cover" className="w-full h-full object-cover rounded-md" />
                            </div>
                          ) : (
                            <div className="text-center h-full flex flex-col justify-center">
                              <svg className="mx-auto h-6 w-6 text-gray-400 dark:text-gray-500 mb-1" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              <div className={`text-gray-600 dark:text-gray-400`}>
                                <p className="text-xs font-medium">Upload cover</p>
                                <p className="text-xs">PNG, JPG, GIF</p>
                              </div>
                            </div>
                          )}
                        </label>
                      );
                    })()}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleExistingVideoTypeChange?.(video.id, 'short')}
                        className={`px-3 py-1 text-xs rounded-md ${video.type === '2' ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'bg-indigo-600 text-white'}`}
                      >
                        Short
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExistingVideoTypeChange?.(video.id, 'long')}
                        className={`px-3 py-1 text-xs rounded-md ${video.type === '2' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        Long
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {videoFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <div className="relative">
                <input type="file" accept="video/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleVideoChange(field.id, file); e.target.value = ""; }} className="absolute inset-0 opacity-0 cursor-pointer z-10" id={`vid-${field.id}`} />
                <label htmlFor={`vid-${field.id}`} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 flex items-center justify-center hover:border-blue-500 cursor-pointer h-[250px]">
                  {field.file ? (
                    <video src={URL.createObjectURL(field.file)} controls className="w-full h-full object-cover rounded" />
                  ) : field.url ? (
                    <video src={field.url} controls className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cliquer pour uploader</p>
                      <p className="text-xs text-gray-500">Max 2GB</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="relative w-full">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cover <span className="text-red-500">*</span></label>
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleCoverChange(field.id, file); e.target.value = ""; }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" id={`cover-${field.id}`} />
                <label htmlFor={`cover-${field.id}`} className={`border-2 border-dashed ${field.file && !field.cover ? 'border-red-400 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 rounded-md p-2 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer h-[120px] w-full`}>
                  {field.cover ? (
                    <div className="w-full h-full">
                      <img src={URL.createObjectURL(field.cover)} alt="Cover" className="w-full h-full object-cover rounded-md" />
                    </div>
                  ) : field.coverUrl ? (
                    <div className="w-full h-full">
                      <img src={field.coverUrl} alt="Cover" className="w-full h-full object-cover rounded-md" />
                    </div>
                  ) : (
                    <div className="text-center h-full flex flex-col justify-center">
                      <svg className="mx-auto h-6 w-6 text-gray-400 dark:text-gray-500 mb-1" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <div className={`${field.file && !field.cover ? 'text-red-500 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        <p className="text-xs font-medium">Upload cover</p>
                        <p className="text-xs">PNG, JPG, GIF</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
              <div className="relative w-full">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleVideoTypeChange?.(field.id, 'short')}
                    className={`px-3 py-1 text-xs rounded-md ${field.type === 'short' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    Short
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVideoTypeChange?.(field.id, 'long')}
                    className={`px-3 py-1 text-xs rounded-md ${field.type === 'long' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    Long
                  </button>
                </div>
              </div>

              {videoFields.length > 1 && (
                <div className="flex justify-start w-full">
                  <button type="button" onClick={() => removeVideoField(field.id)} className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-md">
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={addVideoField} className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200">+ Add video</button>
      </div>
    </>
  );
}
