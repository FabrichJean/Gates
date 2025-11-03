import { useEffect, useState } from "react";
import { useUsers } from "../hooks/useAuth";
import { getToken } from "../utils/storage";
import toast from "react-hot-toast";
import { apiURL } from "../constant";
import axios from "axios";

const UsersArchives = () => {
  const [search, setSearch] = useState("");
  const { data, reFetch } = useUsers(search, { isDeleted: 1 });

  useEffect(() => {
    reFetch();
  }, [search]);

  const fetchUsers = async () => {
    reFetch();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleValidate = async (userId: number) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("Unauthenticated user");
        return;
      }
      await axios.put(apiURL + "/auth/validate/" + userId, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`User ${userId} validated !`);
      fetchUsers();
    } catch (err: any) {
      console.error("Fetch users error:", err);
      toast.error(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-4 sm:p-6 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* ✅ Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">
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
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 outline-none rounded-lg px-3 py-2 w-full sm:w-64 text-sm focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
            />
          </div>
        </header>

        {/* ✅ Table responsive */}
        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
              <tr>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Infos
                </th>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
              {data.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-600"
                          src={`https://api.dicebear.com/9.x/croodles/svg?seed=${u.username}`}
                          alt={u.username}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {u.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {u.role}
                  </td>

                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <button
                      onClick={() => handleValidate(u.id)}
                      className="block text-left px-3 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg cursor-pointer transition-colors duration-300"
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
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>

        {/* ✅ Message si vide */}
        {data.length === 0 && (
          <div className="text-center mt-6">
            <img
              src="img static/pngtree-data-empty-vector-png-image_15213862.png"
              alt="No users"
              className="mx-auto w-32 h-32 mb-4 opacity-70 dark:opacity-50"
            />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No registered users found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersArchives;
