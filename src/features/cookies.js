/**
 * Cookie Consent Module
 * Handles cookie consent banner and Google Analytics loading
 * @module cookies
 */

import { config, isFeatureEnabled } from '../core/config.js';
import { fadeIn, fadeOut } from './animations.js';

let isCookiesInitialized = false;
let analyticsLoaded = false;

// Cache DOM elements
const elements = {
  cookieConsent: null,
  acceptEssentialBtn: null,
  acceptAllBtn: null,
  cookieSettingsTriggers: null
};

/**
 * Initialize cookie consent functionality
 */
export function initCookieConsent() {
  if (isCookiesInitialized) {
    console.warn('Cookie consent already initialized');
    return;
  }

  if (!isFeatureEnabled('cookieConsent')) {
    console.log('Cookie consent feature is disabled');
    return;
  }

  try {
    // Cache DOM elements
    elements.cookieConsent = document.getElementById('cookieConsent');
    elements.acceptEssentialBtn = document.getElementById('acceptEssential');
    elements.acceptAllBtn = document.getElementById('acceptAll');
    elements.cookieSettingsTriggers = document.querySelectorAll('[data-cookie-settings]');

    if (!elements.cookieConsent || !elements.acceptEssentialBtn || !elements.acceptAllBtn) {
      console.warn('Cookie consent elements not found - skipping initialization');
      return;
    }

    // Add animation styles
    injectAnimationStyles();

    // Setup event listeners
    setupEventListeners();

    // Check existing preferences
    checkExistingPreferences();

    isCookiesInitialized = true;
    console.log('Cookie consent initialized successfully');
  } catch (error) {
    console.error('Failed to initialize cookie consent:', error);
  }
}

/**
 * Inject CSS animation styles for cookie banner
 */
function injectAnimationStyles() {
  const styleId = 'cookie-animations';

  // Don't inject if already present
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes slideDown {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(100%);
        opacity: 0;
      }
    }
  `;

  document.head.appendChild(style);
}

/**
 * Setup event listeners for cookie consent buttons
 */
function setupEventListeners() {
  const { acceptEssentialBtn, acceptAllBtn, cookieSettingsTriggers } = elements;

  acceptEssentialBtn.addEventListener('click', handleAcceptEssential);
  acceptAllBtn.addEventListener('click', handleAcceptAll);

  cookieSettingsTriggers.forEach(trigger => {
    trigger.addEventListener('click', handleShowSettings);
  });
}

/**
 * Check existing cookie preferences and load analytics if needed
 */
function checkExistingPreferences() {
  const hasCookieChoice = localStorage.getItem(config.storageKeys.cookiesAccepted);
  const analyticsAccepted = localStorage.getItem(config.storageKeys.analyticsAccepted) === 'true';

  // Load analytics if previously accepted
  if (analyticsAccepted && isFeatureEnabled('analytics')) {
    loadGoogleAnalytics();
  }

  // Show banner if no choice has been made
  if (!hasCookieChoice) {
    setTimeout(() => {
      showCookieBanner();
    }, config.timing.cookieBannerDelay);
  }
}

/**
 * Handle accept essential cookies only
 * @param {Event} event - Click event
 */
function handleAcceptEssential(event) {
  event.preventDefault();

  try {
    localStorage.setItem(config.storageKeys.cookiesAccepted, 'essential');
    localStorage.setItem(config.storageKeys.analyticsAccepted, 'false');

    hideCookieBanner();
    console.log('User accepted essential cookies only');
  } catch (error) {
    console.error('Failed to save cookie preferences:', error);
  }
}

/**
 * Handle accept all cookies
 * @param {Event} event - Click event
 */
function handleAcceptAll(event) {
  event.preventDefault();

  try {
    localStorage.setItem(config.storageKeys.cookiesAccepted, 'true');
    localStorage.setItem(config.storageKeys.analyticsAccepted, 'true');

    if (isFeatureEnabled('analytics')) {
      loadGoogleAnalytics();
    }

    hideCookieBanner();
    console.log('User accepted all cookies');
  } catch (error) {
    console.error('Failed to save cookie preferences:', error);
  }
}

/**
 * Handle show cookie settings (reopen banner)
 * @param {Event} event - Click event
 */
function handleShowSettings(event) {
  event.preventDefault();
  showCookieBanner();
}

/**
 * Show cookie consent banner with animation
 */
export function showCookieBanner() {
  const { cookieConsent } = elements;
  if (!cookieConsent) return;

  cookieConsent.classList.remove('hidden');
  cookieConsent.style.display = 'block';
  cookieConsent.style.animation = 'none';

  // Force reflow to restart animation
  void cookieConsent.offsetWidth;

  cookieConsent.style.animation = 'slideUp 0.5s ease-out';

  // Set focus to first button for accessibility
  setTimeout(() => {
    elements.acceptEssentialBtn.focus();
  }, 500);
}

/**
 * Hide cookie consent banner with animation
 */
export function hideCookieBanner() {
  const { cookieConsent } = elements;
  if (!cookieConsent) return;

  cookieConsent.style.animation = 'slideDown 0.5s ease-out forwards';

  setTimeout(() => {
    cookieConsent.style.display = 'none';
    cookieConsent.classList.add('hidden');
  }, 500);
}

/**
 * Load Google Analytics script
 * Only loads once even if called multiple times
 */
export function loadGoogleAnalytics() {
  if (analyticsLoaded) {
    console.log('Google Analytics already loaded');
    return;
  }

  try {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() {
      window.dataLayer.push(arguments);
    };

    // Configure Google Analytics
    window.gtag('js', new Date());
    window.gtag('config', config.googleAnalyticsId, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    // Load Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
    script.onerror = () => {
      console.error('Failed to load Google Analytics script');
    };

    document.head.appendChild(script);

    analyticsLoaded = true;
    console.log('Google Analytics loaded successfully');
  } catch (error) {
    console.error('Failed to load Google Analytics:', error);
  }
}

/**
 * Track custom event in Google Analytics
 * @param {string} eventName - Event name
 * @param {Object} [eventParams] - Event parameters
 */
export function trackEvent(eventName, eventParams = {}) {
  if (!analyticsLoaded || !window.gtag) {
    console.warn('Analytics not loaded, event not tracked:', eventName);
    return;
  }

  try {
    window.gtag('event', eventName, eventParams);
    console.log('Event tracked:', eventName, eventParams);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Get current cookie consent status
 * @returns {Object} Consent status object
 */
export function getConsentStatus() {
  return {
    cookiesAccepted: localStorage.getItem(config.storageKeys.cookiesAccepted) || null,
    analyticsAccepted: localStorage.getItem(config.storageKeys.analyticsAccepted) === 'true',
    analyticsLoaded
  };
}

/**
 * Reset cookie preferences (for testing)
 */
export function resetCookiePreferences() {
  localStorage.removeItem(config.storageKeys.cookiesAccepted);
  localStorage.removeItem(config.storageKeys.analyticsAccepted);
  console.log('Cookie preferences reset');
}

/**
 * Cleanup cookie consent
 */
export function cleanupCookieConsent() {
  isCookiesInitialized = false;
  // Note: We don't unload analytics once loaded
}

export default {
  initCookieConsent,
  showCookieBanner,
  hideCookieBanner,
  loadGoogleAnalytics,
  trackEvent,
  getConsentStatus,
  resetCookiePreferences,
  cleanupCookieConsent
};
