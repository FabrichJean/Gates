import type { VideoCoverCouple } from "../components/MediaPost";
import type { Video } from "../hooks/usePost";
import { cdnS3 } from "./cdn";

export function videoToVideoCoverCouple(video: Video): VideoCoverCouple {
  return {
    key: Date.now().toString(),
    data_id: String(video.id),
    videoFile: null,
    coverFile: null,

    videoPreview:
      video.s3_urls?.hlsUrl ??
      video.public_urls?.local_mp4_url ??
      video.public_urls?.local_hls_url ??
      "",

    coverPreview:
      cdnS3(video.s3_urls?.coverUrl) ??
      video.thumbnail_url ??
      video.public_urls?.local_cover_path ??
      "",

    isUploading: false,
    uploadProgress: 0,
  };
}
