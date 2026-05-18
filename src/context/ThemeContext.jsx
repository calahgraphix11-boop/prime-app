import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

function resolveMode(mode) {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

function applyTheme(resolved) {
  document.documentElement.setAttribute('data-theme', resolved);
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    // Migrate from old prime_dark key
    const old = localStorage.getItem('prime_dark');
    if (old !== null) {
      const migrated = old === 'true' ? 'dark' : 'light';
      localStorage.removeItem('prime_dark');
      localStorage.setItem('prime-theme', migrated);
      applyTheme(migrated);
      return migrated;
    }
    const saved = localStorage.getItem('prime-theme') || 'dark';
    applyTheme(resolveMode(saved));
    return saved;
  });

  const resolvedTheme = resolveMode(mode);

  const setMode = (newMode) => {
    setModeState(newMode);
    localStorage.setItem('prime-theme', newMode);
    applyTheme(resolveMode(newMode));
  };

  // Keep data-theme in sync when mode changes
  useEffect(() => {
    applyTheme(resolveMode(mode));
  }, [mode]);

  // React to system preference changes when mode === 'system'
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
