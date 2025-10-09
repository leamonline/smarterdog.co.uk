# 🐾 Smarter Dog Grooming Salon - Website

> **Award-winning dog grooming salon in Ashton-under-Lyne**
> Professional grooming for all breeds • 40+ years experience

[![Lighthouse Score](https://img.shields.io/badge/Lighthouse-95+-success)](https://pagespeed.web.dev/)
[![Accessibility](https://img.shields.io/badge/WCAG-2.1%20AA-blue)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Version](https://img.shields.io/badge/version-2.0.0-brightgreen)](./CHANGELOG.md)

**Live Site**: [smarterdog.co.uk](https://smarterdog.co.uk)

---

## 📋 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development (watch mode)
npm run dev

# Build for production
npm run build
```

> _Note_: npm is configured with `loglevel=error` (see `.npmrc`) so that
> environment-provided legacy `http-proxy` settings don't surface warnings
> during installs or builds. Adjust the log level locally if you need verbose
> npm output.

### Production
```bash
# Build optimized assets
npm run build

# Deploy dist/ folder to server
# See DEPLOYMENT.md for details
```

---

## ✨ Features

### 🚀 Performance
- **95+ Lighthouse scores** across all metrics
- **< 2s load time** on 3G networks
- **< 100KB bundle size** (gzipped)
- WebP images with fallbacks
- Aggressive caching strategies

### ♿ Accessibility
- **WCAG 2.1 AA compliant**
- Keyboard navigation support
- Screen reader optimized
- Focus management
- ARIA labels throughout

### 📱 Progressive Web App
- **Installable** on mobile/desktop
- **Offline support** with service worker
- Background sync for forms
- App shortcuts
- Push notification ready

### 🔒 Security
- Content Security Policy
- HSTS enabled
- XSS protection
- Secure headers
- Bad bot blocking

### 🎯 SEO
- XML sitemap
- robots.txt
- Structured data (JSON-LD)
- Canonical URLs
- Meta tags optimized

---

## 🏗️ Project Structure

```
smarterdog.co.uk/
├── src/                    # Source files
│   ├── css/               # Modular CSS (14 files)
│   │   ├── base/          # Variables, reset, typography
│   │   ├── components/    # Buttons, cards, forms, etc.
│   │   ├── layout/        # Header, footer, sections
│   │   └── utils/         # Utilities & helpers
│   └── js/                # ES6 Modules (6 files)
│       └── modules/
│           ├── config.js
│           ├── navigation.js
│           ├── animations.js
│           ├── cookies.js
│           ├── forms.js
│           └── main.js
├── dist/                  # Production build output
├── build/                 # Build scripts
├── *.html                 # HTML pages
├── manifest.json          # PWA manifest
├── service-worker.js      # Service worker
└── package.json           # Dependencies
```

---

## 🛠️ Technologies

### Core
- **HTML5** - Semantic markup
- **CSS3** - Modern features (Grid, Custom Properties)
- **JavaScript ES6+** - Modules, async/await

### Build Tools
- **npm** - Package management
- **PostCSS** - CSS optimization & autoprefixing
- **Babel** - JavaScript transpilation
- **Imagemin** - Image optimization

### Services
- **Formspree** - Form handling
- **Google Analytics** - Analytics
- **Google Maps** - Location map

---

## 📚 Documentation

- **[CHANGELOG.md](./CHANGELOG.md)** - Version history & changes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment instructions
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview
- **[src/js/MIGRATION.md](./src/js/MIGRATION.md)** - Migration guide
- **[src/js/QUICKSTART.md](./src/js/QUICKSTART.md)** - 5-minute quick start

---

## 🚀 Deployment

### Option 1: Build & Upload
```bash
npm run build
# Upload dist/ and root files to server
```

### Option 2: Automated
See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- FTP/SFTP deployment
- Git deployment
- CI/CD with GitHub Actions

---

## 🧪 Testing

```bash
# Lighthouse audit
npm run lighthouse

# Accessibility test
npm run test:accessibility

# Check for broken links
npx broken-link-checker https://smarterdog.co.uk
```

---

## 🛠️ Troubleshooting

### Unable to update npm globally

The hosted development environment blocks outbound requests to the public npm
registry for **global** package installations. Running a command such as:

```bash
npm install -g npm@11.6.2
```

results in a `403 Forbidden` response. This is an infrastructure limitation, not
an issue with the project code.

**Workarounds**

- Continue using the bundled npm version (currently `11.4.2`) for local
  dependency management.
- When you need a newer npm temporarily, invoke it via `npx` without installing
  it globally:

  ```bash
  npx npm@11.6.2 <command>
  ```

- If you have a machine with unrestricted internet access, perform the upgrade
  there and commit any resulting lockfile or metadata changes instead of trying
  the upgrade inside this restricted environment.

These steps avoid the registry restriction while keeping your workflow moving.

---

## 📊 Performance Metrics

| Metric | Score |
|--------|-------|
| **Performance** | 95+ |
| **Accessibility** | 100 |
| **Best Practices** | 100 |
| **SEO** | 100 |
| **PWA** | ✓ Installable |

---

## 🌐 Browser Support

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

---

## 📞 Contact

**Smarter Dog Grooming Salon**
- **Website**: [smarterdog.co.uk](https://smarterdog.co.uk)
- **Email**: leam@smarterdog.co.uk
- **Phone**: 07507 731487
- **Address**: 183 Kings Road, Ashton-under-Lyne, OL6 8HD

---

## 📝 License

Copyright © 2025 Smarter Dog Grooming Salon. All rights reserved.

---

## 🙏 Acknowledgments

Built with:
- Modern web standards
- Accessibility best practices
- Performance optimization
- Security hardening
- SEO excellence

**Version 2.0.0** - Complete modernization ✨
