import { useState, useEffect } from "react";


const ThemeToggle  = () => {
    const [theme, setTheme] = useState(() => {
        if ( typeof window !== "undefined" ) { 
            return localStorage.getItem("theme") || "system";
        }
        return "system";
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
        <div className="flex items-center gap-2">
            <select
                id="theme-select"
                value={theme}
                onChange={e => setTheme(e.target.value)}
                className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 appearance-none focus:outline-none focus:ring-0 cursor-pointer"
                style={{ boxShadow: "none", backgroundImage: "none" }}
            >
                <option value="light">☀️</option>
                <option value="dark">🌙</option>
                <option value="system">💻</option>
            </select>
        </div>
    )
}

export default ThemeToggle;