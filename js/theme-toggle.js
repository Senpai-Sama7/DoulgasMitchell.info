/**
 * Advanced Theme Toggle System
 * Supports: Light, Dark, Auto (System Preference)
 * Persists to localStorage
 * Smooth transitions
 * Douglas Mitchell Portfolio - 2026
 */

(function() {
  'use strict';

  const ThemeManager = {
    THEMES: ['light', 'dark', 'auto'],
    STORAGE_KEY: 'dm-theme-preference',
    currentTheme: 'auto',

    init() {
      this.loadThemePreference();
      this.createThemeToggle();
      this.applyTheme();
      this.watchSystemPreference();
      this.addThemeTransitions();
    },

    loadThemePreference() {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      this.currentTheme = saved && this.THEMES.includes(saved) ? saved : 'auto';
    },

    saveThemePreference() {
      localStorage.setItem(this.STORAGE_KEY, this.currentTheme);
    },

    getEffectiveTheme() {
      if (this.currentTheme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return this.currentTheme;
    },

    applyTheme(announce = false) {
      const effectiveTheme = this.getEffectiveTheme();
      document.documentElement.setAttribute('data-theme', effectiveTheme);
      document.documentElement.setAttribute('data-color-scheme', effectiveTheme);
      
      // Update meta theme-color
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', 
          effectiveTheme === 'dark' ? '#060913' : '#e7ecf3'
        );
      }

      this.updateToggleUI();
      
      if (announce && window.announce) {
        window.announce(`Theme changed to ${this.currentTheme} mode`);
      }
    },

    createThemeToggle() {
      const toggleContainer = document.createElement('div');
      toggleContainer.className = 'theme-toggle-container';
      toggleContainer.innerHTML = `
        <button 
          id="theme-toggle" 
          class="theme-toggle-btn glass"
          aria-label="Toggle theme"
          title="Change theme (Light/Dark/Auto)"
        >
          <svg class="theme-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg class="theme-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg class="theme-icon auto-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span class="theme-label">Auto</span>
        </button>
      `;

      // Add to header
      const header = document.querySelector('header');
      if (header) {
        header.style.position = 'relative';
        toggleContainer.style.position = 'absolute';
        toggleContainer.style.top = '20px';
        toggleContainer.style.right = '20px';
        header.appendChild(toggleContainer);
      }

      // Add event listener
      const toggleBtn = document.getElementById('theme-toggle');
      toggleBtn.addEventListener('click', () => this.cycleTheme());

      // Add styles
      this.addThemeToggleStyles();
    },

    addThemeToggleStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .theme-toggle-container {
          z-index: 100;
        }

        .theme-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: 1px solid var(--border);
          background: var(--glass);
          backdrop-filter: blur(14px);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s var(--ease);
          color: var(--text);
        }

        .theme-toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          border-color: var(--accent);
        }

        .theme-toggle-btn:active {
          transform: translateY(0);
        }

        .theme-icon {
          width: 20px;
          height: 20px;
          transition: all 0.3s var(--ease);
          opacity: 0;
          transform: scale(0) rotate(-180deg);
          position: absolute;
        }

        .theme-icon.active {
          opacity: 1;
          transform: scale(1) rotate(0deg);
          position: relative;
        }

        .theme-label {
          font-size: 13px;
          font-weight: 600;
          min-width: 40px;
          text-align: left;
        }

        /* Light theme colors */
        [data-theme="light"] {
          --bg: #f5f5f5;
          --bg-soft: #ffffff;
          --text: #1a1a1a;
          --muted: #666666;
          --accent: #4a7cff;
          --accent-2: #7a4aff;
          --glass: rgba(255, 255, 255, 0.8);
          --border: rgba(0, 0, 0, 0.1);
          --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        /* Dark theme (default) */
        [data-theme="dark"] {
          --bg: #060913;
          --bg-soft: #0b1222;
          --text: #e7ecf3;
          --muted: #9fb0c2;
          --accent: #7aa8ff;
          --accent-2: #9d7aff;
          --glass: rgba(15, 24, 44, 0.35);
          --border: rgba(161, 180, 210, 0.14);
          --shadow: 0 20px 80px rgba(0, 0, 0, 0.55);
        }

        /* Smooth color transitions */
        * {
          transition: background-color 0.3s var(--ease), 
                      color 0.3s var(--ease),
                      border-color 0.3s var(--ease);
        }

        @media (max-width: 680px) {
          .theme-toggle-container {
            top: 10px;
            right: 10px;
          }
          .theme-toggle-btn {
            padding: 8px 12px;
          }
          .theme-label {
            display: none;
          }
        }
      `;
      document.head.appendChild(style);
    },

    cycleTheme() {
      const currentIndex = this.THEMES.indexOf(this.currentTheme);
      const nextIndex = (currentIndex + 1) % this.THEMES.length;
      this.currentTheme = this.THEMES[nextIndex];
      this.saveThemePreference();
      this.applyTheme(true);
    },

    updateToggleUI() {
      const icons = document.querySelectorAll('.theme-icon');
      const label = document.querySelector('.theme-label');
      
      icons.forEach(icon => icon.classList.remove('active'));
      
      if (this.currentTheme === 'light') {
        document.querySelector('.sun-icon')?.classList.add('active');
        if (label) label.textContent = 'Light';
      } else if (this.currentTheme === 'dark') {
        document.querySelector('.moon-icon')?.classList.add('active');
        if (label) label.textContent = 'Dark';
      } else {
        document.querySelector('.auto-icon')?.classList.add('active');
        if (label) label.textContent = 'Auto';
      }
    },

    watchSystemPreference() {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.currentTheme === 'auto') {
          this.applyTheme();
        }
      });
    },

    addThemeTransitions() {
      // Prevent transitions on page load
      document.documentElement.classList.add('no-transitions');
      setTimeout(() => {
        document.documentElement.classList.remove('no-transitions');
      }, 100);

      const style = document.createElement('style');
      style.textContent = `
        .no-transitions * {
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
  } else {
    ThemeManager.init();
  }

  // Make globally available
  window.ThemeManager = ThemeManager;

})();
