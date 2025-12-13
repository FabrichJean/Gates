import useFetch from 'http-react';
import { apiURL } from '../constant';
import { getToken } from '../utils/storage';
import type { Creator } from '../components/creators/CreatorList';

export default function UseCreators() {
  return useFetch<Creator[]>(`${apiURL}/creators`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

export function UseOneCreator(id: any) {
  return useFetch<Creator>(`${apiURL}/creators/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}
