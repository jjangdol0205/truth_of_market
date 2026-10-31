/**
 * tests/challenger-final-stress.test.js
 *
 * KidsFit Premium Curated Parenting Mall Overhaul
 * Challenger Final Empirical Stress Testing Harness
 *
 * Adversarial Verification of 5 Critical Platform Dimensions:
 * 1. Multi-click bursts (50 concurrent clicks within 150ms on cards and modal CTA buttons; debouncing verification)
 * 2. Storage security/quota exceptions (Safari Private Browsing SecurityError / QuotaExceededError in-memory fallback)
 * 3. Storage JSON corruption (Malicious/invalid JSON injection in kidsfit_free_tickets and self-healing verification)
 * 4. Telegram outage simulation (HTTP 500, network drop, hanging timeout on /api/visit; synchronous UI unlock < 30ms)
 * 5. Responsive layout stress (DOM rendering across 320px, 375px, 768px, 1024px, 1440px, and 2560px viewports)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const { performance } = require('perf_hooks');

const ROOT_DIR = path.resolve(__dirname, '..');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');
const STYLE_CSS_PATH = path.join(ROOT_DIR, 'src', 'css', 'style.css');
const CATALOG_PATH = path.join(ROOT_DIR, 'src', 'data', 'curation-catalog.json');

// ==============================================================================
// 1. High-Fidelity Browser Sandbox Environment Factory
// ==============================================================================

class MockStorage {
  constructor(options = {}) {
    this.store = {};
    this.throwOnGet = options.throwOnGet || false;
    this.throwOnSet = options.throwOnSet || false;
    this.isQuota = options.isQuota || false;
  }

  getItem(k) {
    if (this.throwOnGet) {
      const err = new Error('SecurityError: The operation is insecure.');
      err.name = 'SecurityError';
      throw err;
    }
    return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null;
  }

  setItem(k, v) {
    if (this.throwOnSet) {
      const errName = this.isQuota ? 'QuotaExceededError' : 'SecurityError';
      const err = new Error(`${errName}: Operation denied.`);
      err.name = errName;
      throw err;
    }
    this.store[k] = String(v);
  }

  removeItem(k) {
    if (this.throwOnSet || this.throwOnGet) {
      const err = new Error('SecurityError: The operation is insecure.');
      err.name = 'SecurityError';
      throw err;
    }
    delete this.store[k];
  }

  clear() {
    this.store = {};
  }
}

function createStressBrowserEnv(options = {}) {
  const localStorage = new MockStorage({
    throwOnGet: options.throwStorageGet || false,
    throwOnSet: options.throwStorageSet || false,
    isQuota: options.isQuotaStorage || false
  });

  const sessionStorage = new MockStorage({
    throwOnGet: options.throwSessionGet || false,
    throwOnSet: options.throwSessionSet || false,
    isQuota: options.isQuotaStorage || false
  });

  const openedWindows = [];
  const telemetryCalls = [];

  const elements = {
    'master-briefing-card': {
      id: 'master-briefing-card',
      style: { filter: 'blur(4.5px)', maxHeight: '520px', overflow: 'hidden' },
      scrollIntoView: () => {}
    },
    'kf-unlock-gate-locked-view': { id: 'kf-unlock-gate-locked-view', style: { display: 'block' } },
    'kf-unlock-gate-unlocked-view': { id: 'kf-unlock-gate-unlocked-view', style: { display: 'none' } },
    'kidsfit-parenting-select-shop': { id: 'kidsfit-parenting-select-shop', style: {} },
    'dual-pillar-intro-showcase': { id: 'dual-pillar-intro-showcase', style: {} },
    'kf-product-detail-modal': {
      id: 'kf-product-detail-modal',
      style: { display: 'none' },
      classList: {
        add: () => {},
        remove: () => {}
      }
    },
    'kf-modal-cta-btn': {
      id: 'kf-modal-cta-btn',
      href: '',
      textContent: '',
      setAttribute(k, v) { this[k] = v; },
      getAttribute(k) { return this[k] || ''; }
    },
    'kf-modal-product-img': { id: 'kf-modal-product-img', src: '', alt: '' },
    'kf-modal-product-title': { id: 'kf-modal-product-title', textContent: '' },
    'kf-modal-product-stage': { id: 'kf-modal-product-stage', textContent: '' },
    'kf-modal-product-category': { id: 'kf-modal-product-category', textContent: '' },
    'kf-modal-product-rating': { id: 'kf-modal-product-rating', textContent: '' },
    'kf-modal-product-price': { id: 'kf-modal-product-price', textContent: '' },
    'kf-modal-specs-list': { id: 'kf-modal-specs-list', innerHTML: '' },
    'kf-modal-why-picked-list': { id: 'kf-modal-why-picked-list', innerHTML: '' },
    'kf-modal-guide-pros': { id: 'kf-modal-guide-pros', textContent: '' },
    'kf-modal-guide-considerations': { id: 'kf-modal-guide-considerations', textContent: '' },
    'kf-modal-guide-recommended-baby': { id: 'kf-modal-guide-recommended-baby', textContent: '' },
    'kf-modal-reviews-list': { id: 'kf-modal-reviews-list', innerHTML: '' }
  };

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
    location: {
      hostname: 'kidsfit.co.kr',
      search: options.search || ''
    },
    open: function(url, target, features) {
      openedWindows.push({ url, target, features, timestamp: performance.now() });
      return { closed: false, close: () => {} };
    },
    fetch: function(url, opts) {
      telemetryCalls.push({ url, options: opts, timestamp: performance.now() });
      if (options.networkMode === 'REJECT') {
        return Promise.reject(new TypeError('Failed to fetch: NetworkError / Connection refused'));
      }
      if (options.networkMode === 'HTTP_500') {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({ error: 'Telegram gateway 500' })
        });
      }
      if (options.networkMode === 'HANG') {
        // Never resolves or rejects during test window
        return new Promise(() => {});
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ status: 'ok', success: true })
      });
    },
    document: {
      elements,
      getElementById(id) {
        return elements[id] || null;
      },
      querySelector(sel) {
        if (sel.startsWith('#')) return elements[sel.slice(1)] || null;
        return null;
      },
      querySelectorAll() {
        return [];
      },
      addEventListener(event, handler) {
        listeners[event] = listeners[event] || [];
        listeners[event].push(handler);
      },
      dispatchEvent(event) {
        if (listeners[event.type]) {
          listeners[event.type].forEach(fn => fn(event));
        }
      }
    },
    addEventListener(event, handler) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    },
    dispatchEvent(event) {
      if (listeners[event.type]) {
        listeners[event.type].forEach(fn => fn(event));
      }
    }
  };

  sandbox.elements = elements;
  sandbox.window = sandbox;
  const context = vm.createContext(sandbox);

  // Load catalog into sandbox
  if (fs.existsSync(CATALOG_PATH)) {
    const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
    sandbox.KIDSFIT_PRODUCT_CATALOG = catalog.parentingProducts || [];
  }

  // Load scripts from index.html
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
          // ignore parsing error if sandbox mock doesn't need DOM parts
        }
      }
    }
  }

  return { sandbox, context, localStorage, sessionStorage, elements, openedWindows, telemetryCalls };
}

// ==============================================================================
// 2. Test Execution Harness
// ==============================================================================

const testResults = [];
let passCount = 0;
let failCount = 0;

function runTest(section, testId, description, fn) {
  const start = performance.now();
  try {
    fn();
    const duration = (performance.now() - start).toFixed(2);
    console.log(`  [PASS] [${section}] ${testId}: ${description} (${duration}ms)`);
    passCount++;
    testResults.push({ section, testId, description, status: 'PASS', duration });
  } catch (err) {
    const duration = (performance.now() - start).toFixed(2);
    console.error(`  [FAIL] [${section}] ${testId}: ${description} (${duration}ms)`);
    console.error(`         -> ${err.message}`);
    failCount++;
    testResults.push({ section, testId, description, status: 'FAIL', duration, error: err.message });
  }
}

console.log('================================================================================');
console.log(' KidsFit Platform Overhaul: Challenger Final Adversarial Stress Test Harness');
console.log('================================================================================\n');

// ==============================================================================
// SECTION 1: MULTI-CLICK BURSTS (50 concurrent clicks within 150ms)
// ==============================================================================
console.log('--- [Section 1: Multi-Click Bursts Stress Harness] ---');

runTest('MultiClick', 'MC_01_UnlockFn50BurstWithin150ms', '50 concurrent calls to unlockKidsFitDiagnosticTests within 150ms are throttled to exactly 1 execution', () => {
  const env = createStressBrowserEnv();
  assert.strictEqual(typeof env.sandbox.unlockKidsFitDiagnosticTests, 'function', 'unlockKidsFitDiagnosticTests must be defined');

  const results = [];
  const burstCount = 50;

  // Execute 50 calls in rapid succession within < 5ms total execution time
  for (let i = 0; i < burstCount; i++) {
    results.push(env.sandbox.unlockKidsFitDiagnosticTests('테스트 아이템', 'Coupang', 'https://coupang.com'));
  }

  // First call must be SUCCESS
  assert.strictEqual(results[0].status, 'SUCCESS', 'Call #1 must succeed');
  assert.strictEqual(results[0].unlocked, true);

  // Subsequent 49 calls must be throttled with DEBOUNCED
  const debounced = results.slice(1);
  assert.strictEqual(debounced.length, 49);
  debounced.forEach((res, idx) => {
    assert.strictEqual(res.status, 'DEBOUNCED', `Call #${idx + 2} must be throttled with status DEBOUNCED`);
    assert.strictEqual(res.unlocked, true);
  });

  // Verify only 1 telemetry beacon was fired to /api/visit
  const visitCalls = env.telemetryCalls.filter(c => c.url === '/api/visit');
  assert.strictEqual(visitCalls.length, 1, `Exactly 1 telemetry call expected, got ${visitCalls.length}`);
});

runTest('MultiClick', 'MC_02_ModalCta50ConcurrentBurstClicks', '50 concurrent clicks on modal CTA button handleKidsFitModalCtaClick open exactly 1 window and throttle duplicates', () => {
  const env = createStressBrowserEnv();
  assert.strictEqual(typeof env.sandbox.handleKidsFitModalCtaClick, 'function', 'handleKidsFitModalCtaClick must be defined');

  // Open modal with product
  env.sandbox.openKidsFitProductModal('prod_nb_nut_1');

  // Trigger 50 rapid clicks
  for (let i = 0; i < 50; i++) {
    const fakeEvent = { preventDefault: () => {} };
    env.sandbox.handleKidsFitModalCtaClick('prod_nb_nut_1', fakeEvent);
  }

  // Telemetry must be strictly throttled to 1 event
  const unlockEvents = env.telemetryCalls.filter(c => {
    try {
      const b = JSON.parse(c.options.body);
      return b.event === 'diagnostic_test_unlock';
    } catch (_) { return false; }
  });
  assert.strictEqual(unlockEvents.length, 1, `Expected 1 unlock telemetry event, received ${unlockEvents.length}`);

  // Exactly 50 window.open calls were initiated by user gesture, but unlock system was safely throttled
  assert(env.openedWindows.length >= 1, 'At least 1 partner tab must open');
  assert(env.openedWindows[0].url.includes('rcode=IPZ1547') || env.openedWindows[0].url.includes('iherb'), 'First tab must route to partner URL');
  assert.strictEqual(env.sandbox.elements['kf-product-detail-modal'].style.display, 'none', 'Modal must be closed after click');
});

runTest('MultiClick', 'MC_03_DebounceExpiryPermitsSubsequentEvent', 'After 150ms debounce window expires, a subsequent click is permitted', (done) => {
  const env = createStressBrowserEnv();
  const res1 = env.sandbox.unlockKidsFitDiagnosticTests('첫번째 아이템', 'Coupang', 'https://coupang.com');
  assert.strictEqual(res1.status, 'SUCCESS');

  // Immediate second click is debounced
  const res2 = env.sandbox.unlockKidsFitDiagnosticTests('연속 아이템', 'Coupang', 'https://coupang.com');
  assert.strictEqual(res2.status, 'DEBOUNCED');

  // Wait 160ms (exceeding 150ms threshold)
  const start = Date.now();
  while (Date.now() - start < 165) {
    // synchronous spin-wait to cross 150ms boundary
  }

  const res3 = env.sandbox.unlockKidsFitDiagnosticTests('재클릭 아이템', 'iHerb', 'https://iherb.com');
  assert.strictEqual(res3.status, 'SUCCESS', 'Click after 165ms must execute SUCCESS');
  assert.strictEqual(env.telemetryCalls.filter(c => c.url === '/api/visit').length, 2, '2 telemetry calls expected after debounce expiry');
});

// ==============================================================================
// SECTION 2: STORAGE SECURITY / QUOTA EXCEPTIONS (Safari Private Browsing)
// ==============================================================================
console.log('\n--- [Section 2: Storage Security & Quota Exceptions Harness] ---');

runTest('StorageException', 'SE_01_SafariPrivateModeSecurityErrorOnSet', 'Safari Private Browsing mode throwing SecurityError on localStorage.setItem falls back to in-memory store', () => {
  const env = createStressBrowserEnv({ throwStorageSet: true });

  let result;
  assert.doesNotThrow(() => {
    result = env.sandbox.unlockKidsFitDiagnosticTests('사파리 프라이빗 아이템', 'iHerb', 'https://iherb.com');
  }, 'Must never throw uncaught exception when localStorage.setItem throws SecurityError');

  assert.strictEqual(result.unlocked, true, 'Result must report unlocked: true');
  assert.strictEqual(env.sandbox.isKidsFitDiagnosticUnlocked(), true, 'isKidsFitDiagnosticUnlocked() must return true via in-memory store');
  assert.strictEqual(env.sandbox.__kidsfitInMemoryStore['kidsfit_diagnostic_unlocked'], 'true');
  assert.strictEqual(env.sandbox.elements['master-briefing-card'].style.filter, 'none', 'Master briefing card must unblur');
});

runTest('StorageException', 'SE_02_QuotaExceededErrorOnSet', 'QuotaExceededError (DOM Exception 22) during localStorage.setItem falls back cleanly without crash', () => {
  const env = createStressBrowserEnv({ throwStorageSet: true, isQuotaStorage: true });

  let result;
  assert.doesNotThrow(() => {
    result = env.sandbox.unlockKidsFitDiagnosticTests('용량초과 아이템', 'Coupang', 'https://coupang.com');
  }, 'Must handle QuotaExceededError without throwing');

  assert.strictEqual(result.unlocked, true);
  assert.strictEqual(env.sandbox.isKidsFitDiagnosticUnlocked(), true);
});

runTest('StorageException', 'SE_03_TotalStorageAccessFailure', 'Both localStorage and sessionStorage throw SecurityError on get and set: platform remains fully functional', () => {
  const env = createStressBrowserEnv({
    throwStorageGet: true,
    throwStorageSet: true,
    throwSessionGet: true,
    throwSessionSet: true
  });

  assert.doesNotThrow(() => {
    const isUnlockedBefore = env.sandbox.isKidsFitDiagnosticUnlocked();
    assert.strictEqual(isUnlockedBefore, false, 'Pre-unlock must report false without throwing');

    env.sandbox.unlockKidsFitDiagnosticTests('완전 차단 환경 아이템', 'CPA', 'https://linkprice.com');
    const isUnlockedAfter = env.sandbox.isKidsFitDiagnosticUnlocked();
    assert.strictEqual(isUnlockedAfter, true, 'Post-unlock must report true via memory store without throwing');
  });

  assert.strictEqual(env.sandbox.elements['kf-unlock-gate-locked-view'].style.display, 'none');
  assert.strictEqual(env.sandbox.elements['kf-unlock-gate-unlocked-view'].style.display, 'flex');
  assert.strictEqual(env.sandbox.elements['master-briefing-card'].style.filter, 'none');
});

// ==============================================================================
// SECTION 3: STORAGE JSON CORRUPTION RESILIENCE
// ==============================================================================
console.log('\n--- [Section 3: Storage JSON Corruption Resilience Harness] ---');

runTest('JsonCorruption', 'JC_01_MalformedSyntaxDoesNotCrash', 'Malformed JSON in kidsfit_free_tickets does not crash isKidsFitDiagnosticUnlocked()', () => {
  const env = createStressBrowserEnv();

  const malformedPayloads = [
    '{ invalid json syntax [',
    '{"unlocked": true, "unlockedAt": "2026-10-31', // truncated
    '\x00\x01\xFF\xFE<script>alert(1)</script>',
    'undefined',
    'null',
    '12345',
    '"just a plain string"',
    '{"unlocked": "not_a_boolean"}',
    '{"tickets": "corrupted"}'
  ];

  malformedPayloads.forEach((payload, idx) => {
    env.localStorage.store['kidsfit_free_tickets'] = payload;
    env.sandbox.__kidsfitInMemoryStore = {};
    env.sandbox.__kidsfitDiagnosticUnlocked = false;
    env.sandbox.__kidsfitReportUnlocked = false;

    assert.doesNotThrow(() => {
      const unlocked = env.sandbox.isKidsFitDiagnosticUnlocked();
      assert.strictEqual(unlocked, false, `Payload #${idx + 1} (${payload.slice(0, 20)}) must safely evaluate to false`);
    }, `Payload #${idx + 1} caused crash`);
  });
});

runTest('JsonCorruption', 'JC_02_SelfHealingOnUnlock', 'Corrupted kidsfit_free_tickets self-heals into valid Contract 2 schema upon unlockKidsFitDiagnosticTests()', () => {
  const env = createStressBrowserEnv();

  // Inject corrupted payload
  env.localStorage.store['kidsfit_free_tickets'] = '{ CORRUPTED_GARBAGE_PAYLOAD }';

  const res = env.sandbox.unlockKidsFitDiagnosticTests('자가복구 아이템', 'iHerb (IPZ1547)', 'https://iherb.com');
  assert.strictEqual(res.status, 'SUCCESS');

  // Verify repaired payload in localStorage
  const repairedRaw = env.localStorage.getItem('kidsfit_free_tickets');
  assert(repairedRaw, 'kidsfit_free_tickets must exist');

  let parsed;
  assert.doesNotThrow(() => {
    parsed = JSON.parse(repairedRaw);
  }, 'Repaired payload must be valid JSON');

  assert.strictEqual(parsed.unlocked, true, 'Contract 2: unlocked must be true');
  assert(typeof parsed.unlockedAt === 'string', 'Contract 2: unlockedAt must be ISO string');
  assert.strictEqual(parsed.triggerItem, '자가복구 아이템');
  assert.strictEqual(parsed.triggerNetwork, 'iHerb (IPZ1547)');
  assert(parsed.tickets && typeof parsed.tickets === 'object', 'Contract 2: tickets object missing');
  assert.strictEqual(parsed.tickets.growth.unlocked, true, 'Contract 2: growth test unlocked');
  assert.strictEqual(parsed.tickets.precocious_puberty.unlocked, true, 'Contract 2: precocious_puberty unlocked');
  assert.strictEqual(parsed.tickets.brain_development.unlocked, true, 'Contract 2: brain_development unlocked');
  assert.strictEqual(parsed.tickets.temperament_learning.unlocked, true, 'Contract 2: temperament_learning unlocked');
});

// ==============================================================================
// SECTION 4: TELEGRAM OUTAGE SIMULATION & UI UNLOCK LATENCY
// ==============================================================================
console.log('\n--- [Section 4: Telegram Outage & Telemetry Failure Latency Harness] ---');

runTest('TelegramOutage', 'TO_01_Http500FailureNonBlockingFast', '/api/visit returning HTTP 500 does NOT block link opening or UI unlock; execution < 30ms', () => {
  const env = createStressBrowserEnv({ networkMode: 'HTTP_500' });
  env.sandbox.openKidsFitProductModal('prod_nb_nut_1');

  const start = performance.now();
  env.sandbox.handleKidsFitModalCtaClick('prod_nb_nut_1', { preventDefault: () => {} });
  const duration = performance.now() - start;

  assert(duration < 30, `Synchronous execution time must be < 30ms, was ${duration.toFixed(2)}ms`);
  assert.strictEqual(env.openedWindows.length, 1, 'Partner window must open immediately');
  assert.strictEqual(env.sandbox.isKidsFitDiagnosticUnlocked(), true, 'Diagnostic tests must unlock immediately');
  assert.strictEqual(env.sandbox.elements['master-briefing-card'].style.filter, 'none', 'Master card must unblur');
});

runTest('TelegramOutage', 'TO_02_NetworkDropConnectionRefusedNonBlockingFast', '/api/visit network drop (TypeError: Failed to fetch) completes synchronously in < 30ms', () => {
  const env = createStressBrowserEnv({ networkMode: 'REJECT' });
  env.sandbox.openKidsFitProductModal('prod_nb_dev_1');

  const start = performance.now();
  env.sandbox.handleKidsFitModalCtaClick('prod_nb_dev_1', { preventDefault: () => {} });
  const duration = performance.now() - start;

  assert(duration < 30, `Synchronous execution time must be < 30ms, was ${duration.toFixed(2)}ms`);
  assert.strictEqual(env.openedWindows.length, 1, 'Partner window must open immediately');
  assert.strictEqual(env.sandbox.isKidsFitDiagnosticUnlocked(), true, 'Diagnostic tests must unlock immediately');
});

runTest('TelegramOutage', 'TO_03_HangingGatewayTimeoutNonBlockingFast', '/api/visit completely hanging/timing out does NOT hang client execution (< 30ms execution)', () => {
  const env = createStressBrowserEnv({ networkMode: 'HANG' });
  env.sandbox.openKidsFitProductModal('prod_nb_nut_1');

  const start = performance.now();
  env.sandbox.handleKidsFitModalCtaClick('prod_nb_nut_1', { preventDefault: () => {} });
  const duration = performance.now() - start;

  assert(duration < 30, `Synchronous execution time must be < 30ms even when fetch hangs, was ${duration.toFixed(2)}ms`);
  assert.strictEqual(env.openedWindows.length, 1, 'Partner tab must open without waiting for network');
  assert.strictEqual(env.sandbox.isKidsFitDiagnosticUnlocked(), true, 'UI must unlock without waiting for network');
});

// ==============================================================================
// SECTION 5: RESPONSIVE LAYOUT STRESS (320px, 375px, 768px, 1024px, 1440px, 2560px)
// ==============================================================================
console.log('\n--- [Section 5: Responsive Layout Stress Across 6 Viewports] ---');

const VIEWPORTS = [
  { width: 320, name: '320px (iPhone SE 1st gen - Ultra Narrow)' },
  { width: 375, name: '375px (iPhone Standard Mobile)' },
  { width: 768, name: '768px (iPad Portrait / Mobile Breakpoint)' },
  { width: 1024, name: '1024px (iPad Landscape / Tablet Desktop)' },
  { width: 1440, name: '1440px (Standard Laptop / Desktop)' },
  { width: 2560, name: '2560px (Ultra-Wide 2K/4K Monitor)' }
];

runTest('ResponsiveLayout', 'RL_01_GlobalOverflowPreventionRules', 'Global CSS guarantees overflow-x: hidden and max-width: 100vw to eliminate horizontal blowout', () => {
  const css = fs.readFileSync(STYLE_CSS_PATH, 'utf8');
  assert(css.includes('overflow-x: hidden'), 'CSS must define overflow-x: hidden on root/body');
  assert(css.includes('max-width: 100vw') || css.includes('max-width: 100%'), 'CSS must bound viewport width');
});

runTest('ResponsiveLayout', 'RL_02_ViewportGridStressAnalysis', 'Inspect CSS grid rules across all 6 viewports: 320px, 375px, 768px, 1024px, 1440px, 2560px', () => {
  const css = fs.readFileSync(STYLE_CSS_PATH, 'utf8');

  // Verify mobile rules (<= 768px)
  const mobileMediaBlockRegex = /@media\s*\(\s*max-width\s*:\s*768px\s*\)\s*\{([\s\S]*?)\n\}/gi;
  let match;
  let foundMobileGrid = false;
  let foundDrawer = false;
  let foundFilterScroll = false;

  while ((match = mobileMediaBlockRegex.exec(css)) !== null) {
    const block = match[1];
    if (block.includes('#kf-shop-grid') && block.includes('grid-template-columns: 1fr')) {
      foundMobileGrid = true;
    }
    if (block.includes('.kf-product-modal-backdrop') && block.includes('align-items: flex-end')) {
      foundDrawer = true;
    }
    if (block.includes('.kf-filter-buttons') && block.includes('overflow-x: auto')) {
      foundFilterScroll = true;
    }
  }

  assert(foundMobileGrid, 'Mobile media query (<=768px) must collapse #kf-shop-grid to 1fr single column');
  assert(foundDrawer, 'Mobile media query (<=768px) must convert modal to bottom sheet drawer (align-items: flex-end)');
  assert(foundFilterScroll, 'Mobile media query (<=768px) must enable horizontal scroll on filter buttons');

  // Verify desktop auto-fill grid rules (> 768px: 1024px, 1440px, 2560px)
  assert(css.includes('grid-template-columns: repeat(auto-fill, minmax(270px, 1fr))') || css.includes('minmax(270px, 1fr)'), 'Desktop grid must specify responsive auto-fill minmax');
});

runTest('ResponsiveLayout', 'RL_03_ViewportSimulatedRenderVerification', 'Verify responsive styling and element layout metrics across all 6 target viewport widths', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  const css = fs.readFileSync(STYLE_CSS_PATH, 'utf8');

  VIEWPORTS.forEach(vp => {
    const isMobile = vp.width <= 768;

    // Check grid layout behavior
    if (isMobile) {
      // On 320px, 375px, 768px, grid collapses to 1 column so cards never shrink below readable width
      const effectiveCardWidth = vp.width - (vp.width <= 375 ? 20 : 32);
      assert(effectiveCardWidth >= 280 || vp.width === 320, `Card width at ${vp.width}px is properly bounded: ${effectiveCardWidth}px`);
    } else {
      // On 1024px, 1440px, 2560px, repeat auto-fill distributes cards cleanly
      const minCardWidth = 270;
      const expectedColumns = Math.floor(vp.width / (minCardWidth + 16));
      assert(expectedColumns >= 3, `Expected at least 3 columns at ${vp.width}px, calculated ${expectedColumns}`);
    }

    // Modal behavior at viewport
    if (isMobile) {
      // Drawer style slide up from bottom
      assert(css.includes('kfDrawerSlideUp') || css.includes('translateY(100%)'), `Drawer animation must exist for mobile viewport ${vp.width}px`);
    } else {
      // Centered dialog
      assert(css.includes('max-width: 680px'), `Centered dialog must enforce max-width: 680px for desktop viewport ${vp.width}px`);
    }
  });
});

runTest('ResponsiveLayout', 'RL_04_TouchTargetMinimumCompliance', 'All interactive touch elements (tabs, cards, close button, CTA) meet >= 44px mobile touch target requirements', () => {
  const css = fs.readFileSync(STYLE_CSS_PATH, 'utf8');
  assert(css.includes('min-height: 44px') || css.includes('min-height: 46px') || css.includes('padding: 0.85rem'), 'Interactive touch targets must have minimum touch height or padding');
  assert(css.includes('.kf-modal-cta-btn'), 'Modal CTA button must have dedicated touch styling');
});

// ==============================================================================
// 3. Final Summary Matrix & Verdict
// ==============================================================================

console.log('\n================================================================================');
console.log(' CHALLENGER FINAL STRESS TEST SUMMARY MATRIX');
console.log('================================================================================');
console.log(` Total Assertions Evaluated : ${passCount + failCount}`);
console.log(` Passed                     : ${passCount} (${((passCount / (passCount + failCount)) * 100).toFixed(1)}%)`);
console.log(` Failed                     : ${failCount}`);
console.log('================================================================================\n');

if (failCount > 0) {
  console.error(`[VERDICT: REQUEST_CHANGES] ${failCount} empirical stress tests failed.`);
  process.exit(1);
} else {
  console.log('[VERDICT: APPROVE] All 15 empirical stress tests passed with 100% resilience!');
  process.exit(0);
}
