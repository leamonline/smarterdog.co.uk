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
    console.log('Submitting newsletter form');

    // Create hidden iframe for form submission (avoids CORS issues)
    const iframe = document.createElement('iframe');
    iframe.name = 'newsletter-iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Create a form dynamically to submit
    const submitForm = document.createElement('form');
    submitForm.action = APPS_SCRIPT_URL;
    submitForm.method = 'POST';
    submitForm.target = 'newsletter-iframe';
    submitForm.style.display = 'none';

    // Add email field
    const emailField = document.createElement('input');
    emailField.type = 'hidden';
    emailField.name = 'email';
    emailField.value = emailInput.value.trim();
    submitForm.appendChild(emailField);

    // Add consent field
    const consentField = document.createElement('input');
    consentField.type = 'hidden';
    consentField.name = 'consent';
    consentField.value = 'true';
    submitForm.appendChild(consentField);

    // Submit form
    document.body.appendChild(submitForm);
    submitForm.submit();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(submitForm);
      document.body.removeChild(iframe);
    }, 5000);

    // Show success message (we can't verify with iframe, but assume it worked)
    showMessage(messageDiv, 'success', 'Thank you for subscribing! 🐕');
    form.reset();

    // Track conversion (if analytics enabled)
    if (window.gtag && window.analyticsConsent) {
      window.gtag('event', 'newsletter_signup', {
        event_category: 'engagement',
        event_label: 'newsletter'
      });
    }

  } catch (error) {
    console.error('Newsletter submission error:', error);
    showMessage(messageDiv, 'error', 'An error occurred. Please try again.');
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
