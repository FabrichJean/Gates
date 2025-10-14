import { Toaster } from "react-hot-toast"
import Sidebar from "./Sidebar"

function InsideSidebar({ children }: React.PropsWithChildren) {


    return (
        <div className="w-dvw h-dvh bg-gray-200 grid grid-cols-7">
            <Toaster/>
            <Sidebar/>
            <div className="col-span-6 bg-white overflow-auto">{children}</div>
        </div>

    )
}

export default InsideSidebar
