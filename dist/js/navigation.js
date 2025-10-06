/**
 * Navigation Module
 * Handles mobile menu, smooth scrolling, and active section highlighting
 * @module navigation
 */

import { config, getCSSVariable } from './config.js';

let isNavigationInitialized = false;

// Cache DOM elements
let elements = {
  mobileMenuToggle: null,
  navLinks: null,
  navLinkItems: null,
  sections: null,
  header: null
};

/**
 * Initialize navigation functionality
 * @throws {Error} If required DOM elements are not found
 */
export function initNavigation() {
  if (isNavigationInitialized) {
    console.warn('Navigation already initialized');
    return;
  }

  try {
    // Cache DOM elements
    elements.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    elements.navLinks = document.querySelector('.nav-links');
    elements.navLinkItems = document.querySelectorAll('.nav-links a');
    elements.sections = document.querySelectorAll('section[id]');
    elements.header = document.querySelector('header');

    if (!elements.mobileMenuToggle || !elements.navLinks) {
      throw new Error('Required navigation elements not found');
    }

    setupMobileMenu();
    setupSmoothScrolling();
    setupActiveNavigation();
    setupHeaderBackground();

    isNavigationInitialized = true;
    console.log('Navigation initialized successfully');
  } catch (error) {
    console.error('Failed to initialize navigation:', error);
    throw error;
  }
}

/**
 * Setup mobile menu toggle functionality
 * Includes accessibility features (aria-expanded)
 */
function setupMobileMenu() {
  const { mobileMenuToggle, navLinks, navLinkItems } = elements;

  // Toggle menu on button click
  mobileMenuToggle.addEventListener('click', toggleMobileMenu);

  // Close menu when clicking on a link
  navLinkItems.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuToggle.classList.contains('active')) {
      closeMobileMenu();
      mobileMenuToggle.focus(); // Return focus to toggle button
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenuToggle.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !mobileMenuToggle.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

/**
 * Toggle mobile menu open/closed
 * @param {Event} [event] - Click event
 */
export function toggleMobileMenu(event) {
  if (event) {
    event.preventDefault();
  }

  const { mobileMenuToggle, navLinks } = elements;
  const isActive = mobileMenuToggle.classList.contains('active');

  mobileMenuToggle.classList.toggle('active');
  navLinks.classList.toggle('active');
  mobileMenuToggle.setAttribute('aria-expanded', !isActive);

  // Trap focus in menu when open
  if (!isActive) {
    trapFocusInMenu();
  }
}

/**
 * Close mobile menu
 * @param {Event} [event] - Click event
 */
export function closeMobileMenu(event) {
  const { mobileMenuToggle, navLinks } = elements;

  mobileMenuToggle.classList.remove('active');
  navLinks.classList.remove('active');
  mobileMenuToggle.setAttribute('aria-expanded', 'false');
}

/**
 * Trap focus within the mobile menu when open (accessibility)
 */
function trapFocusInMenu() {
  const { navLinks } = elements;
  const focusableElements = navLinks.querySelectorAll(
    'a[href], button, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  navLinks.addEventListener('keydown', function handleTabKey(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}

/**
 * Setup smooth scrolling for anchor links
 */
function setupSmoothScrolling() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', handleSmoothScroll);
  });
}

/**
 * Handle smooth scrolling to target section
 * @param {Event} event - Click event
 */
function handleSmoothScroll(event) {
  const href = event.currentTarget.getAttribute('href');

  // Ignore if href is just "#"
  if (href === '#' || !href) return;

  const target = document.querySelector(href);
  if (!target) {
    console.warn(`Scroll target not found: ${href}`);
    return;
  }

  event.preventDefault();

  try {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // Update URL without jumping
    if (history.pushState) {
      history.pushState(null, null, href);
    }

    // Set focus to target for accessibility (after scroll completes)
    setTimeout(() => {
      target.focus({ preventScroll: true });
      if (document.activeElement !== target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }, 500);
  } catch (error) {
    console.error('Smooth scroll failed:', error);
    // Fallback to regular scroll
    target.scrollIntoView();
  }
}

/**
 * Setup active navigation highlighting based on scroll position
 */
function setupActiveNavigation() {
  let ticking = false;

  const scrollHandler = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveNavLink();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });
}

/**
 * Update active navigation link based on current scroll position
 */
function updateActiveNavLink() {
  const { sections, navLinkItems } = elements;
  let currentSection = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollPosition >= sectionTop - config.animation.navScrollOffset) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinkItems.forEach(link => {
    link.style.color = '';
    const href = link.getAttribute('href');

    if (href === `#${currentSection}`) {
      const accentColor = getCSSVariable(config.cssVars.colorAccentTeal);
      link.style.color = accentColor || '#14b8a6';
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * Setup header background change on scroll
 * Uses getComputedStyle to properly get CSS variable values
 */
function setupHeaderBackground() {
  const { header } = elements;
  if (!header) return;

  let ticking = false;

  const scrollHandler = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateHeaderBackground();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });
}

/**
 * Update header background based on scroll position
 * Fixed to use getComputedStyle for CSS variables
 */
function updateHeaderBackground() {
  const { header } = elements;
  if (!header) return;

  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const backgroundColor = getCSSVariable(config.cssVars.colorBackground) || '#f8edeb';

  if (scrollY > 100) {
    header.style.background = backgroundColor;
    header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.15)';
  } else {
    header.style.background = backgroundColor;
    header.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
  }
}

/**
 * Cleanup navigation event listeners (for SPA navigation)
 */
export function cleanupNavigation() {
  isNavigationInitialized = false;
  elements = {
    mobileMenuToggle: null,
    navLinks: null,
    navLinkItems: null,
    sections: null,
    header: null
  };
}

export default {
  initNavigation,
  toggleMobileMenu,
  closeMobileMenu,
  cleanupNavigation
};
