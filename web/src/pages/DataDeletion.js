/**
 * TrafficTest — Data Deletion Request Page
 * Google Play Console compliant data deletion request workflow.
 * Theme: Slate Neutral with Amber warning callouts
 */

export function renderDataDeletion() {
  return `
    <div class="page" id="page-data-deletion">
      <section class="legal section" aria-labelledby="deletion-title">
        <div class="container">
          <div class="legal__header reveal">
            <div class="badge badge--amber">🗑️ Data Management</div>
            <h1 id="deletion-title" style="margin-top: var(--space-md);">Data Deletion Request</h1>
            <p class="legal__updated">Last Updated: September 9, 2026</p>
          </div>

          <div class="legal__content">
            <div class="legal__section reveal">
              <h3>What Data We Store</h3>
              <p>
                When you use TrafficTest, we store the following data associated with your account:
              </p>
              <ul>
                <li><strong>Account Profile:</strong> Email address, display name, and hashed password.</li>
                <li><strong>Quiz Progress:</strong> Quiz scores, completion rates, and learning statistics per category.</li>
                <li><strong>Bookmarks:</strong> Questions you have bookmarked for later review.</li>
                <li><strong>Sync Metadata:</strong> Timestamps of your last content synchronization.</li>
                <li><strong>Preferences:</strong> Selected country/jurisdiction and app settings.</li>
              </ul>
            </div>

            <div class="legal__section reveal">
              <h3>How to Request Data Deletion</h3>
              <p>
                You have the right to request complete deletion of all personal data associated with your TrafficTest account. Follow the steps below:
              </p>

              <div class="deletion__steps">
                <div class="deletion__step">
                  <h4>Submit a Deletion Request</h4>
                  <p>Use the form below or send an email to <a href="mailto:support@traffictest.app">support@traffictest.app</a> with the subject line "Data Deletion Request".</p>
                </div>
                <div class="deletion__step">
                  <h4>Identity Verification</h4>
                  <p>We will verify your identity by sending a confirmation email to the address associated with your account.</p>
                </div>
                <div class="deletion__step">
                  <h4>Data Deletion Processing</h4>
                  <p>Once verified, all personal data will be permanently deleted from our servers within 30 calendar days.</p>
                </div>
                <div class="deletion__step">
                  <h4>Confirmation</h4>
                  <p>You will receive a confirmation email once your data has been completely removed from our systems.</p>
                </div>
              </div>
            </div>

            <div class="legal__callout reveal">
              <p>
                ⚠️ <strong>Important:</strong> Data deletion is permanent and irreversible. Once your data is deleted, your quiz progress, bookmarks, and account settings cannot be recovered. You will need to create a new account if you wish to use TrafficTest again.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>What Gets Deleted</h3>
              <p>Upon processing your deletion request, the following data will be permanently removed:</p>
              <ul>
                <li>Your account profile (email, display name, password hash).</li>
                <li>All quiz progress, scores, and learning statistics.</li>
                <li>All bookmarked questions.</li>
                <li>Synchronization metadata and timestamps.</li>
                <li>App preferences and settings.</li>
                <li>Any support correspondence linked to your account.</li>
              </ul>
            </div>

            <div class="legal__section reveal">
              <h3>What May Be Retained</h3>
              <p>The following data may be retained even after account deletion:</p>
              <ul>
                <li><strong>Anonymized analytics:</strong> Aggregated, non-identifiable usage statistics (e.g., total quiz completions across all users) that cannot be traced back to you.</li>
                <li><strong>Legal obligations:</strong> Data required to be retained by law, regulation, or legal proceedings.</li>
              </ul>
            </div>

            <!-- Deletion Request Form -->
            <div class="deletion__form reveal">
              <div class="glass-card deletion__form-wrapper">
                <h3 style="color: var(--text-primary); margin-bottom: var(--space-xl);">
                  Submit Deletion Request
                </h3>

                <form id="deletionForm" aria-label="Data deletion request form">
                  <div class="form-group">
                    <label for="deletion-email" class="form-label">Account Email Address</label>
                    <input type="email" id="deletion-email" class="form-input" placeholder="Enter the email used for your TrafficTest account" required />
                  </div>

                  <div class="form-group">
                    <label for="deletion-reason" class="form-label">Reason for Deletion (Optional)</label>
                    <textarea id="deletion-reason" class="form-textarea" placeholder="Help us improve — let us know why you'd like your data deleted." style="min-height: 100px;"></textarea>
                  </div>

                  <div style="display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-lg);">
                    <input type="checkbox" id="deletion-confirm" required style="margin-top: 4px; accent-color: var(--amber-500);" />
                    <label for="deletion-confirm" style="font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;">
                      I understand that data deletion is <strong>permanent and irreversible</strong>. All my quiz progress, bookmarks, and account data will be permanently removed.
                    </label>
                  </div>

                  <button type="submit" class="btn btn--amber btn--lg" id="deletion-submit" style="width: 100%;">
                    🗑️ Submit Deletion Request
                  </button>
                </form>

                <div class="contact__form-success" id="deletionSuccess">
                  <div class="contact__form-success-icon">📧</div>
                  <h3 style="color: var(--text-primary); margin-bottom: var(--space-sm);">Request Submitted</h3>
                  <p style="font-size: 0.9rem;">
                    A verification email has been sent to your address. Your data will be deleted within 30 days after confirmation.
                  </p>
                </div>
              </div>
            </div>

            <div class="legal__contact-box reveal">
              <h4 style="color: var(--text-primary); margin-bottom: var(--space-sm);">Need Help?</h4>
              <p style="font-size: 0.9rem;">
                For questions about data deletion, contact us at <a href="mailto:support@traffictest.app">support@traffictest.app</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

/**
 * Initialize data deletion form with mailto fallback.
 */
export function initDeletionForm() {
  const form = document.getElementById('deletionForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('deletion-email').value.trim();
    const reason = document.getElementById('deletion-reason').value.trim();
    const confirmed = document.getElementById('deletion-confirm').checked;

    if (!email || !confirmed) return;

    const body = `Data Deletion Request%0A%0AAccount Email: ${encodeURIComponent(email)}%0AReason: ${encodeURIComponent(reason || 'Not specified')}%0A%0AI confirm that I understand data deletion is permanent and irreversible.`;
    const mailtoLink = `mailto:support@traffictest.app?subject=${encodeURIComponent('Data Deletion Request — ' + email)}&body=${body}`;
    window.open(mailtoLink, '_blank');

    form.style.display = 'none';
    document.getElementById('deletionSuccess').classList.add('visible');
  });
}
