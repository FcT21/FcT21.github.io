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
   2. Booking Form Validation & Submit Feedback
   -------------------------------------------------------------------------- */
function initFormHandler() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Estimating...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = 'Request Received ✓';
      submitBtn.style.backgroundColor = 'var(--color-sage)';
      submitBtn.style.borderColor = 'var(--color-sage)';
      form.reset();

      setTimeout(() => {
        submitBtn.textContent = originalText;
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

  const trackedSections = [];
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const section = document.querySelector(href);
      if (section) {
        trackedSections.push({ link, section, id: section.id });
      }
    }
  });

  if (!trackedSections.length) return;

  let isClickScrolling = false;
  let clickTimeout = null;

  function setActive(activeId) {
    trackedSections.forEach(({ link, id }) => {
      link.classList.toggle('active', id === activeId);
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

    let activeId = trackedSections[0].id;

    // If reached bottom of document, activate the last section
    if (winHeight + scrollY >= docHeight - 50) {
      activeId = trackedSections[trackedSections.length - 1].id;
    } else {
      for (let i = 0; i < trackedSections.length; i++) {
        const rect = trackedSections[i].section.getBoundingClientRect();
        if (rect.top <= probeOffset) {
          activeId = trackedSections[i].id;
        }
      }
    }

    setActive(activeId);
  }

  // Smooth scroll click handler for nav links
  trackedSections.forEach(({ link, id }) => {
    link.addEventListener('click', () => {
      isClickScrolling = true;
      clearTimeout(clickTimeout);
      setActive(id);

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
      setActive('hero');

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
