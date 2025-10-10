/**
 * Application Configuration
 * Central configuration for the Smarter Dog website
 * @module config
 */

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
const APP_ENV =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE
    ? import.meta.env.MODE
    : 'production';

export const config = {
  // Application metadata
  app: {
    name: 'Smarter Dog Grooming Salon',
    version: APP_VERSION,
    mode: APP_ENV
  },

  // Analytics
  googleAnalyticsId: 'G-VPN43VE4FC',

  // API Endpoints
  formspreeEndpoint: 'https://formspree.io/f/mdkwzjnk',

  // Feature Flags
  features: {
    pawPrintAnimation: true,
    cookieConsent: true,
    formValidation: true,
    analytics: true,
    toastNotifications: true
  },

  // Timing Constants (in milliseconds)
  timing: {
    scrollThrottle: 150,
    cookieBannerDelay: 1000,
    toastDuration: 3000,
    pawPrintLifetime: 2000,
    animationDelay: 300,
    debounceDelay: 300,
    formSubmitTimeout: 10000
  },

  // Breakpoints (matches CSS variables)
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1400
  },

  // CSS Custom Properties
  cssVars: {
    colorBackground: '--color-background',
    colorPrimary: '--color-primary',
    colorAccentTeal: '--color-accent-teal',
    colorDark: '--color-dark'
  },

  // Form Settings
  form: {
    maxSubmissionsPerWindow: 3,
    rateLimitWindowMs: 60 * 60 * 1000, // 1 hour
    rateLimitMetadataTtlMs: 6 * 60 * 60 * 1000, // 6 hours
    autosaveTtlMs: 24 * 60 * 60 * 1000, // 24 hours
    requiredFields: ['firstName', 'surname', 'dogNames', 'breed', 'email', 'phone', 'message'],
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minMessageLength: 10,
    maxMessageLength: 1000,
    fieldLabels: {
      firstName: 'First Name',
      surname: 'Surname',
      dogNames: "Dog's Name(s)",
      breed: 'Breed',
      email: 'Email',
      phone: 'Telephone Number',
      message: 'Message'
    }
  },

  // Animation Settings
  animation: {
    intersectionThreshold: 0.1,
    intersectionRootMargin: '0px 0px -50px 0px',
    navScrollOffset: 100
  },

  // LocalStorage Keys
  storageKeys: {
    cookiesAccepted: 'sd_cookies_choice_v1',
    analyticsAccepted: 'sd_analytics_choice_v1',
    formAutosave: 'sd_form_autosave_v2',
    formRateLimit: 'sd_form_rate_limit_v1'
  }
};

/**
 * Get a CSS custom property value
 * @param {string} propertyName - The CSS variable name (with or without --)
 * @returns {string} The computed CSS property value
 */
export function getCSSVariable(propertyName) {
  const name = propertyName.startsWith('--') ? propertyName : `--${propertyName}`;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Check if current viewport matches a breakpoint
 * @param {string} breakpoint - The breakpoint name ('mobile', 'tablet', 'desktop')
 * @param {string} direction - 'min' or 'max' width
 * @returns {boolean} Whether the breakpoint matches
 */
export function matchesBreakpoint(breakpoint, direction = 'min') {
  const width = config.breakpoints[breakpoint];
  if (!width) {
    console.warn(`Unknown breakpoint: ${breakpoint}`);
    return false;
  }

  const query = direction === 'min'
    ? `(min-width: ${width}px)`
    : `(max-width: ${width - 1}px)`;

  return window.matchMedia(query).matches;
}

/**
 * Check if a feature flag is enabled
 * @param {string} featureName - The feature flag name
 * @returns {boolean} Whether the feature is enabled
 */
export function isFeatureEnabled(featureName) {
  return config.features[featureName] ?? false;
}

export default config;
