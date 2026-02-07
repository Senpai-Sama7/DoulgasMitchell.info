/**
 * Global Error Handling System
 * Graceful degradation & user feedback
 * Douglas Mitchell Portfolio - 2026
 */

(function() {
  'use strict';

  const ErrorHandler = {
    init() {
      this.setupGlobalErrorHandler();
      this.setupUnhandledRejectionHandler();
      this.setupResourceErrorHandler();
      this.addErrorBoundaries();
    },

    // Global JavaScript error handler
    setupGlobalErrorHandler() {
      window.addEventListener('error', (event) => {
        console.error('[Error Handler] JavaScript Error:', event.error);
        
        // Don't show error UI for minor errors
        if (this.isMinorError(event.error)) {
          return;
        }

        // Log to analytics
        if (window.AnalyticsManager) {
          window.AnalyticsManager.trackEvent('javascript_error', {
            message: event.error?.message || 'Unknown error',
            stack: event.error?.stack?.substring(0, 500),
            url: window.location.href
          });
        }

        // Show user-friendly message
        this.showErrorMessage(
          'Something went wrong',
          'We\'ve encountered an unexpected error. The page will continue to work, but some features may be unavailable.'
        );
      });
    },

    // Unhandled promise rejection handler
    setupUnhandledRejectionHandler() {
      window.addEventListener('unhandledrejection', (event) => {
        console.error('[Error Handler] Unhandled Promise Rejection:', event.reason);
        
        // Log to analytics
        if (window.AnalyticsManager) {
          window.AnalyticsManager.trackEvent('unhandled_rejection', {
            reason: event.reason?.toString() || 'Unknown',
            url: window.location.href
          });
        }

        // Specific handling for common errors
        if (event.reason?.message?.includes('fetch')) {
          this.showErrorMessage(
            'Network Error',
            'Unable to connect. Please check your internet connection.'
          );
        }
      });
    },

    // Resource loading error handler
    setupResourceErrorHandler() {
      window.addEventListener('error', (event) => {
        const element = event.target;
        
        // Handle image load failures
        if (element.tagName === 'IMG') {
          console.warn('[Error Handler] Image failed to load:', element.src);
          element.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23333" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E';
          element.alt = 'Image unavailable';
        }

        // Handle script load failures
        if (element.tagName === 'SCRIPT') {
          console.error('[Error Handler] Script failed to load:', element.src);
          
          // Fallback for critical scripts
          if (element.src.includes('Chart.js')) {
            this.disableCharts();
          }
        }

        // Handle CSS load failures
        if (element.tagName === 'LINK' && element.rel === 'stylesheet') {
          console.error('[Error Handler] Stylesheet failed to load:', element.href);
        }
      }, true);
    },

    // Error boundaries for specific features
    addErrorBoundaries() {
      // Wrap GitHub API calls
      this.wrapFunction('loadGitHubRepos', () => {
        this.showErrorMessage(
          'GitHub Error',
          'Unable to load GitHub repositories. They might be temporarily unavailable.'
        );
      });

      // Wrap game initialization
      this.wrapFunction('initGame', () => {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
          gameContainer.innerHTML = '<p style="text-align:center;padding:40px;color:var(--muted);">Game temporarily unavailable</p>';
        }
      });
    },

    // Wrap function with error boundary
    wrapFunction(functionName, onError) {
      const originalFn = window[functionName];
      if (!originalFn) return;

      window[functionName] = function(...args) {
        try {
          return originalFn.apply(this, args);
        } catch (error) {
          console.error(`[Error Handler] Error in ${functionName}:`, error);
          onError(error);
        }
      };
    },

    // Check if error is minor (can be ignored)
    isMinorError(error) {
      if (!error) return true;
      
      const minorPatterns = [
        'ResizeObserver loop',
        'ResizeObserver loop completed with undelivered notifications',
        'Non-Error promise rejection captured'
      ];
      
      return minorPatterns.some(pattern => 
        error.message?.includes(pattern)
      );
    },

    // Show user-friendly error message
    showErrorMessage(title, message) {
      if (window.showToast) {
        window.showToast(`${title}: ${message}`, 'error', 5000);
      }

      if (window.announce) {
        window.announce(`Error: ${message}`, 'assertive');
      }
    },

    // Disable charts gracefully
    disableCharts() {
      const chartContainers = document.querySelectorAll('.chart-container');
      chartContainers.forEach(container => {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--muted);">Charts temporarily unavailable</p>';
      });
    },

    // Manual error reporting (for use in try-catch blocks)
    report(error, context = {}) {
      console.error('[Error Handler] Manual report:', error, context);
      
      if (window.AnalyticsManager) {
        window.AnalyticsManager.trackEvent('manual_error_report', {
          message: error?.message || error?.toString(),
          context: context,
          url: window.location.href
        });
      }
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ErrorHandler.init());
  } else {
    ErrorHandler.init();
  }

  window.ErrorHandler = ErrorHandler;

})();
