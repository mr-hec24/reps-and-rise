import React, { createContext, useContext, useState } from "react";
import { DarkTheme, DefaultTheme } from "./DarkTheme";

type ThemeContextType = {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  theme: any;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<"light" | "dark">("light");

    const toggleTheme = () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
    };

    const theme = mode === "light" ? DefaultTheme : DarkTheme;

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }
  return context;
};