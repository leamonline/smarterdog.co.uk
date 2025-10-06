(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    const onDocumentReady = (callback) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
        } else {
            callback();
        }
    };

    const createRafThrottle = (callback) => {
        let ticking = false;
        return (...args) => {
            if (ticking) {
                return;
            }
            ticking = true;
            window.requestAnimationFrame(() => {
                callback(...args);
                ticking = false;
            });
        };
    };

    const analyticsState = { loaded: false };

    const loadGoogleAnalytics = () => {
        if (analyticsState.loaded) {
            return;
        }

        analyticsState.loaded = true;
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
    };

    const initMobileNavigation = () => {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const navigation = document.querySelector('.nav-links');

        if (!toggle || !navigation) {
            return;
        }

        const closeMenu = () => {
            toggle.classList.remove('active');
            navigation.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        };

        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            const nextExpandedState = !isExpanded;
            toggle.classList.toggle('active', nextExpandedState);
            navigation.classList.toggle('active', nextExpandedState);
            toggle.setAttribute('aria-expanded', String(nextExpandedState));
        });

        navigation.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    };

    const initSmoothScroll = () => {
        const anchors = Array.from(document.querySelectorAll('a[href^="#"]'))
            .filter(anchor => {
                const href = anchor.getAttribute('href');
                return href && href.length > 1;
            });

        if (!anchors.length) {
            return;
        }

        anchors.forEach(anchor => {
            anchor.addEventListener('click', (event) => {
                const targetSelector = anchor.getAttribute('href');
                const target = targetSelector ? document.querySelector(targetSelector) : null;

                if (!target) {
                    return;
                }

                event.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });
    };

    const initPawPrintTrail = () => {
        const desktopQuery = window.matchMedia('(min-width: 769px)');
        if (!desktopQuery.matches) {
            return;
        }

        const createPawPrint = (x, y) => {
            const paw = document.createElement('div');
            paw.className = 'paw-print';
            paw.style.left = `${x}px`;
            paw.style.top = `${y}px`;
            paw.textContent = '🐾';
            document.body.appendChild(paw);

            window.setTimeout(() => {
                paw.remove();
            }, 2000);
        };

        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        window.addEventListener('resize', () => {
            viewport.width = window.innerWidth;
            viewport.height = window.innerHeight;
        }, { passive: true });

        let lastScrollTime = 0;
        const scrollThrottle = 150;

        window.addEventListener('scroll', () => {
            const now = Date.now();
            if (now - lastScrollTime < scrollThrottle) {
                return;
            }

            lastScrollTime = now;
            const x = Math.random() * Math.max(0, viewport.width - 50);
            const y = window.scrollY + Math.random() * viewport.height;
            createPawPrint(x, y);
        }, { passive: true });
    };

    const initScrollSpy = () => {
        const navItems = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'))
            .map(link => {
                const href = link.getAttribute('href');
                if (!href || href.length <= 1) {
                    return null;
                }

                const sectionId = href.slice(1);
                const section = document.getElementById(sectionId);
                if (!section) {
                    return null;
                }

                return { link, section, sectionId };
            })
            .filter(Boolean);

        if (!navItems.length) {
            return;
        }

        let activeSectionId = null;

        const updateActiveSection = () => {
            const scrollPosition = window.scrollY + 150;
            let currentId = '';

            navItems.forEach(({ section, sectionId }) => {
                if (scrollPosition >= section.offsetTop) {
                    currentId = sectionId;
                }
            });

            if (currentId === activeSectionId) {
                return;
            }

            navItems.forEach(({ link, sectionId }) => {
                link.classList.toggle('is-active', sectionId === currentId);
            });

            activeSectionId = currentId;
        };

        updateActiveSection();
        window.addEventListener('scroll', createRafThrottle(updateActiveSection), { passive: true });
    };

    const initHeaderState = () => {
        const header = document.querySelector('header');
        if (!header) {
            return;
        }

        const updateHeader = () => {
            header.classList.toggle('scrolled', window.scrollY > 100);
        };

        updateHeader();
        window.addEventListener('scroll', createRafThrottle(updateHeader), { passive: true });
    };

    const initScrollIndicator = () => {
        const indicator = document.querySelector('.scroll-indicator');
        if (!indicator) {
            return;
        }

        let hideTimeout;
        const hideIndicator = () => {
            indicator.classList.add('hidden');
            window.clearTimeout(hideTimeout);
            hideTimeout = window.setTimeout(() => {
                indicator.style.display = 'none';
            }, 300);
        };

        const handleScroll = () => {
            if (window.scrollY > 50) {
                hideIndicator();
                window.removeEventListener('scroll', handleScroll);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    };

    const initSectionObserver = () => {
        const sections = Array.from(document.querySelectorAll('section'));
        if (!sections.length) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        sections.forEach(section => {
            section.classList.add('fade-in-section');
            observer.observe(section);
        });
    };

    const initCookieBanner = () => {
        const banner = document.getElementById('cookieConsent');
        const acceptEssentialBtn = document.getElementById('acceptEssential');
        const acceptAllBtn = document.getElementById('acceptAll');
        const settingsTriggers = document.querySelectorAll('[data-cookie-settings]');

        const COOKIE_CHOICE_KEY = 'cookiesAccepted';
        const ANALYTICS_KEY = 'analyticsAccepted';

        if (!banner || !acceptEssentialBtn || !acceptAllBtn) {
            if (localStorage.getItem(ANALYTICS_KEY) === 'true') {
                loadGoogleAnalytics();
            }
            return;
        }

        const showBanner = () => {
            banner.style.display = 'block';
            banner.style.animation = 'none';
            void banner.offsetWidth;
            banner.style.animation = 'slideUp 0.5s ease-out';
        };

        const hideBanner = () => {
            banner.style.animation = 'slideDown 0.5s ease-out forwards';
            window.setTimeout(() => {
                banner.style.display = 'none';
            }, 500);
        };

        const hasChoice = localStorage.getItem(COOKIE_CHOICE_KEY);
        const analyticsAccepted = localStorage.getItem(ANALYTICS_KEY) === 'true';

        if (analyticsAccepted) {
            loadGoogleAnalytics();
        }

        if (!hasChoice) {
            window.setTimeout(showBanner, 1000);
        }

        acceptEssentialBtn.addEventListener('click', () => {
            localStorage.setItem(COOKIE_CHOICE_KEY, 'essential');
            localStorage.setItem(ANALYTICS_KEY, 'false');
            hideBanner();
        });

        acceptAllBtn.addEventListener('click', () => {
            localStorage.setItem(COOKIE_CHOICE_KEY, 'true');
            localStorage.setItem(ANALYTICS_KEY, 'true');
            loadGoogleAnalytics();
            hideBanner();
        });

        settingsTriggers.forEach(trigger => {
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                showBanner();
            });
        });
    };

    onDocumentReady(() => {
        initMobileNavigation();
        initSmoothScroll();
        initPawPrintTrail();
        initScrollSpy();
        initHeaderState();
        initScrollIndicator();
        initSectionObserver();
        initCookieBanner();
    });
})();
