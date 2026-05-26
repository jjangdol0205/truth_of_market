const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Parser = require('rss-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const https = require('https');

// .env 파일 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
});

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 캐시 변수 설정 (10분 캐시)
let newsCache = null;
let cacheTime = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10분

// --- [API 최소화] 영구 AI 요약 로컬 캐시 파일 ---
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

// 서버 시작 시 캐시 로드
loadAiCache();

// 국내외 주요 투자/경제 RSS 피드 목록
const NEWS_SOURCES = [
  // 국내 언론사 (경제/금융/증권 섹션)
  { id: 'chosun', name: '조선일보 경제', lang: 'ko', category: 'Macro', url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/economy/?outputType=xml' },
  { id: 'hankyung-eco', name: '한국경제 경제', lang: 'ko', category: 'Macro', url: 'https://www.hankyung.com/feed/economy' },
  { id: 'hankyung-fin', name: '한국경제 증권', lang: 'ko', category: 'Macro', url: 'https://www.hankyung.com/feed/finance' },
  { id: 'maekyung', name: '매일경제 경제', lang: 'ko', category: 'Macro', url: 'https://www.mk.co.kr/rss/30100041/' },
  { id: 'donga', name: '동아일보 경제', lang: 'ko', category: 'Macro', url: 'http://rss.donga.com/economy.xml' },

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

// Gemini AI 초기화
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ Google Gemini AI 모듈이 성공적으로 로드되었습니다.');
} else {
  console.log('⚠️ Warning: GEMINI_API_KEY가 설정되지 않았습니다. AI 요약 및 번역 기능은 데모 모드로 동작합니다.');
}

// 텔레그램 봇 초기화
let bot = null;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (BOT_TOKEN) {
  try {
    bot = new TelegramBot(BOT_TOKEN, { polling: true });
    console.log('✅ 텔레그램 봇이 활성화되었습니다.');
    
    // 텔레그램 봇 명령어 처리
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, `안녕하세요! 📈 투자 스터디 뉴스 봇입니다.\n\n현재 채팅방의 ID는 \`${chatId}\` 입니다.\n매일 아침 글로벌 경제 및 투자 요약 브리핑을 받아보시려면 이 ID를 서버 .env 파일의 \`TELEGRAM_CHAT_ID\`에 설정해주세요.\n\n사용 가능 명령어:\n/today - 당일 실시간 투자 뉴스 주요 브리핑 받기\n/brief - 경제 요약 브리핑 받기`, { parse_mode: 'Markdown' });
    });

    bot.onText(/\/(today|brief)/, async (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, '🔄 실시간 투자 뉴스를 수집하고 AI 분석을 시작합니다. 잠시만 기다려주세요 (약 10~15초 소요)...');
      
      try {
        const briefingMessage = await generateBriefingMessage(5);
        bot.sendMessage(chatId, briefingMessage, { parse_mode: 'Markdown', disable_web_page_preview: true });
      } catch (error) {
        console.error('Telegram bot brief error:', error);
        bot.sendMessage(chatId, '❌ 뉴스 브리핑 생성 도중 오류가 발생했습니다. Gemini API 키 및 네트워크 연결 상태를 확인해주세요.');
      }
    });

  } catch (error) {
    console.error('❌ 텔레그램 봇 초기화 오류:', error.message);
  }
} else {
  console.log('⚠️ Warning: TELEGRAM_BOT_TOKEN이 설정되지 않았습니다. 텔레그램 봇 기능이 비활성화됩니다.');
}

// 매일 오전 8시 자동 뉴스 브리핑 발송 스케줄러 (node-cron)
const cronSchedule = process.env.CRON_SCHEDULE || '0 8 * * *';
cron.schedule(cronSchedule, async () => {
  if (bot && CHAT_ID) {
    console.log('⏰ 스케줄링 작동: 텔레그램 일일 투자 브리핑 자동 발송을 시작합니다.');
    try {
      const briefingMessage = await generateBriefingMessage(5);
      await bot.sendMessage(CHAT_ID, briefingMessage, { parse_mode: 'Markdown', disable_web_page_preview: true });
      console.log('✅ 텔레그램 일일 브리핑 전송 완료!');
    } catch (error) {
      console.error('❌ 스케줄러 전송 실패:', error);
    }
  }
});

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

  const fetchPromises = NEWS_SOURCES.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
      const items = feed.items.slice(0, 10).map(item => {
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

// 1. 뉴스 피드 통합 목록 조회 API
app.get('/api/news', async (req, res) => {
  try {
    const now = Date.now();
    
    // 캐시 유효성 확인
    if (newsCache && cacheTime && (now - cacheTime < CACHE_DURATION)) {
      return res.json({ success: true, source: 'cache', data: newsCache });
    }

    console.log('🔄 실시간 RSS 뉴스 피드 수집 중...');
    const freshNews = await fetchAllNews();
    
    newsCache = freshNews;
    cacheTime = now;

    res.json({ success: true, source: 'live', data: freshNews });
  } catch (error) {
    console.error('API /api/news error:', error);
    res.status(500).json({ success: false, message: '뉴스를 수집하는 데 실패했습니다.' });
  }
});

// 2. 기사 AI 번역 & 요약 분석 API
app.post('/api/analyze', async (req, res) => {
  const { title, description, lang } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: '기사 제목이 필요합니다.' });
  }

  try {
    const analysis = await analyzeArticleWithGemini(title, description || '', lang || 'ko');
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. 텔레그램 수동 공유 API
app.post('/api/telegram/share', async (req, res) => {
  const { title, summary, implications, link, sourceName } = req.body;
  
  if (!bot || !CHAT_ID) {
    return res.status(400).json({ 
      success: false, 
      message: '서버에 텔레그램 봇 토큰(TELEGRAM_BOT_TOKEN) 및 수신 Chat ID(TELEGRAM_CHAT_ID) 설정이 구성되지 않았습니다.' 
    });
  }

  try {
    let message = `📌 *[투자 스터디 노트 공유]* 📌\n`;
    message += `📰 *${title}* (${sourceName})\n\n`;
    
    message += `📝 *핵심 요약:*\n`;
    if (Array.isArray(summary)) {
      summary.forEach(sum => { message += `• ${sum}\n`; });
    } else {
      message += `• ${summary}\n`;
    }
    
    message += `\n💡 *투자 시사점:*\n`;
    if (Array.isArray(implications)) {
      implications.forEach(imp => { message += `  - ${imp}\n`; });
    } else {
      message += `  - ${implications}\n`;
    }
    
    message += `\n🔗 [기사 원문 읽기](${link})\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━`;

    await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown', disable_web_page_preview: true });
    res.json({ success: true, message: '텔레그램 채널로 스터디 노트가 발송되었습니다!' });
  } catch (error) {
    console.error('Telegram share API error:', error);
    res.status(500).json({ success: false, message: '텔레그램 전송에 실패했습니다: ' + error.message });
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

// 5. API 상태 진단 API
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    geminiActive: !!genAI,
    telegramActive: !!bot && !!CHAT_ID
  });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`📈 Investment Study News Dashboard server running!`);
  console.log(`👉 Web Portal: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
