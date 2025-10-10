/**
 * Animations Module
 * Handles paw print trail animation, scroll-based fade-ins, and scroll indicators
 * @module animations
 */

import { config, matchesBreakpoint, isFeatureEnabled } from '../core/config.js';

let isAnimationsInitialized = false;
let pawPrintTimestamp = 0;
let viewportDimensions = { width: 0, height: 0 };
let sectionObserver = null;
let resizeObserver = null;

// Cache DOM elements
const elements = {
  scrollIndicator: null
};

/**
 * Initialize all animations
 */
export function initAnimations() {
  if (isAnimationsInitialized) {
    console.warn('Animations already initialized');
    return;
  }

  try {
    // Initialize viewport dimensions
    updateViewportDimensions();

    // Setup different animations
    if (isFeatureEnabled('pawPrintAnimation')) {
      setupPawPrintAnimation();
    }

    setupScrollFadeInAnimations();
    setupScrollIndicator();

    // Monitor viewport changes
    window.addEventListener('resize', handleResize, { passive: true });

    isAnimationsInitialized = true;
    console.log('Animations initialized successfully');
  } catch (error) {
    console.error('Failed to initialize animations:', error);
  }
}

/**
 * Update cached viewport dimensions
 */
function updateViewportDimensions() {
  viewportDimensions.width = window.innerWidth;
  viewportDimensions.height = window.innerHeight;
}

/**
 * Handle window resize with debounce
 */
function handleResize() {
  updateViewportDimensions();
}

/**
 * Setup paw print trail animation (desktop only)
 */
function setupPawPrintAnimation() {
  // Only enable on desktop for performance
  if (!matchesBreakpoint('mobile', 'min')) {
    return;
  }

  window.addEventListener('scroll', handlePawPrintScroll, { passive: true });
  console.log('Paw print animation enabled');
}

/**
 * Handle scroll event for paw print creation
 * Uses requestAnimationFrame and throttling for performance
 */
function handlePawPrintScroll() {
  const now = Date.now();

  if (now - pawPrintTimestamp > config.timing.scrollThrottle) {
    pawPrintTimestamp = now;

    window.requestAnimationFrame(() => {
      createPawPrint(
        Math.random() * (viewportDimensions.width - 50),
        window.scrollY + Math.random() * viewportDimensions.height
      );
    });
  }
}

/**
 * Create a paw print element at specified coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
export function createPawPrint(x, y) {
  try {
    const paw = document.createElement('div');
    paw.className = 'paw-print';
    paw.style.left = `${x}px`;
    paw.style.top = `${y}px`;
    paw.innerHTML = '🐾';
    paw.setAttribute('aria-hidden', 'true'); // Accessibility: decorative element

    document.body.appendChild(paw);

    // Remove paw print after animation completes
    setTimeout(() => {
      if (paw.parentNode) {
        paw.remove();
      }
    }, config.timing.pawPrintLifetime);
  } catch (error) {
    console.error('Failed to create paw print:', error);
  }
}

/**
 * Setup scroll-based fade-in animations using IntersectionObserver
 */
export function setupScrollFadeInAnimations() {
  const options = {
    threshold: config.animation.intersectionThreshold,
    rootMargin: config.animation.intersectionRootMargin
  };

  sectionObserver = new IntersectionObserver(handleIntersection, options);

  // Observe all sections
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.classList.add('fade-in-section');
    sectionObserver.observe(section);
  });

  console.log(`Observing ${sections.length} sections for fade-in animations`);
}

/**
 * Handle intersection observer callback
 * @param {IntersectionObserverEntry[]} entries - Array of observed entries
 */
function handleIntersection(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Add visible class when element enters viewport
      entry.target.classList.add('fade-in-visible');

      // Optional: Stop observing after animation (performance optimization)
      // Uncomment if you don't need repeated animations
      // sectionObserver.unobserve(entry.target);
    }
  });
}

/**
 * Setup scroll indicator hide functionality
 */
function setupScrollIndicator() {
  elements.scrollIndicator = document.querySelector('.scroll-indicator');

  if (!elements.scrollIndicator) {
    return; // Scroll indicator not present on this page
  }

  let scrollHideTimeout;

  const hideScrollIndicator = () => {
    if (window.scrollY > 50) {
      elements.scrollIndicator.classList.add('hidden');

      clearTimeout(scrollHideTimeout);
      scrollHideTimeout = setTimeout(() => {
        elements.scrollIndicator.style.display = 'none';
      }, config.timing.animationDelay);
    }
  };

  // Use once: true to automatically remove listener after first trigger
  window.addEventListener('scroll', hideScrollIndicator, {
    passive: true,
    once: true
  });
}

/**
 * Animate element with custom animation
 * @param {HTMLElement} element - Element to animate
 * @param {string} animationClass - CSS animation class name
 * @param {Function} [callback] - Optional callback after animation
 */
export function animateElement(element, animationClass, callback) {
  if (!element) {
    console.warn('Cannot animate: element is null');
    return;
  }

  element.classList.add(animationClass);

  const handleAnimationEnd = () => {
    element.removeEventListener('animationend', handleAnimationEnd);
    if (callback && typeof callback === 'function') {
      callback();
    }
  };

  element.addEventListener('animationend', handleAnimationEnd);
}

/**
 * Fade in element
 * @param {HTMLElement} element - Element to fade in
 * @param {number} [duration=300] - Duration in milliseconds
 * @returns {Promise} Resolves when animation completes
 */
export function fadeIn(element, duration = 300) {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    element.style.opacity = '0';
    element.style.display = 'block';
    element.style.transition = `opacity ${duration}ms ease`;

    // Force reflow
    element.offsetHeight;

    element.style.opacity = '1';

    setTimeout(() => {
      element.style.transition = '';
      resolve();
    }, duration);
  });
}

/**
 * Fade out element
 * @param {HTMLElement} element - Element to fade out
 * @param {number} [duration=300] - Duration in milliseconds
 * @returns {Promise} Resolves when animation completes
 */
export function fadeOut(element, duration = 300) {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    element.style.opacity = '1';
    element.style.transition = `opacity ${duration}ms ease`;

    // Force reflow
    element.offsetHeight;

    element.style.opacity = '0';

    setTimeout(() => {
      element.style.display = 'none';
      element.style.transition = '';
      resolve();
    }, duration);
  });
}

/**
 * Slide element down (show)
 * @param {HTMLElement} element - Element to slide down
 * @param {number} [duration=300] - Duration in milliseconds
 * @returns {Promise} Resolves when animation completes
 */
export function slideDown(element, duration = 300) {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    element.style.display = 'block';
    element.style.overflow = 'hidden';
    const height = element.scrollHeight;

    element.style.height = '0';
    element.style.transition = `height ${duration}ms ease`;

    // Force reflow
    element.offsetHeight;

    element.style.height = `${height}px`;

    setTimeout(() => {
      element.style.height = '';
      element.style.overflow = '';
      element.style.transition = '';
      resolve();
    }, duration);
  });
}

/**
 * Slide element up (hide)
 * @param {HTMLElement} element - Element to slide up
 * @param {number} [duration=300] - Duration in milliseconds
 * @returns {Promise} Resolves when animation completes
 */
export function slideUp(element, duration = 300) {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    element.style.overflow = 'hidden';
    element.style.height = `${element.scrollHeight}px`;
    element.style.transition = `height ${duration}ms ease`;

    // Force reflow
    element.offsetHeight;

    element.style.height = '0';

    setTimeout(() => {
      element.style.display = 'none';
      element.style.height = '';
      element.style.overflow = '';
      element.style.transition = '';
      resolve();
    }, duration);
  });
}

/**
 * Cleanup animations (disconnect observers, remove listeners)
 */
export function cleanupAnimations() {
  if (sectionObserver) {
    sectionObserver.disconnect();
    sectionObserver = null;
  }

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handlePawPrintScroll);

  isAnimationsInitialized = false;
}

export default {
  initAnimations,
  createPawPrint,
  setupScrollFadeInAnimations,
  animateElement,
  fadeIn,
  fadeOut,
  slideDown,
  slideUp,
  cleanupAnimations
};
