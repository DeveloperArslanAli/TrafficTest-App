/**
 * TrafficTest — Footer Component
 * Site-wide footer with navigation links, legal links, and branding.
 */

export function renderFooter() {
  const year = new Date().getFullYear();

  return `
    <footer class="footer" id="footer" role="contentinfo">
      <div class="container">
        <div class="footer__grid">
          <!-- Brand Column -->
          <div>
            <a href="#home" class="navbar__logo" style="margin-bottom: 4px; display: inline-flex;">
              <div class="navbar__logo-icon">
                <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="36" rx="8" fill="url(#footLogoGrad)"/>
                  <text x="18" y="14" font-family="Inter, sans-serif" font-size="6.5" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">TRAFFIC</text>
                  <text x="18" y="24" font-family="Inter, sans-serif" font-size="8" font-weight="800" fill="#FCD34D" text-anchor="middle" dominant-baseline="middle">TEST</text>
                  <defs>
                    <linearGradient id="footLogoGrad" x1="0" y1="0" x2="36" y2="36">
                      <stop stop-color="#059669"/>
                      <stop offset="1" stop-color="#10B981"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span>Traffic<span class="navbar__logo-accent">Test</span></span>
            </a>
            <p class="footer__brand-text">
              The #1 offline-first driving knowledge platform. Master road rules for 7+ countries with government-cited questions and vector road signs.
            </p>
          </div>

          <!-- Product Links -->
          <div>
            <h4 class="footer__heading">Product</h4>
            <a href="#home" class="footer__link">Home</a>
            <a href="#services" class="footer__link">Features</a>
            <a href="#about" class="footer__link">About</a>
            <a href="#contact" class="footer__link">Contact</a>
          </div>

          <!-- Legal Links -->
          <div>
            <h4 class="footer__heading">Legal</h4>
            <a href="#privacy" class="footer__link">Privacy Policy</a>
            <a href="#terms" class="footer__link">Terms & Conditions</a>
            <a href="#data-deletion" class="footer__link">Data Deletion</a>
          </div>

          <!-- Resources -->
          <div>
            <h4 class="footer__heading">Resources</h4>
            <a href="mailto:support@traffictest.app" class="footer__link">Support</a>
            <a href="https://play.google.com/store/apps/details?id=com.traffictest" class="footer__link" target="_blank" rel="noopener noreferrer">Google Play</a>
            <a href="#contact" class="footer__link">Report an Issue</a>
          </div>
        </div>

        <div class="footer__bottom">
          <p class="footer__copyright">© ${year} TrafficTest. All rights reserved.</p>
          <div class="footer__socials">
            <a href="mailto:support@traffictest.app" class="btn btn--icon btn--secondary" aria-label="Email us" title="Email">
              ✉
            </a>
          </div>
        </div>
      </div>
    </footer>
  `;
}
