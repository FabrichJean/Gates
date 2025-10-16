/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth, useAuthMe } from "../hooks/useAuth";
import { RiHome9Fill } from "react-icons/ri";
import { BiSolidVideos } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { Archive, LogOut, Settings, Users2 } from "lucide-react";
import { useEffect, useState } from "react";


function Sidebar() {

    const { data: user } = useAuthMe()

    const [page, setPage] = useState<string>(() => {
        // Lecture initiale une seule fois (lazy init)
        return localStorage.getItem('page') || '';
    });

    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // fonction handle logout
    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    // 🔹 À chaque changement d'URL, on met à jour la page active
    useEffect(() => {
        const current = location.pathname.replace("/", "") || "videos";
        setPage(current);
        localStorage.setItem("page", current);
    }, [location.pathname]);

    // 🔹 Fonction pour naviguer proprement
    const handleNav = (newPage: string) => {
        if (page !== newPage) {
            navigate(`/${newPage}`);
        }
    };

    // 🔹 Style commun aux liens
    const baseClass =
        "flex flex-row items-center justify-center lg:justify-start rounded-md h-12 px-3.5 lg:pr-6 font-semibold cursor-pointer transition-colors";

    const linkClass = (name: string) =>
        `${baseClass} ${page === name
            ? "bg-primary-50 shadow-sm text-primary-400"
            : "text-gray-500 hover:text-primary-400"
        }`;

    return (
        <div className="col-span-1 bg-white">
            <div className="p-2 h-full w-full flex flex-col bg-white dark:bg-gray-900 border-r border-r-gray-200">
                <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden flex-grow pt-2 justify-between">
                    {/* Sidebar */}

                    {/* <!-- Section principale --> */}
                    <div className="flex flex-col space-y-1 mx-1 lg:mt-1">
                        <div className="px-5 pt-4 hidden lg:block"></div>

                        <Link
                            to="/videos"
                            onClick={() => handleNav("videos")} className={linkClass("videos")}
                        >
                            <BiSolidVideos className="min-w-5 h-5 text-indigo-400" />
                            <span className="ml-2 text-sm tracking-wide hidden lg:block">
                                Videos
                            </span>
                        </Link>

                       {user?.role === "superadmin" && <Link
                            to="/users"
                            onClick={() => handleNav("users")} className={linkClass("users")}
                        >
                            <Users2 className="min-w-5 h-5 text-cyan-400" />
                            <span className="ml-2 text-sm tracking-wide hidden lg:block">
                                Users
                            </span>
                        </Link>}

                        {user?.role === "superadmin" && <Link
                            to="/archive"
                            onClick={() => handleNav("archive")} className={linkClass("archive")}
                        >
                            <Archive className="min-w-5 h-5 text-zinc-500" />
                            <span className="ml-2 text-sm tracking-wide hidden lg:block">
                                Archive
                            </span>
                        </Link>}
                    </div>
                </div>

                <div className="flex flex-col space-y-2">
                    {user?.role === "superadmin" && <Link
                        to="/settings"
                        onClick={() => handleNav("settings")} className={linkClass("settings")}
                    >
                        <Settings className="min-w-5 h-5 text-zinc-400" />
                        <span className="ml-2 text-sm tracking-wide hidden lg:block">
                            Settings
                        </span>
                    </Link>}

                    {/* @ts-expect-error */}
                    <button className="px-1 btn" onClick={() => document.getElementById('my_modal_5').showModal()}>
                        <div className="flex flex-row items-center  justify-center lg:justify-start rounded-md h-12 focus:outline-none pr-3.5  lg:pr-6 font-semibold text-gray-500 hover:text-primary-400 cursor-pointer text-red-400 hover:text-red-600">
                            <span className="inline-flex justify-center items-center ml-3.5">
                                <LogOut />
                            </span><span className="ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">Logout</span>
                        </div>
                    </button>
                </div>

                <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Deconnexion</h3>
                        <p className="py-4">Are you sure you want to logout ? <span className="text-xl">😞</span></p>
                        <div className="modal-action">
                            <form method="dialog" className="flex gap-4">
                                <button className="px-1 btn" onClick={handleLogout}>
                                    <div className="flex flex-row items-center  justify-center lg:justify-start rounded-md h-12 focus:outline-none pr-3.5  lg:pr-6 font-semibold text-gray-500 hover:text-primary-400 cursor-pointer text-red-400 hover:text-red-600">
                                        <span className="inline-flex justify-center items-center ml-3.5">
                                            <LogOut />
                                        </span><span className="ml-2 text-sm tracking-wide truncate capitalize block">Logout</span>
                                    </div>
                                </button>

                                <button className="btn">Close</button>
                            </form>
                        </div>
                    </div>
                </dialog>
            </div>
        </div>
    )
}

export default Sidebar
