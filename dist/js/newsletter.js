/**
 * Newsletter Signup Module - GDPR Compliant
 * Handles newsletter form submission to Google Sheets via Apps Script
 */

// IMPORTANT: Replace this URL with your deployed Google Apps Script web app URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbysa2myvDeg0dg8G6baSMMl4lG8412qovCCeraSklmQ2c0xkJGN94jXqCzbi6F2EnTk/exec';

/**
 * Initialize newsletter form
 */
export function initNewsletter() {
  const form = document.getElementById('newsletterForm');

  if (!form) {
    console.warn('Newsletter form not found');
    return;
  }

  form.addEventListener('submit', handleNewsletterSubmit);
}

/**
 * Handle newsletter form submission
 */
async function handleNewsletterSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const emailInput = form.querySelector('input[name="email"]');
  const consentCheckbox = form.querySelector('input[name="consent"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const messageDiv = form.querySelector('.form-message');

  // Reset message
  messageDiv.style.display = 'none';
  messageDiv.className = 'form-message';

  // Validate
  if (!emailInput.value.trim()) {
    showMessage(messageDiv, 'error', 'Please enter your email address');
    return;
  }

  if (!validateEmail(emailInput.value)) {
    showMessage(messageDiv, 'error', 'Please enter a valid email address');
    return;
  }

  if (!consentCheckbox.checked) {
    showMessage(messageDiv, 'error', 'Please consent to receive marketing emails');
    return;
  }

  // Show loading state
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Subscribing...';

  try {
    // Prepare data
    const formData = {
      email: emailInput.value.trim(),
      consent: consentCheckbox.checked.toString()
    };

    // Submit to Google Apps Script using fetch with proper error handling
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: new URLSearchParams(formData),
        redirect: 'follow'
      });

      // Google Apps Script redirects on success, so if we get here, check the response
      const text = await response.text();
      let result;

      try {
        result = JSON.parse(text);
      } catch (e) {
        // If response isn't JSON, assume success (Apps Script may redirect)
        result = { success: true, message: 'Thank you for subscribing! 🐕' };
      }

      if (result.success) {
        // Success
        showMessage(messageDiv, 'success', result.message);
        form.reset();

        // Track conversion (if analytics enabled)
        if (window.gtag && window.analyticsConsent) {
          window.gtag('event', 'newsletter_signup', {
            event_category: 'engagement',
            event_label: 'newsletter'
          });
        }
      } else {
        // Error from server
        showMessage(messageDiv, 'error', result.message);
      }
    } catch (fetchError) {
      // Network error or CORS issue - try form submission as fallback
      console.log('Fetch failed, submitting via form...', fetchError);

      // Create hidden iframe for form submission
      const iframe = document.createElement('iframe');
      iframe.name = 'newsletter-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Set form to submit to iframe
      const originalAction = form.action;
      const originalTarget = form.target;
      const originalMethod = form.method;

      form.action = APPS_SCRIPT_URL;
      form.target = 'newsletter-iframe';
      form.method = 'POST';
      form.submit();

      // Restore form
      form.action = originalAction;
      form.target = originalTarget;
      form.method = originalMethod;

      // Show success message (we can't verify, but assume it worked)
      showMessage(messageDiv, 'success', 'Thank you for subscribing! 🐕');
      form.reset();

      // Clean up iframe after a delay
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);
    }

  } catch (error) {
    console.error('Newsletter submission error:', error);
    showMessage(messageDiv, 'error', 'An error occurred. Please try again later.');
  } finally {
    // Restore button
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Show message to user
 */
function showMessage(messageDiv, type, message) {
  messageDiv.textContent = message;
  messageDiv.className = `form-message ${type}`;
  messageDiv.style.display = 'block';

  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
}
