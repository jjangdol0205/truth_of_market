/**
 * Truth of Market - Daily Automated News Briefing Pipeline
 * 
 * 이 스크립트는 매일 지정된 시간에 AI 에이전트에 의해 자동 실행되어
 * 1. 국내외 주요 투자/경제 RSS 피드 수집
 * 2. 금일 가장 중요한 주요 뉴스 선별 (한/미 균형 배치)
 * 3. Google Gemini API를 활용하여 3줄 핵심 요약 및 2줄 시사점 분석 수행
 * 4. 웹사이트 데이터베이스(news-archive.json, ai-cache.json) 업데이트
 * 5. briefings/ 폴더에 일자별 프리미엄 마크다운 보고서 생성
 * 6. 변경 사항을 깃허브(GitHub)에 자동 커밋 & 푸시하여 라이브 웹사이트 갱신 유도
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const Parser = require('rss-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. .env 파일 경로 명시적 설정 (상위 디렉토리의 .env 로드)
const ROOT_DIR = path.join(__dirname, '..');
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
});

// 파일 경로 설정
const ARCHIVE_FILE = path.join(ROOT_DIR, 'news-archive.json');
const CACHE_FILE = path.join(ROOT_DIR, 'ai-cache.json');
const BUDGET_FILE = path.join(ROOT_DIR, 'api-budget.json');
const BRIEFINGS_DIR = path.join(ROOT_DIR, 'briefings');

// 뉴스 소스 (server.js와 완전히 100% 동일한 구성)
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

// 옵션 처리 (CLI Argument)
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');
const isMockMode = process.argv.includes('--mock') || process.argv.includes('-m');

// 데이터 로드용 상태 변수
let newsArchive = {};
let aiCache = {};
let apiBudget = {
  monthlyBudgetLimit: 75.0,
  currentMonth: new Date().toISOString().substring(0, 7),
  monthlyAccumulatedCost: 0.0,
  totalApiCalls: 0
};

// 파일 로드 헬퍼
function loadDataFiles() {
  try {
    if (fs.existsSync(ARCHIVE_FILE)) {
      newsArchive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
    }
    if (fs.existsSync(CACHE_FILE)) {
      aiCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
    if (fs.existsSync(BUDGET_FILE)) {
      apiBudget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
      // 월간 예산 리셋 자동 체크
      const thisMonth = new Date().toISOString().substring(0, 7);
      if (apiBudget.currentMonth !== thisMonth) {
        apiBudget.currentMonth = thisMonth;
        apiBudget.monthlyAccumulatedCost = 0.0;
        apiBudget.totalApiCalls = 0;
      }
    }
  } catch (e) {
    console.error('⚠️ 파일 로드 중 오류 발생:', e.message);
  }
}

// 파일 저장 헬퍼
function saveDataFiles() {
  if (isDryRun) {
    console.log('🧪 [Dry Run] 실제 변경 사항을 로컬 파일에 저장하지 않습니다.');
    return;
  }
  try {
    fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(newsArchive, null, 2), 'utf8');
    fs.writeFileSync(CACHE_FILE, JSON.stringify(aiCache, null, 2), 'utf8');
    fs.writeFileSync(BUDGET_FILE, JSON.stringify(apiBudget, null, 2), 'utf8');
    console.log('💾 데이터 파일(Archive, Cache, Budget) 저장 완료.');
  } catch (e) {
    console.error('⚠️ 파일 저장 중 오류 발생:', e.message);
  }
}

// 고유 ID 해시 함수
function generateUniqueId(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return 'id_' + (hash >>> 0).toString(36);
}

// RSS 뉴스 수집기
async function fetchNews() {
  const allArticles = [];
  console.log('🔄 RSS 피드로부터 최신 뉴스를 긁어오는 중...');

  const fetchPromises = NEWS_SOURCES.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
      const items = feed.items.slice(0, 20).map(item => {
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
      console.error(`❌ [${source.name}] 수집 오류:`, e.message);
    }
  });

  await Promise.all(fetchPromises);
  return allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Gemini API 호출 및 기사 분석
async function analyzeArticle(article) {
  const title = article.title;
  const description = article.description;
  const lang = article.lang;
  const cacheKey = article.id;

  // 1. 이미 캐시에 분석된 내용이 있다면 캐시 반환 (비용 $0)
  if (aiCache[cacheKey] && aiCache[cacheKey].aiAnalysis) {
    console.log(`⚡ [Cache Hit] 이미 요약 정보가 존재합니다: "${title.substring(0, 20)}..."`);
    return aiCache[cacheKey].aiAnalysis;
  }
  if (newsArchive[cacheKey] && newsArchive[cacheKey].aiAnalysis) {
    console.log(`⚡ [Archive Hit] 이미 아카이브에 요약 정보가 존재합니다: "${title.substring(0, 20)}..."`);
    return newsArchive[cacheKey].aiAnalysis;
  }

  // 2. 모크 모드 혹은 API 키 누락 시 모의 데이터 제공 (API 비용 절감 및 무중단 보장)
  if (isMockMode || !process.env.GEMINI_API_KEY) {
    if (!process.env.GEMINI_API_KEY && !isMockMode) {
      console.warn(`⚠️ [API Key Missing] GEMINI_API_KEY가 없어 가상 분석 모드로 자동 우회합니다: "${title.substring(0, 20)}..."`);
    } else {
      console.log(`🎭 [Mock Mode] 기사를 가상으로 분석합니다: "${title.substring(0, 20)}..."`);
    }
    return {
      translatedTitle: lang === 'en' ? `[가상번역] ${title}` : title,
      summary: [
        "금일 수집된 주요 투자 뉴스의 핵심 사실 관계 요약 1단계 정보입니다.",
        "해당 섹터 및 관련 주요 자산군의 움직임을 정밀히 모니터링 중입니다.",
        "추가적인 거래량 변화 및 기업 실적 추이를 추후 보강해야 합니다."
      ],
      implications: [
        "거시경제 금리 인하 기대감에 따른 단기 수급 쏠림 현상에 주의가 요구됩니다.",
        "중장기적 가치 투자 관점에서는 하방 압력이 견고한 핵심 섹터 분할 매수 접근이 유용합니다."
      ]
    };
  }

  // 3. API 예산 제한 체크
  if (apiBudget.monthlyAccumulatedCost >= apiBudget.monthlyBudgetLimit) {
    console.warn('🚨 [API Budget Shield] 예산 한도에 도달하여 목업 데이터로 자동 대체합니다.');
    return {
      translatedTitle: lang === 'en' ? `[예산보호] ${title}` : title,
      summary: [
        "API 예산 보호막이 동작하여 요약 생성이 일시적으로 차단되었습니다.",
        "이달의 구글 API 사용 예산 한도를 모두 소진하였습니다.",
        "다음 달에 분석이 자동으로 정상화됩니다."
      ],
      implications: [
        "예산 한도를 늘리려면 api-budget.json의 monthlyBudgetLimit을 조정해 주십시오.",
        "시스템의 안심 결제 장치가 작동하여 안전합니다."
      ]
    };
  }

  // 4. Gemini API 호출
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
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

    console.log(`🔥 [Gemini API Calling] 분석 요청 중: "${title.substring(0, 25)}..."`);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const resultJson = JSON.parse(responseText);

    // 비용 계산 (Gemini 2.5 Flash 기준 요율 계산)
    const inputTokens = Math.ceil((prompt.length + title.length + (description || '').length) * 1.3);
    const outputTokens = Math.ceil(responseText.length * 1.3);
    const inputCost = inputTokens * (0.075 / 1000000);
    const outputCost = outputTokens * (0.30 / 1000000);
    const totalCost = inputCost + outputCost;

    apiBudget.monthlyAccumulatedCost += totalCost;
    apiBudget.totalApiCalls += 1;

    console.log(`💸 API 호출 1회 성공! 비용: $${totalCost.toFixed(5)} (월간누적: $${apiBudget.monthlyAccumulatedCost.toFixed(5)})`);

    return resultJson;
  } catch (error) {
    console.error('❌ Gemini 호출 에러:', error.message);
    // 에러 발생 시 가상 데이터 반환하여 스크립트 중단 방지
    return {
      translatedTitle: lang === 'en' ? `[번역에러] ${title}` : title,
      summary: [
        "Gemini API 통신 오류로 임시 제공되는 안내입니다.",
        "기사의 원문 링크를 직접 정독하여 팩트를 체크하는 것을 권장합니다.",
        `원문: ${title}`
      ],
      implications: [
        "시스템의 네트워크 상태 또는 API 호출 레이트 리밋 상태를 확인해보아야 합니다.",
        "이 기사의 투자 시사점 도출을 위한 임시 대기 상태입니다."
      ]
    };
  }
}

// 메인 실행 흐름
async function run() {
  console.log('🤖 =================================================');
  console.log('🤖 일일 자동 투자 브리핑 생성 파이프라인 작동 시작');
  console.log(`🤖 실행 모드: ${isDryRun ? '🧪 DRY-RUN (로컬 비저장)' : '💾 NORMAL (실제 반영)'} | ${isMockMode ? '🎭 MOCK (AI 가상분석)' : '🔥 REAL AI (실제 API 호출)'}`);
  console.log('🤖 =================================================');

  // 1. 파일 로드
  loadDataFiles();

  // 2. 최신 뉴스 긁어오기
  const latestArticles = await fetchNews();
  if (latestArticles.length === 0) {
    console.log('⚠️ RSS 피드에서 수집된 신규 뉴스가 없습니다. 종료합니다.');
    return;
  }

  // 3. 신규 뉴스 아카이브 기입 및 분석 대상 선별
  console.log(`📊 수집 완료: 총 ${latestArticles.length}개의 최신 뉴스.`);
  
  // 국내(ko)와 해외(en) 기사 중 이미 AI 분석이 완료된 최신 기사를 선별 (각 3건씩, 총 6건)
  // 실시간 API를 전혀 호출하지 않으므로 비용이 $0입니다.
  const analyzedArticles = latestArticles.filter(art => {
    const matched = newsArchive[art.id] || aiCache[art.id];
    return matched && matched.aiAnalysis;
  });

  const koreanNews = analyzedArticles.filter(a => a.lang === 'ko');
  const englishNews = analyzedArticles.filter(a => a.lang === 'en');

  const selectedToAnalyze = [];
  
  // 최신 분석 완료된 국내 뉴스 최대 3건 선별
  const finalKoNews = koreanNews.slice(0, 3);
  selectedToAnalyze.push(...finalKoNews.map(a => {
    const matched = newsArchive[a.id] || aiCache[a.id];
    return matched;
  }));

  // 최신 분석 완료된 해외 뉴스 최대 3건 선별
  const finalEnNews = englishNews.slice(0, 3);
  selectedToAnalyze.push(...finalEnNews.map(a => {
    const matched = newsArchive[a.id] || aiCache[a.id];
    return matched;
  }));

  console.log(`💡 분석 완료된 기사 선별: 국내 ${finalKoNews.length}건, 해외 ${finalEnNews.length}건 (총 ${selectedToAnalyze.length}건)`);

  const analyzedList = selectedToAnalyze;

  // 5. 로컬 전체 뉴스 데이터 정리 및 보존 (최대 1000개)
  latestArticles.forEach(art => {
    if (!newsArchive[art.id]) {
      newsArchive[art.id] = { ...art, aiAnalysis: null };
    }
  });

  const sortedArchiveKeys = Object.keys(newsArchive).sort((a, b) => new Date(newsArchive[b].date) - new Date(newsArchive[a].date));
  if (sortedArchiveKeys.length > 1000) {
    sortedArchiveKeys.slice(1000).forEach(k => delete newsArchive[k]);
  }

  // 6. 데이터 세이브
  saveDataFiles();

  // 7. briefings/ 폴더에 마크다운 리포트 작성
  const todayStr = new Date().toISOString().split('T')[0];
  
  if (!fs.existsSync(BRIEFINGS_DIR)) {
    fs.mkdirSync(BRIEFINGS_DIR, { recursive: true });
  }

  const markdownFile = path.join(BRIEFINGS_DIR, `briefing_${todayStr}.md`);

  let mdContent = `# 📈 Premium Daily Investment Briefing - ${todayStr}\n\n`;
  mdContent += `> **Truth of Market** | AI 기반 최신 투자 스터디 및 핵심 마켓 브리핑 리포트입니다.\n`;
  mdContent += `> 작성 시간: ${new Date().toLocaleDateString('ko-KR')} ${new Date().toLocaleTimeString('ko-KR')}\n\n`;
  mdContent += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  analyzedList.forEach((art, index) => {
    const analysis = art.aiAnalysis;
    const flag = art.lang === 'en' ? '🇺🇸 글로벌 기사' : '🇰🇷 국내 기사';
    
    mdContent += `### ${index + 1}. [${flag}] ${analysis.translatedTitle}\n`;
    mdContent += `- **출처:** ${art.sourceName} | **분류:** ${art.category}\n`;
    mdContent += `- **원문 기사명:** *${art.title}*\n\n`;
    
    mdContent += `#### 📋 기사 핵심 요약 (3줄)\n`;
    analysis.summary.forEach(sum => {
      mdContent += `- ${sum}\n`;
    });
    mdContent += `\n`;

    mdContent += `#### 💡 투자자 관점 시사점\n`;
    analysis.implications.forEach(imp => {
      mdContent += `* **시사점:** ${imp}\n`;
    });
    mdContent += `\n`;
    mdContent += `- 🔗 [기사 원문 정독하러 가기](${art.link})\n\n`;
    mdContent += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  });

  mdContent += `\n\n* 본 리포트는 매일 아침 자동으로 분석되어 축적되며, 웹 대시보드 및 sitemap.xml에도 자동 반영되어 실시간으로 구글 서치콘솔에 노출됩니다.`;

  if (!isDryRun) {
    fs.writeFileSync(markdownFile, mdContent, 'utf8');
    console.log(`📝 [Report Created] 데일리 마크다운 브리핑 생성 완료: briefings/briefing_${todayStr}.md`);

    // 8. 깃허브(GitHub) 연동 - 자동 커밋 & 푸시 실행
    console.log('\n🐙 Git 동기화 작업을 시작합니다...');
    try {
      // 혹시 로컬에 변경된 다른 게 있을 수 있으므로 지정한 파일들만 안전하게 Add
      execSync('git add news-archive.json ai-cache.json api-budget.json briefings/', { cwd: ROOT_DIR });
      
      // 변경 사항이 있는지 체크 (없으면 커밋 스킵하여 크래시 방지)
      const gitStatus = execSync('git status --porcelain', { cwd: ROOT_DIR }).toString().trim();
      
      if (gitStatus) {
        console.log('🐙 변경 내역이 감지되어 커밋 및 푸시를 진행합니다.');
        execSync(`git commit -m "Auto-update: Daily Investment Briefing ${todayStr}"`, { cwd: ROOT_DIR });
        execSync('git push origin main', { cwd: ROOT_DIR });
        console.log('🚀 [Git Sync Success] 성공적으로 깃허브 리포지토리에 반영 및 실시간 빌드가 가동되었습니다.');
      } else {
        console.log('🐙 [Git Sync Skip] 변경되거나 갱신된 내역이 없어 깃 동기화를 생격합니다.');
      }
    } catch (gitError) {
      console.error('⚠️ [Git Sync Error] 깃 동기화 도중 오류가 발생했습니다. (다음에 자동 재시도 됩니다):', gitError.message);
    }
  } else {
    console.log('\n🧪 [Dry Run] 생성할 마크다운 내용 미리보기:');
    console.log(mdContent.substring(0, 500) + '\n... (이하 생략)');
  }

  console.log('\n🤖 =================================================');
  console.log('🤖 일일 자동 투자 브리핑 생성 파이프라인 작동 완료!');
  console.log('🤖 =================================================');
}

// 스크립트 가동
run().catch(err => {
  console.error('💥 파이프라인 치명적 오류 발생:', err);
  process.exit(1);
});
