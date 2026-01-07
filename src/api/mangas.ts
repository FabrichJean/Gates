import { apiURL, token } from "../constant";
import axios from "axios";

export const createManga = async (data: FormData) => {
  const response = await axios.post(`${apiURL}/mangas/`, data, {
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getMangaById = async (id: number) => {
  const response = await axios.get(`${apiURL}/mangas/${id}`, {
    headers: {
      Authorization: `Bearer ${token()}`,
    },
  });
  return response.data;
};

export const updateManga = async (id: number, data: FormData) => {
  const response = await axios.put(`${apiURL}/mangas/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const toggleMangaDeleted = async (id: number) => {
  const response = await axios.put(`${apiURL}/mangas/${id}/toggle-deleted`, {}, {
    headers: {
      Authorization: `Bearer ${token()}`,
    },
  });
  return response.data;
};

export const uploadMangaToS3 = async (id: number) => {
  const response = await axios.post(`${apiURL}/mangas/${id}/upload`, {}, {
    headers: {
      Authorization: `Bearer ${token()}`,
    },
  });
  return response.data;
};

export const toggleMangaBannedStatus = async (id: number) => {
  const response = await axios.put(`${apiURL}/mangas/${id}/toggle-banned`, {}, {
    headers: {
      Authorization: `Bearer ${token()}`,
    },
  });
  return response.data;
};

export const updateMangaBannedStatus = async (id: number, isBanned: boolean) => {
  const formData = new FormData();
  formData.append('isBanned', String(isBanned));
  const response = await axios.put(`${apiURL}/mangas/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
