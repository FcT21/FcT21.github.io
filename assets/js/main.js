/**
 * Kosmios - Main JavaScript Controller
 * Governs:
 * 1. Responsive Navigation Menu
 * 2. Booking Estimate Form Handler
 * 3. Navigation Scrollspy Active Indicator
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initFormHandler();
  initScrollspy();
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

  const servicesData = {
    residential: {
      buttonText: 'Reserve Your Clean',
      detailsLabel: 'Home Details (Bedrooms, Bathrooms, Approximate Sq Ft)',
      detailsPlaceholder: 'e.g. 3 bed, 2.5 bath, 2,400 sq ft in Ottawa',
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
    toggleBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.type === type);
      btn.setAttribute('aria-pressed', (btn.dataset.type === type).toString());
    });

    const config = servicesData[type] || servicesData.residential;

    if (serviceSelect) {
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

    if (detailsLabel) detailsLabel.textContent = config.detailsLabel;
    if (detailsInput) detailsInput.placeholder = config.detailsPlaceholder;
    if (submitBtn) submitBtn.textContent = config.buttonText;
  }

  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setCareType(btn.dataset.type);
    });
  });

  // Determine default care type based on pathname or URL query params
  if (window.location.pathname.includes('for-business')) {
    setCareType('commercial');
  } else if (window.location.pathname.includes('for-homes')) {
    setCareType('residential');
  }

  // Check URL params for preselection (e.g. ?type=business or ?type=commercial)
  const urlParams = new URLSearchParams(window.location.search);
  const paramType = urlParams.get('type');
  if (paramType === 'business' || paramType === 'commercial') {
    setCareType('commercial');
  } else if (paramType === 'homes' || paramType === 'residential') {
    setCareType('residential');
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
function initScrollspy() {
  const mainNav = document.getElementById('main-navigation');
  if (!mainNav) return;

  const navLinks = mainNav.querySelectorAll('.nav-link');
  if (!navLinks.length) return;

  // Check if on dedicated subpages (e.g. for-homes, for-business)
  const isDedicatedPage = window.location.pathname.includes('for-homes') || window.location.pathname.includes('for-business');

  // Back to Top footer link (mirrors Home nav-link functionality)
  const backToTopLink = document.querySelector('.footer-sub__meta a');
  if (backToTopLink) {
    backToTopLink.addEventListener('click', (e) => {
      const href = backToTopLink.getAttribute('href');
      if (href && (href.startsWith('#home') || href.startsWith('#top') || href === '#main-header')) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (!isDedicatedPage) {
          history.pushState(null, '', '#home');
          const homeLink = mainNav.querySelector('a[href="#home"]');
          if (homeLink) {
            navLinks.forEach((link) => link.classList.toggle('active', link === homeLink));
          }
        }
      }
    });
  }

  // If on dedicated subpages, let their static active state stand
  if (isDedicatedPage) return;

  // Sections on index.html in visual reading order
  // 'services' has link: null so no nav-bar underline appears in Dual Service Overview
  const sectionsConfig = [
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

  let isClickScrolling = false;
  let clickTimeout = null;

  function setActiveLink(activeLink) {
    navLinks.forEach((link) => {
      link.classList.toggle('active', Boolean(activeLink && link === activeLink));
    });
  }

  function updateActiveLink() {
    if (isClickScrolling) return;

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

    // If currentItem.link is null (e.g. #services), all nav links become inactive
    setActiveLink(currentItem ? currentItem.link : null);
  }

  // Smooth scroll click handler for nav links
  trackedSections.forEach(({ link }) => {
    if (!link) return;
    link.addEventListener('click', () => {
      isClickScrolling = true;
      clearTimeout(clickTimeout);
      setActiveLink(link);

      clickTimeout = setTimeout(() => {
        isClickScrolling = false;
        updateActiveLink();
      }, 700);
    });
  });

  // Also support clicking brand logo to activate Home
  const brandLogo = document.querySelector('.brand-logo');
  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      isClickScrolling = true;
      clearTimeout(clickTimeout);
      const homeLink = mainNav.querySelector('a[href="#home"]');
      setActiveLink(homeLink);

      clickTimeout = setTimeout(() => {
        isClickScrolling = false;
        updateActiveLink();
      }, 700);
    });
  }

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
