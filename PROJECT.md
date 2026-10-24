# Project: KidsFit Full-Funnel Inflow & Conversion Optimization System

## Architecture
The KidsFit platform is a full-funnel parental healthcare and learning guidance system consisting of four tightly integrated layers:
1. **Omnichannel Inflow Layer**:
   - Naver Blog (`https://blog.naver.com/expertise333`) via CDP port 9222
   - Naver Cafe (`https://cafe.naver.com/moneyfitlab`, Club ID 31805224) via CDP port 9222
   - Instagram / Threads Daily Webtoon (4-cut) & Card News (6-slide) via Telegram Bot API (`755033799`)
   - 31 SEO Q&A Landing Pages (`qna/*.html`), `sitemap.xml`, and CNAME binding to `https://truthofmarket.com`
   - Independent QA Fact-Check Agent (`scripts/qa_fact_check_agent.py`) enforcing zero external affiliate links and validating official diagnostic bridge links with UTM tracking.
2. **On-Site Diagnosis & Onboarding Funnel Layer (`https://truthofmarket.com`)**:
   - Primary domain defaulting to Korean (`ko`) Free Growth & Learning Studio (disabling forced English paywall on primary domain).
   - 1-Stop Unified 60-Second "Growth + Learning" Diagnostic Funnel executing both KDCA physical growth calculations and K-DST cognitive/learning evaluations in a single seamless flow.
   - Dual telemetry recording both `diagnoses.growth` and `diagnoses.learning` events on completion.
3. **Product Prescription & Conversion Monetization Layer**:
   - Post-diagnosis personalized product recommendation engine dynamically matching diagnosed deficits (late sleep, picky eating, poor posture, reading literacy, math spatial block, digital dopamine) to academic-paper-backed products (HT042, MCHA Calcium, pull-up bar, trampoline, Gabe, workbooks).
   - Embedded affiliate tracking codes: Coupang Partners (`AF7865143`) and LinkPrice YES24 (`A100708867`).
   - Granular click conversion telemetry capturing `growth_product_click` vs `learning_product_click` and `utm_source` in `visitor_analytics.json`.
4. **Verification & Live Execution Layer**:
   - Automated test harness (`npm test`, `npm run verify`, and E2E test suite).
   - Live cycle execution with Naver Blog/Cafe publishing and Telegram notification delivery.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Promotion & Funnel Bottleneck Diagnosis Report | Quantitative report in markdown and JSON analyzing UV/PV, referrers, diagnosis completion split (29 vs 0), affiliate clicks, and root cause matrix | M1 | ORIGINAL_REQUEST R1 |
| F02 | Naver Blog Contextual Diagnostic Bridge & QR Infographic | High-CTR UTM diagnostic bridge text in blog posts + 135x135 QR code and callout banner in 3rd checklist infographic image | M2 | ORIGINAL_REQUEST R2 |
| F03 | Naver Cafe Diagnostic Bridge & Card Upgrade | Contextual diagnostic bridge text in 7 cafe boards + 120x120 QR code and callout banner in cafe card image | M2 | ORIGINAL_REQUEST R2 |
| F04 | Webtoon Cut 4 & Card News Slide 6 QR Bridge | Visual end-card QR code and callout banner in Webtoon cut 4 and Card News slide 6 + UTM-tagged copy text | M2 | ORIGINAL_REQUEST R2 |
| F05 | 31 SEO Q&A Landing Pages Bridge Widgets & Sitemap Unification | Top & bottom 1-click diagnostic bridge widgets in all `qna/*.html`, canonical & sitemap unification to `truthofmarket.com` | M2 | ORIGINAL_REQUEST R2 |
| F06 | QA Fact-Check Agent Rule Alignment | Stage 1 & 2 QA rules requiring `truthofmarket.com` UTM bridge links while strictly prohibiting commercial affiliate links on external channels | M2 | ORIGINAL_REQUEST R2 |
| F07 | Primary Domain Korean Default Fix | Remove forced English paywall on `truthofmarket.com`, default to `lang="ko"` free studio, allow global paid mode only via `?edition=global` | M3 | ORIGINAL_REQUEST R3 |
| F08 | 1-Stop Unified Growth + Learning Diagnosis Flow | Combine physical growth and cognitive learning survey into single <60s flow, removing CSS mutual exclusion | M3 | ORIGINAL_REQUEST R3 |
| F09 | Dual Diagnosis Telemetry Recording | Record both `diagnoses.growth` and `diagnoses.learning` events in `visitor_analytics.json` and server upon diagnosis completion | M3 | ORIGINAL_REQUEST R3 |
| F10 | Personalized Growth & Learning Prescription Engine | Render paper-backed product cards directly matched to child's diagnosed deficits with PMID citations and clean CTAs | M4 | ORIGINAL_REQUEST R4 |
| F11 | Category & UTM Conversion Click Tracking | Intercept product clicks, record `growth_product_click` / `learning_product_click` with `utm_source` in `visitor_analytics.json` | M4 | ORIGINAL_REQUEST R4 |
| F12 | Comprehensive E2E Test Suite | Automated test suite verifying R1~R5 requirements across Category-Partition, BVA, Pairwise, and Scenario tiers | E2E Track | ORIGINAL_REQUEST Criteria |
| F13 | Live Omnichannel Execution & Telegram Delivery | 1 live blog post + 1 live cafe post published and verified via DOM, Telegram summary and asset pack sent to `755033799` | M5 | ORIGINAL_REQUEST R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Design and publish comprehensive E2E test harness for R1-R5, publish TEST_READY.md | none | IN_PROGRESS |
| M1 | R1 Promotion & Funnel Diagnosis Report | Generate `docs/promotion_funnel_diagnosis_report.md` and `.json` | none | READY |
| M2 | R2 Omnichannel Inflow Bridges & QA Alignment | Upgrade Blog, Cafe, Webtoon, Card News, Q&A pages, sitemap, and QA agent | M1 | PLANNED |
| M3 | R3 Homepage Korean Default & 1-Stop Dual Diagnosis | Fix `index.html`, paywall scripts, unified wizard flow, and dual telemetry | M1 | PLANNED |
| M4 | R4 Personalized Product Prescription & Conversion Tracking | Render paper-backed product cards and log category + UTM clicks | M3 | PLANNED |
| M5 | R5 Live Execution, E2E Verification & Telegram Delivery | Execute 1 live publishing cycle, run E2E verification, send Telegram delivery | M2, M3, M4, E2E | PLANNED |

## Interface Contracts
### Client ↔ Server Analytics Telemetry (`/api/visit`)
- **Diagnosis Completion**:
  - Request: `POST /api/visit`
  - Body: `{ event: 'diagnosis', mode: 'both', profile: {...} }`
  - Action: increments `day.diagnoses.total`, `day.diagnoses.growth`, and `day.diagnoses.learning` in `visitor_analytics.json`.
- **Product Click Conversion**:
  - Request: `POST /api/visit`
  - Body: `{ event: 'growth_product_click' | 'learning_product_click', category: 'growth' | 'learning', href: string, utm_source: string }`
  - Action: increments `day.affiliateClicks`, `day.productClicks.growth` or `learning`, and registers click under `day.productClicks.byReferrer[utm_source]`.

### External Bridge ↔ Homepage Diagnostic URL Contract
- **Naver Blog**: `https://truthofmarket.com/?utm_source=naver_blog&utm_medium=organic_social&utm_campaign=kidsfit_diagnosis`
- **Naver Cafe**: `https://truthofmarket.com/?utm_source=naver_cafe&utm_medium=organic_social&utm_campaign=kidsfit_diagnosis`
- **Instagram Bio**: `https://truthofmarket.com/?utm_source=instagram_bio&utm_medium=social_bio&utm_campaign=kidsfit_diagnosis`
- **Instagram / Threads Captions**: `https://truthofmarket.com/?utm_source=instagram&utm_medium=organic_social&utm_campaign=kidsfit_diagnosis` / `utm_source=threads`
- **Q&A Landing Pages**: `https://truthofmarket.com/?utm_source=qna_top` and `?utm_source=qna_bottom`

## Code Layout
- `docs/promotion_funnel_diagnosis_report.md` & `.json` : Full-funnel bottleneck diagnosis report
- `scripts/publish_enhanced_naver_blog.py` : Naver Blog publisher with UTM bridge and QR infographic
- `scripts/publish_enhanced_naver_cafe.py` : Naver Cafe publisher with UTM bridge and QR card
- `scripts/generate_webtoon_and_cardnews_packs.py` : Webtoon cut 4 and Card News slide 6 visual QR generators
- `scripts/send_branding_and_daily_assets_telegram.py` : Telegram asset dispatch with updated UTM copy
- `scripts/qa_fact_check_agent.py` : Stage 1 & Stage 2 QA agent enforcing UTM bridges and 0 external affiliate links
- `qna/*.html` & `sitemap.xml` : 31 Q&A SEO landing pages and sitemap
- `index.html` : Homepage shell, Korean default fix, 1-stop unified quiz wizard, product prescription rendering
- `src/js/global-paywall-edition.js` & `src/js/i18n.js` : Paywall gating and language switcher logic
- `src/js/onboarding-wizard.js` : 6-step unified growth + learning diagnosis flow
- `src/js/pinpoint-curator.js` : Paper-backed product card generation with category attributes
- `server.js` : Telemetry endpoints (`/api/visit`) recording dual diagnoses and categorized UTM clicks
- `visitor_analytics.json` & `logs/` : Telemetry logs
- `tests/test_full_funnel_optimization_e2e.py` : Comprehensive E2E test suite
