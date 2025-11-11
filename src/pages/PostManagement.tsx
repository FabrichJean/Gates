import { FilePlus, Eye, Columns, MoreVertical, SendIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import UsePlateform from "../hooks/usePlateform";
import { webApp } from "../api/videos";
import toast from "react-hot-toast";
import { getPosts } from "../api/posts";
import type { Post, PostsResponse } from "../types/post";
import Loader from "../components/Loader";
import { webAppPlateform } from "../api/plateforms";
import BtnTranscodeComponent from "../components/Post/BtnTranscodeComponent";

const PostManagement = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts();
      const data: PostsResponse = response.data;
      setPosts(data.posts);
    } catch (err) {
      setError("Erreur lors du chargement des posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.postCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.postSubCategory.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      post.plateform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(post.createdAt)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-2">Erreur</p>
          <p>{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <div className="">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-blue-100">
          Post Management
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
              <button className="flex items-center justify-center gap-2 p-2.5 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 font-medium text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition-all">
                <Columns className="w-5 h-auto text-blue-400 dark:text-blue-300" />
              </button>
              <SendToWebApp />
            </div>
            {/* <div className="flex items-center gap-3">
              Send to WebApp button with platform selection modal
              <SendToWebApp />
            </div> */}
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
      {/* tableau post videos */}
      <div className="w-full mt-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left border-t-3 border-blue-500 dark:border-blue-500 rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-blue-500/5 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Catégorie
                </th>
                <th scope="col" className="px-6 py-3">
                  Sous-catégorie
                </th>
                <th scope="col" className="px-6 py-3">
                  Plateforme
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
                <th scope="col" className="px-6 py-3">
                  Transcode
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {post.id}
                  </th>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100/50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
                      {post.postCategory.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100/50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
                      {post.postSubCategory.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                      {post.plateform.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {post.videos?.slice(0, 2).map((video) => (
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
                        <span className="text-xs text-gray-400">
                          Aucune vidéo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {post.images?.slice(0, 2).map((image, index) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.public_urls.local_image_url}
                            alt={`Image ${index + 1}`}
                            className="w-8 h-8 object-cover rounded"
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
                        <span className="text-xs text-gray-400">
                          Aucune image
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{formatDate(post.createdAt)}</td>
                  <td className="px-6 py-4">
                    <BtnTranscodeComponent
                      post={post as any}
                      reFetch={fetchPosts}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === post.id ? null : post.id)
                        }
                        className="p-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === post.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                            <Link
                              to={`/post/${post.id}`}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <Eye className="w-4 h-4" />
                              <span>Details</span>
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPosts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Aucun post trouvé pour cette recherche"
                : "Aucun post disponible"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
      <button
        disabled={loading}
        onClick={() => setWebappModalOpen(true)}
        className="p-2.5 rounded-lg cursor-pointer flex items-center justify-center gap-2 px-3.5 py-2 text-nowrap font-medium text-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
      >
        <SendIcon className="text-blue-400 dark:text-blue-300" />
        <span className="md:inline hidden text-gray-600 dark:text-gray-400">
          send to webApp
        </span>
      </button>

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

export default PostManagement;
