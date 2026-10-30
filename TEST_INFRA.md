# KidsFit Parenting Shopping Mall & Diagnostic Unlock Platform — Test Infrastructure Specification

**Document Version**: 2.0.0  
**Target Milestone**: E2E Testing Track (Requirement-Driven, Opaque-Box)  
**Author**: `worker_e2e` (teamwork_test_writer)  
**Working Directory**: `d:\사업아이템`  
**Primary Test Suite**: `tests/test_parenting_ecosystem_e2e.py`  
**Execution Runtime**: Python 3.10+ `unittest` & `pytest`  
**Authoritative Sources**: `ORIGINAL_REQUEST.md`, `PROJECT.md`, `survey_spec_miner_3/handoff.md`  

---

## 1. System Overview & Testing Mission

The KidsFit platform is being overhauled into a curated parenting shopping-mall and diagnostic unlock ecosystem (`https://kidsfit.co.kr`):
1. **Curated Parenting Shopping Mall**:
   - Structured taxonomy across **4 developmental stages**:
     - `pregnancy_newborn` (임신/신생아)
     - `infancy` (영아기)
     - `toddler` (유아기)
     - `child` (아동/학령기)
   - Categorized across **4 core product categories**:
     - `nutrition` (영양·건강식품)
     - `development` (발달교구·완구)
     - `gear` (자세·수면·성장기구)
     - `learning` (학습도서·문해력)
2. **Affiliate Monetization Integration**:
   - Strict partner ID injection:
     - **Coupang Partners**: `lptag=AF7865143`
     - **iHerb**: `rcode=IPZ1547`
     - **Parenting / Education CPA**: `A100708867`
   - External links open securely in a new tab (`target="_blank"`, `rel="noopener noreferrer sponsored"`).
3. **Click-Based Diagnostic Test Unlock System**:
   - Clicking any affiliate product card opens the external store in a new tab and immediately awards the user free access tickets to Kidsfit clinical diagnostic tests:
     1. 신체 성장 정밀 진단 (Growth LMS Percentiles & MPH)
     2. 골연령·성조숙증 위험도 판정 (Precocious Puberty Assessment)
     3. 두뇌 5대 역량 & K-DST 발달 진단 (Brain & Sensory Development)
     4. 기질 및 수면·학습 스타일 진단 (Temperament & Learning Style Analysis)
   - Unlock state persisted in browser `localStorage` and `sessionStorage`:
     - Keys: `kidsfit_diagnostic_unlocked`, `kf_report_unlocked`, `kidsfit_unlocked_tests`, `kidsfit_free_tickets`.
   - Complete unblurring and removal of paywall barriers without payment.
4. **Real-Time Telemetry & Fail-Safe Telegram Alerts**:
   - Ingestion via `POST /api/visit` and Telegram bot dispatch to **Chat ID 755033799**.
   - Asynchronous, non-blocking HTTP requests; network errors or offline states are caught quietly without freezing the UI or blocking outbound link navigation.
5. **Promotional Short-Form Video Marketing Deliverable**:
   - `promotional_video_scripts.md` delivering production-ready scripts for YouTube Shorts (60s), Instagram Reels (30s), TikTok (25s) focused on the *"5 Essential Items Before Baby is Born"* theme.
6. **Deterministic Production Build Pipeline**:
   - Compiles static assets, data bundles, cache-busting index into `./dist` with zero external dependencies.

---

## 2. Acceptance Criteria Traceability Matrix (AC1 to AC13)

| AC # | Requirement Category | Acceptance Criteria Specification | Authoritative Source | Primary Test Class / Methods |
|---|---|---|---|---|
| **AC1** | Shopping Mall UI | Responsive shopping mall curation layout categorized by developmental stage and product type across 320px~1920px | ORIGINAL_REQUEST R1, AC1 | `TestTier1_F01_StageCategorization` |
| **AC2** | Affiliate Catalog | Affiliate links for Coupang (`lptag=AF7865143`), iHerb (`rcode=IPZ1547`), CPA (`A100708867`) formatted with partner tags and `_blank` | ORIGINAL_REQUEST R1, AC2 | `TestTier1_F02_AffiliateLinkFormatting` |
| **AC3** | Product Presentation | Product cards present pricing, thumbnail, description, and visual cues connecting to diagnostic test benefits | ORIGINAL_REQUEST R1, AC3 | `TestTier1_F03_ProductCardPresentation` |
| **AC4** | Diagnostic Unlock | Clicking affiliate link immediately unlocks Kidsfit diagnostic tests in `localStorage` / `sessionStorage` | ORIGINAL_REQUEST R2, AC4 | `TestTier1_F04_DiagnosticUnlockStorageMutations` |
| **AC5** | Unrestricted Access | Users can access and complete all 4 diagnostic tests immediately without paywalls | ORIGINAL_REQUEST R2, AC5 | `TestTier1_F05_DiagnosticTestsUnrestrictedAccess` |
| **AC6** | State Persistence | Unlocked access state persists across browser page reloads during session | ORIGINAL_REQUEST R2, AC6 | `TestTier1_F06_UnlockSessionPersistence` |
| **AC7** | Telegram Event (Click) | Affiliate click triggers notification to Telegram `Chat ID 755033799` with item and partner details | ORIGINAL_REQUEST R4, AC7 | `TestTier1_F07_TelegramNotificationPayloads` |
| **AC8** | Telegram Event (Unlock) | Diagnostic test unlock triggers notification to Telegram `Chat ID 755033799` | ORIGINAL_REQUEST R4, AC8 | `TestTier1_F07_TelegramNotificationPayloads` |
| **AC9** | Telegram Error Containment | Telegram network requests handle errors gracefully without breaking or stalling UI | ORIGINAL_REQUEST R4, AC9 | `TestTier2_B01_TelegramOfflineFailureResilience` |
| **AC10** | Video Deliverable Existence | Production-ready `promotional_video_scripts.md` is delivered with Shorts, Reels, TikTok scripts | ORIGINAL_REQUEST R3, AC10 | `TestTier1_F08_PromotionalVideoScriptsDeliverable` |
| **AC11** | Video Content Fidelity | Scripts include 5 Essential Items theme with timecodes, visuals, VO scripts, and CTA hooks | ORIGINAL_REQUEST R3, AC11 | `TestTier1_F08_PromotionalVideoScriptsDeliverable` |
| **AC12** | Production Build | Production build succeeds cleanly into `./dist` without missing assets or syntax errors | ORIGINAL_REQUEST Build, AC12 | `TestTier1_F09_ProductionBuildCleanliness` |
| **AC13** | E2E Verification Harness | Automated/programmatic verification validates unlock flow & affiliate routing against codebase | ORIGINAL_REQUEST Build, AC13 | `TestTier4_S04_PersonaAutomatedAcceptancePipeline` |

---

## 3. 4-Tier Test Architecture & Methodological Standards

The test suite in `tests/test_parenting_ecosystem_e2e.py` implements a 4-Tier Opaque-Box testing methodology designed for deterministic, non-flaky execution in offline and local environments:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        4-TIER TEST ARCHITECTURE                        │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 1: FEATURE COVERAGE                                               │
│  - 4 Developmental Stage Tabs & 4 Categories Taxonomy Validation       │
│  - Partner ID Injection (AF7865143, IPZ1547, A100708867)               │
│  - Target '_blank' & Security Rel Attributes                           │
│  - Product Card Details & Benefit Cues                                 │
│  - Unlock State Mutations (localStorage, sessionStorage)               │
│  - Unrestricted Diagnostic Access (Growth, Puberty, Brain, Style)      │
│  - Telegram Payload Schemas & Chat ID 755033799                        │
│  - Video Scripts Deliverable & 5 Essential Items Markdown Spec         │
│  - Production Build Cleanliness into ./dist                            │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 2: BOUNDARY & CORNER CASES                                        │
│  - Telegram API Offline / 500 / Network Timeout Resilience             │
│  - Safari Private Browsing / SecurityError Fallback                    │
│  - Malformed & Corrupted Storage JSON Self-Healing                     │
│  - Rapid Click Debouncing & Deduplication                              │
│  - Direct Deep-Link Navigation Without Prior Unlock                    │
│  - Viewport Scaling (320px, 375px, 768px, 1920px)                     │
│  - Missing Parameter Sanitization & Fallback                           │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 3: CROSS-FEATURE COMBINATIONS                                     │
│  - Atomic Click + New Tab + Unlock Write + Non-Blocking Telegram Flow  │
│  - Multi-Tab Synchronization via StorageEvents                         │
│  - Category Filter Switching with Active Unlock Retention              │
│  - Build Artifact Integrity & Asset Packaging Verification             │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 4: REAL-WORLD PERSONA SCENARIOS                                   │
│  - Scenario 1: Pregnant Mom Newborn Shopping & K-DST Development Test  │
│  - Scenario 2: 3-Year-Old Toddler Mom Picky Eater & Growth Curve Test  │
│  - Scenario 3: Privacy/AdBlock Dad CPA Click & Brain Diagnostic Test   │
│  - Scenario 4: Automated CI/CD 100% Acceptance Verification Pass       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Authoritative Interface Contracts

### 4.1 Contract 1: Shopping Mall Item Data Schema
```json
{
  "id": "prod_newborn_swaddle",
  "name": "모로반사 숙면 스와들업 속싸개 & 비타민D3 드롭스",
  "stage": "pregnancy_newborn",
  "category": "nutrition",
  "platform": "iherb",
  "partnerTag": "IPZ1547",
  "price": "24,800원",
  "rating": 4.9,
  "description": "모로반사 꿀잠 유도 및 소아과 권장 영유아 필수 액상 비타민D",
  "benefitCue": "확인 시 4대 발달 정밀 진단 티켓 100% 무료 지급!",
  "url": "https://kr.iherb.com/pr/childlife-essentials-liquid-vitamin-d3-natural-berry-flavor-1-fl-oz-29-6-ml/24742?rcode=IPZ1547"
}
```

### 4.2 Contract 2: Diagnostic Unlock Storage Schema
```json
// localStorage key: "kidsfit_diagnostic_unlocked" -> "true"
// localStorage key: "kf_report_unlocked" -> "1"
// sessionStorage key: "kf_report_unlocked" -> "1"
// localStorage key: "kidsfit_unlocked_tests" or "kidsfit_free_tickets":
{
  "unlocked": true,
  "unlockedAt": "2026-10-30T12:00:00.000Z",
  "triggerItem": "스마트 온습도계 & 수유등",
  "triggerNetwork": "Coupang Partners",
  "tickets": {
    "growth": { "name": "신체 성장 정밀 진단", "unlocked": true },
    "precocious_puberty": { "name": "골연령·성조숙증 판정", "unlocked": true },
    "brain_development": { "name": "두뇌 5대 역량 진단", "unlocked": true },
    "temperament_learning": { "name": "기질·학습 스타일 진단", "unlocked": true }
  }
}
```

### 4.3 Contract 3: Telemetry Ingestion (`POST /api/visit`)
```json
// Affiliate Link Click
{
  "event": "affiliate_click",
  "product_name": "스마트 온습도계 & 수유 무드등",
  "platform": "Coupang Partners (AF7865143)",
  "stage": "pregnancy_newborn",
  "href": "https://www.coupang.com/...",
  "domain": "kidsfit.co.kr",
  "status": "SUCCESS"
}

// Diagnostic Test Unlock
{
  "event": "diagnostic_test_unlock",
  "trigger_item": "스마트 온습도계 & 수유 무드등",
  "affiliate_network": "Coupang Partners (AF7865143)",
  "unlocked_tests": ["growth", "precocious_puberty", "brain_development", "temperament_learning"],
  "domain": "kidsfit.co.kr",
  "status": "SUCCESS"
}
```

### 4.4 Contract 4: Telegram Alert Dispatch (`server.js` -> Chat ID `755033799`)
- Endpoint: `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
- Target Chat ID: `755033799`
- Format: HTML with timestamp, item name, affiliate network, event status
- Error handling: Asynchronous non-blocking dispatch; catch blocks ensure zero UI stall or promise rejection crash.

---

## 5. Coverage Thresholds & Quality Gates

1. **Zero External Daemon Dependency**:
   - Tests execute deterministically without requiring an active browser CDP daemon (port 9222) or live internet connection to Telegram.
   - HTTP requests to external APIs are mocked/simulated with realistic status codes (200, 500, network error) to verify client error containment.
2. **100% Traceability**:
   - Every single AC (AC1 through AC13) must be explicitly asserted by at least 2 distinct test methods.
3. **Deterministic Exit Codes**:
   - Test suite returns exit code `0` on success and `1` on assertion failure.
4. **Anti-Facade Guarantee**:
   - Zero trivial `self.assertTrue(True)` or dummy passing facade assertions. All test cases parse real files (`index.html`, `promotional_video_scripts.md`, `scripts/build.js`, `server.js`, `curation-catalog.json`), execute genuine data transformations, and validate actual contract specifications.

---

## 6. Verification Commands

### Standard Python Unittest Runner
```powershell
python tests/test_parenting_ecosystem_e2e.py
```

### Verbose Runner with Summary Matrix
```powershell
python tests/test_parenting_ecosystem_e2e.py -v
```

### Pytest Runner
```powershell
pytest tests/test_parenting_ecosystem_e2e.py -v
```

### Tier-Specific Execution Commands
```powershell
# Tier 1: Feature Coverage
python -m unittest tests.test_parenting_ecosystem_e2e.TestTier1_F01_StageCategorization
python -m unittest tests.test_parenting_ecosystem_e2e.TestTier1_F02_AffiliateLinkFormatting
python -m unittest tests.test_parenting_ecosystem_e2e.TestTier1_F04_DiagnosticUnlockStorageMutations
python -m unittest tests.test_parenting_ecosystem_e2e.TestTier1_F08_PromotionalVideoScriptsDeliverable

# Tier 2: Boundary & Corner Cases
python -m unittest tests.test_parenting_ecosystem_e2e.TestTier2_BoundaryAndCornerCases

# Tier 3: Cross-Feature Combinations
python -m unittest tests.test_parenting_ecosystem_e2e.TestTier3_CrossFeatureInteractions

# Tier 4: Real-World Scenarios
python -m unittest tests.test_parenting_ecosystem_e2e.TestTier4_RealWorldScenarios
```
