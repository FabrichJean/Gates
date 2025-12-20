import useFetch from "http-react";
import { apiURL } from "../../constant";
import { getToken } from "../../utils/storage";
import type { Creator } from "../../components/creators/CreatorList";


export type Checking = "null" | "waiting for checking" | "refused" | "checked";

export type Category = {
    id: number;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    subcategories?: Partial<Category>[];
};

export type SubCategory = {
    id: number;
    name: string;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
}

export type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  isValidated: boolean;
  isDeleted: boolean;
}


export type TRoman = {
    id: number;
    ref: string;
    comment: string;
    user_id: number;
    creator?: string | null;
    creator_id: number;
    category_id: number;
    sub_category_id: number | null;
    total_words: number;
    chapters_count: number;
    need_vip: boolean;
    isDeleted: boolean;
    plateform_id: number;
    checking: Checking;
    processing: "null" | "working" | "done";
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    titles: {
        id: any;
        title: string;
        i18_language: string;
        roman_id?: number;
        description?: string;
        language?: { code: string; name: string };
    }[];
    category: Category;
    subCategory: SubCategory;
    creatorObj: Creator;
    user: User;
    plateform: {
        id: number;
        name: string;
        video_sync_url: string | null;
        post_sync_url: string | null;
    };
};

export default function UseRomans(
  status?: "all" | "0" | "1",
  page?: number,
  search?: string
) {
  return useFetch<{
    total: number;
    totalSent: number;
    page: number | null;
    limit: number | null;
    search: string | null;
    romans: TRoman[];
  }>(apiURL + "/romans/all", {
    headers: { Authorization: `Bearer ${getToken()}` },
    query: { status, page, search },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UseRomansWithParams(query: any) {
  return useFetch<{
    total: number;
    totalSent: number;
    page: number | null;
    limit: number | null;
    search: string | null;
    romans: TRoman[];
  }>(apiURL + "/romans/all", {
    headers: { Authorization: `Bearer ${getToken()}` },
    query,
  });
}

export function UseRoman(id: string | number | undefined) {
  return useFetch<TRoman>(`${apiURL}/romans/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

