import useFetch from "http-react";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import type { PostsResponse } from "../types/post";

export default function UsePosts() {
  return useFetch<PostsResponse>(apiURL + "/posts", {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}
