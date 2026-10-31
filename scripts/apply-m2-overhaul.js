/**
 * scripts/apply-m2-overhaul.js
 * Applies Milestone 2 overhaul to index.html, style.css, and app.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const catalogPath = path.join(ROOT_DIR, 'src', 'data', 'curation-catalog.json');
const indexHtmlPath = path.join(ROOT_DIR, 'index.html');
const cssPath = path.join(ROOT_DIR, 'src', 'css', 'style.css');
const appJsPath = path.join(ROOT_DIR, 'src', 'js', 'app.js');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const products = catalog.parentingProducts;

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 1. Build the 20 Product Cards
const cardsHtml = products.map((p, idx) => {
  const cleanName = escapeHtml(p.name);
  let badgeClass = p.platform;
  let badgeText = p.badgeText || '✨ 에디터 셀렉트';
  if (p.platform === 'coupang' && (!badgeText || badgeText.includes('로켓와우'))) badgeText = '✨ 에디터 셀렉트';
  if (p.platform === 'iherb' && (!badgeText || badgeText.includes('직구'))) badgeText = '🌿 공식 안심인증';
  if (p.platform === 'cpa' && (!badgeText || badgeText.includes('CPA'))) badgeText = '📚 공식 에듀체험';

  return `            <!-- Item ${idx + 1}: ${p.stage} / ${p.category} / ${p.platform} -->
            <a href="${p.url}" target="_blank" rel="noopener noreferrer sponsored" data-shop-stage="${p.stage}" data-shop-category="${p.category}" data-shop-platform="${p.platform}" data-product-id="${p.id}" data-product-name="${cleanName}" data-product-category="${p.category}" onclick="if(window.openKidsFitProductModal){event.preventDefault();window.openKidsFitProductModal('${p.id}');}" class="kf-product-card">
              <div>
                <div class="kf-card-top">
                  <span class="kf-badge-platform ${badgeClass}">${badgeText}</span>
                  <span class="kf-card-stage-tag">${p.stageLabel}</span>
                  <span class="kf-card-rating">★ ${p.rating} (${p.reviewCount.toLocaleString()}+)</span>
                </div>
                <div class="kf-card-body">
                  <div class="kf-card-thumb"><img src="${p.image}" alt="${cleanName}" loading="lazy" onerror="this.onerror=null;this.src='${p.imageFallback}';"></div>
                  <strong class="kf-card-title">${cleanName}</strong>
                  <p class="kf-card-desc">${escapeHtml(p.summary || p.description)}</p>
                  <div class="kf-card-price-row">
                    <span class="kf-card-price">${p.price}</span>
                    <span class="kf-card-price-label">(공식 혜택가)</span>
                  </div>
                </div>
              </div>
              <div>
                <div class="kf-card-benefit-cue">
                  <span>✨</span>
                  <span>상세 확인 시 4대 정밀진단 즉시 무료 오픈 (잠금해제)</span>
                </div>
                <div class="kf-card-action-btn ${p.platform}">
                  스토어 이동 &amp; 공식 판매처 확인 (혜택가 확인) →
                </div>
              </div>
            </a>`;
}).join('\n\n');

// 2. Build the complete Shopping Mall section
const shopSectionHtml = `        <!-- =====================================================================
             KIDSFIT PARENTING SELECT SHOP
             ===================================================================== -->
        <div id="kidsfit-parenting-select-shop">
          <div class="kf-shop-header">
            <div class="kf-shop-badge">
              <span>🏷️ KIDSFIT EDITORIAL SELECT SHOP</span>
              <span>|</span>
              <span>상세 확인 시 4대 발달 정밀진단 무료 오픈 (잠금해제)</span>
            </div>
            <h3 class="kf-shop-title">
              소아발달 전문 에디터가 엄선한 발달 단계별 필수 육아 큐레이션 스토어
            </h3>
            <p class="kf-shop-subtitle">
              아이의 <strong>발달 단계(신생아~학령기)</strong>와 <strong>핵심 케어 영역</strong>에 맞춘 검증된 필수 육아템입니다. 관심 육아템의 상세정보 및 <strong>공식 판매처 확인</strong> 시 <strong>신체성장·성조숙증·두뇌발달·기질학습 4대 정밀 진단이 즉시 무료 오픈(잠금해제)</strong>됩니다.
            </p>
          </div>

          <!-- Two-Tier Interactive Filter Controls -->
          <div class="kf-filter-section">
            <!-- Tier 1: Developmental Stage Tabs -->
            <div class="kf-filter-group">
              <span class="kf-filter-label">🌱 발달 단계:</span>
              <div class="kf-filter-buttons" id="kf-shop-stage-tabs">
                <button type="button" onclick="window.filterKidsFitShopByStage('all', this)" class="kf-stage-tab active">전체 발달단계</button>
                <button type="button" onclick="window.filterKidsFitShopByStage('pregnancy_newborn', this)" class="kf-stage-tab">🍼 임신·신생아 (0~12m)</button>
                <button type="button" onclick="window.filterKidsFitShopByStage('infancy', this)" class="kf-stage-tab">👶 영아기 (1~3세)</button>
                <button type="button" onclick="window.filterKidsFitShopByStage('toddler', this)" class="kf-stage-tab">🧒 유아기 (4~6세)</button>
                <button type="button" onclick="window.filterKidsFitShopByStage('child', this)" class="kf-stage-tab">🎒 아동·학령기 (7~12세+)</button>
              </div>
            </div>

            <!-- Tier 2: Product Category Pills -->
            <div class="kf-filter-group">
              <span class="kf-filter-label">🏷️ 제품 영역:</span>
              <div class="kf-filter-buttons" id="kf-shop-category-pills">
                <button type="button" onclick="window.filterKidsFitShopByCategory('all', this)" class="kf-category-pill active">전체 카테고리</button>
                <button type="button" onclick="window.filterKidsFitShopByCategory('nutrition', this)" class="kf-category-pill">🥛 영양·건강식품</button>
                <button type="button" onclick="window.filterKidsFitShopByCategory('development', this)" class="kf-category-pill">🧩 발달교구·완구</button>
                <button type="button" onclick="window.filterKidsFitShopByCategory('gear', this)" class="kf-category-pill">🏃 자세·수면·기구</button>
                <button type="button" onclick="window.filterKidsFitShopByCategory('learning', this)" class="kf-category-pill">📚 학습도서·문해력</button>
              </div>
            </div>

            <!-- Filter Status & Item Counter -->
            <div class="kf-filter-status">
              <span id="kf-shop-count">총 20개 맞춤 육아템 표시 중</span>
              <span style="font-size: 0.74rem;">* 상품 카드 클릭 시 상세 큐레이션 및 공식 판매처 확인이 가능하며 4대 정밀진단이 즉시 무료로 오픈됩니다.</span>
            </div>
          </div>

          <!-- Responsive Product Card Grid -->
          <div id="kf-shop-grid">
${cardsHtml}
          </div>
        </div>`;

// 3. Build the Detail Modal markup
const modalMarkup = `
    <!-- =====================================================================
         KIDSFIT PRODUCT DETAIL MODAL / DRAWER (R3 In-App Editorial Modal)
         ===================================================================== -->
    <div id="kf-product-detail-modal" class="kf-product-modal-backdrop" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="kf-modal-product-title">
      <div class="kf-product-modal-card">
        <!-- Modal Top Bar -->
        <div class="kf-modal-top-bar">
          <div class="kf-modal-tagline">
            <span class="kf-modal-badge">🏷️ KIDSFIT EDITORIAL CURATION</span>
            <span class="kf-modal-stage-pill" id="kf-modal-product-stage">임신·신생아</span>
            <span class="kf-modal-category-pill" id="kf-modal-product-category">영양·건강식품</span>
          </div>
          <button type="button" class="kf-modal-close-btn" onclick="window.closeKidsFitProductModal()" aria-label="닫기">&times;</button>
        </div>

        <!-- Modal Scrollable Content Area -->
        <div class="kf-modal-body-scroll">
          <!-- 1. Real Image & Key Specs Summary -->
          <div class="kf-modal-image-specs-grid">
            <div class="kf-modal-image">
              <img id="kf-modal-product-img" src="src/images/products/prod_nb_nut_1.webp" alt="제품 상세 이미지" class="kf-modal-hero-img" onerror="this.onerror=null;this.src='src/images/products/prod_nb_nut_1.svg';">
            </div>
            <div class="kf-modal-specs">
              <h2 id="kf-modal-product-title" class="kf-modal-title">닥터에디션 베이비 비타민D3 400IU 드롭스 &amp; 유산균</h2>
              <div class="kf-modal-meta-row">
                <span id="kf-modal-product-rating" class="kf-modal-rating">★ 4.9 (14,200+ 후기)</span>
                <span id="kf-modal-product-price" class="kf-modal-price">공식 혜택가 26,400원</span>
              </div>
              <div class="kf-modal-specs-box">
                <h4 class="kf-specs-heading">📋 핵심 스펙 요약 (4대 검증 기준)</h4>
                <ul id="kf-modal-specs-list" class="kf-modal-specs-summary">
                  <li>1일 1방울(0.03ml)로 영유아 일일 권장량 400IU 100% 충족</li>
                  <li>스위스 DSM사 프리미엄 Quali-D 비타민D3 원료 사용</li>
                  <li>락토바실러스 루테리(L.reuteri) 배앓이 방지 특허 유산균 배합</li>
                  <li>감미료, 착색료, 합성향료, 보존료 4無 원칙</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 2. Editor's Selection Reasons (Why We Picked, 3 points) -->
          <div class="kf-modal-why-picked">
            <h3 class="kf-section-heading">
              <span>🩺</span> 소아발달 전문 에디터가 이 제품을 엄선한 3가지 이유
            </h3>
            <div id="kf-modal-why-picked-list" class="kf-why-list">
              <div class="kf-why-item">
                <span class="kf-why-badge">POINT 01 · 소아과 임상 기준 부합</span>
                <p class="kf-why-text">모유에는 비타민D가 거의 없어 소아청소년과학회에서 생후 즉시 보충을 권고하는 필수 영양소입니다.</p>
              </div>
              <div class="kf-why-item">
                <span class="kf-why-badge">POINT 02 · 안전한 투약 및 정밀 계량</span>
                <p class="kf-why-text">유로드롭 특수 드로퍼 기술로 거꾸로 들면 정확히 1방울만 떨어져 과다 복용 위험이 없습니다.</p>
              </div>
              <div class="kf-why-item">
                <span class="kf-why-badge">POINT 03 · 신생아 배앓이 안정 효과</span>
                <p class="kf-why-text">신생아 영아산통(배앓이) 감소 효과가 입증된 루테리 균주가 배합되어 밤잠 안정에 기여합니다.</p>
              </div>
            </div>
          </div>

          <!-- 3. Comparative Buying Guide -->
          <div class="kf-modal-buying-guide">
            <h3 class="kf-section-heading">
              <span>⚖️</span> 비교 구매 가이드 (선택 전 체크리스트)
            </h3>
            <div class="kf-guide-grid">
              <div class="kf-guide-card pros">
                <span class="kf-guide-label">🌟 핵심 장점</span>
                <p id="kf-modal-guide-pros" class="kf-guide-text">분유, 모유, 쪽쪽이에 1방울만 톡 떨어뜨려 먹이기 매우 간편함.</p>
              </div>
              <div class="kf-guide-card cons">
                <span class="kf-guide-label">⚠️ 구매 전 유의사항</span>
                <p id="kf-modal-guide-considerations" class="kf-guide-text">오일 제형이므로 직사광선을 피해 25도 이하 실온 보관 필수.</p>
              </div>
              <div class="kf-guide-card baby">
                <span class="kf-guide-label">👶 이런 아기에게 추천해요</span>
                <p id="kf-modal-guide-recommended-baby" class="kf-guide-text">완모(완전모유수유) 아기, 밤에 배앓이로 자주 보채는 생후 0~6개월 신생아.</p>
              </div>
            </div>
          </div>

          <!-- 4. Veteran Mom Real User Review Summary -->
          <div class="kf-modal-mom-reviews">
            <h3 class="kf-section-heading">
              <span>💬</span> 3040 선배맘 실사용 리포트 (검증된 리뷰 요약)
            </h3>
            <div id="kf-modal-reviews-list" class="kf-reviews-grid">
              <div class="kf-review-bubble">
                <span class="kf-review-quote-mark">“</span>
                <p class="kf-review-text">조리원에서 나오자마자 밤마다 영아산통으로 울던 아기였는데, 1주일 먹이고 나서 트림도 잘하고 밤잠 시간이 눈에 띄게 늘었어요.</p>
                <span class="kf-review-author">생후 2개월 완모맘 · ★★★★★</span>
              </div>
              <div class="kf-review-bubble">
                <span class="kf-review-quote-mark">“</span>
                <p class="kf-review-text">스포이드 방식은 흘리기 쉬운데 이건 병을 기울이면 딱 한 방울만 똑 떨어져서 젖꼭지 위에 바르기 최고입니다.</p>
                <span class="kf-review-author">생후 4개월 혼합수유맘 · ★★★★★</span>
              </div>
              <div class="kf-review-bubble">
                <span class="kf-review-quote-mark">“</span>
                <p class="kf-review-text">소아과 정기검진 때 의사선생님께서도 권장하신 제품이라 둘째 때도 고민 없이 선택했습니다.</p>
                <span class="kf-review-author">연년생 둘째맘 · ★★★★★</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. Fixed Sticky Bottom CTA Button Container -->
        <div class="kf-modal-sticky-footer">
          <div class="kf-modal-cta-tip">
            <span>✨</span>
            <span>공식 판매처 확인 시 4대 정밀 진단(신체성장·성조숙증·두뇌·기질)이 즉시 무료로 오픈됩니다</span>
          </div>
          <a id="kf-modal-cta-btn" href="https://www.coupang.com/np/search?q=%EC%9C%A1%EC%95%84%EC%9A%A9%ED%92%88&channel=user&lptag=AF7865143" target="_blank" rel="noopener noreferrer sponsored" class="kf-modal-cta-btn" onclick="window.handleKidsFitModalCtaClick(window.__currentModalProductId, event)">
            공식 판매처 보러가기 (+ 1:1 발달·성장 정밀진단 무료 오픈)
          </a>
        </div>
      </div>
    </div>
`;

// 4. Modal Javascript to inline in index.html
const modalScript = `
      // =======================================================================
      // KIDSFIT IN-APP PRODUCT DETAIL MODAL CONTROLLER & CATALOG CACHE
      // =======================================================================
      window.KIDSFIT_PRODUCT_CATALOG = ${JSON.stringify(products, null, 2)};

      window.__currentModalProductId = 'prod_nb_nut_1';

      window.openKidsFitProductModal = function(productId) {
        try {
          var pid = (typeof productId === 'object' && productId) ? productId.id : productId;
          var prod = null;
          if (Array.isArray(window.KIDSFIT_PRODUCT_CATALOG)) {
            prod = window.KIDSFIT_PRODUCT_CATALOG.find(function(p) { return p.id === pid; });
          }
          if (!prod && typeof productId === 'object') prod = productId;
          if (!prod && pid) {
            var pLower = String(pid).toLowerCase();
            if (pLower.includes('coupang')) prod = window.KIDSFIT_PRODUCT_CATALOG.find(function(p) { return p.platform === 'coupang'; });
            else if (pLower.includes('iherb')) prod = window.KIDSFIT_PRODUCT_CATALOG.find(function(p) { return p.platform === 'iherb'; });
            else if (pLower.includes('cpa')) prod = window.KIDSFIT_PRODUCT_CATALOG.find(function(p) { return p.platform === 'cpa'; });
          }
          if (!prod && window.KIDSFIT_PRODUCT_CATALOG && window.KIDSFIT_PRODUCT_CATALOG.length) {
            prod = window.KIDSFIT_PRODUCT_CATALOG[0];
          }
          if (!prod) return;

          window.__currentModalProductId = prod.id;
          var modal = document.getElementById('kf-product-detail-modal');
          if (modal) modal.style.display = 'block';

          var ctaBtn = document.getElementById('kf-modal-cta-btn');
          if (ctaBtn) {
            ctaBtn.href = prod.url;
            ctaBtn.setAttribute('data-product-id', prod.id);
            ctaBtn.setAttribute('data-product-name', prod.name);
            ctaBtn.setAttribute('data-platform', prod.platform);
          }

          var imgEl = document.getElementById('kf-modal-product-img');
          if (imgEl) {
            imgEl.src = prod.image;
            imgEl.alt = prod.name;
            imgEl.onerror = function() {
              this.onerror = null;
              this.src = prod.imageFallback;
            };
          }

          var titleEl = document.getElementById('kf-modal-product-title');
          if (titleEl) titleEl.textContent = prod.name;

          var stageEl = document.getElementById('kf-modal-product-stage');
          if (stageEl) stageEl.textContent = prod.stageLabel || prod.stage;

          var catEl = document.getElementById('kf-modal-product-category');
          if (catEl) catEl.textContent = prod.categoryLabel || prod.category;

          var ratingEl = document.getElementById('kf-modal-product-rating');
          if (ratingEl) ratingEl.textContent = '★ ' + prod.rating + ' (' + (prod.reviewCount ? prod.reviewCount.toLocaleString() : '1,000+') + '개 리뷰)';

          var priceEl = document.getElementById('kf-modal-product-price');
          if (priceEl) priceEl.textContent = '공식 혜택가 ' + prod.price;

          var specsEl = document.getElementById('kf-modal-specs-list');
          if (specsEl && Array.isArray(prod.specs)) {
            specsEl.innerHTML = prod.specs.map(function(s) {
              return '<li><span class=\"kf-spec-bullet\">✓</span> <span>' + s + '</span></li>';
            }).join('');
          }

          var whyEl = document.getElementById('kf-modal-why-picked-list');
          if (whyEl && Array.isArray(prod.whyWePicked)) {
            whyEl.innerHTML = prod.whyWePicked.map(function(w, idx) {
              var titles = ['소아발달 임상 전문의 추천', '무독성 유해물질 0% 안심 검증', '실사용 만족도 &amp; 육아 피로도 절감'];
              var pointTitle = titles[idx] || ('핵심 포인트 0' + (idx + 1));
              return '<div class=\"kf-why-item\"><span class=\"kf-why-badge\">POINT 0' + (idx + 1) + ' · ' + pointTitle + '</span><p class=\"kf-why-text\">' + w + '</p></div>';
            }).join('');
          }

          if (prod.buyingGuide) {
            var prosEl = document.getElementById('kf-modal-guide-pros');
            if (prosEl) prosEl.textContent = prod.buyingGuide.pros;
            var consEl = document.getElementById('kf-modal-guide-considerations');
            if (consEl) consEl.textContent = prod.buyingGuide.considerations;
            var babyEl = document.getElementById('kf-modal-guide-recommended-baby');
            if (babyEl) babyEl.textContent = prod.buyingGuide.recommendedBaby;
          }

          var reviewsEl = document.getElementById('kf-modal-reviews-list');
          if (reviewsEl && Array.isArray(prod.momReviews)) {
            reviewsEl.innerHTML = prod.momReviews.map(function(r) {
              return '<div class=\"kf-review-bubble\"><span class=\"kf-review-quote-mark\">“</span><p class=\"kf-review-text\">' + r + '</p><span class=\"kf-review-author\">선배맘 실사용 인증 후기 · ★★★★★</span></div>';
            }).join('');
          }
        } catch (e) {
          console.error('openKidsFitProductModal error', e);
        }
      };

      window.closeKidsFitProductModal = function() {
        var modal = document.getElementById('kf-product-detail-modal');
        if (modal) modal.style.display = 'none';
      };

      window.handleKidsFitModalCtaClick = function(productId, event) {
        if (event && event.preventDefault) event.preventDefault();
        var pid = productId || window.__currentModalProductId || 'prod_nb_nut_1';
        var prod = null;
        if (Array.isArray(window.KIDSFIT_PRODUCT_CATALOG)) {
          prod = window.KIDSFIT_PRODUCT_CATALOG.find(function(p) { return p.id === pid; });
        }
        var url = (prod && prod.url) || 'https://www.coupang.com/np/search?q=%EC%9C%A1%EC%95%84%EC%9A%A9%ED%92%88&channel=user&lptag=AF7865143';
        var pName = (prod && prod.name) || '키즈핏 큐레이션 육아템';
        var pPlatform = (prod && prod.platform) || 'coupang';
        var pNet = '';
        if (pPlatform === 'coupang') pNet = 'Coupang Partners (AF7865143)';
        else if (pPlatform === 'iherb') pNet = 'iHerb (IPZ1547)';
        else if (pPlatform === 'cpa') pNet = 'LinkPrice CPA (A100708867)';
        else pNet = 'Coupang Partners (AF7865143)';

        // 1. Open partner affiliate URL in a new tab
        if (typeof window.open === 'function') {
          window.open(url, '_blank', 'noopener,noreferrer,sponsored');
        }

        // 2. Unlock diagnostic tests and trigger telemetry
        if (typeof window.unlockKidsFitDiagnosticTests === 'function') {
          window.unlockKidsFitDiagnosticTests(pName, pNet, url);
        }

        // 3. Close modal
        window.closeKidsFitProductModal();
      };
`;

// 5. Read index.html and perform layout & content replacements
let html = fs.readFileSync(indexHtmlPath, 'utf8');

// A. Remove existing select shop section
const legacyShopStart = html.indexOf('<div id="kidsfit-parenting-select-shop">');
const legacyShopEnd = html.indexOf('<!-- Direct Monthly Products-Only Catalog Entry Banner');
if (legacyShopStart !== -1 && legacyShopEnd !== -1) {
  // Check if comment precedes legacyShopStart
  const commentBefore = html.lastIndexOf('<!-- ===', legacyShopStart);
  const cutStart = commentBefore !== -1 && commentBefore > html.indexOf('id="dual-pillar-intro-showcase"') ? commentBefore : legacyShopStart;
  html = html.substring(0, cutStart) + html.substring(legacyShopEnd);
}

// B. Position #kidsfit-parenting-select-shop right above #dual-pillar-intro-showcase
const showcaseIdx = html.indexOf('<div id="dual-pillar-intro-showcase"');
if (showcaseIdx === -1) {
  throw new Error('Could not find #dual-pillar-intro-showcase in index.html');
}
html = html.substring(0, showcaseIdx) + shopSectionHtml + '\n\n        ' + html.substring(showcaseIdx);

// C. Update #kf-unlock-gate-locked-view membership notice & gate cards
const lockedGateStart = html.indexOf('<div id="kf-unlock-gate-locked-view">');
const lockedGateEnd = html.indexOf('<div id="kf-unlock-gate-unlocked-view"');
if (lockedGateStart !== -1 && lockedGateEnd !== -1) {
  const newLockedGateView = `<div id="kf-unlock-gate-locked-view">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.55rem;">
            <span style="background: #1D4ED8; color: #FFFFFF; font-size: 0.76rem; font-weight: 900; padding: 0.24rem 0.75rem; border-radius: 9999px;">
              🔒 4대 발달 정밀진단 무료 잠금해제 안내
            </span>
            <span style="font-size: 0.78rem; font-weight: 800; color: #1D4ED8;">
              ✨ 공식 판매처 확인 시 즉시 무료 오픈
            </span>
          </div>
          <h3 style="margin: 0 0 0.45rem 0; font-size: clamp(1.02rem, 2.6vw, 1.2rem); font-weight: 800; color: #0F172A; line-height: 1.5;">
            스토어 이용 고객 전용 무료 멤버십 혜택: 관심 육아템의 상세정보 및 공식 판매처를 1회 이상 확인하시면 4대 정밀 진단이 즉시 무료로 오픈됩니다
          </h3>
          <p style="margin: 0 0 0.9rem 0; font-size: 0.84rem; color: #334155; line-height: 1.45;">
            관심 육아템의 상세 큐레이션 및 <strong>공식 판매처 확인</strong>을 1회만 진행하셔도 <strong>신체성장·성조숙증·두뇌발달·기질학습 4대 정밀 진단(잠금해제)</strong>이 무료로 오픈됩니다.
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(235px, 1fr)); gap: 0.75rem;">
            <a href="https://www.coupang.com/np/search?q=%EC%96%B4%EB%A6%B0%EC%9D%B4+%EC%B9%BC%EC%8A%98+%EB%B9%84%ED%83%80%EB%AF%BCD+%EC%95%84%EC%97%B0+%EC%98%81%EC%96%91%EC%A0%9C&channel=user&lptag=AF7865143" target="_blank" rel="noopener noreferrer sponsored" data-product-category="growth" data-product-name="성장판 칼슘·비타민D3·아연 공식 판매처" onclick="if(window.unlockKidsFitDiagnosticTests){window.unlockKidsFitDiagnosticTests(this.getAttribute('data-product-name'), 'Coupang Partners (AF7865143)', this.href);}else if(window.unlockKidsFitFullReport){window.unlockKidsFitFullReport('gate_coupang_growth');}" style="text-decoration: none; background: #FFFFFF; border: 2px solid #3B82F6; border-radius: 14px; padding: 0.85rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <span style="display: inline-block; background: #EFF6FF; color: #1D4ED8; font-size: 0.7rem; font-weight: 900; padding: 0.14rem 0.5rem; border-radius: 6px; margin-bottom: 0.35rem;">✨ 에디터 셀렉트 키성장 1위</span>
                <strong style="display: block; font-size: 0.9rem; font-weight: 900; color: #0F172A; margin-bottom: 0.25rem;">우리 아이 성장판 칼슘·비타민D3·아연 공식 판매처 확인</strong>
              </div>
              <div style="margin-top: 0.45rem; background: #1D4ED8; color: #FFFFFF; text-align: center; padding: 0.5rem; border-radius: 8px; font-size: 0.8rem; font-weight: 900;">
                스토어 이동 &amp; 공식 판매처 확인 →
              </div>
            </a>

            <a href="https://kr.iherb.com/search?kw=%EC%96%B4%EB%A6%B0%EC%9D%B4+%EB%B9%84%ED%83%80%EB%AF%BC+d3+k2+%EC%98%A4%EB%A9%94%EA%B0%803&rcode=IPZ1547" target="_blank" rel="noopener noreferrer sponsored" data-product-category="growth" data-product-name="어린이 액상 비타민D3+K2 & 오메가3 공식 판매처" onclick="if(window.unlockKidsFitDiagnosticTests){window.unlockKidsFitDiagnosticTests(this.getAttribute('data-product-name'), 'iHerb (IPZ1547)', this.href);}else if(window.unlockKidsFitFullReport){window.unlockKidsFitFullReport('gate_iherb_kids');}" style="text-decoration: none; background: #FFFFFF; border: 2px solid #16A34A; border-radius: 14px; padding: 0.85rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <span style="display: inline-block; background: #DCFCE7; color: #15803D; font-size: 0.7rem; font-weight: 900; padding: 0.14rem 0.5rem; border-radius: 6px; margin-bottom: 0.35rem;">🌿 글로벌 안심인증 베스트</span>
                <strong style="display: block; font-size: 0.9rem; font-weight: 900; color: #0F172A; margin-bottom: 0.25rem;">어린이 비타민D3+K2·두뇌 오메가3 공식 판매처 확인</strong>
              </div>
              <div style="margin-top: 0.45rem; background: #15803D; color: #FFFFFF; text-align: center; padding: 0.5rem; border-radius: 8px; font-size: 0.8rem; font-weight: 900;">
                스토어 이동 &amp; 공식 판매처 확인 →
              </div>
            </a>

            <a href="https://www.coupang.com/np/search?q=%EC%B4%88%EB%93%B1+%EC%9B%90%EB%AA%A9+%EB%8F%85%EC%84%9C%EB%8C%80+%EB%AC%B4%EC%86%8C%EC%9D%8C+%ED%83%80%EC%9D%B4%EB%A8%B8+%ED%99%94%EC%9D%B4%ED%8A%B8%EB%B3%B4%EB%93%9C&channel=user&lptag=AF7865143" target="_blank" rel="noopener noreferrer sponsored" data-product-category="learning" data-product-name="초등 거북목 독서대·무소음 타이머·미니칠판 공식 판매처" onclick="if(window.unlockKidsFitDiagnosticTests){window.unlockKidsFitDiagnosticTests(this.getAttribute('data-product-name'), 'Coupang Partners (AF7865143)', this.href);}else if(window.unlockKidsFitFullReport){window.unlockKidsFitFullReport('gate_coupang_study');}" style="text-decoration: none; background: #FFFFFF; border: 2px solid #4F46E5; border-radius: 14px; padding: 0.85rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <span style="display: inline-block; background: #EEF2FF; color: #4338CA; font-size: 0.7rem; font-weight: 900; padding: 0.14rem 0.5rem; border-radius: 6px; margin-bottom: 0.35rem;">📚 초등 집중력·백지복습 꿀템</span>
                <strong style="display: block; font-size: 0.9rem; font-weight: 900; color: #0F172A; margin-bottom: 0.25rem;">거북목 원목 독서대 &amp; 무소음 집중 타이머 공식 판매처 확인</strong>
              </div>
              <div style="margin-top: 0.45rem; background: #4338CA; color: #FFFFFF; text-align: center; padding: 0.5rem; border-radius: 8px; font-size: 0.8rem; font-weight: 900;">
                스토어 이동 &amp; 공식 판매처 확인 →
              </div>
            </a>
          </div>
        </div>\n\n        `;
  html = html.substring(0, lockedGateStart) + newLockedGateView + html.substring(lockedGateEnd);
}

// D. Insert Modal markup right before </body>
if (!html.includes('id="kf-product-detail-modal"')) {
  const bodyCloseIdx = html.lastIndexOf('</body>');
  if (bodyCloseIdx !== -1) {
    html = html.substring(0, bodyCloseIdx) + modalMarkup + '\n' + html.substring(bodyCloseIdx);
  }
}

// E. Add modal script functions into main script block
if (!html.includes('window.KIDSFIT_PRODUCT_CATALOG')) {
  const launchFuncEnd = html.indexOf('window.syncKidsFitLivePaperCount = function()');
  if (launchFuncEnd !== -1) {
    html = html.substring(0, launchFuncEnd) + modalScript + '\n\n      ' + html.substring(launchFuncEnd);
  }
}

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log('Successfully updated index.html with above-fold mall, modal markup, and controller scripts.');

// 6. Append Modal and Product Thumb styling to src/css/style.css
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('.kf-product-modal-backdrop')) {
  const modalCss = `
/* ==========================================================================
   31. KIDSFIT IN-APP PRODUCT DETAIL MODAL & DRAWER STYLES (R3)
   ========================================================================== */
.kf-card-thumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  background: #F8FAFC;
  margin-bottom: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kf-card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.kf-product-card:hover .kf-card-thumb img {
  transform: scale(1.05);
}

.kf-product-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.kf-product-modal-card {
  background: #FFFFFF;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  border-radius: 24px;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  animation: kfModalScaleIn 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes kfModalScaleIn {
  from { opacity: 0; transform: scale(0.96) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.kf-modal-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.4rem;
  border-bottom: 1px solid #E2E8F0;
  background: #FAF8F5;
}

.kf-modal-tagline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.kf-modal-badge {
  font-size: 0.72rem;
  font-weight: 800;
  color: #1D4ED8;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
}

.kf-modal-stage-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: #059669;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
}

.kf-modal-category-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: #6366F1;
  background: #EEF2FF;
  border: 1px solid #C7D2FE;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
}

.kf-modal-close-btn {
  background: transparent;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  color: #64748B;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.kf-modal-close-btn:hover {
  background: #F1F5F9;
  color: #0F172A;
}

.kf-modal-body-scroll {
  padding: 1.4rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  -webkit-overflow-scrolling: touch;
}

.kf-modal-image-specs-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1.25rem;
  align-items: start;
}

.kf-modal-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  overflow: hidden;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kf-modal-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kf-modal-specs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.kf-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0F172A;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.kf-modal-meta-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.kf-modal-rating {
  font-size: 0.85rem;
  font-weight: 800;
  color: #D97706;
}

.kf-modal-price {
  font-size: 1.15rem;
  font-weight: 900;
  color: #1D4ED8;
}

.kf-modal-specs-box {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 0.85rem 1rem;
}

.kf-specs-heading {
  margin: 0 0 0.5rem 0;
  font-size: 0.82rem;
  font-weight: 800;
  color: #334155;
}

.kf-modal-specs-summary {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.kf-modal-specs-summary li {
  font-size: 0.78rem;
  color: #475569;
  line-height: 1.45;
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
}

.kf-spec-bullet {
  color: #10B981;
  font-weight: 900;
  font-size: 0.85rem;
  line-height: 1.2;
}

.kf-section-heading {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0F172A;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  letter-spacing: -0.01em;
}

.kf-why-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.kf-why-item {
  background: #FAF8F5;
  border: 1px solid #E8E2D9;
  border-radius: 12px;
  padding: 0.85rem 1rem;
}

.kf-why-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  color: #1E3A8A;
  background: #DBEAFE;
  padding: 0.18rem 0.55rem;
  border-radius: 6px;
  margin-bottom: 0.35rem;
}

.kf-why-text {
  margin: 0;
  font-size: 0.82rem;
  color: #334155;
  line-height: 1.5;
}

.kf-guide-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.kf-guide-card {
  padding: 0.85rem;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.kf-guide-card.pros {
  background: #ECFDF5;
  border-color: #A7F3D0;
}

.kf-guide-card.cons {
  background: #FFFBEB;
  border-color: #FDE68A;
}

.kf-guide-card.baby {
  background: #EFF6FF;
  border-color: #BFDBFE;
}

.kf-guide-label {
  font-size: 0.76rem;
  font-weight: 800;
  color: #1E293B;
}

.kf-guide-text {
  margin: 0;
  font-size: 0.78rem;
  color: #475569;
  line-height: 1.45;
}

.kf-reviews-grid {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.kf-review-bubble {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 0.85rem 1.1rem;
  position: relative;
}

.kf-review-quote-mark {
  font-size: 1.6rem;
  font-family: Georgia, serif;
  color: #94A3B8;
  line-height: 1;
  display: block;
  margin-bottom: -0.3rem;
}

.kf-review-text {
  margin: 0 0 0.4rem 0;
  font-size: 0.82rem;
  color: #1E293B;
  line-height: 1.5;
  font-style: italic;
}

.kf-review-author {
  font-size: 0.72rem;
  font-weight: 700;
  color: #059669;
}

.kf-modal-sticky-footer {
  position: sticky;
  bottom: 0;
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  padding: 0.85rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.06);
}

.kf-modal-cta-tip {
  font-size: 0.74rem;
  font-weight: 800;
  color: #1D4ED8;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.kf-modal-cta-btn {
  display: block;
  text-align: center;
  text-decoration: none;
  background: linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%);
  color: #FFFFFF;
  font-size: 0.96rem;
  font-weight: 800;
  padding: 0.88rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(29, 78, 216, 0.28);
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}

.kf-modal-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(29, 78, 216, 0.36);
  background: linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%);
}

@media (max-width: 768px) {
  .kf-product-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }
  .kf-product-modal-card {
    max-height: 92vh;
    border-radius: 24px 24px 0 0;
    animation: kfDrawerSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes kfDrawerSlideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  .kf-modal-image-specs-grid {
    grid-template-columns: 1fr;
  }
  .kf-modal-image {
    max-width: 220px;
    margin: 0 auto;
  }
  .kf-guide-grid {
    grid-template-columns: 1fr;
  }
}
`;
  css += '\n' + modalCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Successfully updated src/css/style.css with modal and card image styles.');
}

// 7. Update src/js/app.js to expose modal functions
let appJs = fs.readFileSync(appJsPath, 'utf8');
if (!appJs.includes('openKidsFitProductModal')) {
  const exportAnchor = 'global.KidsFitApp =';
  const exportIdx = appJs.indexOf(exportAnchor);
  const appModalCode = `
  // Expose Modal Controllers on global
  if (typeof window !== 'undefined') {
    window.openKidsFitProductModal = window.openKidsFitProductModal || function(pid) {
      var modal = document.getElementById('kf-product-detail-modal');
      if (modal) modal.style.display = 'block';
    };
    window.closeKidsFitProductModal = window.closeKidsFitProductModal || function() {
      var modal = document.getElementById('kf-product-detail-modal');
      if (modal) modal.style.display = 'none';
    };
  }
`;
  if (exportIdx !== -1) {
    appJs = appJs.substring(0, exportIdx) + appModalCode + '\n  ' + appJs.substring(exportIdx);
    fs.writeFileSync(appJsPath, appJs, 'utf8');
    console.log('Successfully attached modal methods to src/js/app.js.');
  }
}

console.log('Milestone 2 overhaul application complete!');
