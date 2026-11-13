"use client";

import * as React from "react";

export interface ThemeProviderProps {
    children: React.ReactNode;
    attribute?: "class" | string;
    defaultTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
    storageKey?: string;
    themes?: string[];
}

export interface UseThemeProps {
    theme: string | undefined;
    setTheme: React.Dispatch<React.SetStateAction<string>>;
    resolvedTheme: string | undefined;
    themes: string[];
    systemTheme: "light" | "dark" | undefined;
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const DEFAULT_THEMES = ["light", "dark"];

const ThemeContext = React.createContext<UseThemeProps | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light";
}

function disableTransitionsTemporarily(): () => void {
    const style = document.createElement("style");
    style.appendChild(
        document.createTextNode(
            "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}"
        )
    );
    document.head.appendChild(style);
    return () => {
        window.getComputedStyle(document.body);
        setTimeout(() => {
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 1);
    };
}

export function ThemeProvider({
    children,
    attribute = "class",
    defaultTheme = "light",
    enableSystem = true,
    disableTransitionOnChange = false,
    storageKey = "theme",
    themes = DEFAULT_THEMES,
}: ThemeProviderProps) {
    const [theme, setThemeState] = React.useState<string>(defaultTheme);
    const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">("light");
    const [hydrated, setHydrated] = React.useState(false);

    const applyTheme = React.useCallback(
        (nextTheme: string) => {
            if (typeof document === "undefined") return;
            const resolved =
                nextTheme === "system" && enableSystem ? getSystemTheme() : nextTheme;
            const cleanup = disableTransitionOnChange
                ? disableTransitionsTemporarily()
                : null;
            const root = document.documentElement;

            if (attribute === "class") {
                root.classList.remove(...themes);
                if (resolved) root.classList.add(resolved);
            } else if (attribute.startsWith("data-")) {
                if (resolved) root.setAttribute(attribute, resolved);
                else root.removeAttribute(attribute);
            }

            if (resolved === "light" || resolved === "dark") {
                root.style.colorScheme = resolved;
            }

            cleanup?.();
        },
        [attribute, disableTransitionOnChange, enableSystem, themes]
    );

    React.useEffect(() => {
        const media = window.matchMedia(COLOR_SCHEME_QUERY);
        const currentSystem = media.matches ? "dark" : "light";
        setSystemTheme(currentSystem);

        let initial = defaultTheme;
        try {
            initial = localStorage.getItem(storageKey) || defaultTheme;
        } catch {
            // Ignore storage access errors
        }

        setThemeState(initial);
        setHydrated(true);
        applyTheme(initial);

        const handleMediaChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? "dark" : "light");
        };
        const handleStorage = (e: StorageEvent) => {
            if (e.key !== storageKey) return;
            const next = e.newValue || defaultTheme;
            setThemeState(next);
            applyTheme(next);
        };

        media.addEventListener("change", handleMediaChange);
        window.addEventListener("storage", handleStorage);
        return () => {
            media.removeEventListener("change", handleMediaChange);
            window.removeEventListener("storage", handleStorage);
        };
    }, [applyTheme, defaultTheme, storageKey]);

    React.useEffect(() => {
        if (!hydrated) return;
        applyTheme(theme);
    }, [applyTheme, hydrated, theme, systemTheme]);

    const setTheme = React.useCallback<React.Dispatch<React.SetStateAction<string>>>(
        (value) => {
            setThemeState((prev) => {
                const next = typeof value === "function" ? value(prev) : value;
                try {
                    localStorage.setItem(storageKey, next);
                } catch {
                    // Ignore storage access errors
                }
                applyTheme(next);
                return next;
            });
        },
        [applyTheme, storageKey]
    );

    const resolvedTheme = theme === "system" && enableSystem ? systemTheme : theme;

    const contextValue = React.useMemo<UseThemeProps>(
        () => ({
            theme,
            setTheme,
            resolvedTheme,
            themes: enableSystem ? [...themes, "system"] : themes,
            systemTheme: enableSystem ? systemTheme : undefined,
        }),
        [theme, setTheme, resolvedTheme, enableSystem, themes, systemTheme]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): UseThemeProps {
    const context = React.useContext(ThemeContext);
    if (!context) {
        return {
            theme: undefined,
            setTheme: () => {},
            resolvedTheme: undefined,
            themes: [],
            systemTheme: undefined,
        };
    }
    return context;
}
