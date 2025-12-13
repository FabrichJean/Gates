import { MdOutlineVerifiedUser } from "react-icons/md";
import { Link } from "react-router-dom";

export interface Creator {
  id: number;
  name: string;
  gender: string | null;
  avatar: string | null;
  description: string | null;
  createdAt: string;
  highestNFTPrice?: string;
  totalSales?: string;
  followers?: number;
  need_vip?: boolean;
}

export default function CreatorList({
  creators,
  isLoading,
}: {
  creators: Creator[];
  onEdit: (c: Creator) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}) {
  // Répartir les créateurs en 3 lignes
  const rows = [[], [], []] as Creator[][];
  creators.forEach((creator, index) => {
    rows[index % 3].push(creator);
  });

  if(isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-10">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col gap-2 items-center w-full overflow-x-auto overflow-y-visible pb-10">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-col md:flex-row gap-2 w-full">
            {row.map((creator) => (
              <div
                key={creator.id}
                className="w-full md:w-max h-[8rem] bg-white rounded-lg p-6 flex flex-col items-start transition-all hover:shadow-lg hover:-translate-y-1 border border-gray-200"
                style={{ backdropFilter: "blur(6px)" }}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                    <img
                      src={creator.avatar ?? ""}
                      alt={creator.name}
                      className="min-w-full h-auto object-cover"
                    />
                  </div>

                  <div className="flex-1">
                   <Link to={`/creators/${creator.id}`} className="text-lg font-semibold text-gray-900 hover:underline text-nowrap">
                      {creator.name}
                      {creator.need_vip && <MdOutlineVerifiedUser className="inline ml-2 text-blue-500" />}
                    </Link>
                    <p className="text-sm text-gray-500 text-nowrap">
                      {creator.followers ?? 0} followers
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
