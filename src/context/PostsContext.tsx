import React, { createContext, useContext } from "react";
import usePostManagement from "../hooks/usePostManagement";

type PostContextType = ReturnType<typeof usePostManagement> | null;

const PostsContext = createContext<PostContextType>(null);

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pm = usePostManagement();
  return <PostsContext.Provider value={pm}>{children}</PostsContext.Provider>;
};

export const usePostsContext = () => {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePostsContext must be used within PostsProvider");
  return ctx;
};

export default PostsContext;
