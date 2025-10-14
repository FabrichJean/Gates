function Sidebar() {

    return (
        <div className="col-span-1 bg-white">
            <div className="p-2 h-full w-full flex flex-col bg-white dark:bg-gray-900 border-r border-r-gray-200">
                <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden flex-grow pt-2 justify-between">
                    {/* <!-- Section principale --> */}
                    <div className="flex flex-col space-y-1 mx-1 lg:mt-1">
                        <div className="px-5 pt-4 hidden lg:block"></div>
                        {/* 
                            <!-- Lien : App --> */}
                        <a
                            href="/app"
                            className="flex flex-row items-center justify-center lg:justify-start rounded-md h-12 pr-3.5 lg:pr-6 font-semibold text-gray-500 hover:text-primary-400 cursor-pointer"
                        >
                            <span className="ml-0 lg:ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">
                                App
                            </span>
                        </a>

                        {/* <!-- Lien : Blogs --> */}
                        <a
                            href="/app/blogs"
                            className="flex flex-row items-center justify-center lg:justify-start rounded-md h-12 pr-3.5 lg:pr-6 font-semibold text-gray-500 hover:text-primary-400 cursor-pointer"
                        >
                            <span className="ml-0 lg:ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">
                                Blogs
                            </span>
                        </a>
                        {/* 
                            <!-- Lien : Mail --> */}
                        <a
                            href="/app/clients"
                            className="flex flex-row items-center justify-center lg:justify-start rounded-md h-12 pr-3.5 lg:pr-6 font-semibold text-gray-500 hover:text-primary-400 cursor-pointer"
                        >
                            <span className="ml-0 lg:ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">
                                Mail
                            </span>
                        </a>

                        {/* <!-- Lien : Projects (actif) --> */}
                        <a
                            href="/app/projects"
                            className="flex flex-row items-center justify-center lg:justify-start rounded-md h-12 pr-3.5 lg:pr-6 font-semibold bg-primary-50 shadow-sm text-primary-400 font-bold"
                        >
                            <span className="ml-0 lg:ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">
                                Projects
                            </span>
                        </a>
                    </div>

                    {/* <!-- Section inférieure --> */}
                    <div className="flex flex-col space-y-1 mx-1 lg:mt-1">
                        {/* <!-- Lien : Settings --> */}
                        <a
                            href="/app/settings"
                            className="flex flex-row items-center justify-center lg:justify-start rounded-md h-12 pr-3.5 lg:pr-6 font-semibold text-gray-500 hover:text-primary-400 cursor-pointer"
                        >
                            <span className="ml-0 lg:ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">
                                Settings
                            </span>
                        </a>
                    </div>
                </div>

                <div className="px-1">
                    <div className="flex flex-row items-center  justify-center lg:justify-start rounded-md h-12 focus:outline-none pr-3.5  lg:pr-6 font-semibold text-gray-500 hover:text-primary-400 cursor-pointer text-red-400 hover:text-red-600">
                        <span className="inline-flex justify-center items-center ml-3.5"><svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24"><path fill="currentColor" d="M15 2h-1c-2.828 0-4.243 0-5.121.879C8 3.757 8 5.172 8 8v8c0 2.828 0 4.243.879 5.121C9.757 22 11.172 22 14 22h1c2.828 0 4.243 0 5.121-.879C21 20.243 21 18.828 21 16V8c0-2.828 0-4.243-.879-5.121C19.243 2 17.828 2 15 2" opacity=".6" /><path fill="currentColor" d="M8 8c0-1.538 0-2.657.141-3.5H8c-2.357 0-3.536 0-4.268.732S3 7.143 3 9.5v5c0 2.357 0 3.535.732 4.268S5.643 19.5 8 19.5h.141C8 18.657 8 17.538 8 16z" opacity=".4" /><path fill="currentColor" fillRule="evenodd" d="M4.47 11.47a.75.75 0 0 0 0 1.06l2 2a.75.75 0 0 0 1.06-1.06l-.72-.72H14a.75.75 0 0 0 0-1.5H6.81l.72-.72a.75.75 0 1 0-1.06-1.06z" clipRule="evenodd" /></svg></span><span className="ml-2 text-sm tracking-wide truncate capitalize hidden lg:block">Logout</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
