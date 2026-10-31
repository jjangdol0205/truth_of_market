/**
 * tests/test_challenger2_user_journey_adversarial.js
 *
 * Empirical Challenger 2 Adversarial User Journey Verification Harness.
 * Tests complete user lifecycle, in-app modal rendering across all 20 products,
 * CTA partner tag links, diagnostic unlocks, unblurring, reload persistence,
 * and multi-tab StorageEvent synchronization.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');
const CATALOG_PATH = path.join(ROOT_DIR, 'src', 'data', 'curation-catalog.json');

const COUPANG_TAG = 'AF7865143';
const IHERB_TAG = 'IPZ1547';
const CPA_TAG = 'A100708867';

const REQUIRED_MEMBERSHIP_NOTICE = '스토어 이용 고객 전용 무료 멤버십 혜택: 관심 육아템의 상세정보 및 공식 판매처를 1회 이상 확인하시면 4대 정밀 진단이 즉시 무료로 오픈됩니다';
const REQUIRED_MODAL_CTA_TEXT = '공식 판매처 보러가기 (+ 1:1 발달·성장 정밀진단 무료 오픈)';
const EXPECTED_DIAGNOSTIC_TESTS = ['growth', 'precocious_puberty', 'brain_development', 'temperament_learning'];

class MockStorage {
  constructor(shouldThrow = false) {
    this.store = {};
    this.shouldThrow = shouldThrow;
  }
  getItem(k) {
    if (this.shouldThrow) throw new Error('SecurityError: The operation is insecure.');
    return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null;
  }
  setItem(k, v) {
    if (this.shouldThrow) throw new Error('QuotaExceededError: DOM Exception 22');
    this.store[k] = String(v);
  }
  removeItem(k) {
    if (this.shouldThrow) throw new Error('SecurityError');
    delete this.store[k];
  }
  clear() {
    this.store = {};
  }
}

function createDOMElement(id, tagName = 'div') {
  return {
    id,
    tagName: tagName.toUpperCase(),
    style: {},
    classList: {
      classes: new Set(),
      add: function(c) { this.classes.add(c); },
      remove: function(c) { this.classes.delete(c); },
      contains: function(c) { return this.classes.has(c); }
    },
    attributes: {},
    setAttribute: function(k, v) { this.attributes[k] = String(v); if (k === 'href') this.href = String(v); },
    getAttribute: function(k) { return this.attributes[k] || (k === 'href' ? this.href : null); },
    innerHTML: '',
    textContent: '',
    src: '',
    alt: '',
    href: '',
    scrollIntoView: function() {},
    querySelector: function(sel) { return null; },
    querySelectorAll: function(sel) { return []; },
    closest: function(sel) { return null; }
  };
}

function createSimulatedBrowserEnv(options = {}) {
  const localStorage = new MockStorage(options.throwStorage || false);
  const sessionStorage = new MockStorage(options.throwStorage || false);

  const elements = {
    'master-briefing-card': createDOMElement('master-briefing-card'),
    'kf-unlock-gate-locked-view': createDOMElement('kf-unlock-gate-locked-view'),
    'kf-unlock-gate-unlocked-view': createDOMElement('kf-unlock-gate-unlocked-view'),
    'quiz-section': createDOMElement('quiz-section'),
    'kf-product-detail-modal': createDOMElement('kf-product-detail-modal'),
    'kf-modal-cta-btn': createDOMElement('kf-modal-cta-btn', 'a'),
    'kf-modal-product-img': createDOMElement('kf-modal-product-img', 'img'),
    'kf-modal-product-title': createDOMElement('kf-modal-product-title', 'h2'),
    'kf-modal-product-stage': createDOMElement('kf-modal-product-stage', 'span'),
    'kf-modal-product-category': createDOMElement('kf-modal-product-category', 'span'),
    'kf-modal-product-rating': createDOMElement('kf-modal-product-rating', 'span'),
    'kf-modal-product-price': createDOMElement('kf-modal-product-price', 'span'),
    'kf-modal-specs-list': createDOMElement('kf-modal-specs-list', 'ul'),
    'kf-modal-why-picked-list': createDOMElement('kf-modal-why-picked-list', 'div'),
    'kf-modal-guide-pros': createDOMElement('kf-modal-guide-pros', 'p'),
    'kf-modal-guide-considerations': createDOMElement('kf-modal-guide-considerations', 'p'),
    'kf-modal-guide-recommended-baby': createDOMElement('kf-modal-guide-recommended-baby', 'p'),
    'kf-modal-reviews-list': createDOMElement('kf-modal-reviews-list', 'div')
  };

  const openedWindows = [];
  const telemetryCalls = [];
  const listeners = {};

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
    location: { hostname: 'kidsfit.co.kr', search: '' },
    open: function(url, target, features) {
      openedWindows.push({ url, target, features });
      return { closed: false, close: () => {} };
    },
    fetch: function(url, opts) {
      telemetryCalls.push({ url, options: opts });
      if (options.failFetch) {
        return Promise.reject(new Error('NetworkError: Connection refused or offline'));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'ok' }) });
    },
    document: {
      elements,
      getElementById: function(id) {
        return elements[id] || null;
      },
      querySelectorAll: function(sel) {
        return [];
      },
      querySelector: function(sel) {
        if (sel === '#kf-product-detail-modal') return elements['kf-product-detail-modal'];
        if (sel === '#kf-modal-cta-btn') return elements['kf-modal-cta-btn'];
        return null;
      },
      addEventListener: function(event, handler) {
        listeners[event] = listeners[event] || [];
        listeners[event].push(handler);
      },
      dispatchEvent: function(event) {
        if (listeners[event.type]) {
          listeners[event.type].forEach(fn => fn(event));
        }
      }
    },
    addEventListener: function(event, handler) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    },
    dispatchEvent: function(event) {
      if (listeners[event.type]) {
        listeners[event.type].forEach(fn => fn(event));
      }
    }
  };

  sandbox.window = sandbox;
  const context = vm.createContext(sandbox);

  // Load client scripts from index.html
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const code = match[1];
    if (code.includes('unlockKidsFitDiagnosticTests') || code.includes('openKidsFitProductModal')) {
      try {
        vm.runInContext(code, context);
      } catch (err) {
        console.error('Error running script:', err.message);
      }
    }
  }

  return { sandbox, context, localStorage, sessionStorage, elements, openedWindows, telemetryCalls, listeners };
}

function runAdversarialUserJourneyVerification() {
  console.log('================================================================================');
  console.log(' CHALLENGER 2: ADVERSARIAL USER JOURNEY & LIFECYCLE VERIFICATION');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function runTest(name, fn) {
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (e) {
      console.log(`[FAIL] ${name}`);
      console.log(`       -> ${e.message}`);
      failed++;
    }
  }

  // --- 1. Fresh Visitor State ---
  runTest('1.1 Fresh visitor: Initial visit has diagnostic tests locked and isKidsFitDiagnosticUnlocked() === false', () => {
    const env = createSimulatedBrowserEnv();
    assert.strictEqual(env.sandbox.isKidsFitDiagnosticUnlocked(), false, 'Fresh visitor must have locked state');
  });

  runTest('1.2 Fresh visitor: index.html contains exact mandatory membership notice text', () => {
    const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
    assert(html.includes(REQUIRED_MEMBERSHIP_NOTICE), `index.html must contain exact membership notice: ${REQUIRED_MEMBERSHIP_NOTICE}`);
  });

  runTest('1.3 Fresh visitor: applyKidsFitReportLockState displays locked gate and hides unlocked gate', () => {
    const env = createSimulatedBrowserEnv();
    env.sandbox.applyKidsFitReportLockState();
    assert.strictEqual(env.elements['kf-unlock-gate-locked-view'].style.display, 'block');
    assert.strictEqual(env.elements['kf-unlock-gate-unlocked-view'].style.display, 'none');
  });

  runTest('1.4 Fresh visitor: applyKidsFitReportLockState blurs #master-briefing-card', () => {
    const env = createSimulatedBrowserEnv();
    env.sandbox.applyKidsFitReportLockState();
    const briefingFilter = env.elements['master-briefing-card'].style.filter;
    assert(briefingFilter && briefingFilter.includes('blur'), `master-briefing-card must have blur filter, got '${briefingFilter}'`);
  });

  // --- 2. In-App Product Detail Modal Across All 20 Products ---
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const products = catalog.parentingProducts || [];

  runTest('2.1 Catalog integrity: exactly 20 curated parenting products exist', () => {
    assert.strictEqual(products.length, 20, `Catalog must have 20 products, got ${products.length}`);
  });

  runTest('2.2 In-app modal opens in-page without navigating off-site for all 20 products', () => {
    const env = createSimulatedBrowserEnv();
    for (const prod of products) {
      // Simulate click
      env.sandbox.openKidsFitProductModal(prod.id);
      assert.strictEqual(env.elements['kf-product-detail-modal'].style.display, 'block', `Modal did not open for product ${prod.id}`);
      assert.strictEqual(env.openedWindows.length, 0, `Opening modal for ${prod.id} must NOT open new window / bounce off-site`);
    }
  });

  runTest('2.3 In-app modal renders real image, specs (>=3), 3 Why We Picked points, buying guide, and reviews (>=2) across ALL 20 products', () => {
    const env = createSimulatedBrowserEnv();
    for (const prod of products) {
      env.sandbox.openKidsFitProductModal(prod.id);

      // Verify title
      assert.strictEqual(env.elements['kf-modal-product-title'].textContent, prod.name, `Title mismatch for ${prod.id}`);

      // Verify real image
      assert.strictEqual(env.elements['kf-modal-product-img'].src, prod.image, `Image src mismatch for ${prod.id}`);
      assert(fs.existsSync(path.join(ROOT_DIR, prod.image)), `Image file does not exist on disk: ${prod.image}`);
      assert(fs.statSync(path.join(ROOT_DIR, prod.image)).size > 0, `Image file is empty: ${prod.image}`);

      // Verify specs
      const specsHtml = env.elements['kf-modal-specs-list'].innerHTML;
      assert(prod.specs && prod.specs.length >= 3, `Product ${prod.id} must have >= 3 specs`);
      for (const spec of prod.specs) {
        assert(specsHtml.includes(spec), `Modal specs HTML missing spec for ${prod.id}: ${spec}`);
      }

      // Verify 3 Why We Picked points
      const whyHtml = env.elements['kf-modal-why-picked-list'].innerHTML;
      assert(prod.whyWePicked && prod.whyWePicked.length === 3, `Product ${prod.id} must have exactly 3 whyWePicked points`);
      for (const pt of prod.whyWePicked) {
        assert(whyHtml.includes(pt), `Modal why-picked HTML missing point for ${prod.id}: ${pt}`);
      }

      // Verify buying guide
      assert(prod.buyingGuide, `Product ${prod.id} missing buyingGuide`);
      assert.strictEqual(env.elements['kf-modal-guide-pros'].textContent, prod.buyingGuide.pros, `Pros mismatch for ${prod.id}`);
      assert.strictEqual(env.elements['kf-modal-guide-considerations'].textContent, prod.buyingGuide.considerations, `Considerations mismatch for ${prod.id}`);
      assert.strictEqual(env.elements['kf-modal-guide-recommended-baby'].textContent, prod.buyingGuide.recommendedBaby, `RecommendedBaby mismatch for ${prod.id}`);

      // Verify reviews
      const reviewsHtml = env.elements['kf-modal-reviews-list'].innerHTML;
      assert(prod.momReviews && prod.momReviews.length >= 2, `Product ${prod.id} must have >= 2 momReviews`);
      for (const rev of prod.momReviews) {
        assert(reviewsHtml.includes(rev), `Modal reviews HTML missing review for ${prod.id}: ${rev}`);
      }
    }
  });

  // --- 3. Modal CTA Click & Partner Affiliate Links ---
  runTest('3.1 Modal CTA button configures correct partner affiliate links (AF7865143, IPZ1547, A100708867) across all 20 products', () => {
    const env = createSimulatedBrowserEnv();
    for (const prod of products) {
      env.sandbox.openKidsFitProductModal(prod.id);
      const ctaBtn = env.elements['kf-modal-cta-btn'];
      assert.strictEqual(ctaBtn.href, prod.url, `CTA href mismatch for ${prod.id}`);

      if (prod.platform === 'coupang') {
        assert(ctaBtn.href.includes(`lptag=${COUPANG_TAG}`), `Coupang CTA missing lptag=${COUPANG_TAG}: ${ctaBtn.href}`);
      } else if (prod.platform === 'iherb') {
        assert(ctaBtn.href.includes(`rcode=${IHERB_TAG}`), `iHerb CTA missing rcode=${IHERB_TAG}: ${ctaBtn.href}`);
      } else if (prod.platform === 'cpa') {
        assert(ctaBtn.href.includes(CPA_TAG), `CPA CTA missing tag=${CPA_TAG}: ${ctaBtn.href}`);
      }
    }
  });

  runTest('3.2 Modal CTA click opens partner link in new tab (_blank)', () => {
    const env = createSimulatedBrowserEnv();
    env.sandbox.openKidsFitProductModal('prod_nb_nut_1');
    env.sandbox.handleKidsFitModalCtaClick('prod_nb_nut_1');

    assert.strictEqual(env.openedWindows.length, 1, 'Expected 1 window to be opened');
    assert.strictEqual(env.openedWindows[0].target, '_blank', 'Must open in _blank tab');
    assert(env.openedWindows[0].url.includes(IHERB_TAG), 'Must open iHerb URL with IPZ1547');
  });

  runTest('3.3 Modal CTA click unlocks all 4 diagnostic tests immediately in localStorage and sessionStorage without paywall', () => {
    const env = createSimulatedBrowserEnv();
    env.sandbox.handleKidsFitModalCtaClick('prod_nb_gear_1');

    assert.strictEqual(env.sandbox.isKidsFitDiagnosticUnlocked(), true, 'Must report unlocked=true');
    assert.strictEqual(env.localStorage.getItem('kidsfit_diagnostic_unlocked'), 'true');
    assert.strictEqual(env.localStorage.getItem('kf_report_unlocked'), '1');
    assert.strictEqual(env.sessionStorage.getItem('kf_report_unlocked'), '1');

    const tickets = JSON.parse(env.localStorage.getItem('kidsfit_free_tickets'));
    assert.strictEqual(tickets.unlocked, true);
    for (const t of EXPECTED_DIAGNOSTIC_TESTS) {
      assert(tickets.tickets[t], `Ticket for ${t} missing`);
      assert.strictEqual(tickets.tickets[t].unlocked, true, `Ticket for ${t} must be unlocked`);
    }
  });

  runTest('3.4 Modal CTA click unblurs #master-briefing-card and displays unlocked gate', () => {
    const env = createSimulatedBrowserEnv();
    env.sandbox.applyKidsFitReportLockState(); // initial locked
    assert(env.elements['master-briefing-card'].style.filter.includes('blur'));

    env.sandbox.handleKidsFitModalCtaClick('prod_nb_nut_1');
    assert.strictEqual(env.elements['master-briefing-card'].style.filter, 'none', 'Briefing card blur must be removed');
    assert.strictEqual(env.elements['kf-unlock-gate-locked-view'].style.display, 'none');
    assert.strictEqual(env.elements['kf-unlock-gate-unlocked-view'].style.display, 'flex');
  });

  runTest('3.5 Diagnostic test launchers execute studio wizard transitions without paywall barriers', () => {
    const env = createSimulatedBrowserEnv();
    env.sandbox.handleKidsFitModalCtaClick('prod_nb_nut_1');

    const launches = [];
    env.sandbox.TallerOnboardingWizard = {
      enterStudioMode: (audience, mode) => launches.push({ audience, mode }),
      goToStep: (step) => launches.push({ step })
    };

    for (const t of EXPECTED_DIAGNOSTIC_TESTS) {
      env.sandbox.launchKidsFitDiagnosticTest(t);
    }
    assert.strictEqual(launches.length, 6, 'All 4 tests must trigger clean wizard studio transitions');
  });

  // --- 4. Session Persistence & Multi-Tab Synchronization ---
  runTest('4.1 Session persistence: Unlocked state persists across full page reload', () => {
    const env1 = createSimulatedBrowserEnv();
    env1.sandbox.handleKidsFitModalCtaClick('prod_nb_nut_1');

    // Simulate page reload
    const envReload = createSimulatedBrowserEnv();
    Object.assign(envReload.localStorage.store, env1.localStorage.store);
    Object.assign(envReload.sessionStorage.store, env1.sessionStorage.store);

    assert.strictEqual(envReload.sandbox.isKidsFitDiagnosticUnlocked(), true, 'Must remain unlocked across reload');
    envReload.sandbox.applyKidsFitReportLockState();
    assert.strictEqual(envReload.elements['master-briefing-card'].style.filter, 'none');
    assert.strictEqual(envReload.elements['kf-unlock-gate-locked-view'].style.display, 'none');
    assert.strictEqual(envReload.elements['kf-unlock-gate-unlocked-view'].style.display, 'flex');
  });

  runTest('4.2 Multi-tab synchronization: Sibling tab dynamically unblurs and unlocks via StorageEvent', () => {
    const envTabA = createSimulatedBrowserEnv();
    const envTabB = createSimulatedBrowserEnv();

    envTabB.sandbox.applyKidsFitReportLockState();
    assert.strictEqual(envTabB.sandbox.isKidsFitDiagnosticUnlocked(), false);
    assert(envTabB.elements['master-briefing-card'].style.filter.includes('blur'));

    // Tab A triggers unlock
    envTabA.sandbox.handleKidsFitModalCtaClick('prod_nb_nut_1');

    // StorageEvent propagates to Tab B
    envTabB.localStorage.store['kidsfit_diagnostic_unlocked'] = 'true';
    envTabB.localStorage.store['kf_report_unlocked'] = '1';
    envTabB.sandbox.dispatchEvent({ type: 'storage', key: 'kidsfit_diagnostic_unlocked' });

    assert.strictEqual(envTabB.sandbox.isKidsFitDiagnosticUnlocked(), true, 'Tab B must unlock dynamically');
    assert.strictEqual(envTabB.elements['master-briefing-card'].style.filter, 'none', 'Tab B briefing card blur must be removed');
    assert.strictEqual(envTabB.elements['kf-unlock-gate-locked-view'].style.display, 'none');
    assert.strictEqual(envTabB.elements['kf-unlock-gate-unlocked-view'].style.display, 'flex');
  });

  // --- 5. Adversarial Edge Cases & Stress Resilience ---
  runTest('5.1 Adversarial: Modal close button properly hides modal (display: none)', () => {
    const env = createSimulatedBrowserEnv();
    env.sandbox.openKidsFitProductModal('prod_nb_nut_1');
    assert.strictEqual(env.elements['kf-product-detail-modal'].style.display, 'block');
    env.sandbox.closeKidsFitProductModal();
    assert.strictEqual(env.elements['kf-product-detail-modal'].style.display, 'none');
  });

  runTest('5.2 Adversarial: Unknown, null, or empty product IDs handled gracefully without throwing', () => {
    const env = createSimulatedBrowserEnv();
    assert.doesNotThrow(() => env.sandbox.openKidsFitProductModal('non_existent_id_999'));
    assert.doesNotThrow(() => env.sandbox.openKidsFitProductModal(null));
    assert.doesNotThrow(() => env.sandbox.openKidsFitProductModal(undefined));
    assert.doesNotThrow(() => env.sandbox.openKidsFitProductModal(''));
  });

  runTest('5.3 Adversarial: Safari private browsing (Storage throws QuotaExceededError or SecurityError) handled via in-memory fallback', () => {
    const env = createSimulatedBrowserEnv({ throwStorage: true });
    let res;
    assert.doesNotThrow(() => {
      res = env.sandbox.unlockKidsFitDiagnosticTests('사파리 프라이빗 모드 테스트', 'Coupang', 'https://coupang.com');
    });
    assert.strictEqual(res.unlocked, true);
    assert.strictEqual(env.sandbox.isKidsFitDiagnosticUnlocked(), true, 'Must fall back to in-memory store');
  });

  runTest('5.4 Adversarial: Rapid double clicks within 150ms debounced properly', () => {
    const env = createSimulatedBrowserEnv();
    const r1 = env.sandbox.unlockKidsFitDiagnosticTests('클릭1', 'Coupang', 'https://coupang.com');
    const r2 = env.sandbox.unlockKidsFitDiagnosticTests('클릭2', 'Coupang', 'https://coupang.com');
    assert.strictEqual(r1.status, 'SUCCESS');
    assert.strictEqual(r2.status, 'DEBOUNCED');
  });

  runTest('5.5 Adversarial: Telemetry network failure does not block unlock or throw errors', () => {
    const env = createSimulatedBrowserEnv({ failFetch: true });
    let res;
    assert.doesNotThrow(() => {
      res = env.sandbox.unlockKidsFitDiagnosticTests('오프라인 테스트', 'iHerb', 'https://iherb.com');
    });
    assert.strictEqual(res.status, 'SUCCESS');
    assert.strictEqual(res.unlocked, true);
  });

  runTest('5.6 Adversarial: Rapid cyclic and reverse switching across all 20 products maintains modal consistency', () => {
    const env = createSimulatedBrowserEnv();
    // Forward cycle
    for (let i = 0; i < products.length; i++) {
      env.sandbox.openKidsFitProductModal(products[i].id);
      assert.strictEqual(env.elements['kf-modal-product-title'].textContent, products[i].name);
    }
    // Backward cycle
    for (let i = products.length - 1; i >= 0; i--) {
      env.sandbox.openKidsFitProductModal(products[i].id);
      assert.strictEqual(env.elements['kf-modal-product-title'].textContent, products[i].name);
    }
  });

  console.log('\n================================================================================');
  console.log(` RESULTS: ${passed} Passed | ${failed} Failed`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAdversarialUserJourneyVerification();
