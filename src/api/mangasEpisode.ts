import axios from "axios";
import { apiURL, token } from "../constant";

export async function getMangasEpisodesApi(chapterId: number) {
  return await axios.get(`${apiURL}/mangas/${chapterId}/episodes`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function createMangasEpisodeApi(chapterId: number, formData: FormData) {
  return await axios.post(`${apiURL}/mangas/${chapterId}/episodes`, formData, {
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function deleteMangasEpisodeApi(episodeId: number) {
  return await axios.delete(`${apiURL}/mangas/episodes/${episodeId}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function getMangasEpisodeByIdApi(episodeId: number) {
  return await axios.get(`${apiURL}/mangas/episodes/${episodeId}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function updateMangasEpisodeApi(episodeId: number, chapterId: number, formData: FormData) {
  return await axios.put(`${apiURL}/mangas/${chapterId}/episodes/${episodeId}`, formData, {
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function deleteEpisodeImagesApi(episodeId: number, imageIds: number[]) {
  return await axios.delete(`${apiURL}/mangas/episodes/${episodeId}/images`, {
    headers: { Authorization: `Bearer ${token()}` },
    data: { imageIds },
  });
}

export async function addEpisodeImagesApi(episodeId: number, formData: FormData) {
  return await axios.post(`${apiURL}/mangas/episodes/${episodeId}/images`, formData, {
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "multipart/form-data",
    },
  });
}
