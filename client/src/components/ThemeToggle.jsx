import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <button
          onClick={() => setDarkMode(false)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
            !darkMode
              ? "bg-purple-100 text-purple-700"
              : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          <Sun size={16} />
          Light
        </button>

        <button
          onClick={() => setDarkMode(true)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
            darkMode
              ? "bg-purple-600 text-white"
              : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          <Moon size={16} />
          Dark
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;