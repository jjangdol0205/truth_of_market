# KidsFit Premium Curated Parenting Mall Overhaul — E2E Test Suite Readiness & Baseline Report

**Document Version**: 3.0.0  
**Document Date**: 2026-10-31  
**Author**: `worker_e2e_overhaul` (specialist, qa)  
**Test Suite Path**: `tests/test_curated_mall_overhaul_e2e.js`  
**Execution Command**: `node tests/test_curated_mall_overhaul_e2e.js` (or `node tests/test_curated_mall_overhaul_e2e.js --baseline`)  
**Status**: **TEST SUITE READY — BASELINE BENCHMARKED (7 PASSED / 9 PENDING M1 & M2 IMPLEMENTATION)**

---

## 1. Executive Summary

In accordance with the requirements set forth in `ORIGINAL_REQUEST.md`, `PROJECT.md`, and the overhaul specification, an authoritative, opaque-box End-to-End (E2E) test suite has been authored in `tests/test_curated_mall_overhaul_e2e.js`.

The test suite provides comprehensive coverage across all 4 tiers of the overhauled parenting platform:
1. **Tier 1 (Feature Coverage)**: Above-the-fold layout placement, 20 real product images, zero banned promotional terms, zero referral jargon in public shopping mall, refined curation terminology.
2. **Tier 2 (Boundary & Modal Sub-components)**: In-page `#kf-product-detail-modal` with all 5 required sub-components and complete 20-item catalog schema completeness.
3. **Tier 3 (Cross-Feature & State Transitions)**: Modal CTA affiliate parameter binding, Contract 2 diagnostic unlock storage mutations, pre-unlock mandatory membership notice & blur, post-unlock unblur and 1-click test launches, session persistence, multi-tab synchronization.
4. **Tier 4 (Real-World Journey Simulation)**: Complete user lifecycle from homepage arrival through browsing, card modal trigger, CTA affiliate tab dispatch, diagnostic test unlocking, Telegram event beacon dispatch, plus adversarial network failure, Safari private browsing, and rapid click debouncing.

---

## 2. Test Architecture & Tier Coverage Matrix

| Tier | Category / Scope | Test Case ID | Test Case Description | Target Milestone | Baseline Status |
|:---:|---|---|---|:---:|:---:|
| **Tier 1** | Layout Placement | `T1_F01_AboveFoldLayout` | `#kidsfit-parenting-select-shop` must strictly precede `#dual-pillar-intro-showcase` in `index.html` | M2 | **FAIL (Baseline)** |
| **Tier 1** | Visual Assets | `T1_F02_RealProductImages` | All 20 items in `parentingProducts` must specify realistic image assets without raw emojis | M1 | **FAIL (Baseline)** |
| **Tier 1** | Terminology Purity | `T1_F03_BannedPromoTerms` | 0 occurrences of `특가`, `타임세일`, `폭탄세일`, `할인율`, `최저가` in `index.html` & catalog | M2 | **PASS (Preserved)** |
| **Tier 1** | Terminology Purity | `T1_F04_ReferralJargonElimination` | 0 occurrences of `CPA`, `제휴 채널`, `쿠팡 로켓와우`, `아이허브 직구`, `구경하고 티켓 받기` in public mall; purge platform tabs | M2 | **FAIL (Baseline)** |
| **Tier 1** | Curation Copy | `T1_F05_RefinedCurationTerminology` | Verified presence of `공식 판매처 확인`, `혜택가 확인`, and `스토어 이동` | M2 | **FAIL (Baseline)** |
| **Tier 2** | In-Page Modal | `T2_F01_ModalMarkup5Components` | `#kf-product-detail-modal` exists with image/specs, 3 why-we-picked, buying guide, reviews, and sticky CTA button | M2 | **FAIL (Baseline)** |
| **Tier 2** | Catalog Schema | `T2_F02_CatalogDataCompleteness` | All 20 items in `curation-catalog.json` satisfy Contract 1 (specs, whyWePicked, buyingGuide, reviews) | M1 | **FAIL (Baseline)** |
| **Tier 3** | Link Formatting | `T3_F01_AffiliateLinkParameters` | Modal CTA link dynamically formats with `lptag=AF7865143`, `rcode=IPZ1547`, `A100708867` and `target="_blank"` | M2 | **FAIL (Baseline)** |
| **Tier 3** | Storage Contract | `T3_F02_DiagnosticUnlockStorageContract` | `kidsfit_diagnostic_unlocked='true'`, `kf_report_unlocked='1'`, and `kidsfit_free_tickets` Contract 2 schema | M2 | **PASS (Preserved)** |
| **Tier 3** | Lock Notice & Gate | `T3_F03_PreUnlockMembershipNoticeAndLockState` | Mandatory membership notice present; locked view visible and master briefing card blurred | M2 | **FAIL (Baseline)** |
| **Tier 3** | Unblur & Launches | `T3_F04_PostUnlockUnblurAndLaunch` | Post-unlock removes blur, shows unlocked gate, and enables 1-click launch of all 4 diagnostic tests | M2 | **PASS (Preserved)** |
| **Tier 3** | State Persistence | `T3_F05_PersistenceAndMultiTabSync` | Session persistence across reload and dynamic sibling tab unlock via `StorageEvent` | M2 | **PASS (Preserved)** |
| **Tier 4** | User Lifecycle | `T4_F01_FullUserLifecycleJourney` | Simulate journey: arrival -> browsing -> modal open -> CTA click -> storage unlock -> Telegram alert -> test launch | M2 | **FAIL (Baseline)** |
| **Tier 4** | Adversarial Defense | `T4_F02_NetworkOutageResilience` | Telegram network outage / 500 error does NOT block link opening or UI unlock (<30ms) | M2 | **PASS (Preserved)** |
| **Tier 4** | Adversarial Defense | `T4_F03_SafariPrivateBrowsingFallback` | Safari Private Mode `SecurityError`/`QuotaExceededError` safely falls back to in-memory store | M2 | **PASS (Preserved)** |
| **Tier 4** | Adversarial Defense | `T4_F04_RapidClickDebouncing` | Rapid click bursts within 150ms window are debounced to prevent duplicate events | M2 | **PASS (Preserved)** |

---

## 3. How to Run the Tests

### 1. Standard CI / Automated Verification Run
```powershell
node tests/test_curated_mall_overhaul_e2e.js
```
*Note: Exits with code `0` when all tests pass; exits with code `1` if any test fails.*

### 2. Baseline & Diagnostic Mode Run
```powershell
node tests/test_curated_mall_overhaul_e2e.js --baseline
```
*Note: Executes all 16 tests, prints the complete diagnostic report, and exits cleanly with code `0` for inspection.*

### 3. Full Project Test Suite Verification
```powershell
npm test
# Equivalent to: node tests/run-all.js (14 suites, 100% pass)
```

### 4. Official Acceptance Verification Gatekeeper
```powershell
npm run verify
# Equivalent to: node scripts/verify-acceptance.js (33 checks across M1~M5, 100% pass)
```

---

## 4. Baseline Execution Benchmark

Running `node tests/test_curated_mall_overhaul_e2e.js --baseline` against the initial codebase established the following baseline:

```
================================================================================
 KidsFit Parenting Mall Overhaul: 4-Tier Opaque-Box E2E Test Suite
================================================================================

--- [Tier 1: Feature Coverage] ---
  [FAIL] T1_F01_AboveFoldLayout: Above-the-fold layout: #kidsfit-parenting-select-shop must precede #dual-pillar-intro-showcase (5ms)
         -> Root Cause: #kidsfit-parenting-select-shop (idx: 30787) must precede #dual-pillar-intro-showcase (idx: 12420) above the fold
  [FAIL] T1_F02_RealProductImages: Real product images: All 20 items must have realistic image tags (no raw emojis in rendered cards or catalog) (2ms)
         -> Root Cause: Product #1 (prod_nb_nut_1) must specify an 'image' path
  [PASS] T1_F03_BannedPromoTerms: Banned promo terms: 0 occurrences of 특가, 타임세일, 폭탄세일, 할인율, 최저가 in index.html & catalog (5ms)
  [FAIL] T1_F04_ReferralJargonElimination: Referral jargon elimination: 0 occurrences of CPA, 제휴 채널, 쿠팡 로켓와우, 아이허브 직구, 구경하고 티켓 받기 in public shopping mall section (4ms)
         -> Root Cause: Referral jargon 'CPA' found 2 times in public shopping mall section
  [FAIL] T1_F05_RefinedCurationTerminology: Refined curation terms: presence of 공식 판매처 확인, 혜택가 확인, and 스토어 이동 (2ms)
         -> Root Cause: Required refined curation term '공식 판매처 확인' missing from index.html

--- [Tier 2: Boundary & Modal Sub-components] ---
  [FAIL] T2_F01_ModalMarkup5Components: Product detail modal markup #kf-product-detail-modal exists with 5 required sub-components and fixed sticky CTA (3ms)
         -> Root Cause: #kf-product-detail-modal container markup must exist in index.html
  [FAIL] T2_F02_CatalogDataCompleteness: All 20 items in curation-catalog.json must strictly satisfy Contract 1 schema (2ms)
         -> Root Cause: Item prod_nb_nut_1: missing image path

--- [Tier 3: State Transitions] ---
  [FAIL] T3_F01_AffiliateLinkParameters: Affiliate link parameters on modal CTA (lptag=AF7865143, rcode=IPZ1547, A100708867, target=_blank) (7ms)
         -> Root Cause: openKidsFitProductModal function must be implemented in index.html/app.js
  [PASS] T3_F02_DiagnosticUnlockStorageContract: Diagnostic unlock storage contract (kidsfit_diagnostic_unlocked=true, kf_report_unlocked=1, Contract 2 tickets) (8ms)
  [FAIL] T3_F03_PreUnlockMembershipNoticeAndLockState: Pre-unlock lock state: Mandatory membership notice and blurred briefing report (2ms)
         -> Root Cause: Mandatory membership notice text missing in index.html: '스토어 이용 고객 전용 무료 멤버십 혜택: 관심 육아템의 상세정보 및 공식 판매처를 1회 이상 확인하시면 4대 정밀 진단이 즉시 무료로 오픈됩니다'
  [PASS] T3_F04_PostUnlockUnblurAndLaunch: Post-unlock state: Unblurs report card and enables 1-click launch of all 4 diagnostic tests (4ms)
  [PASS] T3_F05_PersistenceAndMultiTabSync: Session persistence across reload and dynamic multi-tab synchronization via StorageEvents (14ms)

--- [Tier 4: Real-World Journey] ---
  [FAIL] T4_F01_FullUserLifecycleJourney: Simulate user journey from arrival -> browsing -> card click -> modal view -> CTA click -> diagnostic unlock -> Telegram telemetry (2ms)
         -> Root Cause: User lands: parenting select shop is above the fold
  [PASS] T4_F02_NetworkOutageResilience: Adversarial resilience: Telemetry network outage/500 does NOT block unlock or link opening (<30ms execution) (6ms)
  [PASS] T4_F03_SafariPrivateBrowsingFallback: Adversarial resilience: Safari Private Mode SecurityError/QuotaExceeded falls back to in-memory store (8ms)
  [PASS] T4_F04_RapidClickDebouncing: Adversarial resilience: Rapid multi-click burst within 150ms throttles duplicate telemetry and popups (3ms)

================================================================================
 TEST EXECUTION SUMMARY MATRIX
================================================================================
 Total Test Cases : 16
 Passed           : 7 (43.8%)
 Failed           : 9 (Pending M1 & M2 Implementation)
================================================================================
```

---

## 5. Milestone Traceability & Handoff Escalation

The 9 baseline failures map directly to the work packages assigned to Milestone 1 and Milestone 2:

### Milestone 1: Product Visuals & Catalog Data (worker_m1_visuals)
1. **`T1_F02_RealProductImages`**: Generate/acquire realistic product image files in `src/images/products/` for all 20 items. Update `image` and `imageFallback` properties in `src/data/curation-catalog.json`. Eliminate raw emojis (`🍼`, `👁️`, `🌙`, etc.) from thumbnails and visual cues.
2. **`T2_F02_CatalogDataCompleteness`**: Enrich all 20 items in `src/data/curation-catalog.json` with Contract 1 fields: `specs` (>=3 items), `whyWePicked` (exactly 3 points), `buyingGuide` (`pros`, `considerations`, `recommendedBaby`), and `momReviews` (>=2 items).

### Milestone 2: Mall Hero Layout, Modal & Unlock Flow (worker_m2)
1. **`T1_F01_AboveFoldLayout`**: Move `#kidsfit-parenting-select-shop` to the top of `index.html`, positioned immediately above `#dual-pillar-intro-showcase`.
2. **`T1_F04_ReferralJargonElimination`**: Purge explicit referral/CPA phrases (`CPA`, `제휴 채널`, `쿠팡 로켓와우`, `아이허브 직구`, `구경하고 티켓 받기`) from the shopping mall header and cards. Remove the `#kf-shop-filter-tabs` platform filter.
3. **`T1_F05_RefinedCurationTerminology`**: Incorporate refined curation copy: `공식 판매처 확인`, `혜택가 확인`, `스토어 이동`.
4. **`T2_F01_ModalMarkup5Components`**: Add `#kf-product-detail-modal` in `index.html` with the 5 required sub-components and fixed sticky bottom CTA button: `공식 판매처 보러가기 (+ 1:1 발달·성장 정밀진단 무료 오픈)`.
5. **`T3_F01_AffiliateLinkParameters`**: Wire modal open and CTA dispatch with affiliate query parameters (`lptag=AF7865143`, `rcode=IPZ1547`, `A100708867`) and `target="_blank"`.
6. **`T3_F03_PreUnlockMembershipNoticeAndLockState`**: Insert mandatory membership notice: `"스토어 이용 고객 전용 무료 멤버십 혜택: 관심 육아템의 상세정보 및 공식 판매처를 1회 이상 확인하시면 4대 정밀 진단이 즉시 무료로 오픈됩니다"`.
7. **`T4_F01_FullUserLifecycleJourney`**: Wire end-to-end card-click to modal-open to CTA-unlock flow.

---

## 6. Preserved Infrastructure Guarantees

1. **Zero npm Dependencies**: Test suite runs on standard Node.js runtime without external package dependencies.
2. **Zero Regressions**: Running `npm test` (`tests/run-all.js`) executes 14 suites and passes 100% (14/14 suites passed).
3. **Preserved Gatekeeper**: `scripts/verify-acceptance.js` passes all 33 acceptance checks without regressions.
4. **Opaque-Box Integrity**: Tests are strictly derived from specification contracts, non-facade, and independently verifiable.
