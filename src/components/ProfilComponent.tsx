const ProfilComponent = () => {
    return (
        <div className="w-full overflow-hidden dark:bg-gray-900">
            <div className="flex flex-col">
                {/* Cover Image */}
                <img src="https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw2fHxlYXJ0aHxlbnwwfDB8fHwxNzQ2NTM0MzY3fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="User Cover" className="w-full xl:h-[20rem] lg:h-[18rem] md:h-[16rem] sm:h-[14rem] h-[11rem]" />
                {/* Profile Image */}
                <div className="sm:w-[80%] w-[90%] mx-auto flex">
                    <img
                        src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw3fHxwZW9wbGV8ZW58MHwwfHx8MTcxMTExMTM4N3ww&ixlib=rb-4.0.3&q=80&w=1080"
                        alt="User Profile"
                        className="rounded-full lg:w-[12rem] lg:h-[12rem] md:w-[10rem] md:h-[10rem] sm:w-[8rem] sm:h-[8rem] w-[7rem] h-[7rem] outline-2 outline-offset-2 outline-blue-500 relative lg:bottom-[5rem] sm:bottom-[4rem] bottom-[3rem]"
                    />
                    {/* FullName */}
                    <h1 className="w-full text-left my-4 sm:mx-4 pl-4 text-gray-800 dark:text-white lg:text-4xl md:text-3xl sm:text-3xl text-xl font-serif">
                        Samuel Abera
                    </h1>
                </div>
                <div className="xl:w-[80%] lg:w-[90%] md:w-[90%] sm:w-[92%] w-[90%] mx-auto flex flex-col gap-4 items-center relative lg:-top-8 md:-top-6 -top-4">
                    {/* Description */}

                    {/* Detail */}
                    <div className="w-full my-auto py-6 flex flex-col justify-center gap-2">
                        <div className="w-full flex sm:flex-row flex-col gap-2 justify-center">
                            <div className="w-full">
                                <dl className="text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
                                    <div className="flex flex-col pb-3">
                                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">First Name</dt>
                                        <dd className="text-lg font-semibold">Samuel</dd>
                                    </div>
                                    <div className="flex flex-col pt-3">
                                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Email</dt>
                                        <dd className="text-lg font-semibold">samuel@example.com</dd>
                                    </div>
                                    <div className="flex flex-col py-3">
                                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Gender</dt>
                                        <dd className="text-lg font-semibold">Male</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );

}

export default ProfilComponent;