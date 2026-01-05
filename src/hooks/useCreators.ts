import useFetch from 'http-react';
import { apiURL } from '../constant';
import { getToken } from '../utils/storage';
import type { Creator } from '../components/creators/CreatorList';

type PaginatedCreators = {
  total: number;
  page: number;
  limit: number;
  creators: Creator[];
};

export default function UseCreators(opts?: { page?: number; limit?: number; q?: string }) {
  const page = opts?.page ?? 1;
  const limit = opts?.limit ?? 10;
  const q = opts?.q ?? '';
  const url = `${apiURL}/creators?page=${page}&limit=${limit}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

  const res = useFetch<PaginatedCreators>(url, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  return {
    ...res,
    // keep backward-compatible `data` as the creators array
    data: (res.data?.creators ?? []) as Creator[],
    pagination: {
      total: res.data?.total ?? 0,
      page: res.data?.page ?? page,
      limit: res.data?.limit ?? limit,
    },
  } as typeof res & { data: Creator[]; pagination: { total: number; page: number; limit: number } };
}

export function UseOneCreator(id: any) {
  return useFetch<Creator>(`${apiURL}/creators/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}
