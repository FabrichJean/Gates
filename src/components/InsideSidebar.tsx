import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, LogOut as LogOutIcon } from "lucide-react";


const UserDisplayInline: React.FC<{ onLogoutRequest?: () => void }> = ({ onLogoutRequest }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

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
            <ThemeToggle />
            <span className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">{user?.username}</span>
            <button
                onClick={() => setOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={open}
                className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-600 transition-all duration-300"
                title="User menu"
            >
                <img
                    src={`https://api.dicebear.com/9.x/croodles/svg?seed=${encodeURIComponent(user?.username || '')}`}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full"
                />
            </button>

            {open && (
                <div className="absolute top-full left-1/2 mt-2 transform -translate-x-1/2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md z-50">
                    <div className="py-1">
                        <button onClick={handleProfile} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-300">
                            <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">
                                <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                <span className="text-gray-800 dark:text-gray-200">Profil</span>
                            </div>
                        </button>
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-300">
                            <div className="flex items-center gap-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 px-2 py-1 transition-colors duration-300">
                                <LogOutIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
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
import useSocket from "../hooks/useSocket";
import ThemeToggle from "./ThemeToggle";

function InsideSidebar({ children }: React.PropsWithChildren) {
    useSocket()
    const initialIsCollapsed = typeof window !== 'undefined' && localStorage.getItem('is-collapsed') === 'true';
    const initialShowSidebar = false; // always start closed on load
    const initialIsMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;

    const [isCollapsed, setIsCollapsed] = useState<boolean>(initialIsCollapsed);
    const [isMobile, setIsMobile] = useState<boolean>(initialIsMobile);
    const [showSidebar, setShowSidebar] = useState<boolean>(initialShowSidebar);
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

    useEffect(() => {
        const handleResize = () => {
            const nowMobile = window.innerWidth < 1024;
            setIsMobile(nowMobile);

            if (!nowMobile) {
                const storedCollapsed = localStorage.getItem('is-collapsed') === 'true';
                setIsCollapsed(storedCollapsed);
                setShowSidebar(false);
            } else {
                setShowSidebar(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            const next = !showSidebar;
            setShowSidebar(next); // toggle overlay mobile
            localStorage.setItem('show-side', String(next));
        } else {
            const next = !isCollapsed;
            setIsCollapsed(next); // toggle collapse desktop
            localStorage.setItem('is-collapsed', String(next));
        }
    };

    return (
        <div className="w-dvw h-dvh bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 flex overflow-hidden relative">
            <Toaster />

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
                    flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 h-full overflow-auto
                    ${isMobile ? "w-full" : isCollapsed ? "w-[calc(100%-5rem)]" : "w-[calc(100%-16rem)]"}
                `}
            >
                {/* Header */}
                <header className="w-full  bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 shadow-sm dark:shadow-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    {/* Bouton menu */}
                    <div
                        onClick={toggleSidebar}
                        className="text-lg font-semibold cursor-pointer text-gray-700 dark:text-gray-300 transition-colors duration-300"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6 hover:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                            />
                        </svg>
                    </div>

                    <div className="flex items-center gap-4">
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
                                    window.dispatchEvent(new CustomEvent('confirm-logout'));
                                    closeLogoutModal();
                                }}
                                className="flex gap-4"
                            >
                                <button className="btn bg-red-500 hover:bg-red-600 text-white border-none transition-colors duration-300" type="submit">
                                    logout
                                </button>
                                <button type="button" className="btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition-colors duration-300" onClick={closeLogoutModal}>
                                    cancel
                                </button>
                            </form>
                        </div>
                    </div>
                </dialog>

                <main className="flex-1 overflow-auto p-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">{children}</main>
            </div>
        </div>
    );
}

export default InsideSidebar;