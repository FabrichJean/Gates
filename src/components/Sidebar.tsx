/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth";
import { RiHome9Fill } from "react-icons/ri";
import { BiSolidVideos } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { LogOut, Settings, Users2 } from "lucide-react";


function Sidebar() {

    const { logout } = useAuth();
    const navigate = useNavigate();

    // fonction handle logout
    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    return (
        <div className="col-span-1 bg-white">
            <div className="p-2 h-full w-full flex flex-col bg-white dark:bg-gray-900 border-r border-r-gray-200">
                <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden flex-grow pt-2 justify-between">
                    {/* <!-- Section principale --> */}
                    <div className="flex flex-col space-y-1 mx-1 lg:mt-1">
                        <div className="px-5 pt-4 hidden lg:block"></div>
                        {/* 
                            <!-- Lien : App --> */}
                        <Link
                            to="/"
                            className="flex flex-row items-center justify-center lg:justify-start rounded-md h-12 px-3.5 lg:pr-6 font-semibold text-gray-500 hover:text-primary-400 cursor-pointer"
                        >
                            <RiHome9Fill className="min-w-5 h-5" />
                            <span className="ml-0 lg:ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">
                                Dashboard
                            </span>
                        </Link>

                        <Link
                            to="/videos"
                            className="flex flex-row items-center justify-center lg:justify-start rounded-md h-12 px-3.5 lg:pr-6 font-semibold text-gray-500 hover:text-primary-400 cursor-pointer"
                        >
                            <BiSolidVideos className="min-w-5 h-5" />
                            <span className="ml-0 lg:ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">
                                Videos
                            </span>
                        </Link>

                        <Link
                            to="/users"
                            className="flex flex-row items-center justify-center lg:justify-start rounded-md h-12 px-3.5 lg:pr-6 font-semibold text-gray-500 hover:text-primary-400 cursor-pointer"
                        >
                            <Users2 className="min-w-5 h-5" />
                            <span className="ml-0 lg:ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">
                                Users
                            </span>
                        </Link>

                        <Link
                            to="/profil"
                            className="flex flex-row items-center justify-center lg:justify-start rounded-md h-12 px-3.5 lg:pr-6 font-semibold bg-primary-50 shadow-sm text-primary-400"
                        >
                            <CgProfile className="min-w-5 h-5" />
                            <span className="ml-0 lg:ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">
                                Profile
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col space-y-2">
                    <Link to="/settings" className="px-1 btn">
                        <div className="flex flex-row items-center  justify-center lg:justify-start rounded-md h-12 focus:outline-none pr-3.5  lg:pr-6 font-semibold text-gray-500 hover:text-primary-400 cursor-pointer">
                            <span className="inline-flex justify-center items-center ml-3.5">
                                <Settings />
                            </span><span className="ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">Settings</span>
                        </div>
                    </Link>

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
