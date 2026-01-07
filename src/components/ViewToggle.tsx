// components/ViewToggle.tsx
import { Squares2X2Icon, ListBulletIcon } from "@heroicons/react/24/outline";

type Props = {
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
};

export default function ViewToggle({ view, setView }: Props) {
  return (
    <div className="inline-flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      <button
        aria-label="Grille"
        onClick={() => setView("grid")}
        className={`rounded-md p-1.5 ${
          view === "grid"
            ? "bg-white shadow dark:bg-gray-700"
            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        }`}
      >
        <Squares2X2Icon className="h-5 w-5" />
      </button>
      <button
        aria-label="Liste"
        onClick={() => setView("list")}
        className={`rounded-md p-1.5 ${
          view === "list"
            ? "bg-white shadow dark:bg-gray-700"
            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        }`}
      >
        <ListBulletIcon className="h-5 w-5" />
      </button>
    </div>
  );
}