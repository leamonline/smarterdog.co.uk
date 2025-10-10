> **Archived Note:** This document describes the pre-2.1 build. See README.md for the current Vite workflow.

# Quick Start Guide

Get up and running with the new ES6 modules in 5 minutes!

## Step 1: Update Your HTML (2 minutes)

### Replace the old script tag

**Find this in your HTML files:**
```html
<script src="/script.js"></script>
```

**Replace with:**
```html
<script type="module" src="/src/js/modules/main.js"></script>
```

**Important:** Place this script tag right before the closing `</body>` tag.

### Example HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smarter Dog</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <!-- Your content here -->

    <!-- Add this before closing body tag -->
    <script type="module" src="/src/js/modules/main.js"></script>
</body>
</html>
```

## Step 2: Test the Installation (1 minute)

### Open your browser's Developer Tools (F12)

You should see this in the console:

```
🐾 Smarter Dog Website Loading...
Version: 2.0.0
Environment: development
Initializing Navigation...
✓ Navigation initialized
Initializing Animations...
✓ Animations initialized
Initializing Cookie Consent...
✓ Cookie Consent initialized
Initializing Forms...
✓ Forms initialized
✓ All modules initialized successfully
🐾 Smarter Dog Website Ready!
```

### If you see errors:

1. **CORS error?** → You need to run a local web server (not file://)
2. **Module not found?** → Check the file path in your script tag
3. **Syntax error?** → Your browser may not support ES6 modules (update it)

## Step 3: Verify Features Work (2 minutes)

### Test Checklist

- [ ] **Mobile Menu:** Click the hamburger menu → it opens
- [ ] **Smooth Scroll:** Click a navigation link → smooth scrolls to section
- [ ] **Paw Prints:** Scroll on desktop → paw prints appear
- [ ] **Cookie Banner:** Wait 1 second → cookie banner slides up
- [ ] **Form Validation:** Type invalid email → error appears
- [ ] **Form Submission:** Submit form → loading spinner → success toast

### All working? You're done! 🎉

---

## Optional: Customize Configuration

### Enable/Disable Features

Edit `/src/js/modules/config.js`:

```javascript
features: {
  pawPrintAnimation: true,     // Desktop paw print trail
  cookieConsent: true,         // Cookie consent banner
  formValidation: true,        // Real-time form validation
  analytics: true,             // Google Analytics
  toastNotifications: true     // Success/error toasts
}
```

### Adjust Timing

```javascript
timing: {
  scrollThrottle: 150,         // Paw print creation interval (ms)
  cookieBannerDelay: 1000,     // Delay before showing banner (ms)
  toastDuration: 3000,         // How long toasts stay visible (ms)
  pawPrintLifetime: 2000       // How long paw prints stay on screen (ms)
}
```

### Change Form Validation Rules

```javascript
form: {
  maxSubmissionsPerHour: 3,    // Rate limit
  minMessageLength: 10,        // Minimum message characters
  maxMessageLength: 1000       // Maximum message characters
}
```

---

## Troubleshooting

### Problem: "Failed to load module script"

**Solution:** You need to serve your site through a web server.

**Quick fix (Python):**
```bash
# In your project directory
python3 -m http.server 8000
# Then visit http://localhost:8000
```

**Quick fix (Node.js):**
```bash
npx serve .
# Or
npx http-server
```

**Quick fix (VS Code):**
Install "Live Server" extension and click "Go Live"

---

### Problem: Features not working

**Check:**
1. Console for errors (F12)
2. Feature flags in `config.js` (are they enabled?)
3. Browser support (Chrome 61+, Firefox 60+, Safari 11+, Edge 79+)

---

### Problem: Cookie banner not appearing

**Check:**
1. Have you already accepted/rejected cookies? (Check Application → Local Storage in DevTools)
2. Is the `#cookieConsent` element in your HTML?
3. Clear localStorage and reload:
   ```javascript
   localStorage.clear(); location.reload();
   ```

---

### Problem: Form validation not working

**Check:**
1. Does your form have a `name` attribute on each field?
2. Required fields: `name`, `email`, `message`
3. Check console for errors

---

### Problem: Toast notifications not appearing

**Check:**
1. Is `toastNotifications` feature enabled in `config.js`?
2. Submit the form and check console for errors
3. Look for `.toast` element in DOM inspector

---

## Advanced Usage

### Custom Event Tracking

```javascript
// In your own script (after modules load)
import { trackEvent } from './src/js/modules/cookies.js';

// Track custom events
document.querySelector('.special-button').addEventListener('click', () => {
  trackEvent('special_button_click', {
    category: 'engagement',
    label: 'hero_cta'
  });
});
```

### Show Custom Toasts

```javascript
import { showToast } from './src/js/modules/forms.js';

// Show success message
showToast('Settings saved!', 'success');

// Show error message
showToast('Something went wrong', 'error');

// Show info message
showToast('Did you know...', 'info');
```

### Custom Animations

```javascript
import { fadeIn, fadeOut, slideDown, slideUp } from './src/js/modules/animations.js';

const element = document.querySelector('.my-element');

// Fade in over 300ms
fadeIn(element, 300).then(() => {
  console.log('Fade in complete!');
});

// Fade out over 500ms
fadeOut(element, 500);

// Slide down
slideDown(element);

// Slide up
slideUp(element);
```

### Check Feature Flags

```javascript
import { isFeatureEnabled } from './src/js/modules/config.js';

if (isFeatureEnabled('analytics')) {
  console.log('Analytics is enabled');
}
```

### Check Breakpoints

```javascript
import { matchesBreakpoint } from './src/js/modules/config.js';

if (matchesBreakpoint('mobile', 'max')) {
  console.log('Mobile view');
} else if (matchesBreakpoint('tablet', 'max')) {
  console.log('Tablet view');
} else {
  console.log('Desktop view');
}
```

---

## Development vs Production

### Development (Current Setup)

```html
<!-- Unminified, with debug logging -->
<script type="module" src="/src/js/modules/main.js"></script>
```

### Production (Recommended)

```html
<!-- Minified and bundled -->
<script type="module" src="/build/js/main.min.js"></script>
```

**To create production build:**
```bash
npm run build
```

---

## Browser Compatibility

### ✓ Supported Browsers

- Chrome 61+ (2017)
- Firefox 60+ (2018)
- Safari 11+ (2017)
- Edge 79+ (2020)

### ✗ Unsupported Browsers

- Internet Explorer (all versions)
- Old Android Browser
- Old iOS Safari (< 11)

Users with unsupported browsers will see a warning banner.

---

## Performance Tips

### 1. Lazy Load Analytics

Analytics only loads when users accept cookies → faster initial load.

### 2. Use Passive Listeners

All scroll listeners use `{ passive: true }` → smoother scrolling.

### 3. Throttle Heavy Operations

Paw print creation and scroll handlers are throttled → less CPU usage.

### 4. Cache DOM Queries

Elements are queried once on init and cached → faster lookups.

### 5. Use IntersectionObserver

Fade-in animations use IntersectionObserver → more efficient than scroll events.

---

## Next Steps

1. **Read the full docs:** Check out [README.md](./README.md)
2. **Understand the architecture:** See [MODULE_STRUCTURE.md](./MODULE_STRUCTURE.md)
3. **Customize configuration:** Edit [config.js](./modules/config.js)
4. **Add custom features:** Import and extend the modules
5. **Optimize for production:** Set up a build process

---

## Need Help?

- **Documentation:** Read [README.md](./README.md)
- **Migration Guide:** Read [MIGRATION.md](./MIGRATION.md)
- **Architecture:** Read [MODULE_STRUCTURE.md](./MODULE_STRUCTURE.md)
- **Summary:** Read [SUMMARY.md](./SUMMARY.md)

---

**You're all set! Happy coding! 🐾**
