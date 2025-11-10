export interface Post {
  id: number;
  category_id: number;
  sub_category_id: number;
  plateform_id: number;
  published_at: string | null;
  createdAt: string;
  updatedAt: string;
  titles: PostTitle[];
  postCategory: PostCategory;
  postSubCategory: PostSubCategory;
  plateform: Plateform;
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

export interface PostsResponse {
  total: number;
  page: number;
  limit: number;
  posts: Post[];
}