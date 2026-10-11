/**
 * Kosmios - Main JavaScript Controller
 * Governs:
 * 1. Accessible Before / After Split Comparison Slider
 * 2. Responsive Navigation Menu
 * 3. Booking Estimate Form Handler
 * 4. Cinematic Eased Navigation Scroll & Tactile Link Feedback
 * 5. Dynamic ScrollSpy Active Link Tracking
 */

document.addEventListener('DOMContentLoaded', () => {
  initComparisonSlider();
  initMobileNavigation();
  initFormHandler();
  initSmoothNavigation();
  initScrollSpy();
});

/* --------------------------------------------------------------------------
   1. Interactive Before / After Split Comparison Slider
   -------------------------------------------------------------------------- */
function initComparisonSlider() {
  const container = document.getElementById('split-slider');
  const clip = document.getElementById('slider-clip');
  const handle = document.getElementById('slider-handle');

  if (!container || !clip || !handle) return;

  let isDragging = false;

  function updateSliderPosition(clientX) {
    const rect = container.getBoundingClientRect();
    let offsetX = clientX - rect.left;

    // Constrain within bounds (0% to 100%)
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;

    const percentage = (offsetX / rect.width) * 100;
    setSliderPercentage(percentage);
  }

  function setSliderPercentage(percentage) {
    const clamped = Math.max(0, Math.min(100, percentage));
    clip.style.width = `${clamped}%`;
    handle.style.left = `${clamped}%`;
    handle.setAttribute('aria-valuenow', Math.round(clamped).toString());
  }

  // Pointer / Mouse / Touch Events
  handle.addEventListener('pointerdown', (e) => {
    isDragging = true;
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  container.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
  });

  // Clicking anywhere on the comparison container shifts the divider
  container.addEventListener('click', (e) => {
    if (e.target.closest('.slider-handle')) return;
    updateSliderPosition(e.clientX);
  });

  // Keyboard Navigation (Left / Right Arrow Keys)
  handle.addEventListener('keydown', (e) => {
    const currentVal = parseFloat(handle.getAttribute('aria-valuenow') || '50');
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setSliderPercentage(currentVal - 2);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setSliderPercentage(currentVal + 2);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPercentage(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPercentage(100);
    }
  });
}

/* --------------------------------------------------------------------------
   2. Responsive Mobile Navigation
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
   3. Booking Form Validation & Submit Feedback
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
   4. Cinematic Eased Navigation Scroll & Tactile Link Feedback
   -------------------------------------------------------------------------- */
function initSmoothNavigation() {
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cubic easing function (easeInOutCubic) for luxurious, gentle deceleration
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  let activeAnimationId = null;

  function stopActiveScroll() {
    if (activeAnimationId !== null) {
      cancelAnimationFrame(activeAnimationId);
      activeAnimationId = null;
    }
  }

  // Allow immediate user interruption with wheel, touch, or keys
  ['wheel', 'touchstart', 'pointerdown'].forEach((evt) => {
    window.addEventListener(evt, stopActiveScroll, { passive: true });
  });

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'].includes(e.code)) {
      stopActiveScroll();
    }
  });

  function smoothScrollTo(targetY, duration, onComplete) {
    if (prefersReducedMotion()) {
      window.scrollTo(0, targetY);
      if (onComplete) onComplete();
      return;
    }

    stopActiveScroll();

    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetY - startY;

    if (Math.abs(distance) < 2) {
      window.scrollTo(0, targetY);
      if (onComplete) onComplete();
      return;
    }

    let startTime = null;

    function frame(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        activeAnimationId = requestAnimationFrame(frame);
      } else {
        activeAnimationId = null;
        if (onComplete) onComplete();
      }
    }

    activeAnimationId = requestAnimationFrame(frame);
  }

  // Intercept all anchor link clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    const targetEl = document.querySelector(hash);
    if (!targetEl) return;

    e.preventDefault();

    // Visual tactile press and pulse feedback
    link.classList.remove('nav-link--pressed', 'nav-link--pulse');
    void link.offsetWidth; // Reflow to restart animation
    link.classList.add('nav-link--pressed', 'nav-link--pulse');
    setTimeout(() => {
      link.classList.remove('nav-link--pressed', 'nav-link--pulse');
    }, 450);

    // Immediate active link indication for main navigation links
    const mainNav = document.getElementById('main-navigation');
    if (mainNav && mainNav.contains(link)) {
      mainNav.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('is-active'));
      link.classList.add('is-active');
    }

    // Dynamic header height measurement
    const header = document.getElementById('main-header');
    const headerHeight = header ? header.offsetHeight : 80;

    let targetY = 0;
    if (hash !== '#main-header') {
      const rect = targetEl.getBoundingClientRect();
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      targetY = Math.max(0, rect.top + currentScrollY - headerHeight);
    }

    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const distance = Math.abs(targetY - currentScrollY);

    // Dynamic duration (550ms to 900ms based on distance)
    const duration = Math.min(900, Math.max(550, Math.round(distance * 0.35)));

    smoothScrollTo(targetY, duration, () => {
      if (history.pushState) {
        history.pushState(null, '', hash);
      } else {
        window.location.hash = hash;
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. Dynamic ScrollSpy Active Link Tracking
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const navLinks = document.querySelectorAll('.main-nav .nav-link[href^="#"]');
  if (!navLinks.length) return;

  const sections = [];
  navLinks.forEach((link) => {
    const hash = link.getAttribute('href');
    if (hash && hash !== '#') {
      const target = document.querySelector(hash);
      if (target) {
        sections.push({ target, link });
      }
    }
  });

  if (!sections.length) return;

  const header = document.getElementById('main-header');
  const getHeaderHeight = () => (header ? header.offsetHeight : 80);

  let isTicking = false;

  function updateActive() {
    const headerHeight = getHeaderHeight();
    const probeY = headerHeight + 100;
    let currentLink = null;

    for (const item of sections) {
      const rect = item.target.getBoundingClientRect();
      if (rect.top <= probeY && rect.bottom > probeY) {
        currentLink = item.link;
        break;
      }
    }

    // Activate the last section link when scrolled to the very bottom
    const scrollBottom = window.innerHeight + (window.pageYOffset || document.documentElement.scrollTop);
    if (scrollBottom >= document.documentElement.scrollHeight - 50) {
      currentLink = sections[sections.length - 1].link;
    }

    navLinks.forEach((link) => {
      if (link === currentLink) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });

    isTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      requestAnimationFrame(updateActive);
      isTicking = true;
    }
  }, { passive: true });

  updateActive();
}
