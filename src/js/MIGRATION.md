# Migration Guide: script.js → ES6 Modules

This guide helps you transition from the old monolithic `script.js` to the new modular ES6 architecture.

## Quick Start

### 1. Update HTML

**Remove the old script:**
```html
<!-- OLD - Remove this -->
<script src="/script.js"></script>
```

**Add the new module:**
```html
<!-- NEW - Add this before closing </body> tag -->
<script type="module" src="/src/js/modules/main.js"></script>
```

### 2. Test Your Site

Open your site in a browser and check:
- ✓ Mobile menu works
- ✓ Smooth scrolling works
- ✓ Paw prints appear on desktop (when scrolling)
- ✓ Cookie banner appears (if no choice made)
- ✓ Form validation works
- ✓ Form submission works
- ✓ Toast notifications appear

### 3. Check Browser Console

Open DevTools (F12) and look for:
```
🐾 Smarter Dog Website Loading...
Version: 2.0.0
Environment: development
Initializing Navigation...
✓ Navigation initialized
Initializing Animations...
✓ Animations initialized
...
✓ All modules initialized successfully
🐾 Smarter Dog Website Ready!
```

## What Changed?

### Module Breakdown

The old 264-line `script.js` has been split into 6 focused modules:

| Old (script.js) | New Module | Lines | Purpose |
|----------------|------------|-------|---------|
| Lines 1-33 | navigation.js | 320 | Mobile menu, smooth scroll, active nav |
| Lines 42-82 | animations.js | 371 | Paw prints, fade-ins, scroll effects |
| Lines 169-263 | cookies.js | 319 | Cookie consent, analytics |
| N/A (new) | forms.js | 565 | Form validation, submission, toasts |
| N/A (new) | config.js | 117 | Configuration and constants |
| N/A (new) | main.js | 303 | App initialization |
| **Total** | **6 modules** | **1,995** | **Modular, maintainable** |

### New Features Added

#### Form Validation ⭐
- Real-time validation as you type
- Visual error/success states
- Accessible error messages (ARIA)
- Email format validation
- Required field checking
- Character count limits

#### Loading States ⭐
- Spinner animation during submission
- Button disabled state
- Form opacity during submission
- Better user feedback

#### Toast Notifications ⭐
- Success messages after form submission
- Error messages if submission fails
- Auto-dismiss after 3 seconds
- Close button
- Mobile responsive

#### Form Autosave ⭐
- Saves form data to localStorage
- Restores on page reload
- Prevents data loss
- Clears after successful submission

#### Spam Protection ⭐
- Honeypot field
- Rate limiting (3 submissions/hour)
- Client-side validation
- Timestamp tracking

#### Error Handling ⭐
- Try/catch in all functions
- Global error handlers
- Graceful degradation
- Detailed logging

### Fixed Bugs

✅ **Header Background Bug**
- Old: Used hardcoded `#fff`
- New: Uses `getComputedStyle()` to get `--color-background` from CSS
- Now properly respects CSS variable changes

✅ **Memory Leaks**
- Added cleanup functions for all modules
- Proper event listener management
- Observer disconnection

✅ **Accessibility Issues**
- Added ARIA attributes
- Focus management
- Keyboard navigation
- Screen reader support

## Feature Comparison

### Mobile Menu

**Old:**
```javascript
mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
});
```

**New:**
```javascript
// More features: ESC key, click outside, focus trap
export function toggleMobileMenu(event) {
  if (event) event.preventDefault();

  const { mobileMenuToggle, navLinks } = elements;
  const isActive = mobileMenuToggle.classList.contains('active');

  mobileMenuToggle.classList.toggle('active');
  navLinks.classList.toggle('active');
  mobileMenuToggle.setAttribute('aria-expanded', !isActive);

  if (!isActive) {
    trapFocusInMenu(); // NEW: Accessibility
  }
}
```

### Scroll Animation

**Old:**
```javascript
// Basic implementation
window.addEventListener('scroll', () => {
    // ... code
}, { passive: true });
```

**New:**
```javascript
// Performance optimized with IntersectionObserver
const sectionObserver = new IntersectionObserver(handleIntersection, options);

sections.forEach(section => {
  section.classList.add('fade-in-section');
  sectionObserver.observe(section);
});
```

### Cookie Consent

**Old:**
```javascript
// Basic localStorage checks
const hasCookieChoice = localStorage.getItem('cookiesAccepted');
if (!hasCookieChoice) {
    setTimeout(showCookieBanner, 1000);
}
```

**New:**
```javascript
// Full module with animations, tracking, settings
export function initCookieConsent() {
  // Feature flag check
  // Element caching
  // Animation injection
  // Event listeners
  // Preference checking
  // Analytics conditional loading
}
```

### Forms (Completely New!)

**Old:**
```javascript
// Just a comment:
// Form submission is now handled by Formspree
```

**New:**
```javascript
// Full form handling system:
- Real-time validation
- Loading states
- Toast notifications
- Autosave
- Spam protection
- Rate limiting
- Error handling
```

## Configuration

All configuration is now centralized in `config.js`:

```javascript
export const config = {
  // Toggle features
  features: {
    pawPrintAnimation: true,
    cookieConsent: true,
    formValidation: true,
    analytics: true,
    toastNotifications: true
  },

  // Adjust timing
  timing: {
    scrollThrottle: 150,
    cookieBannerDelay: 1000,
    toastDuration: 3000
  },

  // Form validation rules
  form: {
    maxSubmissionsPerHour: 3,
    minMessageLength: 10,
    maxMessageLength: 1000
  }
};
```

## Customization Examples

### Disable Paw Print Animation

```javascript
// In config.js
features: {
  pawPrintAnimation: false, // Changed from true
}
```

### Change Toast Duration

```javascript
// In config.js
timing: {
  toastDuration: 5000, // Changed from 3000 (now 5 seconds)
}
```

### Adjust Form Validation

```javascript
// In config.js
form: {
  minMessageLength: 20, // Changed from 10
  maxSubmissionsPerHour: 5, // Changed from 3
}
```

## Testing Checklist

After migration, test these scenarios:

### Navigation
- [ ] Mobile menu opens/closes
- [ ] Menu closes when clicking a link
- [ ] Menu closes when clicking outside
- [ ] ESC key closes menu
- [ ] Smooth scrolling works for all anchor links
- [ ] Active nav link highlights on scroll
- [ ] Header background changes on scroll

### Animations
- [ ] Paw prints appear on desktop when scrolling
- [ ] Paw prints don't appear on mobile
- [ ] Sections fade in when scrolling
- [ ] Scroll indicator hides after scrolling

### Cookie Consent
- [ ] Banner appears after 1 second (first visit)
- [ ] "Essential Only" button works
- [ ] "Accept All" button works
- [ ] Analytics loads after accepting all
- [ ] Preferences persist on reload
- [ ] Settings link reopens banner

### Forms
- [ ] Required field validation works
- [ ] Email validation works
- [ ] Real-time error messages appear
- [ ] Success states show on valid input
- [ ] Loading spinner appears on submit
- [ ] Success toast appears after submission
- [ ] Form clears after submission
- [ ] Error toast appears on failure
- [ ] Form data saves to localStorage
- [ ] Form data restores on reload

### Error Handling
- [ ] No console errors in normal operation
- [ ] Graceful degradation if module fails
- [ ] Browser warning on unsupported browsers

## Rollback Plan

If you need to rollback to the old script:

1. Remove the module script tag:
```html
<!-- Remove this -->
<script type="module" src="/src/js/modules/main.js"></script>
```

2. Add back the old script:
```html
<!-- Add this back -->
<script src="/script.js"></script>
```

3. The old `script.js` is still available in the root directory.

**Note:** You'll lose new features (form validation, toasts, etc.) if you rollback.

## Performance Impact

### Before (Old script.js)
- 264 lines
- 8.5 KB
- Monolithic
- Basic functionality

### After (New Modules)
- 1,995 lines
- ~40 KB (unminified)
- Modular
- Enhanced functionality
- Better code organization

**Note:** The file size increased because we added many new features. However:
- Code is more maintainable
- Features can be tree-shaken in production
- Lazy loading possible
- Better caching (modules load separately)

## Production Build

For production, minify and bundle:

```bash
# Using a bundler (e.g., Rollup, Webpack, Vite)
npm run build

# Results in smaller bundle:
# - Minified code
# - Tree-shaking (removes unused code)
# - Source maps for debugging
```

## Support

### Common Issues

**Issue:** "Failed to load module script"
**Solution:** Ensure you're using a web server (not file://) and `type="module"` is set.

**Issue:** "CORS error"
**Solution:** ES6 modules require proper CORS headers. Use a local dev server.

**Issue:** "Browser not supported warning"
**Solution:** Update to a modern browser (Chrome 61+, Firefox 60+, Safari 11+, Edge 79+).

**Issue:** "Features not working"
**Solution:** Check browser console for errors. Check feature flags in config.js.

## Questions?

- Check the README.md for detailed documentation
- Review the source code (all functions have JSDoc comments)
- Check browser console for debug information
- Use `window.smarterDog` in development for debugging

---

**Happy coding! 🐾**
