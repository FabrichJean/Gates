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
            className="relative bg-white/90 rounded-3xl p-6 flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-2xl border-2 border-transparent hover:border-blue-400"
            style={{
              backdropFilter: 'blur(8px)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            }}
          >
            <div className="w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg transform transition-transform duration-500 hover:scale-105">
              <img
                src={creator.avatar ?? ""}
                alt={creator.name}
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
              {creator.name}
            </h2>

            <p className="text-sm text-gray-600 mb-2">
              Ajouté le : {new Date(creator.createdAt).toLocaleDateString()}
            </p>

            {creator.description && (
              <p className="text-sm text-gray-700 leading-relaxed">
                {creator.description}
              </p>
            )}
          </div>
        
  )

}
