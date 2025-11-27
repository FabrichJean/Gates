/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useAuthMe } from "../hooks/useAuth";
import { LogOut, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useParticles from "../hooks/useParticles";
import { MdOutlineCategory } from "react-icons/md";
import { RiRobot2Line } from "react-icons/ri";
import { MdDynamicFeed } from "react-icons/md";
import { BiLogoInternetExplorer } from "react-icons/bi";
import { MdVerified } from "react-icons/md";
import { SiGoogledisplayandvideo360 } from "react-icons/si";

interface SidebarProps {
  isCollapsed: boolean;
  onCloseMobile?: () => void; // utilisé uniquement sur mobile
  isMobile?: boolean; // pour savoir si c’est mobile
}

function Sidebar({
  isCollapsed,
  onCloseMobile,
  isMobile = false,
}: SidebarProps) {
  const { data: user } = useAuthMe();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const asideRef = useRef<HTMLDivElement | null>(null);

  // Cursor-following decorative motifs (only visible in light mode)
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });

  // ----- Particle configuration & types -----
  const PARTICLE_MIN = 1000;
  const PARTICLE_DENSITY = 0.005; // per px^2

  // Particle type defined inline below to avoid unused-type warnings

  // Observe theme class changes
  useEffect(() => {
    const updateTheme = () => {
      setIsDarkTheme(document.documentElement.classList.contains("dark"));
    };
    updateTheme(); // initial sync
    const obs = new MutationObserver(updateTheme);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  // Use the reusable particle hook (keeps the canvas animation logic centralized)
  useParticles(canvasRef, asideRef, mouseRef, {
    isDark: isDarkTheme,
    minCount: PARTICLE_MIN,
    density: PARTICLE_DENSITY,
    // color: light = blue, dark = softer slate-blue
    color: isDarkTheme ? "147,197,253" : "59,130,246",
    centerBoost: 0.18,
  });

  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pendingRef.current = { x, y };
      // feed particle system
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(() => {
          pendingRef.current = null;
          rafRef.current = null;
        });
      }
    };

    const onLeave = () => {
      // move off-screen
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

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
    "flex items-center rounded-xl px-3.5 py-3 transition-all duration-300 font-medium cursor-pointer group relative overflow-hidden";

  const linkClass = (name: string) =>
     `${baseClass} ${(location.pathname.startsWith(`/${name}`) && !location.pathname.startsWith(`/${name}-`))
        ? "bg-blue-50/80 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50"
        : "text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 dark:text-gray-400 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 dark:hover:text-blue-400 hover:scale-105 hover:shadow-md"
    }`;

  const openLogoutModal = () => dialogRef.current?.showModal();
  const closeLogoutModal = () => dialogRef.current?.close();

  return (
    <aside
      ref={asideRef}
      className={`h-screen border-r border-gray-300 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950/70 dark:to-gray-900/70 transition-all duration-300 flex flex-col justify-between relative
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
          <div
            className={`flex items-center justify-center ${
              !isCollapsed && "lg:justify-start"
            } group`}
          >
            <div className="flex items-center relative pb-2 border-b w-full">
              {/* Logo icon with gradient background */}
              <SiGoogledisplayandvideo360 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              
              {!isCollapsed && (
                <div className="ml-3 inline-block">
                  <h1 className="text-lg font-black tracking-tight">
                    <span className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-700/90 dark:from-blue-400/90 dark:via-indigo-400/90 dark:to-blue-500/90 bg-clip-text text-transparent transition-all duration-300">
                      VMS
                    </span>
                  </h1>
                  <p className="text-[9px] font-semibold text-gray-500/80 dark:text-gray-400/80 tracking-wider uppercase">
                    Video Management
                  </p>
                </div>
              )}
            </div>
          </div>

          <Link
            to={"/profil"}
            className="mt-auto py-4 flex items-center gap-2 
              hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20
              rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md group"
          >
            <div className="flex items-center w-full">
              <div className="relative">
                <img
                  className="h-10 min-w-10 rounded-full border-2 border-gray-200 dark:border-gray-700 
                    group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-all duration-300
                    group-hover:scale-110 shadow-sm group-hover:shadow-lg"
                  src={`https://api.dicebear.com/9.x/open-peeps/svg?seed=${user?.username}`}
                  alt="User"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full 
                  group-hover:scale-110 transition-transform duration-300"></div>
              </div>
              {!isCollapsed && (
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {user?.username || "Unknown User"}{" "}
                    <MdVerified className="ml-1 text-blue-500 w-4 h-4 group-hover:scale-125 transition-transform duration-300" />
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-500 group-hover:text-blue-500 transition-colors duration-300">
                    View Profile →
                  </p>
                </div>
              )}
            </div>
          </Link>

          <Link
            to="/videos"
            onClick={() => handleNav("videos")}
            className={linkClass("videos")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-current transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 relative z-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>

            {!isCollapsed && <span className="ml-3 relative z-10">Videos</span>}
          </Link>

          <Link
            to="/post"
            onClick={() => handleNav("post")}
            className={linkClass("post")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-purple-400/0 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <MdDynamicFeed className="w-6 h-6 text-current transition-transform duration-300 group-hover:scale-110 relative z-10" />

            {!isCollapsed && <span className="ml-3 relative z-10">Posts</span>}
          </Link>

          {user?.role === "superadmin" && (
            <>
              <Link
                to="/bot-videos"
                onClick={() => handleNav("bot-videos")}
                className={linkClass("bot-videos")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/5 to-green-400/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <RiRobot2Line className="w-6 h-6 text-current transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 relative z-10" />

                {!isCollapsed && <span className="ml-3 relative z-10">Video Bot</span>}
              </Link>

              <Link
                to="/category-manager"
                onClick={() => handleNav("category-manager")}
                className={linkClass("category-manager")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-indigo-400/5 to-indigo-400/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <MdOutlineCategory className="w-6 h-6 text-current transition-transform duration-300 group-hover:scale-110 relative z-10" />
                {!isCollapsed && <span className="ml-3 relative z-10">Video Category</span>}
              </Link>

              <Link
                to="/post-categories"
                onClick={() => handleNav("post-categories")}
                className={linkClass("post-categories")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/0 via-pink-400/5 to-pink-400/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <MdOutlineCategory className="w-6 h-6 text-current transition-transform duration-300 group-hover:scale-110 relative z-10" />
                {!isCollapsed && <span className="ml-3 relative z-10">Post Category</span>}
              </Link>
              <Link
                to="/plateform-relations"
                onClick={() => handleNav("plateform-relations")}
                className={linkClass("plateform-relations")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <BiLogoInternetExplorer className="w-6 h-6 text-current transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 relative z-10" />
                {!isCollapsed && <span className="ml-3 relative z-10">WebApps</span>}
              </Link>

              <Link
                to="/users"
                onClick={() => handleNav("users")}
                className={linkClass("users")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-amber-400/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-current transition-transform duration-300 group-hover:scale-110 relative z-10"
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

                {!isCollapsed && <span className="ml-3 relative z-10">Users</span>}
              </Link>

              <Link
                to="/archive"
                onClick={() => handleNav("archive")}
                className={linkClass("archive")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-400/5 to-red-400/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-current transition-transform duration-300 group-hover:scale-110 relative z-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                  />
                </svg>

                {!isCollapsed && <span className="ml-3 relative z-10">Blocked User</span>}
              </Link>

              <Link
                to="/creators"
                onClick={() => handleNav("creators")}
                className={linkClass("creators")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400/0 via-teal-400/5 to-teal-400/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-current transition-transform duration-300 group-hover:scale-110 relative z-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 19.5a6.75 6.75 0 0 1 13.5 0"
                  />
                </svg>
                {!isCollapsed && <span className="ml-3 relative z-10">Creators</span>}
              </Link>

              <Link
                to="/settings"
                onClick={() => handleNav("settings")}
                className={linkClass("settings")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-400/0 via-slate-400/5 to-slate-400/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-current transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90 relative z-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                {!isCollapsed && <span className="ml-3 relative z-10">Settings</span>}
              </Link>

              <Link
                to="/conversion"
                onClick={() => handleNav("conversion")}
                className={linkClass("conversion")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400/0 via-violet-400/5 to-violet-400/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-current transition-transform duration-300 group-hover:scale-110 relative z-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125.504 1.125 1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                {!isCollapsed && <span className="ml-3 relative z-10">Excel Conversion</span>}
              </Link>
            </>
          )}
        </div>

        {/* SECTION BASSE */}
        {!isMobile && (
          <div className="flex flex-col gap-1 px-3 mb-4 border-t border-gray-200 dark:border-gray-800 pt-3">
            <button
              className="w-full text-left"
              onClick={(e) => {
                e.preventDefault();
                openLogoutModal();
              }}
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

      {/* Particles canvas overlay (many particles react to cursor) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none -z-0"
      />

      {/* MODAL LOGOUT */}
      <dialog
        ref={dialogRef}
        id="my_modal_5"
        className="modal modal-bottom sm:modal-middle"
      >
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
              <button
                className="btn bg-red-500 hover:bg-red-600 text-white border-none"
                type="submit"
              >
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
