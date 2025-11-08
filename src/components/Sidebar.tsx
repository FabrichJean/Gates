/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useAuthMe } from "../hooks/useAuth";
import { LogOut, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MdOutlineCategory } from "react-icons/md";

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
        "flex items-center rounded-lg px-3.5 py-2.5 transition-all duration-200 font-medium cursor-pointer";

    const linkClass = (name: string) =>
        `${baseClass} ${page === name
            ? "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
            : "text-gray-500 hover:bg-gray-100 hover:text-blue-500 dark:text-gray-400 dark:hover:bg-gray-800"
        }`;

    const openLogoutModal = () => dialogRef.current?.showModal();
    const closeLogoutModal = () => dialogRef.current?.close();

    return (
        <aside
            className={`h-screen border-r border-gray-300 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 flex flex-col justify-between relative
            ${isCollapsed ? "w-20" : "w-64"} `}
        >
            {/* Bouton de fermeture mobile */}
            {isMobile && onCloseMobile && (
                <button
                    onClick={onCloseMobile}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                >
                    <X className="w-5 h-5 cursor-pointer" />
                </button>
            )}

            {/* SECTION PRINCIPALE */}
            <div className="flex flex-col h-full justify-between">
                <div className="flex flex-col gap-1 mt-4 px-3">
                    <div className={`flex items-center justify-center  ${!isCollapsed && "lg:justify-start"} mb-4`}>
                        <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            VMS
                        </h1>
                    </div>

                    <hr className="border-t border-gray-200 dark:border-gray-700" />

                    <Link to="/videos" onClick={() => handleNav("videos")} className={linkClass("videos")}>
                        {/* <BiSolidVideos className="min-w-5 h-5 text-indigo-400" /> */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 text-current"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                            />
                        </svg>

                        {!isCollapsed && <span className="ml-2">Videos</span>}
                    </Link>

                    <Link to="/post" onClick={() => handleNav("post")} className={linkClass("post")}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 text-current"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                            />
                        </svg>
                        

                        {!isCollapsed && <span className="ml-2">Posts</span>}
                    </Link>

                    {user?.role === "superadmin" && (
                        <>
                            <Link to="/users" onClick={() => handleNav("users")} className={linkClass("users")}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6 text-current"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 
                                        0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 
                                        0a5.971 5.971 0 0 0-.941-3.197m0 
                                        0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 
                                        0-5.058 2.772m0 0a3 3 0 0 
                                        0-4.681 2.72 8.986 8.986 0 0 
                                        0 3.74.477m.94-3.197a5.971 
                                        5.971 0 0 0-.94 3.197M15 
                                        6.75a3 3 0 1 1-6 0 3 3 0 
                                        0 1 6 0Zm6 3a2.25 2.25 0 
                                        1 1-4.5 0 2.25 2.25 0 0 
                                        1 4.5 0Zm-13.5 0a2.25 2.25 
                                        0 1 1-4.5 0 2.25 2.25 0 0 
                                        1 4.5 0Z"
                                    />
                                </svg>

                                {!isCollapsed && <span className="ml-2">Users</span>}
                            </Link>

                            <Link to="/archive" onClick={() => handleNav("archive")} className={linkClass("archive")}>
                                {/* <Archive className="min-w-5 h-5 text-zinc-500" /> */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6 text-current"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                                    />
                                </svg>

                                {!isCollapsed && <span className="ml-2">Blocked User</span>}
                            </Link>


                            <Link to="/category-manager" onClick={() => handleNav("category-manager")} className={linkClass("category-manager")}>
                                <MdOutlineCategory className="w-6 h-6 text-current"/>
                                {!isCollapsed && <span className="ml-2">Category</span>}
                            </Link>

                            <Link to="/settings" onClick={() => handleNav("settings")} className={linkClass("settings")}>
                                {/* <Settings className="min-w-5 h-5 text-zinc-400" /> */}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-current">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                                {!isCollapsed && <span className="ml-2">Settings</span>}
                            </Link>

                            <Link to="/conversion" onClick={() => handleNav("conversion")} className={linkClass("conversion")}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-current">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125.504 1.125 1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                {!isCollapsed && <span className="ml-2">Excel Conversion</span>}
                            </Link>
                        </>
                    )}
                </div>

                {/* SECTION BASSE */}
                {!isMobile && (
                    <div className="flex flex-col gap-1 px-3 mb-4 border-t border-gray-200 dark:border-gray-800 pt-3">
                        <button
                            className="w-full text-left"
                            onClick={(e) => { e.preventDefault(); openLogoutModal(); }}
                            type="button"
                        >
                            <div className="flex items-center px-3.5 cursor-pointer py-2.5 rounded-lg text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30 transition-all">
                                <LogOut className="h-5 w-5" />
                                {!isCollapsed && <span className="ml-2">Logout</span>}
                            </div>
                        </button>
                    </div>
                )}
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
