import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

// Fetch tag categories for posts. Endpoint may vary on backend; adjust path if needed.
export async function getTagCategoriesPostApi() {

  // Try first candidate; callers can handle errors and we can refine if backend differs.
  return axios.get(`${apiURL}/post-tag-category`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}
