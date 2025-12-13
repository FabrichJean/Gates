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
  let rows = [[], [], []] as Creator[][];

  if (creators.length > 15) {
    creators.forEach((creator, index) => {
      rows[index % 3].push(creator);
    });
  } else {
    rows = [creators]
  }

  
  if (isLoading) {
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
                className="w-full md:w-max h-[8rem] bg-white dark:bg-slate-700 rounded-lg p-4 flex flex-col items-start transition-all hover:shadow-lg hover:-translate-y-1 border border-gray-200 dark:border-gray-500"
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
                    <Link to={`/creators/${creator.id}`} className="text-sm text-nowrap font-semibold text-teal-700 dark:text-white hover:underline">
                      {creator.name}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-nowrap">
                      {creator.followers ?? 0} followers
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-700">
                  {creator.highestNFTPrice && (
                    <p>
                      Highest NFT Price:{" "}
                      <span className="font-semibold text-green-600">
                        {creator.highestNFTPrice}
                      </span>
                    </p>
                  )}
                  {creator.totalSales && (
                    <p>
                      Total Sale Proceeds:{" "}
                      <span className="font-semibold text-purple-600">
                        {creator.totalSales}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
