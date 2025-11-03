import { useState, useEffect } from "react";


const ThemeToggle  = () => {
    const [theme, setTheme] = useState(() => {
        if ( typeof window !== "undefined" ) { 
            return localStorage.getItem("theme") || "dark"; // 🌙 Dark par défaut au lieu de "system"
        }
        return "dark"; // 🌙 Dark par défaut au lieu de "system"
    })

    useEffect(() => {
        const root = window.document.documentElement;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if ( theme === "dark" || (theme === "system" && prefersDark) ) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <div className="mr-2">
            <select
                id="theme-select"
                value={theme}
                onChange={e => setTheme(e.target.value)}
                className="outline-none cursor-pointer bg-transparent text-gray-700 dark:text-gray-300 border-none focus:ring-0 transition-colors duration-300"
                style={{ boxShadow: "none", backgroundImage: "none" }}
            >
                <option value="light" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">☀️</option>
                <option value="dark" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">🌙</option>
                <option value="system" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">💻</option>
            </select>
        </div>
    )
}

export default ThemeToggle;