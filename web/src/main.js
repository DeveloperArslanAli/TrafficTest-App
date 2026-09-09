/**
 * TrafficTest — Main Application Bootstrap
 * Initializes router, renders pages, and manages scroll animations.
 */

import { Router } from './router.js';
import { initScrollReveal, animateCounters } from './components/ScrollReveal.js';
import { renderNavbar, initNavbar, updateActiveLink } from './components/Navbar.js';
import { renderFooter } from './components/Footer.js';
import { renderLanding } from './pages/Landing.js';
import { renderAbout } from './pages/About.js';
import { renderServices } from './pages/Services.js';
import { renderContact, initContactForm } from './pages/Contact.js';
import { renderPrivacy } from './pages/Privacy.js';
import { renderDataDeletion, initDeletionForm } from './pages/DataDeletion.js';
import { renderTerms } from './pages/Terms.js';

// ─── App State ───
const app = document.getElementById('app');
const router = new Router();

// ─── Page Registry ───
const pages = {
  home: { render: renderLanding, title: 'TrafficTest — Master Road Rules for Any Country' },
  about: { render: renderAbout, title: 'About — TrafficTest' },
  services: { render: renderServices, title: 'Services — TrafficTest' },
  contact: { render: renderContact, title: 'Contact — TrafficTest', init: initContactForm },
  privacy: { render: renderPrivacy, title: 'Privacy Policy — TrafficTest' },
  'data-deletion': { render: renderDataDeletion, title: 'Data Deletion Request — TrafficTest', init: initDeletionForm },
  terms: { render: renderTerms, title: 'Terms & Conditions — TrafficTest' },
};

// ─── Register Routes ───
Object.entries(pages).forEach(([path, config]) => {
  router.register(path, config.render);
});

// ─── Route Change Handler ───
router.onRouteChange = (hash, renderFn) => {
  const config = pages[hash] || pages.home;

  // Update page title
  document.title = config.title;

  // Render content
  app.innerHTML = renderNavbar() + renderFn() + renderFooter();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Initialize components
  initNavbar();
  updateActiveLink();

  // Page-specific initializers
  if (config.init) {
    config.init();
  }

  // Re-initialize scroll reveal and counters for new DOM
  requestAnimationFrame(() => {
    initScrollReveal();
    animateCounters();
  });
};

// ─── Initial Render ───
router.resolve();
