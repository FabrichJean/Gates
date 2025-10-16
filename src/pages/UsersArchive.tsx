
import { useEffect, useState } from "react";
import { useUsers } from "../hooks/useAuth";
import { getToken } from "../utils/storage";
import toast from "react-hot-toast";
import { apiURL } from "../constant";
import axios from "axios";

const UsersArchives = () => {
    const [search, setSearch] = useState('')
    const { data, reFetch } = useUsers(search, { isDeleted: 1 })

    useEffect(() => {
        reFetch()
    }, [search])

    const fetchUsers = async () => {
        reFetch()
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
            await axios.put(apiURL + '/auth/validate/' + userId, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // setUsers(res.data);
            toast.success(`User ${userId} validated !`);
            fetchUsers();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Fetch users error:", err);
            toast.error(err.response?.data?.message || "Error");
        }
    };

    return (
        <div className="min-h-screen bg-white p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                        <span>User Archive</span>
                    </div>
                </h1>
                <div className="flex items-center gap-4">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
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
                            Infos
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data
                        .map((u) => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={`https://api.dicebear.com/9.x/croodles/svg?seed=${u.username}`}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{u.username}</div>
                                            <div className="text-sm text-gray-500">{u.email}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {u.role}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                                    <button
                                        onClick={() => handleValidate(u.id)}
                                        className="block text-left px-4 py-2 text-sm hover:bg-green-50 text-gray-700 cursor-pointer w-max rounded-lg"
                                    >
                                        Validate
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};
export default UsersArchives;
