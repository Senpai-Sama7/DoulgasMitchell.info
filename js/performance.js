/**
 * Performance Monitoring & Optimization System
 * Web Vitals Tracking + Lazy Loading
 * Douglas Mitchell Portfolio - 2026
 */

(function() {
  'use strict';

  const PerformanceManager = {
    metrics: {},
    
    init() {
      this.registerServiceWorker();
      this.trackWebVitals();
      this.lazyLoadImages();
      this.lazyLoadCharts();
      this.optimizeVideos();
      this.addResourceHints();
      this.monitorLongTasks();
    },

    // Service Worker Registration
    registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('[Performance] Service Worker registered:', registration.scope);
              
              // Check for updates
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.showUpdateNotification();
                  }
                });
              });
            })
            .catch((error) => {
              console.error('[Performance] Service Worker registration failed:', error);
            });
        });
      }
    },

    showUpdateNotification() {
      if (window.announce) {
        window.announce('New version available! Refresh to update.', 'assertive');
      }
      
      // Show update banner
      const banner = document.createElement('div');
      banner.className = 'update-banner glass';
      banner.innerHTML = `
        <span>🎉 New version available!</span>
        <button onclick="location.reload()" class="btn primary btn--sm">Refresh Now</button>
        <button onclick="this.parentElement.remove()" class="btn btn--sm">Later</button>
      `;
      document.body.appendChild(banner);

      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .update-banner {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 24px;
          background: var(--glass);
          backdrop-filter: blur(14px);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: var(--shadow);
          z-index: 1000;
          animation: slideUp 0.3s var(--ease);
        }
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    },

    // Web Vitals Tracking
    trackWebVitals() {
      // LCP - Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
            console.log('[Performance] LCP:', this.metrics.lcp.toFixed(2), 'ms');
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // FID - First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              this.metrics.fid = entry.processingStart - entry.startTime;
              console.log('[Performance] FID:', this.metrics.fid.toFixed(2), 'ms');
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // CLS - Cumulative Layout Shift
          let clsScore = 0;
          const clsObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (!entry.hadRecentInput) {
                clsScore += entry.value;
              }
            });
            this.metrics.cls = clsScore;
            console.log('[Performance] CLS:', this.metrics.cls.toFixed(4));
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('[Performance] Performance Observer not fully supported');
        }
      }

      // Navigation Timing
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            this.metrics.ttfb = perfData.responseStart - perfData.requestStart;
            this.metrics.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
            this.metrics.loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            console.log('[Performance] Metrics:', {
              'TTFB': this.metrics.ttfb.toFixed(2) + 'ms',
              'DOM Content Loaded': this.metrics.domContentLoaded.toFixed(2) + 'ms',
              'Load Time': this.metrics.loadTime.toFixed(2) + 'ms'
            });
          }
        }, 0);
      });
    },

    // Lazy Load Images
    lazyLoadImages() {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Handle srcset
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            
            // Handle src
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observe all images with data-src
      document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
        imageObserver.observe(img);
      });

      // Add fade-in effect
      const style = document.createElement('style');
      style.textContent = `
        img[data-src] {
          opacity: 0;
          transition: opacity 0.3s var(--ease);
        }
        img.loaded {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    },

    // Lazy Load Chart.js
    lazyLoadCharts() {
      const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !window.Chart) {
            // Chart.js already loaded in main HTML, but we could defer it
            console.log('[Performance] Charts section visible');
          }
        });
      }, { rootMargin: '200px' });

      const dashboardSection = document.getElementById('scene-dashboard');
      if (dashboardSection) {
        chartObserver.observe(dashboardSection);
      }
    },

    // Optimize Video Loading
    optimizeVideos() {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting) {
            if (video.paused) {
              video.play().catch(() => {});
            }
          } else {
            if (!video.paused) {
              video.pause();
            }
          }
        });
      }, { threshold: 0.25 });

      document.querySelectorAll('video').forEach(video => {
        videoObserver.observe(video);
      });
    },

    // Add Resource Hints
    addResourceHints() {
      const hints = [
        { rel: 'preconnect', href: 'https://api.github.com' },
        { rel: 'dns-prefetch', href: 'https://cdn.coverr.co' },
        { rel: 'prefetch', href: '/assets/cover.jpg', as: 'image' }
      ];

      hints.forEach(hint => {
        const link = document.createElement('link');
        Object.keys(hint).forEach(key => link.setAttribute(key, hint[key]));
        document.head.appendChild(link);
      });
    },

    // Monitor Long Tasks
    monitorLongTasks() {
      if ('PerformanceObserver' in window) {
        try {
          const longTaskObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (entry.duration > 50) {
                console.warn('[Performance] Long task detected:', entry.duration.toFixed(2), 'ms');
              }
            });
          });
          longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (e) {
          // Long task API not supported
        }
      }
    },

    // Get performance report
    getReport() {
      return {
        metrics: this.metrics,
        navigation: performance.getEntriesByType('navigation')[0],
        resources: performance.getEntriesByType('resource').length,
        memory: performance.memory ? {
          usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
          totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB'
        } : null
      };
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PerformanceManager.init());
  } else {
    PerformanceManager.init();
  }

  // Make globally available
  window.PerformanceManager = PerformanceManager;

  // Log performance report after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('[Performance] Full Report:', PerformanceManager.getReport());
    }, 3000);
  });

})();
