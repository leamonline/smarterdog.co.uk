/**
 * Service Worker Registration
 * Registers the service worker for PWA functionality
 */

const shouldRegisterSw = 'serviceWorker' in navigator && import.meta.env.PROD;

if (shouldRegisterSw) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('✓ Service Worker registered:', registration.scope))
      .catch(error => console.warn('✗ Service Worker registration failed:', error));
  });
} else {
  console.log('Service worker registration skipped (unsupported browser or non-production build)');
}
