/**
 * Truth of Market - Raw RSS News Collector
 * 
 * 이 스크립트는 AI 에이전트(Antigravity)가 직접 뉴스를 분석할 수 있도록
 * 국내외 주요 경제/투자 RSS 피드로부터 원본 뉴스 데이터를 수집하여 
 * 로컬 임시 JSON 파일(raw-news.json)로 저장해 줍니다.
 */

const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');

const ROOT_DIR = path.join(__dirname, '..');
const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
});

const OUTPUT_FILE = path.join(ROOT_DIR, 'raw-news.json');

// 뉴스 소스 정의
const NEWS_SOURCES = [
  // 국내 언론사 (구글 뉴스를 통한 우회 수집: 해외 서버 IP 차단 원천 방지)
  { id: 'chosun', name: '조선일보 경제', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:chosun.com+economy&hl=ko&gl=KR&ceid=KR:ko' },
  { id: 'hankyung-eco', name: '한국경제 경제', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:hankyung.com+economy&hl=ko&gl=KR&ceid=KR:ko' },
  { id: 'hankyung-fin', name: '한국경제 증권', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:hankyung.com+finance&hl=ko&gl=KR&ceid=KR:ko' },
  { id: 'maekyung', name: '매일경제 경제', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:mk.co.kr+economy&hl=ko&gl=KR&ceid=KR:ko' },
  { id: 'donga', name: '동아일보 경제', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:donga.com+economy&hl=ko&gl=KR&ceid=KR:ko' },
  
  // 종합 금융/투자 트렌드 (풍부한 최신 뉴스 공급용)
  { id: 'korean-markets-trend', name: '국내 금융/투자 종합 트렌드', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=%EC%A5%9D%EC%8B%9D+OR+%EA%B8%88%EB%A6%AC+OR+%EB%B0%98%EB%8F%84%EC%B2%B4+OR+%EA%B1%B0%EC%8B%9C%EA%B2%BD%EC%A0%9C+OR+%ED%99%98%EC%9C%A8&hl=ko&gl=KR&ceid=KR:ko' },

  // 국외 언론사 (구글 뉴스를 통한 경제/투자 분야 타겟팅)
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

async function collect() {
  const allArticles = [];
  console.log('🔄 실시간 RSS 피드로부터 원본 뉴스 수집 중...');

  const fetchPromises = NEWS_SOURCES.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
      const items = feed.items.slice(0, 15).map(item => {
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
      console.error(`❌ [${source.name}] 수집 실패:`, e.message);
    }
  });

  await Promise.all(fetchPromises);
  
  // 최신 시간 순 정렬
  const sorted = allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sorted, null, 2), 'utf8');
  console.log(`✅ 수집 완료: 총 ${sorted.length}개의 원본 뉴스를 raw-news.json에 저장했습니다.`);
}

collect().catch(err => {
  console.error('💥 수집 중 에러 발생:', err);
  process.exit(1);
});
