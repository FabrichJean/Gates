import React, { useEffect, useRef, useState } from 'react';

interface RomanContentEditorProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}

const RomanContentEditor: React.FC<RomanContentEditorProps> = ({
  value,
  onChange,
  className = '',
  rows = 12,
  placeholder = '',
  required = false,
}) => {
  const [local, setLocal] = useState<string>(value || '');
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setLocal(value || '');
  }, [value]);

  const commit = (v: string) => {
    setLocal(v);
    onChange(v);
  };

  const wrapSelection = (prefix: string, suffix?: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const s = local.slice(start, end);
    const realSuffix = suffix === undefined ? prefix : suffix;
    const newVal = local.slice(0, start) + prefix + s + realSuffix + local.slice(end);
    commit(newVal);

    // restore selection around the wrapped text
    const newStart = start + prefix.length;
    const newEnd = newStart + s.length;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
    });
  };

  const insertAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    wrapSelection(`[align=${align}]`, `[/align]`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          title="Gras"
          onClick={() => wrapSelection('**')}
          className="px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
        >
          Gras
        </button>

        <button
          type="button"
          title="Italique"
          onClick={() => wrapSelection('*')}
          className="px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
        >
          Italique
        </button>

        <div className="relative">
          <div className="inline-block">
            <button className="px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm">Alignement</button>
          </div>
          <div className="absolute left-0 mt-8 hidden group-hover:block">
            <div className="bg-white dark:bg-gray-800 shadow rounded p-1 flex flex-col">
              <button type="button" onClick={() => insertAlignment('left')} className="px-2 py-1 text-left text-sm">Gauche</button>
              <button type="button" onClick={() => insertAlignment('center')} className="px-2 py-1 text-left text-sm">Centre</button>
              <button type="button" onClick={() => insertAlignment('right')} className="px-2 py-1 text-left text-sm">Droite</button>
              <button type="button" onClick={() => insertAlignment('justify')} className="px-2 py-1 text-left text-sm">Justifier</button>
            </div>
          </div>
        </div>

        <button
          type="button"
          title="Surligne"
          onClick={() => wrapSelection('==')}
          className="px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
        >
          Surligne
        </button>

        <button
          type="button"
          title="Clear formatting (remove simple markers)"
          onClick={() => {
            // simple cleanup: remove common markers
            const cleaned = local.replace(/\*\*|\*|==|\[align=[^\]]+\]|\[\/align\]/g, '');
            commit(cleaned);
          }}
          className="ml-auto px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm text-red-600"
        >
          Effacer
        </button>
      </div>

      <textarea
        ref={taRef}
        rows={rows}
        value={local}
        placeholder={placeholder}
        onChange={(e) => commit(e.target.value)}
        className={`${className} w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
        required={required}
      />
    </div>
  );
};

export default RomanContentEditor;
