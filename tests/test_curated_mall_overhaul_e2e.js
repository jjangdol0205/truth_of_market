/**
 * tests/test_curated_mall_overhaul_e2e.js
 *
 * KidsFit Premium Curated Parenting Mall Overhaul & Diagnostic Unlock Platform
 * Comprehensive 4-Tier End-to-End Opaque-Box Test Suite
 *
 * Tier 1: Feature Coverage (Above-the-fold layout, 20 real product images, 0 banned promo terms, 0 referral jargon, refined curation copy)
 * Tier 2: Boundary & Modal Sub-components (#kf-product-detail-modal with 5 sub-components, 20-item catalog schema completeness)
 * Tier 3: Cross-Feature & State Transitions (Modal CTA affiliate parameters, Contract 2 unlock storage schema, pre-unlock membership notice & blur, post-unlock unblur & test launch, persistence, multi-tab sync)
 * Tier 4: Real-World Journey (Full user lifecycle simulation, network outage resilience, Safari private mode fallback, rapid click debouncing)
 *
 * Authoritative Sources:
 * - ORIGINAL_REQUEST.md (Requirements R1, R2, R3, R4, R5 & Acceptance Criteria)
 * - PROJECT.md (Architecture, Interface Contracts 1~4, Code Layout)
 * - survey_spec_miner_tests/handoff.md (Specifications & Verification Invariants)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');
const CATALOG_PATH = path.join(ROOT_DIR, 'src', 'data', 'curation-catalog.json');
const MONETIZATION_JS_PATH = path.join(ROOT_DIR, 'src', 'js', 'monetization.js');

// Authoritative constants from PROJECT.md & ORIGINAL_REQUEST.md
const COUPANG_PARTNER_TAG = 'AF7865143';
const IHERB_PARTNER_TAG = 'IPZ1547';
const CPA_PARTNER_TAG = 'A100708867';
const TELEGRAM_CHAT_ID = '755033799';

const BANNED_PROMO_TERMS = ['특가', '타임세일', '폭탄세일', '할인율', '최저가'];
const BANNED_REFERRAL_JARGON = ['CPA', '제휴 채널', '쿠팡 로켓와우', '아이허브 직구', '구경하고 티켓 받기'];
const REFINED_CURATION_TERMS = ['공식 판매처 확인', '혜택가 확인', '스토어 이동'];

const REQUIRED_MEMBERSHIP_NOTICE = '스토어 이용 고객 전용 무료 멤버십 혜택: 관심 육아템의 상세정보 및 공식 판매처를 1회 이상 확인하시면 4대 정밀 진단이 즉시 무료로 오픈됩니다';
const REQUIRED_MODAL_CTA_TEXT = '공식 판매처 보러가기 (+ 1:1 발달·성장 정밀진단 무료 오픈)';

const EXPECTED_DIAGNOSTIC_TESTS = ['growth', 'precocious_puberty', 'brain_development', 'temperament_learning'];
const VALID_STAGES = ['pregnancy_newborn', 'infancy', 'toddler', 'child'];
const VALID_CATEGORIES = ['nutrition', 'development', 'gear', 'learning'];
const VALID_PLATFORMS = ['coupang', 'iherb', 'cpa'];

const RAW_EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

// ==============================================================================
// Lightweight Opaque-Box Browser Simulation Sandbox
// ==============================================================================

class MockStorage {
  constructor(shouldThrow = false, isQuota = false) {
    this.store = {};
    this.shouldThrow = shouldThrow;
    this.isQuota = isQuota;
  }
  getItem(k) {
    if (this.shouldThrow) {
      const err = new Error('SecurityError: The operation is insecure.');
      err.name = 'SecurityError';
      throw err;
    }
    return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null;
  }
  setItem(k, v) {
    if (this.shouldThrow) {
      const err = new Error(this.isQuota ? 'QuotaExceededError: DOM Exception 22' : 'SecurityError');
      err.name = this.isQuota ? 'QuotaExceededError' : 'SecurityError';
      throw err;
    }
    this.store[k] = String(v);
  }
  removeItem(k) {
    if (this.shouldThrow) throw new Error('SecurityError');
    delete this.store[k];
  }
  clear() {
    if (this.shouldThrow) throw new Error('SecurityError');
    this.store = {};
  }
}

function createBrowserEnv(options = {}) {
  const localStorage = new MockStorage(options.throwStorage || false, options.quotaStorage || false);
  const sessionStorage = new MockStorage(options.throwStorage || false, options.quotaStorage || false);

  const elements = {
    'master-briefing-card': { id: 'master-briefing-card', style: { filter: 'blur(4.5px)', maxHeight: '520px', overflow: 'hidden' }, scrollIntoView: () => {} },
    'kf-unlock-gate-locked-view': { id: 'kf-unlock-gate-locked-view', style: { display: 'block' } },
    'kf-unlock-gate-unlocked-view': { id: 'kf-unlock-gate-unlocked-view', style: { display: 'none' } },
    'quiz-section': { id: 'quiz-section', style: { display: 'none' }, scrollIntoView: () => {} },
    'kidsfit-parenting-select-shop': { id: 'kidsfit-parenting-select-shop', style: {} },
    'dual-pillar-intro-showcase': { id: 'dual-pillar-intro-showcase', style: {} },
    'kf-product-detail-modal': { id: 'kf-product-detail-modal', style: { display: 'none' }, classList: { add: () => {}, remove: () => {} } },
    'kf-modal-cta-btn': { id: 'kf-modal-cta-btn', href: '', textContent: '', setAttribute: () => {}, getAttribute: () => {} }
  };

  const openedWindows = [];
  const telemetryCalls = [];

  const sandbox = {
    console,
    Date,
    Buffer,
    setTimeout,
    clearTimeout,
    URLSearchParams,
    __kidsfitInMemoryStore: {},
    localStorage,
    sessionStorage,
    location: {
      hostname: 'kidsfit.co.kr',
      search: options.search || ''
    },
    open: function(url, target, features) {
      openedWindows.push({ url, target, features });
      return { closed: false, close: () => {} };
    },
    fetch: function(url, opts) {
      telemetryCalls.push({ url, options: opts });
      if (options.failFetch) {
        return Promise.reject(new Error('NetworkError: Connection refused or offline'));
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok', success: true })
      });
    },
    document: {
      elements,
      getElementById(id) {
        return elements[id] || null;
      },
      querySelector(sel) {
        if (sel === '#kf-product-detail-modal') return elements['kf-product-detail-modal'];
        if (sel === '#kf-modal-cta-btn') return elements['kf-modal-cta-btn'];
        return null;
      },
      querySelectorAll(sel) {
        return [];
      },
      addEventListener(event, handler) {
        this.listeners = this.listeners || {};
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(handler);
      },
      dispatchEvent(event) {
        if (this.listeners && this.listeners[event.type]) {
          this.listeners[event.type].forEach(fn => fn(event));
        }
      }
    },
    addEventListener(event, handler) {
      this.listeners = this.listeners || {};
      this.listeners[event] = this.listeners[event] || [];
      this.listeners[event].push(handler);
    },
    dispatchEvent(event) {
      if (this.listeners && this.listeners[event.type]) {
        this.listeners[event.type].forEach(fn => fn(event));
      }
    }
  };

  sandbox.window = sandbox;
  const context = vm.createContext(sandbox);

  // Load monetization script if available
  if (fs.existsSync(MONETIZATION_JS_PATH)) {
    const monCode = fs.readFileSync(MONETIZATION_JS_PATH, 'utf8');
    vm.runInContext(monCode, context);
  }

  // Load client scripts from index.html
  if (fs.existsSync(INDEX_HTML_PATH)) {
    const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
    const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
      const code = match[1];
      if (code.includes('unlockKidsFitDiagnosticTests') || code.includes('isKidsFitDiagnosticUnlocked') || code.includes('openKidsFitProductModal')) {
        try {
          vm.runInContext(code, context);
        } catch (e) {
          // Allow execution to continue if parts fail
        }
      }
    }
  }

  return { sandbox, context, localStorage, sessionStorage, elements, openedWindows, telemetryCalls };
}

// ==============================================================================
// Test Runner Architecture
// ==============================================================================

class TestSuiteRunner {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.tests = [];
    this.results = [];
  }

  register(tier, id, title, targetMilestone, testFn) {
    this.tests.push({ tier, id, title, targetMilestone, testFn });
  }

  run() {
    console.log('================================================================================');
    console.log(` ${this.suiteName}`);
    console.log('================================================================================\n');

    let passedCount = 0;
    let failedCount = 0;

    let currentTier = null;

    for (const test of this.tests) {
      if (test.tier !== currentTier) {
        currentTier = test.tier;
        console.log(`\n--- [${currentTier}] ---`);
      }

      const start = Date.now();
      try {
        test.testFn();
        const duration = Date.now() - start;
        console.log(`  [PASS] ${test.id}: ${test.title} (${duration}ms)`);
        passedCount++;
        this.results.push({ ...test, status: 'PASS', duration });
      } catch (err) {
        const duration = Date.now() - start;
        console.log(`  [FAIL] ${test.id}: ${test.title} (${duration}ms)`);
        console.log(`         -> Root Cause: ${err.message}`);
        failedCount++;
        this.results.push({ ...test, status: 'FAIL', duration, error: err.message, stack: err.stack });
      }
    }

    const total = this.tests.length;
    const passRate = ((passedCount / total) * 100).toFixed(1);

    console.log('\n================================================================================');
    console.log(' TEST EXECUTION SUMMARY MATRIX');
    console.log('================================================================================');
    console.log(` Total Test Cases : ${total}`);
    console.log(` Passed           : ${passedCount} (${passRate}%)`);
    console.log(` Failed           : ${failedCount}`);
    console.log('================================================================================\n');

    if (failedCount > 0) {
      console.log('--------------------------------------------------------------------------------');
      console.log(' BASELINE DEFECT & MILESTONE TRACEABILITY REPORT');
      console.log('--------------------------------------------------------------------------------');
      const m1Fails = this.results.filter(r => r.status === 'FAIL' && r.targetMilestone === 'M1');
      const m2Fails = this.results.filter(r => r.status === 'FAIL' && r.targetMilestone === 'M2');
      const otherFails = this.results.filter(r => r.status === 'FAIL' && !['M1', 'M2'].includes(r.targetMilestone));

      if (m1Fails.length > 0) {
        console.log(`\n[Milestone 1: Product Visuals & Catalog Data] (${m1Fails.length} pending items):`);
        m1Fails.forEach(f => console.log(`  * ${f.id} (${f.title}): ${f.error}`));
      }

      if (m2Fails.length > 0) {
        console.log(`\n[Milestone 2: Mall Hero Layout, Modal & Unlock Copy] (${m2Fails.length} pending items):`);
        m2Fails.forEach(f => console.log(`  * ${f.id} (${f.title}): ${f.error}`));
      }

      if (otherFails.length > 0) {
        console.log(`\n[Other / System Invariants] (${otherFails.length} pending items):`);
        otherFails.forEach(f => console.log(`  * ${f.id} (${f.title}): ${f.error}`));
      }
      console.log('--------------------------------------------------------------------------------\n');
    }

    return { total, passedCount, failedCount, passRate, results: this.results };
  }
}

// ==============================================================================
// Test Suite Definition
// ==============================================================================

const suite = new TestSuiteRunner('KidsFit Parenting Mall Overhaul: 4-Tier Opaque-Box E2E Test Suite');

// ==============================================================================
// TIER 1: FEATURE COVERAGE
// ==============================================================================

suite.register('Tier 1: Feature Coverage', 'T1_F01_AboveFoldLayout', 'Above-the-fold layout: #kidsfit-parenting-select-shop must precede #dual-pillar-intro-showcase', 'M2', () => {
  assert(fs.existsSync(INDEX_HTML_PATH), 'index.html must exist');
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  const shopIdx = html.indexOf('kidsfit-parenting-select-shop');
  assert(shopIdx !== -1, '#kidsfit-parenting-select-shop element must exist in index.html');

  const dualIdx = html.indexOf('dual-pillar-intro-showcase');
  assert(dualIdx !== -1, '#dual-pillar-intro-showcase element must exist in index.html');

  assert(shopIdx < dualIdx, `#kidsfit-parenting-select-shop (idx: ${shopIdx}) must precede #dual-pillar-intro-showcase (idx: ${dualIdx}) above the fold`);
});

suite.register('Tier 1: Feature Coverage', 'T1_F02_RealProductImages', 'Real product images: All 20 items must have realistic image tags (no raw emojis in rendered cards or catalog)', 'M1', () => {
  assert(fs.existsSync(CATALOG_PATH), 'curation-catalog.json must exist');
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const products = catalog.parentingProducts || [];

  assert.strictEqual(products.length, 20, `Expected exactly 20 parenting items, found ${products.length}`);

  products.forEach((prod, idx) => {
    assert(prod.image, `Product #${idx + 1} (${prod.id || 'unknown'}) must specify an 'image' path`);
    assert(/\.(webp|png|jpe?g|svg)$/i.test(prod.image), `Product #${idx + 1} (${prod.id}) image path '${prod.image}' must point to a standard web image asset (.webp, .png, .jpg, .svg)`);

    const fullImagePath = path.join(ROOT_DIR, prod.image);
    assert(fs.existsSync(fullImagePath), `Referenced image asset does not exist on disk: ${prod.image}`);
    const stat = fs.statSync(fullImagePath);
    assert(stat.size > 0, `Image asset must be non-empty (>0 bytes): ${prod.image}`);

    // Ensure raw emojis are eliminated as product visuals
    if (prod.thumbnail) {
      assert(!RAW_EMOJI_REGEX.test(prod.thumbnail), `Product #${idx + 1} (${prod.id}) thumbnail still contains raw emoji placeholder: ${prod.thumbnail}`);
    }
    assert(!RAW_EMOJI_REGEX.test(prod.image), `Product #${idx + 1} (${prod.id}) image string cannot contain emoji`);
  });
});

suite.register('Tier 1: Feature Coverage', 'T1_F03_BannedPromoTerms', 'Banned promo terms: 0 occurrences of 특가, 타임세일, 폭탄세일, 할인율, 최저가 in index.html & catalog', 'M2', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  for (const term of BANNED_PROMO_TERMS) {
    const count = (html.match(new RegExp(term, 'g')) || []).length;
    assert.strictEqual(count, 0, `Banned promo term '${term}' found ${count} times in index.html`);
  }

  if (fs.existsSync(CATALOG_PATH)) {
    const catalogRaw = fs.readFileSync(CATALOG_PATH, 'utf8');
    const catalog = JSON.parse(catalogRaw);
    const productsStr = JSON.stringify(catalog.parentingProducts || []);
    for (const term of BANNED_PROMO_TERMS) {
      const count = (productsStr.match(new RegExp(term, 'g')) || []).length;
      assert.strictEqual(count, 0, `Banned promo term '${term}' found ${count} times in parentingProducts catalog`);
    }
  }
});

suite.register('Tier 1: Feature Coverage', 'T1_F04_ReferralJargonElimination', 'Referral jargon elimination: 0 occurrences of CPA, 제휴 채널, 쿠팡 로켓와우, 아이허브 직구, 구경하고 티켓 받기 in index.html & catalog', 'M2', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  assert(html.includes('kidsfit-parenting-select-shop'), 'Shopping mall section must exist in index.html');

  // 1. Verify 0 occurrences of all banned referral jargon across the ENTIRE index.html (including modal markup and scripts)
  for (const jargon of BANNED_REFERRAL_JARGON) {
    const count = (html.match(new RegExp(jargon, 'g')) || []).length;
    assert.strictEqual(count, 0, `Referral jargon '${jargon}' found ${count} times in index.html`);
  }

  // 2. Verify 0 occurrences of all banned referral jargon across the ENTIRE curation-catalog.json
  if (fs.existsSync(CATALOG_PATH)) {
    const catalogRaw = fs.readFileSync(CATALOG_PATH, 'utf8');
    for (const jargon of BANNED_REFERRAL_JARGON) {
      const count = (catalogRaw.match(new RegExp(jargon, 'g')) || []).length;
      assert.strictEqual(count, 0, `Referral jargon '${jargon}' found ${count} times in src/data/curation-catalog.json`);
    }
  }

  // 3. Ensure affiliate filter tabs (CPA / Coupang / iHerb tabs) are purged from public mall UI
  assert(!html.includes('kf-shop-filter-tabs'), 'Affiliate platform filter tabs (#kf-shop-filter-tabs) must be eliminated');
});

suite.register('Tier 1: Feature Coverage', 'T1_F05_RefinedCurationTerminology', 'Refined curation terms: presence of 공식 판매처 확인, 혜택가 확인, and 스토어 이동', 'M2', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  for (const term of REFINED_CURATION_TERMS) {
    assert(html.includes(term), `Required refined curation term '${term}' missing from index.html`);
  }
});

// ==============================================================================
// TIER 2: BOUNDARY & MODAL SUB-COMPONENTS
// ==============================================================================

suite.register('Tier 2: Boundary & Modal Sub-components', 'T2_F01_ModalMarkup5Components', 'Product detail modal markup #kf-product-detail-modal exists with 5 required sub-components and fixed sticky CTA', 'M2', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  assert(html.includes('id="kf-product-detail-modal"'), '#kf-product-detail-modal container markup must exist in index.html');

  // Sub-component 1: Real image & specs summary container
  const hasSpecsSummary = html.includes('kf-modal-image') || html.includes('kf-modal-specs') || html.includes('kf-modal-specs-summary');
  assert(hasSpecsSummary, 'Modal sub-component 1: Product image and specs summary container missing');

  // Sub-component 2: 3 "Why We Picked" points container
  const hasWhyPicked = html.includes('kf-modal-why-picked') || html.includes('kf-why-we-picked');
  assert(hasWhyPicked, 'Modal sub-component 2: 3 "Why We Picked" points container missing');

  // Sub-component 3: Comparative buying guide (pros, considerations, recommended baby) container
  const hasBuyingGuide = html.includes('kf-modal-buying-guide') || html.includes('kf-buying-guide');
  assert(hasBuyingGuide, 'Modal sub-component 3: Comparative buying guide container missing');

  // Sub-component 4: Veteran mom review summary container
  const hasMomReviews = html.includes('kf-modal-mom-reviews') || html.includes('kf-mom-reviews');
  assert(hasMomReviews, 'Modal sub-component 4: Veteran mom review summary container missing');

  // Sub-component 5: Fixed sticky bottom CTA button with exact label
  assert(html.includes(REQUIRED_MODAL_CTA_TEXT), `Modal sub-component 5: Fixed bottom CTA button with exact text '${REQUIRED_MODAL_CTA_TEXT}' missing`);
});

suite.register('Tier 2: Boundary & Modal Sub-components', 'T2_F02_CatalogDataCompleteness', 'All 20 items in curation-catalog.json must strictly satisfy Contract 1 schema', 'M1', () => {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const products = catalog.parentingProducts || [];
  assert.strictEqual(products.length, 20, 'Catalog must contain exactly 20 items');

  products.forEach((prod, idx) => {
    const id = prod.id || `item_${idx + 1}`;

    // Base metadata
    assert(typeof prod.id === 'string' && prod.id.length > 0, `Item ${id}: missing valid id`);
    assert(typeof prod.name === 'string' && prod.name.length >= 4, `Item ${id}: name must be at least 4 characters`);
    assert(VALID_STAGES.includes(prod.stage), `Item ${id}: invalid stage '${prod.stage}'`);
    assert(VALID_CATEGORIES.includes(prod.category), `Item ${id}: invalid category '${prod.category}'`);
    assert(VALID_PLATFORMS.includes(prod.platform), `Item ${id}: invalid platform '${prod.platform}'`);

    // Partner tag compliance
    if (prod.platform === 'coupang') {
      assert.strictEqual(prod.partnerTag, COUPANG_PARTNER_TAG, `Item ${id}: Coupang partner tag must be ${COUPANG_PARTNER_TAG}`);
    } else if (prod.platform === 'iherb') {
      assert.strictEqual(prod.partnerTag, IHERB_PARTNER_TAG, `Item ${id}: iHerb partner tag must be ${IHERB_PARTNER_TAG}`);
    } else if (prod.platform === 'cpa') {
      assert.strictEqual(prod.partnerTag, CPA_PARTNER_TAG, `Item ${id}: CPA partner tag must be ${CPA_PARTNER_TAG}`);
    }

    assert(typeof prod.price === 'string' && /[\d,]+\s*원/.test(prod.price), `Item ${id}: price string missing format (e.g. 26,400원)`);
    assert(typeof prod.rating === 'number' && prod.rating >= 4.0 && prod.rating <= 5.0, `Item ${id}: rating must be number between 4.0 and 5.0`);
    assert(typeof prod.reviewCount === 'number' && prod.reviewCount >= 10, `Item ${id}: reviewCount must be >= 10`);

    // Asset paths
    assert(typeof prod.image === 'string' && prod.image.length > 0, `Item ${id}: missing image path`);
    assert(typeof prod.imageFallback === 'string' && prod.imageFallback.length > 0, `Item ${id}: missing imageFallback path`);

    // Editorial and Modal Content (Contract 1)
    assert(typeof prod.summary === 'string' && prod.summary.length >= 10, `Item ${id}: summary must be >= 10 chars`);
    assert(typeof prod.benefitCue === 'string' && prod.benefitCue.length >= 5, `Item ${id}: benefitCue must be >= 5 chars`);

    assert(Array.isArray(prod.specs) && prod.specs.length >= 3, `Item ${id}: specs must be array of at least 3 items`);
    assert(Array.isArray(prod.whyWePicked) && prod.whyWePicked.length === 3, `Item ${id}: whyWePicked must contain exactly 3 points, found ${prod.whyWePicked ? prod.whyWePicked.length : 0}`);

    assert(prod.buyingGuide && typeof prod.buyingGuide === 'object', `Item ${id}: buyingGuide object missing`);
    assert(typeof prod.buyingGuide.pros === 'string' && prod.buyingGuide.pros.length > 0, `Item ${id}: buyingGuide.pros missing`);
    assert(typeof prod.buyingGuide.considerations === 'string' && prod.buyingGuide.considerations.length > 0, `Item ${id}: buyingGuide.considerations missing`);
    assert(typeof prod.buyingGuide.recommendedBaby === 'string' && prod.buyingGuide.recommendedBaby.length > 0, `Item ${id}: buyingGuide.recommendedBaby missing`);

    assert(Array.isArray(prod.momReviews) && prod.momReviews.length >= 2, `Item ${id}: momReviews must be array of at least 2 reviews`);
  });
});

// ==============================================================================
// TIER 3: CROSS-FEATURE & STATE TRANSITIONS
// ==============================================================================

suite.register('Tier 3: State Transitions', 'T3_F01_AffiliateLinkParameters', 'Affiliate link parameters on modal CTA (lptag=AF7865143, rcode=IPZ1547, A100708867, target=_blank)', 'M2', () => {
  const env = createBrowserEnv();
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const products = catalog.parentingProducts || [];

  const coupangProd = products.find(p => p.platform === 'coupang') || { name: '온습도계', platform: 'coupang', url: 'https://coupang.com/vp/1234?lptag=AF7865143' };
  const iherbProd = products.find(p => p.platform === 'iherb') || { name: '비타민D3', platform: 'iherb', url: 'https://kr.iherb.com/pr/1234?rcode=IPZ1547' };
  const cpaProd = products.find(p => p.platform === 'cpa') || { name: '몬테소리', platform: 'cpa', url: 'https://linkprice.com/click?A100708867' };

  // Function to open modal or generate link
  assert(typeof env.sandbox.openKidsFitProductModal === 'function' || typeof env.sandbox.unlockKidsFitDiagnosticTests === 'function', 'Client must provide modal/unlock controller functions');

  // Verify modal opening configures CTA button with partner parameter and target="_blank"
  if (typeof env.sandbox.openKidsFitProductModal === 'function') {
    env.sandbox.openKidsFitProductModal(coupangProd.id);
    const ctaBtn = env.sandbox.document.getElementById('kf-modal-cta-btn');
    assert(ctaBtn, 'Modal CTA button must exist in DOM');
    assert(ctaBtn.href.includes(`lptag=${COUPANG_PARTNER_TAG}`), `Coupang modal CTA must have lptag=${COUPANG_PARTNER_TAG}`);

    env.sandbox.openKidsFitProductModal(iherbProd.id);
    assert(ctaBtn.href.includes(`rcode=${IHERB_PARTNER_TAG}`), `iHerb modal CTA must have rcode=${IHERB_PARTNER_TAG}`);

    env.sandbox.openKidsFitProductModal(cpaProd.id);
    assert(ctaBtn.href.includes(CPA_PARTNER_TAG), `CPA modal CTA must have ${CPA_PARTNER_TAG}`);
  } else {
    // If modal open function is pending in M2, assert via requirement specification
    assert(false, 'openKidsFitProductModal function must be implemented in index.html/app.js');
  }
});

suite.register('Tier 3: State Transitions', 'T3_F02_DiagnosticUnlockStorageContract', 'Diagnostic unlock storage contract (kidsfit_diagnostic_unlocked=true, kf_report_unlocked=1, Contract 2 tickets)', 'M2', () => {
  const env = createBrowserEnv();

  assert(typeof env.sandbox.isKidsFitDiagnosticUnlocked === 'function', 'isKidsFitDiagnosticUnlocked function must be defined');
  assert(typeof env.sandbox.unlockKidsFitDiagnosticTests === 'function', 'unlockKidsFitDiagnosticTests function must be defined');

  // Initial state check
  assert.strictEqual(env.sandbox.isKidsFitDiagnosticUnlocked(), false, 'Initial state must be locked (false)');

  const testItem = '닥터에디션 베이비 비타민D3 400IU 드롭스 & 유산균';
  const testNet = 'iHerb (IPZ1547)';
  const testHref = 'https://kr.iherb.com/pr/california-gold-nutrition-baby-vitamin-d3-drops-400-iu-34-fl-oz-10-ml/65958?rcode=IPZ1547';

  const res = env.sandbox.unlockKidsFitDiagnosticTests(testItem, testNet, testHref);
  assert.strictEqual(res.status, 'SUCCESS', 'Unlock status must be SUCCESS');
  assert.strictEqual(res.unlocked, true, 'Unlock result unlocked must be true');

  // Verify exact Contract 2 storage keys
  assert.strictEqual(env.localStorage.getItem('kidsfit_diagnostic_unlocked'), 'true', 'localStorage kidsfit_diagnostic_unlocked must be true');
  assert.strictEqual(env.localStorage.getItem('kf_report_unlocked'), '1', 'localStorage kf_report_unlocked must be 1');
  assert.strictEqual(env.sessionStorage.getItem('kf_report_unlocked'), '1', 'sessionStorage kf_report_unlocked must be 1');

  const rawTickets = env.localStorage.getItem('kidsfit_free_tickets');
  assert(rawTickets, 'localStorage kidsfit_free_tickets must be populated');
  const payload = JSON.parse(rawTickets);
  assert.strictEqual(payload.unlocked, true);
  assert.strictEqual(payload.triggerItem, testItem);
  assert.strictEqual(payload.triggerNetwork, testNet);

  for (const t of EXPECTED_DIAGNOSTIC_TESTS) {
    assert(payload.tickets && payload.tickets[t], `Contract 2: ticket for '${t}' missing`);
    assert.strictEqual(payload.tickets[t].unlocked, true, `Contract 2: ticket '${t}' unlocked must be true`);
  }
});

suite.register('Tier 3: State Transitions', 'T3_F03_PreUnlockMembershipNoticeAndLockState', 'Pre-unlock lock state: Mandatory membership notice and blurred briefing report', 'M2', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  assert(html.includes(REQUIRED_MEMBERSHIP_NOTICE), `Mandatory membership notice text missing in index.html: '${REQUIRED_MEMBERSHIP_NOTICE}'`);

  const env = createBrowserEnv();
  assert(typeof env.sandbox.applyKidsFitReportLockState === 'function', 'applyKidsFitReportLockState must be defined');

  env.sandbox.applyKidsFitReportLockState();
  const lockedView = env.sandbox.document.getElementById('kf-unlock-gate-locked-view');
  const unlockedView = env.sandbox.document.getElementById('kf-unlock-gate-unlocked-view');
  const briefingCard = env.sandbox.document.getElementById('master-briefing-card');

  assert.strictEqual(lockedView.style.display, 'block', 'Locked view gate must be displayed');
  assert.strictEqual(unlockedView.style.display, 'none', 'Unlocked view gate must be hidden');
  assert(briefingCard.style.filter.includes('blur'), 'Master briefing card must be blurred when locked');
});

suite.register('Tier 3: State Transitions', 'T3_F04_PostUnlockUnblurAndLaunch', 'Post-unlock state: Unblurs report card and enables 1-click launch of all 4 diagnostic tests', 'M2', () => {
  const env = createBrowserEnv();
  env.sandbox.unlockKidsFitDiagnosticTests('테스트 제품', 'Coupang', 'https://coupang.com');

  assert.strictEqual(env.sandbox.isKidsFitDiagnosticUnlocked(), true, 'Must report unlocked=true');
  const lockedView = env.sandbox.document.getElementById('kf-unlock-gate-locked-view');
  const unlockedView = env.sandbox.document.getElementById('kf-unlock-gate-unlocked-view');
  const briefingCard = env.sandbox.document.getElementById('master-briefing-card');

  assert.strictEqual(lockedView.style.display, 'none', 'Locked gate must be hidden post-unlock');
  assert.strictEqual(unlockedView.style.display, 'flex', 'Unlocked gate must be flex post-unlock');
  assert.strictEqual(briefingCard.style.filter, 'none', 'Blur must be removed from master briefing card');

  // Verify 1-click test launches
  const testLaunches = [];
  env.sandbox.TallerOnboardingWizard = {
    enterStudioMode: (audience, mode) => testLaunches.push({ audience, mode }),
    goToStep: (step) => testLaunches.push({ step })
  };

  assert(typeof env.sandbox.launchKidsFitDiagnosticTest === 'function', 'launchKidsFitDiagnosticTest function must exist');
  for (const t of EXPECTED_DIAGNOSTIC_TESTS) {
    env.sandbox.launchKidsFitDiagnosticTest(t);
  }
  assert.strictEqual(testLaunches.length, 6, 'All 4 diagnostic tests must trigger clean studio launches without paywall gates');
});

suite.register('Tier 3: State Transitions', 'T3_F05_PersistenceAndMultiTabSync', 'Session persistence across reload and dynamic multi-tab synchronization via StorageEvents', 'M2', () => {
  // Session persistence across reload
  const env1 = createBrowserEnv();
  env1.sandbox.unlockKidsFitDiagnosticTests('영양제', 'iHerb', 'https://iherb.com');

  const envReload = createBrowserEnv();
  Object.assign(envReload.localStorage.store, env1.localStorage.store);
  Object.assign(envReload.sessionStorage.store, env1.sessionStorage.store);

  assert.strictEqual(envReload.sandbox.isKidsFitDiagnosticUnlocked(), true, 'Unlocked state must persist cleanly into new window/session');
  envReload.sandbox.applyKidsFitReportLockState();
  assert.strictEqual(envReload.sandbox.document.getElementById('master-briefing-card').style.filter, 'none', 'Briefing card remains unblurred across reloads');

  // Multi-tab synchronization
  const envTabB = createBrowserEnv();
  assert.strictEqual(envTabB.sandbox.isKidsFitDiagnosticUnlocked(), false, 'Tab B initially locked');

  envTabB.localStorage.store['kidsfit_diagnostic_unlocked'] = 'true';
  envTabB.localStorage.store['kf_report_unlocked'] = '1';
  envTabB.sandbox.dispatchEvent({ type: 'storage', key: 'kidsfit_diagnostic_unlocked' });

  assert.strictEqual(envTabB.sandbox.isKidsFitDiagnosticUnlocked(), true, 'Tab B must unlock dynamically upon storage event');
  assert.strictEqual(envTabB.sandbox.document.getElementById('kf-unlock-gate-locked-view').style.display, 'none');
  assert.strictEqual(envTabB.sandbox.document.getElementById('kf-unlock-gate-unlocked-view').style.display, 'flex');
});

// ==============================================================================
// TIER 4: REAL-WORLD JOURNEY SIMULATION
// ==============================================================================

suite.register('Tier 4: Real-World Journey', 'T4_F01_FullUserLifecycleJourney', 'Simulate user journey from arrival -> browsing -> card click -> modal view -> CTA click -> diagnostic unlock -> Telegram telemetry', 'M2', () => {
  // 1. Arrival
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  assert(html.indexOf('kidsfit-parenting-select-shop') < html.indexOf('dual-pillar-intro-showcase'), 'User lands: parenting select shop is above the fold');

  const env = createBrowserEnv();
  assert.strictEqual(env.sandbox.isKidsFitDiagnosticUnlocked(), false, 'User lands: tests initially locked');

  // 2. Browsing & Filtering
  assert(typeof env.sandbox.filterKidsFitShopByStage === 'function' || html.includes('filterKidsFitShopByStage'), 'Stage filtering must be supported');

  // 3. Card click opens modal
  assert(typeof env.sandbox.openKidsFitProductModal === 'function', 'Clicking product card must call openKidsFitProductModal to display in-app detail modal');

  env.sandbox.openKidsFitProductModal('prod_nb_nut_1');
  const modal = env.sandbox.document.getElementById('kf-product-detail-modal');
  assert(modal, 'Modal must exist');
  assert.strictEqual(modal.style.display, 'block', 'Modal must be open and displayed');

  // 4. Modal CTA click executes partner link tab open + unlock + telemetry
  assert(typeof env.sandbox.handleKidsFitModalCtaClick === 'function', 'Modal CTA click handler handleKidsFitModalCtaClick must be defined');

  env.sandbox.handleKidsFitModalCtaClick('prod_nb_nut_1');

  // External partner window opened
  assert.strictEqual(env.openedWindows.length, 1, 'Partner store must be opened in exactly 1 new tab');
  assert.strictEqual(env.openedWindows[0].target, '_blank', 'Partner link must open in _blank tab');
  assert(env.openedWindows[0].url.includes(IHERB_PARTNER_TAG), 'Partner URL must carry affiliate parameter');

  // Storage contract mutated
  assert.strictEqual(env.sandbox.isKidsFitDiagnosticUnlocked(), true, 'Diagnostic tests must be immediately unlocked in storage');

  // Telegram telemetry beacon dispatched
  const visitCalls = env.telemetryCalls.filter(c => c.url === '/api/visit');
  assert.strictEqual(visitCalls.length, 1, 'Telemetry beacon to /api/visit must be dispatched');
  const body = JSON.parse(visitCalls[0].options.body);
  assert.strictEqual(body.event, 'diagnostic_test_unlock');
  assert.deepStrictEqual(body.unlocked_tests, EXPECTED_DIAGNOSTIC_TESTS);

  // 5. Unlocked diagnostic test access
  assert.strictEqual(env.sandbox.document.getElementById('master-briefing-card').style.filter, 'none');
});

suite.register('Tier 4: Real-World Journey', 'T4_F02_NetworkOutageResilience', 'Adversarial resilience: Telemetry network outage/500 does NOT block unlock or link opening (<30ms execution)', 'M2', () => {
  const env = createBrowserEnv({ failFetch: true });

  const start = Date.now();
  let result;
  assert.doesNotThrow(() => {
    result = env.sandbox.unlockKidsFitDiagnosticTests('네트워크 오프라인 아이템', 'Coupang', 'https://coupang.com');
  }, 'Unlock must never throw even if network telemetry fails');

  const duration = Date.now() - start;
  assert(duration < 30, `Offline unlock must complete synchronously in < 30ms, took ${duration}ms`);
  assert.strictEqual(result.status, 'SUCCESS');
  assert.strictEqual(result.unlocked, true);
  assert.strictEqual(env.sandbox.isKidsFitDiagnosticUnlocked(), true);
});

suite.register('Tier 4: Real-World Journey', 'T4_F03_SafariPrivateBrowsingFallback', 'Adversarial resilience: Safari Private Mode SecurityError/QuotaExceeded falls back to in-memory store', 'M2', () => {
  const envSec = createBrowserEnv({ throwStorage: true });

  let resultSec;
  assert.doesNotThrow(() => {
    resultSec = envSec.sandbox.unlockKidsFitDiagnosticTests('사파리 시큐리티에러', 'iHerb', 'https://iherb.com');
  }, 'SecurityError on localStorage.setItem must be caught quietly');

  assert.strictEqual(resultSec.unlocked, true, 'Must report unlocked=true');
  assert.strictEqual(envSec.sandbox.isKidsFitDiagnosticUnlocked(), true, 'Must report unlocked=true via in-memory store fallback');

  const envQuota = createBrowserEnv({ throwStorage: true, quotaStorage: true });
  let resultQuota;
  assert.doesNotThrow(() => {
    resultQuota = envQuota.sandbox.unlockKidsFitDiagnosticTests('쿼터 초과 에러', 'CPA', 'https://linkprice.com');
  }, 'QuotaExceededError on localStorage.setItem must be caught quietly');
  assert.strictEqual(resultQuota.unlocked, true);
  assert.strictEqual(envQuota.sandbox.isKidsFitDiagnosticUnlocked(), true);
});

suite.register('Tier 4: Real-World Journey', 'T4_F04_RapidClickDebouncing', 'Adversarial resilience: Rapid multi-click burst within 150ms throttles duplicate telemetry and popups', 'M2', () => {
  const env = createBrowserEnv();

  const click1 = env.sandbox.unlockKidsFitDiagnosticTests('연속 클릭 아이템', 'Coupang', 'https://coupang.com');
  const click2 = env.sandbox.unlockKidsFitDiagnosticTests('연속 클릭 아이템', 'Coupang', 'https://coupang.com');
  const click3 = env.sandbox.unlockKidsFitDiagnosticTests('연속 클릭 아이템', 'Coupang', 'https://coupang.com');

  assert.strictEqual(click1.status, 'SUCCESS', 'First click must execute SUCCESS');
  assert.strictEqual(click2.status, 'DEBOUNCED', 'Second immediate click must return DEBOUNCED');
  assert.strictEqual(click3.status, 'DEBOUNCED', 'Third immediate click must return DEBOUNCED');

  const visitCalls = env.telemetryCalls.filter(c => c.url === '/api/visit');
  assert.strictEqual(visitCalls.length, 1, 'Only 1 telemetry call must be dispatched despite 3 rapid clicks');
});

// ==============================================================================
// Command Line Runner Execution
// ==============================================================================

if (require.main === module) {
  const isBaselineMode = process.argv.includes('--baseline') || process.argv.includes('--summary');
  const outcome = suite.run();

  if (isBaselineMode) {
    console.log('[BASELINE MODE] Preserving baseline execution report without error exit.');
    process.exit(0);
  } else {
    // Normal CI execution: exit with 1 if there are failures, 0 if all pass
    process.exit(outcome.failedCount > 0 ? 1 : 0);
  }
}

module.exports = { suite, TestSuiteRunner };
