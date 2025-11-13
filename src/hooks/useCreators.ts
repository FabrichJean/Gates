import useFetch from 'http-react';
import { apiURL } from '../constant';
import { getToken } from '../utils/storage';

export type Creator = {
  id: number;
  name: string;
  gender: string | null;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export default function UseCreators() {
  return useFetch<Creator[]>(`${apiURL}/creators`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}
