import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { getToken } from "../utils/storage";

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  isValidated: boolean;
  isDeleted: boolean;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // if (!token) {
  //   toast.error("Utilisateur non authentifié");
  //   return null;
  // }

  // console.log("Auth token:", token);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Utilisateur non authentifié");
        return;
      }
      const res = await axios.get("http://localhost:3000/api/v1/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err: any) {
      console.error("Fetch users error:", err);
      toast.error(err.response?.data?.message || "Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p className="text-center mt-8">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <span>Users</span>
          </div>
        </h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="🔍 Search ..."
            className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      <table className="min-w-full divide-y divide-gray-200 overflow-x-auto">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deleted
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((u) => (
          <tr key={u.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/150?img=1" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {u.username}
                  </div>
                  <div className="text-sm text-gray-500">
                    {u.email}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {u.isValidated ? "Yes" : "No"}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {u.role}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {u.isDeleted ? "Oui" : "Non"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap  text-sm font-medium">
              <button className="ml-2 text-gray-500 hover:text-gray-700" title="Options">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </button>
            </td>
          </tr>
          ))}
          {/* More rows... */}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
