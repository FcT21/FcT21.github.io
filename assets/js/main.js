/**
 * The Clean Note - Main JavaScript Controller
 * Governs:
 * 1. Accessible Before / After Split Comparison Slider
 * 2. Responsive Navigation Menu
 * 3. Booking Estimate Form Handler
 */

document.addEventListener('DOMContentLoaded', () => {
  initComparisonSlider();
  initMobileNavigation();
  initFormHandler();
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
   3. Responsive Mobile Navigation
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
   4. Booking Form Validation & Submit Feedback
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
