import React from 'react';
import clsx from 'clsx';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

type Relation = { id: number; name: string; relationId?: number | null };

type Props = {
  title: string;
  relations: Relation[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onClear: () => void;
  addLabel?: string;
  removeLabel?: string;
};

export const RelationSection: React.FC<Props> = ({
  title,
  relations,
  onAdd,
  onRemove,
  onClear,
  addLabel = 'Link',
  removeLabel = 'Clear all',
}) => (
  <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-cardLight dark:bg-cardDark p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <div className="flex items-center gap-2">
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primaryHover text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          {addLabel}
        </button>
        {relations.length > 0 && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-danger text-danger hover:bg-danger hover:text-white text-sm"
          >
            <TrashIcon className="w-4 h-4" />
            {removeLabel}
          </button>
        )}
      </div>
    </div>

    {relations.length === 0 ? (
      <p className="text-sm text-muted">No items linked</p>
    ) : (
      <ul className="space-y-2">
        {relations.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <span className="text-gray-800 dark:text-gray-100">{r.name}</span>
            <button
              onClick={() => onRemove(r.relationId ?? r.id)}
              className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-danger"
              aria-label={`Remove ${r.name}`}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    )}
  </section>
);