import { Link } from 'react-router-dom';
import type UseCreators from '../../hooks/useCreators';
import { useNavigate } from 'react-router-dom';
import { MdVerified } from 'react-icons/md';

type Creator = Exclude<ReturnType<typeof UseCreators>['data'], undefined> extends Array<infer T> ? T : any;

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

  return (
    <div className="w-max p-3 px-10 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
          {creator.avatar ? (
            <>
              <img src={creator.avatar || undefined} alt={creator.name} className="w-full h-full object-cover" />
              <MdVerified className="ml-1 text-blue-500 w-4 h-4 group-hover:scale-125 transition-transform duration-300" />
            </>
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500">No</div>
          )}
        </div>
        <div className="flex-1">
          <Link className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-400 dark:hover:text-blue-400" to={`/creators/${creator.id}`}>{creator.name}</Link>
          <div className="text-xs text-gray-500 dark:text-gray-300">{(creator as any).gender || '-'}</div>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => onEdit(creator)}
              disabled={isLoading}
              className={`text-sm px-2 py-1 text-teal-400 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(creator.id)}
              disabled={isLoading}
              className={`text-sm px-2 py-1 text-red-500  ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
