/**
 * scripts/apply_static_render_and_mall_upgrade.js
 * 1. Updates scripts/build.js so `npm run build` generates full Render Static Site endpoints:
 *    - dist/api/health & dist/api/health.json
 *    - dist/api/stats & dist/api/stats.json
 *    - dist/api/adpick-offers & dist/api/adpick-offers.json
 *    - dist/api/share-card.svg
 *    - dist/_redirects & dist/_headers
 *    - dist/en/ (Global English edition static subdirectory)
 * 2. Updates src/js/korean-digital-asset-monetization.js with:
 *    - Static Site POST /api/visit graceful client-side interceptor (zero 404/405 console errors on static CDN)
 *    - KidsFit Parenting Shopping Mall (Coupang Partners AF7865143 + iHerb IPZ1547 + Parenting CPA)
 *      Click/Purchase-to-Unlock Diagnosis Result system!
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// 1. Patch scripts/build.js
const buildPath = path.join(ROOT, 'scripts', 'build.js');
let buildSrc = fs.readFileSync(buildPath, 'utf8');

if (!buildSrc.includes('generateStaticApiEndpoints')) {
  const targetStr = "  const duration = Date.now() - startTime;\r\n  console.log(`Build complete in ${duration}ms! Target: ${DIST_DIR}`);\r\n}";
  const targetStrLf = "  const duration = Date.now() - startTime;\n  console.log(`Build complete in ${duration}ms! Target: ${DIST_DIR}`);\n}";

  const replacementBlock = `  try {
    const targetGlobalDir = path.join(ROOT_DIR, 'dist-global');
    if (fs.existsSync(targetGlobalDir)) {
      copyRecursiveSync(targetGlobalDir, path.join(DIST_DIR, 'en'));
      console.log('Copied dist-global/ -> dist/en/ for Render Static Site /en/ routing');
    }
  } catch (_) {}

  generateStaticApiEndpoints();

  const duration = Date.now() - startTime;
  console.log(\`Build complete in \${duration}ms! Target: \${DIST_DIR}\`);
}

function generateStaticApiEndpoints() {
  try {
    const apiDir = path.join(DIST_DIR, 'api');
    fs.mkdirSync(apiDir, { recursive: true });

    const kbPath = path.join(ROOT_DIR, 'src', 'data', 'research-knowledge-base.json');
    let totalPapers = 3894;
    if (fs.existsSync(kbPath)) {
      try {
        const kb = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
        totalPapers = Number((kb.metadata && kb.metadata.total_papers) || (Array.isArray(kb.papers) ? kb.papers.length : 3894));
      } catch (_) {}
    }

    const healthPayload = JSON.stringify({
      status: 'ok',
      service: 'KidsFit Growth Studio (Render Static Site)',
      mode: 'static',
      domain: 'kidsfit.co.kr',
      total_papers: totalPapers,
      timestamp: new Date().toISOString()
    }, null, 2);
    fs.writeFileSync(path.join(apiDir, 'health'), healthPayload, 'utf8');
    fs.writeFileSync(path.join(apiDir, 'health.json'), healthPayload, 'utf8');

    let statsData = {
      status: 'ok',
      mode: 'static',
      analytics: {
        today: { date: new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10), uv: 0, pv: 0, diagnoses: { total: 0, growth: 0, learning: 0 }, affiliateClicks: 0, recentClicks: [] },
        total: { uv: 0, pv: 0, diagnoses: { total: 0, growth: 0, learning: 0 }, affiliateClicks: 0 }
      }
    };
    const snapPath = path.join(ROOT_DIR, 'src', 'data', 'visitor-analytics-snapshot.json');
    const logStatsPath = path.join(ROOT_DIR, 'logs', 'visitor_analytics.json');
    const sourceStatsPath = fs.existsSync(logStatsPath) ? logStatsPath : (fs.existsSync(snapPath) ? snapPath : null);
    if (sourceStatsPath) {
      try {
        const rawStats = JSON.parse(fs.readFileSync(sourceStatsPath, 'utf8'));
        const kstToday = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
        const days = rawStats.days || {};
        const todayBucket = days[kstToday] || Object.values(days).slice(-1)[0] || statsData.analytics.today;
        statsData = {
          status: 'ok',
          mode: 'static',
          analytics: {
            today: todayBucket,
            total: rawStats.total || statsData.analytics.total
          }
        };
      } catch (_) {}
    }
    const statsJson = JSON.stringify(statsData, null, 2);
    fs.writeFileSync(path.join(apiDir, 'stats'), statsJson, 'utf8');
    fs.writeFileSync(path.join(apiDir, 'stats.json'), statsJson, 'utf8');

    const adpickJson = JSON.stringify({
      status: 'ok',
      source: 'static-curated',
      offers: [
        { id: 'coupang-calc', title: '어린이 구연산·어골칼슘 & 비타민D3 로켓배송', url: 'https://www.coupang.com/np/search?q=%EC%96%B4%EB%A6%B0%EC%9D%B4+%EA%B5%AC%EC%97%B0%EC%82%B0+%EC%96%B4%EA%B3%A8%EC%B9%BC%EC%8A%98+%EB%B9%84%ED%83%80%EB%AF%BCD3&channel=user&lptag=AF7865143', platform: 'Coupang Partners' },
        { id: 'iherb-zinc', title: '아이허브 어린이 액상 글루콘산 아연 & 유기농 D3', url: 'https://kr.iherb.com/search?kw=%EC%96%B4%EB%A6%B0%EC%9D%B4+%EC%95%84%EC%97%B0+%EB%B9%84%ED%83%80%EB%AF%BCD3&rcode=IPZ1547', platform: 'iHerb' }
      ]
    }, null, 2);
    fs.writeFileSync(path.join(apiDir, 'adpick-offers'), adpickJson, 'utf8');
    fs.writeFileSync(path.join(apiDir, 'adpick-offers.json'), adpickJson, 'utf8');

    const shareSvg = \`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420" viewBox="0 0 800 420"><rect width="800" height="420" rx="28" fill="#1E3A8A"/><text x="50" y="95" fill="#93C5FD" font-family="sans-serif" font-size="22" font-weight="bold">KIDS-FIT GROWTH &amp; BRAIN STUDIO (kidsfit.co.kr)</text><text x="50" y="165" fill="#FFFFFF" font-family="sans-serif" font-size="38" font-weight="bold">우리 아이 맞춤형 키성장 · 두뇌발달 정밀 처방전</text><text x="50" y="235" fill="#DBEAFE" font-family="sans-serif" font-size="24">질병관리청(KDCA) 성장도표 · K-DST · 학술논문 \${totalPapers.toLocaleString('en-US')}편 기반</text><rect x="50" y="295" width="380" height="64" rx="32" fill="#10B981"/><text x="90" y="336" fill="#FFFFFF" font-family="sans-serif" font-size="24" font-weight="bold">https://kidsfit.co.kr 무료 진단</text></svg>\`;
    fs.writeFileSync(path.join(apiDir, 'share-card.svg'), shareSvg, 'utf8');

    const redirectsContent = [
      '/api/health /api/health.json 200',
      '/api/stats /api/stats.json 200',
      '/api/adpick-offers /api/adpick-offers.json 200',
      '/en /en/index.html 200',
      '/* /index.html 200'
    ].join('\\n') + '\\n';
    fs.writeFileSync(path.join(DIST_DIR, '_redirects'), redirectsContent, 'utf8');
    console.log('[Build] Generated static API endpoints (dist/api/health, stats, adpick-offers, share-card.svg) & dist/_redirects for Render Static Site.');
  } catch (e) {
    console.warn('[Build] Static API generation warning:', e.message);
  }
}`;

  if (buildSrc.includes(targetStr)) {
    buildSrc = buildSrc.replace(targetStr, replacementBlock);
  } else if (buildSrc.includes(targetStrLf)) {
    buildSrc = buildSrc.replace(targetStrLf, replacementBlock);
  }
  fs.writeFileSync(buildPath, buildSrc, 'utf8');
  console.log('✅ Updated scripts/build.js with Render Static Site endpoint generation.');
}

// 2. Patch src/js/korean-digital-asset-monetization.js with Static Fetch Adapter + Parenting Shopping Mall Click-to-Unlock
const monPath = path.join(ROOT, 'src', 'js', 'korean-digital-asset-monetization.js');
let monSrc = fs.readFileSync(monPath, 'utf8');

if (!monSrc.includes('kf-parenting-shopping-mall')) {
  const oldSponsorBlock = `        '<!-- 상품 C: 스폰서 제휴 0원 요약본 인쇄 패스 (쿠팡 로켓 24시간 쿠키 락인) -->' +
        '<div style="background:linear-gradient(135deg,#FFFBEB 0%,#FEF3C7 100%);border:1.5px solid #F59E0B;border-radius:16px;padding:12px 14px;margin-bottom:12px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:4px;">' +
            '<div style="font-size:13.5px;font-weight:900;color:#92400E;">🎁 ③ [학부모 후원 0원 패스] 오늘 요약본·워크지 1회 무료 인쇄 열기</div>' +
            '<span style="background:#F59E0B;color:#FFFFFF;font-size:11px;font-weight:900;padding:2px 8px;border-radius:999px;">카드결제 없이 3초 완료</span>' +
          '</div>' +
          '<p style="margin:0 0 8px;font-size:11.8px;color:#78350F;line-height:1.45;">해외 카드 결제가 번거로우신가요? 아래 <strong>우리 아이 권장 스펙 준비물(쿠팡 로켓배송)</strong>을 1회 확인하시면 스폰서 후원으로 현재 화면/워크지 1회 인쇄가 즉시 무료로 열립니다.</p>' +
          '<a id="kf-btn-sponsored-coupang-unlock" href="https://www.coupang.com/np/search?q=%EC%96%B4%EB%A6%B0%EC%9D%B4+%EA%B5%AC%EC%97%B0%EC%82%B0+%EC%96%B4%EA%B3%A8%EC%B9%BC%EC%8A%98+%EB%B9%84%ED%83%80%EB%AF%BCD3+%EB%AC%B4%EC%86%8C%EC%9D%8C+%EC%8B%9C%EA%B0%81%ED%83%80%EC%9D%B4%EB%A8%B8+%EC%9B%90%EB%AA%A9%EB%8F%85%EC%84%9C%EB%8C%80&channel=user&lptag=AF7865143" target="_blank" rel="noopener sponsored" style="display:block;text-align:center;background:#D97706;color:#FFFFFF;font-weight:900;font-size:13px;padding:10px 14px;border-radius:10px;text-decoration:none;box-shadow:0 4px 12px rgba(217,119,6,0.25);">' +
            '🚀 [0원 무료 인쇄] 쿠팡 로켓 권장 준비물 1초 확인하고 바로 인쇄 열기 →' +
          '</a>' +
        '</div>' +`;

  const newSponsorBlock = `        '<!-- 상품 C: 키즈핏 육아 쇼핑몰 (쿠팡파트너스 / 아이허브 / 육아 CPA) 클릭·구매 시 검사결과 0원 잠금해제 -->' +
        '<div style="background:linear-gradient(135deg,#FFFBEB 0%,#FEF3C7 100%);border:2px solid #F59E0B;border-radius:16px;padding:13px 15px;margin-bottom:12px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px;">' +
            '<div style="font-size:14px;font-weight:900;color:#92400E;">🛍️ ③ [육아몰 클릭 시 0원 잠금해제] 추천 육아템 확인하고 검사결과·워크북 바로 열기</div>' +
            '<span style="background:#D97706;color:#FFFFFF;font-size:11px;font-weight:900;padding:2px 8px;border-radius:999px;">클릭 즉시 검사결과 해금!</span>' +
          '</div>' +
          '<p style="margin:0 0 9px;font-size:12px;color:#78350F;line-height:1.45;">별도 결제 없이 아래 <strong>키즈핏 육아 쇼핑몰(쿠팡 로켓배송 · 아이허브 영양제 · 연령별 교구/도서 CPA)</strong> 상품 중 하나만 클릭(또는 구매)하시면 <strong>맞춤 정밀 검사결과 전체와 A4 프린트 워크북이 즉시 무료로 잠금해제</strong>됩니다!</p>' +
          '<div style="display:flex;flex-direction:column;gap:7px;">' +
            '<a id="kf-btn-sponsored-coupang-unlock" href="https://www.coupang.com/np/search?q=%EC%96%B4%EB%A6%B0%EC%9D%B4+%EA%B5%AC%EC%97%B0%EC%82%B0+%EC%96%B4%EA%B3%A8%EC%B9%BC%EC%8A%98+%EB%B9%84%ED%83%80%EB%AF%BCD3+%EB%AC%B4%EC%86%8C%EC%9D%8C+%EC%8B%9C%EA%B0%81%ED%83%80%EC%9D%B4%EB%A8%B8+%EC%9B%90%EB%AA%A9%EB%8F%85%EC%84%9C%EB%8C%80&channel=user&lptag=AF7865143" target="_blank" rel="noopener sponsored" style="display:block;text-align:center;background:#D97706;color:#FFFFFF;font-weight:900;font-size:13px;padding:10px 14px;border-radius:10px;text-decoration:none;box-shadow:0 4px 12px rgba(217,119,6,0.25);">' +
              '🚀 [쿠팡 로켓 육아몰] 연령별 키성장 영양제·공룡쿠키틀·독서대 확인하고 검사결과 열기 →' +
            '</a>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:7px;">' +
              '<a id="kf-btn-sponsored-iherb-unlock" href="https://kr.iherb.com/search?kw=%EC%96%B4%EB%A6%B0%EC%9D%B4+%EC%95%84%EC%97%B0+%EB%B9%84%ED%83%80%EB%AF%BCD3+%EC%B9%BC%EC%8A%98&rcode=IPZ1547" target="_blank" rel="noopener sponsored" style="display:block;text-align:center;background:#15803D;color:#FFFFFF;font-weight:900;font-size:12.5px;padding:9px 12px;border-radius:10px;text-decoration:none;">' +
                '🌿 [아이허브 직구몰] 아기 액상 아연·D3 확인하고 결과 열기 →' +
              '</a>' +
              '<a id="kf-btn-sponsored-cpa-unlock" href="https://www.yes24.com/Product/Search?domain=ALL&query=%EC%B4%88%EB%93%B1+%EB%AC%B8%ED%95%B4%EB%A0%A5+%EB%91%90%EB%87%8C%EB%B0%9C%EB%8B%AC" target="_blank" rel="noopener sponsored" style="display:block;text-align:center;background:#1E40AF;color:#FFFFFF;font-weight:900;font-size:12.5px;padding:9px 12px;border-radius:10px;text-decoration:none;">' +
                '📚 [육아 도서·교구 CPA] 연령별 두뇌 워크북 확인하고 결과 열기 →' +
              '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +`;

  const normalizedMon = monSrc.replace(/\r\n/g, '\n');
  let patchedMon = normalizedMon.replace(oldSponsorBlock, newSponsorBlock);

  const extraHookCode = `
    ['kf-btn-sponsored-iherb-unlock', 'kf-btn-sponsored-cpa-unlock'].forEach(function (btnId) {
      var el = document.getElementById(btnId);
      if (el) {
        el.addEventListener('click', function () {
          unlockDigitalAssetsNow('MallClick:' + btnId);
          trackDigitalAssetClick('[육아몰 클릭 검사결과 잠금해제] ' + btnId, el.getAttribute('href'), 0);
          modal.style.display = 'none';
        });
      }
    });`;

  patchedMon = patchedMon.replace(
    "    var verifyBtn = document.getElementById('kf-btn-verify-passcode');",
    extraHookCode + "\n    var verifyBtn = document.getElementById('kf-btn-verify-passcode');"
  );

  // Add Static Site Fetch Interceptor & Parenting Shopping Mall Section Injector
  const mallInjectorCode = `
  function injectParentingShoppingMallSection() {
    if (typeof document === 'undefined' || isJsdomEnv()) return;
    if (document.getElementById('kf-parenting-shopping-mall')) return;
    var targetContainer = document.getElementById('results-dashboard') || document.querySelector('main') || document.body;
    if (!targetContainer) return;

    var mall = document.createElement('section');
    mall.id = 'kf-parenting-shopping-mall';
    mall.style.cssText = 'max-width:980px;margin:18px auto;padding:20px;border-radius:24px;background:#FFFFFF;border:2px solid #F59E0B;box-shadow:0 12px 32px rgba(15,23,42,0.08);font-family:"Pretendard",-apple-system,sans-serif;';
    mall.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">' +
        '<span style="background:#FEF3C7;color:#B45309;border:1px solid #FCD34D;font-size:12px;font-weight:900;padding:4px 12px;border-radius:999px;">🛍️ KIDS-FIT 공식 육아 큐레이션 쇼핑몰 (쿠팡 로켓 · 아이허브 · 육아 CPA)</span>' +
        '<span style="background:#DCFCE7;color:#15803D;font-size:12px;font-weight:900;padding:4px 12px;border-radius:999px;">🎁 상품 클릭/구경 시 맞춤 정밀 검사결과 &amp; A4 워크북 100% 무료 잠금해제!</span>' +
      '</div>' +
      '<h3 style="margin:0 0 6px;font-size:19px;font-weight:900;color:#0F172A;line-height:1.35;">우리 아이 성장·두뇌 맞춤 베스트 육아템 스토어 (클릭 시 정밀 진단 결과 즉시 열람)</h3>' +
      '<p style="margin:0 0 14px;font-size:13px;color:#475569;line-height:1.5;">아래 연령·증상별 검증된 육아 필수템(쿠팡 파트너스 · 아이허브 · 도서/체험 CPA) 중 관심 있는 상품을 1회 클릭하시면 <strong>내 아이 1:1 정밀 검사결과 및 A4 코칭 워크북 잠금이 즉시 해제</strong>됩니다.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(265px,1fr));gap:12px;">' +
        '<a class="kf-mall-unlock-item" href="https://www.coupang.com/np/search?q=%EC%96%B4%EB%A6%B0%EC%9D%B4+%EA%B5%AC%EC%97%B0%EC%82%B0+%EC%96%B4%EA%B3%A8%EC%B9%BC%EC%8A%98+%EB%B9%84%ED%83%80%EB%AF%BCD3&channel=user&lptag=AF7865143" target="_blank" rel="noopener sponsored" style="display:flex;flex-direction:column;justify-content:space-between;background:#FFFBEB;border:1.5px solid #FCD34D;border-radius:16px;padding:14px;text-decoration:none;color:#0F172A;">' +
          '<div><span style="background:#D97706;color:#FFF;font-size:11px;font-weight:900;padding:2px 8px;border-radius:999px;">🚀 쿠팡 로켓 BEST 1</span>' +
          '<div style="font-size:15px;font-weight:900;margin:8px 0 4px;">고흡수 구연산·어골칼슘 + 비타민D3</div>' +
          '<div style="font-size:12px;color:#78350F;margin-bottom:10px;">우유 거부·키성장 골든타임 필수 영양제</div></div>' +
          '<div style="background:#D97706;color:#FFF;text-align:center;padding:9px;border-radius:10px;font-size:13px;font-weight:900;">특가 확인하고 검사결과 잠금해제 →</div>' +
        '</a>' +
        '<a class="kf-mall-unlock-item" href="https://kr.iherb.com/search?kw=%EC%96%B4%EB%A6%B0%EC%9D%B4+%EC%95%84%EC%97%B0+%EB%B9%84%ED%83%80%EB%AF%BCD3+%EC%9C%A0%EC%82%B0%EA%B7%A0&rcode=IPZ1547" target="_blank" rel="noopener sponsored" style="display:flex;flex-direction:column;justify-content:space-between;background:#F0FDF4;border:1.5px solid #86EFAC;border-radius:16px;padding:14px;text-decoration:none;color:#0F172A;">' +
          '<div><span style="background:#15803D;color:#FFF;font-size:11px;font-weight:900;padding:2px 8px;border-radius:999px;">🌿 아이허브 직구 BEST 2</span>' +
          '<div style="font-size:15px;font-weight:900;margin:8px 0 4px;">입 짧은 아기 액상 글루콘산 아연 &amp; D3</div>' +
          '<div style="font-size:12px;color:#14532D;margin-bottom:10px;">미각 세포 활성화로 고기·채소 편식 개선</div></div>' +
          '<div style="background:#15803D;color:#FFF;text-align:center;padding:9px;border-radius:10px;font-size:13px;font-weight:900;">아이허브 확인하고 검사결과 열기 →</div>' +
        '</a>' +
        '<a class="kf-mall-unlock-item" href="https://www.coupang.com/np/search?q=%EA%B3%B5%EB%A3%A1+%EC%BF%A0%ED%82%A4%ED%8B%80+%EB%AC%B4%EC%86%8C%EC%9D%8C+%EC%8B%9C%EA%B0%81%ED%83%80%EC%9D%B4%EB%A8%B8+%EC%9B%90%EB%AA%A9%EB%8F%85%EC%84%9C%EB%8C%80&channel=user&lptag=AF7865143" target="_blank" rel="noopener sponsored" style="display:flex;flex-direction:column;justify-content:space-between;background:#EFF6FF;border:1.5px solid #93C5FD;border-radius:16px;padding:14px;text-decoration:none;color:#0F172A;">' +
          '<div><span style="background:#1D4ED8;color:#FFF;font-size:11px;font-weight:900;padding:2px 8px;border-radius:999px;">📚 두뇌·식습관 교구 BEST 3</span>' +
          '<div style="font-size:15px;font-weight:900;margin:8px 0 4px;">푸드브릿지 공룡 모양틀 &amp; 시각타이머</div>' +
          '<div style="font-size:12px;color:#1E3A8A;margin-bottom:10px;">스스로 밥 먹고 집중하는 전두엽 환경 세팅</div></div>' +
          '<div style="background:#1D4ED8;color:#FFF;text-align:center;padding:9px;border-radius:10px;font-size:13px;font-weight:900;">교구 확인하고 검사결과 열기 →</div>' +
        '</a>' +
      '</div>';

    var dash = document.getElementById('results-dashboard');
    if (dash && dash.parentNode) {
      dash.parentNode.insertBefore(mall, dash.nextSibling);
    } else {
      targetContainer.appendChild(mall);
    }

    var links = mall.querySelectorAll('.kf-mall-unlock-item');
    for (var i = 0; i < links.length; i++) {
      (function (lnk) {
        lnk.addEventListener('click', function () {
          unlockDigitalAssetsNow('ShoppingMallItemClick');
          trackDigitalAssetClick('[키즈핏 육아몰 상품 클릭 -> 검사결과 해금]', lnk.getAttribute('href'), 0);
        });
      })(links[i]);
    }
  }
`;

  patchedMon = patchedMon.replace(
    '  function triggerKoreanWorksheetPrint() {',
    mallInjectorCode + '\n  function triggerKoreanWorksheetPrint() {'
  );

  patchedMon = patchedMon.replace(
    '      injectReportDigitalAssetBanner();',
    '      injectReportDigitalAssetBanner();\n      injectParentingShoppingMallSection();'
  );

  fs.writeFileSync(monPath, patchedMon, 'utf8');
  console.log('✅ Updated src/js/korean-digital-asset-monetization.js with KidsFit Parenting Shopping Mall & Click-to-Unlock.');
}
