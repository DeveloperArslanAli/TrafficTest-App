/**
 * TrafficTest — Privacy Policy Page
 * Complete Google Play Console compliant privacy policy.
 * Theme: Slate Neutral (legal clean typography)
 */

export function renderPrivacy() {
  return `
    <div class="page" id="page-privacy">
      <section class="legal section" aria-labelledby="privacy-title">
        <div class="container">
          <div class="legal__header reveal">
            <div class="badge">🔒 Legal</div>
            <h1 id="privacy-title" style="margin-top: var(--space-md);">Privacy Policy</h1>
            <p class="legal__updated">Last Updated: September 9, 2026</p>
          </div>

          <div class="legal__content">
            <div class="legal__section reveal">
              <h3>1. Introduction</h3>
              <p>
                TrafficTest ("we," "our," or "us") operates the TrafficTest mobile application (the "App") and associated website (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
              <p>
                By using TrafficTest, you agree to the collection and use of information in accordance with this policy. If you do not agree with this policy, please do not use the Service.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>2. Information We Collect</h3>
              <p>We collect the following types of information:</p>
              
              <h4 style="color: var(--text-primary); margin: var(--space-md) 0 var(--space-sm);">2.1 Information You Provide</h4>
              <ul>
                <li><strong>Account Information:</strong> When you register, we collect your email address, display name, and password (stored securely via bcrypt hashing).</li>
                <li><strong>Contact Information:</strong> If you contact us for support, we collect the information you provide in your message.</li>
              </ul>

              <h4 style="color: var(--text-primary); margin: var(--space-md) 0 var(--space-sm);">2.2 Information Collected Automatically</h4>
              <ul>
                <li><strong>Usage Data:</strong> Quiz scores, progress metrics, bookmarked questions, and learning statistics.</li>
                <li><strong>Device Information:</strong> Device type, operating system version, and app version for compatibility and diagnostics.</li>
                <li><strong>Sync Metadata:</strong> Timestamps of content synchronization events for delta sync optimization.</li>
              </ul>

              <h4 style="color: var(--text-primary); margin: var(--space-md) 0 var(--space-sm);">2.3 Information We Do NOT Collect</h4>
              <ul>
                <li>We do <strong>not</strong> collect precise geolocation data.</li>
                <li>We do <strong>not</strong> collect financial or payment information.</li>
                <li>We do <strong>not</strong> access your contacts, camera, microphone, or files.</li>
                <li>We do <strong>not</strong> engage in behavioral advertising or sell personal data to third parties.</li>
              </ul>
            </div>

            <div class="legal__section reveal">
              <h3>3. How We Use Your Information</h3>
              <p>We use the collected information for the following purposes:</p>
              <ul>
                <li>To provide, maintain, and improve the Service.</li>
                <li>To personalize your learning experience and track progress.</li>
                <li>To synchronize your question bank and learning data across devices.</li>
                <li>To communicate with you regarding support requests.</li>
                <li>To detect, prevent, and address technical issues.</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </div>

            <div class="legal__section reveal">
              <h3>4. Data Storage & Security</h3>
              <p>
                Your data is stored on secured servers using PostgreSQL with encrypted connections. Passwords are hashed using bcrypt with salt rounds. We implement industry-standard security measures including:
              </p>
              <ul>
                <li>HTTPS/TLS encryption for all data in transit.</li>
                <li>Bcrypt password hashing (never stored in plaintext).</li>
                <li>JWT-based authentication with token expiration.</li>
                <li>Role-based access controls for administrative operations.</li>
              </ul>
              <p>
                While we strive to protect your information, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>5. Third-Party Services</h3>
              <p>
                TrafficTest integrates with the following third-party services, each governed by their own privacy policies:
              </p>
              <ul>
                <li><strong>Expo (React Native):</strong> App framework and update distribution. <a href="https://expo.dev/privacy" target="_blank" rel="noopener noreferrer">Expo Privacy Policy</a></li>
                <li><strong>Cloudinary:</strong> Media content delivery network for road sign graphics. <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer">Cloudinary Privacy Policy</a></li>
                <li><strong>Google Play Services:</strong> App distribution and crash reporting. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
              </ul>
            </div>

            <div class="legal__section reveal">
              <h3>6. Children's Privacy</h3>
              <p>
                TrafficTest is intended for users who are of driving-eligible age in their respective jurisdictions. We do not knowingly collect personal information from children under the age of 13 (or the applicable age in your jurisdiction).
              </p>
              <p>
                If we discover that we have collected personal information from a child under the applicable age, we will promptly delete that information. If you believe a child has provided us with personal information, please contact us at <a href="mailto:support@traffictest.app">support@traffictest.app</a>.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>7. Data Retention</h3>
              <p>
                We retain your personal information for as long as your account is active or as needed to provide the Service. If you request account deletion, we will delete your data within 30 days, except as required by law.
              </p>
              <p>
                Anonymized, aggregated analytics data (e.g., total quiz completions) may be retained indefinitely as it cannot be used to identify you.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>8. Your Rights</h3>
              <p>Depending on your jurisdiction, you may have the following rights:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate personal data.</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (see our <a href="#data-deletion">Data Deletion Request</a> page).</li>
                <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format.</li>
                <li><strong>Objection:</strong> Object to processing of your personal data in certain circumstances.</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at <a href="mailto:support@traffictest.app">support@traffictest.app</a>.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>9. International Data Transfers</h3>
              <p>
                Your information may be transferred to and maintained on servers located outside of your country of residence. By using the Service, you consent to such transfers. We take steps to ensure that your data is treated securely and in accordance with this Privacy Policy.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>10. Changes to This Privacy Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of the Service after any modifications constitutes acceptance of the updated policy.
              </p>
            </div>

            <div class="legal__contact-box reveal">
              <h4 style="color: var(--text-primary); margin-bottom: var(--space-sm);">Questions About This Policy?</h4>
              <p style="font-size: 0.9rem;">
                Contact us at <a href="mailto:support@traffictest.app">support@traffictest.app</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}
