export interface AudioTitle {
  id: number;
  audio_id: number;
  i18_language: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AudioCategory {
  id: number;
  name: string;
  description?: string;
}

export interface AudioSubCategory {
  id: number;
  name: string;
  audio_category_id: number;
  description?: string;
}

export interface AudioTagCategory {
  id: number;
  name: string;
}

export interface Plateform {
  id: number;
  name: string;
  logo?: string;
}

export interface Creator {
  id: number;
  name: string;
  gender: string;
  avatar?: string;
  bio?: string;
}

export interface Audio {
  id: number;
  ref?: string;
  title: string;
  description?: string;
  audio_category_id: number;
  audio_sub_category_id?: number;
  creator?: string;
  creator_id?: number;
  duration?: number;
  need_vip: boolean;
  plateform_id?: number;
  type_audio: string;
  user_id: number;
  hash?: string;
  sys_code?: string;
  cover?: string;
  local_cover_path?: string;
  audio_file?: string;
  local_audio_path?: string;
  processing?: "null" | "working" | "done" | "canceled";
  checking?: "waiting for checking" | "checked" | "rejected";
  comment?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  audioCategory?: AudioCategory;
  audioSubCategory?: AudioSubCategory;
  tagCategories?: AudioTagCategory[];
  plateform?: Plateform;
  creatorObj?: Creator;
  titles?: AudioTitle[];

  // URLs dynamiques (attachées côté serveur)
  cover_url?: string;
  s3_cover_url?: string;
  audio_url?: string;
  s3_audio_url?: string;

  s3_urls: {
    audio?: string;
    cover?: string;
  }
}

export interface AudioFilter {
  page?: number;
  limit?: number;
  search?: string;
  audio_category_id?: number;
  audio_sub_category_id?: number;
  creator_id?: number;
  plateform_id?: number;
  need_vip?: boolean;
  checking?: string;
  isDeleted?: boolean;
  startedAt?: string;
  endAt?: string;
  sort?: string;
  order?: "ASC" | "DESC";
}

export interface AudioAlbum {
  id: number;
  ref?: string;
  album_number?: number;
  total_tracks?: number;
  audio_id?: number;
  user_id?: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  audio?: Audio;
  user?: any; // User relation
  tracks?: AudioAlbumTrack[];
}

export interface AudioAlbumTrack {
  id: number;
  ref?: string;
  track_number: number;
  title: string;
  description?: string;
  duration?: number;
  album_id: number;
  lyrics?: string;
  audio_file?: string;
  local_audio_path?: string;
  upload_status?: "pending" | "uploading" | "completed" | "failed";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  album?: AudioAlbum;
  titles?: AudioTitle[];

  // URLs
  audio_url?: string;
  s3_audio_url?: string;
}

export interface AudioListResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search: string | null;
  data: Audio[];
}
