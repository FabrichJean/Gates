import React, { useEffect, useRef, useState } from 'react';
import UseCreators, { type Creator } from '../hooks/useCreators';

interface Props {
  /** value can be a free-text name or a Creator object for preselection */
  value?: string | null;
  onChange?: (v: string | null) => void;
  /** called when a creator from the list is explicitly selected */
  onSelect: (creator: Creator | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CreatorAutoComplete = ({ value, onChange, onSelect, placeholder, disabled }: Props) => {
  const { data: creators } = UseCreators();
  const [query, setQuery] = useState<string>(value ?? '');
  const [filtered, setFiltered] = useState<Creator[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // keep query in sync when parent passes a new value (string or Creator)
  useEffect(() => {
    if (!value) setQuery('');
    else if (typeof value === 'string') setQuery(value);
    else setQuery((value as Creator).name || '');
  }, [value]);

  useEffect(() => {
    const list = creators || [];
    const q = query?.trim().toLowerCase();
    if (!q) setFiltered(list.slice(0, 20));
    else setFiltered(list.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 30));
  }, [creators, query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const handleSelect = (c: Creator) => {
    setQuery(c.name);
    // when a creator is selected, notify both callbacks: string value and object selection
    onChange?.(c.name);
    onSelect?.(c);
    setOpen(false);
  };

  // when query is cleared, notify that no creator is selected
  useEffect(() => {
    if (!query) {
      onSelect?.(null);
    }
  }, [query, onSelect]);

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); onChange?.(e.target.value); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || 'Creator name (optional)'}
        disabled={disabled}
        className={`w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2 focus:ring-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none transition-all duration-200 ${disabled ? 'opacity-60' : ''}`}
      />

      {open && filtered.length > 0 && (
        <ul className="absolute z-40 w-full text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md mt-1 max-h-56 overflow-y-auto shadow-lg">
          {filtered.map((c) => (
            <li
              key={c.id}
              onClick={() => handleSelect(c)}
              className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                {c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No</div>}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{c.name}</div>
                {c.gender && <div className="text-xs text-gray-500">{c.gender}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CreatorAutoComplete;
