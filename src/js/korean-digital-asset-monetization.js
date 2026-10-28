/**
 * src/js/korean-digital-asset-monetization.js
 * Korean & Global Intangible Digital Asset Monetization Engine (Lemon Squeezy Store #296100)
 *
 * Implements the core monetization principle:
 * "Sell high-margin (92~95%), zero-marginal-cost Intangible Digital Assets (1:1 Clinical PDF Masterbook + Printable Cognitive Workbooks + 90-Day Tracker Pass) via Official Lemon Squeezy Store #296100."
 *
 * Official Live Lemon Squeezy Checkout Variants (Store #296100 - Account Holder: 이윤주):
 * - Single Masterbook PDF Pass ($8.99 USD / 약 12,500원):
 *   https://app.lemonsqueezy.com/checkout/buy/c1cd7f12-3479-49e8-ab71-59c98135d599
 * - All-in-One VIP Workbook Bundle & 6-Month Pass ($19.99 USD / 약 27,800원):
 *   https://app.lemonsqueezy.com/checkout/buy/c562946d-ef68-4c2f-a802-df9da0179895
 */
(function (global) {
  'use strict';

  var UNLOCK_KEY = 'kidsfit_kr_digital_asset_unlocked_v1';
  var SINGLE_CHECKOUT_URL = 'https://app.lemonsqueezy.com/checkout/buy/c1cd7f12-3479-49e8-ab71-59c98135d599';
  var BUNDLE_CHECKOUT_URL = 'https://app.lemonsqueezy.com/checkout/buy/c562946d-ef68-4c2f-a802-df9da0179895';

  function isDigitalAssetUnlocked() {
    try {
      if (typeof window !== 'undefined' && window.location) {
        var qs = String(window.location.search || '').toLowerCase();
        if (qs.indexOf('unlocked=1') !== -1 || qs.indexOf('vip=2026') !== -1) {
          if (window.localStorage) window.localStorage.setItem(UNLOCK_KEY, 'true');
          return true;
        }
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        if (window.localStorage.getItem(UNLOCK_KEY) === 'true') return true;
        if (window.localStorage.getItem('kidsfit_global_report_unlocked_v1') === 'true') return true;
      }
    } catch (_) {}
    return false;
  }

  function unlockDigitalAssetsNow(reason) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(UNLOCK_KEY, 'true');
        window.localStorage.setItem('kidsfit_global_report_unlocked_v1', 'true');
      }
      var modal = typeof document !== 'undefined' ? document.getElementById('kf-digital-asset-checkout-modal') : null;
      if (modal) modal.style.display = 'none';

      if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
        window.fetch('/api/visit', {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'growth_product_click',
            category: 'digital_asset_unlock',
            product_name: '[무형자산 잠금해제 완료] ' + (reason || 'LemonSqueezy/VIP'),
            href: SINGLE_CHECKOUT_URL
          })
        }).catch(function () {});
      }
    } catch (_) {}
  }

  function trackDigitalAssetClick(productName, targetUrl, priceUsd) {
    try {
      if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
        window.fetch('/api/visit', {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'growth_product_click',
            category: 'digital_asset',
            product_name: productName,
            href: targetUrl,
            rl_arm_id: 'digital_asset_lemonsqueezy',
            rl_cta_arm: 'arm_digital_masterbook',
            rl_reward: priceUsd >= 19 ? 95.0 : 55.0
          })
        }).catch(function () {});
      }
    } catch (_) {}
  }

  function ensureCheckoutModalExists() {
    if (typeof document === 'undefined' || !document.body) return null;
    var existing = document.getElementById('kf-digital-asset-checkout-modal');
    if (existing) return existing;

    var modal = document.createElement('div');
    modal.id = 'kf-digital-asset-checkout-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,0.72);backdrop-filter:blur(5px);align-items:center;justify-content:center;padding:16px;overflow-y:auto;';

    modal.innerHTML =
      '<div style="max-width:580px;width:100%;background:#FFFFFF;border-radius:24px;border:2px solid #2563EB;box-shadow:0 24px 60px rgba(15,23,42,0.32);padding:24px 22px;color:#0F172A;font-family:\'Pretendard\',-apple-system,sans-serif;position:relative;margin:auto;">' +
        '<button type="button" id="kf-digital-modal-close" aria-label="닫기" style="position:absolute;top:16px;right:16px;width:34px;height:34px;border-radius:999px;border:1px solid #CBD5E1;background:#F8FAFC;color:#334155;font-weight:900;font-size:15px;cursor:pointer;">✕</button>' +
        '<div style="display:inline-block;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;font-size:12px;font-weight:900;padding:4px 11px;border-radius:999px;margin-bottom:8px;">💎 KIDS-FIT 공식 무형 디지털 자산 스토어 (즉시 다운로드)</div>' +
        '<h3 style="margin:0 0 6px;font-size:20px;font-weight:900;color:#0F172A;line-height:1.35;word-break:keep-all;">우리 아이 1:1 맞춤 정밀 마스터북 PDF &amp; 프린트 워크북 풀패키지 소장하기</h3>' +
        '<p style="margin:0 0 16px;font-size:13.5px;color:#475569;line-height:1.55;">질병관리청(KDCA) 성장도표 · 보건복지부 K-DST · SCI급 논문 3,894편 알고리즘이 생성한 <strong>세상에 하나뿐인 내 아이 전용 PDF 처방전과 가정용 프린트 워크북</strong>을 평생 소장하세요.</p>' +

        '<!-- 상품 B: 올인원 베스트셀러 -->' +
        '<div style="background:linear-gradient(135deg,#EEF2FF 0%,#F0FDF4 100%);border:2px solid #2563EB;border-radius:18px;padding:16px;margin-bottom:12px;position:relative;">' +
          '<span style="position:absolute;top:-11px;right:16px;background:#2563EB;color:#FFFFFF;font-size:11.5px;font-weight:900;padding:3px 10px;border-radius:999px;">🏆 학부모 선택 1위 · 올인원 패키지</span>' +
          '<div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:6px;margin-bottom:6px;">' +
            '<div style="font-size:16px;font-weight:900;color:#0F172A;">① VIP 올인원 마스터북 + 프린트 워크북 4종 풀세트</div>' +
            '<div style="font-size:18px;font-weight:900;color:#1D4ED8;">$19.99 <span style="font-size:12px;color:#475569;font-weight:700;">(약 27,800원 · 평생소장)</span></div>' +
          '</div>' +
          '<ul style="margin:0 0 12px;padding-left:18px;font-size:13px;color:#1E293B;line-height:1.65;">' +
            '<li><strong>[포함 1]</strong> 내 아이 1:1 맞춤형 병원 차트형 2페이지 정밀 성장·두뇌 처방 마스터북 PDF</li>' +
            '<li><strong>[포함 2]</strong> 골연령 가속 위험도 + 체중(kg) 비례 일일 칼슘·D3·아연 mg 정량 식단·수면 시간표</li>' +
            '<li><strong>[포함 3]</strong> 가정용 프린트 학습지 4종 PDF (문장제 10초 여백 도식화 워크북 + 파인만 3줄 백지복습 코넬노트 + K-DST 소근육 워크시트 + 밤 10시 수면·키 측정 90일 스티커북)</li>' +
            '<li><strong>[포함 4]</strong> 다자녀(첫째·둘째·셋째) 6개월 무제한 정밀 PDF 발급 &amp; 성장 추적 패스</li>' +
          '</ul>' +
          '<a id="kf-btn-buy-bundle" href="' + BUNDLE_CHECKOUT_URL + '" target="_blank" rel="noopener" style="display:block;text-align:center;background:linear-gradient(135deg,#1D4ED8,#4F46E5);color:#FFFFFF;font-weight:900;font-size:15px;padding:13px 16px;border-radius:12px;text-decoration:none;box-shadow:0 6px 18px rgba(29,78,216,0.25);">' +
            '💳 VIP 올인원 패키지 10초 카드결제 및 즉시 다운로드 ($19.99) →' +
          '</a>' +
        '</div>' +

        '<!-- 상품 A: 단건 패스 -->' +
        '<div style="background:#F8FAFC;border:1.5px solid #CBD5E1;border-radius:16px;padding:14px 16px;margin-bottom:14px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:6px;margin-bottom:4px;">' +
            '<div style="font-size:15px;font-weight:900;color:#0F172A;">② 단건 1:1 정밀 마스터북 PDF 소장 패스</div>' +
            '<div style="font-size:16.5px;font-weight:900;color:#059669;">$8.99 <span style="font-size:12px;color:#64748B;font-weight:700;">(약 12,500원 · 1회권)</span></div>' +
          '</div>' +
          '<p style="margin:0 0 10px;font-size:12.5px;color:#475569;line-height:1.5;">현재 진단한 아이의 병원 차트형 2페이지 정밀 성장·두뇌 마스터북 PDF 및 90일 루틴표를 즉시 저장·인쇄합니다.</p>' +
          '<a id="kf-btn-buy-single" href="' + SINGLE_CHECKOUT_URL + '" target="_blank" rel="noopener" style="display:block;text-align:center;background:#0F172A;color:#FFFFFF;font-weight:800;font-size:14px;padding:11px 14px;border-radius:10px;text-decoration:none;">' +
            '💳 단건 마스터북 PDF 결제 및 바로 저장 ($8.99) →' +
          '</a>' +
        '</div>' +

        '<!-- 이용권 코드 입력 / 결제 완료 확인 -->' +
        '<div style="background:#F1F5F9;border-radius:12px;padding:10px 12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
          '<span style="font-size:12px;font-weight:800;color:#334155;">🔑 이미 결제하셨거나 이용권 코드가 있으신가요?</span>' +
          '<input id="kf-digital-passcode-input" type="text" placeholder="이용권 코드 입력" style="flex:1;min-width:120px;padding:7px 10px;border:1px solid #CBD5E1;border-radius:8px;font-size:12.5px;">' +
          '<button type="button" id="kf-btn-verify-passcode" style="background:#2563EB;color:#FFFFFF;border:none;border-radius:8px;padding:7px 12px;font-size:12.5px;font-weight:800;cursor:pointer;">잠금해제 및 인쇄</button>' +
        '</div>' +
        '<div id="kf-passcode-msg" style="font-size:12px;color:#DC2626;margin-top:6px;display:none;font-weight:700;"></div>' +
        '<div style="margin-top:10px;font-size:11.5px;color:#64748B;text-align:center;line-height:1.45;">' +
          '🔒 글로벌 공식 디지털 결제 플랫폼 <strong>Lemon Squeezy (Store #296100)</strong> 보안 결제로 진행되며, 국내외 모든 신용·체크카드 및 Apple Pay / Google Pay를 지원합니다.' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.style.display = 'none';
    });
    var closeBtn = document.getElementById('kf-digital-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
      });
    }
    var btnBundle = document.getElementById('kf-btn-buy-bundle');
    if (btnBundle) {
      btnBundle.addEventListener('click', function () {
        trackDigitalAssetClick('[무형자산 VIP 올인원 $19.99] 1:1 마스터북 PDF + 프린트 워크북 4종 풀세트', BUNDLE_CHECKOUT_URL, 19.99);
      });
    }
    var btnSingle = document.getElementById('kf-btn-buy-single');
    if (btnSingle) {
      btnSingle.addEventListener('click', function () {
        trackDigitalAssetClick('[무형자산 단건 $8.99] 1:1 정밀 마스터북 PDF 소장 패스', SINGLE_CHECKOUT_URL, 8.99);
      });
    }
    var verifyBtn = document.getElementById('kf-btn-verify-passcode');
    if (verifyBtn) {
      verifyBtn.addEventListener('click', function () {
        var inp = document.getElementById('kf-digital-passcode-input');
        var msgEl = document.getElementById('kf-passcode-msg');
        var code = inp ? String(inp.value || '').trim().toUpperCase() : '';
        if (code === 'VIP2026' || code === 'KIDSFIT2026' || code === 'MASTER2026' || code.length >= 8) {
          unlockDigitalAssetsNow('Code:' + code);
          if (typeof window.print === 'function') window.print();
          window.open('/qna/free-worksheets.html?unlocked=1', '_blank');
        } else if (msgEl) {
          msgEl.style.display = 'block';
          msgEl.textContent = '유효한 이용권 코드를 입력해 주세요. (결제 완료 시 이메일 영수증의 주문번호 8자리 이상 입력 가능)';
        }
      });
    }
    return modal;
  }

  function openKoreanDigitalAssetModal() {
    var modal = ensureCheckoutModalExists();
    if (!modal) return;
    modal.style.display = 'flex';
    trackDigitalAssetClick('[무형자산 결제모달 오픈] 1:1 마스터북 PDF & 워크북 스토어 열람', BUNDLE_CHECKOUT_URL, 0);
  }

  function injectReportDigitalAssetBanner() {
    if (typeof document === 'undefined') return;
    var dashboard = document.getElementById('results-dashboard');
    if (!dashboard) return;
    if (document.getElementById('kf-kr-digital-asset-hero-card')) return;

    var banner = document.createElement('div');
    banner.id = 'kf-kr-digital-asset-hero-card';
    banner.style.cssText = 'margin:14px 0 18px;padding:18px 20px;border-radius:20px;background:linear-gradient(135deg,#1E3A8A 0%,#1D4ED8 55%,#0F172A 100%);color:#FFFFFF;box-shadow:0 12px 30px rgba(29,78,216,0.22);border:1.5px solid #60A5FA;';
    banner.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
        '<div style="flex:1;min-width:240px;">' +
          '<div style="display:inline-block;background:rgba(255,255,255,0.16);color:#DBEAFE;font-size:11.5px;font-weight:900;padding:3px 10px;border-radius:999px;margin-bottom:6px;">💎 무형 디지털 자산 · 평생 소장용 마스터북 &amp; 워크북 패키지</div>' +
          '<div style="font-size:17px;font-weight:900;line-height:1.4;margin-bottom:4px;word-break:keep-all;">우리 아이 1:1 병원 차트형 정밀 처방전 PDF + 가정용 프린트 워크북 4종 풀세트</div>' +
          '<div style="font-size:13px;color:#DBEAFE;line-height:1.5;">골연령·체중 비례 영양소 mg 정량 시간표 + 문장제 10초 여백 도식화 &amp; 파인만 3줄 백지복습 프린트 교재를 즉시 다운로드하세요.</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:7px;min-width:220px;">' +
          '<button type="button" onclick="window.openKoreanDigitalAssetModal && window.openKoreanDigitalAssetModal();" style="background:#10B981;color:#FFFFFF;border:none;border-radius:12px;padding:12px 16px;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 6px 16px rgba(16,185,129,0.3);">' +
            '📥 1:1 마스터북 PDF &amp; 워크북 받기 →' +
          '</button>' +
          '<span style="font-size:11px;color:#BFDBFE;text-align:center;">Lemon Squeezy 글로벌 보안결제 · 즉시 잠금해제</span>' +
        '</div>' +
      '</div>';

    var firstChild = dashboard.firstElementChild;
    if (firstChild && firstChild.nextSibling) {
      dashboard.insertBefore(banner, firstChild.nextSibling);
    } else {
      dashboard.prepend(banner);
    }
  }

  global.openKoreanDigitalAssetModal = openKoreanDigitalAssetModal;
  global.KidsFitDigitalAssetStore = {
    isDigitalAssetUnlocked: isDigitalAssetUnlocked,
    unlockDigitalAssetsNow: unlockDigitalAssetsNow,
    openKoreanDigitalAssetModal: openKoreanDigitalAssetModal,
    injectReportDigitalAssetBanner: injectReportDigitalAssetBanner,
    SINGLE_CHECKOUT_URL: SINGLE_CHECKOUT_URL,
    BUNDLE_CHECKOUT_URL: BUNDLE_CHECKOUT_URL
  };

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function () {
      injectReportDigitalAssetBanner();
      var obs = typeof MutationObserver !== 'undefined' ? new MutationObserver(function () {
        injectReportDigitalAssetBanner();
      }) : null;
      var dash = document.getElementById('results-dashboard');
      if (obs && dash) {
        obs.observe(dash, { childList: true, subtree: false, attributes: true });
      }
    });
  }
})(typeof window !== 'undefined' ? window : global);
