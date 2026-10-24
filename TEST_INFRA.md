# KidsFit Full-Funnel Inflow & Conversion Optimization — Test Infrastructure Specification

**Document Version**: 1.0.0  
**Target Milestone**: Full-Funnel Optimization E2E Test Suite Creation (F01–F13)  
**Author**: `test_writer_e2e`  
**Working Directory**: `d:\사업아이템`  
**Primary Test Suite**: `tests/test_full_funnel_optimization_e2e.py`  
**Execution Runtime**: Python 3.10+ `unittest`  

---

## 1. System Overview & Testing Mission

The KidsFit platform is a full-funnel parental healthcare and learning guidance system consisting of four tightly integrated operational layers:
1. **Omnichannel Inflow Layer**: Naver Blog (`expertise333`), Naver Cafe (`moneyfitlab`), Instagram/Threads Webtoons (4-cut) and Card News (6-slide), and 31 SEO Q&A Landing Pages (`qna/*.html`).
2. **On-Site Diagnosis & Onboarding Funnel Layer (`https://truthofmarket.com`)**: Primary domain defaulting to Korean (`ko`) Free Studio, unified 60-second Growth + Learning quiz, and dual telemetry (`diagnoses.growth` and `diagnoses.learning`).
3. **Product Prescription & Conversion Monetization Layer**: Post-diagnosis personalized recommendations dynamically mapped to diagnosed deficits with academic paper citations (PMID/KDCA) and affiliate tracking (Coupang Partners `AF7865143`, LinkPrice `A100708867`).
4. **Verification & Live Execution Layer**: Automated test harness, Chrome CDP (port 9222) publishing verification, and Telegram notification delivery (`755033799`).

The testing mission is to implement a rock-solid, deterministic, self-contained end-to-end verification harness across all 13 features (F01 to F13) using the **4-Tier Testing Methodology**:
- **Tier 1: Feature Coverage (F01–F13)** — Verification of individual feature contracts, schemas, files, and core logic.
- **Tier 2: Boundary & Corner Cases** — Extreme inputs, missing fields, malformed URLs, empty referrers, zero counts, and fallback paths.
- **Tier 3: Cross-Feature Interactions** — End-to-end contracts between layers (Bridge UTM -> Inflow classifier -> Unified Funnel -> Dual Telemetry -> Product Prescription -> Conversion Click Tracking).
- **Tier 4: Real-World Workload Scenarios** — Complete realistic user journeys across 5 acquisition and conversion paths.

---

## 2. Feature-to-Requirement Traceability Matrix (F01–F13)

| Feature ID | Feature Name | Target Scope | Authoritative Source | Primary Test Class |
|---|---|---|---|---|
| **F01** | Promotion & Funnel Bottleneck Diagnosis Report | Markdown & JSON diagnosis reports with quantitative baseline (UV, PV, 29 vs 0 split, 189 clicks) and root-cause matrices | ORIGINAL_REQUEST R1, PROJECT.md F01 | `TestF01PromotionDiagnosisReport` |
| **F02** | Naver Blog Contextual Diagnostic Bridge & QR Infographic | High-CTR UTM diagnostic bridge in blog columns + 135x135 QR code and callout banner in 3rd checklist infographic image | ORIGINAL_REQUEST R2, PROJECT.md F02 | `TestF02BlogDiagnosticBridge` |
| **F03** | Naver Cafe Diagnostic Bridge & Card Upgrade | Contextual diagnostic bridge text in 7 cafe boards + 120x120 QR code in cafe card image | ORIGINAL_REQUEST R2, PROJECT.md F03 | `TestF03CafeDiagnosticBridge` |
| **F04** | Webtoon Cut 4 & Card News Slide 6 QR Bridge | Visual end-card QR code and callout banner in Webtoon cut 4 and Card News slide 6 + UTM-tagged copy text | ORIGINAL_REQUEST R2, PROJECT.md F04 | `TestF04WebtoonCardNewsQRBridge` |
| **F05** | 31 SEO Q&A Landing Pages Bridge Widgets & Sitemap Unification | Top & bottom 1-click diagnostic bridge widgets in all `qna/*.html`, canonical & sitemap unification to `truthofmarket.com` | ORIGINAL_REQUEST R2, PROJECT.md F05 | `TestF05QnAPagesBridgeSitemap` |
| **F06** | QA Fact-Check Agent Rule Alignment | Stage 1 & 2 QA rules requiring `truthofmarket.com` UTM bridge links while strictly prohibiting commercial affiliate links on external channels | ORIGINAL_REQUEST R2, PROJECT.md F06 | `TestF06QAFactCheckAgentAlignment` |
| **F07** | Primary Domain Korean Default Fix | Remove forced English paywall on `truthofmarket.com`, default to `lang="ko"` free studio, allow global paid mode only via `?edition=global` | ORIGINAL_REQUEST R3, PROJECT.md F07 | `TestF07HomepageKoreanDefaultFix` |
| **F08** | 1-Stop Unified Growth + Learning Diagnosis Flow | Combine physical growth and cognitive learning survey into single <60s flow, removing CSS mutual exclusion | ORIGINAL_REQUEST R3, PROJECT.md F08 | `TestF08UnifiedDiagnosisFunnel` |
| **F09** | Dual Diagnosis Telemetry Recording | Record both `diagnoses.growth` and `diagnoses.learning` events in `visitor_analytics.json` and server upon diagnosis completion | ORIGINAL_REQUEST R3, PROJECT.md F09 | `TestF09DualDiagnosisTelemetry` |
| **F10** | Personalized Growth & Learning Prescription Engine | Render paper-backed product cards directly matched to child's diagnosed deficits with PMID citations and clean CTAs | ORIGINAL_REQUEST R4, PROJECT.md F10 | `TestF10PersonalizedProductPrescription` |
| **F11** | Category & UTM Conversion Click Tracking | Intercept product clicks, record `growth_product_click` / `learning_product_click` with `utm_source` in `visitor_analytics.json` | ORIGINAL_REQUEST R4, PROJECT.md F11 | `TestF11CategoryUtmClickTracking` |
| **F12** | Comprehensive E2E Test Suite | Automated test suite verifying R1~R5 requirements across Category-Partition, BVA, Pairwise, and Scenario tiers | ORIGINAL_REQUEST Criteria, PROJECT.md F12 | `TestF12E2ETestHarnessIntegrity` |
| **F13** | Live Omnichannel Execution & Telegram Delivery | 1 live blog post + 1 live cafe post published and verified via DOM, Telegram summary and asset pack sent to `755033799` | ORIGINAL_REQUEST R5, PROJECT.md F13 | `TestF13LiveExecutionTelegramDelivery` |

---

## 3. 4-Tier Test Architecture & Methodological Standards

### Tier 1: Feature Coverage (F01–F13)
Each of the 13 features receives dedicated unit and integration assertions ensuring:
- File existence and structural integrity.
- Schema compliance against authoritative JSON specifications.
- Exact string, regex, and pattern matching for banned/required tokens.
- Parameter validation, image resolution standards (1080x1080 / 1080x1350), and QR code decode accuracy.

### Tier 2: Boundary & Corner Cases
Targeted test cases probing boundary conditions:
- **T2-1: Empty / Malformed Referrers & Missing UTM Parameters**: Verifies server fallback to `'direct'` when referrer header is missing or empty.
- **T2-2: Extreme Age Boundaries (1 year & 20 years)**: Verifies valid KDCA percentile computation and appropriate age-band cohort classification at minimum and maximum ages.
- **T2-3: Extreme Physical Measurements**: Verifies Z-score calculations with extreme height/weight inputs (e.g. 50cm infant vs 200cm adolescent).
- **T2-4: Zero Diagnoses Baseline & Counter Stability**: Verifies arithmetic safety when increments occur from 0.
- **T2-5: Category Click Attribution with Missing Product Category**: Verifies fallback categorization to `'growth'` or rejection without corrupting data structures.
- **T2-6: Special Characters in Query Strings**: Verifies URL encoding and parsing stability (`?utm_source=naver_blog&note=%ED%95%9C%EA%B8%80`).
- **T2-7: Unknown Mode in Diagnosis Telemetry**: Verifies graceful handling when `mode` is neither `'growth'`, `'learning'`, nor `'both'`.
- **T2-8: Empty Deficit Habits Array**: Verifies safe rendering of general recommendations when no specific deficit habits are selected.

### Tier 3: Cross-Feature Interactions
Integration assertions verifying end-to-end dataflow contracts:
- **T3-1: Blog/Cafe Bridge UTM -> Server Inflow Classification**: External bridge link clicked -> `classifyReferrer` outputs matching source (`naver_blog` / `naver_cafe`).
- **T3-2: Q&A Diagnostic Bridge -> Homepage Unified Funnel Entry**: `qna_top` / `qna_bottom` deep links enter unified diagnosis mode without triggering paywall.
- **T3-3: Unified Diagnosis Submission -> Dual Telemetry Synchronization**: Submitting `preferredReportMode = 'both'` increments both `diagnoses.growth` and `diagnoses.learning` in telemetry store.
- **T3-4: Diagnosed Deficits -> Academic Prescription Mapping**: Checking `#late_sleep` maps to Tart Cherry / Magnesium with PMID citation; checking `#math_spatial` maps to Froebel Gabe.
- **T3-5: Prescription CTA Click -> Category & UTM Conversion Recording**: Clicking prescription CTA dispatches `/api/visit` with category and `utm_source`, updating `productClicks.byReferrer`.

### Tier 4: Real-World Workload Scenarios
Five comprehensive end-to-end multi-step simulations:
- **Scenario 1 (Naver Blog Parent Journey)**: Reads deep sleep column -> scans 3rd image QR / clicks UTM bridge -> lands on `truthofmarket.com` in Korean -> completes 1-stop quiz in 52s -> receives HT042 & Magnesium prescription -> clicks Coupang link -> telemetry logs `growth_product_click` with `utm_source=naver_blog`.
- **Scenario 2 (Naver Cafe Parent Journey)**: Browses Board 4 (소근육·두뇌발달) -> clicks cafe bridge link -> runs unified assessment with literacy bottleneck -> receives Froebel Gabe & YES24 workbook prescription -> clicks LinkPrice CTA -> telemetry logs `learning_product_click` with `utm_source=naver_cafe`.
- **Scenario 3 (Instagram / Threads Parent Journey)**: Reads Webtoon Cut 4 / Card News Slide 6 -> scans visual QR -> enters `truthofmarket.com` -> verifies zero English paywall -> completes unified survey -> views executive function timer & jump gear -> telemetry records dual diagnosis.
- **Scenario 4 (Organic SEO Q&A Parent Journey)**: Google search lands on `qna/topic-03.html` (성조숙증 신호) -> clicks top 1-click bridge widget -> arrives at `truthofmarket.com/?utm_source=qna_top` -> completes assessment -> logs `qna_top` referrer.
- **Scenario 5 (Live Omnichannel Execution & Telegram Delivery Cycle)**: Scheduled publisher runs -> audits zero affiliate links and verified UTM bridge -> publishes live blog and cafe posts -> dispatches diagnosis report and assets to Telegram `755033799` with HTTP 200 `ok: true`.

---

## 4. Authoritative Interface Contracts & Specifications

### 4.1 Client ↔ Server Analytics Telemetry (`/api/visit`)

#### Diagnosis Completion Event
- **Endpoint**: `POST /api/visit`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "event": "diagnosis",
    "mode": "both",
    "profile": {
      "gender": "boy",
      "ageMonths": 84,
      "currentHeight": 122.5,
      "currentWeight": 24.1,
      "habits": ["late_sleep", "sedentary"],
      "learningBottlenecks": ["math_concept"]
    }
  }
  ```
- **Server Behavior**:
  1. Increments `day.diagnoses.total` by 1.
  2. Increments `day.diagnoses.growth` by 1.
  3. Increments `day.diagnoses.learning` by 1.
  4. Saves to `logs/visitor_analytics.json` atomically.

#### Product Click Conversion Event
- **Endpoint**: `POST /api/visit`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "event": "growth_product_click",
    "category": "growth",
    "href": "https://link.coupang.com/re/AFFSRP?lptag=AF7865143&...",
    "utm_source": "naver_blog"
  }
  ```
- **Server Behavior**:
  1. Increments `day.affiliateClicks` by 1.
  2. Increments `day.productClicks.growth` by 1 (or `learning` if category is learning).
  3. Updates `day.productClicks.byReferrer[utm_source][category] += 1`.
  4. Saves to `logs/visitor_analytics.json`.

---

### 4.2 External Bridge ↔ Homepage UTM Contracts

All external promotion channels must route visitors to `https://truthofmarket.com` using strictly defined UTM parameter contracts:

| Channel | Placement | Target Bridge URL |
|---|---|---|
| **Naver Blog** | End of post text | `https://truthofmarket.com/?utm_source=naver_blog&utm_medium=organic_social&utm_campaign=kidsfit_diagnosis` |
| **Naver Blog** | 3rd Image QR code | `https://truthofmarket.com/?utm_source=naver_blog_qr&utm_medium=qr_code&utm_campaign=kidsfit_diagnosis` |
| **Naver Cafe** | Bottom of article & comment | `https://truthofmarket.com/?utm_source=naver_cafe&utm_medium=organic_social&utm_campaign=kidsfit_diagnosis` |
| **Naver Cafe** | Card Image QR code | `https://truthofmarket.com/?utm_source=naver_cafe_qr&utm_medium=qr_code&utm_campaign=kidsfit_diagnosis` |
| **Instagram** | Bio Link | `https://truthofmarket.com/?utm_source=instagram_bio&utm_medium=social_bio&utm_campaign=kidsfit_diagnosis` |
| **Instagram** | Post Captions | `https://truthofmarket.com/?utm_source=instagram&utm_medium=organic_social&utm_campaign=kidsfit_diagnosis` |
| **Threads** | Post & First Comment | `https://truthofmarket.com/?utm_source=threads&utm_medium=organic_social&utm_campaign=kidsfit_diagnosis` |
| **Webtoon** | Cut 04 QR code | `https://truthofmarket.com/?utm_source=instagram_webtoon_qr&utm_medium=qr_code&utm_campaign=kidsfit_diagnosis` |
| **Card News** | Slide 06 QR code | `https://truthofmarket.com/?utm_source=cardnews_qr&utm_medium=qr_code&utm_campaign=kidsfit_diagnosis` |
| **SEO Q&A** | Top Bridge Widget | `https://truthofmarket.com/?utm_source=qna_top&utm_medium=organic_search&utm_campaign=kidsfit_diagnosis&utm_content={slug}` |
| **SEO Q&A** | Bottom Bridge Widget | `https://truthofmarket.com/?utm_source=qna_bottom&utm_medium=organic_search&utm_campaign=kidsfit_diagnosis&utm_content={slug}` |

---

### 4.3 Deficit-to-Product Prescription Mapping Contract

| Diagnosed Deficit Habit / Bottleneck | Category | Recommended Item / Class | Academic Rationale (PMID / KDCA) | Required Affiliate Tag |
|---|---|---|---|---|
| `late_sleep` (Bedtime > 22:30) | Growth | Tart Cherry Extract + Magnesium Glycinate | SWS deep sleep increases nocturnal GH pulse by up to 52% (PMID: 24899893) | Coupang `AF7865143` |
| `picky_eater` / `small_appetite` | Growth | WPI Whey Colostrum Protein + Zinc Picolinate | Zinc activates hepatic GH -> IGF-1 conversion; chondrogenesis (PMID: 17684179) | Coupang `AF7865143` |
| `poor_posture` / `turtle_slouch` | Growth | Pediatric Dead Hang Bar + Ergo Reading Stand | Decompresses intervertebral discs (+1.5~2.2cm) (PMID: 22441957) | Coupang `AF7865143` / YES24 `A100708867` |
| `sedentary` (Lack of jump exercise) | Growth | Indoor Shock-Absorbing Trampoline / Jump Rope | Wolff's Law: intermittent axial cyclic loading stimulates chondrocyte proliferation (PMID: 19164344) | Coupang `AF7865143` |
| `reading_literacy` bottleneck | Learning | Age-Graded Literacy Workbook & Reading Sets | Structural schema transfer activates left temporal-parietal cortex (PMID: 25528634) | YES24 `A100708867` |
| `math_concept` / spatial block | Learning | Froebel Gabe / 3D Magnetic Spatial Blocks | Visual-spatial manipulatives form parietal cortical representations (PMID: 28628612) | Coupang `AF7865143` |
| `desk_endurance` / `screen_dopamine` | Learning | Visual Time Timer + Focus Stand | Visual countdown provides external prefrontal scaffold, mitigating dopamine depletion (PMID: 31562143) | Coupang `AF7865143` |
| `passive_forget` (no recall) | Learning | Metacognitive Retrieval Whiteboard Notebook | Retrieval practice (testing effect) strengthens hippocampal synaptic consolidation (PMID: 21252341) | Coupang `AF7865143` / YES24 `A100708867` |

---

### 4.4 Diagnosis Report JSON Schema (`docs/promotion_funnel_diagnosis_report.json`)

The quantitative bottleneck report must expose a structured schema containing:
```json
{
  "report_timestamp": "2026-10-24T...",
  "audit_version": "1.0.0",
  "baseline_metrics": {
    "total_uv": 11,
    "total_pv": 16,
    "diagnoses": {
      "total": 29,
      "growth": 29,
      "learning": 0
    },
    "affiliate_clicks": 189,
    "referrers": {
      "direct": 16,
      "naver_blog": 0,
      "naver_cafe": 0,
      "instagram": 0,
      "threads": 0
    }
  },
  "bottleneck_root_causes": {
    "inflow": [ ... ],
    "diagnosis_split": [ ... ],
    "conversion": [ ... ],
    "domain_canonical": [ ... ]
  },
  "implemented_solutions": { ... },
  "target_kpis": {
    "blog_inflow_uv_target": ">=50/day",
    "learning_diagnosis_ratio": "50%",
    "affiliate_cvr_target": ">=3.5%"
  }
}
```

---

## 5. Verification Commands & Baseline Tracking

### Test Execution Command
```powershell
python tests/test_full_funnel_optimization_e2e.py
```

### Verbose Execution Command
```powershell
python tests/test_full_funnel_optimization_e2e.py -v
```

### Sub-Suite Isolation Commands
```powershell
# Tier 1 Feature Coverage
python -m unittest tests.test_full_funnel_optimization_e2e.TestF01PromotionDiagnosisReport
python -m unittest tests.test_full_funnel_optimization_e2e.TestF07HomepageKoreanDefaultFix

# Tier 2 Boundary Tests
python -m unittest tests.test_full_funnel_optimization_e2e.TestTier2BoundaryCornerCases

# Tier 3 Cross-Feature Tests
python -m unittest tests.test_full_funnel_optimization_e2e.TestTier3CrossFeatureInteractions

# Tier 4 Real-World Workload Scenarios
python -m unittest tests.test_full_funnel_optimization_e2e.TestTier4RealWorldWorkloadScenarios
```

### Baseline Management
When executed prior to feature implementation (during test suite delivery), tests asserting un-implemented features (such as `docs/promotion_funnel_diagnosis_report.md` generation in M1, bridge additions in M2, Korean default fix in M3, product prescription cards in M4, and live publishing in M5) will register as failures with descriptive assertion diagnostics. These failures represent the **TDD Verification Baseline**. As implementing agents complete M1 through M5, tests flip sequentially to PASS until reaching 100% test success.
