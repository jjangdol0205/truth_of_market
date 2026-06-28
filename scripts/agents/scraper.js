/**
 * [Follow Industry News] - 타겟형 외신 수집 에이전트 (v2.0)
 * 
 * 기존의 범용 국내/해외 뉴스 RSS 수집 방식을 완전히 대체합니다.
 * following-config.json에 정의된 5대 산업 & 69개 기업에 대한
 * 최신 외신(Google News RSS)만을 타겟으로 수집합니다.
 */

const Parser = require('rss-parser');
const path = require('path');
const fs = require('fs');

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  timeout: 10000
});

// following-config.json 로드
const CONFIG_FILE = path.join(__dirname, '..', 'following-config.json');
let followingConfig = null;

function loadConfig() {
  try {
    followingConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return followingConfig;
  } catch (e) {
    console.error('❌ [Scraper] following-config.json 로드 실패:', e.message);
    return null;
  }
}

// 고유 ID 생성 (기존 방식 유지)
function generateUniqueId(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return 'id_' + (hash >>> 0).toString(36);
}

// 기업 검색 쿼리로 Google News RSS URL 생성
function buildGoogleNewsUrl(searchQuery, lang = 'en') {
  const encoded = encodeURIComponent(searchQuery);
  if (lang === 'ko') {
    return `https://news.google.com/rss/search?q=${encoded}&hl=ko&gl=KR&ceid=KR:ko`;
  }
  return `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
}

// 기사에서 언급된 기업 ID 매핑
function detectCompanies(title, description, companies) {
  const text = `${title} ${description}`.toLowerCase();
  const matchedIds = [];
  const matchedIndustries = new Set();

  for (const company of companies) {
    const nameLower = company.name.toLowerCase();
    const tickerLower = company.ticker.toLowerCase();
    // 기업명 또는 티커가 포함되어 있으면 매핑
    if (text.includes(nameLower) || text.includes(tickerLower) ||
        (company.name.includes('(') && text.includes(company.name.split('(')[0].trim().toLowerCase()))) {
      matchedIds.push(company.id);
      matchedIndustries.add(company.industry);
    }
  }

  return { companyIds: matchedIds, industries: Array.from(matchedIndustries) };
}

/**
 * 메인 스크래핑 함수
 * 각 산업 카테고리별로 상위 N개 기업의 검색 쿼리를 실행하고
 * 중복 제거 후 반환합니다.
 */
async function scrape() {
  const config = loadConfig();
  if (!config) {
    console.log('⚠️ [Scraper] 팔로잉 설정을 로드할 수 없습니다.');
    return [];
  }

  const allArticles = [];
  console.log('🔄 [Scraper] 팔로잉 산업 & 기업 타겟 외신 수집 개시...');
  console.log(`   → 추적 대상: ${config.industries.length}개 산업, ${config.companies.length}개 기업`);

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const afterDateStr = `after:${fiveDaysAgo.getFullYear()}-${String(fiveDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(fiveDaysAgo.getDate()).padStart(2, '0')}`;

  // 1. 산업별 상위 키워드로 외신 수집 (산업 전체 뉴스 커버)
  const industryFetchPromises = config.industries.map(async (industry) => {
    const query = `${afterDateStr} ${industry.searchKeywords.slice(0, 3).join(' OR ')}`;
    const url = buildGoogleNewsUrl(query);
    try {
      const feed = await parser.parseURL(url);
      const items = feed.items.slice(0, 20).map(item => {
        let formattedDate = '';
        try { formattedDate = new Date(item.pubDate || item.isoDate || Date.now()).toISOString(); }
        catch (e) { formattedDate = new Date().toISOString(); }

        return {
          id: generateUniqueId(item.link || item.title),
          title: item.title,
          link: item.link,
          description: item.contentSnippet || item.content || item.description || '',
          date: formattedDate,
          sourceId: `following-industry-${industry.id}`,
          sourceName: `${industry.emoji} ${industry.nameEn} News`,
          lang: 'en',
          category: industry.nameEn,
          region: 'US',
          followingIndustry: industry.id,
          followingCompanyIds: []
        };
      });
      allArticles.push(...items);
      console.log(`   ✅ [${industry.emoji} ${industry.name}] 수집: ${items.length}건`);
    } catch (e) {
      console.error(`   ❌ [${industry.name}] 수집 오류:`, e.message.substring(0, 80));
    }
  });

  await Promise.all(industryFetchPromises);

  // 2. 주요 기업별 개별 뉴스 수집 (각 산업에서 대표 기업 5개씩)
  const PRIORITY_COMPANY_IDS = [
    1,   // Nvidia (NVDA) - 자율주행
    2,   // Tesla (TSLA)
    19,  // Rocket Lab (RKLB) - 우주
    50,  // AST SpaceMobile (ASTS)
    27,  // Intuitive Machines (LUNR)
    29,  // Coinbase (COIN) - 크립토
    30,  // MicroStrategy (MSTR)
    31,  // Marathon Digital (MARA)
    64,  // NuScale Power (SMR) - 원전
    65,  // Oklo (OKLO)
    66,  // Constellation Energy (CEG)
    10,  // Intuitive Surgical (ISRG) - 로봇
    11,  // Symbotic (SYM)
    3,   // Alphabet/Waymo (GOOGL)
    44   // Aurora Innovation (AUR)
  ];

  const priorityCompanies = config.companies.filter(c => PRIORITY_COMPANY_IDS.includes(c.id));

  const companyFetchPromises = priorityCompanies.map(async (company) => {
    const query = `${afterDateStr} ${company.searchQuery}`;
    const url = buildGoogleNewsUrl(query);
    try {
      const feed = await parser.parseURL(url);
      const items = feed.items.slice(0, 10).map(item => {
        let formattedDate = '';
        try { formattedDate = new Date(item.pubDate || item.isoDate || Date.now()).toISOString(); }
        catch (e) { formattedDate = new Date().toISOString(); }

        return {
          id: generateUniqueId(item.link || item.title),
          title: item.title,
          link: item.link,
          description: item.contentSnippet || item.content || item.description || '',
          date: formattedDate,
          sourceId: `following-company-${company.id}`,
          sourceName: `[${company.ticker}] ${company.name}`,
          lang: 'en',
          category: company.industry,
          region: 'US',
          followingIndustry: company.industry,
          followingCompanyIds: [company.id],
          companyTicker: company.ticker
        };
      });
      allArticles.push(...items);
    } catch (e) {
      console.error(`   ❌ [${company.ticker}] 수집 오류:`, e.message.substring(0, 80));
    }
  });

  await Promise.all(companyFetchPromises);

  // 중복 제거
  const uniqueArticles = {};
  allArticles.forEach(art => {
    if (!uniqueArticles[art.id]) {
      uniqueArticles[art.id] = art;
    } else {
      // 기업 매핑 정보 병합 (동일 기사가 다른 기업 검색에서도 나온 경우)
      const existing = uniqueArticles[art.id];
      if (art.followingCompanyIds && art.followingCompanyIds.length > 0) {
        existing.followingCompanyIds = [...new Set([
          ...(existing.followingCompanyIds || []),
          ...art.followingCompanyIds
        ])];
      }
    }
  });

  // 기사 본문 기반 기업 자동 태깅
  const result = Object.values(uniqueArticles);
  result.forEach(art => {
    if (!art.followingCompanyIds || art.followingCompanyIds.length === 0) {
      const detected = detectCompanies(art.title, art.description, config.companies);
      if (detected.companyIds.length > 0) {
        art.followingCompanyIds = detected.companyIds;
        if (!art.followingIndustry && detected.industries.length > 0) {
          art.followingIndustry = detected.industries[0];
        }
      }
    }
  });

  const sortedResult = result.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log(`📊 [Scraper] 팔로잉 수집 완료. 총 ${sortedResult.length}개 외신 수집됨.`);
  return sortedResult;
}

module.exports = { scrape, loadConfig };
