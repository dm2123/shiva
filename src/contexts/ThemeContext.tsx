'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'aurora' | 'sunset' | 'ocean' | 'forest' | 'royal';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('shiva-theme') as ThemeMode;
    if (savedTheme && isValidTheme(savedTheme)) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Check system preference for dark mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setThemeState(initialTheme);
      applyTheme(initialTheme);
    }
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('shiva-theme', newTheme);
    applyTheme(newTheme);
  };

  // Prevent flash of unstyled content by deferring theme application until mounted,
  // but always provide the context so useTheme() works during SSR.
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

function isValidTheme(theme: string): theme is ThemeMode {
  return ['light', 'dark', 'aurora', 'sunset', 'ocean', 'forest', 'royal'].includes(theme);
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  
  // Remove all theme classes
  root.classList.remove('light', 'dark', 'aurora', 'sunset', 'ocean', 'forest', 'royal');
  
  // Add new theme class
  root.classList.add(theme);
  
  // Update meta theme-color for mobile browsers
  const themeColors: Record<ThemeMode, string> = {
    'light': '#ffffff',
    'dark': '#0f172a',
    'aurora': '#1e1b4b',
    'sunset': '#7c2d12',
    'ocean': '#164e63',
    'forest': '#14532d',
    'royal': '#3b0764',
  };
  
  if (typeof document !== 'undefined') {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColors[theme]);
    }
  }
}
