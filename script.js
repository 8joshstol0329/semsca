// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// On mobile, tapping a dropdown's top-level link expands its submenu
// instead of navigating (dropdowns rely on :hover on desktop, which
// doesn't work on touch screens).
const mobileQuery = window.matchMedia('(max-width: 1024px)');

document.querySelectorAll('.dropdown > a').forEach((link) => {
  link.addEventListener('click', (e) => {
    if (mobileQuery.matches) {
      e.preventDefault();
      link.parentElement.classList.toggle('open');
    }
  });
});

// Close the mobile menu after a real (non-dropdown) link is tapped
document.querySelectorAll('.nav-links a:not(.dropdown > a)').forEach((link) => {
  link.addEventListener('click', () => {
    if (mobileQuery.matches) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// Nav search: clicking the icon focuses the always-visible input
const searchButton = document.querySelector('.nav-search');
const searchInput = document.querySelector('.nav-search-input');

if (searchButton && searchInput) {
  searchButton.addEventListener('click', () => {
    searchInput.focus();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchInput.blur();
    }
  });
}

// Sponsors carousel: prev/next arrows scroll the sponsor grid by one card
// width, and it also auto-rotates on a timer, pausing whenever someone is
// actually interacting with it.
const sponsorsGrid = document.querySelector('.sponsors-grid');
const sponsorPrevBtn = document.querySelector('.sponsor-nav-btn.prev');
const sponsorNextBtn = document.querySelector('.sponsor-nav-btn.next');

if (sponsorsGrid && sponsorPrevBtn && sponsorNextBtn) {
  const cardStep = () => {
    const card = sponsorsGrid.querySelector('.sponsor-card');
    const gap = parseFloat(getComputedStyle(sponsorsGrid).columnGap) || 0;
    return card ? card.offsetWidth + gap : sponsorsGrid.clientWidth;
  };

  const scrollSponsors = (direction) => {
    sponsorsGrid.scrollBy({ left: direction * cardStep(), behavior: 'smooth' });
  };

  // --- Auto-rotate ---
  // Advances one card every few seconds and loops back to the start at the
  // end. Respects the "reduce motion" accessibility setting, and pauses on
  // hover/touch/keyboard focus (and after a manual arrow click), resuming
  // automatically a few seconds after the last interaction.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ROTATE_INTERVAL_MS = 4000;
  const RESUME_DELAY_MS = 6000;
  let autoRotateId = null;
  let resumeTimeoutId = null;

  const stopAutoRotate = () => {
    if (autoRotateId) {
      window.clearInterval(autoRotateId);
      autoRotateId = null;
    }
  };

  const advanceSponsors = () => {
    const atEnd = sponsorsGrid.scrollLeft + sponsorsGrid.clientWidth >= sponsorsGrid.scrollWidth - 4;
    if (atEnd) {
      sponsorsGrid.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      scrollSponsors(1);
    }
  };

  const startAutoRotate = () => {
    stopAutoRotate();
    autoRotateId = window.setInterval(advanceSponsors, ROTATE_INTERVAL_MS);
  };

  const pauseThenResumeAutoRotate = () => {
    stopAutoRotate();
    if (resumeTimeoutId) window.clearTimeout(resumeTimeoutId);
    resumeTimeoutId = window.setTimeout(startAutoRotate, RESUME_DELAY_MS);
  };

  sponsorPrevBtn.addEventListener('click', () => {
    scrollSponsors(-1);
    pauseThenResumeAutoRotate();
  });

  sponsorNextBtn.addEventListener('click', () => {
    scrollSponsors(1);
    pauseThenResumeAutoRotate();
  });

  if (!prefersReducedMotion) {
    sponsorsGrid.addEventListener('mouseenter', stopAutoRotate);
    sponsorsGrid.addEventListener('mouseleave', startAutoRotate);
    sponsorsGrid.addEventListener('touchstart', pauseThenResumeAutoRotate, { passive: true });
    sponsorsGrid.addEventListener('focusin', stopAutoRotate);
    sponsorsGrid.addEventListener('focusout', startAutoRotate);
    startAutoRotate();
  }
}