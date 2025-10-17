import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";

function InsideSidebar({ children }: React.PropsWithChildren) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    return (
        <div className="w-dvw h-dvh bg-gray-200 flex overflow-hidden">
            <Toaster />

            {/* ✅ Sidebar avec largeur animée */}
            <Sidebar isCollapsed={isCollapsed} />

            {/* ✅ Contenu principal qui suit l'animation */}
            <div
                className={`
                    flex flex-col bg-white h-full overflow-auto transition-all duration-300
                    ${isCollapsed ? "w-[calc(100%-5rem)]" : "w-[calc(100%-16rem)]"}
                `}
            >
                {/* Header commun */}
                <header className="w-full bg-gray-100 shadow-sm px-6 py-4 flex justify-between items-center transition-all duration-300">
                    <div
                        onClick={toggleSidebar}
                        className="text-lg font-semibold cursor-pointer"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6 hover:text-blue-400"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                            />
                        </svg>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 text-sm">Admin</span>
                        <img
                            src="https://api.dicebear.com/9.x/adventurer/svg?seed=Admin"
                            alt="User avatar"
                            className="w-8 h-8 rounded-full"
                        />
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4">{children}</main>
            </div>
        </div>
    );
}

export default InsideSidebar;
