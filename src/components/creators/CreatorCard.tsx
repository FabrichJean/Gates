import { Link } from 'react-router-dom';
import type UseCreators from '../../hooks/useCreators';
import { useNavigate } from 'react-router-dom';
import type { Creator } from './CreatorList';

export default function CreatorCard({ creator, onEdit, onDelete, isLoading }: {
  creator: Creator;
  onEdit: (c: Creator) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}) {

  const navigate = useNavigate();
  const handleSwitch = (id: number) => () => {
    navigate(`/creators/${id}`);
  };

  // return (
  //   <div className="w-max p-3 px-10 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition">
  //     <div className="flex items-center gap-3">
  //       <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
  //         {creator.avatar ? (
  //           <img src={creator.avatar || undefined} alt={creator.name} className="w-full h-full object-cover" />
  //         ) : (
  //           <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500">No</div>
  //         )}
  //       </div>
  //       <div className="flex-1">
  //         <div className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-400 dark:hover:text-blue-400" onClick={handleSwitch(creator.id)}>{creator.name}</div>
  //         <div className="text-xs text-gray-500 dark:text-gray-300">{(creator as any).gender || '-'}</div>
  //         <div className="mt-2 flex items-center gap-2">
  //           <button
  //             onClick={() => onEdit(creator)}
  //             disabled={isLoading}
  //             className={`text-sm px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-100 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
  //           >
  //             Edit
  //           </button>
  //           <button
  //             onClick={() => onDelete(creator.id)}
  //             disabled={isLoading}
  //             className={`text-sm px-2 py-1 rounded border border-red-200 text-red-600 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
  //           >
  //             Delete
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );


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
