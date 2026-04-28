/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useAuthMe } from "../hooks/useAuth";
import { LogOut, X, ChevronRight, Music, Folder } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useParticles from "../hooks/useParticles";
import { MdOutlineCategory, MdDynamicFeed, MdVerified } from "react-icons/md";
import { RiRobot2Line } from "react-icons/ri";
import { BiLogoInternetExplorer } from "react-icons/bi";
import { SiGoogledisplayandvideo360 } from "react-icons/si";
import { FaSyncAlt } from "react-icons/fa";
import RoleEnum from "../utils/roleEnum";
import { useI18n } from '../context/I18nProvider';

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
  const { t } = useI18n();
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
            <div className="relative bg-gradient-to-br to-blue-500 dark:via-transparent from-transparent p-2.5 rounded-xl">
              <SiGoogledisplayandvideo360 className="w-5 h-5 text-white" />
            </div>
          </div>

          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                VMS
              </h1>
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                {t('app.subtitle')}
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
                  {t('profile.view')}
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
          label={t('nav.videos')}
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

        <NavLink
          to="/access-owner"
          name="access-owner"
          label={t('nav.access_owner')}
          iconComponent={
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              />
            </svg>
          }
        />

        <NavLink
          to="/post-for-app"
          name="post-for-app"
          label={t('nav.post_for_app')}
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
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <NavLink
          to="/post"
          name="post"
          label={t('nav.post')}
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          }
        />
        <NavLink
          to="/mangas"
          name="mangas"
          label={t('nav.mangas')}
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
        />
        <NavLink
          to="/app-videos"
          name="app-videos"
          label={t('nav.app_videos')}
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
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          }
        />

        <NavLink
          to="/explorer"
          name="explorer"
          label={t('nav.explorer')}
          icon={Folder}
        />

        {user?.role === RoleEnum.SUPERADMIN && (
          <>
            {/* Separator */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3">
                  {t('sidebar.bot_management')}
                </p>
              </div>
            )}

            <NavLink
              to="/bot-videos"
              name="bot-videos"
              label={t('nav.bot_videos')}
              icon={RiRobot2Line}
            />
            <NavLink
              to="/bot-posts"
              name="bot-posts"
              label={t('nav.bot_posts')}
              icon={RiRobot2Line}
            />
          </>
        )}

        {user?.role === RoleEnum.SUPERADMIN && (
          <>
            {/* Separator */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3">
                  {t('sidebar.categories')}
                </p>
              </div>
            )}

            <NavLink
              to="/category-manager"
              name="category-manager"
              label={t('nav.category_manager')}
              icon={MdOutlineCategory}
            />
            <NavLink
              to="/post-categories"
              name="post-categories"
              label={t('nav.post_categories')}
              icon={MdOutlineCategory}
            />
            <NavLink
              to="/mangas-categories"
              name="mangas-categories"
              label={t('nav.mangas_categories')}
              icon={MdOutlineCategory}
            />
            <NavLink
              to="/tag-category"
              name="tag-category"
              label={t('nav.tag_category')}
              icon={MdOutlineCategory}
            />

            <NavLink
              to="/audio-categories"
              name="audio-categories"
              label={t('nav.audio_categories')}
              iconComponent={<Music className="w-5 h-5" />}
            />

            <NavLink
              to="/roman-category"
              name="roman-category"
              label={t('nav.roman_category')}
              icon={MdOutlineCategory}
            />

            {/* Separator */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3">
                  {t('sidebar.content')}
                </p>
              </div>
            )}

            <NavLink
              to="/audios"
              name="audios"
              label={t('nav.audios')}
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
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              }
            />

            {/* '''''''' */}

            <NavLink
              to="/romans"
              name="romans"
              label={t('nav.romans')}
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
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              }
            />

            {/* <NavLink
              to="/romans/chapters"
              name="romans-chapters"
              label="Roman Chapters"
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            /> */}

            {/* Separator */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3">
                  {t('sidebar.management')}
                </p>
              </div>
            )}

            <NavLink
              to="/plateform-relations"
              name="plateform-relations"
              label={t('nav.plateform_relations')}
              icon={BiLogoInternetExplorer}
            />

            <NavLink
              to="/users"
              name="users"
              label={t('nav.users')}
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
              label={t('nav.archive')}
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
              label={t('nav.creators')}
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
                  {t('sidebar.tools')}
                </p>
              </div>
            )}

            <NavLink
              to="/settings"
              name="settings"
              label={t('nav.settings')}
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
              label={t('nav.conversion')}
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
              <span className="font-medium text-sm">{t('auth.logout')}</span>
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
            {t('auth.logout_confirm_title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('auth.logout_confirm_text')}
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
              {t('common.cancel')}
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
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </dialog>
    </aside>
  );
}

export default Sidebar;
