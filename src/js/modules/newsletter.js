/**
 * Newsletter Signup Module - GDPR Compliant
 * Handles newsletter form submission to Google Sheets via Apps Script
 */

// IMPORTANT: Replace this URL with your deployed Google Apps Script web app URL
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';

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

    // Submit to Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      mode: 'cors'
    });

    const result = await response.json();

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
