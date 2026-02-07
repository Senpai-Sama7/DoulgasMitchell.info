/**
 * Analytics & Event Tracking System
 * Privacy-friendly, GDPR compliant
 * Douglas Mitchell Portfolio - 2026
 */

(function() {
  'use strict';

  const AnalyticsManager = {
    events: [],
    sessionStart: Date.now(),

    init() {
      this.trackPageView();
      this.trackScrollDepth();
      this.trackTimeOnPage();
      this.trackClicks();
      this.trackGameInteractions();
      this.setupBeforeUnload();
    },

    // Track page view
    trackPageView() {
      this.trackEvent('page_view', {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      });
    },

    // Track scroll depth
    trackScrollDepth() {
      const thresholds = [25, 50, 75, 100];
      const tracked = new Set();

      const calculateScrollDepth = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const depth = Math.round((scrolled / scrollHeight) * 100);
        return depth;
      };

      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const depth = calculateScrollDepth();
            
            thresholds.forEach(threshold => {
              if (depth >= threshold && !tracked.has(threshold)) {
                tracked.add(threshold);
                this.trackEvent('scroll_depth', {
                  depth: threshold,
                  timestamp: Date.now() - this.sessionStart
                });
              }
            });

            ticking = false;
          });
          ticking = true;
        }
      });
    },

    // Track time on page
    trackTimeOnPage() {
      window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - this.sessionStart) / 1000);
        this.trackEvent('time_on_page', {
          seconds: timeOnPage,
          minutes: Math.round(timeOnPage / 60)
        });
      });

      // Track engagement every 30 seconds
      setInterval(() => {
        const elapsed = Math.round((Date.now() - this.sessionStart) / 1000);
        if (document.visibilityState === 'visible') {
          this.trackEvent('engagement_heartbeat', {
            elapsed_seconds: elapsed
          });
        }
      }, 30000);
    },

    // Track CTA clicks
    trackClicks() {
      // Track all button clicks
      document.addEventListener('click', (e) => {
        const button = e.target.closest('.btn, button');
        if (button) {
          const label = button.textContent.trim() || 
                       button.getAttribute('aria-label') ||
                       'Unknown Button';
          
          this.trackEvent('button_click', {
            label: label,
            id: button.id || null,
            class: button.className
          });
        }

        // Track card clicks
        const card = e.target.closest('.card');
        if (card) {
          const title = card.querySelector('.name')?.textContent || 'Unknown Card';
          this.trackEvent('card_click', {
            title: title
          });
        }

        // Track external links
        const link = e.target.closest('a[href]');
        if (link && link.hostname !== window.location.hostname) {
          this.trackEvent('external_link_click', {
            url: link.href,
            text: link.textContent.trim()
          });
        }

        // Track book purchase clicks
        if (link && (link.href.includes('stripe.com') || link.href.includes('amazon.com'))) {
          this.trackEvent('book_purchase_intent', {
            platform: link.href.includes('stripe') ? 'stripe' : 'amazon',
            product: link.textContent.includes('eBook') ? 'ebook' : 'hardcover'
          });
        }
      });
    },

    // Track game interactions
    trackGameInteractions() {
      // Listen for custom game events
      window.addEventListener('game:start', () => {
        this.trackEvent('game_start', { game: 'astro_aviator' });
      });

      window.addEventListener('game:end', (e) => {
        this.trackEvent('game_end', {
          game: 'astro_aviator',
          score: e.detail?.score || 0,
          duration: e.detail?.duration || 0
        });
      });

      // Track AI Ideator usage
      const ideatorBtn = document.getElementById('generateIdeaBtn');
      if (ideatorBtn) {
        ideatorBtn.addEventListener('click', () => {
          this.trackEvent('ai_ideator_use');
        });
      }
    },

    // Setup beforeunload tracking
    setupBeforeUnload() {
      window.addEventListener('beforeunload', () => {
        // Send any pending analytics
        if (this.events.length > 0) {
          this.flush(true);
        }
      });

      // Also flush periodically
      setInterval(() => {
        if (this.events.length > 0) {
          this.flush();
        }
      }, 60000); // Every minute
    },

    // Track custom event
    trackEvent(eventName, properties = {}) {
      const event = {
        name: eventName,
        properties: properties,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      this.events.push(event);
      console.log('[Analytics]', eventName, properties);

      // Flush if too many events
      if (this.events.length >= 10) {
        this.flush();
      }
    },

    // Send events to analytics endpoint
    flush(useBeacon = false) {
      if (this.events.length === 0) return;

      const payload = {
        events: this.events,
        session: {
          start: this.sessionStart,
          duration: Date.now() - this.sessionStart
        },
        page: {
          url: window.location.href,
          title: document.title,
          referrer: document.referrer
        }
      };

      const endpoint = '/api/analytics'; // Replace with your endpoint

      if (useBeacon && navigator.sendBeacon) {
        // Use sendBeacon for reliable sending on page unload
        navigator.sendBeacon(endpoint, JSON.stringify(payload));
      } else {
        // Regular fetch
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(err => console.error('[Analytics] Flush error:', err));
      }

      this.events = [];
    },

    // Get session summary
    getSessionSummary() {
      return {
        duration: Date.now() - this.sessionStart,
        events: this.events.length,
        url: window.location.href
      };
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AnalyticsManager.init());
  } else {
    AnalyticsManager.init();
  }

  window.AnalyticsManager = AnalyticsManager;

})();
