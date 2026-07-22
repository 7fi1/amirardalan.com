'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/store/theme';
import { Theme } from '@/types/theme';

export default function ThemeMenu() {
  const router = useRouter();
  const { theme, setTheme, initializeTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const systemButtonRef = useRef<HTMLSpanElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const shouldManageFocusRef = useRef(false);

  const updateMenuPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const viewportPadding = 8;
    const buttonRect = button.getBoundingClientRect();
    const systemButtonWidth =
      systemButtonRef.current?.getBoundingClientRect().width ??
      buttonRect.width;
    const menuWidth =
      window.innerWidth < 768
        ? Math.max(buttonRect.width, systemButtonWidth)
        : buttonRect.width;

    setMenuPosition({
      top: buttonRect.bottom + 8,
      left: Math.min(
        Math.max(viewportPadding, buttonRect.left),
        window.innerWidth - menuWidth - viewportPadding
      ),
      width: menuWidth,
    });
  }, []);

  // Initialize theme
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Handle system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        // Re-initialize theme when system preference changes
        initializeTheme();
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, initializeTheme]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !menuPanelRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    return () => window.removeEventListener('resize', updateMenuPosition);
  }, [menuOpen, updateMenuPosition]);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (menuOpen && shouldManageFocusRef.current && firstItemRef.current) {
      firstItemRef.current.focus();
    }
  }, [menuOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setMenuOpen(false);
      buttonRef.current?.focus();
      return;
    }

    if (!menuOpen || !menuPanelRef.current) return;

    const items = Array.from(
      menuPanelRef.current.querySelectorAll<HTMLButtonElement>(
        '[role="menuitemradio"]'
      )
    );
    const currentIndex = items.indexOf(
      document.activeElement as HTMLButtonElement
    );

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const direction = e.key === 'ArrowDown' ? 1 : -1;
      const nextIndex =
        currentIndex < 0
          ? 0
          : (currentIndex + direction + items.length) % items.length;
      items[nextIndex]?.focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      items[e.key === 'Home' ? 0 : items.length - 1]?.focus();
    }
  };

  const handleThemeChange = (newTheme: Theme, returnFocus: boolean) => {
    setTheme(newTheme);
    setMenuOpen(false);
    if (returnFocus) {
      buttonRef.current?.focus();
    } else {
      buttonRef.current?.blur();
    }
    router.refresh();
  };

  const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    shouldManageFocusRef.current = event.detail === 0;
    if (!menuOpen) updateMenuPosition();
    setMenuOpen((isOpen) => !isOpen);
    buttonRef.current?.blur();
  };

  const themeLabel = `${theme.charAt(0).toUpperCase()}${theme.slice(1)}`;

  return (
    <div className="relative" ref={menuRef} onKeyDown={handleKeyDown}>
      <button
        id="theme-menu-button"
        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/40 px-3 py-2 text-xs text-dark transition-colors hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-light dark:hover:bg-white/10"
        onClick={toggleMenu}
        ref={buttonRef}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`Theme, current selection: ${themeLabel}`}
      >
        <span className="hidden md:inline">Theme:</span>
        <span>{themeLabel}</span>
        <svg
          className={`size-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m2.5 4.5 3.5 3 3.5-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <span
        ref={systemButtonRef}
        className="pointer-events-none invisible absolute left-0 top-0 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-transparent px-3 py-2 text-xs md:hidden"
        aria-hidden="true"
      >
        <span>System</span>
        <span className="size-3 shrink-0" />
      </span>
      {menuOpen &&
        createPortal(
          <div
            ref={menuPanelRef}
            className="fixed z-[100] overflow-clip rounded-lg bg-white/60 p-1 font-mono ring-1 ring-inset ring-black/[0.06] backdrop-blur-2xl dark:bg-zinc-950/50 dark:text-light dark:ring-white/[0.08]"
            style={menuPosition}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="theme-menu-button"
          >
            {(['system', 'light', 'dark'] as Theme[]).map((t, index) => (
              <button
                key={t}
                ref={index === 0 ? firstItemRef : null}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-xxs uppercase tracking-[0.08em] transition-colors hover:bg-black/5 hover:text-dark dark:hover:bg-white/[0.07] dark:hover:text-light ${theme === t ? 'bg-black/[0.035] text-primary dark:bg-white/[0.05] dark:text-primary' : 'text-zinc-600 dark:text-zinc-300'}`}
                onClick={(event) => handleThemeChange(t, event.detail === 0)}
                role="menuitemradio"
                aria-checked={theme === t}
              >
                <span>{t}</span>
                {theme === t && (
                  <span
                    className="size-1 rounded-full bg-current"
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
