import { Toaster } from "react-hot-toast"

const ProfilComponent = () => {

    
    return (
        <div className="flex items-start h-screen overflow-auto w-full">
            <Toaster position="top-center" />

            {/* <div className="flex flex-col flex-wrap md:flex-row gap-8 p-6 items-start justify-center w-full"></div> */}
            <div className="max-w-xl bg-white rounded-xl shadow-md overflow-hidden md:max-w-7xl">
                {/* Profile Header */}
                <div className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <img className="h-16 w-16 rounded-full object-cover border-2 border-pink-500" src="https://randomuser.me/api/portraits/women/45.jpg" alt="Profile picture" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-gray-900 truncate">Sarah Johnson</p>
                            <p className="text-sm text-gray-500 truncate">Photographer &amp; Traveler</p>
                            <div className="flex space-x-4 mt-2">
                                <span className="text-sm font-medium text-gray-900">542 <span className="font-normal text-gray-500">posts</span></span>
                                <span className="text-sm font-medium text-gray-900">12.8k <span className="font-normal text-gray-500">followers</span></span>
                                <span className="text-sm font-medium text-gray-900">328 <span className="font-normal text-gray-500">following</span></span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-gray-700">Capturing moments around the world 🌍 | Based in NYC | Prints available</p>
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-1 px-4 rounded-lg text-sm">
                            Follow
                        </button>
                        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-1 px-4 rounded-lg text-sm">
                            Message
                        </button>
                        <button className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>
                    </div>
                </div>
                {/* Highlights Stories */}
                <div className="px-6 pb-4 overflow-x-auto">
                    <div className="flex space-x-4">
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5">
                                <div className="h-full w-full rounded-full bg-white p-0.5">
                                    <img className="h-full w-full rounded-full object-cover" src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Travel" />
                                </div>
                            </div>
                            <span className="text-xs mt-1">Travel</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5">
                                <div className="h-full w-full rounded-full bg-white p-0.5">
                                    <img className="h-full w-full rounded-full object-cover" src="https://images.unsplash.com/photo-1530785602389-07594beb8b73?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Portraits" />
                                </div>
                            </div>
                            <span className="text-xs mt-1">Portraits</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5">
                                <div className="h-full w-full rounded-full bg-white p-0.5">
                                    <img className="h-full w-full rounded-full object-cover" src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Food" />
                                </div>
                            </div>
                            <span className="text-xs mt-1">Food</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5">
                                <div className="h-full w-full rounded-full bg-white p-0.5">
                                    <img className="h-full w-full rounded-full object-cover" src="https://plus.unsplash.com/premium_photo-1673292293042-cafd9c8a3ab3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Nature" />
                                </div>
                            </div>
                            <span className="text-xs mt-1">Nature</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5">
                                <div className="h-full w-full rounded-full bg-white p-0.5">
                                    <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs mt-1">New</span>
                        </div>
                    </div>
                </div>
                {/* Posts Grid */}
                <div className="grid grid-cols-3 gap-1">
                    <div className="aspect-square bg-gray-100 relative group">
                        <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1652057014611-3cded0a00d20?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Post" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <div className="flex space-x-4 text-white">
                                <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg> 245</span>
                                <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg> 31</span>
                            </div>
                        </div>
                    </div>
                    <div className="aspect-square bg-gray-100 relative group">
                        <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1569639399770-d9b90d46d5d8?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Post" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <div className="flex space-x-4 text-white">
                                <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg> 189</span>
                                <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg> 14</span>
                            </div>
                        </div>
                    </div>
                    <div className="aspect-square bg-gray-100 relative group">
                        <img className="w-full h-full object-cover" src="https://plus.unsplash.com/premium_photo-1682656220562-32fde8256295?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Post" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <div className="flex space-x-4 text-white">
                                <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg> 312</span>
                                <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg> 42</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default ProfilComponent;