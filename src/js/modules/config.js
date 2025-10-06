/**
 * Application Configuration
 * Central configuration for the Smarter Dog website
 * @module config
 */

/**
 * Configuration object containing all app settings
 * @const {Object}
 */
export const config = {
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
    maxSubmissionsPerHour: 3,
    requiredFields: ['name', 'email', 'message'],
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minMessageLength: 10,
    maxMessageLength: 1000
  },

  // Animation Settings
  animation: {
    intersectionThreshold: 0.1,
    intersectionRootMargin: '0px 0px -50px 0px',
    navScrollOffset: 100
  },

  // LocalStorage Keys
  storageKeys: {
    cookiesAccepted: 'cookiesAccepted',
    analyticsAccepted: 'analyticsAccepted',
    formData: 'smarterdog_form_data',
    submissionTimestamps: 'smarterdog_submissions'
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
