/**
 * TrafficTest — Landing Page
 * Hero section with phone mockup, features grid, stats counter, and CTA band.
 * Theme: Deep Ocean (hero) → Emerald Drive (features) → Ocean (stats)
 */

export function renderLanding() {
  return `
    <div class="page" id="page-landing">
      <!-- ═══ HERO ═══ -->
      <section class="hero section--full" aria-labelledby="hero-title">
        <div class="hero__bg-pattern"></div>
        <div class="bg-orb bg-orb--emerald" style="width:600px;height:600px;top:-10%;right:-15%;"></div>
        <div class="bg-orb bg-orb--ocean" style="width:500px;height:500px;bottom:-20%;left:-10%;"></div>

        <div class="container hero__grid">
          <div class="hero__content animate-fade-in-up">
            <div class="badge hero__badge">
              <span>🚦</span> Global Driving Knowledge Platform
            </div>

            <h1 id="hero-title">
              Master Road Rules for <span class="text-gradient-emerald">Any Country</span>
            </h1>

            <p class="hero__subtitle">
              Practice 276+ government-cited questions across 7+ jurisdictions. 
              Offline-first, vector road signs, and smart quizzes — all in one app.
            </p>

            <div class="hero__actions">
              <a href="https://play.google.com/store/apps/details?id=com.traffictest" 
                 target="_blank" rel="noopener noreferrer" 
                 class="btn btn--primary btn--lg" id="hero-cta-download">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302-2.533-2.533 2.533-2.451zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                Get on Google Play
              </a>
              <a href="#services" class="btn btn--secondary btn--lg" id="hero-cta-learn">
                Learn More
              </a>
            </div>
          </div>

          <div class="hero__visual animate-fade-in-up" style="animation-delay: 200ms;">
            <!-- Phone Mockup with Live App Preview -->
            <div class="hero__phone-mockup animate-float">
              <div class="hero__phone-notch"></div>
              <div class="hero__phone-screen">
                <!-- Traffic Light SVG -->
                <svg class="traffic-light" viewBox="0 0 60 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="5" width="40" height="130" rx="12" fill="#1E293B" stroke="#334155" stroke-width="2"/>
                  <circle cx="30" cy="35" r="14" fill="#DC2626" class="traffic-light__red"/>
                  <circle cx="30" cy="70" r="14" fill="#F59E0B" class="traffic-light__amber"/>
                  <circle cx="30" cy="105" r="14" fill="#10B981" class="traffic-light__green"/>
                </svg>

                <div class="hero__phone-app-name">TrafficTest</div>
                <div class="hero__phone-categories">
                  <div class="hero__phone-cat-item">
                    <span>🔴 Regulatory Signs</span>
                    <span class="hero__phone-cat-count">74</span>
                  </div>
                  <div class="hero__phone-cat-item">
                    <span>⚠️ Warning Signs</span>
                    <span class="hero__phone-cat-count">60</span>
                  </div>
                  <div class="hero__phone-cat-item">
                    <span>🚦 Traffic Signals</span>
                    <span class="hero__phone-cat-count">30</span>
                  </div>
                  <div class="hero__phone-cat-item">
                    <span>📖 General Knowledge</span>
                    <span class="hero__phone-cat-count">112</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ FEATURES GRID ═══ -->
      <section class="features section" aria-labelledby="features-title">
        <div class="container">
          <div class="section-header reveal">
            <div class="badge section-header__badge">✨ Why TrafficTest</div>
            <h2 class="section-header__title" id="features-title">
              Everything You Need to <span class="text-gradient-emerald">Pass Your Test</span>
            </h2>
            <p class="section-header__subtitle">
              Built with real government sources, not crowdsourced guesses. Every question is verified and cited.
            </p>
          </div>

          <div class="features__grid reveal-stagger">
            <div class="glass-card">
              <div class="glass-card__icon glass-card__icon--emerald">📡</div>
              <h3 class="glass-card__title">Offline-First</h3>
              <p class="glass-card__text">Study anywhere — no internet required. All 276 questions are pre-loaded with silent background sync.</p>
            </div>

            <div class="glass-card">
              <div class="glass-card__icon glass-card__icon--amber">🌍</div>
              <h3 class="glass-card__title">7+ Countries</h3>
              <p class="glass-card__text">Global, USA (MUTCD), UK (Highway Code), Pakistan, Saudi Arabia, UAE, Canada, and Australia.</p>
            </div>

            <div class="glass-card">
              <div class="glass-card__icon glass-card__icon--ocean">📋</div>
              <h3 class="glass-card__title">276+ Questions</h3>
              <p class="glass-card__text">Regulatory Signs (74), Warning Signs (60), Traffic Signals (30), and General Knowledge (112).</p>
            </div>

            <div class="glass-card">
              <div class="glass-card__icon glass-card__icon--emerald">🛑</div>
              <h3 class="glass-card__title">Vector Road Signs</h3>
              <p class="glass-card__text">162 crisp SVG road signs across 981 jurisdiction variants. Zero pixelation, 0ms rendering.</p>
            </div>

            <div class="glass-card">
              <div class="glass-card__icon glass-card__icon--amber">📚</div>
              <h3 class="glass-card__title">Official Sources</h3>
              <p class="glass-card__text">100% Tier-1/Tier-2 government citations: FHWA, UK DfT, NHMP, Saudi Moroor, UAE RTA, TAC, Austroads.</p>
            </div>

            <div class="glass-card">
              <div class="glass-card__icon glass-card__icon--ocean">🔄</div>
              <h3 class="glass-card__title">Smart Sync</h3>
              <p class="glass-card__text">Delta synchronization updates only changed content. Your progress is always preserved.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ STATS ═══ -->
      <section class="stats section" aria-labelledby="stats-title">
        <div class="bg-orb bg-orb--amber" style="width:400px;height:400px;top:0;right:5%;"></div>
        <h2 class="sr-only" id="stats-title">Platform Statistics</h2>
        <div class="container">
          <div class="stats__grid reveal-stagger">
            <div class="stat-card stats__divider">
              <div class="stat-card__number text-gradient-emerald" data-count="276" data-suffix="+">0</div>
              <div class="stat-card__label">Active Questions</div>
            </div>
            <div class="stat-card stats__divider">
              <div class="stat-card__number text-gradient-amber" data-count="162">0</div>
              <div class="stat-card__label">Road Signs</div>
            </div>
            <div class="stat-card stats__divider">
              <div class="stat-card__number text-gradient-emerald" data-count="7" data-suffix="+">0</div>
              <div class="stat-card__label">Countries</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__number text-gradient-amber" data-count="100" data-suffix="%">0</div>
              <div class="stat-card__label">Official Sources</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ CTA BAND ═══ -->
      <section class="cta-band" aria-labelledby="cta-title">
        <div class="container reveal">
          <h2 class="cta-band__title" id="cta-title">Ready to Ace Your Driving Test?</h2>
          <p class="cta-band__text">Download TrafficTest now and start practicing with official, government-verified questions.</p>
          <div style="display:flex;gap:var(--space-md);justify-content:center;flex-wrap:wrap;">
            <a href="https://play.google.com/store/apps/details?id=com.traffictest" 
               target="_blank" rel="noopener noreferrer" 
               class="btn btn--secondary btn--lg" id="cta-download">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302-2.533-2.533 2.533-2.451zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
              Download Free
            </a>
            <a href="#contact" class="btn btn--secondary btn--lg" id="cta-contact">Contact Us</a>
          </div>
        </div>
      </section>
    </div>
  `;
}
