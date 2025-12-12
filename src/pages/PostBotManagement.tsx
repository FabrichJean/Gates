import { FilePlus, Eye, Filter } from "lucide-react";
import Pagination from "../components/Pagination";
import { Link } from "react-router-dom";
import { useState } from "react";
import UsePlateform from "../hooks/usePlateform";
import PostChecking from "../components/PostChecking";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import BtnTranscodeComponent from "../components/Post/BtnTranscodeComponent";
import { webAppPlateform } from "../api/plateforms";
import RoleEnum from "../utils/roleEnum";
import PostFilter, { type TPostFilter } from "../components/Post/PostFilter"; // mbola miandry
import { PostsBotProvider, usePostsBotContext } from "../context/PostsBotContext";

// Inner component consumes PostsContext
const PostManagementInner = () => {
  const { page, setPage, data, loading, reFetch, activate } = usePostsBotContext();

  // local state to hold filter UI and optionally filtered results
  const [filters, setFilters] = useState<TPostFilter>({
    category_id: "",
    sub_category_id: "",
    creator_id: "",
    startDate: "",
    endDate: "",
    user_id: "",
    isDeleted: "all",
    upload_status: "all",
    cover_upload_status: "all",
    transfer_status: "all",
    uploaded: "all",
    page: "1",
    limit: "20",
    sort: "createdAt",
    order: "DESC",
  });

  const [filteredData, setFilteredData] = useState<any | null>(null);

  const posts = filteredData?.posts || data?.posts || [];
  const total = filteredData?.total || data?.total || 0;
  const totalSent = filteredData?.totalSent ?? data?.total;
  const limit = filteredData?.limit || data?.limit || 10;

  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  // client-side filtering of current page
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR");
  const filteredPosts = posts.filter(
    (post: any) =>
      post.postCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.postSubCategory.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      post.plateform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(post.createdAt)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="h-screen w-full">
      <div className="">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-blue-100">
          Post Bot Management
        </h1>

        {/* header  */}
        <header className="border-b border-gray-200 dark:border-gray-700 py-3">
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <Link
                to={"/post/upload"}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 font-medium text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition-all"
              >
                <FilePlus className="w-5 h-auto text-blue-400 dark:text-blue-300" />
              </Link>
              
              <SendToWebApp />
              {/* @ts-ignore */}
              {/* <small>(video sent) : {totalSent}</small> */}

              {/* Post filters (dialog rendered by PostFilter) */}
              <div>
                <button
                  onClick={() => {
                    const modal = document.getElementById(
                      "search_modal_52"
                    ) as HTMLDialogElement | null;
                    modal?.showModal();
                  }}
                  className="input input-ghost hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <Filter className="w-3 text-gray-600 dark:text-gray-400" /> filters
                </button>

                <PostFilter
                  filters={filters}
                  setFilters={setFilters}
                  params={{ page: String(page), limit: String(limit) }}
                  onSubmit={(d: any) => {
                    setFilteredData(d);
                    try {
                      const p = Number(d?.page || page);
                      if (!Number.isNaN(p)) setPage(p);
                    } catch {}
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="w-full mt-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left border-t-3 border-blue-500 dark:border-blue-500 rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-blue-500/5 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Category
                </th>
                <th scope="col" className="px-6 py-3">
                  Creator
                </th>
                <th scope="col" className="px-6 py-3">
                  User
                </th>
                <th scope="col" className="px-6 py-3">
                  Platform
                </th>
                <th scope="col" className="px-6 py-3">
                  Checking
                </th>
                
                <th scope="col" className="px-6 py-3">
                  Activate
                </th>
                <th scope="col" className="px-6 py-3">
                  Videos
                </th>
                <th scope="col" className="px-6 py-3">
                  Images
                </th>
                <th scope="col" className="px-6 py-3">
                  Date de création
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post_bot: any, idx: number) => (
                <tr
                  key={post_bot.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {post_bot.id}
                  </th>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100/50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
                      {post_bot.postCategory.name} / {post_bot.postSubCategory.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {(post_bot).creatorObj ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={(post_bot).creatorObj.avatar!}
                          alt={(post_bot).creatorObj.name!}
                          className="min-w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            t.src = "";
                          }}
                        />
                        <Link to={`/creators/`+post_bot?.creatorObj?.id} className="text-sm font-medium text-gray-900 dark:text-gray-100 text-nowrap">
                          {(post_bot as any).creatorObj.name}
                        </Link>
                      </div>
                    ) : (
                      <Link to={`/creators/`+post_bot?.creatorObj?.id} className="px-2 py-1 text-xs font-medium rounded-full bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        {post_bot.creator || "-"}
                      </Link>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                      {(post_bot as any)?.user?.username || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                      {post_bot.plateform.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <PostChecking index={idx} reFetch={reFetch} post={post_bot} />
                  </td>
                  <td className="py-3 px-6 text-center border-r border-gray-100 dark:border-gray-800">
                    <input
                      type="checkbox"
                      checked={!post_bot.isDeleted}
                      className="toggle bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 checked:bg-blue-300 dark:checked:bg-blue-500 checked:border-gray-300 dark:checked:border-gray-700 transition-colors duration-300 w-[2.5rem] h-[1.5rem] scale-[0.7] rounded-full"
                      onChange={
                        user?.role === RoleEnum.SUPERADMIN
                          ? () => activate(post_bot.id)
                          : undefined
                      }
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-nowrap gap-1">
                      {post_bot.videos?.slice(0, 2).map((video: any) => (
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
                      {post_bot.videos?.length > 2 && (
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            +{post_bot.videos.length - 2}
                          </span>
                        </div>
                      )}
                      {post_bot.videos?.length === 0 && (
                        <span className="text-xs text-gray-400">
                          No video
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-nowrap gap-1">
                      {post_bot.images?.slice(0, 2).map((image: any, index: number) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.s3_urls?.imageUrl || image.public_urls.local_image_url}
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
                      {post_bot.images?.length > 2 && (
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            +{post_bot.images.length - 2}
                          </span>
                        </div>
                      )}
                      {post_bot.images?.length === 0 && (
                        <span className="text-xs text-gray-400">
                          No image
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(post_bot.createdAt).toLocaleDateString()}
                  </td>
                  <td className="flex justify-center gap-2 px-6 py-4">
                    {user?.role === RoleEnum.SUPERADMIN ? <BtnTranscodeComponent
                      post={post_bot as any}
                      reFetch={reFetch}
                    /> : null}
                    <Link
                      to={`/bot-posts/${post_bot.id}`}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 underline"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            totalItems={total}
            pageSize={limit}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
          />

          {filteredPosts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm
              ? "No posts found for this search"
              : "No posts available"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PostBotManagement = () => (
  <PostsBotProvider>
    <PostManagementInner />
  </PostsBotProvider>
);

// --- SendToWebApp component ---
function SendToWebApp() {
  const { data: plateforms } = UsePlateform();
  const [webappModalOpen, setWebappModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const sendToWebapp = async () => {
    if (selectedIds.length === 0)
      return toast.error("Select at least one platform");
    setLoading(true);
    try {
      await webAppPlateform(selectedIds);
      toast.success("Envoyé avec succès vers le WebApp !");
      setWebappModalOpen(false);
      setSelectedIds([]);
    } catch (err) {
      toast.error("Erreur lors de l'envoi vers WebApp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <dialog className={`modal ${webappModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box max-w-lg">
          <h3 className="font-bold text-lg">Select platforms to send</h3>
          <div className="max-h-60 overflow-auto mt-3">
            {plateforms?.map((p: any) => (
              <label
                key={p.id}
                className="flex items-center gap-3 p-2 border-b"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => toggle(p.id)}
                  className="checkbox"
                />
                <span>{p.name}</span>
              </label>
            ))}
          </div>
          <div className="modal-action">
            <button
              className="btn btn-outline"
              onClick={() => setWebappModalOpen(false)}
            >
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={sendToWebapp}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default PostBotManagement;
