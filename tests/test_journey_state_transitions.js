/**
 * tests/test_journey_state_transitions.js
 * Empirical simulation of full user journey, unlock state transitions, and adversarial edge cases.
 */

const fs = require('fs');
const assert = require('assert');

// 1. Mock Browser Environment
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

function createBrowserEnv(options = {}) {
  const localStorage = new MockStorage(options.throwStorage || false);
  const sessionStorage = new MockStorage(options.throwStorage || false);

  const elements = {
    'master-briefing-card': { style: { filter: '', maxHeight: '', overflow: '' }, scrollIntoView: () => {} },
    'kf-unlock-gate-locked-view': { style: { display: '' } },
    'kf-unlock-gate-unlocked-view': { style: { display: '' } },
    'quiz-section': { style: { display: 'none' }, scrollIntoView: () => {} }
  };

  const document = {
    elements,
    getElementById: function(id) {
      return this.elements[id] || null;
    },
    querySelectorAll: function(sel) {
      return [];
    },
    addEventListener: function(event, handler) {
      this.listeners = this.listeners || {};
      this.listeners[event] = this.listeners[event] || [];
      this.listeners[event].push(handler);
    },
    dispatchEvent: function(event) {
      if (this.listeners && this.listeners[event.type]) {
        this.listeners[event.type].forEach(fn => fn(event));
      }
    }
  };

  const window = {
    localStorage,
    sessionStorage,
    document,
    location: { hostname: 'kidsfit.co.kr', search: '' },
    __kidsfitInMemoryStore: {},
    fetchCalls: [],
    fetch: function(url, opts) {
      this.fetchCalls.push({ url, options: opts });
      if (options.failFetch) {
        return Promise.reject(new Error('NetworkError: Connection refused or offline'));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'ok' }) });
    },
    addEventListener: function(event, handler) {
      this.listeners = this.listeners || {};
      this.listeners[event] = this.listeners[event] || [];
      this.listeners[event].push(handler);
    },
    dispatchEvent: function(event) {
      if (this.listeners && this.listeners[event.type]) {
        this.listeners[event.type].forEach(fn => fn(event));
      }
    }
  };

  return { window, document, localStorage, sessionStorage, elements };
}

// 2. Load implementation from index.html
const indexHtml = fs.readFileSync('index.html', 'utf8');

function injectIndexScripts(env) {
  const { window, document } = env;

  const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
  let match;
  let clientScript = '';
  while ((match = scriptRegex.exec(indexHtml)) !== null) {
    if (match[1].includes('unlockKidsFitDiagnosticTests') || match[1].includes('isKidsFitDiagnosticUnlocked')) {
      clientScript = match[1];
      break;
    }
  }

  assert(clientScript.length > 0, 'Could not find client script block in index.html');

  const fn = new Function('window', 'document', 'localStorage', 'sessionStorage', 'navigator', clientScript);
  fn(window, document, window.localStorage, window.sessionStorage, { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
}

function runSuite() {
  console.log('=== Running Empirical User Journey & State Transition Suite ===\n');

  // Test Case 1: Initial Locked State
  console.log('[Test 1] Verifying Initial Locked State...');
  const env1 = createBrowserEnv();
  injectIndexScripts(env1);

  assert.strictEqual(env1.window.isKidsFitDiagnosticUnlocked(), false, 'Initial state must be locked');
  env1.window.applyKidsFitReportLockState();

  assert.strictEqual(env1.elements['kf-unlock-gate-locked-view'].style.display, 'block', 'Locked view must be displayed');
  assert.strictEqual(env1.elements['kf-unlock-gate-unlocked-view'].style.display, 'none', 'Unlocked view must be hidden');
  assert(env1.elements['master-briefing-card'].style.filter.includes('blur'), 'Master briefing card must be blurred');
  console.log(' -> PASSED: Initial locked view and blurred card confirmed.');

  // Test Case 2: Click Affiliate Product -> Trigger Unlock
  console.log('\n[Test 2] Clicking Affiliate Product Card & Storage Mutation...');
  const testProduct = '[쿠팡 로켓와우] 스마트 온습도계 & 수유 무드등';
  const testNetwork = 'Coupang Partners (AF7865143)';
  const testHref = 'https://www.coupang.com/np/search?q=%EC%98%A8%EC%8A%B5%EB%8F%84%EA%B3%84&lptag=AF7865143';

  const unlockRes = env1.window.unlockKidsFitDiagnosticTests(testProduct, testNetwork, testHref);
  assert.strictEqual(unlockRes.status, 'SUCCESS', 'Unlock result status must be SUCCESS');
  assert.strictEqual(unlockRes.unlocked, true, 'Unlock result unlocked must be true');

  // Verify LocalStorage keys
  assert.strictEqual(env1.localStorage.getItem('kidsfit_diagnostic_unlocked'), 'true');
  assert.strictEqual(env1.localStorage.getItem('kf_report_unlocked'), '1');
  assert.strictEqual(env1.sessionStorage.getItem('kf_report_unlocked'), '1');

  const rawTickets = env1.localStorage.getItem('kidsfit_free_tickets');
  assert(rawTickets, 'kidsfit_free_tickets must be stored in localStorage');
  const ticketsPayload = JSON.parse(rawTickets);
  assert.strictEqual(ticketsPayload.unlocked, true);
  assert.strictEqual(ticketsPayload.triggerItem, testProduct);
  assert.strictEqual(ticketsPayload.triggerNetwork, testNetwork);

  const expectedTests = ['growth', 'precocious_puberty', 'brain_development', 'temperament_learning'];
  for (const t of expectedTests) {
    assert(ticketsPayload.tickets[t], `Ticket for ${t} missing`);
    assert.strictEqual(ticketsPayload.tickets[t].unlocked, true, `Ticket for ${t} must be unlocked`);
  }
  console.log(' -> PASSED: All 4 diagnostic tickets awarded in localStorage & sessionStorage.');

  // Test Case 3: Verify Unblurred UI & Unlocked Gate
  console.log('\n[Test 3] Verifying Unblurred UI & Unlocked Gate State...');
  assert.strictEqual(env1.window.isKidsFitDiagnosticUnlocked(), true, 'isKidsFitDiagnosticUnlocked must be true');
  assert.strictEqual(env1.elements['kf-unlock-gate-locked-view'].style.display, 'none', 'Locked view must be hidden');
  assert.strictEqual(env1.elements['kf-unlock-gate-unlocked-view'].style.display, 'flex', 'Unlocked view must be flex');
  assert.strictEqual(env1.elements['master-briefing-card'].style.filter, 'none', 'Master briefing card blur must be removed');
  console.log(' -> PASSED: Locked view hidden, unlocked view flex, briefing card unblurred.');

  // Test Case 4: Launching All 4 Diagnostic Tests Without Paywall
  console.log('\n[Test 4] Launching All 4 Diagnostic Tests Without Paywall...');
  const launchedModes = [];
  env1.window.TallerOnboardingWizard = {
    enterStudioMode: (audience, mode) => {
      launchedModes.push({ audience, mode });
    },
    goToStep: (step) => {
      launchedModes.push({ step });
    }
  };

  for (const t of expectedTests) {
    env1.window.launchKidsFitDiagnosticTest(t);
  }
  assert.strictEqual(launchedModes.length, 6, 'All 4 test launchers must execute wizard entry and step transitions');
  console.log(' -> PASSED: All 4 diagnostic tests (Growth, Puberty, Brain, Temperament) entered studio mode cleanly without paywall.');

  // Test Case 5: Session Persistence Across Reload
  console.log('\n[Test 5] Simulating Browser Reload (Session Persistence)...');
  const envReload = createBrowserEnv();
  Object.assign(envReload.localStorage.store, env1.localStorage.store);
  Object.assign(envReload.sessionStorage.store, env1.sessionStorage.store);

  injectIndexScripts(envReload);
  assert.strictEqual(envReload.window.isKidsFitDiagnosticUnlocked(), true, 'Must remain unlocked across page reload');
  envReload.window.applyKidsFitReportLockState();
  assert.strictEqual(envReload.elements['kf-unlock-gate-locked-view'].style.display, 'none');
  assert.strictEqual(envReload.elements['kf-unlock-gate-unlocked-view'].style.display, 'flex');
  assert.strictEqual(envReload.elements['master-briefing-card'].style.filter, 'none');
  console.log(' -> PASSED: Unlocked state persists cleanly across page refresh.');

  // Test Case 6: Multi-Tab Storage Event Synchronization
  console.log('\n[Test 6] Multi-Tab Storage Event Synchronization...');
  const envTabB = createBrowserEnv();
  injectIndexScripts(envTabB);
  assert.strictEqual(envTabB.window.isKidsFitDiagnosticUnlocked(), false, 'Tab B initially locked');

  envTabB.localStorage.store['kidsfit_diagnostic_unlocked'] = 'true';
  envTabB.localStorage.store['kf_report_unlocked'] = '1';
  envTabB.window.dispatchEvent({ type: 'storage', key: 'kidsfit_diagnostic_unlocked' });

  assert.strictEqual(envTabB.window.isKidsFitDiagnosticUnlocked(), true, 'Tab B must unlock upon storage event');
  assert.strictEqual(envTabB.elements['kf-unlock-gate-locked-view'].style.display, 'none');
  assert.strictEqual(envTabB.elements['kf-unlock-gate-unlocked-view'].style.display, 'flex');
  console.log(' -> PASSED: Tab B synchronized and unlocked via StorageEvent.');

  // Test Case 7: Telemetry Event Logging
  console.log('\n[Test 7] Checking Telemetry /api/visit Payload...');
  const unlockFetchCalls = env1.window.fetchCalls.filter(c => c.url === '/api/visit');
  assert.strictEqual(unlockFetchCalls.length, 1, 'Expected 1 /api/visit telemetry call on unlock');
  const body = JSON.parse(unlockFetchCalls[0].options.body);
  assert.strictEqual(body.event, 'diagnostic_test_unlock');
  assert.strictEqual(body.trigger_item, testProduct);
  assert.strictEqual(body.affiliate_network, testNetwork);
  assert.deepStrictEqual(body.unlocked_tests, expectedTests);
  console.log(' -> PASSED: Telemetry event formatted strictly according to Contract 3.');

  // Test Case 8: Adversarial Safari Private Browsing (Storage Exception Fallback)
  console.log('\n[Test 8] Adversarial Stress: Safari Private Mode (Storage Throws)...');
  const envSafari = createBrowserEnv({ throwStorage: true });
  injectIndexScripts(envSafari);

  let safariResult;
  assert.doesNotThrow(() => {
    safariResult = envSafari.window.unlockKidsFitDiagnosticTests('사파리 프라이빗 테스트', 'Coupang', 'https://coupang.com');
  }, 'Unlock must not throw even if storage throws QuotaExceededError or SecurityError');

  assert.strictEqual(safariResult.unlocked, true, 'Must still unlock via in-memory store');
  assert.strictEqual(envSafari.window.isKidsFitDiagnosticUnlocked(), true, 'In-memory fallback must report unlocked=true');
  console.log(' -> PASSED: Safari private browsing storage error gracefully handled in memory.');

  // Test Case 9: Adversarial Corrupted JSON Recovery in Storage
  console.log('\n[Test 9] Adversarial Stress: Corrupted JSON Recovery in Storage...');
  const envCorrupt = createBrowserEnv();
  envCorrupt.localStorage.store['kidsfit_diagnostic_unlocked'] = 'true';
  envCorrupt.localStorage.store['kidsfit_free_tickets'] = '{truncated_broken_json...';
  injectIndexScripts(envCorrupt);

  assert.doesNotThrow(() => {
    const isUnlocked = envCorrupt.window.isKidsFitDiagnosticUnlocked();
    assert.strictEqual(isUnlocked, true, 'Must fall back gracefully to true via boolean key');
  }, 'Corrupted JSON must not throw syntax error');
  console.log(' -> PASSED: Corrupted JSON in localStorage recovered without parser crash.');

  // Test Case 10: Adversarial Rapid Debouncing
  console.log('\n[Test 10] Adversarial Stress: Rapid Double-Click Debouncing...');
  const envDebounce = createBrowserEnv();
  injectIndexScripts(envDebounce);

  const click1 = envDebounce.window.unlockKidsFitDiagnosticTests('연속클릭 제품', 'Coupang', 'https://coupang.com');
  const click2 = envDebounce.window.unlockKidsFitDiagnosticTests('연속클릭 제품', 'Coupang', 'https://coupang.com');

  assert.strictEqual(click1.status, 'SUCCESS', 'First click must be SUCCESS');
  assert.strictEqual(click2.status, 'DEBOUNCED', 'Second immediate click must be DEBOUNCED');
  console.log(' -> PASSED: Rapid click debouncing prevents duplicate redundant events.');

  // Test Case 11: Adversarial Telemetry Offline Resilience
  console.log('\n[Test 11] Adversarial Stress: Telemetry Network Offline / 500 Failure...');
  const envOffline = createBrowserEnv({ failFetch: true });
  injectIndexScripts(envOffline);

  let offlineResult;
  assert.doesNotThrow(() => {
    offlineResult = envOffline.window.unlockKidsFitDiagnosticTests('오프라인 제품', 'iHerb', 'https://iherb.com');
  }, 'Fetch failure must be caught silently without stalling execution');

  assert.strictEqual(offlineResult.status, 'SUCCESS');
  assert.strictEqual(offlineResult.unlocked, true);
  console.log(' -> PASSED: Telemetry failure handled gracefully without blocking unlock.');

  console.log('\n========================================================================');
  console.log(' ALL 11 EMPIRICAL USER JOURNEY & ADVERSARIAL STRESS TESTS PASSED (100%) ');
  console.log('========================================================================\n');
}

runSuite();
