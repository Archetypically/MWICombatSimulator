import React, { createContext, useContext, useEffect, useState } from "react";

const THEME_STORAGE_KEY = "mwi-theme";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || "auto";
        }
        return "auto";
    });

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const updateResolvedTheme = () => {
            let resolved: "light" | "dark";
            if (theme === "auto") {
                resolved = mediaQuery.matches ? "dark" : "light";
            } else {
                resolved = theme;
            }
            setResolvedTheme(resolved);

            // Apply the theme class to document
            if (resolved === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        };

        updateResolvedTheme();

        // Listen for system theme changes when in auto mode
        if (theme === "auto") {
            mediaQuery.addEventListener("change", updateResolvedTheme);
            return () => mediaQuery.removeEventListener("change", updateResolvedTheme);
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    };

    return <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
