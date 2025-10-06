# Smarter Dog JavaScript Modules

Modern, modular ES6 JavaScript architecture for the Smarter Dog website.

## Version

2.0.0 - Modular ES6 Refactor

## Architecture

This codebase uses ES6 modules for better organization, maintainability, and performance.

### Module Structure

```
src/js/
├── modules/
│   ├── config.js       # Configuration and constants
│   ├── navigation.js   # Navigation and menu functionality
│   ├── animations.js   # Animations and scroll effects
│   ├── cookies.js      # Cookie consent and analytics
│   ├── forms.js        # Form validation and submission
│   └── main.js         # Application entry point
└── README.md          # This file
```

## Modules Overview

### config.js
Central configuration module containing:
- Google Analytics ID
- API endpoints (Formspree)
- Feature flags
- Timing constants
- Breakpoints
- Form validation rules
- Storage keys

**Exports:**
- `config` - Configuration object
- `getCSSVariable(name)` - Get CSS custom property values
- `matchesBreakpoint(breakpoint, direction)` - Check media queries
- `isFeatureEnabled(feature)` - Check feature flags

### navigation.js
Handles all navigation-related functionality:
- Mobile menu toggle with accessibility (ARIA attributes)
- Smooth scrolling for anchor links
- Active section highlighting on scroll
- Header background changes
- Focus management and keyboard navigation

**Exports:**
- `initNavigation()` - Initialize navigation
- `toggleMobileMenu()` - Toggle mobile menu
- `closeMobileMenu()` - Close mobile menu

### animations.js
Performance-optimized animations:
- Paw print trail (desktop only, uses matchMedia)
- Scroll-based fade-in (IntersectionObserver)
- Scroll indicator hide functionality
- Utility animation functions (fadeIn, fadeOut, slideUp, slideDown)

**Exports:**
- `initAnimations()` - Initialize all animations
- `createPawPrint(x, y)` - Create paw print element
- `fadeIn(element, duration)` - Fade in element
- `fadeOut(element, duration)` - Fade out element
- `slideDown(element, duration)` - Slide element down
- `slideUp(element, duration)` - Slide element up

### cookies.js
Cookie consent management:
- Cookie consent banner with animations
- Google Analytics conditional loading
- localStorage preference storage
- Event tracking wrapper
- Privacy-first design

**Exports:**
- `initCookieConsent()` - Initialize cookie consent
- `showCookieBanner()` - Show consent banner
- `hideCookieBanner()` - Hide consent banner
- `loadGoogleAnalytics()` - Load GA script
- `trackEvent(name, params)` - Track custom events
- `getConsentStatus()` - Get current consent status

### forms.js
Comprehensive form handling:
- Real-time validation with visual feedback
- Loading states with spinners
- Toast notifications (success/error)
- Form field persistence (localStorage)
- Honeypot spam protection
- Rate limiting (max 3 submissions/hour)
- Accessible error messages (ARIA)

**Exports:**
- `initForms()` - Initialize form functionality
- `showToast(message, type)` - Show toast notification

### main.js
Application entry point:
- Initializes all modules with error handling
- Global error handlers
- Performance monitoring
- Browser compatibility checks
- Debug utilities (development only)

**Exports:**
- `initApp()` - Initialize entire application
- `getEnvironment()` - Get current environment
- `version` - Application version

## Usage

### In HTML

Add the following script tag to your HTML (before closing `</body>`):

```html
<!-- ES6 Module -->
<script type="module" src="/src/js/modules/main.js"></script>
```

For production, use the built version:

```html
<script type="module" src="/build/js/main.js"></script>
```

### Build Process

If using a build tool (recommended for production):

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### Individual Module Usage

```javascript
// Import specific functions from modules
import { showToast } from './modules/forms.js';
import { fadeIn, fadeOut } from './modules/animations.js';
import { trackEvent } from './modules/cookies.js';

// Use the functions
showToast('Hello!', 'success');
fadeIn(element, 300);
trackEvent('custom_event', { category: 'engagement' });
```

## Features

### ✓ Modern ES6 Syntax
- Import/export modules
- Async/await
- Arrow functions
- Template literals
- Destructuring

### ✓ Error Handling
- Try/catch blocks in all modules
- Global error handlers
- Graceful degradation
- Detailed console logging

### ✓ Performance Optimized
- requestAnimationFrame for animations
- Throttling and debouncing
- Passive event listeners
- IntersectionObserver for scroll effects
- Lazy loading of analytics

### ✓ Accessibility
- ARIA attributes
- Focus management
- Keyboard navigation
- Screen reader support
- Semantic HTML

### ✓ Progressive Enhancement
- Works without JavaScript
- Browser compatibility checks
- Feature detection
- Fallback options

### ✓ Developer Experience
- JSDoc comments
- Clear function names
- Modular architecture
- Debug utilities
- Console logging

## Browser Support

### Required Features
- ES6 modules
- Fetch API
- Promises
- LocalStorage
- IntersectionObserver
- CSS Custom Properties

### Supported Browsers
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

Older browsers will receive a compatibility warning.

## Configuration

### Feature Flags

Enable/disable features in `config.js`:

```javascript
features: {
  pawPrintAnimation: true,
  cookieConsent: true,
  formValidation: true,
  analytics: true,
  toastNotifications: true
}
```

### Timing Constants

Adjust timing in `config.js`:

```javascript
timing: {
  scrollThrottle: 150,
  cookieBannerDelay: 1000,
  toastDuration: 3000,
  pawPrintLifetime: 2000
}
```

## Debug Utilities

In development mode, access debug utilities via console:

```javascript
// Available at window.smarterDog
smarterDog.config           // View configuration
smarterDog.version          // Check version
smarterDog.modules          // Access modules
smarterDog.reinit()         // Reinitialize app
```

## Key Improvements from v1.0

### Fixed Bugs
✓ Header background now uses `getComputedStyle` to properly read CSS variables
✓ Proper error handling prevents crashes
✓ Memory leaks fixed with cleanup functions

### New Features
✓ Form validation with real-time feedback
✓ Loading spinners for form submission
✓ Toast notifications
✓ Form autosave to localStorage
✓ Rate limiting for spam prevention
✓ Honeypot spam protection
✓ Browser compatibility checks
✓ Performance monitoring

### Better Code Quality
✓ Modular ES6 architecture
✓ JSDoc documentation
✓ Error boundaries
✓ Event delegation
✓ Proper cleanup functions
✓ Accessibility improvements

## Migration from Old script.js

The old monolithic `script.js` has been refactored into separate modules.

### Before (v1.0)
```html
<script src="/script.js"></script>
```

### After (v2.0)
```html
<script type="module" src="/src/js/modules/main.js"></script>
```

All functionality has been preserved and enhanced.

## Troubleshooting

### Modules not loading?
Ensure you're using `type="module"` in your script tag and serving over HTTP/HTTPS (not file://).

### CORS errors?
ES6 modules require a web server. Use a local development server.

### Features not working?
Check browser console for errors. Enable debug mode by setting environment to development.

## Contributing

When adding new functionality:
1. Create a new module or extend existing one
2. Add JSDoc comments
3. Include error handling
4. Update this README
5. Test in all supported browsers

## License

Proprietary - Smarter Dog © 2024

## Support

For issues or questions, contact the development team.

---

**Built with ❤️ and 🐾 for Smarter Dog**
