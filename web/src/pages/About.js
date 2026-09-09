/**
 * TrafficTest — About Page
 * Mission, architecture overview, and supported jurisdictions.
 * Theme: Slate Neutral
 */

export function renderAbout() {
  const countries = [
    { flag: '🌐', name: 'Global (Vienna)' },
    { flag: '🇺🇸', name: 'United States' },
    { flag: '🇬🇧', name: 'United Kingdom' },
    { flag: '🇵🇰', name: 'Pakistan' },
    { flag: '🇸🇦', name: 'Saudi Arabia' },
    { flag: '🇦🇪', name: 'UAE' },
    { flag: '🇨🇦', name: 'Canada' },
    { flag: '🇦🇺', name: 'Australia' },
  ];

  return `
    <div class="page" id="page-about">
      <section class="about section" aria-labelledby="about-title">
        <div class="container">
          <div class="section-header reveal">
            <div class="badge section-header__badge">🏗️ About TrafficTest</div>
            <h2 class="section-header__title" id="about-title">
              Built for <span class="text-gradient-emerald">Global Road Safety</span>
            </h2>
            <p class="section-header__subtitle">
              A full-stack, offline-first platform helping drivers worldwide master road rules with verified, government-sourced content.
            </p>
          </div>

          <div class="about__grid">
            <!-- Left: Mission Content -->
            <div class="reveal--left">
              <h3 style="color: var(--text-primary); margin-bottom: var(--space-lg);">Our Mission</h3>
              <p style="margin-bottom: var(--space-lg);">
                TrafficTest was born from a simple observation: most driving test apps rely on crowdsourced, outdated, or inaccurate questions. We set out to build the world's most authoritative driving knowledge platform — one where every question traces back to an official government source.
              </p>
              <p style="margin-bottom: var(--space-lg);">
                Our platform supports multiple jurisdictions, ensuring that drivers in Pakistan, the United States, United Kingdom, Saudi Arabia, UAE, Canada, and Australia all have access to locally relevant, officially cited road rules.
              </p>
              <p>
                With 162 canonical road signs, 981 jurisdiction-specific variants, and 276+ active questions — all verified against Tier-1 and Tier-2 government transport authorities — TrafficTest is the standard in driving test preparation.
              </p>
            </div>

            <!-- Right: Architecture Cards -->
            <div class="about__visual reveal--right">
              <div class="glass-card about__arch-card">
                <div class="about__arch-card-title">
                  <span style="color: var(--emerald-400);">📱</span> Mobile Application
                </div>
                <p class="about__arch-card-text">
                  React Native / Expo app with offline-first architecture, dynamic question bank, anti-rote option shuffle, and pre-seeded vector road signs.
                </p>
              </div>

              <div class="glass-card about__arch-card">
                <div class="about__arch-card-title">
                  <span style="color: var(--amber-400);">⚙️</span> Cloud Backend
                </div>
                <p class="about__arch-card-text">
                  NestJS API with Prisma ORM, PostgreSQL, Redis caching, JWT authentication, and bandwidth-optimal delta synchronization engine.
                </p>
              </div>

              <div class="glass-card about__arch-card">
                <div class="about__arch-card-title">
                  <span style="color: var(--ocean-300);">🖥️</span> Admin Dashboard
                </div>
                <p class="about__arch-card-text">
                  React 18 + Ant Design CMS with KPI analytics, duplicate candidate reviewer, source catalog, and bulk content ingestion.
                </p>
              </div>

              <div class="glass-card about__arch-card">
                <div class="about__arch-card-title">
                  <span style="color: var(--emerald-400);">🔍</span> Deduplication Engine
                </div>
                <p class="about__arch-card-text">
                  Lexical normalization (stop-word pruning, token sorting) and semantic fingerprinting with Levenshtein scoring to eliminate redundant questions.
                </p>
              </div>
            </div>
          </div>

          <!-- Supported Countries -->
          <div class="about__countries reveal">
            <div class="section-header" style="margin-bottom: var(--space-lg);">
              <div class="badge badge--amber">🌍 Supported Jurisdictions</div>
              <h3 style="color: var(--text-primary); margin-top: var(--space-md);">Practice Road Rules Worldwide</h3>
            </div>
            <div class="about__country-grid reveal-stagger">
              ${countries
                .map(
                  (c) =>
                    `<div class="about__country-item"><span>${c.flag}</span> ${c.name}</div>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}
