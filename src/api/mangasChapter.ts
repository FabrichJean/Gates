import axios from "axios";
import { apiURL, token } from "../constant";

export async function getMangasChaptersApi(mangaId: number) {
  return await axios.get(`${apiURL}/mangas-chapters/mangas/${mangaId}/chapters`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function createMangasChapterApi(mangaId: number, data: { title: string; description?: string; chapter_number?: number; metadata?: any }) {
  return await axios.post(`${apiURL}/mangas-chapters/mangas/${mangaId}/chapters`, data, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}
