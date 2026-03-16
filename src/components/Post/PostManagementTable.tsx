import type { MouseEvent } from "react";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { LiaSyncSolid } from "react-icons/lia";
import { cdnS3 } from "../../utils/cdn";
import RoleEnum from "../../utils/roleEnum";
import BtnTranscodeComponent from "./BtnTranscodeComponent";
import PostChecking from "../PostChecking";
import SingleSyncModal from "../SingleSyncModal";

type PostManagementTableProps = {
  selectionMode: boolean;
  filteredPosts: any[];
  visibleSelectedPosts: Set<number>;
  selectAllPage: () => void;
  togglePostSelection: (
    postId: number,
    index: number,
    event?: MouseEvent,
  ) => void;
  user: any;
  activate: (postId: number) => void;
  reFetch: () => void;
  singleSyncOpenId: number | null;
  setSingleSyncOpenId: (id: number | null) => void;
  singleSyncLoading: boolean;
  handleSingleSync: (postId: number, isForce: boolean) => void;
};

export default function PostManagementTable({
  selectionMode,
  filteredPosts,
  visibleSelectedPosts,
  selectAllPage,
  togglePostSelection,
  user,
  activate,
  reFetch,
  singleSyncOpenId,
  setSingleSyncOpenId,
  singleSyncLoading,
  handleSingleSync,
}: PostManagementTableProps) {
  return (
    <table className="w-full text-sm text-left border-t-3 border-blue-500 dark:border-blue-500 rtl:text-right text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-blue-500/5 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          {selectionMode && (
            <th scope="col" className="px-6 py-3">
              <input
                type="checkbox"
                checked={
                  visibleSelectedPosts.size === filteredPosts.length &&
                  filteredPosts.length > 0
                }
                onChange={selectAllPage}
                className="checkbox checkbox-sm checkbox-primary"
              />
            </th>
          )}
          <th scope="col" className="px-6 py-3">
            编号
          </th>
          <th scope="col" className="px-6 py-3">
            类别
          </th>
          <th scope="col" className="px-6 py-3">
            创建者
          </th>
          <th scope="col" className="px-6 py-3">
            用户
          </th>
          <th scope="col" className="px-6 py-3">
            平台
          </th>
          <th scope="col" className="px-6 py-3">
            检查
          </th>

          <th scope="col" className="px-6 py-3">
            激活
          </th>
          <th scope="col" className="px-6 py-3">
            视频
          </th>
          <th scope="col" className="px-6 py-3">
            图片
          </th>
          <th scope="col" className="px-6 py-3">
            创建日期
          </th>
          <th scope="col" className="px-6 py-3 text-left">
            操作
          </th>
        </tr>
      </thead>
      <tbody>
        {filteredPosts.map((post: any, idx: number) => {
          const isSelected = visibleSelectedPosts.has(post.id);

          return (
            <tr
              key={post.id}
              className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 transition-colors ${
                selectionMode && isSelected
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  : ""
              } ${
                selectionMode
                  ? "hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  : ""
              }`}
              onClick={
                selectionMode
                  ? (e) => {
                      e.preventDefault();
                      togglePostSelection(post.id, idx, e);
                    }
                  : undefined
              }
            >
              {selectionMode && (
                <td
                  className="px-6 py-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => togglePostSelection(post.id, idx, e as any)}
                    className="checkbox checkbox-sm checkbox-primary"
                  />
                </td>
              )}
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {post.id}
              </th>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100/50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
                  {post?.postCategory?.name} / {post?.postSubCategory?.name}
                </span>
              </td>
              <td className="px-6 py-4">
                {post.creatorObj ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={cdnS3(post.creatorObj.avatar)}
                      alt={post.creatorObj.name!}
                      className="min-w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement;
                        t.src = "";
                      }}
                    />
                    <Link
                      to={`/creators/` + post?.creatorObj?.id}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 text-nowrap"
                    >
                      {(post as any).creatorObj.name}
                    </Link>
                  </div>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                    {post.creator || "-"}
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  {(post as any)?.user?.username || "-"}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                  {post.plateform.name}
                </span>
              </td>
              <td className="px-6 py-4">
                <PostChecking index={idx} reFetch={reFetch} post={post} />
              </td>
              <td className="py-3 px-6 text-center border-r border-gray-100 dark:border-gray-800">
                <input
                  type="checkbox"
                  checked={!post.isDeleted}
                  className="toggle bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 checked:bg-blue-300 dark:checked:bg-blue-500 checked:border-gray-300 dark:checked:border-gray-700 transition-colors duration-300 w-[2.5rem] h-[1.5rem] scale-[0.7] rounded-full"
                  onChange={
                    user?.role === RoleEnum.SUPERADMIN
                      ? () => activate(post.id)
                      : undefined
                  }
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-nowrap gap-1">
                  {post.videos?.slice(0, 2).map((video: any) => (
                    <div key={video.id} className="relative group">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-300"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                        {Math.floor(video.duration / 1000)}s
                      </div>
                    </div>
                  ))}
                  {post.videos?.length > 2 && (
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        +{post.videos.length - 2}
                      </span>
                    </div>
                  )}
                  {post.videos?.length === 0 && (
                    <span className="text-xs text-gray-400">无视频</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-nowrap gap-1">
                  {post.images?.slice(0, 2).map((image: any, index: number) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={
                          cdnS3(image.s3_urls?.imageUrl) ||
                          image.public_urls.local_image_url
                        }
                        alt={`Image ${index + 1}`}
                        className="min-w-8 h-8 object-cover rounded whitespace-nowrap"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  ))}
                  {post.images?.length > 2 && (
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        +{post.images.length - 2}
                      </span>
                    </div>
                  )}
                  {post.images?.length === 0 && (
                    <span className="text-xs text-gray-400">无图片</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                {new Date(post.createdAt).toLocaleDateString()}
              </td>
              <td
                className="flex justify-center gap-2 px-6 py-4"
                onClick={(e) => e.stopPropagation()}
              >
                {user?.role === RoleEnum.SUPERADMIN ? (
                  <>
                    <BtnTranscodeComponent post={post as any} reFetch={reFetch} />

                    {post.processing === "done" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSingleSyncOpenId(post.id)}
                          className="inline-flex items-center gap-2 px-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 text-sm font-light transition-all duration-200"
                          disabled={
                            singleSyncLoading && singleSyncOpenId === post.id
                          }
                        >
                          <LiaSyncSolid className="w-3 h-3" />
                          同步
                        </button>

                        <SingleSyncModal
                          open={singleSyncOpenId === post.id}
                          onClose={() => setSingleSyncOpenId(null)}
                          onSubmit={(isForce) =>
                            handleSingleSync(post.id, isForce)
                          }
                          title={`同步帖子 #${post.id}`}
                        />
                      </>
                    )}
                  </>
                ) : null}
                {!selectionMode && (
                  <Link
                    to={`/post/${post.id}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 underline"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Details</span>
                  </Link>
                )}
                {selectionMode && (
                  <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span>Selection mode</span>
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
