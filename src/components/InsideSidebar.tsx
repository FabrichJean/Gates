import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, LogOut as LogOutIcon } from "lucide-react";

// Inline component pour afficher le nom/email et l'avatar de l'utilisateur
const UserDisplayInline: React.FC<{ onLogoutRequest?: () => void }> = ({ onLogoutRequest }) => {
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
            displayName = (user.name || user.username || user.email || user.role) as string;
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
        if (onLogoutRequest) {
            onLogoutRequest();
            return;
        }
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
                        <button onClick={handleProfile} className="w-full text-left px-3 py-2 hover:bg-white dark:hover:bg-gray-700 cursor-pointer">
                            <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-100">
                                <UserIcon className="w-4 h-4 text-gray-600" />
                                <span>Profil</span>
                            </div>
                        </button>
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-600 dark:hover:bg-gray-700 cursor-pointer">
                            <div className="flex items-center gap-2 rounded-md hover:bg-gray-100 px-2 py-1">
                                <LogOutIcon className="w-4 h-4 text-red-600" />
                                <span>Logout</span>
                            </div>
                        </button>
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
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const openLogoutModal = () => dialogRef.current?.showModal();
    const closeLogoutModal = () => dialogRef.current?.close();
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handler = () => {
            logout();
            navigate('/login');
        };
        window.addEventListener('confirm-logout', handler as EventListener);
        return () => window.removeEventListener('confirm-logout', handler as EventListener);
    }, [logout, navigate]);

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
                        <UserDisplayInline onLogoutRequest={openLogoutModal} />
                    </div>
                </header>

                {/* MODAL LOGOUT */}
                <dialog ref={dialogRef} id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box dark:bg-gray-900 dark:text-white">
                        <h3 className="font-bold text-lg">Disconnect</h3>
                        <p className="py-4">
                            Are you sure you want to log out? <span>😞</span>
                        </p>
                        <div className="modal-action">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    // perform logout by finding Auth context inside UserDisplayInline
                                    // We'll import and call logout here through window event or navigate
                                    // Simpler: trigger a custom event that the UserDisplayInline cannot listen to.
                                    // We'll perform logout by calling logout through a small workaround: navigate to /login and clear token
                                    // But better: dispatch a custom event and handle it here.
                                    window.dispatchEvent(new CustomEvent('confirm-logout'));
                                    closeLogoutModal();
                                }}
                                className="flex gap-4"
                            >
                                <button className="btn bg-red-500 hover:bg-red-600 text-white border-none" type="submit">
                                    logout
                                </button>
                                <button type="button" className="btn" onClick={closeLogoutModal}>
                                    cancel
                                </button>
                            </form>
                        </div>
                    </div>
                </dialog>

                <main className="flex-1 overflow-auto p-4">{children}</main>
            </div>
        </div>
    );
}

export default InsideSidebar;
