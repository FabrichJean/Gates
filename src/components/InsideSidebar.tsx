import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Inline component pour afficher le nom/email et l'avatar de l'utilisateur
const UserDisplayInline: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    // user peut être une string (userType) ou un objet contenant email/name
    let displayName = "Admin";
    let seed = "Super Admin";

    if (user) {
        if (typeof user === "string") {
            displayName = user;
            seed = user;
        } else if (typeof user === "object") {
            displayName = (user.name || user.username || user.email || user.role || user.userType) as string;
            seed = displayName || seed;
        }
    }

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const handleProfile = () => {
        setOpen(false);
        navigate('/profil');
    };

    const handleLogout = () => {
        setOpen(false);
        logout();
        navigate('/login');
    };

    return (
        <div ref={ref} className="relative flex items-center gap-3">
            <span className="text-gray-600 text-sm">{displayName}</span>
            <button
                onClick={() => setOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={open}
                className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-sky-300"
                title="User menu"
            >
                <img
                    src={`https://api.dicebear.com/9.x/croodles/svg?seed=${encodeURIComponent(seed)}`}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full"
                />
            </button>

            {open && (
                <div className="absolute top-full left-1/2 mt-2 transform -translate-x-1/2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md z-50">
                    <div className="py-1">
                        <button onClick={handleProfile} className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Profil</button>
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">Deconnexion</button>
                    </div>
                </div>
            )}
        </div>
    );
};
import { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";
import StickyUploadProgress from "./StickyUploadProgress";

function InsideSidebar({ children }: React.PropsWithChildren) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    // ✅ Détecte la taille d’écran pour passer en mode mobile automatiquement
    useEffect(() => {
        setShowSidebar(Boolean(localStorage.getItem('show-side')))
        setIsCollapsed(Boolean(localStorage.getItem('is-collapsed')))
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setShowSidebar(!showSidebar); // toggle overlay mobile
        } else {
            setIsCollapsed(!isCollapsed); // toggle collapse desktop
        }

        localStorage.setItem('show-side', String(showSidebar))
        localStorage.setItem('is-collapsed', String(isCollapsed))
    };

    return (
        <div className="w-dvw h-dvh bg-gray-200 flex overflow-hidden relative">
            <Toaster />
            <StickyUploadProgress />

            {/* Desktop Sidebar */}
            {!isMobile && <Sidebar isCollapsed={isCollapsed} />}

            {/* Mobile Sidebar Overlay */}
            {isMobile && showSidebar && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
                    <div className="absolute left-0 top-0 h-full">
                        <Sidebar
                            isCollapsed={false}
                            onCloseMobile={() => setShowSidebar(false)}
                            isMobile
                        />
                    </div>
                </div>
            )}

            {/* Contenu principal */}
            <div
                className={`
                    flex flex-col bg-white h-full overflow-auto transition-all duration-300
                    ${isMobile ? "w-full" : isCollapsed ? "w-[calc(100%-5rem)]" : "w-[calc(100%-16rem)]"}
                `}
            >
                {/* Header */}
                <header className="w-full bg-gray-100 shadow-sm px-6 py-4 flex justify-between items-center transition-all duration-300">
                    {/* Bouton menu */}
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
                        {/* Affiche le nom/email de l'utilisateur si disponible, sinon fallback */}
                        <UserDisplayInline />
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4">{children}</main>
            </div>
        </div>
    );
}

export default InsideSidebar;
