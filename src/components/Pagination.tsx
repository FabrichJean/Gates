import React from "react";

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
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  // On limite l’affichage des pages visibles
  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, currentPage - 3),
    Math.min(totalPages, currentPage + 2)
  );

  return (
    <div className="flex justify-end items-center gap-2 p-4 bg-white border-t border-gray-200">
      {/* Précédent */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-gray-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Pages */}
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-lg font-medium transition ${
            page === currentPage
              ? "bg-gray-900 text-white shadow-md"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Suivant */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-gray-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Info total */}
      <span className="ml-4 text-sm text-gray-500">
        Page <span className="font-semibold text-gray-700">{currentPage}</span> /{" "}
        <span className="font-semibold text-gray-700">{totalPages}</span>
      </span>
    </div>
  );
};

export default Pagination;
