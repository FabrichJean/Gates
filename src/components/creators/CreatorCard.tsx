import type UseCreators from '../../hooks/useCreators';

type Creator = Exclude<ReturnType<typeof UseCreators>['data'], undefined> extends Array<infer T> ? T : any;

export default function CreatorCard({ creator, onEdit, onDelete, isLoading }: {
  creator: Creator;
  onEdit: (c: Creator) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}) {
  return (
    <div className="w-max p-3 px-10 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
          {creator.avatar ? (
            <img src={creator.avatar || undefined} alt={creator.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500">No</div>
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">{creator.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-300">{(creator as any).gender || '-'}</div>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => onEdit(creator)}
              disabled={isLoading}
              className={`text-sm px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-100 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(creator.id)}
              disabled={isLoading}
              className={`text-sm px-2 py-1 rounded border border-red-200 text-red-600 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
