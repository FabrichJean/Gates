import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";
import StickyUploadProgress from "./StickyUploadProgress";

function InsideSidebar({ children }: React.PropsWithChildren) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    // ✅ Détecte la taille d’écran pour passer en mode mobile automatiquement
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024); // < 1024px = mobile/tablette
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setShowSidebar(!showSidebar);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    return (
        <div className="w-dvw h-dvh bg-gray-200 flex overflow-hidden relative">
            <Toaster />
            <StickyUploadProgress />
            {/* ✅ Sidebar Desktop */}
            {!isMobile && <Sidebar isCollapsed={isCollapsed} />}

            {/* ✅ Sidebar Mobile (overlay) */}
            {isMobile && showSidebar && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
                    <div className="absolute left-0 top-0 h-full">
                        <Sidebar
                            isCollapsed={false}
                            onCloseMobile={() => setShowSidebar(false)}
                        />
                    </div>
                </div>
            )}

            {/* ✅ Contenu principal */}
            <div
                className={`
                    flex flex-col bg-white h-full overflow-auto transition-all duration-300
                    ${isMobile ? "w-full" : isCollapsed ? "w-[calc(100%-5rem)]" : "w-[calc(100%-16rem)]"}
                `}
            >
                {/* Header commun */}
                <header className="w-full bg-gray-100 shadow-sm px-6 py-4 flex justify-between items-center transition-all duration-300">
                    {/* 🔹 Bouton menu */}
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