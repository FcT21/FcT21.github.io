/**
 * Kosmios - Main JavaScript Controller
 * Governs:
 * 1. Responsive Navigation Menu
 * 2. Booking Estimate Form Handler
 * 3. Navigation Scrollspy Active Indicator
 * 4. Organic Smooth Scroll Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initFormHandler();
  initScrollspy();
  initSmoothScroll();
});

/* --------------------------------------------------------------------------
   1. Responsive Mobile Navigation
   -------------------------------------------------------------------------- */
function initMobileNavigation() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-navigation');

  if (!menuBtn || !mainNav) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', isOpen.toString());
  });

  // Close menu when clicking outside or clicking an anchor link
  document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && !menuBtn.contains(e.target) && mainNav.classList.contains('is-open')) {
      mainNav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  const navLinks = mainNav.querySelectorAll('a');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (mainNav.classList.contains('is-open')) {
        mainNav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   2. Booking Form & Care Type Selector
   -------------------------------------------------------------------------- */
function initFormHandler() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const toggleBtns = document.querySelectorAll('.care-type-btn');
  const serviceSelect = document.getElementById('service-choice');
  const detailsLabel = document.getElementById('details-label');
  const detailsInput = document.getElementById('home-details');
  const submitBtn = form.querySelector('button[type="submit"]');

  const isHomesPage = window.location.pathname.includes('for-homes');
  const isBusinessPage = window.location.pathname.includes('for-business');

  const servicesData = {
    residential: {
      buttonText: 'Reserve Your Clean',
      detailsLabel: 'Home Details (Bedrooms, Bathrooms, Approximate Sq Ft)',
      detailsPlaceholder: 'e.g. 3 bed, 2.5 bath, 2,200 sq ft in Ottawa',
      options: [
        { value: '', text: 'Select a Residential Plan', disabled: true, selected: true },
        { value: 'recurring', text: 'Recurring Maintenance (Weekly / Bi-Weekly / Monthly)' },
        { value: 'deep', text: 'Deep Restorative Clean (First-Clean Reset)' },
        { value: 'move', text: 'Move-In / Move-Out (Realtor & Relocation)' }
      ]
    },
    commercial: {
      buttonText: 'Request a Quote',
      detailsLabel: 'Facility or Project Scope (Facility Type, Sq Ft, Cadence)',
      detailsPlaceholder: 'e.g. 2,000 sq ft design studio, 2x weekly after-hours, or 8-unit turnover schedule',
      options: [
        { value: '', text: 'Select a Commercial Service', disabled: true, selected: true },
        { value: 'office', text: 'Office & Commercial Cleaning (Recurring Small Office)' },
        { value: 'property', text: 'Property Management & Unit Turnovers' },
        { value: 'realestate', text: 'Real Estate Partner Program (Pre-Listing & Staging)' },
        { value: 'postconstruction', text: 'Post-Construction & Post-Renovation Detailing' }
      ]
    }
  };

  function setCareType(type) {
    // If on a dedicated page, strictly prevent switching to the opposing service
    if (isHomesPage && type !== 'residential') return;
    if (isBusinessPage && type !== 'commercial') return;

    toggleBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.type === type);
      btn.setAttribute('aria-pressed', (btn.dataset.type === type).toString());
    });

    const config = servicesData[type] || servicesData.residential;

    // Only rebuild select options dynamically on general pages with toggles (e.g., index.html)
    if (serviceSelect && !isHomesPage && !isBusinessPage) {
      serviceSelect.innerHTML = '';
      config.options.forEach((opt) => {
        const optionElem = document.createElement('option');
        optionElem.value = opt.value;
        optionElem.textContent = opt.text;
        if (opt.disabled) optionElem.disabled = true;
        if (opt.selected) optionElem.selected = true;
        serviceSelect.appendChild(optionElem);
      });
    }

    if (detailsLabel && !isHomesPage && !isBusinessPage) detailsLabel.textContent = config.detailsLabel;
    if (detailsInput && !isHomesPage && !isBusinessPage) detailsInput.placeholder = config.detailsPlaceholder;
    if (submitBtn && !isHomesPage && !isBusinessPage) submitBtn.textContent = config.buttonText;
  }

  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setCareType(btn.dataset.type);
    });
  });

  // Determine initial care type based on dedicated page or URL query params
  if (isBusinessPage) {
    setCareType('commercial');
  } else if (isHomesPage) {
    setCareType('residential');
  } else {
    // Check URL params for preselection on index.html
    const urlParams = new URLSearchParams(window.location.search);
    const paramType = urlParams.get('type');
    if (paramType === 'business' || paramType === 'commercial') {
      setCareType('commercial');
    } else if (paramType === 'homes' || paramType === 'residential') {
      setCareType('residential');
    }
  }

  // Support links that pre-select a specific service option (e.g., data-select-service="deep")
  const serviceTriggerLinks = document.querySelectorAll('[data-select-service]');
  serviceTriggerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const targetService = link.getAttribute('data-select-service');
      const targetType = link.getAttribute('data-select-type');
      if (targetType) {
        setCareType(targetType);
      }
      if (serviceSelect && targetService) {
        setTimeout(() => {
          serviceSelect.value = targetService;
        }, 50);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const currentText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = 'Request Received ✓';
      submitBtn.style.backgroundColor = 'var(--color-sage)';
      submitBtn.style.borderColor = 'var(--color-sage)';
      form.reset();

      setTimeout(() => {
        submitBtn.textContent = currentText;
        submitBtn.disabled = false;
        submitBtn.style.backgroundColor = '';
        submitBtn.style.borderColor = '';
      }, 4000);
    }, 800);
  });
}

/* --------------------------------------------------------------------------
   3. Navigation Scrollspy Active Indicator
   -------------------------------------------------------------------------- */
let activeNavSetter = null;
let scrollspyUpdater = null;

function initScrollspy() {
  const mainNav = document.getElementById('main-navigation');
  if (!mainNav) return;

  const navLinks = mainNav.querySelectorAll('.nav-link');
  if (!navLinks.length) return;

  const isHomesPage = window.location.pathname.includes('for-homes');
  const isBusinessPage = window.location.pathname.includes('for-business');

  function setActiveLink(activeLink) {
    navLinks.forEach((link) => {
      link.classList.toggle('active', Boolean(activeLink && link === activeLink));
    });
  }
  activeNavSetter = setActiveLink;

  // Configure tracked sections based on current page
  const sectionsConfig = isHomesPage
    ? [
        { id: 'home', fallbackId: 'main-content', link: mainNav.querySelector('a[href*="for-homes"]') },
        { id: 'booking', link: mainNav.querySelector('a[href="#booking"]') }
      ]
    : isBusinessPage
    ? [
        { id: 'home', fallbackId: 'main-content', link: mainNav.querySelector('a[href*="for-business"]') },
        { id: 'quote', link: mainNav.querySelector('a[href="#quote"]') }
      ]
    : [
        { id: 'hero', fallbackId: 'home', link: mainNav.querySelector('a[href="#home"]') },
        { id: 'about', link: mainNav.querySelector('a[href="#about"]') },
        { id: 'services', link: null },
        { id: 'faq', link: mainNav.querySelector('a[href="#faq"]') },
        { id: 'contact', link: mainNav.querySelector('a[href="#contact"]') }
      ];

  const trackedSections = [];
  sectionsConfig.forEach((cfg) => {
    let sectionElem = document.getElementById(cfg.id);
    if (!sectionElem && cfg.fallbackId) {
      sectionElem = document.getElementById(cfg.fallbackId);
    }
    if (sectionElem) {
      trackedSections.push({
        id: cfg.id,
        section: sectionElem,
        link: cfg.link
      });
    }
  });

  if (!trackedSections.length) return;

  function updateActiveLink() {
    if (isScrollAnimating) return;

    const header = document.getElementById('main-header');
    const headerHeight = header ? header.offsetHeight : 80;
    const probeOffset = headerHeight + 50;
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;

    let currentItem = trackedSections[0];

    // If reached bottom of document, activate the last section with a link
    if (winHeight + scrollY >= docHeight - 50) {
      currentItem = trackedSections[trackedSections.length - 1];
    } else {
      for (let i = 0; i < trackedSections.length; i++) {
        const rect = trackedSections[i].section.getBoundingClientRect();
        if (rect.top <= probeOffset) {
          currentItem = trackedSections[i];
        }
      }
    }

    // If currentItem.link is null (e.g. #services on index.html), all nav links become inactive
    setActiveLink(currentItem ? currentItem.link : null);
  }
  scrollspyUpdater = updateActiveLink;

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Initial calculation on page load
  updateActiveLink();
}

/* --------------------------------------------------------------------------
   4. Organic Smooth Scroll Controller
   -------------------------------------------------------------------------- */
let activeScrollAnimation = null;
let isScrollAnimating = false;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY, options = {}) {
  const {
    duration = null,
    onStart = null,
    onComplete = null,
    updateHash = null
  } = options;

  // Accessibility: instant scroll if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (onStart) onStart();
    window.scrollTo(0, targetY);
    if (updateHash && window.location.hash !== updateHash) {
      try { history.pushState(null, '', updateHash); } catch (_) {}
    }
    if (onComplete) onComplete();
    return;
  }

  if (activeScrollAnimation) {
    cancelAnimationFrame(activeScrollAnimation);
    activeScrollAnimation = null;
  }

  const startY = window.pageYOffset || document.documentElement.scrollTop;
  const distance = targetY - startY;

  if (Math.abs(distance) < 2) {
    if (updateHash && window.location.hash !== updateHash) {
      try { history.pushState(null, '', updateHash); } catch (_) {}
    }
    if (onComplete) onComplete();
    return;
  }

  // Adaptive duration: ~700ms base, up to ~900ms for longer distances
  const animDuration = duration || Math.min(900, Math.max(700, 700 + (Math.abs(distance) / 2500) * 200));
  let startTime = null;
  isScrollAnimating = true;

  if (onStart) onStart();

  function cancelOnUserInteraction() {
    if (activeScrollAnimation) {
      cancelAnimationFrame(activeScrollAnimation);
      activeScrollAnimation = null;
      isScrollAnimating = false;
      cleanupListeners();
      if (onComplete) onComplete();
    }
  }

  function cleanupListeners() {
    window.removeEventListener('wheel', cancelOnUserInteraction, { passive: true });
    window.removeEventListener('touchmove', cancelOnUserInteraction, { passive: true });
    window.removeEventListener('keydown', cancelOnUserInteraction, { passive: true });
  }

  window.addEventListener('wheel', cancelOnUserInteraction, { passive: true });
  window.addEventListener('touchmove', cancelOnUserInteraction, { passive: true });
  window.addEventListener('keydown', cancelOnUserInteraction, { passive: true });

  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / animDuration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, Math.round(startY + distance * easedProgress));

    if (progress < 1) {
      activeScrollAnimation = requestAnimationFrame(step);
    } else {
      activeScrollAnimation = null;
      isScrollAnimating = false;
      cleanupListeners();
      if (updateHash && window.location.hash !== updateHash) {
        try { history.pushState(null, '', updateHash); } catch (_) {}
      }
      if (onComplete) onComplete();
    }
  }

  activeScrollAnimation = requestAnimationFrame(step);
}

function initSmoothScroll() {
  const isHomesPage = window.location.pathname.includes('for-homes');
  const isBusinessPage = window.location.pathname.includes('for-business');
  const header = document.getElementById('main-header');
  const mainNav = document.getElementById('main-navigation');

  function getTargetY(targetElem) {
    if (!targetElem) return 0;
    if (targetElem.id === 'home' || targetElem.id === 'top' || targetElem.id === 'main-header') {
      return 0;
    }
    const headerHeight = header ? header.offsetHeight : 80;
    const rect = targetElem.getBoundingClientRect();
    const docTop = rect.top + (window.pageYOffset || document.documentElement.scrollTop);
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    return Math.max(0, Math.min(docTop - headerHeight, maxScroll));
  }

  function resolveTargetNavLink(hash) {
    if (!mainNav) return null;
    let targetLink = mainNav.querySelector(`a[href="${hash}"]`);
    if (!targetLink && (hash === '#home' || hash === '#top' || hash === '#main-header')) {
      targetLink = isHomesPage
        ? mainNav.querySelector('a[href*="for-homes"]')
        : isBusinessPage
        ? mainNav.querySelector('a[href*="for-business"]')
        : mainNav.querySelector('a[href="#home"]');
    }
    return targetLink;
  }

  // Intercept clicks on links that perform in-page smooth scrolling
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    // Check if clicking brand logo while on index page
    if (link.classList.contains('brand-logo')) {
      const isIndex = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || (!isHomesPage && !isBusinessPage);
      if (isIndex) {
        e.preventDefault();
        const homeLink = mainNav ? mainNav.querySelector('a[href="#home"]') : null;
        smoothScrollTo(0, {
          updateHash: '#home',
          onStart: () => {
            if (activeNavSetter && homeLink) activeNavSetter(homeLink);
          },
          onComplete: () => {
            if (scrollspyUpdater) scrollspyUpdater();
          }
        });
        return;
      }
    }

    const href = link.getAttribute('href');
    if (!href) return;

    // Smooth scroll to top if clicking dedicated page link while already on that page
    if (isHomesPage && (href === 'for-homes.html' || href === './for-homes.html')) {
      e.preventDefault();
      const homesLink = mainNav ? mainNav.querySelector('a[href*="for-homes"]') : null;
      smoothScrollTo(0, {
        onStart: () => {
          if (activeNavSetter && homesLink) activeNavSetter(homesLink);
        },
        onComplete: () => {
          if (scrollspyUpdater) scrollspyUpdater();
        }
      });
      return;
    }

    if (isBusinessPage && (href === 'for-business.html' || href === './for-business.html')) {
      e.preventDefault();
      const bizLink = mainNav ? mainNav.querySelector('a[href*="for-business"]') : null;
      smoothScrollTo(0, {
        onStart: () => {
          if (activeNavSetter && bizLink) activeNavSetter(bizLink);
        },
        onComplete: () => {
          if (scrollspyUpdater) scrollspyUpdater();
        }
      });
      return;
    }

    // Only process in-page anchor links
    if (!href.includes('#')) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (_) {
      return;
    }

    const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
    const targetPath = url.pathname.replace(/\/index\.html$/, '/');

    if (currentPath !== targetPath) {
      // Cross-page link with anchor; allow normal navigation (arrival animation will trigger on destination page)
      return;
    }

    const hash = url.hash;
    if (!hash || hash === '#') return;

    const targetElem = document.querySelector(hash);
    if (!targetElem) return;

    e.preventDefault();

    // Close mobile menu if open
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (mainNav && mainNav.classList.contains('is-open')) {
      mainNav.classList.remove('is-open');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }

    const targetY = getTargetY(targetElem);
    const targetNavLink = resolveTargetNavLink(hash);

    smoothScrollTo(targetY, {
      updateHash: hash,
      onStart: () => {
        if (targetNavLink && activeNavSetter) {
          activeNavSetter(targetNavLink);
        }
      },
      onComplete: () => {
        if (scrollspyUpdater) {
          scrollspyUpdater();
        }
      }
    });
  });

  // Handle smooth arrival if page is entered with an anchor in the URL (e.g. index.html#about or for-homes.html#booking)
  if (window.location.hash) {
    const rawHash = window.location.hash;
    const target = document.querySelector(rawHash);
    if (target && rawHash !== '#home' && rawHash !== '#top') {
      try {
        if ('scrollRestoration' in history) {
          history.scrollRestoration = 'manual';
        }
      } catch (_) {}

      // Reset to top immediately so user experiences the smooth arrival glide
      window.scrollTo(0, 0);

      // Glide smoothly to destination after brief layout paint
      setTimeout(() => {
        const targetY = getTargetY(target);
        const targetNavLink = resolveTargetNavLink(rawHash);

        smoothScrollTo(targetY, {
          duration: 850,
          updateHash: rawHash,
          onStart: () => {
            if (targetNavLink && activeNavSetter) {
              activeNavSetter(targetNavLink);
            }
          },
          onComplete: () => {
            if (scrollspyUpdater) {
              scrollspyUpdater();
            }
          }
        });
      }, 100);
    }
  }
}
