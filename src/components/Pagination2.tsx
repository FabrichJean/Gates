// components/Pagination.tsx
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

type Props = {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
};

export default function Pagination({ page, totalPages, onChange }: Props) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Précédent
      </button>

      <span className="text-gray-500 dark:text-gray-400">
        Page {page} / {totalPages}
      </span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Suivant
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}