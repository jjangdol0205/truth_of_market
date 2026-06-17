const Parser = require('rss-parser');

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
});

const NEWS_SOURCES = [
  // 1. 미국 (US)
  { id: 'us-global', name: 'US 글로벌 투자 뉴스 (Reuters/Bloomberg/CNBC)', region: 'US', lang: 'en', category: 'Markets', url: 'https://news.google.com/rss/search?q=investment+OR+finance+OR+stocks+OR+economy+source:Bloomberg+OR+source:Reuters+OR+source:CNBC+OR+source:%22Wall+Street+Journal%22&hl=en-US&gl=US&ceid=US:en' },
  { id: 'us-nyt-biz', name: 'NYT 비즈니스', region: 'US', lang: 'en', category: 'Markets', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml' },
  { id: 'us-nyt-tech', name: 'NYT 테크놀로지', region: 'US', lang: 'en', category: 'Tech', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml' },

  // 2. 유럽 (EU)
  { id: 'eu-economy', name: '유럽 거시경제 뉴스', region: 'EU', lang: 'en', category: 'Markets', url: 'https://news.google.com/rss/search?q=europe+economy+OR+eurozone+OR+ecb+source:Reuters+OR+source:BBC&hl=en-US&gl=US&ceid=US:en' },

  // 3. 중국 (CN)
  { id: 'cn-economy', name: '중국 금융 및 공급망 뉴스', region: 'CN', lang: 'en', category: 'Markets', url: 'https://news.google.com/rss/search?q=china+economy+OR+yuan+OR+pboc+source:Reuters+OR+source:CNBC&hl=en-US&gl=US&ceid=US:en' },

  // 4. 일본 (JP)
  { id: 'jp-economy', name: '일본 경제 및 엔화 뉴스', region: 'JP', lang: 'en', category: 'Markets', url: 'https://news.google.com/rss/search?q=japan+economy+OR+yen+OR+boj+source:Reuters+OR+source:Nikkei&hl=en-US&gl=US&ceid=US:en' },

  // 5. 한국 (KR)
  { id: 'kr-chosun', name: '조선일보 경제', region: 'KR', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:chosun.com+economy&hl=ko&gl=KR&ceid=KR:ko' },
  { id: 'kr-hankyung-eco', name: '한국경제 경제', region: 'KR', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:hankyung.com+economy&hl=ko&gl=KR&ceid=KR:ko' },
  { id: 'kr-hankyung-fin', name: '한국경제 증권', region: 'KR', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:hankyung.com+finance&hl=ko&gl=KR&ceid=KR:ko' },
  { id: 'kr-maekyung', name: '매일경제 경제', region: 'KR', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:mk.co.kr+economy&hl=ko&gl=KR&ceid=KR:ko' },
  { id: 'kr-donga', name: '동아일보 경제', region: 'KR', lang: 'ko', category: 'Macro', url: 'https://news.google.com/rss/search?q=site:donga.com+economy&hl=ko&gl=KR&ceid=KR:ko' }
];

function generateUniqueId(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return 'id_' + (hash >>> 0).toString(36);
}

async function scrape() {
  const allArticles = [];
  console.log('🔄 [Scraper Agent] 글로벌 뉴스 수집 작동 개시...');

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const afterDateStr = `${fiveDaysAgo.getFullYear()}-${String(fiveDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(fiveDaysAgo.getDate()).padStart(2, '0')}`;

  const fetchPromises = NEWS_SOURCES.map(async (source) => {
    try {
      let targetUrl = source.url;
      if (targetUrl.includes('news.google.com/rss/search')) {
        targetUrl = targetUrl.replace('q=', `q=after:${afterDateStr}+`);
      }
      
      const feed = await parser.parseURL(targetUrl);
      const items = feed.items.slice(0, 25).map(item => {
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
          category: source.category,
          region: source.region
        };
      });
      allArticles.push(...items);
    } catch (e) {
      console.error(`❌ [Scraper Agent] ${source.name} 수집 오류:`, e.message);
    }
  });

  await Promise.all(fetchPromises);
  console.log(`📊 [Scraper Agent] 수집 완료. 총 ${allArticles.length}개 뉴스 수집됨.`);
  
  // 중복 제거 및 시간 순 정렬
  const uniqueArticles = {};
  allArticles.forEach(art => {
    if (!uniqueArticles[art.id]) {
      uniqueArticles[art.id] = art;
    }
  });

  return Object.values(uniqueArticles).sort((a, b) => new Date(b.date) - new Date(a.date));
}

module.exports = { scrape };
