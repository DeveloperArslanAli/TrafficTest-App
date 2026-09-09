/**
 * TrafficTest — Terms and Conditions Page
 * Complete Terms of Service for Google Play Console compliance.
 * Theme: Slate Neutral (legal clean typography)
 */

export function renderTerms() {
  return `
    <div class="page" id="page-terms">
      <section class="legal section" aria-labelledby="terms-title">
        <div class="container">
          <div class="legal__header reveal">
            <div class="badge">📜 Legal</div>
            <h1 id="terms-title" style="margin-top: var(--space-md);">Terms & Conditions</h1>
            <p class="legal__updated">Last Updated: September 9, 2026</p>
          </div>

          <div class="legal__content">
            <div class="legal__section reveal">
              <h3>1. Agreement to Terms</h3>
              <p>
                By downloading, installing, or using the TrafficTest mobile application ("App") or accessing our website ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, do not use the Service.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you ("User," "you," or "your") and TrafficTest ("we," "our," or "us").
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>2. Description of Service</h3>
              <p>
                TrafficTest is a driving knowledge preparation platform that provides:
              </p>
              <ul>
                <li>Practice quizzes based on official government road rules and traffic regulations.</li>
                <li>A library of canonical road signs and jurisdiction-specific variants.</li>
                <li>Multi-jurisdiction support covering 7+ countries.</li>
                <li>Offline-first learning with background content synchronization.</li>
                <li>Progress tracking, bookmarking, and exam simulation features.</li>
              </ul>
            </div>

            <div class="legal__section reveal">
              <h3>3. User Accounts</h3>
              <p>
                To access certain features of the Service, you may need to create an account. When creating an account, you agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information.</li>
                <li>Maintain the security of your password and account credentials.</li>
                <li>Promptly update your information if it changes.</li>
                <li>Accept responsibility for all activities under your account.</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms or are inactive for an extended period.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>4. Acceptable Use</h3>
              <p>You agree NOT to use the Service to:</p>
              <ul>
                <li>Violate any applicable local, state, national, or international law or regulation.</li>
                <li>Attempt to reverse-engineer, decompile, or disassemble the App.</li>
                <li>Distribute, reproduce, or create derivative works of our content without authorization.</li>
                <li>Use automated scripts, bots, or scrapers to access the Service.</li>
                <li>Interfere with or disrupt the Service's infrastructure or security features.</li>
                <li>Impersonate any person or entity, or misrepresent your affiliation.</li>
                <li>Share your account credentials with unauthorized third parties.</li>
              </ul>
            </div>

            <div class="legal__section reveal">
              <h3>5. Intellectual Property</h3>
              <p>
                All content, features, and functionality of the Service — including but not limited to text, graphics, logos, road sign illustrations, question databases, software code, and design — are the exclusive property of TrafficTest and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                Road sign designs referenced in the App are based on publicly available international and national standards (Vienna Convention, MUTCD, Highway Code, etc.) and are used for educational purposes.
              </p>
              <p>
                You are granted a limited, non-exclusive, non-transferable license to use the Service for personal, non-commercial educational purposes only.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>6. Educational Disclaimer</h3>
              <div class="legal__callout">
                <p>
                  ⚠️ <strong>Important:</strong> TrafficTest is an educational study tool and is NOT a substitute for official driving instruction, driver education courses, or professional driving school training. Passing practice quizzes in our app does not guarantee success on your official driving test.
                </p>
              </div>
              <p>
                While we strive to provide accurate, up-to-date content sourced from official government publications, traffic laws and regulations may change. Always refer to your local transport authority for the most current rules and regulations.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>7. Content Accuracy</h3>
              <p>
                TrafficTest sources all questions from Tier-1 and Tier-2 official government transport authorities. However:
              </p>
              <ul>
                <li>We do not guarantee that all content is error-free or complete at all times.</li>
                <li>Traffic regulations vary by jurisdiction and may change without notice.</li>
                <li>Users should verify critical information with their local transport authority.</li>
                <li>We make reasonable efforts to update content regularly through our delta synchronization system.</li>
              </ul>
            </div>

            <div class="legal__section reveal">
              <h3>8. Limitation of Liability</h3>
              <p>
                TO THE FULLEST EXTENT PERMITTED BY LAW, TRAFFICTEST SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul>
                <li>Loss of data or quiz progress.</li>
                <li>Failure to pass an official driving examination.</li>
                <li>Any damages arising from your use of or inability to use the Service.</li>
                <li>Reliance on any content provided through the Service.</li>
              </ul>
              <p>
                Our total liability to you for all claims arising from or related to the Service shall not exceed the amount you have paid us in the twelve (12) months preceding the claim.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>9. Indemnification</h3>
              <p>
                You agree to indemnify, defend, and hold harmless TrafficTest, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including reasonable attorney's fees) arising from your use of the Service or violation of these Terms.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>10. Modifications to Service</h3>
              <p>
                We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>11. Changes to Terms</h3>
              <p>
                We may revise these Terms at any time by updating this page. The "Last Updated" date at the top indicates the most recent revision. Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.
              </p>
              <p>
                We encourage you to review these Terms periodically. Material changes will be communicated through in-app notifications or email where possible.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>12. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which TrafficTest operates, without regard to conflict of law principles. Any disputes arising from these Terms shall be resolved through binding arbitration or in the courts of competent jurisdiction.
              </p>
            </div>

            <div class="legal__section reveal">
              <h3>13. Severability</h3>
              <p>
                If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
              </p>
            </div>

            <div class="legal__contact-box reveal">
              <h4 style="color: var(--text-primary); margin-bottom: var(--space-sm);">Questions About These Terms?</h4>
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
