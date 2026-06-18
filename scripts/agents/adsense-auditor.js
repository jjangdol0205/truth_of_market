/**
 * adsense-auditor.js — Truth of Market AdSense 승인 감사 에이전트
 *
 * 역할: 구글 애드센스 정책 관점에서 사이트 현황을 자동 점검하고
 *       합격/불합격 기준에 따라 개선 리포트를 생성합니다.
 *
 * 실행: node scripts/agents/adsense-auditor.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const ARCHIVE_FILE = path.join(ROOT_DIR, 'news-archive.json');
const INSIGHTS_FILE = path.join(ROOT_DIR, 'insights.json');
const VIEWS_DIR = path.join(ROOT_DIR, 'views');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// ─────────────────────────────────────────
// 체크리스트 항목 정의
// ─────────────────────────────────────────
const CHECKLIST = [
  {
    id: 'adsense_script',
    category: '기술 설정',
    name: 'AdSense 스크립트 삽입',
    critical: true,
    check: () => {
      const indexEjs = fs.readFileSync(path.join(VIEWS_DIR, 'index.ejs'), 'utf8');
      return indexEjs.includes('pagead2.googlesyndication.com') && indexEjs.includes('adsenseClientId');
    }
  },
  {
    id: 'search_console',
    category: '기술 설정',
    name: 'Google Search Console 인증 메타태그',
    critical: true,
    check: () => {
      const indexEjs = fs.readFileSync(path.join(VIEWS_DIR, 'index.ejs'), 'utf8');
      return indexEjs.includes('google-site-verification');
    }
  },
  {
    id: 'privacy_policy',
    category: '법적 정책',
    name: '개인정보처리방침 페이지 존재',
    critical: true,
    check: () => fs.existsSync(path.join(PUBLIC_DIR, 'privacy-policy.html'))
  },
  {
    id: 'privacy_adsense_mention',
    category: '법적 정책',
    name: '개인정보처리방침 내 AdSense/쿠키 고지',
    critical: true,
    check: () => {
      const pp = fs.readFileSync(path.join(PUBLIC_DIR, 'privacy-policy.html'), 'utf8');
      return pp.includes('AdSense') || pp.includes('쿠키') || pp.includes('Cookie');
    }
  },
  {
    id: 'terms',
    category: '법적 정책',
    name: '서비스 이용약관 페이지 존재',
    critical: false,
    check: () => fs.existsSync(path.join(PUBLIC_DIR, 'terms.html'))
  },
  {
    id: 'about',
    category: '신뢰 센터',
    name: 'About/소개 페이지 존재',
    critical: true,
    check: () => fs.existsSync(path.join(PUBLIC_DIR, 'about.html'))
  },
  {
    id: 'contact',
    category: '신뢰 센터',
    name: 'Contact/문의 페이지 & 이메일 명시',
    critical: true,
    check: () => {
      const contactPath = path.join(PUBLIC_DIR, 'contact.html');
      if (!fs.existsSync(contactPath)) return false;
      const contact = fs.readFileSync(contactPath, 'utf8');
      return contact.includes('@') || contact.includes('mail');
    }
  },
  {
    id: 'disclaimer',
    category: '법적 정책',
    name: '투자 면책 고지문 (Footer)',
    critical: true,
    check: () => {
      const indexEjs = fs.readFileSync(path.join(VIEWS_DIR, 'index.ejs'), 'utf8');
      return indexEjs.includes('면책') || indexEjs.includes('Disclaimer');
    }
  },
  {
    id: 'sitemap',
    category: '기술 설정',
    name: 'sitemap.xml 라우트',
    critical: false,
    check: () => {
      const server = fs.readFileSync(path.join(ROOT_DIR, 'server.js'), 'utf8');
      return server.includes('sitemap.xml');
    }
  },
  {
    id: 'robots_txt',
    category: '기술 설정',
    name: 'robots.txt 파일',
    critical: false,
    check: () => fs.existsSync(path.join(PUBLIC_DIR, 'robots.txt'))
  },
  {
    id: 'original_content_insights',
    category: '콘텐츠 품질 (최중요)',
    name: '오리지널 인사이트 칼럼 페이지 (/insights)',
    critical: true,
    check: () => {
      const hasRoute = fs.readFileSync(path.join(ROOT_DIR, 'server.js'), 'utf8').includes('/insights');
      const hasView = fs.existsSync(path.join(VIEWS_DIR, 'insights.ejs'));
      return hasRoute && hasView;
    }
  },
  {
    id: 'insight_articles_count',
    category: '콘텐츠 품질 (최중요)',
    name: '인사이트 칼럼 15편 이상 보유',
    critical: true,
    check: () => {
      if (!fs.existsSync(INSIGHTS_FILE)) return false;
      const insights = JSON.parse(fs.readFileSync(INSIGHTS_FILE, 'utf8'));
      return Array.isArray(insights) && insights.length >= 15;
    },
    getDetail: () => {
      if (!fs.existsSync(INSIGHTS_FILE)) return '0편 (파일 없음)';
      const insights = JSON.parse(fs.readFileSync(INSIGHTS_FILE, 'utf8'));
      return `현재 ${insights.length}편 보유 (목표: 15편 이상)`;
    }
  },
  {
    id: 'article_detail_pages',
    category: '콘텐츠 품질 (최중요)',
    name: '개별 기사 상세 URL (/article/:id)',
    critical: true,
    check: () => {
      const server = fs.readFileSync(path.join(ROOT_DIR, 'server.js'), 'utf8');
      const hasView = fs.existsSync(path.join(VIEWS_DIR, 'article-detail.ejs'));
      return server.includes('/article/') && hasView;
    }
  },
  {
    id: 'premium_articles_count',
    category: '콘텐츠 품질 (최중요)',
    name: 'AI 분석 완료 기사 30건 이상',
    critical: true,
    check: () => {
      if (!fs.existsSync(ARCHIVE_FILE)) return false;
      const archive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
      const withAI = Object.values(archive).filter(a => a.aiAnalysis != null);
      return withAI.length >= 30;
    },
    getDetail: () => {
      if (!fs.existsSync(ARCHIVE_FILE)) return '0건';
      const archive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
      const withAI = Object.values(archive).filter(a => a.aiAnalysis != null);
      return `현재 ${withAI.length}건 보유`;
    }
  },
  {
    id: 'thin_content_check',
    category: '콘텐츠 품질 (최중요)',
    name: 'Fallback 오염 기사 없음 (빈 요약 없음)',
    critical: true,
    check: () => {
      if (!fs.existsSync(ARCHIVE_FILE)) return false;
      const archive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
      const badOnes = Object.values(archive).filter(a => 
        a.aiAnalysis && a.aiAnalysis.summary && 
        a.aiAnalysis.summary.some(s => s.includes('사실 관계를 기반으로') || s.includes('임시 분석') || s.includes('오프라인 분석'))
      );
      return badOnes.length === 0;
    }
  },
  {
    id: 'nav_links',
    category: '사이트 구조',
    name: '주요 법적 페이지 Footer/Nav 링크',
    critical: false,
    check: () => {
      const indexEjs = fs.readFileSync(path.join(VIEWS_DIR, 'index.ejs'), 'utf8');
      return indexEjs.includes('/privacy-policy') && indexEjs.includes('/about') && indexEjs.includes('/contact');
    }
  }
];

// ─────────────────────────────────────────
// 감사 실행
// ─────────────────────────────────────────
function runAudit() {
  console.log('\n');
  console.log('════════════════════════════════════════════════════');
  console.log('  📊 Truth of Market — AdSense 승인 감사 리포트');
  console.log(`  실행 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
  console.log('════════════════════════════════════════════════════\n');

  const results = [];
  let passCount = 0;
  let failCriticalCount = 0;
  let failNonCriticalCount = 0;

  // 카테고리별로 그룹화
  const categories = {};
  CHECKLIST.forEach(item => {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  });

  for (const [category, items] of Object.entries(categories)) {
    console.log(`\n📌 [${category}]`);
    items.forEach(item => {
      let passed = false;
      let detail = '';
      try {
        passed = item.check();
        if (item.getDetail) detail = item.getDetail();
      } catch (e) {
        passed = false;
        detail = `오류: ${e.message}`;
      }

      const icon = passed ? '✅' : (item.critical ? '❌' : '⚠️');
      const criticalTag = item.critical ? '[필수]' : '[권장]';
      const detailStr = detail ? `\n       → ${detail}` : '';
      console.log(`  ${icon} ${criticalTag} ${item.name}${detailStr}`);

      results.push({ ...item, passed, detail });
      if (passed) passCount++;
      else if (item.critical) failCriticalCount++;
      else failNonCriticalCount++;
    });
  }

  const total = CHECKLIST.length;
  const score = Math.round((passCount / total) * 100);

  console.log('\n════════════════════════════════════════════════════');
  console.log(`  📈 최종 점수: ${score}점 / 100점 (${passCount}/${total} 항목 통과)`);

  if (failCriticalCount === 0) {
    console.log('  🎉 [결론] 필수 항목 전체 통과! AdSense 심사 통과 가능성 높음.');
  } else {
    console.log(`  🚨 [결론] 필수 항목 ${failCriticalCount}개 미달. 현재 AdSense 거절 예상.`);
    console.log('\n  🔧 즉시 해결 필요 항목:');
    results.filter(r => !r.passed && r.critical).forEach(r => {
      console.log(`     - ${r.name}`);
    });
  }

  console.log('════════════════════════════════════════════════════\n');

  // 보고서 파일로 저장
  const reportPath = path.join(ROOT_DIR, 'adsense-audit-report.json');
  const report = {
    auditDate: new Date().toISOString(),
    score,
    passCount,
    failCriticalCount,
    failNonCriticalCount,
    total,
    verdict: failCriticalCount === 0 ? '승인 가능성 높음' : `필수 항목 ${failCriticalCount}개 미달 - 거절 예상`,
    results: results.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      critical: r.critical,
      passed: r.passed,
      detail: r.detail || null
    }))
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`  💾 감사 리포트 저장: adsense-audit-report.json\n`);

  return report;
}

runAudit();
