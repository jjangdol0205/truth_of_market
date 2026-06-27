const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT_DIR = path.join(__dirname, '..');
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const ARCHIVE_FILE = path.join(ROOT_DIR, 'news-archive.json');
const CACHE_FILE = path.join(ROOT_DIR, 'ai-cache.json');
const BUDGET_FILE = path.join(ROOT_DIR, 'api-budget.json');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY가 .env 파일에 존재하지 않습니다.');
  process.exit(1);
}

// 옵션 처리
const args = process.argv.slice(2);
const limitArgIndex = args.indexOf('--limit');
const limit = limitArgIndex !== -1 ? parseInt(args[limitArgIndex + 1], 10) : null;
const ignoreBudget = args.includes('--ignore-budget');

// 데이터 로드
let newsArchive = {};
let aiCache = {};
let apiBudget = {
  monthlyBudgetLimit: 75.0,
  currentMonth: new Date().toISOString().substring(0, 7),
  monthlyAccumulatedCost: 0.0,
  totalApiCalls: 0
};

if (fs.existsSync(ARCHIVE_FILE)) {
  newsArchive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
}
if (fs.existsSync(CACHE_FILE)) {
  aiCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
}
if (fs.existsSync(BUDGET_FILE)) {
  apiBudget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: "application/json" }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Gemini API 호출 헬퍼 (재시도 및 딜레이 탑재)
async function analyzeArticleWithRetry(article, attempt = 1) {
  const title = article.title;
  const description = article.description || '';
  const lang = article.lang || 'ko';

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

    // 비용 정산 (Flash 모델 기준)
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
    
    // Rate Limit 혹은 과부하 오류 처리
    if (error.message.includes('429') || error.message.toLowerCase().includes('resource exhausted') || error.message.toLowerCase().includes('rate limit')) {
      const waitTime = attempt * 15000; // 15초, 30초, 45초... 대기
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
  console.log('🤖 미요약 기사 일괄 분석 파이프라인 작동 시작');
  console.log('🤖 =================================================');

  // 미요약 기사 필터링
  const unsummarized = Object.values(newsArchive).filter(a => !a.aiAnalysis);
  console.log(`📊 요약이 필요한 기사 수: ${unsummarized.length}개`);

  if (unsummarized.length === 0) {
    console.log('✅ 요약되지 않은 기사가 없습니다.');
    return;
  }

  const listToProcess = limit ? unsummarized.slice(0, limit) : unsummarized;
  console.log(`🚀 처리 대상 기사 수: ${listToProcess.length}개 ${limit ? `(제한: ${limit}개)` : ''}`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < listToProcess.length; i++) {
    const article = listToProcess[i];
    console.log(`\n[${i + 1}/${listToProcess.length}] 기사 분석 중: "${article.title.substring(0, 30)}..." (ID: ${article.id})`);

    // 예산 체크 (ignoreBudget이 아닐 때만)
    if (!ignoreBudget && apiBudget.monthlyAccumulatedCost >= apiBudget.monthlyBudgetLimit) {
      console.error('🚨 [Budget Shield] 월간 API 사용 예산 한도($' + apiBudget.monthlyBudgetLimit + ')에 도달했습니다. 실행을 중단합니다.');
      break;
    }

    const result = await analyzeArticleWithRetry(article);

    if (result.success) {
      console.log(`✅ 분석 성공! (비용: $${result.cost.toFixed(5)})`);
      
      // 데이터 업데이트
      const updatedArticle = {
        ...article,
        aiAnalysis: result.data
      };

      newsArchive[article.id] = updatedArticle;
      aiCache[article.id] = updatedArticle;
      successCount++;

      // 매 성공 시 파일에 즉시 저장하여 데이터 유실 방지
      fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(newsArchive, null, 2), 'utf8');
      fs.writeFileSync(CACHE_FILE, JSON.stringify(aiCache, null, 2), 'utf8');
      fs.writeFileSync(BUDGET_FILE, JSON.stringify(apiBudget, null, 2), 'utf8');
    } else {
      console.error(`❌ 분석 실패: ${result.error}`);
      failCount++;
    }

    // Rate Limit 방지를 위해 각 호출 사이 4.5초의 간격을 둡니다. (무료 계정 RPM 안전 대기)
    if (i < listToProcess.length - 1) {
      console.log('💤 API Rate Limit 안정을 위해 4.5초간 대기합니다...');
      await sleep(4500);
    }
  }

  console.log('\n🤖 =================================================');
  console.log(`🎉 일괄 분석 완료!`);
  console.log(`성공: ${successCount}개`);
  console.log(`실패: ${failCount}개`);
  console.log(`현재 누적 비용: $${apiBudget.monthlyAccumulatedCost.toFixed(5)}`);
  console.log('🤖 =================================================');
}

run().catch(err => {
  console.error('💥 실행 중 치명적 오류 발생:', err);
  process.exit(1);
});
