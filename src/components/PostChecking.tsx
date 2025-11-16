import { useState } from "react";
// support both Post and TPost shapes (loose typing below)
import { FaCheckDouble } from "react-icons/fa6";
import { FiHexagon } from "react-icons/fi";
import RefuseModal from "./RefuseModal";
import CheckerDrop from "./CheckerDrop";
import { useAuth } from "../hooks/useAuth";
import useUpdatePost from "../hooks/useUpdatePost";

interface Props {
  // Accept a loose post shape to support both Post and TPost types used across the app
  post: any;
  index?: number;
  reFetch: () => void;
}

export default function PostChecking({ post, index = 0, reFetch }: Props) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const { updatePost } = useUpdatePost();

  // const firstVideo = post.videos?.[0];

  if (!post) return <span className="text-xs text-gray-400">-</span>;

  return (
    <div className={"dropdown " + (index === 0 ? " dropdown-end" : "dropdown-top dropdown-end")}>
      <div tabIndex={post.id} role="button" className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-max p-1 px-2 rounded-md cursor-default m-auto transition-colors duration-300 border border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-800">
        {post.checking === "refused" ? (
          <FiHexagon className="text-red-500" />
        ) : post.checking === "verified" ? (
          <FaCheckDouble className="text-green-600 dark:text-green-400" />
        ) : (
          <FiHexagon className="text-gray-500 dark:text-gray-400" />
        )}
        <span className="text-gray-700 dark:text-gray-300">{post?.checking === "null" ? "not ready" : post.checking}</span>
      </div>

      {/* Refuse modal (if needed) */}
      {showModal && (
        <RefuseModal
          onClose={closeModal}
          onSubmit={async (comment: string) => {
            // Perform the video update for the refused state, then refresh
            try {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              await updatePost(post.id, { checking: "refused", comment });
              reFetch();
            } catch (err: any) {
              // swallow — UI will show server errors elsewhere
            }
            closeModal();
          }}
        />
      )}

      <CheckerDrop isPost resource={post as any} reFetch={reFetch} user={user} openRefuseModal={openModal} updateFn={updatePost}/>
    </div>
  );
}
