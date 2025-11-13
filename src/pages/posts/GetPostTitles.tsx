import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { Eye } from "lucide-react";
import type { PostTitle } from "../../hooks/usePost";

interface GetPostTitlesProps {
  postTitles: PostTitle[];
}

const GetPostTitles = ({ postTitles }: GetPostTitlesProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>();
  const [open, setOpen] = useState(false);

  if (postTitles?.length === 0) {
    return null;
  }
  useEffect(() => {
    setSelectedLanguage(postTitles?.[0]?.i18_language);
  }, [postTitles]);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-4 mb-4">
        <Languages size={20} className="text-gray-700 dark:text-gray-300" />
        <div className="flex gap-2 flex-wrap">
          {postTitles?.map((item) => (
            <button
              key={item.i18_language}
              onClick={() => setSelectedLanguage(item.i18_language)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedLanguage === item.i18_language
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {item.language.name}
            </button>
          ))}
        </div>
      </div>
  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">
          {postTitles?.find((t) => t.i18_language === selectedLanguage)?.title ?? ''}
        </h4>
        <p
          className="text-gray-700 dark:text-gray-300 leading-relaxed"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          } as any}
        >
          {postTitles?.find((t) => t.i18_language === selectedLanguage)?.description ?? ''}
        </p>
        {/* Floating button to view full title & description */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Voir le titre complet"
          className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm hover:shadow-md transition-all"
        >
          <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          <span className="text-xs text-gray-700 dark:text-gray-300">see more</span>
        </button>
      </div>
      {/* Modal showing full title and description */}
      <dialog className={`modal ${open ? "modal-open" : ""}`}>
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-2">Full content</h3>
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">
              {(() => {
                const selectedPost = postTitles?.find((t) => t.i18_language === selectedLanguage);
                return selectedPost?.title ?? '';
              })()}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {(() => {
                const selectedPost = postTitles?.find((t) => t.i18_language === selectedLanguage);
                return selectedPost?.description ?? '';
              })()}
            </p>
          </div>
          <div className="modal-action">
            <button className="btn btn-outline" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default GetPostTitles;
