import React, { useState } from 'react'

const CardFlottant: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false)
    

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Expanded card */}
            {!collapsed ? (
                <div className="w-80 max-w-full rounded-xl shadow-lg p-4 bg-white/95 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transform transition-all duration-200">
                    {/* close/minimize button */}
                    <button
                        aria-label="Minimize"
                        title="Minimize"
                        onClick={() => setCollapsed(true)}
                        className="absolute -mt-2 -mr-2 translate-y-0 translate-x-0 top-0 right-0 m-3 p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm focus:outline-none text-gray-700 dark:text-gray-200"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor" />
                        </svg>
                    </button>

                    <div className="flex flex-col items-center p-2">

                        {/* Zone serveurs + animation */}
                        <div className="flex items-center space-x-6">

                            {/* Serveur gauche */}
                            <div className="w-20 h-28 bg-gray-800 border rounded-xl shadow-lg flex flex-col justify-center relative">
                                <div className="bg-gray-600 mx-auto h-3 w-10 rounded mt-2"></div>
                                <div className="bg-gray-600 mx-auto h-3 w-12 rounded mt-2"></div>
                                <div className="bg-gray-600 mx-auto h-3 w-8 rounded mt-2"></div>
                            </div>

                            {/* Zone animation fichiers */}
                            <div className="relative w-40 h-28">

                                {/* Trois fichiers animés */}
                                <div className="absolute file f1 w-10 h-12 bg-yellow-400 border-2 border-yellow-500 flex items-start justify-center p-1">
                                    <div className="w-full h-full rounded-sm" style={{ clipPath: 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 0% 100%)' }}></div>
                                </div>

                                <div className="absolute file f2 w-10 h-12 bg-yellow-400 border-2 border-yellow-500 flex items-start justify-center p-1">
                                    <div className="w-full h-full rounded-sm" style={{ clipPath: 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 0% 100%)' }}></div>
                                </div>

                                <div className="absolute file f3 w-10 h-12 bg-yellow-400 border-2 border-yellow-500 flex items-start justify-center p-1">
                                    <div className="w-full h-full rounded-sm" style={{ clipPath: 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 0% 100%)' }}></div>
                                </div>
                            </div>

                            {/* Serveur droit */}
                            <div className="w-20 h-28 bg-gray-800 border rounded-xl shadow-lg flex flex-col justify-center relative">
                                <div className="bg-gray-600 mx-auto h-3 w-10 rounded mt-2"></div>
                                <div className="bg-gray-600 mx-auto h-3 w-12 rounded mt-2"></div>
                                <div className="bg-gray-600 mx-auto h-3 w-8 rounded mt-2"></div>
                            </div>

                        </div>

                        {/* Texte et barre de progression */}
                        <p className="mt-4 text-gray-700 dark:text-gray-200 text-sm font-semibold animate-pulse">Please wait… Téléversement en cours</p>

                        <div className="mt-3 w-full">
                            <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 prog">
                                <div className="h-full bg-amber-400 prog-bar" style={{ width: '42%' }}></div>
                            </div>
                        </div>

                    </div>

                </div>
            ) : (
                /* Collapsed small button to restore */
                <div className="w-12 h-12">
                    <button
                        aria-label="Restore upload card"
                        title="Restore"
                        onClick={() => setCollapsed(false)}
                        className="w-12 h-12 rounded-full bg-amber-400 shadow-lg flex items-center justify-center hover:scale-105 transform transition-all duration-150 focus:outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
                        </svg>

                    </button>
                </div>
            )}
        </div>
    )
}

export default CardFlottant