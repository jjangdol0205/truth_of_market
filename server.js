const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Parser = require('rss-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');

// .env 파일 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
});

// 미들웨어 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// SSR 메인 페이지 라우트
app.get('/', (req, res) => {
  let articlesList = Object.values(newsArchive).sort((a, b) => new Date(b.date) - new Date(a.date));
  // 애드센스 대응 완벽주의: 요약 완료된 프리미엄 기사만 사전 렌더링
  const premiumArticles = articlesList.filter(art => art.aiAnalysis != null);
  res.render('index', { 
    articles: premiumArticles,
    adsenseClientId: process.env.ADSENSE_CLIENT_ID || null
  });
});

// --- [API 최소화 및 캐싱 고도화] ---
// 기존 메모리 캐시를 제거하고 일일 뉴스 영구 아카이브 파일을 사용합니다.
const CACHE_FILE = path.join(__dirname, 'ai-cache.json');
let aiCache = {};

function loadAiCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      aiCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      console.log(`💾 [API 최소화] 로컬 AI 분석 캐시 ${Object.keys(aiCache).length}건을 성공적으로 불러왔습니다.`);
    } else {
      aiCache = {};
    }
  } catch (e) {
    console.error('⚠️ AI 캐시 로드 실패:', e.message);
    aiCache = {};
  }
}

function saveAiCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(aiCache, null, 2), 'utf8');
  } catch (e) {
    console.error('⚠️ AI 캐시 저장 실패:', e.message);
  }
}

// --- [영구 뉴스 아카이브 시스템] ---
// 매번 접속 시 RSS를 파싱하는 대신, 하루에 한 번 백엔드에서 RSS를 파싱하여 아카이브에 영구 저장하고 보존합니다.
const ARCHIVE_FILE = path.join(__dirname, 'news-archive.json');
let newsArchive = {};
let diagnosticLog = {
  lastRun: null,
  success: false,
  errors: [],
  urlsAttempted: [],
  freshNewsCount: 0
};

function loadNewsArchive() {
  try {
    if (fs.existsSync(ARCHIVE_FILE)) {
      newsArchive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
      console.log(`💾 [아카이브] 로컬 뉴스 아카이브 ${Object.keys(newsArchive).length}건을 성공적으로 불러왔습니다.`);
    } else {
      newsArchive = {};
    }
  } catch (e) {
    console.error('⚠️ 뉴스 아카이브 로드 실패:', e.message);
    newsArchive = {};
  }
}

function saveNewsArchive() {
  try {
    fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(newsArchive, null, 2), 'utf8');
  } catch (e) {
    console.error('⚠️ 뉴스 아카이브 저장 실패:', e.message);
  }
}

// --- [월간 API 예산 보호막 (Cost Shield) 관리 시스템] ---
// 대표님의 Gemini API 한 달 비용 무료 범위(최대 20만원) 내에서 100% 안전하게 자동 자체 통제 보호막을 구동합니다.
const BUDGET_FILE = path.join(__dirname, 'api-budget.json');
let apiBudget = {
  monthlyBudgetLimit: 75.0, // 대표님의 심리적 안심 한도 설정 ($75, 약 10만원. 20만원 한도 대비 50%의 보수적 안심선)
  currentMonth: new Date().toISOString().substring(0, 7), // "YYYY-MM"
  monthlyAccumulatedCost: 0.0,
  totalApiCalls: 0
};

function loadApiBudget() {
  try {
    if (fs.existsSync(BUDGET_FILE)) {
      apiBudget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
      
      // 달이 바뀌었는지 체크하여 자동 초기화
      const thisMonth = new Date().toISOString().substring(0, 7);
      if (apiBudget.currentMonth !== thisMonth) {
        console.log(`📅 [API 예산] 새로운 달(${thisMonth})이 시작되어 API 누적 비용 기록을 0원으로 자동 리셋합니다.`);
        apiBudget.currentMonth = thisMonth;
        apiBudget.monthlyAccumulatedCost = 0.0;
        apiBudget.totalApiCalls = 0;
        saveApiBudget();
      }
      console.log(`💾 [API 예산] 월간 비용 트래커 로드 완료: 한도 $${apiBudget.monthlyBudgetLimit} / 현재 $${apiBudget.monthlyAccumulatedCost.toFixed(5)} (${apiBudget.totalApiCalls}회 호출)`);
    } else {
      saveApiBudget();
    }
  } catch (e) {
    console.error('⚠️ API 예산 파일 로드 실패:', e.message);
  }
}

function saveApiBudget() {
  try {
    fs.writeFileSync(BUDGET_FILE, JSON.stringify(apiBudget, null, 2), 'utf8');
  } catch (e) {
    console.error('⚠️ API 예산 파일 저장 실패:', e.message);
  }
}

// 서버 시작 시 캐시 및 아카이브 파일 로드
loadAiCache();
loadNewsArchive();
loadApiBudget();

// 국내외 주요 투자/경제 RSS 피드 목록
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

// Gemini AI 초기화 (과금 100% 차단을 위해 비활성화 및 오프라인 에이전트 주입 모드로 가동)
let genAI = null;
console.log('🛡️ [API COST SHIELD] 시스템이 오프라인 에이전트 주입 전용 모드로 구동됩니다. 구글 API 비용 차감 100% 방지 완료.');



// 고유 ID 생성용 해시 함수 (Djb2 - 충돌 방지)
function generateUniqueId(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return 'id_' + (hash >>> 0).toString(36);
}

// RSS 뉴스 수집 헬퍼 함수
async function fetchAllNews() {
  const allArticles = [];
  diagnosticLog.urlsAttempted = [];
  diagnosticLog.errors = [];

  // 최근 5일간의 누락 뉴스를 포함시키기 위해 구글 뉴스 검색 조건에 after 날짜 동적 적용
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const afterDateStr = `${fiveDaysAgo.getFullYear()}-${String(fiveDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(fiveDaysAgo.getDate()).padStart(2, '0')}`;

  const fetchPromises = NEWS_SOURCES.map(async (source) => {
    try {
      let targetUrl = source.url;
      if (targetUrl.includes('news.google.com/rss/search')) {
        // q= 뒤에 after:YYYY-MM-DD+ 를 붙여 최근 5일 기사를 확실히 긁어오도록 필터링
        targetUrl = targetUrl.replace('q=', `q=after:${afterDateStr}+`);
      }
      diagnosticLog.urlsAttempted.push({ source: source.name, url: targetUrl });
      const feed = await parser.parseURL(targetUrl);
      // [대폭 확대] 각 RSS 소스당 수집 범위를 10건에서 40건으로 대폭 확대하여 최신 뉴스 누락 원천 방지
      const items = feed.items.slice(0, 40).map(item => {
        // 날짜 파싱
        let formattedDate = '';
        try {
          if (item.pubDate) {
            formattedDate = new Date(item.pubDate).toISOString();
          } else if (item.isoDate) {
            formattedDate = new Date(item.isoDate).toISOString();
          } else {
            formattedDate = new Date().toISOString();
          }
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
    } catch (error) {
      console.error(`❌ [${source.name}] RSS 수집 오류:`, error.message);
      diagnosticLog.errors.push({ source: source.name, error: error.message });
    }
  });

  await Promise.all(fetchPromises);
  
  // 최신 순으로 정렬
  return allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Gemini AI 요약 및 번역 핵심 로직
async function analyzeArticleWithGemini(title, description, lang) {
  // 캐시 키 생성 (기사 제목 기준)
  const cacheKey = generateUniqueId(title);
  if (aiCache[cacheKey]) {
    console.log(`⚡ [Cache Hit] 이미 요약된 기사입니다 (API 호출 건너뜀): "${title.substring(0, 25)}..."`);
    return aiCache[cacheKey];
  }

  // [API COST SHIELD] 월간 예산 한도를 초과했거나 임계값 도달 시 즉각 API를 차단하고 안전하게 데모 모드로 폴백!
  if (apiBudget.monthlyAccumulatedCost >= apiBudget.monthlyBudgetLimit) {
    console.warn(`🚨 [API COST SHIELD ACTION] 월간 예산 한도($${apiBudget.monthlyBudgetLimit})에 도달하여 Google API 실시간 호출이 안전하게 자동 원천 차단되었습니다! 목업 데모 모드로 즉각 세이프 폴백합니다.`);
    const isEnglish = lang === 'en';
    return {
      translatedTitle: isEnglish ? `[예산보호 데모] ${title} (번역본)` : title,
      summary: [
        "이것은 월간 예산 보호막(API Cost Shield)이 작동한 안전 요약 서비스입니다.",
        "이번 달 설정된 구글 API 한도 예산을 소진하여 추가 과금 걱정 없이 데모 모드로 자동 폴백되었습니다.",
        `원문 제목: ${title}`
      ],
      implications: [
        "새로운 달이 시작되면 실시간 구글 Gemini API 연동 분석이 자동으로 정상 재개됩니다.",
        "관리자 설정 파일(api-budget.json)에서 예산 한도(monthlyBudgetLimit)를 직접 상향 조정하실 수도 있습니다."
      ]
    };
  }

  if (!genAI) {
    // Gemini API Key가 없는 경우의 Mock 데모 데이터 반환
    const isEnglish = lang === 'en';
    return {
      translatedTitle: isEnglish ? `[번역 데모] ${title} (한글 번역본)` : title,
      summary: [
        "이것은 데모 요약 서비스입니다.",
        "기사의 세부내용을 학습하려면 .env 파일에 구글 Gemini API 키를 등록해주세요.",
        `원문 제목: ${title}`
      ],
      implications: [
        "시장 거시경제 지표 및 투자 리스크에 대한 면밀한 모니터링이 요구됩니다.",
        "중장기적 자산 배분 관점에서 핵심 성장 세터의 비중 조절 필요성 검토가 유용합니다."
      ]
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert investment analyst and premium translator.
    Your task is to analyze the following news article for an investor's study archive.
    
    If the article is in English (lang='en'), you MUST translate the title and content into natural, professional, high-quality financial Korean.
    If the article is in Korean (lang='ko'), refine the title to make it professional and clear.

    Generate the output strictly in JSON format with the following keys:
    1. "translatedTitle": A beautiful Korean translation of the title. Make it engaging for an investor.
    2. "summary": Exactly 3 detailed bullet points in Korean summarizing the core event, financial data, or facts.
    3. "implications": Exactly 2 detailed bullet points in Korean explaining the investment implications (why this matters to investors, potential market/sector impact, opportunities or risks to watch).

    Article Info:
    - Language: ${lang}
    - Title: ${title}
    - Content/Description: ${description}

    Output JSON Format:
    {
      "translatedTitle": "Korean title here",
      "summary": ["summary bullet 1 in Korean", "summary bullet 2 in Korean", "summary bullet 3 in Korean"],
      "implications": ["implication bullet 1 in Korean", "implication bullet 2 in Korean"]
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const resultJson = JSON.parse(responseText);
    
    // [비용 누적 계산: Gemini 2.5 Flash 요율 적용]
    // 영단어 1자/한글 1자는 대략 1~1.5토큰. 안전하게 글자 수의 1.3배를 토큰으로 잡고 요율 곱함.
    const inputTokens = Math.ceil((prompt.length + title.length + (description || '').length) * 1.3);
    const outputTokens = Math.ceil(responseText.length * 1.3);
    const inputCost = inputTokens * (0.075 / 1000000); // 100만 토큰당 $0.075
    const outputCost = outputTokens * (0.30 / 1000000); // 100만 토큰당 $0.30
    const totalCost = inputCost + outputCost;

    apiBudget.monthlyAccumulatedCost += totalCost;
    apiBudget.totalApiCalls += 1;
    saveApiBudget();

    console.log(`💸 [API 예산 차감] 1회 호출 성공! 비용: $${totalCost.toFixed(5)} (누적: $${apiBudget.monthlyAccumulatedCost.toFixed(5)} / 한도: $${apiBudget.monthlyBudgetLimit})`);

    // 로컬 파일 캐시에 영구 저장
    aiCache[cacheKey] = resultJson;
    saveAiCache();
    
    return resultJson;
  } catch (error) {
    console.error('❌ Gemini API 오류:', error.message);
    throw new Error('Gemini 요약 분석 중 오류가 발생했습니다.');
  }
}

// 텔레그램 메시지용 브리핑 생성 함수
async function generateBriefingMessage(count = 5) {
  const newsList = await fetchAllNews();
  // 한국/미국 믹스해서 상위 뉴스 선정
  const topNews = newsList.slice(0, count);
  
  let message = `🚀 *오늘의 글로벌 투자 핵심 뉴스 브리핑* 🚀\n`;
  message += `📅 일시: ${new Date().toLocaleDateString('ko-KR')} | 투자 스터디 아카이브\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  for (let i = 0; i < topNews.length; i++) {
    const item = topNews[i];
    console.log(`[Briefing] Analyzing item ${i + 1}/${topNews.length}: ${item.title}`);
    
    try {
      const analysis = await analyzeArticleWithGemini(item.title, item.description, item.lang);
      
      message += `${i + 1}. *${analysis.translatedTitle}* (${item.sourceName})\n`;
      analysis.summary.forEach(sum => {
        message += `• ${sum}\n`;
      });
      message += `💡 *투자 시사점:*\n`;
      analysis.implications.forEach(imp => {
        message += `  - ${imp}\n`;
      });
      message += `🔗 [기사 원문 보기](${item.link})\n\n`;
    } catch (e) {
      // 에러 발생 시 원본으로 대체하여 중단 방지
      message += `${i + 1}. *${item.title}* (${item.sourceName})\n`;
      message += `• 요약 분석을 불러오지 못했습니다.\n`;
      message += `🔗 [기사 원문 보기](${item.link})\n\n`;
    }
    
    // API 레이트 리밋 방지 및 안전한 호출을 위한 0.5초 대기
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `✍️ *대시보드 바로가기:* http://localhost:${PORT}\n`;
  message += `스마트한 안목으로 성공적인 하루 투자를 만들어가시길 바랍니다! 📈`;

  return message;
}

// === API 라우트 정의 ===

// 1. 뉴스 피드 통합 목록 조회 API (영구 아카이브 데이터 전면 로드)
app.get('/api/news', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    
    // 사용자가 대시보드에서 '새로고침'을 수동으로 누른 경우 즉시 백그라운드 수집 실행
    if (forceRefresh) {
      console.log('🔄 [새로고침 요청] 실시간 RSS 수집 및 아카이빙 즉시 실행...');
      await archiveDailyNews();
    }

    // 로컬 아카이브에서 수집된 모든 기사 데이터를 최신 날짜 순으로 정렬하여 반환
    let articlesList = Object.values(newsArchive).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({ success: true, source: 'archive', data: articlesList });
  } catch (error) {
    console.error('API /api/news error:', error);
    res.status(500).json({ success: false, message: '뉴스를 수집하는 데 실패했습니다.' });
  }
});

// 2. 기사 AI 번역 & 요약 분석 API (아카이브 기사에 AI 연구 분석 기록 업데이트)
app.post('/api/analyze', async (req, res) => {
  const { id, title, description, lang } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: '기사 제목이 필요합니다.' });
  }

  try {
    // [비용 100% 절감] 이미 아카이브에 AI 분석 결과가 존재한다면 즉각 캐시 리턴! (API 비용 0회)
    if (id && newsArchive[id] && newsArchive[id].aiAnalysis) {
      return res.json({ success: true, data: newsArchive[id].aiAnalysis });
    }
    if (id && aiCache[id] && aiCache[id].aiAnalysis) {
      return res.json({ success: true, data: aiCache[id].aiAnalysis });
    }

    // 구글 제미나이 API 호출을 전면 차단하고 오프라인 에이전트 생성 요약 모드로 통합합니다.
    return res.json({ 
      success: false, 
      message: '이 기사의 AI 투자 스터디 노트는 아직 발행되지 않았습니다. AI 에이전트(Antigravity)가 오프라인에서 직접 분석하여 다음 릴리즈에 일괄 반영될 예정입니다.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



// 4. 커스텀 RSS 피드 추가/검증 API
app.post('/api/news/validate-feed', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, message: 'RSS 피드 URL이 필요합니다.' });
  }

  try {
    const feed = await parser.parseURL(url);
    res.json({ 
      success: true, 
      data: {
        title: feed.title,
        description: feed.description,
        link: feed.link,
        itemCount: feed.items.length
      } 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: '유효하지 않은 RSS 피드 URL이거나 CORS 문제로 가져올 수 없습니다. 다른 피드를 시도해보세요.' });
  }
});

// --- [실시간 시황 API] 야후 파이낸스 연동 및 10분 캐싱 ---
let marketCache = null;
let marketCacheTime = null;
const MARKET_CACHE_DURATION = 10 * 60 * 1000; // 10분 캐시 (사용자 요청에 따라 API 사용 최소화)

const MARKET_SYMBOLS = {
  'KOSPI': '^KS11',
  'NASDAQ': '^IXIC',
  'S&P 500': '^GSPC',
  '원/달러': 'USDKRW=X',
  '국제유가(WTI)': 'CL=F',
  '미 10년물 국채': '^TNX'
};

function fetchSingleTicker(label, symbol) {
  return new Promise((resolve) => {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            throw new Error(`HTTP Status ${res.statusCode}`);
          }
          const json = JSON.parse(data);
          if (json.chart && json.chart.result && json.chart.result[0]) {
            const meta = json.chart.result[0].meta;
            const price = meta.regularMarketPrice;
            const prevClose = meta.chartPreviousClose;
            const diff = price - prevClose;
            const percent = (diff / prevClose) * 100;
            
            resolve({
              label: label,
              symbol: symbol,
              price: price,
              prevClose: prevClose,
              change: diff,
              changePercent: percent,
              success: true
            });
          } else {
            throw new Error('Invalid JSON structure');
          }
        } catch (e) {
          console.error(`⚠️ [API 시황] ${label}(${symbol}) 파싱 오류:`, e.message);
          resolve({ label: label, symbol: symbol, success: false, error: e.message });
        }
      });
    });
    
    req.on('error', (err) => {
      console.error(`⚠️ [API 시황] ${label}(${symbol}) 요청 오류:`, err.message);
      resolve({ label: label, symbol: symbol, success: false, error: err.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.error(`⚠️ [API 시황] ${label}(${symbol}) 시간 초과`);
      resolve({ label: label, symbol: symbol, success: false, error: 'Timeout' });
    });
  });
}

// 6. 실시간 시황 API
app.get('/api/market', async (req, res) => {
  try {
    const now = Date.now();
    const forceRefresh = req.query.refresh === 'true';

    // 캐시 유효성 확인
    if (!forceRefresh && marketCache && marketCacheTime && (now - marketCacheTime < MARKET_CACHE_DURATION)) {
      return res.json({ success: true, source: 'cache', data: marketCache });
    }

    console.log('🔄 야후 파이낸스 실시간 시황 수집 중...');
    const promises = Object.entries(MARKET_SYMBOLS).map(([label, symbol]) => fetchSingleTicker(label, symbol));
    const results = await Promise.all(promises);

    // 성공한 데이터만 정제하거나 Fallback 처리
    const cleanedData = results.map(item => {
      if (item.success) {
        return {
          label: item.label,
          symbol: item.symbol,
          price: item.price,
          change: item.change,
          changePercent: item.changePercent,
          success: true
        };
      } else {
        // 실패한 경우 이전 캐시가 있다면 이전 값 재활용
        const cachedItem = marketCache ? marketCache.find(c => c.symbol === item.symbol) : null;
        if (cachedItem) {
          return cachedItem;
        }
        // 캐시도 없는 완전 초기 단계인 경우 Mockup fallback 노출 (안정성 보장)
        const fallbacks = {
          '^KS11': { price: 2682.40, change: 29.80, changePercent: 1.12 },
          '^IXIC': { price: 16742.30, change: 141.25, changePercent: 0.85 },
          '^GSPC': { price: 5304.72, change: 33.72, changePercent: 0.64 },
          'USDKRW=X': { price: 1358.50, change: -4.70, changePercent: -0.35 },
          'CL=F': { price: 78.20, change: -0.35, changePercent: -0.45 },
          '^TNX': { price: 4.42, change: 0.02, changePercent: 0.45 }
        };
        const fb = fallbacks[item.symbol] || { price: 0, change: 0, changePercent: 0 };
        return {
          label: item.label,
          symbol: item.symbol,
          price: fb.price,
          change: fb.change,
          changePercent: fb.changePercent,
          success: false,
          fallback: true
        };
      }
    });

    marketCache = cleanedData;
    marketCacheTime = now;

    res.json({ success: true, source: 'live', data: cleanedData });
  } catch (error) {
    console.error('API /api/market error:', error);
    res.status(500).json({ success: false, message: '시황 정보를 가져오는 데 실패했습니다.' });
  }
});

// 3. 관리자 시크릿 패스코드 검증 API (모바일 PWA 환경 대응)
app.post('/api/admin/verify', (req, res) => {
  const { passcode } = req.body;
  const secretKey = process.env.ADMIN_SECRET_KEY || 'market777';

  if (passcode === secretKey) {
    console.log('🔑 [보안 승인] 모바일/설정 창을 통한 관리자 시크릿 인증이 성공했습니다.');
    res.json({ success: true, message: '관리자 인증에 성공했습니다.' });
  } else {
    console.warn('⚠️ [보안 경고] 유효하지 않은 관리자 시크릿 패스코드 입력 시도 감지!');
    res.status(401).json({ success: false, message: '올바르지 않은 패스코드입니다.' });
  }
});

// 5. API 상태 진단 API
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    geminiActive: !!genAI,
    version: '1.0.3-site-fix',
    apiBudget: {
      limit: apiBudget.monthlyBudgetLimit,
      accumulated: apiBudget.monthlyAccumulatedCost,
      calls: apiBudget.totalApiCalls,
      limitReached: apiBudget.monthlyAccumulatedCost >= apiBudget.monthlyBudgetLimit
    }
  });
});

// 5.1 원격 백엔드 진단용 API
app.get('/api/diagnostic', (req, res) => {
  res.json({
    success: true,
    diagnostic: {
      ...diagnosticLog,
      archiveCount: Object.keys(newsArchive).length
    }
  });
});

// --- [애드센스 승인용 정적 신뢰 요소 페이지 라우팅] ---
app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy-policy.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// --- [추가 요구사항] 구글 서치콘솔 자동 등록 동적 sitemap.xml 제너레이터 ---
app.get('/sitemap.xml', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const baseUrl = `${protocol}://${req.headers.host}`;
  const currentDate = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. 고정 정적 신뢰성 페이지 추가
  const staticUrls = [
    { loc: '', changefreq: 'daily', priority: '1.0' },
    { loc: '/about', changefreq: 'weekly', priority: '0.8' },
    { loc: '/contact', changefreq: 'weekly', priority: '0.8' },
    { loc: '/privacy-policy', changefreq: 'monthly', priority: '0.5' },
    { loc: '/terms', changefreq: 'monthly', priority: '0.5' }
  ];

  staticUrls.forEach(url => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${url.loc}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // 2. [SEO 극대화] AI 요약 분석이 완결된 모든 개별 기사를 사이트맵에 동적 바인딩
  Object.keys(newsArchive).forEach(key => {
    const article = newsArchive[key];
    // AI 분석이 한 번이라도 수행되어 완결된 기사들만 구글 크롤러의 수집 대상으로 노출!
    if (article && article.aiAnalysis && article.id === key) {
      let lastMod = currentDate;
      try {
        if (article.date) {
          lastMod = new Date(article.date).toISOString().split('T')[0];
        }
      } catch (e) {
        lastMod = currentDate;
      }

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/article/${article.id}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }
  });

  xml += `</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// --- [SEO 극대화] 구글 봇 크롤링 대응용 프리미엄 서버 렌더링(SSR) 기사 상세 페이지 ---
app.get('/article/:id', (req, res) => {
  const articleId = req.params.id;
  // 아카이브에서 먼저 확인하고 없는 경우 구 캐시에서 검사 진행
  const article = newsArchive[articleId] || aiCache[articleId];

  if (!article || !article.aiAnalysis) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>기사를 찾을 수 없습니다 - Truth of Market</title>
        <style>
          body { background-color: #090d16; color: #fff; font-family: sans-serif; text-align: center; padding-top: 100px; }
          a { color: #0cdab1; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>404 - 기사를 찾을 수 없거나 아직 AI 스터디 분석이 실행되지 않았습니다.</h1>
        <p><a href="/">홈화면으로 돌아가기</a></p>
      </body>
      </html>
    `);
  }

  const analysis = article.aiAnalysis;
  const originalTitle = article.title;
  const sourceName = article.sourceName;
  
  let dateStr = '최근 수집';
  try {
    if (article.date) {
      dateStr = new Date(article.date).toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
  } catch (e) {}

  const snippet = article.description || '기사 본문 설명이 없습니다. 원본 보기를 클릭하여 기사 세부 내용을 읽어보실 수 있습니다.';
  const link = article.link || '#';
  const category = article.category || 'Macro';
  const isEn = article.lang === 'en';
  const flag = isEn ? '🇺🇸 US News' : '🇰🇷 KR News';

  const summaryHtml = analysis.summary.map(sum => `<li>${sum}</li>`).join('\n');
  const implicationsHtml = analysis.implications.map(imp => `<li>${imp}</li>`).join('\n');

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${analysis.translatedTitle} - Truth of Market Premium AI 투자 스터디 노트</title>
  
  <!-- SEO 메타 태그 -->
  <meta name="description" content="${analysis.summary.join(' | ').substring(0, 155)}...">
  <meta name="keywords" content="투자, 주식, 경제, ${sourceName}, 번역, AI 요약, Truth of Market, 경제 뉴스">
  
  <!-- 오픈 그래프 (소셜 미디어 공유용) -->
  <meta property="og:title" content="${analysis.translatedTitle} | Truth of Market">
  <meta property="og:description" content="${analysis.summary[0]}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="/article/${articleId}">
  <meta property="og:site_name" content="Truth of Market">
  
  <!-- 구글 폰트 & 아이콘 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <link rel="stylesheet" href="/styles.css">
  <style>
    .article-page-container {
      max-width: 850px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: hsl(var(--accent-cyan));
      text-decoration: none;
      font-weight: 500;
      margin-bottom: 25px;
      transition: var(--transition-smooth);
      font-size: 0.95rem;
    }
    .back-btn:hover {
      transform: translateX(-4px);
      color: white;
    }
    .article-card {
      padding: 40px;
    }
    .article-header {
      border-bottom: 1px solid hsla(var(--glass-border));
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .article-title {
      font-size: 1.9rem;
      font-weight: 700;
      line-height: 1.4;
      margin: 15px 0;
      color: hsl(var(--text-main));
    }
    .original-title {
      font-size: 1.1rem;
      color: hsl(var(--text-muted));
      margin-bottom: 20px;
      font-style: italic;
    }
    .article-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 0.85rem;
      color: hsl(var(--text-muted));
      align-items: center;
    }
    .analysis-section {
      margin-top: 30px;
      padding: 24px;
      border-radius: 12px;
      background: hsla(var(--bg-primary), 0.3);
      border: 1px solid hsla(var(--glass-border), 0.5);
    }
    .analysis-section h4 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: hsl(var(--accent-cyan));
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .analysis-section ul {
      padding-left: 20px;
      line-height: 1.7;
    }
    .analysis-section li {
      margin-bottom: 10px;
      color: hsl(var(--text-main));
    }
    .implications-section h4 {
      color: hsl(var(--accent-gold));
    }
    .original-snippet-box {
      margin-top: 30px;
      padding: 24px;
      border-radius: 12px;
      background: hsla(var(--bg-secondary), 0.3);
      border: 1px solid hsla(var(--glass-border), 0.3);
    }
    .original-snippet-box h4 {
      font-size: 1rem;
      margin-bottom: 12px;
      color: hsl(var(--text-muted));
    }
    .original-snippet-box p {
      font-size: 0.9rem;
      line-height: 1.6;
      color: hsl(var(--text-muted));
    }
    .action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 40px;
      flex-wrap: wrap;
      gap: 20px;
    }
    .adsense-placement {
      margin: 30px 0;
      border: 1px dashed hsla(var(--accent-cyan), 0.3);
      background: hsla(var(--bg-secondary), 0.5);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      color: hsl(var(--text-muted));
      font-size: 0.8rem;
      position: relative;
    }
    .adsense-placement::before {
      content: 'SPONSORED ADVERTISEMENTS';
      display: block;
      font-size: 0.65rem;
      letter-spacing: 1.5px;
      margin-bottom: 12px;
      color: hsla(var(--accent-cyan), 0.6);
      font-weight: 600;
    }
  </style>
</head>
<body class="dark-theme">
  <!-- 배경 그라디언트 -->
  <div class="bg-glow bg-glow-1"></div>
  <div class="bg-glow bg-glow-2"></div>

  <div class="article-page-container">
    <a href="/" class="back-btn"><i class="fa-solid fa-arrow-left"></i> 실시간 대시보드로 돌아가기</a>
    
    <article class="glass-panel article-card">
      <div class="article-header">
        <div class="article-meta">
          <span class="source-badge">${sourceName}</span>
          <span class="lang-flag">${flag}</span>
          <span class="category-badge" style="background: hsla(var(--glass-border), 0.5); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; color: hsl(var(--text-main));"><i class="fa-solid fa-folder"></i> ${category}</span>
        </div>
        <h1 class="article-title">${analysis.translatedTitle}</h1>
        <div class="original-title">원문 기사명: ${originalTitle}</div>
        <div class="article-meta">
          <span><i class="fa-regular fa-calendar-days"></i> 수집일시: ${dateStr}</span>
        </div>
      </div>

      <!-- 상단 애드센스 광고 (모크배너) -->
      <div class="adsense-placement">
        <p>PREMIUM SPONSOR - Partnership & Ad Slot (Header)</p>
      </div>

      <!-- 핵심 3줄 요약 -->
      <div class="analysis-section">
        <h4><i class="fa-solid fa-list-check"></i> 기사 핵심 요약 (3줄)</h4>
        <ul>
          ${summaryHtml}
        </ul>
      </div>

      <!-- 투자 시사점 -->
      <div class="analysis-section implications-section">
        <h4><i class="fa-solid fa-lightbulb"></i> 투자자 관점 시사점</h4>
        <ul>
          ${implicationsHtml}
        </ul>
      </div>

      <!-- 중단 애드센스 광고 (모크배너) -->
      <div class="adsense-placement">
        <p>PREMIUM SPONSOR - Content Middle In-Feed Ad Slot</p>
      </div>

      <!-- 기사 본문 초안/요약 -->
      <div class="original-snippet-box">
        <h4><i class="fa-solid fa-align-left"></i> 기사 초안 / 본문 요약</h4>
        <p>${snippet}</p>
      </div>

      <div class="action-row">
        <a href="${link}" target="_blank" class="primary-btn"><i class="fa-solid fa-arrow-up-right-from-square"></i> 언론사 기사 원문 정독하기</a>
      </div>
    </article>

    <!-- 하단 애드센스 광고 -->
    <div class="adsense-placement">
      <p>PREMIUM SPONSOR - Footer Bottom Ad Slot</p>
    </div>

    <!-- 법적 면책고지 푸터 -->
    <footer class="app-footer-text" style="margin-top: 40px; text-align: center; font-size: 0.8rem; color: hsl(var(--text-muted)); line-height: 1.6;">
      <p>© 2026 Truth of Market. Powered by Google Gemini & Express.</p>
      <p style="margin-top: 15px; font-size: 0.72rem; max-width: 700px; margin-left: auto; margin-right: auto; color: hsl(var(--text-muted));">
        <strong>면책 조항 (Disclaimer):</strong> 본 웹사이트에서 제공하는 모든 분석 정보 및 AI 요약자료는 단순 학습, 교육 및 연구를 돕기 위해 무상으로 제공되는 스터디 참고용 자료입니다. 당사는 수집된 기사의 완성도, 진실성, 완전성을 대리 보장하지 않으며, 어떠한 종목의 추천이나 권유를 행하지 않습니다. 모든 금융 거래 및 최종 투자 의사결정에 따르는 위험과 책임은 전적으로 거래 당사자 본인에게 귀속됩니다.
      </p>
    </footer>
  </div>
</body>
</html>
  `;
  res.send(html);
});

// --- [영구 아카이브] 일일 백그라운드 RSS 뉴스 정밀 수집기 ---
async function archiveDailyNews() {
  console.log('🔄 [아카이브] 백그라운드 실시간 RSS 수집 및 아카이빙 작업 구동 중...');
  diagnosticLog.lastRun = new Date().toISOString();
  
  // Run asynchronously to prevent blocking server boot
  const { exec } = require('child_process');
  console.log('🤖 [Agent Team] 백그라운드 멀티 에이전트 팀 스크립트 비동기 구동...');
  
  exec('node scripts/run-agent-team.js', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ [아카이브] 멀티 에이전트 팀 구동 오류:', error.message);
      diagnosticLog.success = false;
      diagnosticLog.errors.push({ source: 'multi_agent_team', error: error.message });
      return;
    }
    
    // Reload local variables in server.js after script completes
    loadNewsArchive();
    loadAiCache();
    
    diagnosticLog.success = true;
    console.log(`✅ [아카이브] 멀티 에이전트 팀 Curation 완료.`);
  });
}

// 서버 실행 및 백그라운드 예약 작업 활성화
app.listen(PORT, async () => {
  console.log(`==================================================`);
  console.log(`📈 Investment Study News Dashboard server running!`);
  console.log(`👉 Web Portal: http://localhost:${PORT}`);
  console.log(`==================================================`);

  // 서버 부팅 시점에 즉각 1회 RSS 수집을 수행하여 로컬 아카이브 데이터 최신 상태로 강제 갱신
  console.log('🏁 [시스템 부팅] 로컬 아카이브 초기화 및 데이터 최신 갱신 중...');
  await archiveDailyNews();

  // 24시간에 한 번씩 주기적으로 자동 백그라운드 RSS 파싱 및 수집을 수행하는 타이머 동작 (사용자 접속 시 불필요 오버헤드 0%)
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(async () => {
    await archiveDailyNews();
  }, TWENTY_FOUR_HOURS);
  console.log(`⏰ [스케줄링 완료] 24시간 백그라운드 자동 수집 사이클 타이머가 실행되었습니다.`);
});
