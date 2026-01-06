import React from "react";

type Variant = "category" | "subcat" | "tag" | "creator";

interface Props {
  id?: number;
  name: string;
  variant?: Variant;
  linked?: boolean; // already linked
  onAdd?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  styleType?: "card" | "pill"; // pill used for tags
}

export default function RelationListItem({
  id,
  name,
  variant = "category",
  linked = false,
  onAdd,
  onRemove,
  disabled = false,
  styleType = "card",
}: Props) {
  const renderAction = () => {
    if (linked) {
      return (
        <button className="px-3 py-1 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed">
          Linked
        </button>
      );
    }

    if (onAdd) {
      return (
        <button
          onClick={onAdd}
          className="px-3 py-1 rounded-md text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm transition"
        >
          Add
        </button>
      );
    }

    if (onRemove) {
      return (
        <button
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${name}`}
          className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </button>
      );
    }

    return null;
  };

  if (styleType === "pill" || variant === "tag") {
    return (
      <span className="bg-yellow-100 px-3 py-1 rounded-full flex items-center gap-3">
        <span className="text-sm text-gray-800 dark:text-gray-100">#{name}</span>
        {onRemove && (
          <button onClick={onRemove} className="text-red-500" aria-label={`Remove ${name}`}>
            ✕
          </button>
        )}
      </span>
    );
  }

  // default card style
  return (
    <div className="flex justify-between items-center py-3 px-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full border border-yellow-500 dark:border-gray-700 bg-yellow-400 dark:bg-gray-800 shadow ring-2 ring-white dark:ring-gray-900" />
        <span className="font-medium">{name}</span>
      </div>
      <div>{renderAction()}</div>
    </div>
  );
}
