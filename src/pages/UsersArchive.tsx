import { useState } from "react";
import { useUsers } from "../hooks/useAuth";
import { getToken } from "../utils/storage";
import toast from "react-hot-toast";
import { validateUserApi } from "../api/auth";

const UsersArchives = () => {
  const [search, setSearch] = useState("");
  const { data, reFetch } = useUsers(search, { isDeleted: 1 });

  const handleValidate = async (userId: number) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("Unauthenticated user");
        return;
      }
      await validateUserApi(userId);
      toast.success(`User ${userId} validated !`);
      reFetch();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Fetch users error:", err);
      toast.error(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* ✅ Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            <div className="flex items-center gap-2">
              <span>User Archive</span>
            </div>
          </h1>

          {/* ✅ Barre de recherche */}
          <div className="flex items-center justify-center md:justify-end w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="🔍 Search ..."
              className="border border-gray-300 outline-none rounded-lg px-3 py-2 w-full sm:w-64 text-sm"
            />
          </div>
        </header>

        {/* ✅ Table responsive */}
        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Infos
                </th>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={`https://api.dicebear.com/9.x/croodles/svg?seed=${u.username}`}
                          alt={u.username}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {u.username}
                        </div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.role}
                  </td>

                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <button
                      onClick={() => handleValidate(u.id)}
                      className="block text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-lg cursor-pointer transition"
                    >
                      unblock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ Divider visuel */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        {/* ✅ Message si vide */}
        {data.length === 0 && (
          <div className="text-center mt-6">
            <img
              src="img static/pngtree-data-empty-vector-png-image_15213862.png"
              alt="No users"
              className="mx-auto w-32 h-32 mb-4"
            />
            <p className="text-gray-500 text-sm">
              No registered users found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersArchives;
