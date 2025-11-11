import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import type { PostTitle } from "../../hooks/usePost";

interface GetPostTitlesProps {
  postTitles: PostTitle[];
}

const GetPostTitles = ({ postTitles }: GetPostTitlesProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>();

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
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {postTitles?.find((t) => t.i18_language === selectedLanguage)?.title}
        </h4>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {
            postTitles?.find((t) => t.i18_language === selectedLanguage)
              ?.description
          }
        </p>
      </div>
    </div>
  );
};

export default GetPostTitles;
