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
