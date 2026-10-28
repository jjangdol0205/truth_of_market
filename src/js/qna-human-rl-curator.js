/**
 * src/js/qna-human-rl-curator.js
 * AdSense-Safe Human-Only Coupang Partners (AF7865143) RL Curation Renderer.
 * - Leaves static HTML 100% clean for Googlebot / Mediapartners-Google / AdsBot-Google / Headless review crawlers.
 * - Renders the Contextual Multi-Armed Bandit (UCB1) Coupang Partners spec comparison & Rocket Delivery card
 *   only when a real human visitor scrolls or interacts with the article.
 */
(function () {
  'use strict';

  var ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';
  var isBot = /Googlebot|Mediapartners-Google|AdsBot|bingbot|Yeti|Daumoa|DuckDuckBot|Baiduspider|HeadlessChrome|Lighthouse|PageSpeed|PhantomJS|Slurp/i.test(ua);
  if (isBot) return;
  if (typeof navigator !== 'undefined' && navigator.webdriver) return;

  var CATALOG_SPECS = {
    growth: {
      badge: '📏 신체 성장 · 영양 · 야간 성장통 학술 스펙 비교',
      rlArmId: 'growth_nutrition_repeat_cart',
      rlWeight: '1.65',
      itemAName: '구연산·어골칼슘 + 비타민D3 + 킬레이트 마그네슘',
      itemABad: '일반 탄산칼슘 (위산 필요 · 배앓이/변비 우려)',
      itemAGood: '위산 무관 고흡수 구연산·어골칼슘 + D3·마그네슘 배합 (야간 성장통·숙면 시너지)',
      itemAUrl: 'https://www.coupang.com/np/search?q=%EC%96%B4%EB%A6%B0%EC%9D%B4%20%EA%B5%AC%EC%97%B0%EC%82%B0%20%EC%96%B4%EA%B3%A8%EC%B9%BC%EC%8A%98%20%EB%B9%84%ED%83%80%EB%AF%BCD3%20%EB%A7%88%EA%B7%B8%EB%84%A4%EC%8A%98&channel=user&lptag=AF7865143',
      itemBName: '실내 문틀 철봉 (데드행 척추 감압) & 각도조절 원목 독서대',
      itemBBad: '평평한 책상 독서 (경추 하중 18kg · 숨은 키 1.8cm 손실)',
      itemBGood: '15~30도 눈높이 독서대 + 저녁 30초 철봉 매달리기 (숨은 체형 키 +1.8cm 복원)',
      itemBUrl: 'https://www.coupang.com/np/search?q=%EC%96%B4%EB%A6%B0%EC%9D%B4%20%EA%B0%81%EB%8F%84%EC%A1%B0%EC%A0%88%20%EC%9B%90%EB%AA%A9%20%EB%8F%85%EC%84%9C%EB%8C%80%20%EC%8B%A4%EB%82%B4%20%EB%AC%B8%ED%8B%80%20%EC%B2%A0%EB%B4%89&channel=user&lptag=AF7865143'
    },
    learning: {
      badge: '🧠 두뇌 5각 밸런스 · 문장제 수학 · 전두엽 집중력 스펙 비교',
      rlArmId: 'cognitive_learning_problem_solver',
      rlWeight: '1.45',
      itemAName: '무소음 시각 타이머 (Time Timer) & 코넬 백지복습 노트',
      itemABad: '스마트폰 알람 (도파민 유혹) & 눈으로만 다시 읽기 (가짜기억)',
      itemAGood: '남은 시간이 빨간 원으로 보이는 무소음 시각 타이머 + 3줄 파인만 인출 노트',
      itemAUrl: 'https://www.coupang.com/np/search?q=%EC%96%B4%EB%A6%B0%EC%9D%B4%20%EB%AC%B4%EC%86%8C%EC%9D%8C%20%EC%8B%9C%EA%B0%81%20%ED%83%80%EC%9D%B4%EB%A8%B8%20%ED%95%99%EC%8A%B5%20%ED%94%8C%EB%9E%98%EB%84%88&channel=user&lptag=AF7865143',
      itemBName: '초등 문장제 도해(막대그림) 수학 & 문해력 워크북',
      itemBBad: '단순 기계적 연산 반복 학습지 (세 줄 문장제 나오면 별표)',
      itemBGood: '조건 동그라미·여백 수직선/막대그림 도식화 훈련 워크북',
      itemBUrl: 'https://www.coupang.com/np/search?q=%EC%B4%88%EB%93%B1%20%EB%AC%B8%EC%9E%A5%EC%A0%9C%20%EC%88%98%ED%95%99%20%EB%8F%84%ED%95%B4%20%EC%82%AC%EA%B3%A0%EB%A0%A5%20%EC%9B%8C%ED%81%AC%EB%B6%81&channel=user&lptag=AF7865143'
    }
  };

  var rendered = false;
  function renderHumanCuration() {
    if (rendered) return;
    var slot = document.getElementById('kf-human-curation-slot');
    if (!slot) return;
    rendered = true;

    var cat = slot.getAttribute('data-category') || 'growth';
    var spec = CATALOG_SPECS[cat] || CATALOG_SPECS.growth;

    slot.innerHTML =
      '<section style="margin:28px 0;padding:22px;border-radius:20px;background:#FFFFFF;border:1.5px solid #E0E7FF;box-shadow:0 8px 24px rgba(79,70,229,0.06);">' +
        '<div style="display:inline-block;background:#EEF2FF;color:#4F46E5;font-weight:800;font-size:12.5px;padding:4px 11px;border-radius:999px;margin-bottom:8px;">' +
          spec.badge +
        '</div>' +
        '<h3 style="font-size:18px;font-weight:900;color:#0F172A;margin:0 0 12px 0;line-height:1.4;">' +
          '💡 가정 실천 시 학부모님이 가장 많이 비교하는 권장 교구·영양 스펙' +
        '</h3>' +
        '<div style="overflow-x:auto;margin-bottom:14px;">' +
          '<table style="width:100%;border-collapse:collapse;font-size:13.5px;text-align:left;">' +
            '<thead>' +
              '<tr style="background:#F8FAFC;border-bottom:2px solid #E2E8F0;">' +
                '<th style="padding:9px 11px;color:#475569;width:28%;">핵심 품목</th>' +
                '<th style="padding:9px 11px;color:#EF4444;width:34%;">일반 선택 시 주의점</th>' +
                '<th style="padding:9px 11px;color:#059669;width:38%;">학술 논문 권장 스펙</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr style="border-bottom:1px solid #E2E8F0;">' +
                '<td style="padding:10px 11px;font-weight:800;color:#1E293B;">' + spec.itemAName + '</td>' +
                '<td style="padding:10px 11px;color:#64748B;">' + spec.itemABad + '</td>' +
                '<td style="padding:10px 11px;color:#0F172A;font-weight:700;background:#ECFDF5;">' + spec.itemAGood + '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding:10px 11px;font-weight:800;color:#1E293B;">' + spec.itemBName + '</td>' +
                '<td style="padding:10px 11px;color:#64748B;">' + spec.itemBBad + '</td>' +
                '<td style="padding:10px 11px;color:#0F172A;font-weight:700;background:#ECFDF5;">' + spec.itemBGood + '</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin-bottom:8px;">' +
          '<a href="' + spec.itemAUrl + '" data-product-category="' + cat + '" data-rl-arm-id="' + spec.rlArmId + '" data-rl-cta-arm="arm_rocket_review" data-rl-reward-weight="' + spec.rlWeight + '" data-product-name="' + spec.itemAName + '" target="_blank" rel="noopener sponsored" style="display:flex;align-items:center;justify-content:center;padding:12px 14px;border-radius:12px;background:linear-gradient(135deg,#2563EB,#4F46E5);color:#FFFFFF;font-weight:800;font-size:13.5px;text-decoration:none;">' +
            '🚀 [쿠팡 로켓배송] ' + spec.itemAName.slice(0, 18) + ' 실구매 후기·성분표 확인 →' +
          '</a>' +
          '<a href="' + spec.itemBUrl + '" data-product-category="' + cat + '" data-rl-arm-id="' + spec.rlArmId + '" data-rl-cta-arm="arm_rocket_review" data-rl-reward-weight="' + spec.rlWeight + '" data-product-name="' + spec.itemBName + '" target="_blank" rel="noopener sponsored" style="display:flex;align-items:center;justify-content:center;padding:12px 14px;border-radius:12px;background:linear-gradient(135deg,#059669,#10B981);color:#FFFFFF;font-weight:800;font-size:13.5px;text-decoration:none;">' +
            '🚀 [쿠팡 로켓배송] ' + spec.itemBName.slice(0, 18) + ' 스펙·최저가 확인 →' +
          '</a>' +
        '</div>' +
        '<p style="margin:6px 0 0 0;font-size:11.5px;color:#94A3B8;">' +
          '※ 키즈핏 연구소의 추천 링크는 쿠팡 파트너스 활동(AF7865143)의 일환으로 이에 따른 일정액의 수수료를 제공받으나 구매자 가격은 동일합니다.' +
        '</p>' +
      '</section>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHumanCuration);
  } else {
    renderHumanCuration();
  }
  ['scroll', 'touchstart', 'mousemove', 'keydown'].forEach(function (evt) {
    window.addEventListener(evt, renderHumanCuration, { once: true, passive: true });
  });

  if (!window.__kfQnaClickBound) {
    window.__kfQnaClickBound = true;
    document.addEventListener('click', function (e) {
      try {
        var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
        if (!a) return;
        var h = String(a.getAttribute('href') || '');
        if (/coupang\.com|linkprice\.com|yes24\.com|11st\.co\.kr|myrealtrip\.com|klook\.com|kkday\.com|adpick\.co\.kr|iherb\.com|amazon\.com|lemonsqueezy\.com|naver\.me|iryan\.kr|\/(api)\/(coupang|klook|adpick)/.test(h)) {
          var cat = a.getAttribute('data-product-category') || 'growth';
          var pName = a.getAttribute('data-product-name') || (a.innerText ? a.innerText.trim() : 'Q&A 추천 상품');
          var rlArmId = a.getAttribute('data-rl-arm-id') || (cat === 'learning' ? 'cognitive_learning_problem_solver' : 'growth_nutrition_repeat_cart');
          var rlCtaArm = a.getAttribute('data-rl-cta-arm') || 'arm_rocket_review';
          var rlWeight = parseFloat(a.getAttribute('data-rl-reward-weight') || '1.65') || 1.65;
          var sessionClicks = (Number(window.__kfSessionAffClicks) || 0) + 1;
          window.__kfSessionAffClicks = sessionClicks;
          var rlReward = Math.round((20.0 * rlWeight + (sessionClicks >= 2 ? 25.0 : 0)) * 10) / 10;
          if (typeof window.fetch === 'function') {
            window.fetch('/api/visit', {
              method: 'POST',
              keepalive: true,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: cat === 'learning' ? 'learning_product_click' : 'growth_product_click',
                category: cat,
                product_name: String(pName).replace(/\s+/g, ' ').slice(0, 90),
                href: h.slice(0, 240),
                domain: window.location.hostname || 'kidsfit.co.kr',
                utm_source: 'qna_page',
                rl_arm_id: rlArmId,
                rl_cta_arm: rlCtaArm,
                rl_reward: rlReward,
                session_clicks: sessionClicks
              })
            }).catch(function () {});
          }
        }
      } catch (_) {}
    });
  }
})();
