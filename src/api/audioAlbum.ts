import axios from "axios";
import { apiURL, token } from "../constant";

export async function createAudioAlbumApi(formData: any) {
  return await axios.post(`${apiURL}/audio-albums`, formData, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function getAudioAlbumsApi(params?: any) {
  return await axios.get(`${apiURL}/audio-albums`, {
    params,
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function getAudioAlbumByIdApi(id: number) {
  return await axios.get(`${apiURL}/audio-albums/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function updateAudioAlbumApi(id: number, formData: FormData) {
  return await axios.put(`${apiURL}/audio-albums/${id}`, formData, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function deleteAudioAlbumApi(id: number) {
  return await axios.delete(`${apiURL}/audio-albums/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function getAudioAlbumsByAudioIdApi(audio_id: number | string) {
  return await axios.get(`${apiURL}/audio-albums`, {
    params: { audio_id },
    headers: { Authorization: `Bearer ${token()}` },
  });
}
