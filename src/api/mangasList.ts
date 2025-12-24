import axios from "axios";
import { apiURL, token } from "../constant";

export async function getMangasListApi(params?: { page?: number; limit?: number }) {
  return await axios.get(`${apiURL}/mangas`, {
    headers: { Authorization: `Bearer ${token()}` },
    params,
  });
}
