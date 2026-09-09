/**
 * TrafficTest — Services Page
 * Feature deep-dive cards with hover effects.
 * Theme: Emerald Drive gradient
 */

export function renderServices() {
  return `
    <div class="page" id="page-services">
      <section class="services section" aria-labelledby="services-title">
        <div class="bg-orb bg-orb--emerald" style="width:500px;height:500px;top:10%;left:-10%;"></div>
        <div class="bg-orb bg-orb--amber" style="width:350px;height:350px;bottom:10%;right:-5%;"></div>

        <div class="container">
          <div class="section-header reveal">
            <div class="badge section-header__badge">🚀 Our Services</div>
            <h2 class="section-header__title" id="services-title">
              A Complete <span class="text-gradient-emerald">Driving Knowledge</span> Ecosystem
            </h2>
            <p class="section-header__subtitle">
              From practice quizzes to comprehensive exam simulations, TrafficTest provides everything you need to prepare with confidence.
            </p>
          </div>

          <div class="services__grid reveal-stagger">
            <!-- Service 1: Practice Quizzes -->
            <div class="glass-card services__card">
              <div class="services__card-icon">📝</div>
              <h3 class="services__card-title">Practice Quizzes</h3>
              <p class="services__card-text">
                Category-specific practice sessions with full question pools. No artificial limits — study all 74 Regulatory Signs, 60 Warning Signs, 30 Traffic Signals, and 112 General Knowledge rules.
              </p>
              <div class="services__card-features">
                <span class="services__card-feature">Anti-rote option shuffling</span>
                <span class="services__card-feature">Instant answer feedback</span>
                <span class="services__card-feature">Progress tracking per category</span>
                <span class="services__card-feature">Bookmark difficult questions</span>
              </div>
            </div>

            <!-- Service 2: Exam Simulation -->
            <div class="glass-card services__card">
              <div class="services__card-icon">🎯</div>
              <h3 class="services__card-title">Exam Simulation</h3>
              <p class="services__card-text">
                Comprehensive practice mode covering all 276 active questions. Simulates real driving test conditions with timed sessions and score tracking.
              </p>
              <div class="services__card-features">
                <span class="services__card-feature">Full 276-question comprehensive pool</span>
                <span class="services__card-feature">Realistic test environment</span>
                <span class="services__card-feature">Detailed result analysis</span>
                <span class="services__card-feature">Performance history</span>
              </div>
            </div>

            <!-- Service 3: Road Sign Library -->
            <div class="glass-card services__card">
              <div class="services__card-icon">🛑</div>
              <h3 class="services__card-title">Road Sign Library</h3>
              <p class="services__card-text">
                Explore 162 canonical road signs with 981 jurisdiction-specific variants. All rendered as crisp vector graphics — zero pixelation on any screen size.
              </p>
              <div class="services__card-features">
                <span class="services__card-feature">162 canonical international signs</span>
                <span class="services__card-feature">981 jurisdiction variants</span>
                <span class="services__card-feature">SVG vector rendering (0ms)</span>
                <span class="services__card-feature">Search and filter by type</span>
              </div>
            </div>

            <!-- Service 4: Multi-Jurisdiction Support -->
            <div class="glass-card services__card">
              <div class="services__card-icon">🌍</div>
              <h3 class="services__card-title">Multi-Jurisdiction Support</h3>
              <p class="services__card-text">
                Switch between 7+ country-specific question banks with one tap. Each jurisdiction sources from its official transport authority.
              </p>
              <div class="services__card-features">
                <span class="services__card-feature">Global (Vienna Convention)</span>
                <span class="services__card-feature">USA (MUTCD / FHWA)</span>
                <span class="services__card-feature">UK (Highway Code / DfT)</span>
                <span class="services__card-feature">Pakistan, KSA, UAE, CA, AU</span>
              </div>
            </div>

            <!-- Service 5: Offline Learning -->
            <div class="glass-card services__card">
              <div class="services__card-icon">📡</div>
              <h3 class="services__card-title">Offline-First Learning</h3>
              <p class="services__card-text">
                Download once, study anywhere. The entire question bank, road signs, and explanations are available without internet. Background sync keeps content current.
              </p>
              <div class="services__card-features">
                <span class="services__card-feature">Pre-seeded offline database</span>
                <span class="services__card-feature">Silent delta synchronization</span>
                <span class="services__card-feature">Automatic storage migration</span>
                <span class="services__card-feature">Zero data loss upgrades</span>
              </div>
            </div>

            <!-- Service 6: Authoritative Citations -->
            <div class="glass-card services__card">
              <div class="services__card-icon">📚</div>
              <h3 class="services__card-title">Authoritative Citations</h3>
              <p class="services__card-text">
                Every question links back to its official government source. Review the exact manual, section, and publication that validates the correct answer.
              </p>
              <div class="services__card-features">
                <span class="services__card-feature">100% Tier-1/Tier-2 sources</span>
                <span class="services__card-feature">FHWA, UK DfT, NHMP citations</span>
                <span class="services__card-feature">Saudi Moroor, UAE RTA Dubai</span>
                <span class="services__card-feature">TAC Canada, Austroads</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-band" aria-labelledby="services-cta-title">
        <div class="container reveal">
          <h2 class="cta-band__title" id="services-cta-title">Start Practicing Today</h2>
          <p class="cta-band__text">Join thousands of drivers preparing with verified, official road rules.</p>
          <a href="https://play.google.com/store/apps/details?id=com.traffictest" 
             target="_blank" rel="noopener noreferrer" 
             class="btn btn--secondary btn--lg" id="services-cta">
            Download Free on Google Play
          </a>
        </div>
      </section>
    </div>
  `;
}
