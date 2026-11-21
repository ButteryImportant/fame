import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check, Sun, Moon, BookOpen, Sparkles, X } from 'lucide-react';

export const THEMES = [
  {
    id: 'light',
    name: 'Emerald Garden',
    category: 'Light',
    tagline: 'Signature FAME organic green & clean slate',
    icon: Sun,
    primaryColor: '#125945',
    accentColor: '#c5ee8b',
    bgColor: '#ffffff',
    surfaceColor: '#f3f7f5',
  },
  {
    id: 'dark',
    name: 'Midnight Obsidian',
    category: 'Dark',
    tagline: 'Deep OLED black with emerald neon glow',
    icon: Moon,
    primaryColor: '#218464',
    accentColor: '#c5ee8b',
    bgColor: '#081412',
    surfaceColor: '#0c211a',
  },
  {
    id: 'sepia',
    name: 'Warm Sepia Paper',
    category: 'Warm',
    tagline: 'Cozy amber & parchment for long study sessions',
    icon: BookOpen,
    primaryColor: '#b45309',
    accentColor: '#f59e0b',
    bgColor: '#fcf8f2',
    surfaceColor: '#f5ede0',
  },
  {
    id: 'slate',
    name: 'Nordic Slate',
    category: 'Cool Dark',
    tagline: 'Modern cyber navy with electric cyan accents',
    icon: Sparkles,
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    bgColor: '#0b1120',
    surfaceColor: '#131e32',
  },
  {
    id: 'amethyst',
    name: 'Royal Amethyst',
    category: 'Luxury',
    tagline: 'Deep velvet violet with luminous lilac accents',
    icon: Sparkles,
    primaryColor: '#9333ea',
    accentColor: '#c084fc',
    bgColor: '#0e0b16',
    surfaceColor: '#181326',
  },
];

export function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fame-theme');
      if (THEMES.some((t) => t.id === saved)) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('fame-theme', theme);
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fame-theme-changed', { detail: { theme } }));
    }
  }, [theme]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  const activeTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
  const ActiveIcon = activeTheme.icon;

  function selectTheme(themeId) {
    setTheme(themeId);
    setMenuOpen(false);
  }

  return (
    <div className={`theme-picker-wrapper ${className}`} ref={popoverRef}>
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={`Current theme: ${activeTheme.name}. Click to change theme.`}
        title={`Theme: ${activeTheme.name} (Click to personalize)`}
        aria-expanded={menuOpen}
      >
        <span className="theme-toggle-swatch" style={{ background: activeTheme.primaryColor }} />
        <span className="theme-toggle-icon">
          <Palette size={16} />
        </span>
        <span className="theme-toggle-label">{activeTheme.name.split(' ')[0]}</span>
      </button>

      {/* Floating Theme Selection Menu */}
      {menuOpen && (
        <div className="theme-picker-popover" role="dialog" aria-label="Theme selector">
          <div className="theme-picker-header">
            <div>
              <h4>Personalize Theme</h4>
              <p>Choose your preferred learning ambiance</p>
            </div>
            <button
              className="icon-button close-theme-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Close theme menu"
            >
              <X size={16} />
            </button>
          </div>

          <div className="theme-options-grid">
            {THEMES.map((t) => {
              const isSelected = t.id === theme;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  className={`theme-option-card ${isSelected ? 'active' : ''}`}
                  onClick={() => selectTheme(t.id)}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <div className="theme-preview-palette">
                    <span
                      className="swatch-bg"
                      style={{ background: t.bgColor, border: `1px solid ${t.primaryColor}40` }}
                    />
                    <span className="swatch-primary" style={{ background: t.primaryColor }} />
                    <span className="swatch-accent" style={{ background: t.accentColor }} />
                  </div>

                  <div className="theme-option-info">
                    <div className="theme-option-title-row">
                      <strong>{t.name}</strong>
                      {isSelected && <Check size={14} className="theme-check-icon" />}
                    </div>
                    <small>{t.tagline}</small>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
