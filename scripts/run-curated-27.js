const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { scrape } = require('./agents/scraper');

const ROOT_DIR = path.join(__dirname, '..');
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const ARCHIVE_FILE = path.join(ROOT_DIR, 'news-archive.json');
const CACHE_FILE = path.join(ROOT_DIR, 'ai-cache.json');
const BUDGET_FILE = path.join(ROOT_DIR, 'api-budget.json');
const BRIEFINGS_DIR = path.join(ROOT_DIR, 'briefings');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY가 .env 파일에 존재하지 않습니다.');
  process.exit(1);
}

let newsArchive = {};
let aiCache = {};
let apiBudget = {
  monthlyBudgetLimit: 75.0,
  currentMonth: new Date().toISOString().substring(0, 7),
  monthlyAccumulatedCost: 0.0,
  totalApiCalls: 0
};

function loadFiles() {
  try {
    if (fs.existsSync(ARCHIVE_FILE)) {
      newsArchive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
    }
    if (fs.existsSync(CACHE_FILE)) {
      aiCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
    if (fs.existsSync(BUDGET_FILE)) {
      apiBudget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
      const thisMonth = new Date().toISOString().substring(0, 7);
      if (apiBudget.currentMonth !== thisMonth) {
        apiBudget.currentMonth = thisMonth;
        apiBudget.monthlyAccumulatedCost = 0.0;
        apiBudget.totalApiCalls = 0;
      }
    }
  } catch (e) {
    console.error('⚠️ 파일 로드 실패:', e.message);
  }
}

function saveFiles() {
  try {
    fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(newsArchive, null, 2), 'utf8');
    fs.writeFileSync(CACHE_FILE, JSON.stringify(aiCache, null, 2), 'utf8');
    fs.writeFileSync(BUDGET_FILE, JSON.stringify(apiBudget, null, 2), 'utf8');
    console.log('💾 데이터 저장 완료.');
  } catch (e) {
    console.error('⚠️ 데이터 저장 실패:', e.message);
  }
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: "application/json" }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function analyzeArticleWithRetry(article, attempt = 1) {
  const title = article.title;
  const description = article.description || '';
  const lang = article.lang || 'en';

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

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const resultJson = JSON.parse(responseText);

    // 비용 정산
    const inputTokens = Math.ceil((prompt.length + title.length + description.length) * 1.3);
    const outputTokens = Math.ceil(responseText.length * 1.3);
    const inputCost = inputTokens * (0.075 / 1000000);
    const outputCost = outputTokens * (0.30 / 1000000);
    const totalCost = inputCost + outputCost;

    apiBudget.monthlyAccumulatedCost += totalCost;
    apiBudget.totalApiCalls += 1;

    return { success: true, data: resultJson, cost: totalCost };
  } catch (error) {
    console.error(`⚠️ [Attempt ${attempt}] API 호출 오류 (ID: ${article.id}):`, error.message);
    if (error.message.includes('429') || error.message.toLowerCase().includes('resource exhausted') || error.message.toLowerCase().includes('rate limit')) {
      const waitTime = attempt * 15000;
      console.log(`⏳ Rate limit 도달. ${waitTime / 1000}초 후 재시도합니다...`);
      await sleep(waitTime);
      return analyzeArticleWithRetry(article, attempt + 1);
    }
    if (attempt < 3) {
      console.log(`⏳ 일반 오류. 5초 후 재시도합니다...`);
      await sleep(5000);
      return analyzeArticleWithRetry(article, attempt + 1);
    }
    return { success: false, error: error.message };
  }
}

async function run() {
  console.log('🤖 =================================================');
  console.log('🤖 [Curated-27] 오늘 뉴스 각 산업별 3개씩 분석 파이프라인 작동');
  console.log('🤖 =================================================');

  loadFiles();

  // 1. Scrape latest news
  const scraped = await scrape();
  if (scraped.length === 0) {
    console.log('⚠️ 수집된 뉴스가 없습니다.');
  }

  // 2. Merge scraped into newsArchive
  scraped.forEach(art => {
    if (!newsArchive[art.id]) {
      newsArchive[art.id] = {
        ...art,
        aiAnalysis: null,
        specialistScore: 0,
        specialistAnalysis: null,
        isCurated: false
      };
    } else {
      const existing = newsArchive[art.id];
      if (art.followingIndustry && !existing.followingIndustry) {
        existing.followingIndustry = art.followingIndustry;
      }
      if (art.followingCompanyIds && art.followingCompanyIds.length > 0) {
        existing.followingCompanyIds = [...new Set([
          ...(existing.followingCompanyIds || []),
          ...art.followingCompanyIds
        ])];
      }
      if (art.companyTicker && !existing.companyTicker) {
        existing.companyTicker = art.companyTicker;
      }
    }
  });

  // 3. Reset all isCurated flags
  for (const id in newsArchive) {
    newsArchive[id].isCurated = false;
  }

  // 4. Select exactly 3 newest articles per industry
  const industries = ['autonomous', 'robotics', 'space', 'crypto', 'nuclear', 'power-infra', 'battery', 'on-device-ai', 'semiconductor'];
  const recentArticles = Object.values(newsArchive).sort((a, b) => new Date(b.date) - new Date(a.date));

  const selectedByInd = {};
  industries.forEach(ind => selectedByInd[ind] = []);

  for (const art of recentArticles) {
    const ind = art.followingIndustry;
    if (industries.includes(ind) && selectedByInd[ind].length < 3) {
      selectedByInd[ind].push(art);
      newsArchive[art.id].isCurated = true; // Mark as curated
    }
  }

  const finalCuratedList = [];
  industries.forEach(ind => {
    finalCuratedList.push(...selectedByInd[ind]);
  });

  console.log(`🎯 각 산업별 3개씩 총 ${finalCuratedList.length}개 기사 선정 완료.`);

  // 5. Analyze selected articles if they lack aiAnalysis
  let analyzedCount = 0;
  for (let i = 0; i < finalCuratedList.length; i++) {
    const art = finalCuratedList[i];
    const archiveItem = newsArchive[art.id];
    
    if (archiveItem.aiAnalysis) {
      console.log(`⚡ [Cache Hit] 이미 분석된 기사: "${archiveItem.title.substring(0, 20)}..."`);
      continue;
    }

    if (apiBudget.monthlyAccumulatedCost >= apiBudget.monthlyBudgetLimit) {
      console.warn('🚨 [Budget Shield] 월간 API 사용 예산 한도에 도달했습니다. 분석을 건너뜁니다.');
      break;
    }

    console.log(`\n[${i + 1}/${finalCuratedList.length}] 분석 진행 중: "${archiveItem.title.substring(0, 25)}..."`);
    const result = await analyzeArticleWithRetry(archiveItem);

    if (result.success) {
      console.log(`✅ 분석 성공! (비용: $${result.cost.toFixed(5)})`);
      archiveItem.aiAnalysis = result.data;
      aiCache[art.id] = {
        ...archiveItem,
        aiAnalysis: result.data
      };
      analyzedCount++;
      saveFiles();
    } else {
      console.error(`❌ 분석 실패: ${result.error}`);
    }

    if (i < finalCuratedList.length - 1) {
      await sleep(4500); // Rate Limit 방지 대기
    }
  }

  console.log(`\n🎉 신규 분석 완료: ${analyzedCount}건`);

  // 6. Generate Daily Briefing Markdown
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
  if (!fs.existsSync(BRIEFINGS_DIR)) {
    fs.mkdirSync(BRIEFINGS_DIR, { recursive: true });
  }

  const markdownFile = path.join(BRIEFINGS_DIR, `briefing_${todayStr}.md`);
  let mdContent = `# 📈 Premium Daily Investment Curation (Top 27) - ${todayStr}\n\n`;
  mdContent += `> **Truth of Market** | 각 산업별로 3개씩 엄선된 프리미엄 투자 리포트입니다.\n`;
  mdContent += `> 작성 시간: ${new Date().toLocaleDateString('ko-KR')} ${new Date().toLocaleTimeString('ko-KR')}\n\n`;
  mdContent += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Sort final list by date for display
  const displayList = [...finalCuratedList].sort((a, b) => new Date(b.date) - new Date(a.date));

  displayList.forEach((art, index) => {
    const archiveItem = newsArchive[art.id];
    const analysis = archiveItem.aiAnalysis;
    if (!analysis) return; // skip unanalyzed in briefing

    const indEmoji = {
      autonomous: '🚗 자율주행',
      robotics: '🤖 로봇/자동화',
      space: '🚀 우주/방산',
      crypto: '₿ 크립토/블록체인',
      nuclear: '⚡ 전력/원전/에너지',
      'power-infra': '🔌 전력인프라',
      battery: '🔋 이차전지',
      'on-device-ai': '📱 온디바이스AI',
      semiconductor: '🔬 반도체'
    }[archiveItem.followingIndustry] || '🌐 글로벌';

    mdContent += `### ${index + 1}. [${indEmoji}] ${analysis.translatedTitle}\n`;
    mdContent += `- **출처:** ${archiveItem.sourceName} | **분류:** ${archiveItem.category}\n`;
    mdContent += `- **원문 기사명:** *${archiveItem.title}*\n\n`;
    
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
    mdContent += `- 🔗 [기사 원문 정독하러 가기](${archiveItem.link})\n\n`;
    mdContent += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  });

  mdContent += `\n\n* 본 리포트는 에이전트 팀에 의해 매일 갱신됩니다.`;
  fs.writeFileSync(markdownFile, mdContent, 'utf8');
  console.log(`📝 [Report Created] 데일리 27선 리포트 생성 완료: briefings/briefing_${todayStr}.md`);

  // 7. Cleanup archive size
  const sortedKeys = Object.keys(newsArchive).sort((a, b) => new Date(newsArchive[b].date) - new Date(newsArchive[a].date));
  if (sortedKeys.length > 1200) {
    sortedKeys.slice(1200).forEach(k => {
      if (!newsArchive[k].isCurated) {
        delete newsArchive[k];
      }
    });
  }

  saveFiles();

  // 8. Git Commit & Push
  try {
    execSync('git add news-archive.json ai-cache.json api-budget.json briefings/', { cwd: ROOT_DIR });
    const gitStatus = execSync('git status --porcelain', { cwd: ROOT_DIR }).toString().trim();
    if (gitStatus) {
      console.log('🐙 Git 커밋 및 푸시를 실행합니다...');
      execSync(`git commit -m "Auto-update: 27 Curated Briefing (3 per Industry) ${todayStr}"`, { cwd: ROOT_DIR });
      execSync('git push origin main', { cwd: ROOT_DIR });
      console.log('🚀 [Git Sync Success] Git 동기화 완료.');
    }
  } catch (gitError) {
    console.error('⚠️ [Git Sync Error] Git 동기화 실패:', gitError.message);
  }

  console.log('🤖 파이프라인 작동 완료!');
}

run().catch(err => {
  console.error('💥 파이프라인 구동 중 오류:', err);
});
