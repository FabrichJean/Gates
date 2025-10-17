import { Toaster } from "react-hot-toast"
import Sidebar from "./Sidebar"
import StickyUploadProgress from "./StickyUploadProgress"

function InsideSidebar({ children }: React.PropsWithChildren) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    // ✅ Détecte la taille d’écran pour passer en mode mobile automatiquement
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024); // < 1024px = mobile/tablette
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setShowSidebar(!showSidebar);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    return (
        <div className="w-dvw h-dvh bg-gray-200 grid grid-cols-7">
            <Toaster />
            <Sidebar />
            <StickyUploadProgress />
            <div className="col-span-6 bg-white overflow-auto w-full h-full">{children}</div>
        </div>
    );
}

export default InsideSidebar;
