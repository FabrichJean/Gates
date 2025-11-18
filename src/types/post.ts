import type { Creator } from "../hooks/useCreators";

export interface Post {
  id: number;
  category_id: number;
  sub_category_id: number;
  plateform_id: number;
  published_at: string | null;
  createdAt: string;
  updatedAt: string;
  // optional free-text creator name
  creator?: string | null;
  creatorObj?: Creator | null;
  titles: PostTitle[];
  postCategory: PostCategory;
  postSubCategory: PostSubCategory;
  plateform: Plateform;
  videos: PostVideo[];
  images: PostImage[];
}

export interface PostTitle {
  id: number;
  title: string;
  description: string | null;
  post_id: number;
  i18_language: string;
}

export interface PostCategory {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostSubCategory {
  id: number;
  name: string;
  category_id: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Plateform {
  id: number;
  name: string;
  video_sync_url: string;
  post_sync_url: string;
}

export interface PostVideo {
  id: number;
  checking: string;
  processing: string;
  post_id: number;
  thumbnail_url: string | null;
  duration: number;
  s3_hls_path: string | null;
  cdn_url: string | null;
  local_mp4_path: string;
  hash: string;
  sys_code: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  public_urls: {
    local_mp4_url: string;
    hls_url: string;
    local_hls_url: string | null;
  };
  s3_urls: {
    hlsUrl: string | null;
    cdnUrl: string | null;
  };
}

export interface PostImage {
  id: number;
  post_id: number;
  s3_image_path: string | null;
  image_upload_status: number;
  local_image_path: string;
  createdAt: string;
  updatedAt: string;
  public_urls: {
    local_image_url: string;
  };
  s3_urls: {
    imageUrl: string | null;
  };
}

export interface PostsResponse {
  total: number;
  page: number;
  limit: number;
  posts: Post[];
}