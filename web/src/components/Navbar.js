/**
 * TrafficTest — Sticky Navbar Component
 * Transparent on top, glassmorphism on scroll. Mobile drawer included.
 */

const NAV_LINKS = [
  { label: 'Home', hash: 'home' },
  { label: 'About', hash: 'about' },
  { label: 'Services', hash: 'services' },
  { label: 'Contact', hash: 'contact' },
];

export function renderNavbar() {
  return `
    <nav class="navbar" id="navbar" role="navigation" aria-label="Main navigation">
      <div class="navbar__inner">
        <a href="#home" class="navbar__logo" aria-label="TrafficTest Home">
          <div class="navbar__logo-icon">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="8" fill="url(#navLogoGrad)"/>
              <text x="18" y="14" font-family="Inter, sans-serif" font-size="6.5" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">TRAFFIC</text>
              <text x="18" y="24" font-family="Inter, sans-serif" font-size="8" font-weight="800" fill="#FCD34D" text-anchor="middle" dominant-baseline="middle">TEST</text>
              <defs>
                <linearGradient id="navLogoGrad" x1="0" y1="0" x2="36" y2="36">
                  <stop stop-color="#059669"/>
                  <stop offset="1" stop-color="#10B981"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span>Traffic<span class="navbar__logo-accent">Test</span></span>
        </a>

        <div class="navbar__links" id="navLinks">
          ${NAV_LINKS.map(
            (link) =>
              `<a href="#${link.hash}" class="navbar__link" data-nav="${link.hash}">${link.label}</a>`
          ).join('')}
          <a href="#privacy" class="btn btn--primary btn--sm navbar__cta">Legal</a>
        </div>

        <button class="navbar__toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- Mobile Drawer -->
      <div class="navbar__drawer" id="navDrawer" role="dialog" aria-label="Mobile menu">
        ${NAV_LINKS.map(
          (link) =>
            `<a href="#${link.hash}" class="navbar__link" data-nav="${link.hash}">${link.label}</a>`
        ).join('')}
        <div style="border-top: 1px solid rgba(255,255,255,0.08); margin: 8px 0; padding-top: 8px;">
          <a href="#privacy" class="navbar__link" data-nav="privacy">Privacy Policy</a>
          <a href="#terms" class="navbar__link" data-nav="terms">Terms</a>
          <a href="#data-deletion" class="navbar__link" data-nav="data-deletion">Data Deletion</a>
        </div>
      </div>
      <div class="navbar__overlay" id="navOverlay"></div>
    </nav>
  `;
}

export function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const drawer = document.getElementById('navDrawer');
  const overlay = document.getElementById('navOverlay');

  // Scroll effect
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  // Mobile toggle
  function toggleDrawer() {
    const isOpen = drawer.classList.contains('open');
    toggle.classList.toggle('open');
    drawer.classList.toggle('open');
    overlay.classList.toggle('visible');
    toggle.setAttribute('aria-expanded', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  function closeDrawer() {
    toggle.classList.remove('open');
    drawer.classList.remove('open');
    overlay.classList.remove('visible');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', toggleDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Close on link click (mobile)
  drawer.querySelectorAll('.navbar__link').forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  // Active link highlight
  updateActiveLink();
}

export function updateActiveLink() {
  const currentHash = window.location.hash.slice(1) || 'home';
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.classList.toggle('active', link.dataset.nav === currentHash);
  });
}
