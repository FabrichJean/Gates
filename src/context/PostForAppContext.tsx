import React, { createContext, useContext } from "react";
import usePostForAppManagement from "../hooks/usePostForAppManagement";

type PostForAppContextType = ReturnType<typeof usePostForAppManagement> | null;

const PostForAppContext = createContext<PostForAppContextType>(null);

export const PostForAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pm = usePostForAppManagement();
  return <PostForAppContext.Provider value={pm}>{children}</PostForAppContext.Provider>;
};

export const usePostForAppContext = () => {
  const ctx = useContext(PostForAppContext);
  if (!ctx) throw new Error("usePostForAppContext must be used within PostForAppProvider");
  return ctx;
};

export default PostForAppContext;