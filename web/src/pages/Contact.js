/**
 * TrafficTest — Contact Page
 * Contact form with validation and mailto fallback.
 * Theme: Amber Signal accents on Slate background
 */

export function renderContact() {
  return `
    <div class="page" id="page-contact">
      <section class="contact section" aria-labelledby="contact-title">
        <div class="container">
          <div class="section-header reveal">
            <div class="badge badge--amber section-header__badge">📬 Get in Touch</div>
            <h2 class="section-header__title" id="contact-title">
              We'd Love to <span class="text-gradient-amber">Hear From You</span>
            </h2>
            <p class="section-header__subtitle">
              Have questions, feedback, or need support? Reach out and we'll respond as soon as possible.
            </p>
          </div>

          <div class="contact__grid">
            <!-- Left: Info Cards -->
            <div class="contact__info-cards reveal--left">
              <div class="glass-card contact__info-card">
                <div class="contact__info-icon">✉️</div>
                <div>
                  <h4 class="contact__info-title">Email Support</h4>
                  <p class="contact__info-text">
                    <a href="mailto:support@traffictest.app">support@traffictest.app</a><br/>
                    We typically respond within 24 hours.
                  </p>
                </div>
              </div>

              <div class="glass-card contact__info-card">
                <div class="contact__info-icon">🛡️</div>
                <div>
                  <h4 class="contact__info-title">Privacy & Data</h4>
                  <p class="contact__info-text">
                    For privacy inquiries or data deletion requests, visit our 
                    <a href="#privacy">Privacy Policy</a> or 
                    <a href="#data-deletion">Data Deletion</a> page.
                  </p>
                </div>
              </div>

              <div class="glass-card contact__info-card">
                <div class="contact__info-icon">📱</div>
                <div>
                  <h4 class="contact__info-title">App Support</h4>
                  <p class="contact__info-text">
                    Found a bug or have feature suggestions? Use the form or email us directly with your device details.
                  </p>
                </div>
              </div>

              <div class="glass-card contact__info-card">
                <div class="contact__info-icon">🏢</div>
                <div>
                  <h4 class="contact__info-title">Business Inquiries</h4>
                  <p class="contact__info-text">
                    For partnerships, licensing, or bulk enterprise inquiries, contact us at 
                    <a href="mailto:support@traffictest.app">support@traffictest.app</a>.
                  </p>
                </div>
              </div>
            </div>

            <!-- Right: Contact Form -->
            <div class="reveal--right">
              <div class="glass-card contact__form-wrapper">
                <h3 class="contact__form-title">Send us a Message</h3>

                <form id="contactForm" aria-label="Contact form">
                  <div class="contact__form-row">
                    <div class="form-group">
                      <label for="contact-name" class="form-label">Full Name</label>
                      <input type="text" id="contact-name" class="form-input" placeholder="John Doe" required />
                    </div>
                    <div class="form-group">
                      <label for="contact-email" class="form-label">Email Address</label>
                      <input type="email" id="contact-email" class="form-input" placeholder="john@example.com" required />
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="contact-subject" class="form-label">Subject</label>
                    <input type="text" id="contact-subject" class="form-input" placeholder="How can we help?" required />
                  </div>

                  <div class="form-group">
                    <label for="contact-message" class="form-label">Message</label>
                    <textarea id="contact-message" class="form-textarea" placeholder="Tell us more about your inquiry..." required></textarea>
                  </div>

                  <button type="submit" class="btn btn--amber btn--lg" id="contact-submit" style="width: 100%;">
                    Send Message
                  </button>
                </form>

                <div class="contact__form-success" id="contactSuccess">
                  <div class="contact__form-success-icon">✅</div>
                  <h3 style="color: var(--text-primary); margin-bottom: var(--space-sm);">Message Sent!</h3>
                  <p style="font-size: 0.9rem;">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

/**
 * Initialize contact form with mailto fallback.
 */
export function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !subject || !message) return;

    // mailto fallback
    const mailtoBody = `Name: ${name}%0AEmail: ${email}%0A%0A${encodeURIComponent(message)}`;
    const mailtoLink = `mailto:support@traffictest.app?subject=${encodeURIComponent(subject)}&body=${mailtoBody}`;
    window.open(mailtoLink, '_blank');

    // Show success
    form.style.display = 'none';
    document.getElementById('contactSuccess').classList.add('visible');
  });
}
