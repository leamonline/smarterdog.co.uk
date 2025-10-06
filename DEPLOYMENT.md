# Deployment Guide

Complete deployment instructions for smarterdog.co.uk v2.0.

## 📋 Pre-Deployment Checklist

### 1. Install Dependencies
```bash
cd /path/to/smarterdog.co.uk
npm install
```

### 2. Build Production Assets
```bash
npm run build
```

This will:
- ✅ Compile and minify CSS → `dist/css/styles.min.css`
- ✅ Transpile and minify JS → `dist/js/script.min.js`
- ✅ Optimize images → Convert to WebP
- ✅ Minify HTML files → `dist/*.html`

### 3. Test Locally
```bash
# Open index.html in browser
open index.html

# Or use a local server
npx serve .
```

### 4. Run Quality Checks
```bash
# Lighthouse audit
npm run lighthouse

# Accessibility check
npm run test:accessibility
```

---

## 🚀 Deployment Steps

### Option A: Manual FTP/SFTP Deployment

1. **Upload Files** to your web server:
   ```
   ✅ Upload dist/ folder
   ✅ Upload *.html files (root)
   ✅ Upload manifest.json
   ✅ Upload service-worker.js
   ✅ Upload sitemap.xml
   ✅ Upload robots.txt
   ✅ Upload security.txt
   ✅ Upload .htaccess
   ✅ Upload images (*.webp, *.jpg, *.png)
   ✅ Upload logo files
   ```

2. **DO NOT upload**:
   ```
   ❌ node_modules/
   ❌ src/ (source files)
   ❌ build/ (build scripts)
   ❌ .git/
   ❌ package.json
   ❌ package-lock.json
   ❌ *.config.js files
   ```

3. **Set Correct Permissions**:
   - Directories: `755`
   - Files: `644`
   - .htaccess: `644`

### Option B: Git Deployment

If your host supports Git deployment:

```bash
# Add production remote
git remote add production user@server:/path/to/webroot

# Build and deploy
npm run build
git add dist/
git commit -m "Build production assets"
git push production main
```

### Option C: CI/CD with GitHub Actions

See `.github/workflows/deploy.yml` for automated deployment.

---

## 🔧 Post-Deployment Configuration

### 1. Update HTML Files

Replace old script/style references:

**OLD:**
```html
<link rel="stylesheet" href="styles.css?v=5">
<script src="script.js"></script>
```

**NEW:**
```html
<link rel="stylesheet" href="dist/css/styles.min.css">
<script type="module" src="dist/js/script.min.js"></script>
```

Or use the minified HTML files from `dist/` folder.

### 2. Register Service Worker

Add to bottom of `<body>` in all HTML files:

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registered', reg))
      .catch(err => console.log('SW error', err));
  }
</script>
```

### 3. Link Manifest

Add to `<head>` in all HTML files:

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#e76f51">
```

### 4. Add Skip Link

Add as first element in `<body>`:

```html
<a href="#main" class="skip-link">Skip to main content</a>
```

And add `id="main"` to your main content area.

### 5. Update Canonical URLs

Add to `<head>` of each page:

```html
<!-- index.html -->
<link rel="canonical" href="https://smarterdog.co.uk/">

<!-- faqs.html -->
<link rel="canonical" href="https://smarterdog.co.uk/faqs.html">

<!-- etc... -->
```

### 6. Configure Google Analytics

Update `src/js/modules/config.js`:

```javascript
GOOGLE_ANALYTICS_ID: 'G-VPN43VE4FC' // Your GA4 ID
```

Then rebuild:
```bash
npm run build
```

### 7. Verify Security Headers

Test security headers:
```bash
curl -I https://smarterdog.co.uk
```

Should see:
- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options

---

## ✅ Verification Checklist

After deployment, verify:

### Functionality
- [ ] Homepage loads correctly
- [ ] Navigation works (desktop & mobile)
- [ ] All internal links work
- [ ] Contact form submits
- [ ] Newsletter signup works
- [ ] Cookie consent appears
- [ ] Service worker registers
- [ ] PWA install prompt shows

### Performance
- [ ] CSS loads and styles apply
- [ ] JavaScript loads and executes
- [ ] Images display (WebP with fallbacks)
- [ ] Page loads in < 2s on 3G
- [ ] No console errors
- [ ] No 404 errors in Network tab

### SEO
- [ ] sitemap.xml accessible: https://smarterdog.co.uk/sitemap.xml
- [ ] robots.txt accessible: https://smarterdog.co.uk/robots.txt
- [ ] Canonical URLs in place
- [ ] Meta descriptions present
- [ ] Schema markup valid (Google Rich Results Test)

### Accessibility
- [ ] Skip link works (Tab key)
- [ ] Keyboard navigation functional
- [ ] ARIA labels present
- [ ] Color contrast passes
- [ ] Screen reader compatible

### Security
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] No mixed content warnings
- [ ] security.txt accessible

### Mobile
- [ ] Responsive on phone (< 768px)
- [ ] Touch targets adequate (44x44px min)
- [ ] Mobile menu works
- [ ] Forms usable on mobile
- [ ] PWA installable

---

## 🔍 Testing Tools

### Online Tools
1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
2. **GTmetrix**: https://gtmetrix.com/
3. **WebPageTest**: https://www.webpagetest.org/
4. **Google Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
5. **Google Rich Results Test**: https://search.google.com/test/rich-results
6. **Security Headers**: https://securityheaders.com/
7. **SSL Labs**: https://www.ssllabs.com/ssltest/

### Command Line
```bash
# Lighthouse
npm run lighthouse

# Pa11y accessibility
npm run test:accessibility

# Check for broken links
npx broken-link-checker https://smarterdog.co.uk

# Validate HTML
curl https://smarterdog.co.uk | npx html-validate --stdin
```

---

## 🐛 Troubleshooting

### Service Worker Not Registering

**Problem**: Console shows "Failed to register service worker"

**Solution**:
1. Ensure HTTPS is enabled
2. Check `/service-worker.js` is accessible
3. Clear browser cache and retry
4. Check for console errors

### Styles Not Loading

**Problem**: Page appears unstyled

**Solution**:
1. Verify `dist/css/styles.min.css` exists
2. Check file permissions (644)
3. Clear browser cache
4. Check .htaccess isn't blocking CSS

### Forms Not Submitting

**Problem**: Forms don't submit or show errors

**Solution**:
1. Check Formspree endpoint is correct
2. Verify rate limiting not triggered
3. Check browser console for errors
4. Ensure honeypot field isn't visible

### Mobile Menu Not Working

**Problem**: Hamburger menu doesn't open

**Solution**:
1. Check JavaScript loaded (F12 > Sources)
2. Verify no console errors
3. Clear cache and hard reload
4. Check `.mobile-menu-toggle` element exists

---

## 📈 Monitoring

### Google Analytics
- Set up goals for form submissions
- Track WhatsApp button clicks
- Monitor page load times
- Track PWA installs

### Google Search Console
- Submit sitemap: https://smarterdog.co.uk/sitemap.xml
- Monitor index coverage
- Check mobile usability
- Track search performance

### Error Monitoring
Consider adding:
- Sentry for JavaScript error tracking
- Uptime monitoring (UptimeRobot, Pingdom)
- Performance monitoring (Calibre, SpeedCurve)

---

## 🔄 Rollback Plan

If issues arise:

### Quick Rollback
1. Restore old `styles.css` and `script.js`
2. Update HTML to use old files
3. Remove service worker registration
4. Clear browser cache

### Gradual Rollout
1. Deploy to staging first
2. Test thoroughly
3. Roll out to 10% of users
4. Monitor for 24 hours
5. Gradually increase to 100%

---

## 📞 Support

For deployment issues:
- Email: leam@smarterdog.co.uk
- Check: `/CHANGELOG.md` for version history
- Check: `/MIGRATION.md` for upgrade guide

---

**Last Updated**: 2025-01-04
**Version**: 2.0.0
