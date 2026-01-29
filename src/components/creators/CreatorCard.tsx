import { Pencil, Trash2 } from 'lucide-react';
import type { Creator } from './CreatorList';

export default function CreatorCard({ creator, onEdit, onDelete, isLoading }: {
  creator: Creator;
  onEdit: (c: Creator) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}) {
  return (
    <div
      key={creator.id}
      className="relative bg-white/5 dark:bg-black/20 rounded-2xl p-4 flex flex-col items-center text-center
                 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                 border border-white/10 dark:border-white/5
                 backdrop-blur-md shadow-lg shadow-black/20 hover:shadow-black/30"
    >
      {/* Avatar */}
      <div className="w-20 h-20 mb-3 rounded-full overflow-hidden border-2 border-white/20 shadow-md">
        <img
          src={creator.avatar ?? ""}
          alt={creator.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Nom */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
        {creator.name}
      </h2>

      {/* Date */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {new Date(creator.createdAt).toLocaleDateString()}
      </p>

      {/* Description tronquée */}
      {creator.description && (
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug mt-2 line-clamp-2">
          {creator.description}
        </p>
      )}

      {/* Actions rapides au survol */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(creator)}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-700 dark:text-gray-300"
          aria-label="Modifier"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDelete(creator.id)}
          className="p-1.5 rounded-full bg-white/10 hover:bg-rose-500/20 text-rose-600"
          aria-label="Supprimer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}