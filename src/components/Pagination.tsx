import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "../i18n";

interface PaginationProps {
  totalItems: number;
  pageSize?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  pageSize = 5,
  currentPage,
  onPageChange,
}) => {
  const { t } = useI18n();

  console.log({ totalItems, pageSize, currentPage });

  const [goToPage, setGoToPage] = useState("");
  const totalPages = Math.ceil(totalItems / pageSize);
  if (!totalItems || totalPages === 0) {
    return null;
  }

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handleGoToPage = () => {
    const page = parseInt(goToPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setGoToPage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGoToPage();
    }
  };

  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, currentPage - 3),
    Math.min(totalPages, currentPage + 2)
  );

  return (
    <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      {/* Info pages */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium text-gray-900 dark:text-gray-100">{totalItems}</span> {t("pagination.items")}
        <span className="mx-1">•</span>
        {t("pagination.page")} <span className="font-medium text-gray-900 dark:text-gray-100">{currentPage}</span> /{" "}
        <span className="font-medium text-gray-900 dark:text-gray-100">{totalPages}</span>
      </div>

      {/* Contrôles de pagination */}
      <div className="flex items-center gap-1">
        {/* ← Précédent */}
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Pages */}
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-8 h-8 px-2 rounded-md font-medium text-sm transition-colors duration-200 ${page === currentPage
                ? "bg-blue-600 text-white border border-blue-600"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
              }`}
          >
            {page}
          </button>
        ))}

        {/* → Suivant */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Aller à la page */}
        <div className="ml-3 flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("pagination.goto_placeholder")}
            className="w-14 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
          />
          <button
            onClick={handleGoToPage}
            disabled={!goToPage || parseInt(goToPage) < 1 || parseInt(goToPage) > totalPages}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded transition-colors duration-200 font-medium"
          >
            {t("pagination.go")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
