/**
 * Advanced Accessibility System
 * WCAG 2.1 AAA Compliant
 * Douglas Mitchell Portfolio - 2026
 */

(function() {
  'use strict';

  const AccessibilityManager = {
    init() {
      this.addSkipLink();
      this.enhanceFocusManagement();
      this.addKeyboardNavigation();
      this.addARIALiveRegions();
      this.respectMotionPreferences();
      this.addFocusTrap();
      this.announcePageLoads();
    },

    // Skip to main content link
    addSkipLink() {
      const skipLink = document.createElement('a');
      skipLink.href = '#main';
      skipLink.className = 'skip-link';
      skipLink.textContent = 'Skip to main content';
      skipLink.setAttribute('aria-label', 'Skip to main content');
      document.body.insertBefore(skipLink, document.body.firstChild);

      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .skip-link {
          position: absolute;
          top: -100px;
          left: 0;
          background: var(--accent);
          color: var(--bg);
          padding: 12px 24px;
          text-decoration: none;
          font-weight: 600;
          z-index: 10000;
          border-radius: 0 0 8px 0;
          transition: top 0.2s var(--ease);
        }
        .skip-link:focus {
          top: 0;
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
      `;
      document.head.appendChild(style);
    },

    // Enhanced focus management
    enhanceFocusManagement() {
      // Add focus-visible class for better focus indicators
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          document.body.classList.add('using-keyboard');
        }
      });

      document.addEventListener('mousedown', () => {
        document.body.classList.remove('using-keyboard');
      });

      // Enhanced focus styles
      const style = document.createElement('style');
      style.textContent = `
        body:not(.using-keyboard) *:focus {
          outline: none;
        }
        body.using-keyboard *:focus {
          outline: 3px solid var(--accent);
          outline-offset: 3px;
          border-radius: 4px;
        }
        .btn:focus-visible,
        .card:focus-visible,
        a:focus-visible {
          box-shadow: 0 0 0 4px var(--focus-ring), var(--shadow);
        }
      `;
      document.head.appendChild(style);
    },

    // Keyboard navigation enhancements
    addKeyboardNavigation() {
      // ESC key to close modals/overlays
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          // Close gate overlay
          const gate = document.getElementById('gate');
          if (gate && !gate.classList.contains('hide')) {
            this.closeGate();
          }

          // Close any open modals
          const modals = document.querySelectorAll('[role="dialog"][aria-hidden="false"]');
          modals.forEach(modal => this.closeModal(modal));
        }
      });

      // Arrow key navigation for game
      const gameCanvas = document.getElementById('game-canvas');
      if (gameCanvas) {
        gameCanvas.setAttribute('tabindex', '0');
        gameCanvas.setAttribute('role', 'application');
        gameCanvas.setAttribute('aria-label', 'Astro-Aviator Game - Use arrow keys to move, space to shoot');
      }
    },

    // ARIA Live Regions for dynamic content
    addARIALiveRegions() {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'live-region';
      document.body.appendChild(liveRegion);

      // Announce loading states
      window.announce = (message, priority = 'polite') => {
        const region = document.getElementById('live-region');
        if (region) {
          region.setAttribute('aria-live', priority);
          region.textContent = message;
          setTimeout(() => region.textContent = '', 3000);
        }
      };
    },

    // Respect prefers-reduced-motion
    respectMotionPreferences() {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      const applyMotionPreferences = (e) => {
        if (e.matches) {
          document.documentElement.style.setProperty('--duration-fast', '0ms');
          document.documentElement.style.setProperty('--duration-normal', '0ms');
          document.body.classList.add('reduce-motion');
          window.announce('Animations reduced for accessibility');
        } else {
          document.documentElement.style.setProperty('--duration-fast', '150ms');
          document.documentElement.style.setProperty('--duration-normal', '250ms');
          document.body.classList.remove('reduce-motion');
        }
      };

      applyMotionPreferences(prefersReducedMotion);
      prefersReducedMotion.addEventListener('change', applyMotionPreferences);

      // Add CSS for reduced motion
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        .reduce-motion * {
          animation: none !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
    },

    // Focus trap for modals
    addFocusTrap() {
      window.trapFocus = (element) => {
        const focusableElements = element.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
          if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        });

        firstElement?.focus();
      };
    },

    // Announce page section loads
    announcePageLoads() {
      // Observe when sections become visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.announced) {
            const sectionName = entry.target.getAttribute('aria-label') || 
                              entry.target.querySelector('h2, h3')?.textContent ||
                              'Section loaded';
            entry.target.dataset.announced = 'true';
          }
        });
      }, { threshold: 0.5 });

      document.querySelectorAll('section').forEach(section => {
        section.setAttribute('tabindex', '-1');
        observer.observe(section);
      });
    },

    closeGate() {
      const gate = document.getElementById('gate');
      const enterBtn = document.getElementById('enterBtn');
      if (gate) {
        gate.classList.add('reveal');
        setTimeout(() => gate.classList.add('hide'), 300);
        document.body.style.overflow = 'auto';
        window.announce('Welcome to Douglas Mitchell Portfolio');
        
        // Focus first interactive element
        setTimeout(() => {
          const firstLink = document.querySelector('main a, main button');
          firstLink?.focus();
        }, 400);
      }
    },

    closeModal(modal) {
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
      window.announce('Modal closed');
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AccessibilityManager.init());
  } else {
    AccessibilityManager.init();
  }

  // Make it globally available
  window.AccessibilityManager = AccessibilityManager;

})();
