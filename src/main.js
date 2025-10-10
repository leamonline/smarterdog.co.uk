import { config } from './core/config.js';
import { initNavigation } from './features/navigation.js';
import { initAnimations } from './features/animations.js';
import { initCookieConsent } from './features/cookies.js';
import { initForms } from './features/forms.js';
import { initUI } from './features/ui.js';
import { initLightbox } from './features/lightbox.js';
import { initNewsletter } from './features/newsletter.js';
import './service-worker-registration.js';

const modulePipeline = [
  { name: 'Navigation', run: initNavigation, critical: true },
  { name: 'Animations', run: initAnimations, critical: false },
  { name: 'Cookie Consent', run: initCookieConsent, critical: false },
  { name: 'Forms', run: initForms, critical: false },
  { name: 'Newsletter', run: initNewsletter, critical: false },
  { name: 'UI', run: initUI, critical: false },
  { name: 'Lightbox', run: initLightbox, critical: false }
];

let isAppInitialized = false;

export async function initApp() {
  if (isAppInitialized) {
    console.warn('Smarter Dog app already initialized');
    return;
  }

  logBootstrapBanner();

  try {
    await waitForDOMReady();
    await initializeModulesSequentially();
    isAppInitialized = true;

    console.log('%c✓ All modules initialized successfully', 'color: #14b8a6; font-weight: bold;');
    console.log('%c🐾 Smarter Dog Website Ready!', 'font-size: 16px; color: #e76f51; font-weight: bold;');
    logFeatureFlags();
  } catch (error) {
    console.error('Fatal error during app initialization:', error);
  }
}

function logBootstrapBanner() {
  const version = config.app?.version ?? 'unknown';
  const mode = getEnvironment();
  console.log('%c🐾 Smarter Dog Website Loading...', 'font-size: 16px; color: #e76f51; font-weight: bold;');
  console.log(`Version: ${version}`);
  console.log(`Environment: ${mode}`);
}

async function initializeModulesSequentially() {
  for (const module of modulePipeline) {
    try {
      console.log(`Initializing ${module.name}...`);
      await module.run();
      console.log(`✓ ${module.name} initialized`);
    } catch (error) {
      console.error(`✕ Failed to initialize ${module.name}:`, error);

      if (module.critical) {
        throw new Error(`Critical module ${module.name} failed to initialize`);
      }
    }
  }
}

function waitForDOMReady() {
  return new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    } else {
      resolve();
    }
  });
}

export function getEnvironment() {
  const explicitMode = config.app?.mode;
  if (explicitMode) {
    return explicitMode;
  }

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  if (hostname.includes('staging') || hostname.includes('test')) {
    return 'staging';
  }
  return 'production';
}

function logFeatureFlags() {
  console.group('Feature Flags');
  Object.entries(config.features).forEach(([feature, enabled]) => {
    const icon = enabled ? '✓' : '✕';
    const color = enabled ? 'color: #14b8a6' : 'color: #888';
    console.log(`%c${icon} ${feature}`, color);
  });
  console.groupEnd();
}

function handleGlobalError(event) {
  console.error('Global error caught:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });

  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: event.message,
      fatal: false
    });
  }
}

function handleUnhandledRejection(event) {
  console.error('Unhandled promise rejection:', event.reason);

  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: `Unhandled rejection: ${event.reason}`,
      fatal: false
    });
  }
}

function setupErrorHandlers() {
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
}

function monitorPerformance() {
  if (!window.performance || !window.performance.timing) {
    return;
  }

  window.addEventListener('load', () => {
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

      if (window.gtag) {
        window.gtag('event', 'timing_complete', {
          name: 'load',
          value: loadTime
        });
      }
    }, 0);
  });
}

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

function exposeDebugUtilities() {
  if (getEnvironment() === 'production') {
    return;
  }

  window.smarterDog = {
    config,
    version: config.app?.version,
    modules: {
      navigation: initNavigation,
      animations: initAnimations,
      cookies: initCookieConsent,
      forms: initForms
    },
    reinit: () => {
      isAppInitialized = false;
      initApp();
    }
  };

  console.log('Debug utilities available at window.smarterDog');
}

function bootstrap() {
  setupErrorHandlers();

  if (!checkBrowserCompatibility()) {
    return;
  }

  monitorPerformance();
  exposeDebugUtilities();
  initApp();
}

bootstrap();

export default {
  initApp,
  getEnvironment,
  version: config.app?.version
};
