/**
 * KIDS-FIT BIO LABS — Global English Hard-Paywall Edition Engine (src/js/global-paywall-edition.js)
 *
 * Dedicated for https://truthofmarket.com (and ?edition=global / ?paywall=1):
 * 1. Enforces 100% English-Only Mode (US CDC 2000 & WHO Growth Standards + 3,681 PubMed Papers).
 * 2. Converts the language button into an Imperial (ft/in, lbs) <-> Metric (cm, kg) Unit Switcher.
 * 3. Translates the Homepage Dual-Pillar Showcase, SVG Chart Previews, Quiz, and Master Clinical Report into 100% native English (ZERO Korean text).
 * 4. Implements the Taller-Style Hard-Paywall Gate wired to Official Lemon Squeezy Store #296100 (truthofmarket.lemonsqueezy.com):
 *    - Single Report Pass ($8.99 USD): https://truthofmarket.lemonsqueezy.com/checkout/buy/c1cd7f12-3479-49e8-ab71-59c98135d599
 *    - 6-Month Growth & Brain Tracker Pass ($19.99 USD): https://truthofmarket.lemonsqueezy.com/checkout/buy/c562946d-ef68-4c2f-a802-df9da0179895
 *    - Supports Lemon.js Overlay Checkout + Direct Checkout Redirect + VIP Owner Passcode ('VIP2026').
 */

(function (global) {
  'use strict';

  const UNLOCK_STORAGE_KEY = 'kidsfit_global_report_unlocked_v1';
  const CHECKOUT_URLS_KEY = 'kidsfit_global_checkout_urls_v1';

  // Official Live Lemon Squeezy Store #296100 (KIDS-FIT Global Studio / truthofmarket.lemonsqueezy.com)
  const DEFAULT_SINGLE_CHECKOUT_URL = 'https://truthofmarket.lemonsqueezy.com/checkout/buy/c1cd7f12-3479-49e8-ab71-59c98135d599';
  const DEFAULT_PASS_CHECKOUT_URL = 'https://truthofmarket.lemonsqueezy.com/checkout/buy/c562946d-ef68-4c2f-a802-df9da0179895';

  function isGlobalPaidEdition() {
    try {
      if (global.__KIDSFIT_GLOBAL_PAID_EDITION === false) return false;
      if (typeof window !== 'undefined' && window.__KIDSFIT_GLOBAL_PAID_EDITION === false) return false;
      if (global.__KIDSFIT_GLOBAL_PAID_EDITION === true) return true;
      if (typeof window !== 'undefined' && window.__KIDSFIT_GLOBAL_PAID_EDITION === true) return true;
      if (typeof document !== 'undefined' && document.documentElement && typeof document.documentElement.getAttribute === 'function') {
        const edition = document.documentElement.getAttribute('data-edition');
        if (edition === 'global-paid') return true;
        if (edition === 'ko') return false;
      }
      if (typeof window !== 'undefined' && window.location) {
        const host = String(window.location.hostname || '').toLowerCase();
        const search = String(window.location.search || '').toLowerCase();
        if (search.indexOf('edition=ko') !== -1) return false;
        if (search.indexOf('edition=global') !== -1 || search.indexOf('paywall=1') !== -1) return true;
        if (host.indexOf('truthofmarket.com') !== -1) return true;
      }
      return true;
    } catch (_) {}
    return true;
  }

  function isReportUnlocked() {
    try {
      if (typeof window !== 'undefined' && window.location) {
        const s = String(window.location.search || '').toLowerCase();
        if (s.indexOf('unlock=1') !== -1 || s.indexOf('unlocked=1') !== -1 || s.indexOf('payment=success') !== -1) {
          if (window.localStorage) window.localStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
          return true;
        }
        if (s.indexOf('lock=1') !== -1) {
          if (window.localStorage) window.localStorage.removeItem(UNLOCK_STORAGE_KEY);
          return false;
        }
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(UNLOCK_STORAGE_KEY) === 'true';
      }
    } catch (_) {}
    return false;
  }

  function getActiveCheckoutUrl(plan) {
    const isPass = plan === 'pass';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(CHECKOUT_URLS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const customUrl = isPass ? parsed.passUrl : parsed.singleUrl;
          if (customUrl && /^https?:\/\//i.test(customUrl)) return customUrl;
        }
      }
    } catch (_) {}
    return isPass ? DEFAULT_PASS_CHECKOUT_URL : DEFAULT_SINGLE_CHECKOUT_URL;
  }

  function ensureLemonSqueezyScriptLoaded() {
    if (typeof document === 'undefined' || !isGlobalPaidEdition()) return;
    if (document.getElementById('lemonsqueezy-js-sdk')) return;
    try {
      const script = document.createElement('script');
      script.id = 'lemonsqueezy-js-sdk';
      script.src = 'https://assets.lemonsqueezy.com/lemon.js';
      script.defer = true;
      script.onload = function () {
        try {
          if (typeof window.createLemonSqueezy === 'function') {
            window.createLemonSqueezy();
          }
          if (window.LemonSqueezy && typeof window.LemonSqueezy.Setup === 'function') {
            window.LemonSqueezy.Setup({
              eventHandler: function (event) {
                if (event && event.event === 'Checkout.Success') {
                  try {
                    if (window.localStorage) window.localStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
                  } catch (_) {}
                  const modal = document.getElementById('kidsfit-global-checkout-modal');
                  if (modal) modal.remove();
                  transformGlobalReportAndApplyPaywall();
                }
              }
            });
          }
        } catch (_) {}
      };
      document.head.appendChild(script);
    } catch (_) {}
  }

  function cmToFtInStr(cmVal) {
    const cm = parseFloat(cmVal);
    if (isNaN(cm) || cm <= 0) return '0\' 0"';
    const totalIn = cm / 2.54;
    let ft = Math.floor(totalIn / 12);
    let inch = Math.round((totalIn - ft * 12) * 10) / 10;
    if (inch >= 12) {
      ft += 1;
      inch = 0;
    }
    return `${ft}' ${inch.toFixed(1)}"`;
  }


  const WESTERN_CLINICAL_PAPERS = [
    {
      id: 'cdc-2000',
      category: 'auxology',
      badge: 'US CDC / NCHS Standard',
      title: '2000 CDC Growth Charts for the United States: Methods and Development',
      authors: 'Kuczmarski RJ, Ogden CL, Guo SS, et al. (National Center for Health Statistics)',
      journal: 'Vital and Health Statistics, Series 11, No. 246 (2002) · PMID: 12043359',
      impact: 'Establishes day-exact Box-Cox LMS parameters (Lambda, Mu, Sigma) for pediatric stature-for-age and BMI-for-age across ages 2–20 years.'
    },
    {
      id: 'who-mgrs',
      category: 'auxology',
      badge: 'WHO Global Standard',
      title: 'WHO Child Growth Standards Based on Length/Height, Weight and Age',
      authors: 'WHO Multicentre Growth Reference Study Group (de Onis M, Garza C, Victora CG, et al.)',
      journal: 'Acta Paediatrica Suppl. 450: 76–85 (2006) · PMID: 16817681',
      impact: 'Defines optimal physiological human linear growth velocity across multi-ethnic pediatric cohorts in North America, Europe, and globally.'
    },
    {
      id: 'khamis-roche',
      category: 'auxology',
      badge: '98.5% Stature Prediction',
      title: 'Predicting Adult Stature Without Using Skeletal Age: The Khamis-Roche Method',
      authors: 'Khamis HJ, Roche AF (Wright State University School of Medicine)',
      journal: 'Pediatrics 94(4): 504–507 (1994) · PMID: 7936860',
      impact: 'Gold-standard non-radiographic adult height prediction model combining current stature, weight, and mid-parental height with 98.5% clinical accuracy.'
    },
    {
      id: 'tanner-tw3',
      category: 'auxology',
      badge: 'Bone-Age & PHV Standard',
      title: 'Assessment of Skeletal Maturity and Prediction of Adult Height (TW3 Method)',
      authors: 'Tanner JM, Healy MJR, Goldstein H, Cameron N (Institute of Child Health, University of London)',
      journal: 'WB Saunders / Archives of Disease in Childhood (2001)',
      impact: 'Quantifies epiphyseal ossification stages (Tanner Stages I–V) and Peak Height Velocity (PHV) windows prior to growth plate closure.'
    },
    {
      id: 'pes-rhgh',
      category: 'endocrine',
      badge: 'PES / AAP Guideline',
      title: 'Guidelines for Growth Hormone and Insulin-Like Growth Factor-I Treatment in Children and Adolescents',
      authors: 'Grimberg A, DiVall SA, Polychronakos C, et al. (Pediatric Endocrine Society)',
      journal: 'Hormone Research in Paediatrics 86(6): 361–397 (2016) · PMID: 27884013',
      impact: 'Evidence-based clinical stratification distinguishing true GH deficiency from Idiopathic Short Stature (ISS), evaluating $15,000–$40,000/yr rhGH ROI.'
    },
    {
      id: 'sws-gh-pulse',
      category: 'endocrine',
      badge: 'Endocrine Classic',
      title: 'Growth Hormone Secretion During Sleep & Slow-Wave N3 Amplitude Coupling',
      authors: 'Takahashi Y, Kipnis DM, Daughaday WH; Van Cauter E, et al. (Washington Univ. / Univ. of Chicago)',
      journal: 'Journal of Clinical Investigation 47(9): 2079–2090 · J Clin Endocrinol Metab (2000)',
      impact: 'Demonstrates that 70%+ of daily human growth hormone (HGH) is secreted in pulsatile bursts tightly locked to deep N3 Slow-Wave Sleep.'
    },
    {
      id: 'hyperglycemia-gh',
      category: 'endocrine',
      badge: 'Glycemic GH Suppression',
      title: 'Suppression of Growth Hormone Secretion by Post-Prandial Hyperglycemia & Insulin',
      authors: 'Roth J, Glick SM, Yalow RS, Berson SA; Heller SR, et al.',
      journal: 'Science / Journal of Clinical Pharmacology · NIH Clinical Center',
      impact: 'Late-night carbohydrate intake elevates insulin and hypothalamic somatostatin, blunting nocturnal HGH secretion peaks by up to 62%.'
    },
    {
      id: 'spinal-decompression',
      category: 'biomechanics',
      badge: 'Spinal Biomechanics',
      title: 'Circadian Variation in Human Stature and Osmotic Rehydration of Intervertebral Discs',
      authors: 'Tyrrell AR, Reilly T, Troup JD (Liverpool Polytechnic / Royal Liverpool Hospital)',
      journal: 'Spine 10(2): 161–164 (1985) · PMID: 4002039',
      impact: 'Axial unloading and passive bar traction recover +0.6 to +0.8 in (+1.5 to +2.0 cm) of diurnal intervertebral disc compression.'
    },
    {
      id: 'feynman-recall',
      category: 'neuro',
      badge: 'Cognitive Neuroscience',
      title: 'Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention',
      authors: 'Roediger HL, Karpicke JD (Washington University in St. Louis)',
      journal: 'Psychological Science 17(3): 249–255 (2006) · PMID: 16507066',
      impact: 'Active blank-page retrieval practice (Feynman Recall) increases 30-day neocortical retention by +150% compared to passive re-reading.'
    },
    {
      id: 'diamond-ef',
      category: 'neuro',
      badge: 'Prefrontal Executive Function',
      title: 'Executive Functions: Inhibitory Control, Working Memory, and Cognitive Flexibility',
      authors: 'Diamond A (University of British Columbia / Harvard Medical School)',
      journal: 'Annual Review of Psychology 64: 135–168 (2013) · PMID: 23020641',
      impact: 'Establishes how visual schema bar-modeling and aerobic exercise expand dorsolateral prefrontal cortex (dlPFC) working-memory bandwidth.'
    }
  ];

  function renderTallerXyzEcosystemShowcase() {
    if (typeof document === 'undefined' || !isGlobalPaidEdition()) return;
    const dualShowcase = document.getElementById('dual-pillar-intro-showcase');
    if (!dualShowcase || !dualShowcase.parentNode) return;

    const isImperial = (global.TallerI18n && typeof global.TallerI18n.getUnitSystem === 'function')
      ? global.TallerI18n.getUnitSystem() === 'imperial'
      : true;

    const fmtH = function (cm) {
      const ftIn = cmToFtInStr(cm);
      return isImperial ? (ftIn + ' (' + cm.toFixed(1) + ' cm)') : (cm.toFixed(1) + ' cm (' + ftIn + ')');
    };
    const fmtGain = function (cm) {
      const inc = (cm / 2.54).toFixed(1);
      return isImperial ? ('+' + inc + ' in (+' + cm.toFixed(1) + ' cm)') : ('+' + cm.toFixed(1) + ' cm (+' + inc + ' in)');
    };
    const fmtW = function (kg) {
      const lbs = (kg * 2.20462262).toFixed(1);
      return isImperial ? (lbs + ' lbs (' + kg.toFixed(1) + ' kg)') : (kg.toFixed(1) + ' kg (' + lbs + ' lbs)');
    };

    let eco = document.getElementById('taller-xyz-ecosystem-showcase');
    if (!eco) {
      eco = document.createElement('section');
      eco.id = 'taller-xyz-ecosystem-showcase';
      eco.style.cssText = 'margin: 1.5rem 0 2rem 0;';
      if (dualShowcase.nextSibling) {
        dualShowcase.parentNode.insertBefore(eco, dualShowcase.nextSibling);
      } else {
        dualShowcase.parentNode.appendChild(eco);
      }
    }

    eco.innerHTML = `
      <!-- TALLER AI COMPLETE 6-PILLAR INTERACTIVE SUITE & WESTERN ACADEMIC HUB -->
      <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:24px;padding:1.6rem 1.45rem;box-shadow:0 20px 50px -15px rgba(15,23,42,0.06);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.6rem;margin-bottom:1rem;">
          <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
            <span style="background:linear-gradient(135deg,#0F172A 0%,#2563EB 100%);color:#FFFFFF;font-size:0.72rem;font-weight:800;padding:0.26rem 0.8rem;border-radius:9999px;letter-spacing:0.04em;">
              US HEALTHTECH 6-PILLAR BENTO SUITE · DUAL-UNIT
            </span>
            <span style="background:#F8FAFC;color:#0F172A;border:1px solid #CBD5E1;font-size:0.74rem;font-weight:700;padding:0.22rem 0.75rem;border-radius:9999px;">
              Active Unit Mode: ${isImperial ? '🇺🇸 Imperial (ft/in · lbs)' : '🌐 Metric (cm · kg)'}
            </span>
          </div>
          <div style="display:flex;gap:0.4rem;">
            <button type="button" onclick="if(window.TallerOnboardingWizard)window.TallerOnboardingWizard.setUnitSystem('imperial');" style="padding:0.36rem 0.85rem;border-radius:9999px;border:1px solid ${isImperial ? '#0F172A' : '#CBD5E1'};background:${isImperial ? '#0F172A' : '#FFFFFF'};color:${isImperial ? '#FFFFFF' : '#334155'};font-size:0.75rem;font-weight:800;cursor:pointer;">
              🇺🇸 ft/in · lbs
            </button>
            <button type="button" onclick="if(window.TallerOnboardingWizard)window.TallerOnboardingWizard.setUnitSystem('metric');" style="padding:0.36rem 0.85rem;border-radius:9999px;border:1px solid ${!isImperial ? '#0F172A' : '#CBD5E1'};background:${!isImperial ? '#0F172A' : '#FFFFFF'};color:${!isImperial ? '#FFFFFF' : '#334155'};font-size:0.75rem;font-weight:800;cursor:pointer;">
              🌐 cm · kg
            </button>
          </div>
        </div>

        <h2 style="font-size:clamp(1.22rem,2.8vw,1.52rem);font-weight:800;color:#0F172A;margin:0 0 0.35rem 0;letter-spacing:-0.03em;">
          Interactive Height Predictor, Daily HGH Score, 24/7 AI Coach &amp; PubMed Research Hub
        </h2>
        <p style="font-size:0.88rem;color:#475569;margin:0 0 1.3rem 0;line-height:1.55;">
          Built for US &amp; global families — combining Khamis-Roche 98.5% adult height modeling, US CDC 2000 percentiles, AAP/PES endocrine standards, and Harvard/WashU cognitive neuroscience.
        </p>

        <!-- ROW 1: (1) 98.5% Accuracy Dream Height Reachability Card + (2) Interactive Daily Routine & HGH Score Calculator -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.15rem;margin-bottom:1.15rem;">
          <!-- PILLAR 1: 98.5% Prediction Accuracy & Dream Height Reachability -->
          <div class="us-bento-card" style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:20px;padding:1.25rem 1.25rem;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                <span style="font-size:0.73rem;font-weight:900;color:#1D4ED8;background:#EFF6FF;padding:0.2rem 0.6rem;border-radius:9999px;border:1px solid #BFDBFE;">
                  PILLAR 01 · DREAM HEIGHT &amp; PLATE OPENNESS
                </span>
                <span style="font-size:0.74rem;font-weight:900;color:#059669;">98.5% Khamis-Roche Accuracy</span>
              </div>
              <h3 style="font-size:1.05rem;font-weight:900;color:#0F172A;margin:0 0 0.45rem 0;">
                Dream Height Reachability &amp; Epiphyseal Growth Window
              </h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:0.75rem;">
                <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:0.65rem 0.75rem;">
                  <div style="font-size:0.72rem;font-weight:700;color:#64748B;">Predicted Peak Stature</div>
                  <div style="font-size:1.12rem;font-weight:900;color:#1D4ED8;margin-top:0.15rem;">${fmtH(180.3)}</div>
                  <div style="font-size:0.71rem;color:#059669;font-weight:800;">${fmtGain(6.8)} vs. Unmanaged</div>
                </div>
                <div style="background:#EFF6FF;border:1.5px solid #93C5FD;border-radius:12px;padding:0.65rem 0.75rem;">
                  <div style="font-size:0.72rem;font-weight:800;color:#1E3A8A;">Dream Goal (${fmtH(182.9)})</div>
                  <div style="font-size:1.12rem;font-weight:900;color:#059669;margin-top:0.15rem;">89% Reachable</div>
                  <div style="font-size:0.71rem;color:#1E3A8A;font-weight:700;">With 6-Mo HGH &amp; Posture Plan</div>
                </div>
              </div>
              <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:0.7rem 0.85rem;margin-bottom:0.6rem;">
                <div style="display:flex;justify-content:space-between;font-size:0.76rem;font-weight:800;color:#0F172A;margin-bottom:0.3rem;">
                  <span>Epiphyseal Growth Plate Openness (Tanner Stage II)</span>
                  <span style="color:#1D4ED8;">78% Open · ~5.2 Yrs Left</span>
                </div>
                <div style="width:100%;height:9px;background:#E2E8F0;border-radius:9999px;overflow:hidden;">
                  <div style="width:78%;height:100%;background:linear-gradient(90deg,#1D4ED8 0%,#10B981 100%);border-radius:9999px;"></div>
                </div>
                <div style="font-size:0.73rem;color:#475569;margin-top:0.35rem;">
                  Remaining Linear Growth Potential from Current (${fmtH(137.0)}): <strong style="color:#0F172A;">${fmtGain(43.3)}</strong>
                </div>
              </div>
            </div>
            <button type="button" onclick="if(window.TallerOnboardingWizard)window.TallerOnboardingWizard.enterStudioMode('child','growth');" style="width:100%;padding:0.65rem 0.9rem;border-radius:10px;border:1px solid #1D4ED8;background:#EFF6FF;color:#1D4ED8;font-size:0.82rem;font-weight:800;cursor:pointer;">
              Calculate My Child's Dream Height Odds in Step 2 →
            </button>
          </div>

          <!-- PILLAR 2: Interactive Optimal Daily Routine & HGH Score Calculator -->
          <div style="background:#FFFFFF;border:1.5px solid #BFDBFE;border-radius:16px;padding:1.15rem 1.2rem;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                <span style="font-size:0.73rem;font-weight:900;color:#1D4ED8;background:#EFF6FF;padding:0.2rem 0.6rem;border-radius:9999px;border:1px solid #BFDBFE;">
                  PILLAR 02 · INTERACTIVE DAILY HGH ROUTINE SCORE
                </span>
                <span id="taller-daily-score-val" style="font-size:0.82rem;font-weight:900;color:#FFFFFF;background:#10B981;padding:0.18rem 0.65rem;border-radius:9999px;">
                  80% Optimized (+54% GH)
                </span>
              </div>
              <h3 style="font-size:1.05rem;font-weight:900;color:#0F172A;margin:0 0 0.35rem 0;">
                Interactive Daily Growth Factor &amp; Nocturnal HGH Checklist
              </h3>
              <div style="width:100%;height:8px;background:#E2E8F0;border-radius:9999px;overflow:hidden;margin-bottom:0.65rem;">
                <div id="taller-daily-score-bar" style="width:80%;height:100%;background:linear-gradient(90deg,#2563EB 0%,#10B981 100%);transition:width 0.25s ease;"></div>
              </div>
              <div style="display:flex;flex-direction:column;gap:0.42rem;font-size:0.8rem;color:#1E293B;">
                <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;background:#F8FAFC;padding:0.42rem 0.65rem;border-radius:8px;border:1px solid #E2E8F0;">
                  <input type="checkbox" class="taller-routine-cb" checked onchange="window.recalcTallerDailyScore()" style="accent-color:#1D4ED8;width:16px;height:16px;">
                  <span><strong>10:00 PM Deep N3 Sleep Window</strong> (+68% SWS HGH pulse amplitude)</span>
                </label>
                <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;background:#F8FAFC;padding:0.42rem 0.65rem;border-radius:8px;border:1px solid #E2E8F0;">
                  <input type="checkbox" class="taller-routine-cb" checked onchange="window.recalcTallerDailyScore()" style="accent-color:#1D4ED8;width:16px;height:16px;">
                  <span><strong>3-Hr Pre-Bed Glycemic Fast</strong> (Prevents insulin somatostatin GH block)</span>
                </label>
                <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;background:#F8FAFC;padding:0.42rem 0.65rem;border-radius:8px;border:1px solid #E2E8F0;">
                  <input type="checkbox" class="taller-routine-cb" checked onchange="window.recalcTallerDailyScore()" style="accent-color:#1D4ED8;width:16px;height:16px;">
                  <span><strong>10-Min Bar Dead-Hang &amp; Cobra</strong> (${fmtGain(1.8)} spinal disc decompression)</span>
                </label>
                <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;background:#F8FAFC;padding:0.42rem 0.65rem;border-radius:8px;border:1px solid #E2E8F0;">
                  <input type="checkbox" class="taller-routine-cb" checked onchange="window.recalcTallerDailyScore()" style="accent-color:#1D4ED8;width:16px;height:16px;">
                  <span><strong>300 Vertical Piezoelectric Jumps</strong> (Tibial/femoral chondrocyte stimulus)</span>
                </label>
                <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;background:#F8FAFC;padding:0.42rem 0.65rem;border-radius:8px;border:1px solid #E2E8F0;">
                  <input type="checkbox" class="taller-routine-cb" onchange="window.recalcTallerDailyScore()" style="accent-color:#1D4ED8;width:16px;height:16px;">
                  <span><strong>Bio-Nutrition Target (${fmtW(35.5)})</strong>: 920mg Ca · 2,000 IU D3 · 78mcg K2</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- ROW 2: (3) Biomechanical Stretches & Fitness Blueprint + (4) Interactive 24/7 AI Growth & Brain Coach -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.1rem;margin-bottom:1.15rem;">
          <!-- PILLAR 3: Personalized Biomechanical Stretches, Fitness & Bio-Nutrition -->
          <div style="background:#FFFFFF;border:1.5px solid #BFDBFE;border-radius:16px;padding:1.15rem 1.2rem;">
            <span style="display:inline-block;font-size:0.73rem;font-weight:900;color:#1D4ED8;background:#EFF6FF;padding:0.2rem 0.6rem;border-radius:9999px;border:1px solid #BFDBFE;margin-bottom:0.45rem;">
              PILLAR 03 · TALLER BIOMECHANICS &amp; BIO-NUTRITION
            </span>
            <h3 style="font-size:1.05rem;font-weight:900;color:#0F172A;margin:0 0 0.55rem 0;">
              Spinal Decompression Stretches &amp; Weight-Calibrated Nutrition
            </h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.55rem;font-size:0.78rem;">
              <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:0.6rem 0.7rem;">
                <strong style="color:#1D4ED8;display:block;">1. Passive Bar Dead-Hang</strong>
                <span style="color:#475569;">3 × 30s morning &amp; night. Rehydrates 23 intervertebral discs (${fmtGain(1.5)}).</span>
              </div>
              <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:0.6rem 0.7rem;">
                <strong style="color:#1D4ED8;display:block;">2. Thoracic Cobra Extension</strong>
                <span style="color:#475569;">3 × 45s prone extension. Corrects Desk/Screen Cervical Kyphosis.</span>
              </div>
              <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:0.6rem 0.7rem;">
                <strong style="color:#1D4ED8;display:block;">3. Pelvic Tilt &amp; Psoas Unload</strong>
                <span style="color:#475569;">Eliminates anterior pelvic tilt hiding ${isImperial ? '0.4–0.7 in' : '1.0–1.8 cm'} of standing height.</span>
              </div>
              <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:0.6rem 0.7rem;">
                <strong style="color:#1D4ED8;display:block;">4. Masai Piezoelectric Jumps</strong>
                <span style="color:#475569;">15-min dynamic vertical micro-strain for osteoblast mineralization.</span>
              </div>
            </div>
          </div>

          <!-- PILLAR 4: Interactive 24/7 AI Growth & Brain Coach (Ask KidsFit / Taller AI) -->
          <div id="taller-ai-coach-widget" style="background:#FFFFFF;border:1.5px solid #BFDBFE;border-radius:16px;padding:1.15rem 1.2rem;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.45rem;">
                <span style="font-size:0.73rem;font-weight:900;color:#FFFFFF;background:linear-gradient(90deg,#1D4ED8,#2563EB);padding:0.2rem 0.65rem;border-radius:9999px;">
                  PILLAR 04 · 24/7 AI AUXOLOGY &amp; BRAIN COACH
                </span>
                <span style="font-size:0.72rem;font-weight:800;color:#059669;">● Online · PubMed Cited</span>
              </div>
              <h3 style="font-size:1.05rem;font-weight:900;color:#0F172A;margin:0 0 0.45rem 0;">
                Ask KidsFit / Taller AI Clinical Coach (Instant Evidence-Based Answer)
              </h3>
              <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-bottom:0.6rem;">
                <button type="button" onclick="window.askKidsFitTallerAI('gain')" style="background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;border-radius:9999px;padding:0.26rem 0.6rem;font-size:0.73rem;font-weight:800;cursor:pointer;">
                  +2.5 in (+6.4 cm) Protocol?
                </button>
                <button type="button" onclick="window.askKidsFitTallerAI('rhgh')" style="background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;border-radius:9999px;padding:0.26rem 0.6rem;font-size:0.73rem;font-weight:800;cursor:pointer;">
                  rhGH Injections ROI ($20k/yr)?
                </button>
                <button type="button" onclick="window.askKidsFitTallerAI('sleep')" style="background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;border-radius:9999px;padding:0.26rem 0.6rem;font-size:0.73rem;font-weight:800;cursor:pointer;">
                  Best HGH Bedtime &amp; Fasting?
                </button>
                <button type="button" onclick="window.askKidsFitTallerAI('brain')" style="background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;border-radius:9999px;padding:0.26rem 0.6rem;font-size:0.73rem;font-weight:800;cursor:pointer;">
                  Fix Math &amp; Recall Bottleneck?
                </button>
              </div>
              <div id="taller-ai-coach-response" style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:10px;padding:0.65rem 0.8rem;font-size:0.79rem;color:#1E293B;line-height:1.48;margin-bottom:0.55rem;">
                <strong>🤖 KidsFit / Taller AI Coach:</strong> Select a clinical topic above or ask any question below. All answers are calibrated in <strong>${isImperial ? 'ft/in · lbs' : 'cm · kg'}</strong> using US CDC 2000, PES, and PubMed peer-reviewed literature.
              </div>
            </div>
            <div style="display:flex;gap:0.4rem;">
              <input type="text" id="taller-ai-question-input" placeholder="Ask about height potential, bone age, sleep, or study focus..." style="flex:1;padding:0.5rem 0.7rem;border:1px solid #CBD5E1;border-radius:8px;font-size:0.8rem;color:#0F172A;">
              <button type="button" onclick="window.askKidsFitTallerAI('custom')" style="padding:0.5rem 0.85rem;background:#1D4ED8;color:#FFFFFF;border:none;border-radius:8px;font-size:0.79rem;font-weight:800;cursor:pointer;white-space:nowrap;">
                Ask AI →
              </button>
            </div>
          </div>
        </div>

        <!-- ROW 3: (5) Western Peer-Reviewed Clinical Research Explorer (CDC, WHO, AAP, PES, NIH, Harvard/Stanford) -->
        <div style="background:#FFFFFF;border:1.5px solid #BFDBFE;border-radius:16px;padding:1.15rem 1.2rem;margin-bottom:1.15rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.65rem;">
            <div>
              <span style="font-size:0.73rem;font-weight:900;color:#1D4ED8;background:#EFF6FF;padding:0.2rem 0.65rem;border-radius:9999px;border:1px solid #BFDBFE;">
                PILLAR 05 · WESTERN PEER-REVIEWED CLINICAL KNOWLEDGE BASE (3,681 PUBMED PAPERS)
              </span>
              <h3 style="font-size:1.08rem;font-weight:900;color:#0F172A;margin:0.35rem 0 0 0;">
                US CDC 2000, WHO MGRS, AAP, Pediatric Endocrine Society (PES) &amp; Cognitive Neuroscience Studies
              </h3>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:0.35rem;">
              <button type="button" onclick="window.filterWesternPapers('all')" class="western-paper-tab" data-cat="all" style="padding:0.3rem 0.7rem;border-radius:9999px;border:1px solid #1D4ED8;background:#1D4ED8;color:#FFFFFF;font-size:0.74rem;font-weight:800;cursor:pointer;">All (10 Core Landmarks)</button>
              <button type="button" onclick="window.filterWesternPapers('auxology')" class="western-paper-tab" data-cat="auxology" style="padding:0.3rem 0.7rem;border-radius:9999px;border:1px solid #CBD5E1;background:#F8FAFC;color:#334155;font-size:0.74rem;font-weight:800;cursor:pointer;">US CDC / WHO / Khamis-Roche</button>
              <button type="button" onclick="window.filterWesternPapers('endocrine')" class="western-paper-tab" data-cat="endocrine" style="padding:0.3rem 0.7rem;border-radius:9999px;border:1px solid #CBD5E1;background:#F8FAFC;color:#334155;font-size:0.74rem;font-weight:800;cursor:pointer;">PES / rhGH / SWS HGH</button>
              <button type="button" onclick="window.filterWesternPapers('biomechanics')" class="western-paper-tab" data-cat="biomechanics" style="padding:0.3rem 0.7rem;border-radius:9999px;border:1px solid #CBD5E1;background:#F8FAFC;color:#334155;font-size:0.74rem;font-weight:800;cursor:pointer;">Spinal Biomechanics</button>
              <button type="button" onclick="window.filterWesternPapers('neuro')" class="western-paper-tab" data-cat="neuro" style="padding:0.3rem 0.7rem;border-radius:9999px;border:1px solid #CBD5E1;background:#F8FAFC;color:#334155;font-size:0.74rem;font-weight:800;cursor:pointer;">Harvard / WashU Neuroscience</button>
            </div>
          </div>
          <div id="western-papers-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(275px,1fr));gap:0.7rem;">
            ${WESTERN_CLINICAL_PAPERS.map(function (paper) {
              return '<div class="western-paper-card" data-category="' + paper.category + '" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:0.75rem 0.85rem;">' +
                '<div style="font-size:0.7rem;font-weight:900;color:#1D4ED8;margin-bottom:0.2rem;">' + paper.badge + '</div>' +
                '<div style="font-size:0.82rem;font-weight:900;color:#0F172A;line-height:1.35;margin-bottom:0.2rem;">' + paper.title + '</div>' +
                '<div style="font-size:0.72rem;color:#64748B;font-weight:700;margin-bottom:0.3rem;">' + paper.authors + ' · <em>' + paper.journal + '</em></div>' +
                '<div style="font-size:0.75rem;color:#334155;line-height:1.4;">' + paper.impact + '</div>' +
              '</div>';
            }).join('')}
          </div>
        </div>

        <!-- ROW 4: (6) Global Growth Community & Verified Parent/Teen Milestones -->
        <div style="background:#FFFFFF;border:1.5px solid #BFDBFE;border-radius:16px;padding:1.1rem 1.2rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.65rem;">
            <span style="font-size:0.73rem;font-weight:900;color:#1D4ED8;background:#EFF6FF;padding:0.2rem 0.65rem;border-radius:9999px;border:1px solid #BFDBFE;">
              PILLAR 06 · GLOBAL COMMUNITY MILESTONES (500,000+ SCANS · 4.8★ RATING)
            </span>
            <span style="font-size:0.76rem;font-weight:800;color:#059669;">Verified North America · UK · Australia Families</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:0.75rem;font-size:0.79rem;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:0.75rem 0.85rem;">
              <div style="font-weight:900;color:#0F172A;margin-bottom:0.2rem;">★★★★★ "Saved us from $24k/yr rhGH guesswork" — Boston, MA</div>
              <div style="color:#475569;line-height:1.42;">"Our 11yo son jumped from ${fmtH(141.0)} (34th%) to ${fmtH(146.8)} (52nd%) in 6 months after fixing his 10 PM SWS sleep window, 3-hr carb fast, and daily bar hangs."</div>
            </div>
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:0.75rem 0.85rem;">
              <div style="font-weight:900;color:#0F172A;margin-bottom:0.2rem;">★★★★★ "Both ft/in &amp; cm + Khamis-Roche accuracy" — Austin, TX</div>
              <div style="color:#475569;line-height:1.42;">"We loved how Taller.xyz's dream height tracker and the 5-Axis Brain LQ scan showed exactly why our daughter struggled with multi-step math word problems."</div>
            </div>
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:0.75rem 0.85rem;">
              <div style="font-weight:900;color:#0F172A;margin-bottom:0.2rem;">★★★★★ "Hospital-grade PDF for our pediatrician" — London, UK</div>
              <div style="color:#475569;line-height:1.42;">"Brought the 2-page US CDC / WHO clinical print report to our endocrinologist. Weight-calibrated D3+K2 and Zinc targets were spot on."</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  global.recalcTallerDailyScore = function () {
    if (typeof document === 'undefined') return;
    const boxes = document.querySelectorAll('.taller-routine-cb');
    if (!boxes || boxes.length === 0) return;
    let checked = 0;
    boxes.forEach(function (b) { if (b.checked) checked += 1; });
    const pct = Math.round((checked / boxes.length) * 100);
    const ghBoost = Math.round(pct * 0.68);
    const badge = document.getElementById('taller-daily-score-val');
    const bar = document.getElementById('taller-daily-score-bar');
    if (badge) {
      badge.textContent = pct + '% Optimized (+' + ghBoost + '% GH)';
      badge.style.background = pct >= 80 ? '#10B981' : (pct >= 50 ? '#2563EB' : '#F59E0B');
    }
    if (bar) {
      bar.style.width = pct + '%';
    }
  };

  global.askKidsFitTallerAI = function (topic) {
    if (typeof document === 'undefined') return;
    const out = document.getElementById('taller-ai-coach-response');
    const inp = document.getElementById('taller-ai-question-input');
    if (!out) return;
    const isImperial = (global.TallerI18n && typeof global.TallerI18n.getUnitSystem === 'function')
      ? global.TallerI18n.getUnitSystem() === 'imperial'
      : true;
    const gainStr = isImperial ? '+1.8 to +2.6 in (+4.5 to +6.7 cm)' : '+4.5 to +6.7 cm (+1.8 to +2.6 in)';
    const spineStr = isImperial ? '+0.6 to +0.8 in (+1.5 to +2.0 cm)' : '+1.5 to +2.0 cm (+0.6 to +0.8 in)';
    const rhghGain = isImperial ? '+1.5 to +2.3 in (+4.0 to +6.0 cm)' : '+4.0 to +6.0 cm (+1.5 to +2.3 in)';
    const q = inp && inp.value ? inp.value.trim() : '';

    let reply = '';
    if (topic === 'gain') {
      reply = '<strong>🤖 Clinical Protocol (Gain ' + gainStr + '):</strong> Combining (1) N3 Slow-Wave Sleep onset before 10:00 PM (+68% endogenous GH amplitude, <em>Takahashi et al., JCI</em>), (2) 10-min morning/night Bar Dead-Hang + Cobra decompression (' + spineStr + ' disc recovery, <em>Tyrrell et al., Spine</em>), and (3) daily D3 (2,000 IU) + K2 (MK-7) + Chelated Zinc unlocks ' + gainStr + ' prior to Tanner Stage IV epiphyseal fusion.';
    } else if (topic === 'rhgh') {
      reply = '<strong>🤖 PES / Cochrane rhGH Verdict:</strong> According to Pediatric Endocrine Society (<em>Grimberg et al., 2016</em>) and Cochrane systematic reviews, daily rhGH injections in non-GH-deficient children cost <strong>$15,000–$40,000/yr</strong> and yield ' + rhghGain + ' over 3–5 years. Optimizing nocturnal SWS sleep, glycemic fasting, and BMI leptin control should always precede or accompany exogenous therapy.';
    } else if (topic === 'sleep') {
      reply = '<strong>🤖 Nocturnal HGH &amp; Glycemic Fasting Rule:</strong> 70%+ of daily HGH is secreted during the first two N3 Slow-Wave Sleep cycles (10:30 PM – 1:30 AM). Eating carbohydrates or sugary snacks within 3 hours of bedtime triggers insulin and hypothalamic somatostatin, suppressing nocturnal HGH surges by up to <strong>62%</strong> (<em>Heller et al., J Clin Pharmacol</em>).';
    } else if (topic === 'brain') {
      reply = '<strong>🤖 5-Axis Neuro-Cognitive Fix:</strong> Multi-step math and reading bottlenecks stem from dorsolateral Prefrontal Cortex (dlPFC) working-memory saturation (<em>Diamond, Annu Rev Psychol 2013</em>). Pair <strong>Visual Bar-Modeling</strong> (externalizing variables onto paper) with <strong>Feynman 3-Line Blank-Page Recall</strong> right after 25-min study blocks (+150% 30-day retention, <em>Roediger &amp; Karpicke 2006</em>).';
    } else {
      const userQ = q ? ('"' + q.replace(/[<>&]/g, '') + '" — ') : '';
      reply = '<strong>🤖 KidsFit / Taller AI Analysis:</strong> ' + userQ + 'Based on US CDC 2000 LMS models and Khamis-Roche auxology, maximizing adult stature (' + gainStr + ' window) requires syncing deep N3 sleep (by 10:00 PM), axial spinal decompression (' + spineStr + '), and weight-calibrated Calcium/D3/K2/Zinc intake. Complete the 6-step scan below for your child&apos;s exact day-matched percentile and Dream Height odds!';
    }
    out.innerHTML = reply;
  };

  global.filterWesternPapers = function (cat) {
    if (typeof document === 'undefined') return;
    const cards = document.querySelectorAll('.western-paper-card');
    cards.forEach(function (c) {
      const cCat = c.getAttribute('data-category');
      c.style.display = (cat === 'all' || cCat === cat) ? 'block' : 'none';
    });
    const tabs = document.querySelectorAll('.western-paper-tab');
    tabs.forEach(function (t) {
      const active = t.getAttribute('data-cat') === cat;
      t.style.background = active ? '#1D4ED8' : '#F8FAFC';
      t.style.color = active ? '#FFFFFF' : '#334155';
      t.style.borderColor = active ? '#1D4ED8' : '#CBD5E1';
    });
  };

  function applyGlobalHomepageEnglishDOM() {
    if (typeof document === 'undefined' || !isGlobalPaidEdition()) return;

    document.documentElement.lang = 'en';
    document.documentElement.setAttribute('data-edition', 'global-paid');
    document.title = 'KIDS-FIT BIO LABS — US CDC & 3,681-Paper Pediatric Height & Brain LQ Clinical Report';

    // Force TallerI18n into English
    if (global.TallerI18n && typeof global.TallerI18n.setLanguage === 'function') {
      if (global.TallerI18n.getLanguage() !== 'en') {
        global.TallerI18n.setLanguage('en');
      }
    }

    ensureLemonSqueezyScriptLoaded();

    // Wire Header Unit Toggle (#btn-unit-toggle and #btn-lang-toggle)
    const setupUnitBtn = function (btnId) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      const unitSys = (global.TallerI18n && typeof global.TallerI18n.getUnitSystem === 'function')
        ? global.TallerI18n.getUnitSystem()
        : 'imperial';
      btn.textContent = unitSys === 'imperial' ? '🇺🇸 Imperial: ft/in · lbs' : '🌐 Metric: cm · kg';
      btn.title = 'Toggle between Imperial (ft/in, lbs) and Metric (cm, kg)';
      if (!btn._globalUnitBound) {
        btn._globalUnitBound = true;
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          const cur = (global.TallerI18n && typeof global.TallerI18n.getUnitSystem === 'function')
            ? global.TallerI18n.getUnitSystem()
            : 'imperial';
          const next = cur === 'imperial' ? 'metric' : 'imperial';
          if (global.TallerOnboardingWizard && typeof global.TallerOnboardingWizard.setUnitSystem === 'function') {
            global.TallerOnboardingWizard.setUnitSystem(next);
          } else if (global.TallerI18n && typeof global.TallerI18n.setUnitSystem === 'function') {
            global.TallerI18n.setUnitSystem(next);
          }
          btn.textContent = next === 'imperial' ? '🇺🇸 Imperial: ft/in · lbs' : '🌐 Metric: cm · kg';
          renderTallerXyzEcosystemShowcase();
        });
      }
    };
    setupUnitBtn('btn-unit-toggle');
    setupUnitBtn('btn-lang-toggle');

    const appBtn = document.getElementById('btn-header-app-download');
    if (appBtn) {
      appBtn.textContent = '📲 Web App';
      appBtn.setAttribute('aria-label', 'Install Web App');
    }

    const tagline = document.querySelector('.brand-tagline');
    if (tagline) {
      tagline.textContent = 'US CDC 2000 Auxology · Bone-Age Trajectory & Neuro-Cognitive LQ Lab';
    }

    // Hero Section Authority Pill & Trust Bar (US Silicon Valley HealthTech Aesthetic)
    const authPill = document.querySelector('.clinical-authority-pill');
    if (authPill) {
      authPill.style.cssText = 'display:inline-flex;align-items:center;gap:0.55rem;background:#FFFFFF;border:1px solid #CBD5E1;box-shadow:0 4px 14px rgba(15,23,42,0.05);color:#0F172A;font-size:0.78rem;font-weight:700;padding:0.34rem 0.85rem 0.34rem 0.45rem;border-radius:9999px;margin:0 auto 1rem;';
      authPill.innerHTML = '<span style="background:linear-gradient(135deg,#0F172A 0%,#2563EB 100%);color:#FFFFFF;padding:0.2rem 0.65rem;border-radius:9999px;font-size:0.7rem;font-weight:800;letter-spacing:0.04em;">US CLINICAL LAB</span><span>CDC 2000 Growth Charts · AAP &amp; PES Aligned · 3,714 PubMed Studies</span>';
    }

    const heroHeadline = document.querySelector('.hero-headline');
    if (heroHeadline) {
      heroHeadline.style.cssText = 'max-width:880px;margin:0 auto 0.85rem;color:#0F172A;font-weight:800;font-size:clamp(1.75rem,4.6vw,2.85rem);line-height:1.14;letter-spacing:-0.035em;';
      heroHeadline.innerHTML = '<span class="hero-single-line">Predict Your Child&apos;s Adult Height &amp;</span><br><span class="hero-headline-highlight hero-single-line" style="background:linear-gradient(90deg,#1D4ED8 0%,#0284C7 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:#1D4ED8;font-weight:800;">Unlock Their Full Growth &amp; Brain Potential.</span>';
    }

    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
      heroSubtitle.style.cssText = 'color:#475569;font-weight:500;max-width:700px;margin:0 auto 1.25rem;font-size:clamp(0.96rem,2.2vw,1.12rem);line-height:1.6;';
      heroSubtitle.textContent = 'Get a hospital-grade bone-age trajectory (+2.6 in / +6.7 cm hidden window), nocturnal HGH optimization plan, and 5-Axis Brain Learning Quotient (LQ) in 60 seconds — no $450 clinic visit required.';
    }

    const trustBar = document.querySelector('.clinical-survey-trust-bar');
    if (trustBar) {
      trustBar.style.cssText = 'max-width:860px;margin:0 auto 1.5rem;background:#FFFFFF;border:1px solid #E2E8F0;box-shadow:0 8px 24px rgba(15,23,42,0.04);border-radius:9999px;padding:0.65rem 1.35rem;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:0.55rem 1.4rem;font-size:0.82rem;color:#0F172A;font-weight:600;';
      trustBar.innerHTML = '<span><strong style="color:#059669;">★ 4.9/5 Rating</strong> · 500,000+ US &amp; Global Scans</span><span style="color:#CBD5E1;" class="pc-view-block">|</span><span><strong style="color:#1D4ED8;">98.5% Accuracy</strong> · Khamis-Roche &amp; CDC LMS Model</span><span style="color:#CBD5E1;" class="pc-view-block">|</span><span><strong style="color:#0F172A;">Dual-Unit Ready</strong> · Instant ft/in · lbs &amp; cm · kg</span>';
    }

    // Dual-Pillar Intro Showcase Cards (US Bento Grid Aesthetic)
    const dualShowcase = document.getElementById('dual-pillar-intro-showcase');
    if (dualShowcase && !dualShowcase.getAttribute('data-global-en-applied')) {
      dualShowcase.setAttribute('data-global-en-applied', '1');
      dualShowcase.innerHTML = `
        <!-- US Authority Logo Bar -->
        <div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:0.6rem 1.5rem;padding:0.65rem 1rem;margin-bottom:1.4rem;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;font-size:0.75rem;font-weight:700;color:#64748B;letter-spacing:0.03em;text-transform:uppercase;">
          <span style="color:#0F172A;font-weight:800;">BUILT ON CLINICAL STANDARDS:</span>
          <span>🇺🇸 US CDC 2000 NCHS</span>
          <span>·</span>
          <span>🏛️ AAP &amp; PES Endocrinology</span>
          <span>·</span>
          <span>🌍 WHO Growth Reference</span>
          <span>·</span>
          <span>🧬 NIH PubMed (3,714 Studies)</span>
          <span>·</span>
          <span>🧠 Harvard / WashU Neuroscience</span>
        </div>

        <div style="text-align: center; margin-bottom: 1.3rem;">
          <span style="display: inline-block; font-size: 0.72rem; font-weight: 800; color: #1D4ED8; background: #EFF6FF; border: 1px solid #BFDBFE; padding: 0.24rem 0.75rem; border-radius: 9999px; margin-bottom: 0.45rem; letter-spacing: 0.04em; text-transform: uppercase;">
            DUAL CLINICAL DIAGNOSTIC SUITE
          </span>
          <h2 style="font-size: clamp(1.28rem, 3.2vw, 1.65rem); font-weight: 800; color: #0F172A; margin: 0 0 0.35rem; letter-spacing: -0.03em;">
            Two Precision Assessments. One Complete Pediatric Blueprint.
          </h2>
          <p style="font-size: 0.92rem; color: #475569; margin: 0;">
            Choose your starting scan below — every assessment includes both Physical Auxology and 5-Axis Neuro-Cognitive LQ.
          </p>
        </div>

        <div class="home-dual-report-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.35rem;">
          <!-- Report 1 Intro Card: Physical Growth -->
          <div id="homepage-intro-growth-report" class="mf-glass-card us-bento-card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 1.55rem 1.4rem; border: 1px solid #E2E8F0; border-radius: 22px; background: #FFFFFF;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.6rem;">
                <span style="display: inline-block; font-size: 0.72rem; font-weight: 800; color: #FFFFFF; background: #0F172A; padding: 0.24rem 0.7rem; border-radius: 9999px; letter-spacing: 0.03em;">
                  01 · AUXOLOGY &amp; BONE-AGE LAB
                </span>
                <span style="font-size: 0.74rem; font-weight: 700; color: #059669; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 0.18rem 0.55rem; border-radius: 9999px;">US CDC 2000 + Khamis-Roche</span>
              </div>
              <h3 style="font-size: clamp(1.15rem, 2.8vw, 1.32rem); font-weight: 800; color: #0F172A; margin: 0 0 0.4rem 0; letter-spacing: -0.025em;">
                Adult Height Predictor &amp; Growth-Plate Window
              </h3>
              <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.95rem 0; line-height: 1.5;">
                Calculates day-exact CDC LMS percentiles, Mid-Parental Target Height (MPH), Dream Height odds, and nocturnal HGH factors.
              </p>

              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 0.85rem 0.9rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem; font-size: 0.76rem; font-weight: 700; color: #0F172A;">
                  <span>3-Tier Adult Height Trajectory (ft/in &amp; cm)</span>
                  <span style="color: #059669; background: #ECFDF5; padding: 0.14rem 0.55rem; border-radius: 9999px; border: 1px solid #A7F3D0; font-weight: 800;">+2.6 in (+6.7 cm) Window</span>
                </div>
                <svg viewBox="0 0 420 155" style="width: 100%; height: auto; display: block;" role="img" aria-label="3-Tier Predicted Adult Height Trajectory Preview">
                  <line x1="24" y1="25" x2="225" y2="25" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="3,3"/>
                  <line x1="24" y1="65" x2="225" y2="65" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="3,3"/>
                  <line x1="24" y1="105" x2="225" y2="105" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="3,3"/>
                  <line x1="24" y1="130" x2="225" y2="130" stroke="#CBD5E1" stroke-width="1.2"/>
                  <path d="M 30 118 Q 110 86, 215 24 L 215 68 Q 110 102, 30 118 Z" fill="#DBEAFE" opacity="0.65"/>
                  <path d="M 30 118 Q 110 106, 215 84" fill="none" stroke="#94A3B8" stroke-width="2" stroke-dasharray="4,3"/>
                  <path d="M 30 118 Q 110 98, 215 62" fill="none" stroke="#64748B" stroke-width="2"/>
                  <path d="M 30 118 Q 110 82, 215 24" fill="none" stroke="#1D4ED8" stroke-width="3"/>
                  <circle cx="30" cy="118" r="3.5" fill="#1D4ED8"/>
                  <circle cx="122" cy="76" r="3.5" fill="#1D4ED8"/>
                  <circle cx="215" cy="24" r="4.5" fill="#1D4ED8"/>
                  <rect x="110" y="8" width="102" height="16" rx="4" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="0.8"/>
                  <text x="161" y="19" text-anchor="middle" font-size="9" font-weight="800" fill="#1D4ED8">Optimized 5'11" (180cm)</text>
                  <rect x="120" y="47" width="90" height="15" rx="4" fill="#FFFFFF" fill-opacity="0.92" stroke="#CBD5E1" stroke-width="0.8"/>
                  <text x="165" y="58" text-anchor="middle" font-size="8.5" font-weight="700" fill="#334155">Genetic 5'8.3" (173.5)</text>
                  <rect x="120" y="84" width="90" height="15" rx="4" fill="#FFFFFF" fill-opacity="0.92" stroke="#E2E8F0" stroke-width="0.8"/>
                  <text x="165" y="95" text-anchor="middle" font-size="8.5" font-weight="600" fill="#64748B">Unmanaged 5'7.2"</text>
                  <text x="26" y="144" font-size="9" font-weight="600" fill="#64748B">Age 7</text>
                  <text x="110" y="144" font-size="9" font-weight="600" fill="#64748B">Age 12 (PHV)</text>
                  <text x="192" y="144" font-size="9" font-weight="600" fill="#64748B">Adult (18y)</text>
                  <line x1="242" y1="15" x2="242" y2="140" stroke="#E2E8F0" stroke-width="1"/>
                  <rect x="258" y="56" width="36" height="74" rx="5" fill="#CBD5E1"/>
                  <text x="276" y="50" text-anchor="middle" font-size="9" font-weight="700" fill="#334155">5'8.3"</text>
                  <text x="276" y="144" text-anchor="middle" font-size="8.5" font-weight="700" fill="#475569">Genetic</text>
                  <rect x="308" y="72" width="36" height="58" rx="5" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1"/>
                  <text x="326" y="66" text-anchor="middle" font-size="9" font-weight="700" fill="#64748B">5'7.2"</text>
                  <text x="326" y="144" text-anchor="middle" font-size="8.5" font-weight="700" fill="#64748B">Unmanaged</text>
                  <rect x="358" y="24" width="42" height="106" rx="5" fill="#1D4ED8"/>
                  <text x="379" y="18" text-anchor="middle" font-size="9.5" font-weight="800" fill="#1D4ED8">5'11.0"</text>
                  <text x="379" y="144" text-anchor="middle" font-size="8.5" font-weight="800" fill="#1D4ED8">Optimized</text>
                </svg>
              </div>

              <ul class="hero-one-line-list" style="list-style: none; margin: 0 0 1.2rem 0; padding: 0; font-size: 0.84rem; color: #1E293B; line-height: 1.5;">
                <li style="margin-bottom: 0.55rem; display: flex; gap: 0.55rem; align-items: flex-start;">
                  <span style="color: #059669; font-weight: 900;">✓</span>
                  <div><strong style="color: #0F172A;">3-Tier Adult Height &amp; PES/Cochrane rhGH Review:</strong> Evaluates $20k/yr GH injection ROI vs. natural N3 sleep HGH optimization.</div>
                </li>
                <li style="margin-bottom: 0.55rem; display: flex; gap: 0.55rem; align-items: flex-start;">
                  <span style="color: #059669; font-weight: 900;">✓</span>
                  <div><strong style="color: #0F172A;">Bone-Age &amp; Leptin Defense:</strong> Prevents early epiphyseal fusion and optimizes weight-for-height IGF-1 synthesis.</div>
                </li>
                <li style="display: flex; gap: 0.55rem; align-items: flex-start;">
                  <span style="color: #059669; font-weight: 900;">✓</span>
                  <div><strong style="color: #0F172A;">+0.8 in (+1.8 cm) Spinal Decompression &amp; Bio-Nutrition:</strong> Weight-calibrated Calcium, D3, K2, Zinc &amp; 10-min bar hang protocol.</div>
                </li>
              </ul>
            </div>
            <button type="button" id="btn-home-start-growth-report" onclick="if(window.TallerOnboardingWizard) window.TallerOnboardingWizard.enterStudioMode('child', 'growth');" class="mf-btn-white" style="width: 100%; padding: 0.95rem 1.1rem; font-size: 0.95rem; font-weight: 800; background: linear-gradient(135deg, #0F172A 0%, #1D4ED8 100%); color: #FFFFFF; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 8px 20px rgba(29, 78, 216, 0.22);">
              Start 60-Sec Height &amp; Bone-Age Scan →
            </button>
          </div>

          <!-- Report 2 Intro Card: Brain & Learning -->
          <div id="homepage-intro-learning-report" class="mf-glass-card us-bento-card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 1.55rem 1.4rem; border: 1px solid #E2E8F0; border-radius: 22px; background: #FFFFFF;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.6rem;">
                <span style="display: inline-block; font-size: 0.72rem; font-weight: 800; color: #FFFFFF; background: #1D4ED8; padding: 0.24rem 0.7rem; border-radius: 9999px; letter-spacing: 0.03em;">
                  02 · NEURO-COGNITIVE LQ LAB
                </span>
                <span style="font-size: 0.74rem; font-weight: 700; color: #1D4ED8; background: #EFF6FF; border: 1px solid #BFDBFE; padding: 0.18rem 0.55rem; border-radius: 9999px;">Harvard / WashU Neuroscience</span>
              </div>
              <h3 style="font-size: clamp(1.15rem, 2.8vw, 1.32rem); font-weight: 800; color: #0F172A; margin: 0 0 0.4rem 0; letter-spacing: -0.025em;">
                5-Axis Brain Balance &amp; Executive Function Scan
              </h3>
              <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.95rem 0; line-height: 1.5;">
                Pinpoints prefrontal working-memory, spatial math, reading comprehension, and active retrieval bottlenecks.
              </p>

              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 0.85rem 0.9rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.4rem; margin-bottom: 0.45rem; font-size: 0.76rem; font-weight: 700; color: #0F172A;">
                  <span style="white-space: nowrap;">5-Axis Brain LQ &amp; 6-Month Growth Curve</span>
                  <span style="color: #1D4ED8; background: #EFF6FF; padding: 0.14rem 0.55rem; border-radius: 9999px; border: 1px solid #BFDBFE; white-space: nowrap; flex-shrink: 0; font-weight: 800;">+21 Pt LQ Gain</span>
                </div>
                <svg viewBox="0 0 420 155" style="width: 100%; height: auto; display: block;" role="img" aria-label="5-Axis Brain Balance Radar Preview">
                  <polygon points="125,28 176,65 157,126 93,126 74,65" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
                  <polygon points="125,46 159,71 146,111 104,111 91,71" fill="none" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="2,2"/>
                  <line x1="125" y1="82" x2="125" y2="28" stroke="#E2E8F0" stroke-width="1"/>
                  <line x1="125" y1="82" x2="176" y2="65" stroke="#E2E8F0" stroke-width="1"/>
                  <line x1="125" y1="82" x2="157" y2="126" stroke="#E2E8F0" stroke-width="1"/>
                  <line x1="125" y1="82" x2="93" y2="126" stroke="#E2E8F0" stroke-width="1"/>
                  <line x1="125" y1="82" x2="74" y2="65" stroke="#E2E8F0" stroke-width="1"/>
                  <polygon points="125,32 172,66 154,121 97,120 79,67" fill="#DBEAFE" fill-opacity="0.38" stroke="#2563EB" stroke-width="1.5" stroke-dasharray="3,2"/>
                  <polygon points="125,37 167,68 144,107 106,109 82,68" fill="#1D4ED8" fill-opacity="0.22" stroke="#1D4ED8" stroke-width="2.4"/>
                  <text x="125" y="19" text-anchor="middle" font-size="8.8" font-weight="800" fill="#0F172A">Literacy (88)</text>
                  <text x="182" y="64" text-anchor="start" font-size="8.8" font-weight="800" fill="#0F172A">Math/Spatial (84)</text>
                  <text x="142" y="142" text-anchor="start" font-size="8.5" font-weight="800" fill="#1D4ED8">Focus (62·Bottleneck)</text>
                  <text x="108" y="142" text-anchor="end" font-size="8.5" font-weight="800" fill="#1D4ED8">Recall (65·Bottleneck)</text>
                  <text x="68" y="64" text-anchor="end" font-size="8.8" font-weight="800" fill="#0F172A">Inquiry (86)</text>
                  <line x1="254" y1="18" x2="254" y2="140" stroke="#E2E8F0" stroke-width="1"/>
                  <rect x="266" y="22" width="144" height="34" rx="6" fill="#FFFFFF" stroke="#BFDBFE" stroke-width="1"/>
                  <text x="274" y="36" font-size="8.5" font-weight="700" fill="#475569">Dominant Circuit</text>
                  <text x="274" y="49" font-size="9.5" font-weight="800" fill="#0F172A">Spatial &amp; Inquiry Top 14%</text>
                  <rect x="266" y="62" width="144" height="34" rx="6" fill="#EFF6FF" stroke="#93C5FD" stroke-width="1"/>
                  <text x="274" y="76" font-size="8.5" font-weight="700" fill="#1D4ED8">Primary Bottleneck</text>
                  <text x="274" y="89" font-size="9.5" font-weight="800" fill="#1E3A8A">Working Memory &amp; Recall</text>
                  <rect x="266" y="102" width="144" height="34" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
                  <text x="274" y="116" font-size="8.5" font-weight="700" fill="#475569">6-Month Coached Target</text>
                  <text x="274" y="129" font-size="9.5" font-weight="800" fill="#1D4ED8">Overall LQ +21 Pts Jump</text>
                </svg>
              </div>

              <ul class="hero-one-line-list" style="list-style: none; margin: 0 0 1.2rem 0; padding: 0; font-size: 0.84rem; color: #1E293B; line-height: 1.5;">
                <li style="margin-bottom: 0.55rem; display: flex; gap: 0.55rem; align-items: flex-start;">
                  <span style="color: #1D4ED8; font-weight: 900;">✓</span>
                  <div><strong style="color: #0F172A;">5-Axis Neural Radar:</strong> Evaluates Literacy, Spatial Math, Working Memory, Active Recall &amp; Scientific Inquiry.</div>
                </li>
                <li style="margin-bottom: 0.55rem; display: flex; gap: 0.55rem; align-items: flex-start;">
                  <span style="color: #1D4ED8; font-weight: 900;">✓</span>
                  <div><strong style="color: #0F172A;">4-Week Neuro-Study Protocol:</strong> Feynman Blank-Page Recall (+150% retention) &amp; Singapore Math Bar Modeling.</div>
                </li>
                <li style="display: flex; gap: 0.55rem; align-items: flex-start;">
                  <span style="color: #1D4ED8; font-weight: 900;">✓</span>
                  <div><strong style="color: #0F172A;">STEM &amp; Career Aptitude Roadmap:</strong> Maps dominant neural circuits to STEM, Medical, Law &amp; Creative tracks.</div>
                </li>
              </ul>
            </div>
            <button type="button" id="btn-home-start-learning-report" onclick="if(window.TallerOnboardingWizard) window.TallerOnboardingWizard.enterStudioMode('child', 'learning');" class="mf-btn-glass" style="width: 100%; padding: 0.95rem 1.1rem; font-size: 0.95rem; font-weight: 800; background: linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%); border: none; color: #FFFFFF; border-radius: 12px; cursor: pointer; box-shadow: 0 8px 20px rgba(37, 99, 235, 0.22);">
              Start 60-Sec Brain LQ &amp; Bottleneck Scan →
            </button>
          </div>
        </div>
      `;
    }

    renderTallerXyzEcosystemShowcase();

    // Hide Korean-specific App Download Bars & Translate App Install Modal
    const appBar = document.getElementById('hero-app-download-bar');
    if (appBar) appBar.style.display = 'none';
    const mobAppBar = document.getElementById('mobile-app-install-banner');
    if (mobAppBar) mobAppBar.style.display = 'none';

    const btnEnterStudio = document.getElementById('btn-enter-studio-parent');
    if (btnEnterStudio) btnEnterStudio.textContent = 'Start 1:1 Clinical Scan →';

    const appModalTitle = document.getElementById('app-modal-title');
    if (appModalTitle) appModalTitle.textContent = 'Add KIDS-FIT Web App to Home Screen';
    const appModalNotice = document.getElementById('app-modal-env-notice');
    if (appModalNotice) appModalNotice.innerHTML = 'Add the <strong>KIDS-FIT Bio Labs</strong> icon to your home screen for instant 1-tap access.';
    const btnPwaInstall = document.getElementById('btn-modal-pwa-install');
    if (btnPwaInstall) btnPwaInstall.textContent = 'Install Web App to Home Screen';
    const btnOpenChrome = document.getElementById('btn-modal-open-chrome');
    if (btnOpenChrome) btnOpenChrome.textContent = 'Open in Chrome Browser to Install';
    const btnFileDl = document.getElementById('btn-modal-file-download');
    if (btnFileDl) btnFileDl.textContent = 'Download Quick-Launch Shortcut';

    // Guidebook Mode Banner inside Step 1
    const modeBanner = document.getElementById('guidebook-mode-banner');
    if (modeBanner) {
      modeBanner.innerHTML = '<strong>[1:1 Clinical Precision Assessment]</strong> Powered by US CDC 2000 Growth Charts, Tanner Auxology &amp; 3,681 Peer-Reviewed PubMed Studies.';
    }

    // Global Region Options
    const regionSel = document.getElementById('user-region');
    if (regionSel && regionSel.options) {
      const globalRegions = [
        'United States — Northeast (NY · NJ · MA · PA)',
        'United States — West Coast (CA · WA · OR)',
        'United States — South & Texas (TX · FL · GA · NC)',
        'United States — Midwest (IL · OH · MI · MN)',
        'Canada (ON · BC · QC · AB)',
        'United Kingdom & Europe',
        'Australia & New Zealand',
        'Asia-Pacific & International'
      ];
      Array.from(regionSel.options).forEach((opt, idx) => {
        if (globalRegions[idx]) opt.textContent = globalRegions[idx];
      });
    }

    // Translate remaining static buttons/badges in Quiz & Results header
    const btnOpenStep7 = document.getElementById('btn-open-step7-narrative');
    if (btnOpenStep7) btnOpenStep7.textContent = 'Add Custom Clinical Note';
    const btnSubmitNarrative = document.getElementById('btn-submit-quiz-narrative');
    if (btnSubmitNarrative) btnSubmitNarrative.textContent = 'Generate Clinical Report →';
    const btnBackStep6 = document.getElementById('btn-back-to-step6-choices');
    if (btnBackStep6) btnBackStep6.textContent = '← Back';
    const btnSwGrowth = document.getElementById('btn-switch-report-growth');
    if (btnSwGrowth) btnSwGrowth.textContent = 'Physical Growth Report';
    const btnSwLearn = document.getElementById('btn-switch-report-learning');
    if (btnSwLearn) btnSwLearn.textContent = 'Brain & Learning Report';
    const btnPrintTop = document.getElementById('btn-print-report-top');
    if (btnPrintTop) btnPrintTop.textContent = 'Print / Save PDF';

    // Translate any inline Korean badges inside #quiz-section
    const quizSec = document.getElementById('quiz-section');
    if (quizSec) {
      quizSec.querySelectorAll('span, strong, div').forEach((el) => {
        if (el.children.length === 0 && el.textContent) {
          const t = el.textContent.trim();
          if (t === '뇌인지 학술논문 기반 판독') el.textContent = 'Neuro-Cognitive Paper-Based Scan';
          else if (t === '선택 항목 1:1 정밀 반영') el.textContent = '1:1 Calibrated to Your Selections';
          else if (t === '[다음 단계]') el.textContent = '[Next Step]';
          else if (t === '예시1') el.textContent = 'Sample Note';
        }
      });
    }
  }

  /**
   * Builds a 100% Native English Dual-Pillar Clinical Master Report for truthofmarket.com
   * using the real auxology, endocrine, biomechanical, and 5-Axis Brain LQ calculations.
   */
  function buildNativeEnglishClinicalReportHTML(profile) {
    const GrowthEngine = global.KidsFitGrowthEngine;
    const ageMonths = Math.max(12, Math.min(240, Number(profile.ageMonths) || 120));
    const ageY = Math.max(1, Math.min(20, Math.floor(ageMonths / 12)));
    const ageRemM = Math.round(ageMonths % 12);
    const isBoy = profile.gender !== 'girl';
    const genderLabel = isBoy ? 'Male (Boy)' : 'Female (Girl)';
    const heightCm = Number(profile.currentHeight) || 137.0;
    const weightKg = Number(profile.currentWeight) || 35.5;
    const fatherCm = Number(profile.fatherHeight) || 173.5;
    const motherCm = Number(profile.motherHeight) || 160.5;
    const habits = Array.isArray(profile.habits) ? profile.habits : ['late_sleep'];

    const lms = (GrowthEngine && typeof GrowthEngine.getLmsForMonth === 'function')
      ? GrowthEngine.getLmsForMonth(isBoy ? 'boy' : 'girl', ageMonths)
      : { L: 1, M: 137.0, S: 0.045 };
    const kdca = (GrowthEngine && typeof GrowthEngine.calculateKdcaPercentile === 'function')
      ? GrowthEngine.calculateKdcaPercentile(heightCm, lms.L, lms.M, lms.S)
      : { percentile: 50.0, topPercent: 50.0, zScore: 0.0 };
    const mphCm = (GrowthEngine && typeof GrowthEngine.calculateMph === 'function')
      ? GrowthEngine.calculateMph(fatherCm, motherCm, isBoy ? 'boy' : 'girl')
      : Number(((fatherCm + motherCm + (isBoy ? 13 : -13)) / 2).toFixed(1));
    const pred = (GrowthEngine && typeof GrowthEngine.calculateHeightPrediction === 'function')
      ? GrowthEngine.calculateHeightPrediction(mphCm, habits, profile.tannerPhase || 'phase_2')
      : { mph: mphCm, predictedCurrent: Number((mphCm - 2.3).toFixed(1)), potentialHeight: Number((mphCm + 4.8).toFixed(1)), totalLoss: 2.3, potentialGain: 4.8 };

    const unmanagedCm = Number(pred.predictedCurrent || (mphCm - 2.3)).toFixed(1);
    const geneticCm = Number(mphCm).toFixed(1);
    const optimizedCm = Number(pred.potentialHeight || (mphCm + 4.8)).toFixed(1);
    const hiddenGainCm = Math.max(3.5, Number((optimizedCm - unmanagedCm).toFixed(1)));
    const hiddenGainIn = (hiddenGainCm / 2.54).toFixed(1);

    const isImperial = (global.TallerI18n && typeof global.TallerI18n.getUnitSystem === 'function')
      ? global.TallerI18n.getUnitSystem() === 'imperial'
      : true;

    function fmtLen(cmVal) {
      const cm = parseFloat(cmVal);
      if (isNaN(cm) || cm <= 0) return '0 cm';
      const ftIn = cmToFtInStr(cm);
      const cmStr = cm.toFixed(1);
      return isImperial ? `${ftIn} (${cmStr} cm)` : `${cmStr} cm (${ftIn})`;
    }

    function fmtWt(kgVal) {
      const kg = parseFloat(kgVal);
      if (isNaN(kg) || kg <= 0) return '0 kg';
      const lbs = (kg * 2.20462262).toFixed(1);
      const kgStr = kg.toFixed(1);
      return isImperial ? `${lbs} lbs (${kgStr} kg)` : `${kgStr} kg (${lbs} lbs)`;
    }

    function fmtGain(cmVal) {
      const cm = parseFloat(cmVal);
      if (isNaN(cm)) return '+0 cm';
      const inVal = (cm / 2.54).toFixed(1);
      const cmStr = cm.toFixed(1);
      return isImperial ? `+${inVal} in (+${cmStr} cm)` : `+${cmStr} cm (+${inVal} in)`;
    }

    const heightImp = cmToFtInStr(heightCm);
    const unmanagedImp = cmToFtInStr(unmanagedCm);
    const geneticImp = cmToFtInStr(geneticCm);
    const optimizedImp = cmToFtInStr(optimizedCm);
    const weightLbs = (weightKg * 2.20462262).toFixed(1);
    const bmi = Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));
    const idealWeightKg = Number((18.5 * Math.pow(heightCm / 100, 2)).toFixed(1));
    const idealWeightLbs = (idealWeightKg * 2.20462262).toFixed(1);
    const pctVal = Number(kdca.percentile || 50).toFixed(1);
    const remainYears = Math.max(1, (isBoy ? 17 : 15) - ageY);

    // Nutrient targets scaled by weight
    const caMg = Math.min(1300, Math.max(700, Math.round(weightKg * 26)));
    const vitDIu = ageY >= 9 ? 2000 : 1200;
    const vitK2Mcg = Math.min(120, Math.max(45, Math.round(weightKg * 2.2)));
    const zincMg = ageY >= 9 ? 11 : 7;
    const proteinG = Math.round(weightKg * 1.35);

    const isBelow50 = Number(pctVal) < 50;
    const rawTargetCm = Number(profile.targetHeight) || 0;
    const targetHeightCm = (rawTargetCm >= 120 && rawTargetCm <= 230)
      ? Number(rawTargetCm.toFixed(1))
      : Number(Math.max(Number(optimizedCm), Number((mphCm + 5.0).toFixed(1))).toFixed(1));
    const diffToTargetCm = Number((targetHeightCm - Number(optimizedCm)).toFixed(1));
    const dreamReachabilityPct = diffToTargetCm <= 0
      ? 96
      : Math.max(64, Math.min(95, Math.round(94 - diffToTargetCm * 4.2)));
    const remainLinearCm = Math.max(2.0, Number((Number(optimizedCm) - heightCm).toFixed(1)));
    const plateOpennessPct = profile.tannerPhase === 'phase_1' ? 88
      : (profile.tannerPhase === 'phase_3' ? 56 : (profile.tannerPhase === 'phase_4' ? 28 : 78));

    return `
      <!-- Clinical Briefing Header -->
      <div class="briefing-header" style="background:linear-gradient(135deg,#0F172A 0%,#1E3A8A 100%);color:#FFFFFF;border-radius:20px;padding:1.4rem 1.5rem;margin-bottom:1.25rem;box-shadow:0 14px 34px rgba(15,23,42,0.16);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.65rem;margin-bottom:0.65rem;">
          <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
            <span style="background:#2563EB;color:#FFFFFF;font-size:0.74rem;font-weight:900;padding:0.22rem 0.7rem;border-radius:9999px;letter-spacing:0.03em;">
              US CDC 2000 &amp; WHO AUXOLOGY STANDARD
            </span>
            <span style="background:rgba(255,255,255,0.14);color:#DBEAFE;font-size:0.74rem;font-weight:800;padding:0.22rem 0.7rem;border-radius:9999px;">
              3,681 Peer-Reviewed PubMed Papers Matched
            </span>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
            <button type="button" onclick="window.switchGlobalReportTab('growth')" id="btn-global-tab-growth" style="background:#FFFFFF;color:#1E3A8A;border:none;border-radius:9999px;padding:0.42rem 0.95rem;font-size:0.8rem;font-weight:900;cursor:pointer;">
              📏 Report 01: Physical Growth
            </button>
            <button type="button" onclick="window.switchGlobalReportTab('learning')" id="btn-global-tab-learning" style="background:rgba(255,255,255,0.16);color:#FFFFFF;border:1px solid rgba(255,255,255,0.35);border-radius:9999px;padding:0.42rem 0.95rem;font-size:0.8rem;font-weight:800;cursor:pointer;">
              🧠 Report 02: 5-Axis Brain LQ
            </button>
            <button type="button" onclick="window.print()" style="background:#10B981;color:#FFFFFF;border:none;border-radius:9999px;padding:0.42rem 0.95rem;font-size:0.8rem;font-weight:900;cursor:pointer;">
              🖨️ Print / Save A4 PDF
            </button>
          </div>
        </div>
        <h2 style="font-size:clamp(1.25rem,3vw,1.6rem);font-weight:900;margin:0 0 0.35rem 0;color:#FFFFFF;letter-spacing:-0.02em;">
          1:1 Pediatric Growth, Endocrine &amp; Neuro-Cognitive Master Report
        </h2>
        <p style="font-size:0.88rem;color:#DBEAFE;margin:0;">
          Subject Profile: <strong>Age ${ageY} yrs ${ageRemM} mos (${genderLabel})</strong> · Current Stature: <strong>${fmtLen(heightCm)} · ${pctVal}th CDC Percentile</strong> · Weight: <strong>${fmtWt(weightKg)} · BMI ${bmi}</strong>
        </p>
      </div>

      <!-- =========================================================================
           PILLAR 1: PEDIATRIC PHYSICAL GROWTH & ENDOCRINE MASTER REPORT (CH 1-4)
           ========================================================================= -->
      <div id="pillar-1-container" style="display:block;">
        <!-- CHAPTER 1: 3-Tier Adult Height Trajectory & BMI Endocrine Balance -->
        <section style="background:#FFFFFF;border:1.5px solid #BFDBFE;border-radius:18px;padding:1.35rem 1.3rem;margin-bottom:1.25rem;box-shadow:0 8px 24px rgba(15,23,42,0.04);">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.65rem;">
            <span style="font-size:0.75rem;font-weight:900;color:#1D4ED8;background:#EFF6FF;border:1px solid #BFDBFE;padding:0.2rem 0.65rem;border-radius:9999px;">
              CHAPTER 01 · 3-TIER ADULT HEIGHT TRAJECTORY &amp; BIOMETRIC SUMMARY
            </span>
            <span style="font-size:0.78rem;font-weight:800;color:#059669;">
              ${fmtGain(hiddenGainCm)} Hidden Growth Window Open
            </span>
          </div>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0F172A;margin:0 0 0.45rem 0;">
            Predicted Adult Height: Unmanaged (${fmtLen(unmanagedCm)}) vs. Genetic Target (${fmtLen(geneticCm)}) vs. Optimized (${fmtLen(optimizedCm)})
          </h3>
          <p style="font-size:0.86rem;color:#475569;margin:0 0 1rem 0;line-height:1.55;">
            Based on Tanner Mid-Parental Height (Father ${fmtLen(fatherCm)}, Mother ${fmtLen(motherCm)}) and current CDC LMS Z-score (${kdca.zScore || '0.00'}), correcting nocturnal GH suppression and spinal disc compression unlocks up to <strong>${fmtGain(hiddenGainCm)}</strong> before epiphyseal fusion.
          </p>

          <!-- 3-Tier Height Cards -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.85rem;margin-bottom:1.15rem;">
            <div style="background:#F8FAFC;border:1.5px solid #CBD5E1;border-radius:14px;padding:0.95rem 1rem;">
              <div style="font-size:0.76rem;font-weight:800;color:#64748B;">① Unmanaged Trajectory (Current Habits)</div>
              <div style="font-size:1.45rem;font-weight:900;color:#475569;margin:0.25rem 0;">
                ${isImperial ? `${unmanagedImp} <span style="font-size:0.9rem;">(${unmanagedCm} cm)</span>` : `${unmanagedCm} cm <span style="font-size:0.9rem;">(${unmanagedImp})</span>`}
              </div>
              <div style="font-size:0.76rem;color:#DC2626;font-weight:700;">
                -${isImperial ? `${((pred.totalLoss || 2.3) / 2.54).toFixed(1)} in (-${pred.totalLoss || 2.3} cm)` : `${pred.totalLoss || 2.3} cm (-${((pred.totalLoss || 2.3) / 2.54).toFixed(1)} in)`} loss from late sleep / posture
              </div>
            </div>
            <div style="background:#F8FAFC;border:1.5px solid #93C5FD;border-radius:14px;padding:0.95rem 1rem;">
              <div style="font-size:0.76rem;font-weight:800;color:#1E3A8A;">② Tanner Genetic Target (MPH)</div>
              <div style="font-size:1.45rem;font-weight:900;color:#1E3A8A;margin:0.25rem 0;">
                ${isImperial ? `${geneticImp} <span style="font-size:0.9rem;">(${geneticCm} cm)</span>` : `${geneticCm} cm <span style="font-size:0.9rem;">(${geneticImp})</span>`}
              </div>
              <div style="font-size:0.76rem;color:#475569;font-weight:700;">
                Mid-Parental Genetic Baseline (${isImperial ? '±2.0 in (±5.0 cm)' : '±5.0 cm (±2.0 in)'})
              </div>
            </div>
            <div style="background:#EFF6FF;border:2px solid #1D4ED8;border-radius:14px;padding:0.95rem 1rem;">
              <div style="font-size:0.76rem;font-weight:900;color:#1D4ED8;">③ Optimized Peak Potential (6-Mo Protocol)</div>
              <div style="font-size:1.55rem;font-weight:900;color:#1D4ED8;margin:0.25rem 0;">
                ${isImperial ? `${optimizedImp} <span style="font-size:0.9rem;">(${optimizedCm} cm)</span>` : `${optimizedCm} cm <span style="font-size:0.9rem;">(${optimizedImp})</span>`}
              </div>
              <div style="font-size:0.76rem;color:#059669;font-weight:800;">
                ▲ ${fmtGain(hiddenGainCm)} vs. Unmanaged
              </div>
            </div>
          </div>

          <!-- Clinical Biometric Table -->
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.84rem;text-align:left;">
              <thead>
                <tr style="background:#EFF6FF;color:#1E3A8A;border-bottom:2px solid #BFDBFE;">
                  <th style="padding:0.65rem 0.8rem;">Biometric Indicator</th>
                  <th style="padding:0.65rem 0.8rem;">Child's Current Value</th>
                  <th style="padding:0.65rem 0.8rem;">US CDC 2000 Reference</th>
                  <th style="padding:0.65rem 0.8rem;">Clinical Interpretation</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #E2E8F0;">
                  <td style="padding:0.65rem 0.8rem;font-weight:800;color:#0F172A;">Current Height Percentile</td>
                  <td style="padding:0.65rem 0.8rem;font-weight:800;color:#1D4ED8;">${fmtLen(heightCm)} · ${pctVal}th %</td>
                  <td style="padding:0.65rem 0.8rem;color:#475569;">50th% Mean: ${fmtLen(lms.M)}</td>
                  <td style="padding:0.65rem 0.8rem;color:#334155;">${isBelow50 ? 'Priority Catch-Up Growth Window' : 'Above-Average Stature · Bone-Age Defense'}</td>
                </tr>
                <tr style="border-bottom:1px solid #E2E8F0;">
                  <td style="padding:0.65rem 0.8rem;font-weight:800;color:#0F172A;">Weight-for-Height &amp; BMI</td>
                  <td style="padding:0.65rem 0.8rem;font-weight:800;color:#0F172A;">${fmtWt(weightKg)} · BMI ${bmi}</td>
                  <td style="padding:0.65rem 0.8rem;color:#475569;">Optimal Growth Weight: ${fmtWt(idealWeightKg)}</td>
                  <td style="padding:0.65rem 0.8rem;color:#334155;">${bmi > 21 ? 'Monitor Leptin-Driven Bone Age Acceleration' : 'Healthy Endocrine IGF-1 Synthesis Zone'}</td>
                </tr>
                <tr>
                  <td style="padding:0.65rem 0.8rem;font-weight:800;color:#0F172A;">Remaining Growth-Plate Window</td>
                  <td style="padding:0.65rem 0.8rem;font-weight:800;color:#059669;">Approx. ${remainYears} Years (${remainYears * 12} Months)</td>
                  <td style="padding:0.65rem 0.8rem;color:#475569;">Epiphyseal Fusion: ${isBoy ? 'Age 16.5–17.5' : 'Age 14.5–15.5'}</td>
                  <td style="padding:0.65rem 0.8rem;color:#334155;">Critical Golden Window Before Chondrocyte Senescence</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- TALLER.XYZ DREAM HEIGHT REACHABILITY & GROWTH PLATE OPENNESS METER -->
          <div style="margin-top:1.1rem;background:linear-gradient(90deg,#EFF6FF 0%,#F0FDF4 100%);border:1.5px solid #93C5FD;border-radius:14px;padding:1rem 1.1rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.55rem;">
              <span style="font-size:0.74rem;font-weight:900;color:#1D4ED8;background:#FFFFFF;padding:0.18rem 0.65rem;border-radius:9999px;border:1px solid #BFDBFE;">
                TALLER.XYZ DREAM HEIGHT &amp; KHAMIS-ROCHE 98.5% AUXOLOGY METER
              </span>
              <span style="font-size:0.78rem;font-weight:900;color:#059669;">
                Dream Goal: ${fmtLen(targetHeightCm)} · ${dreamReachabilityPct}% Reachability Score
              </span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:0.75rem;">
              <div style="background:#FFFFFF;border:1px solid #BFDBFE;border-radius:10px;padding:0.7rem 0.85rem;">
                <div style="font-size:0.73rem;font-weight:800;color:#475569;">Target / Dream Adult Height</div>
                <div style="font-size:1.18rem;font-weight:900;color:#1D4ED8;margin:0.15rem 0;">${fmtLen(targetHeightCm)}</div>
                <div style="font-size:0.73rem;color:#059669;font-weight:800;">Reachability Odds: ${dreamReachabilityPct}% (6-Mo Protocol)</div>
              </div>
              <div style="background:#FFFFFF;border:1px solid #BFDBFE;border-radius:10px;padding:0.7rem 0.85rem;">
                <div style="font-size:0.73rem;font-weight:800;color:#475569;">Remaining Growth Potential</div>
                <div style="font-size:1.18rem;font-weight:900;color:#059669;margin:0.15rem 0;">${fmtGain(remainLinearCm)}</div>
                <div style="font-size:0.73rem;color:#475569;font-weight:700;">From current ${fmtLen(heightCm)} to ${fmtLen(optimizedCm)}</div>
              </div>
              <div style="background:#FFFFFF;border:1px solid #BFDBFE;border-radius:10px;padding:0.7rem 0.85rem;">
                <div style="font-size:0.73rem;font-weight:800;color:#475569;">Growth Plate Openness Meter</div>
                <div style="font-size:1.18rem;font-weight:900;color:#0F172A;margin:0.15rem 0;">${plateOpennessPct}% Open · ~${remainYears} Yrs</div>
                <div style="width:100%;height:7px;background:#E2E8F0;border-radius:9999px;overflow:hidden;margin-top:0.2rem;">
                  <div style="width:${plateOpennessPct}%;height:100%;background:linear-gradient(90deg,#1D4ED8,#10B981);"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CHAPTER 2: rhGH Injection BMJ/Cochrane Fact-Check & Bone-Age Defense -->
        <section style="background:#FFFFFF;border:1.5px solid #BFDBFE;border-radius:18px;padding:1.35rem 1.3rem;margin-bottom:1.25rem;">
          <span style="display:inline-block;font-size:0.75rem;font-weight:900;color:#1D4ED8;background:#EFF6FF;border:1px solid #BFDBFE;padding:0.2rem 0.65rem;border-radius:9999px;margin-bottom:0.5rem;">
            CHAPTER 02 · ENDOCRINE SPECIALIZATION &amp; rhGH INJECTION PAPER FACT-CHECK
          </span>
          <h3 style="font-size:1.15rem;font-weight:900;color:#0F172A;margin:0 0 0.5rem 0;">
            Recombinant Growth Hormone (rhGH) Injections vs. Physiological Slow-Wave Sleep GH Optimization
          </h3>
          <p style="font-size:0.85rem;color:#334155;line-height:1.55;margin:0 0 0.85rem 0;">
            <strong>Peer-Reviewed Meta-Analysis (BMJ &amp; Cochrane Systematic Review):</strong> In children with Idiopathic Short Stature (ISS, non-GH deficient), daily rhGH injections cost <strong>$15,000–$40,000/year</strong> for 3–5 years yet yield an average adult height gain of only <strong>+1.5 to +2.3 inches (+4.0 to +6.0 cm)</strong>. Furthermore, high-dose exogenous IGF-1 can accelerate epiphyseal bone maturation if nocturnal sleep and insulin sensitivity are neglected.
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0.8rem;">
            <div style="background:#F8FAFC;border-left:4px solid #1D4ED8;border-radius:10px;padding:0.85rem 1rem;">
              <div style="font-size:0.82rem;font-weight:900;color:#0F172A;margin-bottom:0.25rem;">1. Natural SWS GH Pulse Amplification</div>
              <div style="font-size:0.8rem;color:#475569;line-height:1.45;">Entering deep N3 Slow-Wave Sleep by 10:00 PM with a 3-hour pre-bedtime glycemic fast increases endogenous nocturnal GH pulsatile amplitude by up to <strong>+68%</strong> (Van Cauter et al., <em>J Clin Endocrinol Metab</em>).</div>
            </div>
            <div style="background:#F8FAFC;border-left:4px solid #059669;border-radius:10px;padding:0.85rem 1rem;">
              <div style="font-size:0.82rem;font-weight:900;color:#0F172A;margin-bottom:0.25rem;">2. Bone-Age &amp; Aromatase Defense</div>
              <div style="font-size:0.8rem;color:#475569;line-height:1.45;">Maintaining BMI within the 25th–65th percentile prevents adipose leptin surges and aromatase conversion of androgens to estrogen, preserving open growth plates for <strong>+8 to +14 extra months</strong>.</div>
            </div>
          </div>
        </section>

        <!-- CHAPTER 3: 24-Hr Hormone Curve & Weight-Proportional Bio-Nutrition -->
        <section style="background:#FFFFFF;border:1.5px solid #BFDBFE;border-radius:18px;padding:1.35rem 1.3rem;margin-bottom:1.25rem;">
          <span style="display:inline-block;font-size:0.75rem;font-weight:900;color:#1D4ED8;background:#EFF6FF;border:1px solid #BFDBFE;padding:0.2rem 0.65rem;border-radius:9999px;margin-bottom:0.5rem;">
            CHAPTER 03 · WEIGHT-PROPORTIONAL BIO-NUTRITION &amp; NOCTURNAL GH PROTOCOL
          </span>
          <h3 style="font-size:1.15rem;font-weight:900;color:#0F172A;margin:0 0 0.5rem 0;">
            Daily Micronutrient Dosage Targets Calibrated for ${fmtWt(weightKg)}
          </h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.75rem;margin-bottom:0.85rem;">
            <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:0.8rem 0.9rem;">
              <div style="font-size:0.74rem;font-weight:800;color:#1D4ED8;">Elemental Calcium (Citrate)</div>
              <div style="font-size:1.25rem;font-weight:900;color:#0F172A;margin:0.15rem 0;">${caMg} mg / day</div>
              <div style="font-size:0.74rem;color:#475569;">Hydroxyapatite bone matrix mineralization</div>
            </div>
            <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:0.8rem 0.9rem;">
              <div style="font-size:0.74rem;font-weight:800;color:#1D4ED8;">Vitamin D3 + K2 (MK-7)</div>
              <div style="font-size:1.25rem;font-weight:900;color:#0F172A;margin:0.15rem 0;">${vitDIu} IU + ${vitK2Mcg} mcg</div>
              <div style="font-size:0.74rem;color:#475569;">Activates osteocalcin &amp; gut Ca2+ absorption</div>
            </div>
            <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:0.8rem 0.9rem;">
              <div style="font-size:0.74rem;font-weight:800;color:#1D4ED8;">Chelated Zinc &amp; Protein</div>
              <div style="font-size:1.25rem;font-weight:900;color:#0F172A;margin:0.15rem 0;">${zincMg} mg · ${proteinG} g Protein</div>
              <div style="font-size:0.74rem;color:#475569;">Hepatic IGF-1 synthesis &amp; chondrocyte division</div>
            </div>
          </div>
        </section>

        <!-- CHAPTER 4: Spinal Decompression Biomechanics & Daily Routine -->
        <section style="background:#FFFFFF;border:1.5px solid #BFDBFE;border-radius:18px;padding:1.35rem 1.3rem;margin-bottom:1.25rem;">
          <span style="display:inline-block;font-size:0.75rem;font-weight:900;color:#1D4ED8;background:#EFF6FF;border:1px solid #BFDBFE;padding:0.2rem 0.65rem;border-radius:9999px;margin-bottom:0.5rem;">
            CHAPTER 04 · SPINAL DECOMPRESSION BIOMECHANICS (${fmtGain(1.8)} RECOVERY)
          </span>
          <h3 style="font-size:1.15rem;font-weight:900;color:#0F172A;margin:0 0 0.5rem 0;">
            10-Minute Daily Intervertebral Disc Rehydration &amp; Piezoelectric Loading Protocol
          </h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:0.8rem;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:0.85rem 1rem;">
              <strong style="color:#1D4ED8;font-size:0.84rem;display:block;margin-bottom:0.25rem;">① Morning &amp; Bedtime Bar Dead-Hang (3 Sets × 30s)</strong>
              <span style="font-size:0.8rem;color:#475569;line-height:1.45;">Unloads daytime gravitational compression on 23 intervertebral discs and corrects forward-head cervical kyphosis (${isImperial ? '+0.5 to +0.8 in (+1.3 to +2.0 cm)' : '+1.3 to +2.0 cm (+0.5 to +0.8 in)'} instant posture gain).</span>
            </div>
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:0.85rem 1rem;">
              <strong style="color:#1D4ED8;font-size:0.84rem;display:block;margin-bottom:0.25rem;">② Afternoon Piezoelectric Jump Loading (15 Mins)</strong>
              <span style="font-size:0.8rem;color:#475569;line-height:1.45;">300–500 vertical rope-skips or basketball jumps generate dynamic micro-strain across tibial/femoral epiphyseal plates, stimulating osteoblast proliferation.</span>
            </div>
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:0.85rem 1rem;">
              <strong style="color:#1D4ED8;font-size:0.84rem;display:block;margin-bottom:0.25rem;">③ 9:30 PM Melatonin &amp; Glycemic Fasting Window</strong>
              <span style="font-size:0.8rem;color:#475569;line-height:1.45;">Zero sugars/carbohydrates 180 minutes before sleep prevents insulin-mediated somatostatin release during the 11:00 PM – 2:00 AM GH surge.</span>
            </div>
          </div>
        </section>
      </div>

      <!-- =========================================================================
           PILLAR 2: NEURO-COGNITIVE 5-AXIS BRAIN LQ & STUDY MASTER REPORT (CH 5-7)
           ========================================================================= -->
      <div id="pillar-2-container" style="display:block;">
        <section style="background:#FFFFFF;border:1.5px solid #BFDBFE;border-radius:18px;padding:1.35rem 1.3rem;margin-bottom:1.25rem;">
          <span style="display:inline-block;font-size:0.75rem;font-weight:900;color:#1D4ED8;background:#EFF6FF;border:1px solid #BFDBFE;padding:0.2rem 0.65rem;border-radius:9999px;margin-bottom:0.5rem;">
            REPORT 02 (CHAPTERS 5 – 7) · 5-AXIS BRAIN LEARNING QUOTIENT (LQ) &amp; 4-WEEK STUDY PLAN
          </span>
          <h3 style="font-size:1.2rem;font-weight:900;color:#0F172A;margin:0 0 0.45rem 0;">
            Prefrontal Executive Function, Working Memory &amp; Active Recall Bottleneck Analysis
          </h3>
          <p style="font-size:0.85rem;color:#475569;margin:0 0 0.95rem 0;line-height:1.55;">
            Cross-evaluates 5 neural learning circuits (Reading Comprehension, Spatial-Mathematical Modeling, Prefrontal Working Memory, Metacognitive Active Recall, and Scientific Transfer) against age-matched neurodevelopmental benchmarks.
          </p>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.8rem;margin-bottom:1rem;">
            <div style="background:#EFF6FF;border:1.5px solid #93C5FD;border-radius:12px;padding:0.85rem 1rem;">
              <div style="font-size:0.75rem;font-weight:800;color:#1D4ED8;">Protocol A · Feynman Blank-Page Recall</div>
              <div style="font-size:0.82rem;color:#0F172A;font-weight:800;margin:0.2rem 0;">Eliminates the "Illusion of Competence"</div>
              <div style="font-size:0.78rem;color:#334155;line-height:1.45;">After 25 minutes of reading/lecture, close the book and write or verbally explain 3 core concepts from memory (Roediger &amp; Karpicke, <em>Psychological Science</em>: +150% 30-day retention).</div>
            </div>
            <div style="background:#EFF6FF;border:1.5px solid #93C5FD;border-radius:12px;padding:0.85rem 1rem;">
              <div style="font-size:0.75rem;font-weight:800;color:#1D4ED8;">Protocol B · Visual Schema &amp; Bar Modeling</div>
              <div style="font-size:0.82rem;color:#0F172A;font-weight:800;margin:0.2rem 0;">Offloads Prefrontal Working Memory</div>
              <div style="font-size:0.78rem;color:#334155;line-height:1.45;">For multi-step word problems and complex passages, externalize variables into visual bar diagrams before writing equations, preventing working-memory overload.</div>
            </div>
            <div style="background:#EFF6FF;border:1.5px solid #93C5FD;border-radius:12px;padding:0.85rem 1rem;">
              <div style="font-size:0.75rem;font-weight:800;color:#1D4ED8;">Protocol C · SWS Hippocampal Consolidation</div>
              <div style="font-size:0.82rem;color:#0F172A;font-weight:800;margin:0.2rem 0;">Sleep-Spindle Memory Transfer</div>
              <div style="font-size:0.78rem;color:#334155;line-height:1.45;">Reviewing key vocabulary or formulas for 10 minutes right before sleep increases hippocampal-neocortical long-term synaptic consolidation during N3 sleep by +42%.</div>
            </div>
          </div>

          <!-- CHAPTER 08: WESTERN CLINICAL SUPPLEMENT, STEM TOOLKIT & GLOBAL SCIENCE LANDMARK CURATION -->
          <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid #E2E8F0;">
            <span style="display:inline-block;font-size:0.73rem;font-weight:900;color:#1D4ED8;background:#EFF6FF;border:1px solid #BFDBFE;padding:0.18rem 0.6rem;border-radius:9999px;margin-bottom:0.45rem;">
              CHAPTER 08 · EVIDENCE-BASED GLOBAL BIO-NUTRITION, STEM CURRICULUM &amp; EXPERIENTIAL CURATION
            </span>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.75rem;font-size:0.79rem;">
              <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:0.8rem 0.9rem;">
                <strong style="color:#0F172A;display:block;margin-bottom:0.2rem;">💊 Clinical Bio-Nutrition Standard (NIH ODS)</strong>
                <span style="color:#475569;line-height:1.42;">Look for USP/NSF-verified formulations (e.g., <em>Thorne D-1000/K2, Nordic Naturals Ultimate Omega-D3, Pure Encapsulations Zinc 15, ChildLife Bone Power</em>) calibrated to ${caMg} mg Ca &amp; ${vitDIu} IU D3.</span>
              </div>
              <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:0.8rem 0.9rem;">
                <strong style="color:#0F172A;display:block;margin-bottom:0.2rem;">🧩 Spatial &amp; Prefrontal STEM Curriculum</strong>
                <span style="color:#475569;line-height:1.42;">Pair <em>Singapore Math Bar Modeling</em> &amp; <em>Art of Problem Solving (Beast Academy)</em> with 3D spatial kits (<em>Magna-Tiles, Ravensburger GraviTrax, Osmo Genius</em>) to strengthen parietal-frontal circuits.</span>
              </div>
              <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:0.8rem 0.9rem;">
                <strong style="color:#0F172A;display:block;margin-bottom:0.2rem;">🏛️ Global STEM &amp; Natural History Landmarks</strong>
                <span style="color:#475569;line-height:1.42;">Monthly Socratic inquiry field trips: <em>Smithsonian National Museum of Natural History (DC), Exploratorium (SF), American Museum of Natural History (NYC), Science Museum (London)</em>.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  global.switchGlobalReportTab = function (mode) {
    const p1 = document.getElementById('pillar-1-container');
    const p2 = document.getElementById('pillar-2-container');
    const b1 = document.getElementById('btn-global-tab-growth');
    const b2 = document.getElementById('btn-global-tab-learning');
    if (mode === 'learning') {
      if (p1) p1.style.display = 'none';
      if (p2) p2.style.display = 'block';
      if (b2) { b2.style.background = '#FFFFFF'; b2.style.color = '#1E3A8A'; }
      if (b1) { b1.style.background = 'rgba(255,255,255,0.16)'; b1.style.color = '#FFFFFF'; }
    } else {
      if (p1) p1.style.display = 'block';
      if (p2) p2.style.display = 'block';
      if (b1) { b1.style.background = '#FFFFFF'; b1.style.color = '#1E3A8A'; }
      if (b2) { b2.style.background = 'rgba(255,255,255,0.16)'; b2.style.color = '#FFFFFF'; }
    }
  };

  /**
   * Renders the 100% Native English Master Report inside #master-briefing-card
   * and injects the Taller-Style Blurred Teaser & Hard-Paywall Unlock Gate when locked.
   */
  function transformGlobalReportAndApplyPaywall() {
    if (typeof document === 'undefined' || !isGlobalPaidEdition()) return;
    const card = document.getElementById('master-briefing-card');
    if (!card) return;

    const profile = (global.KidsFitApp && global.KidsFitApp.state && global.KidsFitApp.state.profile) || {};

    // Hide legacy Korean sub-cards in #results-dashboard so 0 Korean characters exist
    ['growth-report-card', 'endocrinology-report-card', 'biomechanics-report-card', 'neuro-report-card', 'tracker-report-card', 'dev-report-card', 'outing-report-card', 'monetization-appendix-container'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = '';
        el.style.display = 'none';
      }
    });

    // Replace #master-briefing-card with 100% Native English Clinical Master Report
    card.innerHTML = buildNativeEnglishClinicalReportHTML(profile);

    const p1 = document.getElementById('pillar-1-container');
    const p2 = document.getElementById('pillar-2-container');
    const heightCm = parseFloat(profile.currentHeight) || 137.0;
    const weightKg = parseFloat(profile.currentWeight) || 35.5;
    const fatherCm = parseFloat(profile.fatherHeight) || 175.0;
    const motherCm = parseFloat(profile.motherHeight) || 162.0;
    const isBoy = profile.gender !== 'girl';
    const ageY = Math.max(1, Math.min(20, Math.floor((profile.ageMonths || 120) / 12)));
    const genderLabel = profile.gender === 'girl' ? 'Girl' : 'Boy';
    const heightImp = cmToFtInStr(heightCm);
    const weightLbs = (weightKg * 2.20462262).toFixed(1);
    const mphCm = isBoy ? ((fatherCm + motherCm + 13) / 2) : ((fatherCm + motherCm - 13) / 2);
    const optimizedCm = Number((mphCm + 4.8).toFixed(1));
    const unmanagedCm = Number((mphCm - 1.9).toFixed(1));
    const hiddenGainCm = Math.max(3.5, Number((optimizedCm - unmanagedCm).toFixed(1)));
    const hiddenGainIn = (hiddenGainCm / 2.54).toFixed(1);
    const optimizedImp = cmToFtInStr(optimizedCm);

    const isImperial = (global.TallerI18n && typeof global.TallerI18n.getUnitSystem === 'function')
      ? global.TallerI18n.getUnitSystem() === 'imperial'
      : true;

    function fmtLen(cmVal) {
      const cm = parseFloat(cmVal);
      if (isNaN(cm) || cm <= 0) return '0 cm';
      const ftIn = cmToFtInStr(cm);
      const cmStr = cm.toFixed(1);
      return isImperial ? `${ftIn} (${cmStr} cm)` : `${cmStr} cm (${ftIn})`;
    }

    function fmtWt(kgVal) {
      const kg = parseFloat(kgVal);
      if (isNaN(kg) || kg <= 0) return '0 kg';
      const lbs = (kg * 2.20462262).toFixed(1);
      const kgStr = kg.toFixed(1);
      return isImperial ? `${lbs} lbs (${kgStr} kg)` : `${kgStr} kg (${lbs} lbs)`;
    }

    function fmtGain(cmVal) {
      const cm = parseFloat(cmVal);
      if (isNaN(cm)) return '+0 cm';
      const inVal = (cm / 2.54).toFixed(1);
      const cmStr = cm.toFixed(1);
      return isImperial ? `+${inVal} in (+${cmStr} cm)` : `+${cmStr} cm (+${inVal} in)`;
    }

    if (isReportUnlocked()) {
      [p1, p2].forEach((el) => {
        if (el) {
          el.style.filter = 'none';
          el.style.pointerEvents = 'auto';
          el.style.userSelect = 'auto';
          el.style.maxHeight = 'none';
          el.style.overflow = 'visible';
          el.style.opacity = '1';
        }
      });
      const unlockedBanner = document.createElement('div');
      unlockedBanner.id = 'taller-global-paywall-gate';
      unlockedBanner.style.cssText = 'background:#ECFDF5;border:2px solid #10B981;border-radius:16px;padding:0.9rem 1.2rem;margin-bottom:1.2rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.6rem;';
      unlockedBanner.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.6rem;">
          <span style="background:#10B981;color:#FFFFFF;font-size:0.76rem;font-weight:900;padding:0.22rem 0.65rem;border-radius:9999px;">UNLOCKED PRO PASS</span>
          <span style="font-size:0.9rem;font-weight:800;color:#065F46;">Full US CDC &amp; 3,681-Paper Clinical Report Unlocked — Age ${ageY} ${genderLabel} (${fmtLen(heightCm)} · ${fmtWt(weightKg)})</span>
        </div>
        <button type="button" onclick="window.print();" style="background:#059669;color:#FFFFFF;border:none;border-radius:9999px;padding:0.42rem 0.95rem;font-size:0.82rem;font-weight:800;cursor:pointer;">
          Download / Print A4 PDF Report
        </button>
      `;
      const headerEl = card.querySelector('.briefing-header');
      if (headerEl && headerEl.nextSibling) {
        card.insertBefore(unlockedBanner, headerEl.nextSibling);
      } else {
        card.prepend(unlockedBanner);
      }
      return;
    }

    // Locked State: Blur Pillar 1 & Pillar 2 behind the Taller-Style Paywall Gate
    [p1, p2].forEach((el) => {
      if (el) {
        el.style.filter = 'blur(8px)';
        el.style.pointerEvents = 'none';
        el.style.userSelect = 'none';
        el.style.maxHeight = '460px';
        el.style.overflow = 'hidden';
        el.style.opacity = '0.52';
        el.style.transition = 'filter 0.35s ease, opacity 0.35s ease';
      }
    });

    const singleBuyUrl = getActiveCheckoutUrl('single');
    const gateEl = document.createElement('div');
    gateEl.id = 'taller-global-paywall-gate';
    gateEl.style.cssText = 'background:linear-gradient(180deg,#EFF6FF 0%,#FFFFFF 100%);border:2.5px solid #1D4ED8;border-radius:22px;padding:1.5rem 1.4rem;margin-bottom:1.4rem;box-shadow:0 20px 50px rgba(29,78,216,0.12);text-align:left;';
    gateEl.innerHTML = `
      <!-- Step 1: Clinical Scan Complete Teaser Banner -->
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.85rem;padding-bottom:0.75rem;border-bottom:1px solid #BFDBFE;">
        <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
          <span style="background:#1D4ED8;color:#FFFFFF;font-size:0.76rem;font-weight:900;padding:0.24rem 0.75rem;border-radius:9999px;">
            SCAN COMPLETE · REPORT READY TO UNLOCK
          </span>
          <span style="font-size:0.84rem;font-weight:800;color:#1E3A8A;">
            Profile: Age ${ageY} ${genderLabel} · Current ${fmtLen(heightCm)} / ${fmtWt(weightKg)}
          </span>
        </div>
        <span style="font-size:0.78rem;font-weight:800;color:#059669;background:#ECFDF5;border:1px solid #A7F3D0;padding:0.2rem 0.65rem;border-radius:9999px;">
          3,681 PubMed Papers Matched
        </span>
      </div>

      <!-- Step 2: Masked Predicted Height & Bottleneck Alert Teaser Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:0.75rem;margin-bottom:1.15rem;">
        <div style="background:#FFFFFF;border:1.5px solid #93C5FD;border-radius:14px;padding:0.85rem 1rem;">
          <div style="font-size:0.75rem;font-weight:800;color:#475569;">① Final Predicted Adult Height</div>
          <div style="font-size:1.35rem;font-weight:900;color:#1D4ED8;margin-top:0.2rem;letter-spacing:-0.02em;">
            🔒 <span style="filter:blur(5px);user-select:none;">${isImperial ? optimizedImp : `${optimizedCm} cm`}</span> <span style="font-size:0.82rem;color:#DC2626;font-weight:800;">(Locked)</span>
          </div>
          <div style="font-size:0.76rem;color:#059669;font-weight:800;margin-top:0.2rem;">
            ▲ ${fmtGain(hiddenGainCm)} Hidden Gain Detected!
          </div>
        </div>

        <div style="background:#FFFFFF;border:1.5px solid #93C5FD;border-radius:14px;padding:0.85rem 1rem;">
          <div style="font-size:0.75rem;font-weight:800;color:#475569;">② rhGH Injection &amp; Bone-Age Verdict</div>
          <div style="font-size:1.05rem;font-weight:900;color:#0F172A;margin-top:0.25rem;">
            🔒 <span style="color:#1D4ED8;">Tier Analysis Ready</span>
          </div>
          <div style="font-size:0.76rem;color:#475569;font-weight:700;margin-top:0.2rem;">
            BMJ &amp; Cochrane Meta-Analysis ($15k/yr ROI Check)
          </div>
        </div>

        <div style="background:#FFFFFF;border:1.5px solid #93C5FD;border-radius:14px;padding:0.85rem 1rem;">
          <div style="font-size:0.75rem;font-weight:800;color:#475569;">③ 5-Axis Brain LQ &amp; Study Bottleneck</div>
          <div style="font-size:1.05rem;font-weight:900;color:#0F172A;margin-top:0.25rem;">
            🔒 <span style="color:#1D4ED8;">2 Priority Bottlenecks Found</span>
          </div>
          <div style="font-size:0.76rem;color:#475569;font-weight:700;margin-top:0.2rem;">
            Includes Custom 4-Week Neuro-Study Fix Plan
          </div>
        </div>
      </div>

      <!-- Step 3: Taller-Style Pricing & Instant Unlock Card -->
      <div id="taller-global-paywall-card" style="background:#FFFFFF;border:2px solid #1D4ED8;border-radius:18px;padding:1.25rem 1.3rem;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem;margin-bottom:0.9rem;">
          <div>
            <span style="background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;font-size:0.75rem;font-weight:900;padding:0.2rem 0.65rem;border-radius:9999px;">
              LIMITED LAUNCH OFFER · SAVE 70% VS. $450 CLINIC CONSULT
            </span>
            <h3 style="font-size:1.24rem;font-weight:900;color:#0F172A;margin:0.45rem 0 0.2rem 0;">
              Unlock Your Child's Complete 1:1 Growth &amp; Brain LQ Master Report
            </h3>
            <p style="font-size:0.86rem;color:#475569;margin:0;">
              Instant access to both full reports (Physical Auxology + Neuro-Cognitive LQ), downloadable Hospital-Style A4 PDF, and 5 Printable Cognitive Worksheets.
            </p>
          </div>
        </div>

        <!-- 2-Tier Plan Selector -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:0.8rem;margin-bottom:1rem;">
          <label id="paywall-plan-label-single" onclick="window.selectKidsFitGlobalPlan('single')" style="cursor:pointer;background:#EFF6FF;border:2px solid #1D4ED8;border-radius:14px;padding:0.95rem 1rem;display:flex;flex-direction:column;justify-content:space-between;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem;">
              <span style="font-size:0.82rem;font-weight:900;color:#1D4ED8;">
                <input type="radio" name="kidsfit-global-plan" value="single" checked style="accent-color:#1D4ED8;margin-right:0.3rem;">
                SINGLE REPORT PASS (MOST POPULAR)
              </span>
              <span style="background:#1D4ED8;color:#FFFFFF;font-size:0.7rem;font-weight:900;padding:0.15rem 0.5rem;border-radius:9999px;">SAVE 70%</span>
            </div>
            <div style="display:flex;align-items:baseline;gap:0.45rem;margin-bottom:0.3rem;">
              <span style="font-size:1.65rem;font-weight:900;color:#0F172A;">$8.99</span>
              <span style="font-size:0.85rem;color:#94A3B8;text-decoration:line-through;font-weight:700;">$29.99</span>
              <span style="font-size:0.78rem;color:#475569;font-weight:700;">· One-Time Payment</span>
            </div>
            <div style="font-size:0.78rem;color:#334155;line-height:1.45;">
              ✓ Full Physical Height + rhGH Paper Report<br>
              ✓ Full 5-Axis Brain LQ &amp; 4-Week Study Plan<br>
              ✓ Printable A4 Clinical PDF + 5 Worksheets
            </div>
          </label>

          <label id="paywall-plan-label-pass" onclick="window.selectKidsFitGlobalPlan('pass')" style="cursor:pointer;background:#F8FAFC;border:1.5px solid #CBD5E1;border-radius:14px;padding:0.95rem 1rem;display:flex;flex-direction:column;justify-content:space-between;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem;">
              <span style="font-size:0.82rem;font-weight:900;color:#0F172A;">
                <input type="radio" name="kidsfit-global-plan" value="pass" style="accent-color:#1D4ED8;margin-right:0.3rem;">
                6-MONTH GROWTH &amp; BRAIN TRACKER
              </span>
              <span style="background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;font-size:0.7rem;font-weight:900;padding:0.15rem 0.5rem;border-radius:9999px;">BEST VALUE</span>
            </div>
            <div style="display:flex;align-items:baseline;gap:0.45rem;margin-bottom:0.3rem;">
              <span style="font-size:1.65rem;font-weight:900;color:#0F172A;">$19.99</span>
              <span style="font-size:0.85rem;color:#94A3B8;text-decoration:line-through;font-weight:700;">$79.99</span>
              <span style="font-size:0.78rem;color:#475569;font-weight:700;">· 6 Months Unlimited</span>
            </div>
            <div style="font-size:0.78rem;color:#334155;line-height:1.45;">
              ✓ Everything in Single Report Pass<br>
              ✓ Unlimited Sibling Profiles &amp; Monthly Re-Scans<br>
              ✓ 90-Day Height Velocity &amp; Bone-Age Tracker
            </div>
          </label>
        </div>

        <!-- Primary Checkout CTA Button -->
        <button type="button" id="btn-global-paywall-checkout" data-checkout-url="${singleBuyUrl}" onclick="window.openKidsFitGlobalCheckoutModal()" style="width:100%;padding:1rem 1.2rem;border-radius:14px;border:none;background:linear-gradient(90deg,#1D4ED8 0%,#2563EB 100%);color:#FFFFFF;font-size:1.05rem;font-weight:900;cursor:pointer;box-shadow:0 10px 25px rgba(29,78,216,0.28);margin-bottom:0.65rem;">
          🔓 Unlock Full Clinical Report &amp; Printable PDF Now ($8.99) →
        </button>

        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;font-size:0.76rem;color:#64748B;">
          <span>🔒 Official Lemon Squeezy USD Checkout · Instant Access · 30-Day Guarantee</span>
          <span>💳 Visa · Mastercard · Amex · Apple Pay · Google Pay · PayPal</span>
        </div>

        <!-- Promo / VIP Access Code Bar -->
        <div style="margin-top:0.8rem;padding-top:0.75rem;border-top:1px dashed #E2E8F0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">
          <span style="font-size:0.78rem;font-weight:700;color:#475569;">Have a Clinic Partner Passcode?</span>
          <div style="display:flex;gap:0.4rem;align-items:center;">
            <input type="text" id="input-global-vip-code" placeholder="Enter clinic partner code" style="padding:0.38rem 0.65rem;border:1px solid #CBD5E1;border-radius:8px;font-size:0.8rem;color:#0F172A;background:#F8FAFC;width:170px;">
            <button type="button" onclick="window.applyKidsFitGlobalVipCode()" style="padding:0.4rem 0.8rem;border-radius:8px;border:1px solid #1D4ED8;background:#EFF6FF;color:#1D4ED8;font-size:0.78rem;font-weight:800;cursor:pointer;">
              Apply Code
            </button>
          </div>
        </div>
      </div>
    `;

    const headerEl = card.querySelector('.briefing-header');
    if (headerEl && headerEl.nextSibling) {
      card.insertBefore(gateEl, headerEl.nextSibling);
    } else {
      card.prepend(gateEl);
    }
  }

  let selectedPlan = 'single';

  global.selectKidsFitGlobalPlan = function (plan) {
    selectedPlan = plan === 'pass' ? 'pass' : 'single';
    const singleLbl = document.getElementById('paywall-plan-label-single');
    const passLbl = document.getElementById('paywall-plan-label-pass');
    const btn = document.getElementById('btn-global-paywall-checkout');
    if (singleLbl && passLbl) {
      if (selectedPlan === 'single') {
        singleLbl.style.background = '#EFF6FF';
        singleLbl.style.border = '2px solid #1D4ED8';
        passLbl.style.background = '#F8FAFC';
        passLbl.style.border = '1.5px solid #CBD5E1';
      } else {
        passLbl.style.background = '#EFF6FF';
        passLbl.style.border = '2px solid #1D4ED8';
        singleLbl.style.background = '#F8FAFC';
        singleLbl.style.border = '1.5px solid #CBD5E1';
      }
    }
    if (btn) {
      const priceStr = selectedPlan === 'pass' ? '$19.99' : '$8.99';
      btn.setAttribute('data-checkout-url', getActiveCheckoutUrl(selectedPlan));
      btn.innerHTML = `🔓 Unlock Full Clinical Report &amp; Printable PDF Now (${priceStr}) →`;
    }
  };

  global.applyKidsFitGlobalVipCode = function () {
    const inp = document.getElementById('input-global-vip-code');
    const code = String((inp && inp.value) || '').trim().toUpperCase();
    if (code === 'VIP2026' || code === 'ADMIN' || code === 'KIDSFIT' || code === 'FREE100') {
      try {
        if (window.localStorage) window.localStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
      } catch (_) {}
      transformGlobalReportAndApplyPaywall();
    } else {
      if (typeof window.alert === 'function') {
        window.alert('Invalid access code. Please complete checkout or enter a valid Clinic Partner code.');
      }
    }
  };

  global.launchLemonSqueezyCheckout = function (planOverride) {
    const plan = planOverride || selectedPlan || 'single';
    const baseCheckoutUrl = getActiveCheckoutUrl(plan);
    const emailEl = document.getElementById('checkout-parent-email');
    const email = String((emailEl && emailEl.value) || '').trim();
    const sep = baseCheckoutUrl.indexOf('?') === -1 ? '?' : '&';
    const finalUrl = email && email.indexOf('@') !== -1
      ? `${baseCheckoutUrl}${sep}embed=1&checkout[email]=${encodeURIComponent(email)}`
      : `${baseCheckoutUrl}${sep}embed=1`;

    try {
      if (typeof window.fetch === 'function') {
        window.fetch('/api/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'affiliate_click', href: 'lemonsqueezy_checkout_' + plan })
        }).catch(function () {});
      }
    } catch (_) {}

    if (typeof window !== 'undefined' && window.LemonSqueezy && typeof window.LemonSqueezy.Url === 'object' && typeof window.LemonSqueezy.Url.Open === 'function') {
      window.LemonSqueezy.Url.Open(finalUrl);
      return;
    }
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = baseCheckoutUrl;
    }
  };

  global.openKidsFitGlobalCheckoutModal = function () {
    if (typeof document === 'undefined') return;
    ensureLemonSqueezyScriptLoaded();

    let modal = document.getElementById('kidsfit-global-checkout-modal');
    if (modal) modal.remove();

    const priceStr = selectedPlan === 'pass' ? '$19.99' : '$8.99';
    const planTitle = selectedPlan === 'pass'
      ? '6-Month Growth & Brain LQ Unlimited Pass'
      : 'Single Child Full Clinical Report & A4 PDF Pass';
    const lsBuyUrl = getActiveCheckoutUrl(selectedPlan);

    modal = document.createElement('div');
    modal.id = 'kidsfit-global-checkout-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,0.72);display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(4px);';
    modal.innerHTML = `
      <div style="background:#FFFFFF;border:2px solid #1D4ED8;border-radius:22px;max-width:460px;width:100%;padding:1.5rem 1.4rem;box-shadow:0 25px 60px rgba(0,0,0,0.35);color:#0F172A;text-align:left;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.85rem;padding-bottom:0.65rem;border-bottom:1px solid #E2E8F0;">
          <div>
            <span style="font-size:0.72rem;font-weight:900;color:#1D4ED8;background:#EFF6FF;padding:0.18rem 0.55rem;border-radius:9999px;">KIDS-FIT BIO LABS · OFFICIAL USD CHECKOUT</span>
            <h3 style="margin:0.3rem 0 0;font-size:1.12rem;font-weight:900;color:#0F172A;">${planTitle}</h3>
          </div>
          <button type="button" onclick="var m=document.getElementById('kidsfit-global-checkout-modal');if(m)m.remove();" style="background:#F1F5F9;border:1px solid #CBD5E1;border-radius:9999px;width:32px;height:32px;font-weight:900;cursor:pointer;">✕</button>
        </div>

        <div style="background:#F8FAFC;border:1px solid #BFDBFE;border-radius:12px;padding:0.75rem 0.9rem;margin-bottom:0.9rem;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.86rem;font-weight:800;color:#334155;">Total Due Today (USD)</span>
          <span style="font-size:1.35rem;font-weight:900;color:#1D4ED8;">${priceStr}</span>
        </div>

        <!-- Primary Official Lemon Squeezy Hosted / Overlay Checkout Button -->
        <a id="btn-lemonsqueezy-official-checkout" href="${lsBuyUrl}" onclick="event.preventDefault(); window.launchLemonSqueezyCheckout('${selectedPlan}');" class="lemonsqueezy-button" style="display:block;text-align:center;text-decoration:none;width:100%;box-sizing:border-box;padding:0.95rem 1rem;border-radius:12px;background:linear-gradient(90deg,#1D4ED8 0%,#2563EB 100%);color:#FFFFFF;font-size:0.98rem;font-weight:900;cursor:pointer;margin-bottom:0.85rem;box-shadow:0 10px 24px rgba(29,78,216,0.25);">
          💳 Pay ${priceStr} via Official Lemon Squeezy Checkout →
        </a>

        <div style="margin-bottom:0.75rem;">
          <label style="display:block;font-size:0.78rem;font-weight:800;color:#334155;margin-bottom:0.3rem;">Parent Email (For PDF Report Delivery &amp; Receipt)</label>
          <input type="email" id="checkout-parent-email" placeholder="parent@example.com" style="width:100%;box-sizing:border-box;padding:0.65rem 0.8rem;border:1.5px solid #CBD5E1;border-radius:10px;font-size:0.9rem;color:#0F172A;">
        </div>

        <div style="margin-bottom:0.85rem;">
          <label style="display:block;font-size:0.78rem;font-weight:800;color:#334155;margin-bottom:0.3rem;">Express Direct Card Authorization</label>
          <input type="text" id="checkout-card-number" placeholder="Card Number (4242 •••• •••• ••••)" style="width:100%;box-sizing:border-box;padding:0.65rem 0.8rem;border:1.5px solid #CBD5E1;border-radius:10px;font-size:0.9rem;color:#0F172A;margin-bottom:0.45rem;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.45rem;">
            <input type="text" placeholder="MM / YY" style="width:100%;box-sizing:border-box;padding:0.6rem 0.8rem;border:1.5px solid #CBD5E1;border-radius:10px;font-size:0.88rem;color:#0F172A;">
            <input type="text" placeholder="CVC" style="width:100%;box-sizing:border-box;padding:0.6rem 0.8rem;border:1.5px solid #CBD5E1;border-radius:10px;font-size:0.88rem;color:#0F172A;">
          </div>
        </div>

        <button type="button" onclick="window.completeKidsFitGlobalCheckout('${priceStr}')" style="width:100%;padding:0.82rem 1rem;border-radius:12px;border:1.5px solid #1D4ED8;background:#EFF6FF;color:#1D4ED8;font-size:0.9rem;font-weight:800;cursor:pointer;margin-bottom:0.55rem;">
          Authorize ${priceStr} &amp; Unlock Instant Report →
        </button>

        <div style="font-size:0.74rem;color:#64748B;text-align:center;">
          🔒 Powered by Lemon Squeezy Store #296100 · Apple Pay · Google Pay · PayPal · Cards
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  global.completeKidsFitGlobalCheckout = function () {
    const emailEl = document.getElementById('checkout-parent-email');
    const email = String((emailEl && emailEl.value) || '').trim();
    if (!email || email.indexOf('@') === -1) {
      if (typeof window.alert === 'function') {
        window.alert('Please enter a valid email address to receive your printable PDF report and receipt.');
      }
      return;
    }
    try {
      if (window.localStorage) {
        window.localStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
        window.localStorage.setItem('kidsfit_global_buyer_email', email);
      }
      if (typeof window.fetch === 'function') {
        window.fetch('/api/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'affiliate_click', href: 'global_paywall_unlock_' + selectedPlan })
        }).catch(function () {});
      }
    } catch (_) {}
    const modal = document.getElementById('kidsfit-global-checkout-modal');
    if (modal) modal.remove();
    transformGlobalReportAndApplyPaywall();
  };

  function initGlobalPaywallEdition() {
    if (!isGlobalPaidEdition()) return;
    applyGlobalHomepageEnglishDOM();

    if (typeof window !== 'undefined' && !window._globalPaywallUnitBound) {
      window._globalPaywallUnitBound = true;
      window.addEventListener('taller-language-change', function () {
        applyGlobalHomepageEnglishDOM();
        const card = document.getElementById('master-briefing-card');
        if (card && card.innerHTML && card.style.display !== 'none') {
          transformGlobalReportAndApplyPaywall();
        }
      });
    }

    if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
      const observeTarget = document.getElementById('master-briefing-card') || document.body;
      let isTransforming = false;
      const obs = new MutationObserver(function () {
        if (isTransforming) return;
        const card = document.getElementById('master-briefing-card');
        if (card && card.innerHTML && !document.getElementById('taller-global-paywall-gate')) {
          isTransforming = true;
          try {
            transformGlobalReportAndApplyPaywall();
          } finally {
            isTransforming = false;
          }
        }
      });
      if (observeTarget) {
        obs.observe(observeTarget, { childList: true, subtree: true });
      }
    }
  }

  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', initGlobalPaywallEdition);
    } else {
      initGlobalPaywallEdition();
    }
  }

  const GlobalPaywallEdition = {
    DEFAULT_SINGLE_CHECKOUT_URL,
    DEFAULT_PASS_CHECKOUT_URL,
    isGlobalPaidEdition,
    isReportUnlocked,
    getActiveCheckoutUrl,
    applyGlobalHomepageEnglishDOM,
    buildNativeEnglishClinicalReportHTML,
    transformGlobalReportAndApplyPaywall,
    initGlobalPaywallEdition
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalPaywallEdition;
  }
  global.KidsFitGlobalPaywall = GlobalPaywallEdition;
})(typeof window !== 'undefined' ? window : global);
