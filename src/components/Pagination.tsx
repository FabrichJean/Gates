import React, { useState } from "react";

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
  const [goToPage, setGoToPage] = useState("");
  const totalPages = Math.ceil(totalItems / pageSize);

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
    <div className="flex justify-end items-center gap-2 p-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700 transition-all duration-300">
      {/* ← Précédent */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-gray-500 dark:text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Pages */}
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-lg font-medium transition-all duration-300 ${
            page === currentPage
              ? "bg-gray-900 dark:bg-blue-600 text-white shadow-md"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          }`}
        >
          {page}
        </button>
      ))}

      {/* → Suivant */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-gray-500 dark:text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Info et Aller à la page */}
      <div className="ml-4 flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
          Page <span className="font-semibold text-gray-700 dark:text-gray-300">{currentPage}</span> /{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">{totalPages || null}</span>
        </span>
        
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Aller à..."
            className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
          />
          <button
            onClick={handleGoToPage}
            disabled={!goToPage || parseInt(goToPage) < 1 || parseInt(goToPage) > totalPages}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded transition-colors duration-200"
          >
            Aller
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
