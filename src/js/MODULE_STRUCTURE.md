# Module Structure & Dependencies

## Visual Module Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         index.html                               │
│                    (or any HTML page)                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ <script type="module">
                            ▼
                    ┌───────────────┐
                    │   main.js     │  ◄── Entry Point
                    │   (303 lines) │
                    └───────┬───────┘
                            │
                            │ initializes all modules
                            │
        ┌───────────────────┼───────────────────┬─────────────┐
        │                   │                   │             │
        ▼                   ▼                   ▼             ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ navigation.js│   │ animations.js│   │  cookies.js  │   │   forms.js   │
│  (320 lines) │   │  (371 lines) │   │  (319 lines) │   │  (565 lines) │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │                  │
       │                  │                  │                  │
       └──────────────────┴──────────────────┴──────────────────┘
                                    │
                                    │ all import from
                                    ▼
                            ┌──────────────┐
                            │  config.js   │  ◄── Core Dependencies
                            │  (117 lines) │
                            └──────────────┘
```

## Dependency Graph

### Import Dependencies

```
config.js
├── (no dependencies - pure configuration)
└── exports: config, getCSSVariable(), matchesBreakpoint(), isFeatureEnabled()

navigation.js
├── imports: config, getCSSVariable from config.js
└── exports: initNavigation(), toggleMobileMenu(), closeMobileMenu()

animations.js
├── imports: config, matchesBreakpoint, isFeatureEnabled from config.js
└── exports: initAnimations(), createPawPrint(), fadeIn(), fadeOut(), slideUp(), slideDown()

cookies.js
├── imports: config, isFeatureEnabled from config.js
├── imports: fadeIn, fadeOut from animations.js
└── exports: initCookieConsent(), showCookieBanner(), hideCookieBanner(), loadGoogleAnalytics(), trackEvent()

forms.js
├── imports: config, isFeatureEnabled from config.js
├── imports: trackEvent from cookies.js
└── exports: initForms(), showToast()

main.js
├── imports: config, isFeatureEnabled from config.js
├── imports: initNavigation from navigation.js
├── imports: initAnimations from animations.js
├── imports: initCookieConsent from cookies.js
├── imports: initForms from forms.js
└── exports: initApp(), getEnvironment(), version
```

## Module Responsibilities

### config.js - The Foundation
**Role:** Central configuration hub
**Dependencies:** None (foundation module)
**Used By:** All other modules

**Key Responsibilities:**
- Store all configuration constants
- Define feature flags
- Set timing values
- Define form validation rules
- Provide utility functions for CSS variables
- Provide breakpoint checking

**Exports:**
```javascript
export const config = { ... }
export function getCSSVariable(name)
export function matchesBreakpoint(breakpoint, direction)
export function isFeatureEnabled(feature)
```

---

### navigation.js - User Navigation
**Role:** Handle all navigation interactions
**Dependencies:** config.js
**Used By:** main.js

**Key Responsibilities:**
- Mobile menu toggle
- Smooth scrolling
- Active section highlighting
- Header background changes
- Accessibility (ARIA, focus management)

**DOM Elements:**
- `.mobile-menu-toggle`
- `.nav-links`
- `section[id]`
- `header`

**Events:**
- click (menu toggle, links)
- scroll (active nav, header)
- keydown (ESC to close)

---

### animations.js - Visual Effects
**Role:** Manage all animations and visual effects
**Dependencies:** config.js
**Used By:** main.js, cookies.js

**Key Responsibilities:**
- Paw print trail animation (desktop only)
- Scroll-based fade-in effects
- Scroll indicator hiding
- Utility animation functions

**DOM Elements:**
- `section` (for fade-ins)
- `.scroll-indicator`
- Dynamic `.paw-print` elements

**APIs Used:**
- IntersectionObserver
- requestAnimationFrame
- matchMedia

---

### cookies.js - Privacy & Analytics
**Role:** Manage cookie consent and analytics
**Dependencies:** config.js, animations.js
**Used By:** main.js, forms.js

**Key Responsibilities:**
- Cookie consent banner
- Google Analytics loading
- Preference storage (localStorage)
- Event tracking wrapper

**DOM Elements:**
- `#cookieConsent`
- `#acceptEssential`
- `#acceptAll`
- `[data-cookie-settings]`

**Storage:**
- `localStorage.cookiesAccepted`
- `localStorage.analyticsAccepted`

---

### forms.js - User Input
**Role:** Handle form validation and submission
**Dependencies:** config.js, cookies.js
**Used By:** main.js

**Key Responsibilities:**
- Real-time form validation
- Form submission handling
- Loading states
- Toast notifications
- Form persistence (autosave)
- Spam protection

**DOM Elements:**
- `form[action*="formspree"]`
- Form input fields
- Submit button

**Storage:**
- `localStorage.smarterdog_form_data`
- `localStorage.smarterdog_submissions`

---

### main.js - Application Controller
**Role:** Initialize and coordinate all modules
**Dependencies:** All other modules
**Used By:** HTML (entry point)

**Key Responsibilities:**
- App initialization
- Module coordination
- Error handling (global)
- Performance monitoring
- Browser compatibility checking
- Debug utilities

**Initialization Order:**
1. Navigation (critical)
2. Animations (non-critical)
3. Cookie Consent (non-critical)
4. Forms (non-critical)

---

## Data Flow

### User Interaction Flow

```
User clicks mobile menu
        ↓
navigation.js → toggleMobileMenu()
        ↓
DOM updated (classes, ARIA)
        ↓
CSS animations triggered
```

```
User scrolls page
        ↓
navigation.js → updateActiveNavLink() (throttled)
animations.js → createPawPrint() (throttled, desktop only)
animations.js → IntersectionObserver callback
        ↓
DOM updated
        ↓
Visual feedback to user
```

```
User submits form
        ↓
forms.js → handleFormSubmit()
        ↓
forms.js → validateForm()
        ↓
Valid? → Submit to Formspree
        ↓
Success? → showToast('success')
           cookies.js → trackEvent()
           Clear form
        ↓
Failed? → showToast('error')
          cookies.js → trackEvent()
```

```
User accepts cookies
        ↓
cookies.js → handleAcceptAll()
        ↓
Save to localStorage
        ↓
cookies.js → loadGoogleAnalytics()
        ↓
GA script injected into DOM
        ↓
cookies.js → hideCookieBanner()
        ↓
animations.js → fadeOut() (via CSS animation)
```

## Event Flow

### Page Load Sequence

```
1. HTML parsed
2. main.js loaded (type="module")
3. main.js imports all dependencies
4. DOMContentLoaded event fires
5. main.js → initApp()
   ├─ 6a. initNavigation()
   ├─ 6b. initAnimations()
   ├─ 6c. initCookieConsent()
   └─ 6d. initForms()
7. Event listeners attached
8. Initial states set
9. Cookie banner shown (if needed)
10. App ready!
```

### User Scroll Event Flow

```
User scrolls
    ↓
Multiple throttled handlers fire:
    ├─ navigation.js → updateActiveNavLink() [150ms throttle]
    ├─ navigation.js → updateHeaderBackground() [requestAnimationFrame]
    ├─ animations.js → handlePawPrintScroll() [150ms throttle]
    └─ animations.js → IntersectionObserver (automatic)
    ↓
requestAnimationFrame batches DOM updates
    ↓
Browser repaints once (optimized)
```

## Storage Usage

### localStorage Keys

| Key | Module | Purpose | Type |
|-----|--------|---------|------|
| `cookiesAccepted` | cookies.js | Cookie consent status | string |
| `analyticsAccepted` | cookies.js | Analytics permission | boolean |
| `smarterdog_form_data` | forms.js | Autosaved form data | JSON |
| `smarterdog_submissions` | forms.js | Submission timestamps | JSON array |

## Window Objects

### Global Namespace

```javascript
// Production
window.dataLayer = []  // Google Analytics (if consent given)
window.gtag = function // Google Analytics function

// Development Only
window.smarterDog = {
  config,
  version: '2.0.0',
  modules: { ... },
  reinit()
}
```

## Performance Considerations

### Optimization Techniques Used

1. **Event Throttling**
   - Scroll events: 150ms throttle
   - Prevents excessive function calls

2. **Event Debouncing**
   - Form autosave: 300ms debounce
   - Waits for user to stop typing

3. **requestAnimationFrame**
   - All DOM-manipulating animations
   - Syncs with browser repaint

4. **Passive Event Listeners**
   - Scroll listeners: `{ passive: true }`
   - Improves scroll performance

5. **IntersectionObserver**
   - Instead of scroll calculations
   - Browser-optimized intersection detection

6. **Element Caching**
   - DOM queries cached on init
   - Prevents repeated querySelector calls

7. **Lazy Loading**
   - Google Analytics loads conditionally
   - Only when user accepts cookies

8. **Early Returns**
   - Check initialization state
   - Prevent duplicate initialization

## Module Communication

### Direct Imports (Preferred)
```javascript
// forms.js wants to track an event
import { trackEvent } from './cookies.js';
trackEvent('form_submission', { ... });
```

### Configuration Sharing
```javascript
// All modules read from config
import { config } from './config.js';
const maxSubmissions = config.form.maxSubmissionsPerHour;
```

### No Event Bus
- Direct function calls for simplicity
- Clear dependency graph
- Easy to debug
- Type-safe (with TypeScript)

## Testing Strategy

### Unit Testing (Recommended)
Each module can be tested independently:

```javascript
// Example: Testing config.js
import { getCSSVariable, matchesBreakpoint } from './config.js';

test('getCSSVariable returns correct value', () => {
  // Mock getComputedStyle
  // Test function
});
```

### Integration Testing
Test module interactions:

```javascript
// Example: Testing form submission flow
import { initForms } from './forms.js';
import { trackEvent } from './cookies.js';

test('form submission tracks analytics', () => {
  // Mock trackEvent
  // Submit form
  // Assert trackEvent was called
});
```

### E2E Testing
Test complete user flows in browser:

```javascript
// Example: Playwright/Cypress
test('user can submit contact form', async () => {
  await page.goto('/');
  await page.fill('[name="name"]', 'John');
  await page.fill('[name="email"]', 'john@example.com');
  await page.fill('[name="message"]', 'Hello!');
  await page.click('button[type="submit"]');
  await expect(page.locator('.toast-success')).toBeVisible();
});
```

---

## Summary

- **6 modules** working together
- **Clear separation of concerns**
- **Minimal coupling** between modules
- **Single entry point** (main.js)
- **Shared configuration** (config.js)
- **Performance optimized**
- **Fully documented**
- **Easy to test**
- **Easy to extend**

This architecture provides a solid foundation for future enhancements while maintaining code quality and performance.
