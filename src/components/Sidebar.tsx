/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useAuthMe } from "../hooks/useAuth";
import { LogOut, X, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useParticles from "../hooks/useParticles";
import { MdOutlineCategory, MdDynamicFeed, MdVerified } from "react-icons/md";
import { RiRobot2Line } from "react-icons/ri";
import { BiLogoInternetExplorer } from "react-icons/bi";
import { SiGoogledisplayandvideo360 } from "react-icons/si";
import { FaSyncAlt } from "react-icons/fa";
import RoleEnum from "../utils/roleEnum";

interface SidebarProps {
  isCollapsed: boolean;
  onCloseMobile?: () => void;
  isMobile?: boolean;
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

  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });

  const PARTICLE_MIN = 1000;
  const PARTICLE_DENSITY = 0.005;

  useEffect(() => {
    const updateTheme = () => {
      setIsDarkTheme(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    const obs = new MutationObserver(updateTheme);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  useParticles(canvasRef, asideRef, mouseRef, {
    isDark: isDarkTheme,
    minCount: PARTICLE_MIN,
    density: PARTICLE_DENSITY,
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
    if (onCloseMobile) onCloseMobile();
  };

  useEffect(() => {
    if (location.pathname) {
      const current = location.pathname.replace("/", "") || "videos";
      setPage(current);
      localStorage.setItem("page", current);
    }
  }, [location.pathname]);

  const handleNav = (newPage: string) => {
    if (page !== newPage) navigate(`/${newPage}`);
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const isActive = (name: string) =>
    location.pathname.startsWith(`/${name}`) &&
    !location.pathname.startsWith(`/${name}-`);

  const NavLink = ({
    to,
    icon: Icon,
    label,
    name,
    iconComponent,
  }: {
    to: string;
    icon?: any;
    label: string;
    name: string;
    iconComponent?: React.ReactNode;
  }) => (
    <Link
      to={to}
      onClick={() => handleNav(name)}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-300 overflow-hidden
        ${
          isActive(name)
            ? "bg-gradient-to-r from-blue-300/50 to-indigo-300/50 dark:shadow-blue-500/20"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
        }
      `}
    >
      {/* Active indicator */}
      {isActive(name) && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
      )}

      {/* Icon */}
      <div
        className={`
        relative z-10 transition-transform duration-300
        ${
          isActive(name)
            ? "scale-110"
            : "group-hover:scale-110 group-hover:rotate-3"
        }
      `}
      >
        {iconComponent || (Icon && <Icon className="w-5 h-5" />)}
      </div>

      {/* Label */}
      {!isCollapsed && (
        <span
          className={`
          relative z-10 font-medium text-sm
          ${
            isActive(name)
              ? ""
              : "group-hover:text-gray-900 dark:group-hover:text-gray-100"
          }
        `}
        >
          {label}
        </span>
      )}

      {/* Hover arrow */}
      {!isCollapsed && !isActive(name) && (
        <ChevronRight
          className="
          w-4 h-4 ml-auto opacity-0 -translate-x-2
          group-hover:opacity-100 group-hover:translate-x-0
          transition-all duration-300
        "
        />
      )}
    </Link>
  );

  const openLogoutModal = () => dialogRef.current?.showModal();
  const closeLogoutModal = () => dialogRef.current?.close();

  return (
    <aside
      ref={asideRef}
      className={`
        h-screen flex flex-col justify-between relative
        bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800
        transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Mobile close button */}
      {isMobile && onCloseMobile && (
        <button
          onClick={onCloseMobile}
          className="absolute top-4 right-4 z-50 p-2 rounded-lg
            bg-gray-100 dark:bg-gray-800
            text-gray-600 dark:text-gray-400
            hover:bg-red-100 dark:hover:bg-red-900/20
            hover:text-red-500 dark:hover:text-red-400
            transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex-shrink-0">
        {/* Logo */}
        <div
          className={`
          flex items-center gap-3 px-4 py-6 border-b border-gray-200 dark:border-gray-800
          ${isCollapsed ? "justify-center" : ""}
        `}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-lg opacity-50" />
            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl">
              <SiGoogledisplayandvideo360 className="w-6 h-6 text-white" />
            </div>
          </div>

          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                VMS
              </h1>
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                Video Management
              </p>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-3">
          <Link
            to="/profil"
            className={`
              group flex items-center gap-3 p-3 rounded-xl
              bg-gradient-to-br from-purple-50 to-pink-50
              dark:from-purple-900/20 dark:to-pink-900/20
              hover:from-purple-100 hover:to-pink-100
              dark:hover:from-purple-900/30 dark:hover:to-pink-900/30
              border border-purple-200/50 dark:border-purple-800/50
              transition-all duration-300 hover:shadow-lg hover:scale-[1.02]
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <div className="relative flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm
                  group-hover:border-purple-400 dark:group-hover:border-purple-500
                  transition-all duration-300"
                src={`https://api.dicebear.com/9.x/open-peeps/svg?seed=${user?.username}`}
                alt="User"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 truncate">
                  {user?.username || "Unknown"}
                  <MdVerified className="text-blue-500 w-4 h-4 flex-shrink-0" />
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  View Profile
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-1 no-scrollbar">
        <NavLink
          to="/videos"
          name="videos"
          label="Videos"
          iconComponent={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          }
        />

        <NavLink to="/post" name="post" label="Posts" icon={MdDynamicFeed} />
        <NavLink
          to="/mangas"
          name="mangas"
          label="Mangas"
          iconComponent={
            <img src="/mangas.png" alt="" className="w-5 h-5"/>
          }
        />
        <NavLink
          to="/app-videos"
          name="app-videos"
          label="Video For App"
          icon={BiLogoInternetExplorer}
        />

        {user?.role === RoleEnum.SUPERADMIN && (
          <>
            {/* Separator */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3">
                  Bot Management
                </p>
              </div>
            )}

            <NavLink
              to="/bot-videos"
              name="bot-videos"
              label="Video Bot"
              icon={RiRobot2Line}
            />
            <NavLink
              to="/bot-posts"
              name="bot-posts"
              label="Post Bot"
              icon={RiRobot2Line}
            />

            {/* Separator */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3">
                  Categories
                </p>
              </div>
            )}

            <NavLink
              to="/category-manager"
              name="category-manager"
              label="Video Category"
              icon={MdOutlineCategory}
            />
            <NavLink
              to="/post-categories"
              name="post-categories"
              label="Post Category"
              icon={MdOutlineCategory}
            />
            <NavLink
              to="/mangas-categories"
              name="mangas-categories"
              label="Manga Category"
              icon={MdOutlineCategory}
            />
            <NavLink
              to="/tag-category"
              name="tag-category"
              label="Tag Category"
              icon={MdOutlineCategory}
            />

            {/* Separator */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3">
                  Booking
                </p>
              </div>
            )}

            {/* Separator */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3">
                  Administration
                </p>
              </div>
            )}

            <NavLink
              to="/plateform-relations"
              name="plateform-relations"
              label="WebApps"
              icon={BiLogoInternetExplorer}
            />

            <NavLink
              to="/users"
              name="users"
              label="Users"
              iconComponent={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            />

            <NavLink
              to="/archive"
              name="archive"
              label="Blocked Users"
              iconComponent={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                  />
                </svg>
              }
            />

            <NavLink
              to="/creators"
              name="creators"
              label="Creators"
              iconComponent={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 19.5a6.75 6.75 0 0 1 13.5 0"
                  />
                </svg>
              }
            />

            {/* Separator */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3">
                  Tools
                </p>
              </div>
            )}

            <NavLink
              to="/settings"
              name="settings"
              label="Settings"
              iconComponent={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
            />

            <NavLink
              to="/conversion"
              name="conversion"
              label="Excel Conversion"
              iconComponent={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
              }
            />

            <NavLink to="/sync" name="sync" label="Sync" icon={FaSyncAlt} />
          </>
        )}
      </div>

      {/* Footer - Logout */}
      {!isMobile && (
        <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={openLogoutModal}
            className={`
              group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-red-600 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20
              transition-all duration-300
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {!isCollapsed && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </button>
        </div>
      )}

      {/* Particles canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none -z-0"
      />

      {/* Logout Modal */}
      <dialog
        ref={dialogRef}
        className="modal modal-bottom sm:modal-middle backdrop:bg-black/50"
      >
        <div className="modal-box bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
            Confirm Logout
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to log out? 😞
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={closeLogoutModal}
              className="px-6 py-2.5 rounded-xl font-medium
                bg-gray-100 dark:bg-gray-800
                text-gray-700 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-gray-700
                transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleLogout();
                closeLogoutModal();
              }}
              className="px-6 py-2.5 rounded-xl font-medium
                bg-gradient-to-r from-red-500 to-red-600
                text-white shadow-lg shadow-red-500/30
                hover:from-red-600 hover:to-red-700
                transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </dialog>
    </aside>
  );
}

export default Sidebar;
