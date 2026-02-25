import React, { useState } from "react";
import { Play, Clock, CheckCircle, AlertTriangle, Loader2, Film } from "lucide-react";
import type { Video as BaseVideo } from "../../hooks/usePostForApp";
import { cdnS3 } from "../../utils/cdn";


// Extend Video type locally to add 'type' property for editable select
type VideoWithType = BaseVideo & { type?: number | string };

interface Props {
  videos?: VideoWithType[];
  reFetch: () => void;
  editable?: boolean;
  videoTypes?: Record<number, string>;
  onTypeChange?: (id: number, type: string) => void;
}

function VideoStatusBadge({ status, label }: { status: string; label: string }) {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'verified':
      case 'checked':
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          bgColor: 'bg-green-500',
          textColor: 'text-white'
        };
      case 'pending':
        return {
          icon: <Clock className="w-3 h-3" />,
          bgColor: 'bg-yellow-500',
          textColor: 'text-white'
        };
      case 'working':
      case 'processing':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          bgColor: 'bg-blue-500',
          textColor: 'text-white'
        };
      case 'rejected':
      case 'failed':
        return {
          icon: <AlertTriangle className="w-3 h-3" />,
          bgColor: 'bg-red-500',
          textColor: 'text-white'
        };
      default:
        return {
          icon: <Clock className="w-3 h-3" />,
          bgColor: 'bg-gray-500',
          textColor: 'text-white'
        };
    }
  };
  const config = getStatusConfig();
  return (
    <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${config.bgColor} ${config.textColor} shadow-sm`}>
      {config.icon}
    </div>
  );
}

export default function GetVideoPostForApp({ videos, reFetch, editable, videoTypes, onTypeChange }: Props) {
  const [selectedVideo, setSelectedVideo] = useState<VideoWithType | null>(null);

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Film className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center">没有视频</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Film className="w-5 h-5" />
          视频 ({videos.length})
        </h3>

        {/* Grille de vidéos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              {/* Container de l'image/vidéo */}
              <div className="relative aspect-video bg-gray-900 overflow-hidden">
                {video.s3_urls.coverUrl ? (
                  <img
                    src={cdnS3(video.s3_urls.coverUrl)}
                    alt={`Vidéo ${video.id}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class=\"w-full h-full flex items-center justify-center bg-gray-800\">
                            <div class=\"text-center text-gray-400\">
                              <svg class=\"w-12 h-12 mx-auto mb-2\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z\"></path></svg>
                              <p class=\"text-sm\">缩略图不可用</p>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center text-gray-400">
                      <Film className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">缩略图不可用</p>
                    </div>
                  </div>
                )}

                {/* Overlay avec icône de lecture */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" onClick={() => setSelectedVideo(video)}>
                  <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-black/80 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-gray-900 dark:text-white ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Badge de durée */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                </div>

                {/* Badges de statut */}
                <div className="absolute top-2 left-2 flex gap-1">
                  <VideoStatusBadge status={video.checking} label="" />
                  <VideoStatusBadge status={video.processing} label="" />
                </div>
              </div>

              {/* Informations compactes */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    视频 #{video.id}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {video.sys_code || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>本地: {video.local_mp4_path ? '✓' : '✗'}</span>
                  <span>云: {video.s3_urls?.hlsUrl ? '✓' : '✗'}</span>
                </div>
                {/* Type editable in grid */}
                {/* Type editable */}
                {typeof video.id === 'number' && (editable && onTypeChange) ? (
                  <div className="mt-2">
                    <label className="text-xs text-gray-700 dark:text-gray-300 mr-2">Type:</label>
                    <select
                      className="px-2 py-1 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                      value={videoTypes && videoTypes[video.id] !== undefined ? videoTypes[video.id] : (video.type !== undefined ? String(video.type) : "1")}
                      onChange={e => onTypeChange(video.id, e.target.value)}
                    >
                      <option value="1">短片</option>
                      <option value="2">长片</option>
                    </select>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                    类型: {String(video.type) === '2' ? '长片' : '短片'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de lecture vidéo */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 h-full overflow-y-auto" onClick={() => setSelectedVideo(null)}>
          <div className="relative max-w-4xl max-h-full w-full">
            <video
              controls
              autoPlay
              className="w-full max-h-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <source src={selectedVideo.s3_urls?.hlsUrl || selectedVideo.public_urls?.local_mp4_url} type="video/mp4" />
              您的浏览器不支持视频播放。
            </video>

            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}