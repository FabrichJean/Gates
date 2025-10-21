import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getToken } from "../utils/storage";
import { apiURL } from "../constant";
import { useUsers } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { TiUserAddOutline } from "react-icons/ti";

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
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-6">
      {/* ✅ HEADER RESPONSIVE */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-500 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6 text-blue-600"
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
              className="flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-200 bg-white/90 text-gray-800 font-medium text-sm hover:bg-blue-50 transition-all duration-200"
              aria-label="Create user"
            >
              <TiUserAddOutline className="text-blue-400 size-4" />
            </Link>
            {/* make input shrinkable with flex-1 and min-w-0 */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="🔍 Search..."
              className="border border-gray-300 outline-none rounded-lg px-3 py-2 w-full sm:w-64 ml-2 flex-1 min-w-0"
            />

            {/* Column Filter Button */}
            <div className="relative ml-2">
            <button
              onClick={(e) => { e.stopPropagation(); setIsColumnMenuOpen(prev => !prev); }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Columns
              <svg className={`w-4 h-4 ml-1 transition-transform ${isColumnMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isColumnMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsColumnMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 flex items-center justify-between">
                        <span>Show columns</span>
                      <span className="text-xs text-gray-400">({visibleColumns.length}/{columns.length})</span>
                    </div>
                    <div className="px-4 py-2 border-b border-gray-100 flex space-x-2">
                      <button onClick={() => toggleAllColumns(true)} className="text-xs text-blue-600 hover:text-blue-800" disabled={visibleColumns.length === columns.length}>Tout</button>
                      <span className="text-xs text-gray-300">|</span>
                      <button onClick={() => toggleAllColumns(false)} className="text-xs text-gray-600 hover:text-gray-800" disabled={visibleColumns.length === 0}>Aucun</button>
                    </div>

                    {columns.map((column) => (
                      <div key={column.key} className="px-4 py-2 hover:bg-gray-50">
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" checked={column.visible} onChange={() => toggleColumn(column.key)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                          <span className="ml-2 text-sm text-gray-700">{column.label}</span>
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
      <div className="overflow-x-auto shadow-sm pb-20 rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
          <thead className="bg-gray-50">
            <tr>
              {visibleColumns.map((col) => (
                <th key={col.key} className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                {columns.find(c => c.key === 'name')?.visible && (
                  <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img className="h-10 w-10 rounded-full" src={`https://api.dicebear.com/9.x/croodles/svg?seed=${u.username}`} alt={u.username} />
                      <div>
                        <div className="font-medium text-gray-900">{u.username}</div>
                        <div className="text-gray-500 text-xs sm:text-sm">{u.email}</div>
                      </div>
                    </div>
                  </td>
                )}

                {columns.find(c => c.key === 'status')?.visible && (
                  <td className="px-4 sm:px-6 py-3 text-left">
                    {u.isValidated ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="green" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75" />
                      </svg>
                    ) : (
                      <span className="text-pink-400 text-xs sm:text-sm">Pending</span>
                    )}
                  </td>
                )}

                {columns.find(c => c.key === 'role')?.visible && (
                  <td className="px-4 sm:px-6 py-3 text-gray-600 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${u.role === "superadmin" ? "bg-purple-100 text-purple-700" : u.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {u.role}
                    </span>
                  </td>
                )}

                {columns.find(c => c.key === 'actions')?.visible && (
                  <td className="px-4 sm:px-6 py-3 relative text-right">
                    {u.role !== "superadmin" && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuId((prev) => (prev === u.id ? null : u.id)); }} className="text-gray-500 hover:text-gray-700 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="5" cy="12" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="19" cy="12" r="2" />
                          </svg>
                        </button>

                        {openMenuId === u.id && (
                          <div className="absolute right-2  bg-white  border border-gray-200 shadow-lg rounded-lg z-50 w-28">
                            {!u.isValidated && (
                              <button onClick={() => handleValidate(u.id)} className="block w-full text-left px-4 cursor-pointer py-2 text-xs sm:text-sm hover:bg-green-50 text-gray-700">Validate</button>
                            )}
                            <button onClick={() => handleDelete(u.id)} className="block w-full text-left px-4 py-2 cursor-pointer text-xs sm:text-sm hover:bg-red-50 text-red-600">Delete</button>
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
    </div>
  );
};

export default Users;
