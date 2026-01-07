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
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-green-100 text-green-700 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
            </svg>
            Linked
          </span>
        </div>
      );
    }

    if (onAdd) {
      return (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add</span>
        </button>
      );
    }

    if (onRemove) {
      return (
        <button
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${name}`}
          className="inline-flex items-center justify-center w-10 h-10 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      );
    }

    return null;
  };

  if (styleType === "pill" || variant === "tag") {
    return (
      <span className="inline-flex items-center gap-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-full text-sm">
        <span className="font-medium text-sm">#{name}</span>
        {onRemove && (
          <button onClick={onRemove} className="text-red-500 hover:text-red-600" aria-label={`Remove ${name}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </span>
    );
  }

  // default card style
  return (
    <div className="flex justify-between items-center gap-4 py-3 px-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center text-indigo-700 dark:text-indigo-200 font-semibold">
          {name?.charAt(0)?.toUpperCase() ?? "#"}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{name}</div>
          {variant && <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{variant}</div>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {renderAction()}
      </div>
    </div>
  );
}
