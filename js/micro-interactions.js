/**
 * Micro-interactions & Animation System
 * Smooth, delightful user interactions
 * Douglas Mitchell Portfolio - 2026
 */

(function() {
  'use strict';

  const MicroInteractions = {
    init() {
      this.magneticButtons();
      this.cardTilt();
      this.smoothScroll();
      this.revealOnScroll();
      this.cursorEffects();
      this.rippleEffect();
      this.toastNotifications();
    },

    // Magnetic button effect
    magneticButtons() {
      const buttons = document.querySelectorAll('.btn');
      
      buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
          const rect = button.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          const moveX = x * 0.3;
          const moveY = y * 0.3;
          
          button.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });

        button.addEventListener('mouseleave', () => {
          button.style.transform = 'translate(0, 0)';
        });
      });
    },

    // 3D card tilt effect
    cardTilt() {
      const cards = document.querySelectorAll('.card.frame');
      
      cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((y - centerY) / centerY) * -5;
          const rotateY = ((x - centerX) / centerX) * 5;
          
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
      });
    },

    // Smooth scroll to anchors
    smoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (href === '#' || href === '#!') return;
          
          e.preventDefault();
          const target = document.querySelector(href);
          
          if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });

            // Focus management
            target.setAttribute('tabindex', '-1');
            target.focus();
            setTimeout(() => target.removeAttribute('tabindex'), 100);
          }
        });
      });
    },

    // Reveal elements on scroll
    revealOnScroll() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('on');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
      });
    },

    // Custom cursor effects
    cursorEffects() {
      // Only on devices with mouse
      if (window.matchMedia('(pointer: fine)').matches) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
        });

        const animateCursor = () => {
          const speed = 0.15;
          cursorX += (mouseX - cursorX) * speed;
          cursorY += (mouseY - cursorY) * speed;
          
          cursor.style.left = cursorX + 'px';
          cursor.style.top = cursorY + 'px';
          
          requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Cursor interactions
        document.querySelectorAll('a, button, .card').forEach(el => {
          el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
          el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
        });

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
          .custom-cursor {
            position: fixed;
            width: 20px;
            height: 20px;
            border: 2px solid var(--accent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
            transition: transform 0.2s ease, opacity 0.2s ease;
            transform: translate(-50%, -50%);
          }
          .custom-cursor.cursor-hover {
            transform: translate(-50%, -50%) scale(2);
            background: var(--accent);
            opacity: 0.3;
          }
          @media (max-width: 768px) {
            .custom-cursor { display: none; }
          }
        `;
        document.head.appendChild(style);
      }
    },

    // Ripple effect on clicks
    rippleEffect() {
      document.addEventListener('click', (e) => {
        const button = e.target.closest('.btn, button');
        if (!button) return;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });

      // Add ripple styles
      const style = document.createElement('style');
      style.textContent = `
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
        }
        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    },

    // Toast notification system
    toastNotifications() {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);

      window.showToast = (message, type = 'info', duration = 3000) => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} glass`;
        
        const icons = {
          success: '✅',
          error: '❌',
          warning: '⚠️',
          info: 'ℹ️'
        };
        
        toast.innerHTML = `
          <span class="toast-icon">${icons[type] || icons.info}</span>
          <span class="toast-message">${message}</span>
          <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close notification">×</button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
          toast.classList.add('toast-show');
        }, 10);
        
        setTimeout(() => {
          toast.classList.remove('toast-show');
          setTimeout(() => toast.remove(), 300);
        }, duration);
      };

      // Add toast styles
      const style = document.createElement('style');
      style.textContent = `
        #toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 400px;
        }
        .toast {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--glass);
          backdrop-filter: blur(14px);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: var(--shadow);
          opacity: 0;
          transform: translateX(400px);
          transition: all 0.3s var(--ease);
        }
        .toast.toast-show {
          opacity: 1;
          transform: translateX(0);
        }
        .toast-icon {
          font-size: 20px;
          flex-shrink: 0;
        }
        .toast-message {
          flex-grow: 1;
          font-size: 14px;
          color: var(--text);
        }
        .toast-close {
          background: none;
          border: none;
          color: var(--muted);
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: color 0.2s ease;
        }
        .toast-close:hover {
          color: var(--text);
        }
        @media (max-width: 680px) {
          #toast-container {
            left: 20px;
            right: 20px;
            max-width: none;
          }
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MicroInteractions.init());
  } else {
    MicroInteractions.init();
  }

  window.MicroInteractions = MicroInteractions;

})();
