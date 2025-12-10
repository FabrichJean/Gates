import React, { createContext, useContext } from "react";
// import usePostManagement from "../hooks/usePostManagement";
import usePostBotManagement from "../hooks/usePostBotManagement";

type PostContextType = ReturnType<typeof usePostBotManagement> | null;

const PostsBotContext = createContext<PostContextType>(null);

export const PostsBotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pm = usePostBotManagement();
  return <PostsBotContext.Provider value={pm}>{children}</PostsBotContext.Provider>;
};

export const usePostsBotContext = () => {
  const ctx = useContext(PostsBotContext);
  if (!ctx) throw new Error("usePostsBotContext must be used within PostsProvider");
  return ctx;
};

export default PostsBotContext;
