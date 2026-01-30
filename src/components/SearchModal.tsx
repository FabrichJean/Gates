import { useEffect, useState } from "react";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import type { TVideo } from "../hooks/useVideos";
import { useNavigate } from "react-router-dom";
import { cdnS3 } from "../utils/cdn";

type SearchModalProps = {
  scope?: "videos" | "bot";
};

export default function SearchModal({ scope = "videos" }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<TVideo[]>([]);

  const nav = useNavigate();

  // Debounce pour limiter les requêtes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query) {
        setVideos([]);
        return;
      }
      const endpoint = scope === "bot" ? "bot-videos" : "videos";
      fetch(`${apiURL}/${endpoint}?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
        .then((res) => res.json())
        .then((d) => setVideos(d.videos || []))
        .catch(console.error);
    }, 300); // 300ms après la dernière frappe
    return () => clearTimeout(timer);
  }, [query, scope]);

  // Raccourci ⌘K pour ouvrir le modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const modal = document.getElementById(
          "search_modal_45"
        ) as HTMLDialogElement;
        modal?.showModal();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <dialog id="search_modal_45" className="modal">
      <div className="modal-box w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300">
        {/* Input de recherche */}
        <label className="input input-lg lg:input-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 sticky top-0 z-10 mb-2 w-full rounded-none border-0 border-b shadow-none focus-within:shadow-none focus-within:outline-none lg:px-6 flex items-center gap-2 transition-colors duration-300">
          <svg
            className="size-5 shrink-0 opacity-30 text-gray-500 dark:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
          >
            <g fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.96544 11.0261C9.13578 11.6382 8.11014 12 7 12C4.23858 12 2 9.76142 2 7C2 4.23858 4.23858 2 7 2C9.76142 2 12 4.23858 12 7C12 8.11014 11.6382 9.13578 11.0261 9.96544L13.7803 12.7197C14.0732 13.0126 14.0732 13.4874 13.7803 13.7803C13.4874 14.0732 13.0126 14.0732 12.7197 13.7803L9.96544 11.0261ZM10.5 7C10.5 8.933 8.933 10.5 7 10.5C5.067 10.5 3.5 8.933 3.5 7C3.5 5.067 5.067 3.5 7 3.5C8.933 3.5 10.5 5.067 10.5 7Z"
                fill="currentColor"
              />
            </g>
          </svg>
          <input
            id="search-input"
            type="text"
            autoComplete="off"
            placeholder="Type to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
          />
          {videos.length > 0 && (
            <span className="badge badge-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700">
              {videos.length} results
            </span>
          )}
        </label>

        {/* Liste des vidéos */}
        <ul className="mt-2 max-h-60 overflow-y-auto">
          {videos.map((v) => (
            <li
              key={v.id}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white rounded cursor-pointer transition-colors duration-300 text-gray-700 dark:text-gray-300"
              onClick={() => {
                const modal = document.getElementById(
                  "search_modal_45"
                ) as HTMLDialogElement;
                modal?.close();
                const base = scope === "bot" ? "/bot-videos/" : "/videos/";
                nav(base + v.id);
              }}
            >
              {v.cover && (
                <img
                  src={cdnS3(v.s3_urls.coverUrl) || v.public_urls.cover_url}
                  alt={v.ref}
                  className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-600"
                />
              )}
              <span>{v.ref}</span>
            </li>
          ))}
        </ul>

        <div className="flex gap-2 justify-between w-full modal-action">
          <span className="py-2 text-sm opacity-50 text-center text-gray-500 dark:text-gray-400">
            ESC to exit
          </span>
          <form method="dialog">
            <button className="btn bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
