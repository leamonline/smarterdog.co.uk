/**
 * Forms Module
 * Handles form validation, submission, loading states, and notifications
 * @module forms
 */

import { config, isFeatureEnabled } from './config.js';
import { trackEvent } from './cookies.js';

let isFormsInitialized = false;

// Cache DOM elements
const elements = {
  contactForm: null,
  formFields: {},
  submitButton: null
};

// Track submission timestamps for rate limiting
const submissionTimestamps = [];

/**
 * Initialize form functionality
 */
export function initForms() {
  if (isFormsInitialized) {
    console.warn('Forms already initialized');
    return;
  }

  if (!isFeatureEnabled('formValidation')) {
    console.log('Form validation feature is disabled');
    return;
  }

  try {
    // Find contact form
    elements.contactForm = document.querySelector('form[action*="formspree"]') ||
                           document.querySelector('#contact-form') ||
                           document.querySelector('form');

    if (!elements.contactForm) {
      console.log('No contact form found on this page');
      return;
    }

    // Cache form fields
    cacheFormFields();

    // Setup form validation and submission
    setupFormValidation();
    setupFormSubmission();

    // Load saved form data
    loadSavedFormData();

    // Setup autosave
    setupFormAutosave();

    isFormsInitialized = true;
    console.log('Forms initialized successfully');
  } catch (error) {
    console.error('Failed to initialize forms:', error);
  }
}

/**
 * Cache form field elements
 */
function cacheFormFields() {
  const { contactForm } = elements;

  elements.formFields = {
    name: contactForm.querySelector('[name="name"]'),
    email: contactForm.querySelector('[name="email"]'),
    phone: contactForm.querySelector('[name="phone"]'),
    message: contactForm.querySelector('[name="message"]'),
    honeypot: contactForm.querySelector('[name="_gotcha"]') ||
              contactForm.querySelector('[name="website"]')
  };

  elements.submitButton = contactForm.querySelector('button[type="submit"]') ||
                          contactForm.querySelector('input[type="submit"]');
}

/**
 * Setup real-time form validation
 */
function setupFormValidation() {
  const { formFields } = elements;

  // Add validation listeners to each field
  Object.entries(formFields).forEach(([fieldName, field]) => {
    if (!field || fieldName === 'honeypot') return;

    // Validate on blur
    field.addEventListener('blur', () => {
      validateField(fieldName, field);
    });

    // Clear errors on input
    field.addEventListener('input', () => {
      clearFieldError(field);
    });
  });
}

/**
 * Validate a single form field
 * @param {string} fieldName - Field name
 * @param {HTMLElement} field - Field element
 * @returns {boolean} Whether the field is valid
 */
function validateField(fieldName, field) {
  const value = field.value.trim();
  let errorMessage = '';

  // Required field validation
  if (config.form.requiredFields.includes(fieldName) && !value) {
    errorMessage = `${capitalize(fieldName)} is required`;
  }
  // Email validation
  else if (fieldName === 'email' && value && !config.form.emailPattern.test(value)) {
    errorMessage = 'Please enter a valid email address';
  }
  // Message length validation
  else if (fieldName === 'message') {
    if (value && value.length < config.form.minMessageLength) {
      errorMessage = `Message must be at least ${config.form.minMessageLength} characters`;
    } else if (value && value.length > config.form.maxMessageLength) {
      errorMessage = `Message must be less than ${config.form.maxMessageLength} characters`;
    }
  }

  if (errorMessage) {
    showFieldError(field, errorMessage);
    return false;
  } else {
    clearFieldError(field);
    showFieldSuccess(field);
    return true;
  }
}

/**
 * Validate entire form
 * @returns {boolean} Whether the form is valid
 */
function validateForm() {
  const { formFields } = elements;
  let isValid = true;

  config.form.requiredFields.forEach(fieldName => {
    const field = formFields[fieldName];
    if (field && !validateField(fieldName, field)) {
      isValid = false;
    }
  });

  return isValid;
}

/**
 * Show field error
 * @param {HTMLElement} field - Form field element
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
  clearFieldError(field);

  field.classList.add('error');
  field.setAttribute('aria-invalid', 'true');

  const errorElement = document.createElement('div');
  errorElement.className = 'field-error';
  errorElement.textContent = message;
  errorElement.setAttribute('role', 'alert');

  field.parentNode.appendChild(errorElement);
}

/**
 * Clear field error
 * @param {HTMLElement} field - Form field element
 */
function clearFieldError(field) {
  field.classList.remove('error', 'success');
  field.removeAttribute('aria-invalid');

  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
}

/**
 * Show field success
 * @param {HTMLElement} field - Form field element
 */
function showFieldSuccess(field) {
  if (field.value.trim()) {
    field.classList.add('success');
  }
}

/**
 * Setup form submission handling
 */
function setupFormSubmission() {
  const { contactForm } = elements;

  contactForm.addEventListener('submit', handleFormSubmit);
}

/**
 * Handle form submission
 * @param {Event} event - Submit event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  // Validate form
  if (!validateForm()) {
    showToast('Please fix the errors before submitting', 'error');
    return;
  }

  // Check honeypot (spam protection)
  if (elements.formFields.honeypot && elements.formFields.honeypot.value) {
    console.warn('Honeypot field filled - potential spam');
    showToast('Form submitted successfully!', 'success');
    elements.contactForm.reset();
    return;
  }

  // Check rate limiting
  if (!checkRateLimit()) {
    showToast('Please wait before submitting again', 'error');
    return;
  }

  // Show loading state
  setFormLoading(true);

  try {
    const formData = new FormData(elements.contactForm);

    const response = await fetch(elements.contactForm.action || config.formspreeEndpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      handleSubmitSuccess();
    } else {
      const data = await response.json();
      handleSubmitError(data);
    }
  } catch (error) {
    console.error('Form submission error:', error);
    handleSubmitError(error);
  } finally {
    setFormLoading(false);
  }
}

/**
 * Handle successful form submission
 */
function handleSubmitSuccess() {
  showToast('Thank you! Your message has been sent successfully.', 'success');

  // Track event
  trackEvent('form_submission', {
    form_name: 'contact_form'
  });

  // Reset form
  elements.contactForm.reset();
  Object.values(elements.formFields).forEach(field => {
    if (field) clearFieldError(field);
  });

  // Clear saved form data
  clearSavedFormData();

  // Record submission timestamp
  recordSubmissionTimestamp();
}

/**
 * Handle form submission error
 * @param {Error|Object} error - Error object
 */
function handleSubmitError(error) {
  console.error('Form submission failed:', error);

  const errorMessage = error.errors?.[0]?.message ||
                      error.message ||
                      'Failed to send message. Please try again.';

  showToast(errorMessage, 'error');

  // Track error
  trackEvent('form_error', {
    error_message: errorMessage
  });
}

/**
 * Set form loading state
 * @param {boolean} isLoading - Whether form is loading
 */
function setFormLoading(isLoading) {
  const { submitButton, contactForm } = elements;

  if (!submitButton) return;

  if (isLoading) {
    submitButton.disabled = true;
    submitButton.classList.add('loading');

    // Store original button text
    submitButton.dataset.originalText = submitButton.textContent;

    // Add spinner
    submitButton.innerHTML = `
      <span class="spinner"></span>
      <span>Sending...</span>
    `;

    contactForm.classList.add('submitting');
  } else {
    submitButton.disabled = false;
    submitButton.classList.remove('loading');

    // Restore original button text
    submitButton.textContent = submitButton.dataset.originalText || 'Send Message';

    contactForm.classList.remove('submitting');
  }
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} [type='info'] - Toast type ('success', 'error', 'info')
 */
export function showToast(message, type = 'info') {
  if (!isFeatureEnabled('toastNotifications')) {
    console.log(`Toast (${type}):`, message);
    return;
  }

  // Remove existing toasts
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  const icon = getToastIcon(type);
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  // Add to DOM
  document.body.appendChild(toast);

  // Close button
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });

  // Auto-hide after duration
  setTimeout(() => {
    removeToast(toast);
  }, config.timing.toastDuration);

  // Animate in
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
}

/**
 * Get icon for toast type
 * @param {string} type - Toast type
 * @returns {string} Icon character
 */
function getToastIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };
  return icons[type] || icons.info;
}

/**
 * Remove toast notification
 * @param {HTMLElement} toast - Toast element
 */
function removeToast(toast) {
  toast.classList.remove('show');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 300);
}

/**
 * Setup form autosave to localStorage
 */
function setupFormAutosave() {
  const { formFields } = elements;

  Object.entries(formFields).forEach(([fieldName, field]) => {
    if (!field || fieldName === 'honeypot') return;

    field.addEventListener('input', debounce(() => {
      saveFormData();
    }, config.timing.debounceDelay));
  });
}

/**
 * Save form data to localStorage
 */
function saveFormData() {
  const { formFields } = elements;
  const formData = {};

  Object.entries(formFields).forEach(([fieldName, field]) => {
    if (field && fieldName !== 'honeypot') {
      formData[fieldName] = field.value;
    }
  });

  try {
    localStorage.setItem(config.storageKeys.formData, JSON.stringify(formData));
  } catch (error) {
    console.error('Failed to save form data:', error);
  }
}

/**
 * Load saved form data from localStorage
 */
function loadSavedFormData() {
  try {
    const savedData = localStorage.getItem(config.storageKeys.formData);
    if (!savedData) return;

    const formData = JSON.parse(savedData);
    const { formFields } = elements;

    Object.entries(formData).forEach(([fieldName, value]) => {
      const field = formFields[fieldName];
      if (field && value) {
        field.value = value;
      }
    });

    console.log('Form data loaded from localStorage');
  } catch (error) {
    console.error('Failed to load form data:', error);
  }
}

/**
 * Clear saved form data from localStorage
 */
function clearSavedFormData() {
  try {
    localStorage.removeItem(config.storageKeys.formData);
  } catch (error) {
    console.error('Failed to clear form data:', error);
  }
}

/**
 * Check rate limit for form submissions
 * @returns {boolean} Whether submission is allowed
 */
function checkRateLimit() {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);

  // Remove old timestamps
  const recentSubmissions = submissionTimestamps.filter(time => time > oneHourAgo);
  submissionTimestamps.length = 0;
  submissionTimestamps.push(...recentSubmissions);

  return submissionTimestamps.length < config.form.maxSubmissionsPerHour;
}

/**
 * Record submission timestamp
 */
function recordSubmissionTimestamp() {
  submissionTimestamps.push(Date.now());

  // Save to localStorage for persistence
  try {
    localStorage.setItem(
      config.storageKeys.submissionTimestamps,
      JSON.stringify(submissionTimestamps)
    );
  } catch (error) {
    console.error('Failed to save submission timestamps:', error);
  }
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Cleanup forms
 */
export function cleanupForms() {
  isFormsInitialized = false;
}

export default {
  initForms,
  showToast,
  cleanupForms
};
