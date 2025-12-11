import useFetch from "http-react";
import type { TPost } from "./usePost";
import { apiURL } from "../constant";

export default function usePostCreators(id: any) {
  return useFetch<{posts: TPost[]}>(apiURL+`/creators/posts/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
  });
}
