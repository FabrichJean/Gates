import { useEffect, useRef, useState, useMemo } from "react";
import UseCreators from "../hooks/useCreators";
import type { Creator } from "./creators/CreatorList";
import { Shuffle } from "lucide-react";
import { cdnS3 } from "../utils/cdn";

interface Props {
  /** value can be a free-text name or a Creator object for preselection */
  value?: string | null;
  onChange?: (v: string | null) => void;
  /** called when a creator from the list is explicitly selected */
  onSelect: (creator: Creator | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** whether the current creator is a default/auto-selected one */
  isDefault?: boolean;
  /** whether to automatically suggest a random creator when value is null/undefined */
  autoSuggest?: boolean;
}

const CreatorAutoComplete = ({
  value,
  onChange,
  onSelect,
  placeholder,
  disabled,
  isDefault,
  autoSuggest,
}: Props) => {
  const { data: creators } = UseCreators({ isAll: true });
  const [query, setQuery] = useState<string>(value ?? "");
  const [open, setOpen] = useState(false);
  const [isSuggested, setIsSuggested] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const hasAutoSuggested = useRef(false);
  const userCleared = useRef(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // keep query in sync when parent passes a new value (string or Creator)
  useEffect(() => {
    if (!value) {
      setQuery("");
      hasAutoSuggested.current = false; // Reset when value becomes null
      userCleared.current = false; // Reset when parent sets to null
    } else if (typeof value === "string") setQuery(value);
    else setQuery((value as Creator).name || "");
  }, [value]);

  const filtered = useMemo(() => {
    const list = creators || [];
    const q = query?.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q));
  }, [creators, query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleSelect = (c: Creator) => {
    setQuery(c.name);
    setSelectedCreator(c);
    // when a creator is selected, notify both callbacks: string value and object selection
    onChange?.(c.name);
    onSelect?.(c);
    setOpen(false);
    setIsSuggested(false); // Reset suggested flag on manual selection
  };

  const handleSuggestRandom = () => {
    const list = creators.creators || [];
    if (list.length === 0) return;
    const randomIndex = Math.floor(Math.random() * list.length);
    const randomCreator = list[randomIndex];
    handleSelect(randomCreator);
    setIsSuggested(true); // Mark as suggested
  };

  // when query is cleared, notify that no creator is selected
  useEffect(() => {
    if (!query) {
      setSelectedCreator(null);
      onSelect?.(null);
    }
  }, [query, onSelect]);

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="flex items-center gap-2 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-400 dark:focus-within:ring-blue-500 transition-all duration-200">
            {selectedCreator && (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                {selectedCreator.avatar ? (
                  <img
                    src={cdnS3(selectedCreator.avatar)}
                    alt={selectedCreator.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                    No
                  </div>
                )}
              </div>
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => {
                const newValue = e.target.value;
                setQuery(newValue);
                setOpen(true);
                onChange?.(newValue);
                setIsSuggested(false);
                if (
                  newValue === "" ||
                  newValue === null ||
                  newValue === undefined
                ) {
                  userCleared.current = true;
                }
              }}
              onFocus={() => {
                setOpen(true);
                // Auto-suggest when focusing on empty input
                if (
                  !query &&
                  autoSuggest &&
                  creators &&
                  creators.creators.length > 0 &&
                  !hasAutoSuggested.current &&
                  !userCleared.current
                ) {
                  handleSuggestRandom();
                  hasAutoSuggested.current = true;
                }
              }}
              placeholder={placeholder || "Creator name (optional)"}
              disabled={disabled}
              className={`flex-1 bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none ${disabled ? "opacity-60" : ""}`}
            />
            {(isDefault || isSuggested) && (
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                {isDefault ? "Par défaut" : "Suggéré"}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSuggestRandom}
          disabled={disabled}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Suggest random creator"
        >
          <Shuffle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-40 w-full text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md mt-1 max-h-56 overflow-y-auto shadow-lg">
          {filtered.map((c) => (
            <li
              key={c.id}
              onClick={() => handleSelect(c)}
              className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                {c.avatar ? (
                  <img
                    src={cdnS3(c.avatar)}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    No
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{c.name}</div>
                {c.gender && (
                  <div className="text-xs text-gray-500">{c.gender}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CreatorAutoComplete;
