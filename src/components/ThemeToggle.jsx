import { useState } from 'react';
import { SunIcon, MoonIcon } from './Icons';
import './ThemeToggle.css';

// index.html applies the saved theme before first paint; this reads it back.
function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);
  const isDark = theme === 'dark';

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Storage can be blocked (private mode); the toggle still works for this visit.
    }
    setTheme(next);
  };

  return (
    <button type="button" role="switch" aria-checked={isDark} className="theme-toggle" onClick={toggle}>
      <span className="sr-only">Dark mode</span>
      <span className="theme-track" aria-hidden="true">
        <span className="theme-thumb" />
        <SunIcon size={18} className="theme-icon theme-icon-sun" />
        <MoonIcon size={16} className="theme-icon theme-icon-moon" />
      </span>
    </button>
  );
}
