/**
 * Loading States & Skeleton Screens
 * Enhanced UX during async operations
 * Douglas Mitchell Portfolio - 2026
 */

(function() {
  'use strict';

  const LoadingManager = {
    init() {
      this.createSkeletonScreens();
      this.enhanceGitHubLoading();
      this.enhanceChartLoading();
      this.addLoadingStyles();
    },

    // Skeleton screens for GitHub repos
    createSkeletonScreens() {
      const repoList = document.querySelector('.repo-list');
      if (!repoList) return;

      // Store original content
      const originalContent = repoList.innerHTML;

      // Create skeleton
      const skeletons = Array.from({ length: 6 }, () => `
        <div class="repo glass skeleton-loader">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text" style="width: 80%;"></div>
          <div class="skeleton-line skeleton-badge" style="width: 40%; margin-top: 12px;"></div>
        </div>
      `).join('');

      // Show skeleton initially
      repoList.innerHTML = skeletons;

      // Replace with actual content when loaded
      window.addEventListener('repos-loaded', () => {
        repoList.innerHTML = originalContent;
      });
    },

    // Enhanced GitHub loading
    enhanceGitHubLoading() {
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        
        if (typeof url === 'string' && url.includes('api.github.com')) {
          // Show loading indicator
          LoadingManager.showLoading('github');
          
          return originalFetch.apply(this, args)
            .then(response => {
              LoadingManager.hideLoading('github');
              return response;
            })
            .catch(error => {
              LoadingManager.hideLoading('github');
              LoadingManager.showError('github', 'Failed to load GitHub data');
              throw error;
            });
        }
        
        return originalFetch.apply(this, args);
      };
    },

    // Enhanced chart loading
    enhanceChartLoading() {
      const chartContainers = document.querySelectorAll('.chart-container');
      
      chartContainers.forEach(container => {
        const canvas = container.querySelector('canvas');
        if (!canvas) return;

        // Add loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'chart-loading-overlay';
        overlay.innerHTML = `
          <div class="loading-spinner"></div>
          <p>Loading chart data...</p>
        `;
        container.style.position = 'relative';
        container.appendChild(overlay);

        // Remove overlay when chart renders
        const observer = new MutationObserver(() => {
          if (canvas.style.display !== 'none') {
            overlay.remove();
            observer.disconnect();
          }
        });
        observer.observe(canvas, { attributes: true, attributeFilter: ['style'] });
      });
    },

    showLoading(context) {
      const indicator = document.createElement('div');
      indicator.className = 'loading-indicator';
      indicator.dataset.context = context;
      indicator.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      `;
      document.body.appendChild(indicator);
    },

    hideLoading(context) {
      const indicator = document.querySelector(`.loading-indicator[data-context="${context}"]`);
      if (indicator) {
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 300);
      }
    },

    showError(context, message) {
      if (window.showToast) {
        window.showToast(message, 'error');
      }
    },

    addLoadingStyles() {
      const style = document.createElement('style');
      style.textContent = `
        /* Skeleton Loader */
        .skeleton-loader {
          pointer-events: none;
        }
        .skeleton-line {
          height: 16px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s ease-in-out infinite;
          border-radius: 4px;
          margin-bottom: 12px;
        }
        .skeleton-title {
          height: 24px;
          width: 60%;
        }
        .skeleton-text {
          height: 14px;
        }
        .skeleton-badge {
          height: 20px;
          border-radius: 12px;
        }
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Loading Spinner */
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(122, 168, 255, 0.2);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Loading Indicator */
        .loading-indicator {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 32px;
          background: var(--glass);
          backdrop-filter: blur(14px);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow);
          z-index: 9999;
          transition: opacity 0.3s ease;
        }
        .loading-indicator p {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
        }

        /* Chart Loading Overlay */
        .chart-loading-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: var(--bg-soft);
          border-radius: var(--radius);
          z-index: 10;
        }
        .chart-loading-overlay p {
          color: var(--muted);
          font-size: 14px;
        }

        /* Progressive Image Loading */
        img[data-src] {
          filter: blur(10px);
          transition: filter 0.3s ease;
        }
        img.loaded {
          filter: blur(0);
        }

        /* Button Loading State */
        .btn[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LoadingManager.init());
  } else {
    LoadingManager.init();
  }

  window.LoadingManager = LoadingManager;

})();
