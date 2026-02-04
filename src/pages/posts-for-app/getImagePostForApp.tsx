import React, { useState } from "react";
import { Image as ImageIcon, X, Trash2, Upload, Eye, Download } from "lucide-react";
import toast from "react-hot-toast";
import { deletePostForAppImage } from "../../api/postsForApp";
import type { Image } from "../../hooks/usePostForApp";
import { cdnS3 } from "../../utils/cdn";

interface Props {
  images?: Image[];
  reFetch: () => void;
}

const ImageStatusBadge: React.FC<{ status: number; label: string }> = ({ status, label }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 1:
        return {
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-700 dark:text-green-300',
          borderColor: 'border-green-200 dark:border-green-700',
          label: '已上传'
        };
      case 0:
        return {
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          label: '进行中'
        };
      default:
        return {
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          textColor: 'text-gray-700 dark:text-gray-300',
          borderColor: 'border-gray-200 dark:border-gray-700',
          label: '未知'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      <Upload className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default function GetImagePostForApp({ images, reFetch }: Props) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleDelete = async (imageId: number) => {
    if (!window.confirm('您确定要删除这张图片吗？')) return;

    setIsDeleting(imageId);
    try {
      await deletePostForAppImage(imageId);
      toast.success('图片删除成功');
      reFetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || '删除时出错');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center">无可用图片</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          图片 ({images.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={cdnS3(image.s3_urls?.imageUrl) || image.public_urls.local_image_url}
                  alt={`Image ${image.id}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                  }}
                />

                {/* Overlay avec actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(image);
                    }}
                    className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                    title="全屏查看"
                  >
                    <Eye className="w-4 h-4 text-gray-900" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const imageUrl = cdnS3(image.s3_urls?.imageUrl) || image.public_urls.local_image_url;
                      handleDownload(imageUrl, `image-${image.id}.jpg`);
                    }}
                    className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                    title="下载"
                  >
                    <Download className="w-4 h-4 text-gray-900" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(image.id)}
                    disabled={isDeleting === image.id}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    title="删除"
                  >
                    {isDeleting === image.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Badge de statut */}
                <div className="absolute top-2 right-2">
                  <ImageStatusBadge status={image.image_upload_status} label="" />
                </div>
              </div>

              {/* Métadonnées */}
              <div className="p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>ID: {image.id}</div>
                  <div>{new Date(image.createdAt).toLocaleDateString('fr-FR')}</div>
                  <div className="truncate">
                    本地: {image.local_image_path ? '✓' : '✗'}
                  </div>
                  <div className="truncate">
                    云端: {image.s3_urls?.imageUrl ? '✓' : '✗'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal d'image en plein écran */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-full">
            <img
              src={cdnS3(selectedImage.s3_urls?.imageUrl) || selectedImage.public_urls.local_image_url}
              alt={`Image ${selectedImage.id}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Image #{selectedImage.id}</h3>
                  <p className="text-sm opacity-75">
                    {new Date(selectedImage.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const imageUrl = cdnS3(selectedImage.s3_urls?.imageUrl) || selectedImage.public_urls.local_image_url;
                      handleDownload(imageUrl, `image-${selectedImage.id}.jpg`);
                    }}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="下载"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedImage.id)}
                    disabled={isDeleting === selectedImage.id}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                    title="删除"
                  >
                    {isDeleting === selectedImage.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}