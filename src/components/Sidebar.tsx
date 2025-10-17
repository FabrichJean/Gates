/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useAuthMe } from "../hooks/useAuth";
import { BiSolidVideos } from "react-icons/bi";
import { Archive, LogOut, Settings, Users2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SidebarProps {
    isCollapsed: boolean;
    onCloseMobile?: () => void; // utilisé uniquement sur mobile
    isMobile?: boolean; // pour savoir si c’est mobile
}

function Sidebar({ isCollapsed, onCloseMobile, isMobile = false }: SidebarProps) {
    const { data: user } = useAuthMe();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [page, setPage] = useState<string>(() => {
        return localStorage.getItem("page") || "";
    });

    const handleLogout = () => {
        logout();
        navigate("/login");
        if (onCloseMobile) onCloseMobile(); // ferme overlay mobile
    };

    useEffect(() => {
        if (location.pathname) {
            const current = location.pathname.replace("/", "") || "videos";
            setPage(current);
            localStorage.setItem("page", current);
        }
    }, [location.pathname]);

    // 🔹 handleNav modifié : mobile = ferme, desktop = rien
    const handleNav = (newPage: string) => {
        if (page !== newPage) navigate(`/${newPage}`);
        if (isMobile && onCloseMobile) onCloseMobile();
    };

    const baseClass =
        "flex items-center rounded-xl px-3.5 py-2.5 transition-all duration-200 font-medium cursor-pointer";

    const linkClass = (name: string) =>
        `${baseClass} ${page === name
            ? "bg-blue-100 text-blue-600 shadow-sm dark:bg-blue-950/40 dark:text-blue-400"
            : "text-gray-500 hover:bg-gray-100 hover:text-blue-500 dark:text-gray-400 dark:hover:bg-gray-800"
        }`;

    const openLogoutModal = () => dialogRef.current?.showModal();
    const closeLogoutModal = () => dialogRef.current?.close();

    return (
        <aside
            className={`h-screen border-r border-gray-200 dark:border-gray-800 shadow-sm bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 flex flex-col justify-between relative
            ${isCollapsed ? "w-20" : "w-64"} `}
        >
            {/* Bouton de fermeture mobile */}
            {isMobile && onCloseMobile && (
                <button
                    onClick={onCloseMobile}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            {/* SECTION PRINCIPALE */}
            <div className="flex flex-col h-full justify-between">
                <div className="flex flex-col gap-1 mt-4 px-3">
                    <div className={`flex items-center justify-center ${!isCollapsed && "lg:justify-start"} mb-4`}>
                        <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            🎬
                        </h1>
                    </div>

                    <hr className="border-t border-gray-200 dark:border-gray-700" />

                    <Link to="/videos" onClick={() => handleNav("videos")} className={linkClass("videos")}>
                        <BiSolidVideos className="min-w-5 h-5 text-indigo-400" />
                        {!isCollapsed && <span className="ml-2">Videos</span>}
                    </Link>

                    {user?.role === "superadmin" && (
                        <>
                            <Link to="/users" onClick={() => handleNav("users")} className={linkClass("users")}>
                                <Users2 className="min-w-5 h-5 text-cyan-400" />
                                {!isCollapsed && <span className="ml-2">Users</span>}
                            </Link>

                            <Link to="/archive" onClick={() => handleNav("archive")} className={linkClass("archive")}>
                                <Archive className="min-w-5 h-5 text-zinc-500" />
                                {!isCollapsed && <span className="ml-2">Archive</span>}
                            </Link>

                            <Link to="/settings" onClick={() => handleNav("settings")} className={linkClass("settings")}>
                                <Settings className="min-w-5 h-5 text-zinc-400" />
                                {!isCollapsed && <span className="ml-2">Settings</span>}
                            </Link>
                        </>
                    )}
                </div>

                {/* SECTION BASSE */}
                <div className="flex flex-col gap-1 px-3 mb-4 border-t border-gray-200 dark:border-gray-800 pt-3">
                    <button
                        className="w-full text-left"
                        onClick={(e) => { e.preventDefault(); openLogoutModal(); }}
                        type="button"
                    >
                        <div className="flex items-center px-3.5 cursor-pointer py-2.5 rounded-xl text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30 transition-all">
                            <LogOut className="h-5 w-5" />
                            {!isCollapsed && <span className="ml-2">Logout</span>}
                        </div>
                    </button>
                </div>
            </div>

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
                                handleLogout();
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
        </aside>
    );
}

export default Sidebar;
