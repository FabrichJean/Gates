import { FilePlus, Eye, Columns } from "lucide-react";
import { Link } from "react-router-dom";

// Données statiques pour la table
const staticPostData = [
    {
        id: 1,
        ref: "POST-001",
        username: "john_doe",
        category: "Education",
        status: "approved",
        image: "/img static/3232.jpg",
        duration: "05:30",
        checking: "verified",
        createdAt: "2024-11-01"
    },
    {
        id: 2,
        ref: "POST-002",
        username: "jane_smith",
        category: "Entertainment",
        status: "pending",
        image: "/img static/3232.jpg",
        duration: "12:45",
        checking: "pending",
        createdAt: "2024-11-02"
    },
    {
        id: 3,
        ref: "POST-003",
        username: "mike_wilson",
        category: "Technology",
        status: "rejected",
        image: "/img static/3232.jpg",
        duration: "08:15",
        checking: "rejected",
        createdAt: "2024-11-03"
    },
    {
        id: 4,
        ref: "POST-004",
        username: "sarah_jones",
        category: "Health",
        status: "approved",
        image: "/img static/3232.jpg",
        duration: "15:22",
        checking: "verified",
        createdAt: "2024-11-04"
    },
    {
        id: 5,
        ref: "POST-005",
        username: "alex_brown",
        category: "Sports",
        status: "pending",
        image: "/img static/3232.jpg",
        duration: "09:38",
        checking: "pending",
        createdAt: "2024-11-05"
    }
];

const PostManagement = () => {
    return (
        <div className="h-screen w-full">
            <div className="">
                <h1 className="text-2xl font-bold text-gray-700 dark:text-blue-100">Post Management</h1>

                {/* header  */}
                <header className="border-b border-gray-200 dark:border-gray-700 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-3">
                            <Link
                                to={"/post/upload"}
                                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 font-medium text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition-all"
                            >
                                <FilePlus className="w-5 h-auto text-blue-400 dark:text-blue-300" />
                            </Link>
                            <button className="flex items-center justify-center gap-2 p-2.5 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 font-medium text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition-all">
                                <Columns className="w-5 h-auto text-blue-400 dark:text-blue-300" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            </div>
            {/* tableau post videos */}
            <div className="w-full mt-4">
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left border-t-3 border-blue-500 dark:border-blue-500 rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-blue-500/5 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Ref
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Username
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Category
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Image
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Duration
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Checking
                                </th>
                                <th scope="col" className="px-6 py-3 text-left">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {staticPostData.map((post) => (
                                <tr key={post.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {post.ref}
                                    </th>
                                    <td className="px-6 py-4">
                                        {post.username}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${post.status === 'approved'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : post.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <img
                                            src={post.image}
                                            alt="Post thumbnail"
                                            className="w-12 h-8 object-cover rounded"
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkwyNCAxNkwyNCAyNEwxNiAyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        {post.duration}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${post.checking === 'verified'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : post.checking === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }`}>
                                            {post.checking}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-center gap-2">
                                            <Link
                                                to={`/post/${post.id}`}
                                                className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            {/* {post.status === 'pending' && (
                                                <>
                                                    <button className="p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )} */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default PostManagement;
