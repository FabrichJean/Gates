import { Toaster } from "react-hot-toast"
import Sidebar from "./Sidebar"

function InsideSidebar({ children }: React.PropsWithChildren) {


    return (
        <div className="w-dvw h-dvh bg-gray-200 grid grid-cols-7">
            <Toaster />
            <Sidebar />

            <div className="col-span-6 bg-white overflow-auto w-full h-full flex flex-col">
                {/* 🔹 Header commun */}
                <header className="w-full bg-gray-100 shadow-sm px-6 py-4 flex justify-between items-center">
                    <div className="text-lg font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                        </svg>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 text-sm">Admin</span>
                        <img
                            src="https://api.dicebear.com/9.x/adventurer/svg?seed=Admin"
                            alt="User avatar"
                            className="w-8 h-8 rounded-full"
                        />
                    </div>
                </header>

                <main className="col-span-6 bg-white overflow-auto w-full h-full">{children}</main>
            </div>
        </div>

    )
}

export default InsideSidebar;
