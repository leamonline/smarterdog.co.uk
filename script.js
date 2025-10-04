// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// WhatsApp buttons now link directly, no need for click handlers

// Form submission is now handled by Formspree
// Form will submit to https://formspree.io/f/mdkwzjnk
// Formspree will handle the submission and send email notifications

// Paw print scroll trail animation - disabled on mobile for performance
function createPawPrint(x, y) {
    const paw = document.createElement('div');
    paw.className = 'paw-print';
    paw.style.left = x + 'px';
    paw.style.top = y + 'px';
    paw.innerHTML = '🐾';
    document.body.appendChild(paw);

    // Remove paw print after animation
    setTimeout(() => {
        paw.remove();
    }, 2000);
}

// Only enable paw prints on desktop - use matchMedia to avoid forced reflow
const isDesktop = window.matchMedia('(min-width: 769px)').matches;
if (isDesktop) {
    let lastScrollTime = 0;
    const scrollThrottle = 150; // Create paw print every 150ms
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    // Cache viewport dimensions
    window.addEventListener('resize', () => {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
    }, { passive: true });

    window.addEventListener('scroll', () => {
        const now = Date.now();
        if (now - lastScrollTime > scrollThrottle) {
            lastScrollTime = now;

            // Create paw print at random position near scroll (using cached dimensions)
            const x = Math.random() * (viewportWidth - 50);
            const y = window.scrollY + Math.random() * viewportHeight;

            createPawPrint(x, y);
        }
    }, { passive: true });
}

// Add active state to navigation on scroll
const sections = document.querySelectorAll('section[id]');
const navLinkItems = document.querySelectorAll('.nav-links a');

let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            let current = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });

            navLinkItems.forEach(link => {
                link.style.color = '';
                if (link.getAttribute('href') === `#${current}`) {
                    link.style.color = '#14b8a6';
                }
            });

            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// Header background change on scroll
const header = document.querySelector('header');
let headerTicking = false;
window.addEventListener('scroll', () => {
    if (!headerTicking) {
        window.requestAnimationFrame(() => {
            if (window.scrollY > 100) {
                header.style.background = '#fff';
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.15)';
            } else {
                header.style.background = '#fff';
                header.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            }
            headerTicking = false;
        });
        headerTicking = true;
    }
}, { passive: true });

// Scroll indicator - hide on scroll (mobile only)
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    let scrollHideTimeout;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            scrollIndicator.classList.add('hidden');
            clearTimeout(scrollHideTimeout);
            scrollHideTimeout = setTimeout(() => {
                scrollIndicator.style.display = 'none';
            }, 300);
        }
    }, { passive: true, once: true });
}

// Scroll-based fade-in animations for sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
        }
    });
}, observerOptions);

// Observe all main sections
document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-in-section');
    sectionObserver.observe(section);
});

// Cookie Consent Banner
const cookieConsent = document.getElementById('cookieConsent');
const acceptEssentialBtn = document.getElementById('acceptEssential');
const acceptAllBtn = document.getElementById('acceptAll');
const cookieSettingsTriggers = document.querySelectorAll('[data-cookie-settings]');

let analyticsLoaded = false;

function loadGoogleAnalytics() {
    if (analyticsLoaded) {
        return;
    }

    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
        window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', 'G-VPN43VE4FC', {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure'
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-VPN43VE4FC';
    document.head.appendChild(script);
}

if (cookieConsent && acceptEssentialBtn && acceptAllBtn) {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    const showCookieBanner = () => {
        cookieConsent.style.display = 'block';
        cookieConsent.style.animation = 'none';
        // Force reflow so the animation restarts when reopened
        void cookieConsent.offsetWidth;
        cookieConsent.style.animation = 'slideUp 0.5s ease-out';
    };

    const hideCookieBanner = () => {
        cookieConsent.style.animation = 'slideDown 0.5s ease-out forwards';
        setTimeout(() => {
            cookieConsent.style.display = 'none';
        }, 500);
    };

    const hasCookieChoice = localStorage.getItem('cookiesAccepted');
    const analyticsAccepted = localStorage.getItem('analyticsAccepted') === 'true';

    if (analyticsAccepted) {
        loadGoogleAnalytics();
    }

    if (!hasCookieChoice) {
        setTimeout(showCookieBanner, 1000);
    }

    acceptEssentialBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'essential');
        localStorage.setItem('analyticsAccepted', 'false');
        hideCookieBanner();
    });

    acceptAllBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        localStorage.setItem('analyticsAccepted', 'true');
        loadGoogleAnalytics();
        hideCookieBanner();
    });

    cookieSettingsTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            showCookieBanner();
        });
    });
} else if (localStorage.getItem('analyticsAccepted') === 'true') {
    loadGoogleAnalytics();
}
