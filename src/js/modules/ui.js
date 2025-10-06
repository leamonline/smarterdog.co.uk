/**
 * UI Module
 * Handles back-to-top button and other UI features
 * @module ui
 */

import { config } from './config.js';

let isUIInitialized = false;
let backToTopButton = null;
let stickyWhatsApp = null;

/**
 * Initialize UI features
 */
export function initUI() {
  if (isUIInitialized) {
    console.warn('UI already initialized');
    return;
  }

  try {
    initBackToTop();
    initStickyWhatsApp();

    isUIInitialized = true;
    console.log('UI initialized successfully');
  } catch (error) {
    console.error('Failed to initialize UI:', error);
  }
}

/**
 * Initialize back-to-top button
 */
function initBackToTop() {
  backToTopButton = document.getElementById('backToTop');

  if (!backToTopButton) {
    console.log('Back to top button not found');
    return;
  }

  // Show/hide button based on scroll position
  window.addEventListener('scroll', throttle(handleScroll, 200), { passive: true });

  // Click handler
  backToTopButton.addEventListener('click', scrollToTop);

  console.log('Back to top button initialized');
}

/**
 * Handle scroll event for back-to-top button and sticky WhatsApp
 */
function handleScroll() {
  const scrollThreshold = 300; // Show buttons after scrolling 300px

  if (backToTopButton) {
    if (window.pageYOffset > scrollThreshold) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  }

  if (stickyWhatsApp) {
    if (window.pageYOffset > scrollThreshold) {
      stickyWhatsApp.classList.add('visible');
    } else {
      stickyWhatsApp.classList.remove('visible');
    }
  }
}

/**
 * Scroll to top of page smoothly
 */
function scrollToTop() {
  // Check if smooth scroll is supported
  if ('scrollBehavior' in document.documentElement.style) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  } else {
    // Fallback for older browsers
    window.scrollTo(0, 0);
  }

  // Track event if analytics available
  if (window.gtag) {
    window.gtag('event', 'back_to_top_click', {
      event_category: 'navigation',
      event_label: 'Back to Top Button'
    });
  }
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, wait) {
  let lastTime = 0;
  return function executedFunction(...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
    }
  };
}

/**
 * Initialize sticky WhatsApp button
 */
function initStickyWhatsApp() {
  stickyWhatsApp = document.getElementById('stickyWhatsApp');

  if (!stickyWhatsApp) {
    console.log('Sticky WhatsApp button not found');
    return;
  }

  console.log('Sticky WhatsApp button initialized');
}

/**
 * Cleanup UI
 */
export function cleanupUI() {
  if (backToTopButton) {
    window.removeEventListener('scroll', handleScroll);
    backToTopButton.removeEventListener('click', scrollToTop);
  }
  isUIInitialized = false;
}

export default {
  initUI,
  cleanupUI
};
