import React from "react";
import UsePlateform, { type Plateform } from "../hooks/usePlateform";

interface PlateformAutoCompleteProps {
  value: Plateform | null;
  onSelect: (p: Plateform | null) => void;
}

const PlateformAutoComplete: React.FC<PlateformAutoCompleteProps> = ({ value, onSelect }) => {
  const { data: plateforms, loading } = UsePlateform();
  const [input, setInput] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);

  const filtered = input.trim()
    ? plateforms?.filter((p) => p.name.toLowerCase().includes(input.trim().toLowerCase()))
    : plateforms;

  return (
    <div className="relative w-full max-w-xs">
      <input
        type="text"
        className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        placeholder="Rechercher une plateforme..."
        value={value ? value.name : input}
        onChange={e => {
          setInput(e.target.value);
          setShowDropdown(true);
          onSelect(null);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 120)}
        autoComplete="off"
      />
      {showDropdown && filtered && filtered.length > 0 && (
        <div className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-auto">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30"
              onMouseDown={() => {
                onSelect(p);
                setInput("");
                setShowDropdown(false);
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlateformAutoComplete;
