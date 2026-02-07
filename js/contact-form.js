/**
 * Advanced Contact Form System
 * Form validation, submission handling, error states
 * Douglas Mitchell Portfolio - 2026
 */

(function() {
  'use strict';

  const ContactFormManager = {
    init() {
      this.createContactSection();
      this.setupFormValidation();
      this.setupSubmissionHandler();
    },

    createContactSection() {
      const contactHTML = `
        <section id="scene-contact" class="wrap">
          <h3 class="section-title reveal">Get In Touch</h3>
          <div class="grid">
            <div class="card glass" style="grid-column: 3 / span 8;">
              <form id="contactForm" class="contact-form" novalidate>
                <div class="form-group">
                  <label for="contact-name" class="form-label">
                    Name <span class="required" aria-label="required">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="contact-name" 
                    name="name"
                    class="form-input"
                    required
                    aria-required="true"
                    aria-describedby="name-error"
                  />
                  <span id="name-error" class="error-message" role="alert"></span>
                </div>

                <div class="form-group">
                  <label for="contact-email" class="form-label">
                    Email <span class="required" aria-label="required">*</span>
                  </label>
                  <input 
                    type="email" 
                    id="contact-email" 
                    name="email"
                    class="form-input"
                    required
                    aria-required="true"
                    aria-describedby="email-error"
                  />
                  <span id="email-error" class="error-message" role="alert"></span>
                </div>

                <div class="form-group">
                  <label for="contact-subject" class="form-label">
                    Subject <span class="required" aria-label="required">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="contact-subject" 
                    name="subject"
                    class="form-input"
                    required
                    aria-required="true"
                    aria-describedby="subject-error"
                  />
                  <span id="subject-error" class="error-message" role="alert"></span>
                </div>

                <div class="form-group">
                  <label for="contact-message" class="form-label">
                    Message <span class="required" aria-label="required">*</span>
                  </label>
                  <textarea 
                    id="contact-message" 
                    name="message"
                    class="form-input"
                    rows="6"
                    required
                    aria-required="true"
                    aria-describedby="message-error"
                  ></textarea>
                  <span id="message-error" class="error-message" role="alert"></span>
                </div>

                <div class="form-actions">
                  <button 
                    type="submit" 
                    class="btn primary"
                    id="contact-submit"
                  >
                    <span class="btn-text">Send Message</span>
                    <span class="btn-loader" style="display: none;">
                      <svg class="spinner" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      Sending...
                    </span>
                  </button>
                  <button type="reset" class="btn glass">Clear Form</button>
                </div>

                <div id="form-message" class="form-feedback" role="status" aria-live="polite"></div>
              </form>
            </div>
          </div>
        </section>
      `;

      // Insert before footer
      const footer = document.querySelector('footer');
      if (footer) {
        footer.insertAdjacentHTML('beforebegin', contactHTML);
      }

      this.addFormStyles();
    },

    addFormStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .contact-form {
          padding: 32px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 14px;
          color: var(--text);
        }

        .required {
          color: var(--accent);
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg-soft);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-family: inherit;
          font-size: 14px;
          transition: all 0.3s var(--ease);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(122, 168, 255, 0.1);
        }

        .form-input.error {
          border-color: #ff5555;
        }

        .form-input.success {
          border-color: #50fa7b;
        }

        .error-message {
          display: block;
          margin-top: 6px;
          font-size: 13px;
          color: #ff5555;
          min-height: 18px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }

        .btn-loader {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spinner {
          width: 18px;
          height: 18px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .form-feedback {
          margin-top: 20px;
          padding: 16px;
          border-radius: 8px;
          font-size: 14px;
          display: none;
        }

        .form-feedback.success {
          display: block;
          background: rgba(80, 250, 123, 0.1);
          border: 1px solid rgba(80, 250, 123, 0.3);
          color: #50fa7b;
        }

        .form-feedback.error {
          display: block;
          background: rgba(255, 85, 85, 0.1);
          border: 1px solid rgba(255, 85, 85, 0.3);
          color: #ff5555;
        }

        textarea.form-input {
          resize: vertical;
          min-height: 120px;
        }

        @media (max-width: 680px) {
          .contact-form {
            padding: 20px;
          }
          #scene-contact .card {
            grid-column: span 12 !important;
          }
        }
      `;
      document.head.appendChild(style);
    },

    setupFormValidation() {
      const form = document.getElementById('contactForm');
      if (!form) return;

      const inputs = form.querySelectorAll('.form-input');
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearFieldError(input));
      });
    },

    validateField(field) {
      const value = field.value.trim();
      const errorSpan = document.getElementById(`${field.id.split('-')[1]}-error`);
      
      // Clear previous error
      field.classList.remove('error', 'success');
      if (errorSpan) errorSpan.textContent = '';

      // Required validation
      if (field.hasAttribute('required') && !value) {
        this.setFieldError(field, 'This field is required');
        return false;
      }

      // Email validation
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          this.setFieldError(field, 'Please enter a valid email address');
          return false;
        }
      }

      // Min length for message
      if (field.name === 'message' && value && value.length < 10) {
        this.setFieldError(field, 'Message must be at least 10 characters');
        return false;
      }

      // Success
      field.classList.add('success');
      return true;
    },

    setFieldError(field, message) {
      field.classList.add('error');
      const errorSpan = document.getElementById(`${field.id.split('-')[1]}-error`);
      if (errorSpan) {
        errorSpan.textContent = message;
      }
    },

    clearFieldError(field) {
      field.classList.remove('error');
      const errorSpan = document.getElementById(`${field.id.split('-')[1]}-error`);
      if (errorSpan) errorSpan.textContent = '';
    },

    setupSubmissionHandler() {
      const form = document.getElementById('contactForm');
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields
        const inputs = form.querySelectorAll('.form-input');
        let isValid = true;
        inputs.forEach(input => {
          if (!this.validateField(input)) {
            isValid = false;
          }
        });

        if (!isValid) {
          this.showFeedback('Please correct the errors above', 'error');
          return;
        }

        // Show loading state
        const submitBtn = document.getElementById('contact-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
          // Replace with your actual endpoint
          // Example: FormSpree, Netlify Forms, or custom API
          const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });

          if (response.ok) {
            this.showFeedback('✅ Message sent successfully! I\'ll get back to you soon.', 'success');
            form.reset();
            inputs.forEach(input => input.classList.remove('success'));
            
            if (window.announce) {
              window.announce('Message sent successfully');
            }

            // Track event
            if (window.AnalyticsManager) {
              window.AnalyticsManager.trackEvent('contact_form_submit', { success: true });
            }
          } else {
            throw new Error('Submission failed');
          }
        } catch (error) {
          console.error('Form submission error:', error);
          this.showFeedback('⚠️ Failed to send message. Please try again or email me directly.', 'error');
          
          // Track error
          if (window.AnalyticsManager) {
            window.AnalyticsManager.trackEvent('contact_form_error', { error: error.message });
          }
        } finally {
          // Reset button state
          submitBtn.disabled = false;
          btnText.style.display = 'inline';
          btnLoader.style.display = 'none';
        }
      });

      // Reset handler
      form.addEventListener('reset', () => {
        const inputs = form.querySelectorAll('.form-input');
        inputs.forEach(input => {
          input.classList.remove('error', 'success');
          this.clearFieldError(input);
        });
        this.hideFeedback();
      });
    },

    showFeedback(message, type) {
      const feedback = document.getElementById('form-message');
      if (feedback) {
        feedback.textContent = message;
        feedback.className = `form-feedback ${type}`;
        feedback.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
          setTimeout(() => this.hideFeedback(), 5000);
        }
      }
    },

    hideFeedback() {
      const feedback = document.getElementById('form-message');
      if (feedback) {
        feedback.style.display = 'none';
      }
    }
  };

  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ContactFormManager.init());
  } else {
    ContactFormManager.init();
  }

  window.ContactFormManager = ContactFormManager;

})();
