import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getToken } from "../utils/storage";
import { apiURL } from "../constant";
import { useUsers } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { TiUserAddOutline } from 'react-icons/ti';
import UpdatePassword from "../components/UpdatePassword";

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

const Users = () => {
  const [search, setSearch] = useState('');
  const { data, reFetch } = useUsers(search);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Column filter state
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'name', label: 'Infos', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'role', label: 'Role', visible: true },
    { key: 'actions', label: 'Actions', visible: true },
  ]);

  const toggleColumn = (key: string) => {
    setColumns(prev => prev.map(col => col.key === key ? { ...col, visible: !col.visible } : col));
  };

  const toggleAllColumns = (visible: boolean) => setColumns(prev => prev.map(col => ({ ...col, visible })));

  const visibleColumns = columns.filter(c => c.visible);

  useEffect(() => { reFetch(); }, [search]);
  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchUsers = async () => reFetch();

  const handleValidate = async (userId: number) => {
    try {
      const token = getToken();
      if (!token) return toast.error("Unauthenticated user");
      await axios.put(`${apiURL}/auth/validate/${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`User ${userId} validated!`);
      fetchUsers();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    setOpenMenuId(null);
    try {
      const token = getToken();
      if (!token) return toast.error("Unauthenticated user");
      await axios.delete(`${apiURL}/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`User ${userId} deleted!`);
      fetchUsers();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-4 sm:p-6 lg:p-6">
      {/* ✅ HEADER RESPONSIVE */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-500 dark:text-gray-400 transition-colors duration-300 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6 text-blue-600 dark:text-blue-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15
              19.128v-.003c0-1.113-.285-2.16-.786-3.07M15
              19.128v.106A12.318 12.318 0 0 1 8.624
              21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375
              6.375 0 0 1 11.964-3.07M12
              6.375a3.375 3.375 0 1 1-6.75 0
              3.375 3.375 0 0 1 6.75 0Zm8.25
              2.25a2.625 2.625 0 1 1-5.25 0
              2.625 2.625 0 0 1 5.25 0Z"
            />
          </svg>
          <span>Users</span>
        </h1>

        {/* Controls: keep in one row even on mobile */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <Link
              to="/users/create"
              className="flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 font-medium text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Create user"
            >
              <TiUserAddOutline className="text-blue-400 dark:text-blue-300 size-4" />
            </Link>
            {/* make input shrinkable with flex-1 and min-w-0 */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="🔍 Search..."
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 outline-none rounded-lg px-3 py-2 w-full sm:w-64 ml-2 flex-1 min-w-0 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
            />

            {/* Column Filter Button */}
            <div className="relative ml-2">
              <button
                onClick={(e) => { e.stopPropagation(); setIsColumnMenuOpen(prev => !prev); }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-300"
              >
                <svg className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Columns
                <svg className={`w-4 h-4 ml-1 transition-transform text-gray-600 dark:text-gray-400 ${isColumnMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isColumnMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsColumnMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20 transition-colors duration-300">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span>Show columns</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">({visibleColumns.length}/{columns.length})</span>
                      </div>
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex space-x-2">
                        <button onClick={() => toggleAllColumns(true)} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300" disabled={visibleColumns.length === columns.length}>Tout</button>
                        <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
                        <button onClick={() => toggleAllColumns(false)} className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300" disabled={visibleColumns.length === 0}>Aucun</button>
                      </div>

                      {columns.map((column) => (
                        <div key={column.key} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                          <label className="flex items-center cursor-pointer">
                            <input type="checkbox" checked={column.visible} onChange={() => toggleColumn(column.key)} className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 bg-white dark:bg-gray-700" />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{column.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ✅ TABLE RESPONSIVE */}
      <div className="overflow-x-auto shadow-sm pb-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm sm:text-base">
          <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
            <tr>
              {visibleColumns.map((col) => (
                <th key={col.key} className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            {data?.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                {columns.find(c => c.key === 'name')?.visible && (
                  <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-600" src={`https://api.dicebear.com/9.x/croodles/svg?seed=${u.username}`} alt={u.username} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{u.username}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{u.email}</div>
                      </div>
                    </div>
                  </td>
                )}

                {columns.find(c => c.key === 'status')?.visible && (
                  <td className="px-4 sm:px-6 py-3 text-left">
                    {u.isValidated ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="green" className="w-5 h-5 text-green-600 dark:text-green-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75" />
                      </svg>
                    ) : (
                      <span className="text-pink-400 dark:text-pink-300 text-xs sm:text-sm">Pending</span>
                    )}
                  </td>
                )}

                {columns.find(c => c.key === 'role')?.visible && (
                  <td className="px-4 sm:px-6 py-3 text-gray-600 dark:text-gray-400 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300 ${u.role === "superadmin" ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200" : u.role === "admin" ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200" : "bg-green-100 dark:bg-green-400 text-green-700 dark:text-green-200"}`}>
                      {u.role}
                    </span>
                  </td>
                )}

                {columns.find(c => c.key === 'actions')?.visible && (
                  <td className="px-4 sm:px-6 py-3 relative text-right">
                    {u.role !== "superadmin" && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuId((prev) => (prev === u.id ? null : u.id)); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer transition-colors duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="5" cy="12" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="19" cy="12" r="2" />
                          </svg>
                        </button>

                        {openMenuId === u.id && (
                          <div className="absolute right-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg z-50 min-w-28 w-max transition-colors duration-300">
                            {!u.isValidated && (
                              <button onClick={() => handleValidate(u.id)} className="block w-full text-left px-4 cursor-pointer py-2 text-xs sm:text-sm hover:bg-green-50 dark:hover:bg-green-900 text-gray-700 dark:text-gray-300 transition-colors duration-300">Validate</button>
                            )}
                            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                            {/* @ts-ignore */}
                            <button className="block text-nowrap w-full text-left px-4 cursor-pointer py-2 text-xs sm:text-sm hover:bg-green-50 dark:hover:bg-green-900 text-gray-700 dark:text-gray-300 transition-colors duration-300" onClick={() => document.getElementById('modal_' + u.username).showModal()}>update password</button>
                            <button onClick={() => handleDelete(u.id)} className="block w-full text-left px-4 py-2 cursor-pointer text-xs sm:text-sm hover:bg-red-50 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors duration-300">block</button>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modales UpdatePassword - placées en dehors du tableau */}
      {data?.map((u: any) => (
        <UpdatePassword key={`modal-${u.id}`} u={u} />
      ))}
    </div>
  );
};

export default Users;
