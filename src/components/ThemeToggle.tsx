import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (theme === "dark" || (theme === "system" && prefersDark)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const themes = [
    { value: "light", icon: Sun, label: "Light", color: "text-amber-500" },
    { value: "dark", icon: Moon, label: "Dark", color: "text-indigo-400" },
    {
      value: "system",
      icon: Monitor,
      label: "System",
      color: "text-purple-500",
    },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[1];

  return (
    <div className="relative group mr-2">
      {/* Main Toggle Button */}
      <button
        className="flex items-center justify-center p-2 rounded-lg
            dark:bg-gradient-to-br bg-white dark:from-gray-800 dark:to-gray-900
            hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800
            shadow-sm hover:shadow-md
            transition-all duration-300 ease-out
            transform hover:scale-105 active:scale-95 hover:rotate-12"
      >
        <currentTheme.icon
          className={`w-4 h-4 ${currentTheme.color} transition-all duration-300 
                        group-hover:rotate-12 group-hover:scale-110`}
        />
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
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isActive = theme === themeOption.value;
            return (
              <button
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left
                                    transition-all duration-200 ease-out
                                    ${isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }
                                    ${isActive
                    ? "border-l-4 border-blue-500"
                    : "border-l-4 border-transparent"
                  }
                                `}
              >
                <Icon
                  className={`w-5 h-5 transition-all duration-300
                                        ${isActive
                      ? themeOption.color + " scale-110"
                      : "text-gray-500 dark:text-gray-400"
                    }
                                        ${isActive ? "animate-pulse" : ""}
                                    `}
                />
                <span
                  className={`text-sm font-medium transition-colors duration-200
                                        ${isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300"
                    }
                                    `}
                >
                  {themeOption.label}
                </span>
                {isActive && (
                  <svg
                    className="ml-auto w-5 h-5 text-blue-500 animate-bounce"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
