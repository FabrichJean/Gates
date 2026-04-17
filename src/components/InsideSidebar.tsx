import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaSortDown, FaSyncAlt } from "react-icons/fa";
import SelectModal from "./SelectModal";
import {
  ChevronRight,
  Home,
  LogOut,
  Settings,
  Plus,
  Video,
  Folder,
} from "lucide-react";

// Create New Dropdown Component
const CreateNewDropdown: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative group">
      {/* Create Button */}
      <button
        className="flex items-center justify-center gap-2 p-2 rounded-lg
            dark:bg-gradient-to-br bg-white dark:from-gray-800 dark:to-gray-900
            hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800
            shadow-sm hover:shadow-md
            transition-all duration-300 ease-out
            transform hover:scale-105 active:scale-95 hover:rotate-12"
      >
        <Plus className="w-4 h-4" />
        <FaSortDown className="w-4 h-4 -translate-y-0.5" />
        {/* <span className="hidden sm:inline text-xs">new</span> */}
      </button>

      {/* Dropdown Menu */}
      <div
        className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 
          group-hover:visible transition-all duration-300 ease-out transform 
          group-hover:translate-y-0 -translate-y-2 z-50"
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 
            dark:border-gray-700 overflow-hidden backdrop-blur-sm"
        >
          {/* New Video */}
          <button
            onClick={() => navigate("/videos/upload")}
            className="w-full flex items-center gap-3 px-4 py-3 text-left
              hover:bg-blue-50 dark:hover:bg-blue-900/20
              transition-all duration-200 ease-out group/item"
          >
            <Video className="w-5 h-5 text-blue-500 dark:text-blue-400 transition-transform duration-300 group-hover/item:scale-110" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              新视频
            </span>
          </button>

          {/* Bulk Upload Videos */}
          <button
            onClick={() => navigate("/videos/bulk-upload")}
            className="w-full flex items-center gap-3 px-4 py-3 text-left
              hover:bg-blue-50 dark:hover:bg-blue-900/20
              transition-all duration-200 ease-out group/item
              border-t border-gray-100 dark:border-gray-700"
          >
            <Video className="w-5 h-5 text-cyan-500 dark:text-cyan-400 transition-transform duration-300 group-hover/item:scale-110" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              批量上传视频
            </span>
          </button>

          {/* New Post */}
          <button
            onClick={() => navigate("/post/upload")}
            className="w-full flex items-center gap-3 px-4 py-3 text-left
              hover:bg-purple-50 dark:hover:bg-purple-900/20
              transition-all duration-200 ease-out group/item
              border-t border-gray-100 dark:border-gray-700"
          >
            <MdDynamicFeed className="w-5 h-5 text-purple-500 dark:text-purple-400 transition-transform duration-300 group-hover/item:scale-110" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              新帖子
            </span>
          </button>

          {/* New Manga */}
          <button
            onClick={() => navigate("/mangas/upload")}
            className="w-full flex items-center gap-3 px-4 py-3 text-left
              hover:bg-pink-50 dark:hover:bg-pink-900/20
              transition-all duration-200 ease-out group/item
              border-t border-gray-100 dark:border-gray-700"
          >
            <img src="/mangas.png" alt="Manga" className="w-5 h-5" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              新漫画
            </span>
          </button>

          {/* New Roman */}
          <button
            onClick={() => navigate("/romans/upload")}
            className="w-full flex items-center gap-3 px-4 py-3 text-left
              hover:bg-yellow-50 dark:hover:bg-yellow-900/20
              transition-all duration-200 ease-out group/item
              border-t border-gray-100 dark:border-gray-700"
          >
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
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              新罗马
            </span>
          </button>

          {/* File Explorer */}
          <button
            onClick={() => navigate("/explorer")}
            className="w-full flex items-center gap-3 px-4 py-3 text-left
              hover:bg-green-50 dark:hover:bg-green-900/20
              transition-all duration-200 ease-out group/item
              border-t border-gray-100 dark:border-gray-700"
          >
            <Folder className="w-5 h-5 text-green-500 dark:text-green-400 transition-transform duration-300 group-hover/item:scale-110" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              文件浏览器
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const OptionDisplayInline: React.FC<{ onLogoutRequest?: () => void }> = ({
  onLogoutRequest,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogoutRequest) {
      onLogoutRequest();
      return;
    }
    logout();
    navigate("/login");
  };

  return (
    <div className="relative flex items-center gap-2">
      <div className="hidden sm:block">
        <LanguageSwitcher />
      </div>
      {/* Settings Button */}
      <Link to="/settings">
        <button
          className="flex items-center justify-center p-2 rounded-lg
            dark:bg-gradient-to-br bg-white dark:from-gray-800 dark:to-gray-900
            hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800
            shadow-sm hover:shadow-md
            transition-all duration-300 ease-out
            transform hover:scale-105 active:scale-95 hover:rotate-12"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400 transition-colors duration-300" />
        </button>
      </Link>
      <ThemeToggle />
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center p-2 rounded-lg
          bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20
          hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-800/30
          border border-red-200 dark:border-red-700/50
          shadow-sm hover:shadow-md hover:shadow-red-200 dark:hover:shadow-red-900/50
          transition-all duration-300 ease-out
          transform hover:scale-105 active:scale-95
          group"
        title="Logout"
      >
        <LogOut className="w-3 h-3 text-red-600 dark:text-red-400 transition-all duration-300 group-hover:translate-x-0.5" />
      </button>
    </div>
  );
};

import { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from './LanguageSwitcher';
import ProcessModal from "./ProcessModal";
import { MdDynamicFeed } from "react-icons/md";
import { useCardFlottant } from "../hooks/useCardFlottant";
import useSyncOption from "../hooks/useSyncOption";
import useSyncErrors from "../hooks/useSyncErrors";
import { useSocketProgress } from "../hooks/useSocketProgress";

// Composant Breadcrumb
const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Mapping des routes vers des noms lisibles
  const routeNames: Record<string, string> = {
    "/": "首页",
    "/users": "用户",
    "/users-archive": "用户档案",
    "/videos": "视频管理",
    "/category-manager": "视频类别",
    "/mangas-categories": "漫画类别",
    "/post-categories": "文章分类",
    "/upload": "上传",
    "/upload-post": "上传帖子",
    "/post-management": "帖子管理",
    "/post-for-app": "应用帖子",
    "/settings": "设置",
    "/profil": "个人资料",
    "/create-user": "创建用户",
    "/convertion": "转换",
    "/touch-video": "触摸视频",
    "/app-videos": "应用视频",
    "/explorer": "文件浏览器",
    "/mangas": "漫画",
    // "/romans": "罗马",
    "/post": "帖子",
    "/bot-videos": "机器人视频",
    "/bot-posts": "机器人帖子",

  };

  const pathSegments = location.pathname
    .split("/")
    .filter((segment) => segment !== "");

  // Construire les breadcrumbs
  const breadcrumbs = [{ name: "首页", path: "/videos" }];

  let currentPath = "";
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const name =
      routeNames[currentPath] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ name, path: currentPath });
  });

  const handleOpenFor = (id?: number) => {
    setSelectedRow(id || null);
    setModalOpen(true);
  };

  const { sync } = useSyncOption();
  const { reFetch } = useSyncErrors();

  const handleSubmit = async (
    optionId: string | null,
    label: number | null,
    platformId?: number | null,
    isMode?: boolean | null
  ) => {
    const force = optionId === "true";
    try {
      show();
      await sync({
        isForce: force,
        label: label!,
        platformId: platformId,
        isAll: typeof isMode !== "undefined" ? isMode : null,
      });

      reFetch();

      setModalOpen(false);
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  const [showProcessModal, setShowProcessModal] = useState(false);

  const { show } = useCardFlottant();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <>
      <nav className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 relative min-h-[48px]">
        <div className="flex items-center">
          <Home className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
          <button
            onClick={() => navigate(breadcrumbs[0].path)}
            className={`text-sm transition-colors duration-200 ${breadcrumbs.length === 1
              ? "text-gray-900 dark:text-white font-medium cursor-default"
              : "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
              }`}
            disabled={breadcrumbs.length === 1}
          >
            {breadcrumbs[0].name}
          </button>
        </div>
        {breadcrumbs.slice(1).map((breadcrumb, index) => (
          <div key={breadcrumb.path} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            <button
              onClick={() => navigate(breadcrumb.path)}
              className={`text-sm transition-colors duration-200 ${index === breadcrumbs.length - 2
                ? "text-gray-900 dark:text-white font-medium cursor-default"
                : "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
                }`}
              disabled={index === breadcrumbs.length - 2}
            >
              {breadcrumb.name}
            </button>
          </div>
        ))}

        <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <button
            type="button"
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            title="Télécharger"
            onClick={() => setShowProcessModal(true)}
          >
            <svg
              className="w-5 h-5 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 4v12m0 0l-4-4m4 4l4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="4" y="18" width="16" height="2" rx="1" />
            </svg>
          </button>
          <button
            onClick={handleOpenFor.bind(null, undefined)}
            className="p-2.5 rounded-lg cursor-pointer flex items-center justify-center gap-2 px-3.5 py-2 text-nowrap font-medium text-xs border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <FaSyncAlt />
            <span className="md:inline hidden text-gray-600 dark:text-gray-400 PX-3">
              同步
            </span>
          </button>
        </span>
      </nav>

      <ProcessModal
        open={showProcessModal}
        onClose={() => setShowProcessModal(false)}
      />

      <SelectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        rowLabel={selectedRow}
        title={selectedRow ? `Sync: ${selectedRow}` : "Select an option"}
        onSubmit={handleSubmit}
      />
    </>
  );
};

function InsideSidebar({ children }: React.PropsWithChildren) {
  useSocketProgress();
  const initialIsCollapsed =
    typeof window !== "undefined" &&
    localStorage.getItem("is-collapsed") === "true";
  const initialShowSidebar = false; // always start closed on load
  const initialIsMobile =
    typeof window !== "undefined" ? window.innerWidth < 1024 : false;

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
      navigate("/login");
    };
    window.addEventListener("confirm-logout", handler as EventListener);
    return () =>
      window.removeEventListener("confirm-logout", handler as EventListener);
  }, [logout, navigate]);

  useEffect(() => {
    const handleResize = () => {
      const nowMobile = window.innerWidth < 1024;
      setIsMobile(nowMobile);

      if (!nowMobile) {
        const storedCollapsed = localStorage.getItem("is-collapsed") === "true";
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
      localStorage.setItem("show-side", String(next));
    } else {
      const next = !isCollapsed;
      setIsCollapsed(next); // toggle collapse desktop
      localStorage.setItem("is-collapsed", String(next));
    }
  };

  return (
    <div className="w-dvw h-dvh  from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 flex overflow-hidden relative bg-[url('https://res.cloudinary.com/dkt1t22qc/image/upload/v1742357451/Prestataires_Documents/cynbxx4vxvgv2wrpakiq.jpg')]">
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
                    ${isMobile
            ? "w-full"
            : isCollapsed
              ? "w-[calc(100%-5rem)]"
              : "w-[calc(100%-16rem)]"
          }
                `}
      >
        {/* Header */}
        <header className="relative w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 shadow-sm dark:shadow-gray-800 px-4 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          {/* Neon decorative background (subtle, smooth pulse) */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
          >
            <div className="neon-blob neon-cyan absolute -left-16 top-2 w-64 h-40" />
            <div className="neon-blob neon-purple absolute -right-12 -bottom-6 w-56 h-32" />
          </div>
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
            <CreateNewDropdown />
            <OptionDisplayInline onLogoutRequest={openLogoutModal} />
          </div>
        </header>

        {/* MODAL LOGOUT */}
        <dialog
          ref={dialogRef}
          id="my_modal_5"
          className="modal modal-bottom sm:modal-middle"
        >
          <div className="modal-box bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
            <h3 className="font-bold text-lg">断开连接</h3>
            <p className="py-4">
              你确定要退出登录吗？ <span>😞</span>
            </p>
            <div className="modal-action">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent("confirm-logout"));
                  closeLogoutModal();
                }}
                className="flex gap-4"
              >
                <button
                  className="btn bg-red-500 hover:bg-red-600 text-white border-none transition-colors duration-300"
                  type="submit"
                >
                  登出
                </button>
                <button
                  type="button"
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 border-none transition-colors duration-300"
                  onClick={closeLogoutModal}
                >
                  取消
                </button>
              </form>
            </div>
          </div>
        </dialog>

        {/* Breadcrumb Navigation */}
        <Breadcrumb />

        <main className="flex-1 overflow-auto p-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}

export default InsideSidebar;
