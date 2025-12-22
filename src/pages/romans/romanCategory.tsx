


const RomanCategoryPage = () => {
    return (
        <div className="p-2 w-full">
            <div className="w-4xl flex flex-column space-x-4">
                {/* content category */}
                <div className="border w-[50%] h-full rounded-sm border-gray-300 dark:border-gray-600 px-2 py-1 pb-5">
                    <h2 className="text-xl font-semibold mb-2 ">Category List</h2>
                    {/* filed search and btn add */}
                    <div className="flex items-center space-x-2 pb-5">
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeWidth={2} d="M5 7h14M5 12h14M5 17h14" />
                                </svg>
                            </div>
                            <input type="text" id="simple-search" className="rounded-sm px-3 py-2.5 bg-neutral-secondary-medium border border-gray-300 dark:border-gray-700 outline-none ps-9 text-heading text-sm focus:ring-brand focus:border-brand block w-full placeholder:text-body" placeholder="Search sub category" required />
                        </div>
                        <button type="submit" className="inline-flex border border-teal-500 rounded-sm items-center hover:bg-slate-100 cursor-pointer hover:dark:bg-slate-800 text-teal-500 justify-center shrink-0 bg-brand hover:bg-brand-strong shadow-xs w-10 h-10 focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>
                    {/* list category */}
                    <div className="flex items-center rounded-sm px-2 py-2 border border-slate-300 dark:border-slate-700">
                        <span className="h-2 w-2 border border-gray-300 dark:border-gray-500 rounded-full"></span>
                        <span className="ms-1 text">Category Name</span>
                    </div>
                </div>

                {/* content subcategory d'un caegory selectionné */}
                <div className="border w-[50%] h-auto rounded-sm border-gray-300 dark:border-gray-600 px-2 py-1 pb-5">
                    <h2 className="text-xl font-semibold mb-2">Subcategory List</h2>
                    {/* filed search and btn add */}
                    <div className="flex items-center space-x-2 pb-5">
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8v8m0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0a4 4 0 0 1-4 4h-1a3 3 0 0 0-3 3" /></svg>
                            </div>
                            <input type="text" id="simple-search" className="rounded-sm px-3 py-2.5 bg-neutral-secondary-medium border border-gray-300 dark:border-gray-700 outline-none ps-9 text-heading text-sm focus:ring-brand focus:border-brand block w-full placeholder:text-body" placeholder="Search category" required />
                        </div>
                        <button type="submit" className="inline-flex border border-teal-500 rounded-sm items-center hover:bg-slate-100 cursor-pointer hover:dark:bg-slate-800 text-teal-500 justify-center shrink-0 bg-brand hover:bg-brand-strong shadow-xs w-10 h-10 focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>
                    {/* list sub category */}
                    <div className="flex items-center rounded-sm px-2 py-2 border border-slate-300 dark:border-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 text-green-600">
                            <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z" clipRule="evenodd" />
                        </svg>
                        <span className="ms-1">Category Name</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default RomanCategoryPage;