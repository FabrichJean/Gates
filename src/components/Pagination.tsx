import React, { useEffect } from "react";

interface PaginationProps {
  totalItems: number;
  pageSize?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  storageKey?: string; // 👈 optionnel, utile si tu veux plusieurs paginations indépendantes
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  pageSize = 5,
  currentPage,
  onPageChange,
  storageKey = "current_page_videos", // 👈 clé par défaut
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  // ⏳ Restaurer la page sauvegardée au montage
  useEffect(() => {
    const savedPage = localStorage.getItem(storageKey);
    if (savedPage) {
      const pageNumber = Number(savedPage);
      if (!isNaN(pageNumber)) {
        onPageChange(pageNumber);
      }
    }
  }, []);

  // 💾 Sauvegarder la page actuelle à chaque changement
  useEffect(() => {
    localStorage.setItem(storageKey, currentPage.toString());
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
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

      {/* Info */}
      <span className="ml-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
        Page <span className="font-semibold text-gray-700 dark:text-gray-300">{currentPage}</span> /{" "}
        <span className="font-semibold text-gray-700 dark:text-gray-300">{totalPages || null}</span>
      </span>
    </div>
  );
};

export default Pagination;
