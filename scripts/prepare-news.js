/**
 * Truth of Market - Daily News Fetcher & Archive Merger
 * 
 * 1. RSS 피드로부터 국내외 경제/투자 뉴스를 대량 수집합니다.
 * 2. 수집된 뉴스를 로컬 news-archive.json에 병합합니다 (중복 제거).
 * 3. 기사 중 AI 분석(aiAnalysis)이 아직 없는 미요약 기사를 식별하여
 *    최대 55개까지 pending-summaries.json 파일에 저장합니다.
 */

const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');

const ROOT_DIR = path.join(__dirname, '..');
const ARCHIVE_FILE = path.join(ROOT_DIR, 'news-archive.json');
const PENDING_FILE = path.join(ROOT_DIR, 'pending-summaries.json');

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
});

const NEWS_SOURCES = [
  { id: 'chosun', name: '조선일보 경제', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:chosun.com+economy&hl=ko&gl=KR&ceid=KR:ko' },
  { id: 'hankyung-eco', name: '한국경제 경제', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:hankyung.com+economy&hl=ko&gl=KR&ceid=KR:ko' },
  { id: 'hankyung-fin', name: '한국경제 증권', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:hankyung.com+finance&hl=ko&gl=KR&ceid=KR:ko' },
  { id: 'maekyung', name: '매일경제 경제', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:mk.co.kr+economy&hl=ko&gl=KR&ceid=KR:ko' },
  { id: 'donga', name: '동아일보 경제', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:donga.com+economy&hl=ko&gl=KR&ceid=KR:ko' },
  { id: 'korean-markets-trend', name: '국내 금융/투자 종합 트렌드', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=%EC%A5%9D%EC%8B%9D+OR+%EA%B8%88%EB%A6%AC+OR+%EB%B0%98%EB%8F%84%EC%B2%B4+OR+%EA%B1%B0%EC%8B%9C%EA%B2%BD%EC%A0%9C+OR+%ED%99%98%EC%9C%A8&hl=ko&gl=KR&ceid=KR:ko' },
  { 
    id: 'global-invest', 
    name: '글로벌 투자 뉴스 (Reuters/Bloomberg/CNBC)', 
    lang: 'en', 
    category: 'Markets', 
    url: 'https://news.google.com/rss/search?q=investment+OR+finance+OR+stocks+OR+economy+source:Bloomberg+OR+source:Reuters+OR+source:CNBC+OR+source:%22Wall+Street+Journal%22&hl=en-US&gl=US&ceid=US:en' 
  },
  { id: 'nyt-biz', name: 'NYT 비즈니스', lang: 'en', category: 'Markets', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml' },
  { id: 'nyt-tech', name: 'NYT 테크놀로지', lang: 'en', category: 'Tech', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml' }
];

function generateUniqueId(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return 'id_' + (hash >>> 0).toString(36);
}

async function run() {
  console.log('🔄 1. RSS 피드로부터 최신 뉴스 수집 중...');
  
  // 5일 이내 기사 대상
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const afterDateStr = `${fiveDaysAgo.getFullYear()}-${String(fiveDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(fiveDaysAgo.getDate()).padStart(2, '0')}`;

  const allArticles = [];
  const fetchPromises = NEWS_SOURCES.map(async (source) => {
    try {
      let targetUrl = source.url;
      if (targetUrl.includes('news.google.com/rss/search')) {
        targetUrl = targetUrl.replace('q=', `q=after:${afterDateStr}+`);
      }
      
      const feed = await parser.parseURL(targetUrl);
      const items = feed.items.slice(0, 40).map(item => {
        let formattedDate = '';
        try {
          formattedDate = new Date(item.pubDate || item.isoDate || Date.now()).toISOString();
        } catch (e) {
          formattedDate = new Date().toISOString();
        }

        return {
          id: generateUniqueId(item.link || item.title),
          title: item.title,
          link: item.link,
          description: item.contentSnippet || item.content || item.description || '',
          date: formattedDate,
          sourceId: source.id,
          sourceName: source.name,
          lang: source.lang,
          category: source.category
        };
      });
      allArticles.push(...items);
    } catch (e) {
      console.error(`❌ [${source.name}] RSS 수집 오류:`, e.message);
    }
  });

  await Promise.all(fetchPromises);
  console.log(`📊 수집 완료: 총 ${allArticles.length}개의 최신 뉴스.`);

  // 아카이브 로드
  let newsArchive = {};
  if (fs.existsSync(ARCHIVE_FILE)) {
    try {
      newsArchive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
    } catch (e) {
      console.error('⚠️ 아카이브 파일 로드 오류, 새로 시작합니다:', e.message);
    }
  }

  // 최신 뉴스 병합
  let newCount = 0;
  allArticles.forEach(art => {
    if (!newsArchive[art.id]) {
      newsArchive[art.id] = {
        ...art,
        aiAnalysis: null
      };
      newCount++;
    } else {
      // 메타데이터 최신화
      newsArchive[art.id] = {
        ...art,
        aiAnalysis: newsArchive[art.id].aiAnalysis || null
      };
    }
  });
  console.log(`💾 아카이브 병합 완료 (신규 기사: ${newCount}건)`);

  // 아카이브 용량 유지 (최근 1500건으로 늘려서 충분한 데이터 보존)
  const sortedKeys = Object.keys(newsArchive).sort((a, b) => new Date(newsArchive[b].date) - new Date(newsArchive[a].date));
  if (sortedKeys.length > 1500) {
    sortedKeys.slice(1500).forEach(k => delete newsArchive[k]);
  }
  
  // 아카이브 저장
  fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(newsArchive, null, 2), 'utf8');
  console.log(`💾 news-archive.json 저장 완료 (총 ${Object.keys(newsArchive).length}건 보존)`);

  // AI 분석이 필요한 기사 추출 (최신 순으로 정렬 후 aiAnalysis가 없는 것들)
  const unanalyzed = Object.values(newsArchive)
    .filter(art => !art.aiAnalysis)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  console.log(`🔍 미요약 기사 수: ${unanalyzed.length}건`);

  // 최대 55건 추출하여 pending-summaries.json에 기록
  const pending = unanalyzed.slice(0, 55);
  fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2), 'utf8');
  console.log(`📝 분석 대기 파일 생성 완료: ${PENDING_FILE} (총 ${pending.length}건 기재)`);
}

run().catch(err => {
  console.error('💥 실행 중 치명적 오류:', err);
  process.exit(1);
});
