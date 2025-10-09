/**
 * Main Application Entry Point
 * Initializes all modules with proper error handling and logging
 * @module main
 */

import { config, isFeatureEnabled } from './config.js';
import { initNavigation } from './navigation.js';
import { initAnimations } from './animations.js';
import { initCookieConsent } from './cookies.js';
import { initForms } from './forms.js';
import { initUI } from './ui.js';
import { initLightbox } from './lightbox.js';
import { initNewsletter } from './newsletter.js';

// Track initialization state
let isAppInitialized = false;

/**
 * Initialize the entire application
 */
async function initApp() {
  if (isAppInitialized) {
    console.warn('App already initialized');
    return;
  }

  console.log('%c🐾 Smarter Dog Website Loading...', 'font-size: 16px; color: #e76f51; font-weight: bold;');
  console.log('Version: 2.0.0');
  console.log('Environment:', getEnvironment());

  try {
    // Wait for DOM to be ready
    await waitForDOM();

    // Initialize modules in sequence
    // Some modules may depend on DOM elements, so we use try-catch per module
    await initializeModules();

    isAppInitialized = true;

    console.log('%c✓ All modules initialized successfully', 'color: #14b8a6; font-weight: bold;');
    console.log('%c🐾 Smarter Dog Website Ready!', 'font-size: 16px; color: #e76f51; font-weight: bold;');

    // Log feature flags for debugging
    logFeatureFlags();

  } catch (error) {
    console.error('Fatal error during app initialization:', error);
    // Even if there's an error, we try to show the page
  }
}

/**
 * Initialize all application modules
 */
async function initializeModules() {
  const modules = [
    { name: 'Navigation', fn: initNavigation, critical: true },
    { name: 'Animations', fn: initAnimations, critical: false },
    { name: 'Cookie Consent', fn: initCookieConsent, critical: false },
    { name: 'Forms', fn: initForms, critical: false },
    { name: 'Newsletter', fn: initNewsletter, critical: false },
    { name: 'UI', fn: initUI, critical: false },
    { name: 'Lightbox', fn: initLightbox, critical: false }
  ];

  for (const module of modules) {
    try {
      console.log(`Initializing ${module.name}...`);
      await module.fn();
      console.log(`✓ ${module.name} initialized`);
    } catch (error) {
      console.error(`✕ Failed to initialize ${module.name}:`, error);

      if (module.critical) {
        throw new Error(`Critical module ${module.name} failed to initialize`);
      }
      // Non-critical modules can fail without breaking the app
    }
  }
}

/**
 * Wait for DOM to be fully loaded
 * @returns {Promise<void>}
 */
function waitForDOM() {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    } else {
      // DOM is already ready
      resolve();
    }
  });
}

/**
 * Get current environment
 * @returns {string} Environment name
 */
function getEnvironment() {
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  } else if (hostname.includes('staging') || hostname.includes('test')) {
    return 'staging';
  } else {
    return 'production';
  }
}

/**
 * Log enabled feature flags
 */
function logFeatureFlags() {
  console.group('Feature Flags');
  Object.entries(config.features).forEach(([feature, enabled]) => {
    const icon = enabled ? '✓' : '✕';
    const color = enabled ? 'color: #14b8a6' : 'color: #888';
    console.log(`%c${icon} ${feature}`, color);
  });
  console.groupEnd();
}

/**
 * Handle global errors
 * @param {ErrorEvent} event - Error event
 */
function handleGlobalError(event) {
  console.error('Global error caught:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });

  // Track error in analytics if available
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: event.message,
      fatal: false
    });
  }

  // Prevent default error handling
  // event.preventDefault();
}

/**
 * Handle unhandled promise rejections
 * @param {PromiseRejectionEvent} event - Rejection event
 */
function handleUnhandledRejection(event) {
  console.error('Unhandled promise rejection:', event.reason);

  // Track error in analytics if available
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: `Unhandled rejection: ${event.reason}`,
      fatal: false
    });
  }
}

/**
 * Setup global error handlers
 */
function setupErrorHandlers() {
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
}

/**
 * Performance monitoring
 */
function monitorPerformance() {
  if (!window.performance || !window.performance.timing) {
    return;
  }

  window.addEventListener('load', () => {
    // Wait a bit for all resources to load
    setTimeout(() => {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
      const renderTime = timing.domComplete - timing.domLoading;

      console.group('Performance Metrics');
      console.log(`Total Load Time: ${loadTime}ms`);
      console.log(`DOM Ready Time: ${domReadyTime}ms`);
      console.log(`Render Time: ${renderTime}ms`);
      console.groupEnd();

      // Track in analytics if available
      if (window.gtag) {
        window.gtag('event', 'timing_complete', {
          name: 'load',
          value: loadTime
        });
      }
    }, 0);
  });
}

/**
 * Check browser compatibility
 * @returns {boolean} Whether browser is supported
 */
function checkBrowserCompatibility() {
  const unsupportedFeatures = [];

  if (!document.querySelector) {
    unsupportedFeatures.push('querySelector');
  }

  if (!document.addEventListener) {
    unsupportedFeatures.push('addEventListener');
  }

  const documentElement = document.documentElement;
  if (!(documentElement && documentElement.classList)) {
    unsupportedFeatures.push('classList');
  }

  if (!window.fetch) {
    unsupportedFeatures.push('fetch');
  }

  if (!window.Promise) {
    unsupportedFeatures.push('Promise');
  }

  let localStorageSupported = true;
  try {
    const storage = window.localStorage;

    if (!storage) {
      localStorageSupported = false;
    } else {
      const testKey = '__sd_storage_test__';
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
    }
  } catch (error) {
    const isQuotaError =
      error instanceof DOMException &&
      (
        error.code === 22 ||
        error.code === 1014 ||
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      );

    if (!isQuotaError) {
      localStorageSupported = false;
    }
  }

  if (!localStorageSupported) {
    unsupportedFeatures.push('localStorage');
  }

  if (unsupportedFeatures.length > 0) {
    console.warn('Browser missing required features:', unsupportedFeatures);
    showBrowserWarning();
    return false;
  }

  return true;
}

/**
 * Show browser compatibility warning
 */
function showBrowserWarning() {
  const warningHTML = `
    <div style="
      background: #f4a261;
      color: #264653;
      padding: 1rem;
      text-align: center;
      font-family: sans-serif;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 99999;
    ">
      <strong>Browser Not Fully Supported</strong> -
      Some features may not work correctly. Please consider updating your browser.
    </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', warningHTML);
}

/**
 * Add utility to window for debugging
 */
function exposeDebugUtilities() {
  if (getEnvironment() !== 'production') {
    window.smarterDog = {
      config,
      version: '2.0.0',
      modules: {
        navigation: () => import('./navigation.js'),
        animations: () => import('./animations.js'),
        cookies: () => import('./cookies.js'),
        forms: () => import('./forms.js')
      },
      reinit: () => {
        isAppInitialized = false;
        initApp();
      }
    };

    console.log('Debug utilities available at window.smarterDog');
  }
}

// Setup error handlers first
setupErrorHandlers();

// Check browser compatibility
checkBrowserCompatibility();

// Monitor performance
monitorPerformance();

// Expose debug utilities
exposeDebugUtilities();

// Initialize the app
initApp();

// Export for potential external use
export default {
  initApp,
  getEnvironment,
  version: '2.0.0'
};
