const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

const { scrape } = require('./agents/scraper');
const { analyzeArticlesBatched } = require('./agents/specialists');
const { curateTop30 } = require('./agents/orchestrator');
const { editArticlesBatched } = require('./agents/editor');

const ROOT_DIR = path.join(__dirname, '..');
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const ARCHIVE_FILE = path.join(ROOT_DIR, 'news-archive.json');
const CACHE_FILE = path.join(ROOT_DIR, 'ai-cache.json');
const BUDGET_FILE = path.join(ROOT_DIR, 'api-budget.json');
const BRIEFINGS_DIR = path.join(ROOT_DIR, 'briefings');

let newsArchive = {};
let aiCache = {};
let apiBudget = {
  monthlyBudgetLimit: 75.0,
  currentMonth: new Date().toISOString().substring(0, 7),
  monthlyAccumulatedCost: 0.0,
  totalApiCalls: 0
};

const apiKey = process.env.GEMINI_API_KEY;

function getArticleRegion(art) {
  if (art.region) return art.region;
  const id = art.sourceId || '';
  if (id.startsWith('us-') || ['global-invest', 'nyt-biz', 'nyt-tech'].includes(id)) return 'US';
  if (id.startsWith('eu-')) return 'EU';
  if (id.startsWith('cn-')) return 'CN';
  if (id.startsWith('jp-')) return 'JP';
  if (id.startsWith('kr-') || ['chosun', 'hankyung-eco', 'hankyung-fin', 'maekyung', 'donga', 'korean-markets-trend'].includes(id)) return 'KR';
  return 'US'; // fallback
}

function loadFiles() {
  try {
    if (fs.existsSync(ARCHIVE_FILE)) {
      newsArchive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
      for (const id in newsArchive) {
        newsArchive[id].region = getArticleRegion(newsArchive[id]);
      }
    }
    if (fs.existsSync(CACHE_FILE)) aiCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
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
    console.error('⚠️ [Agent Team] 파일 로드 실패:', e.message);
  }
}

function saveFiles() {
  try {
    fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(newsArchive, null, 2), 'utf8');
    fs.writeFileSync(CACHE_FILE, JSON.stringify(aiCache, null, 2), 'utf8');
    fs.writeFileSync(BUDGET_FILE, JSON.stringify(apiBudget, null, 2), 'utf8');
    console.log('💾 [Agent Team] 데이터 저장 완료.');
  } catch (e) {
    console.error('⚠️ [Agent Team] 데이터 저장 실패:', e.message);
  }
}

async function run() {
  console.log('🤖 =================================================');
  console.log('🤖 [Agent Team] 글로벌 멀티 에이전트 Curation 파이프라인 작동');
  console.log('🤖 =================================================');

  if (!apiKey) {
    console.error('❌ [Agent Team] GEMINI_API_KEY가 존재하지 않습니다. 종료합니다.');
    return;
  }

  loadFiles();

  // 1. Scrape articles
  const scraped = await scrape();
  if (scraped.length === 0) {
    console.log('⚠️ [Agent Team] 수집된 뉴스가 없습니다. 종료합니다.');
    return;
  }

  // 2. Merge scraped articles into newsArchive
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
      // Keep existing analysis if present
      newsArchive[art.id].region = art.region; // Ensure region is updated/correct
    }
  });

  // 3. Select candidates to analyze (we only run specialists on new/unanalyzed articles to save API cost)
  // Limit to the top 15 newest unanalyzed ones to respect Free Tier API quotas
  const unanalyzed = Object.values(newsArchive)
    .filter(art => !art.specialistAnalysis && !art.aiAnalysis)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 15);

  console.log(`🔍 [Agent Team] 신규 분석이 필요한 기사: ${unanalyzed.length}건`);

  // Group unanalyzed by region (US, EU, CN, JP, KR)
  const unanalyzedByRegion = { US: [], EU: [], CN: [], JP: [], KR: [] };
  unanalyzed.forEach(art => {
    const reg = art.region || 'US';
    if (unanalyzedByRegion[reg]) {
      unanalyzedByRegion[reg].push(art);
    } else {
      unanalyzedByRegion[reg] = [art];
    }
  });

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  let regionCallCount = 0;

  for (const region in unanalyzedByRegion) {
    const list = unanalyzedByRegion[region];
    if (list.length === 0) continue;

    if (regionCallCount > 0) {
      console.log('⏳ Rate Limit 방지를 위해 13초 대기 중...');
      await sleep(13000);
    }

    const specResults = await analyzeArticlesBatched(list, region, apiKey);
    regionCallCount++;

    apiBudget.totalApiCalls += 1;
    apiBudget.monthlyAccumulatedCost += 0.0001; // Estimate cost

    specResults.forEach(res => {
      if (newsArchive[res.id]) {
        newsArchive[res.id].specialistScore = res.score;
        newsArchive[res.id].specialistAnalysis = res.analysis;
      }
    });
  }

  // 4. Gather candidates for Curation (all articles within the last 3 days)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const curationCandidates = Object.values(newsArchive).filter(art => {
    return new Date(art.date) >= threeDaysAgo;
  });

  // 5. Run Orchestrator to select top 30
  const curated30 = curateTop30(curationCandidates);

  // Mark curation flag on archive
  for (const id in newsArchive) {
    newsArchive[id].isCurated = false;
  }

  // 6. Run Genius Editor on Curated Top 30
  // Identify which ones need premium summary (no premium analysis yet)
  const needsEditor = [];
  const finalCuratedList = [];

  for (let i = 0; i < curated30.length; i++) {
    const candidate = curated30[i];
    const archiveItem = newsArchive[candidate.id];
    archiveItem.isCurated = true;

    if (archiveItem.aiAnalysis && archiveItem.aiAnalysis.isPremiumCuration) {
      console.log(`⚡ [Editor Cache Hit] 이미 프리미엄 요약이 존재합니다: "${archiveItem.title.substring(0, 20)}..."`);
      finalCuratedList.push(archiveItem);
    } else {
      needsEditor.push(archiveItem);
    }
  }

  console.log(`✍️ [Genius Editor] 프리미엄 작성이 필요한 기사: ${needsEditor.length}건`);

  // Process in batches of 5 to avoid large prompts or rate limits
  const editorBatchSize = 5;
  for (let i = 0; i < needsEditor.length; i += editorBatchSize) {
    const batch = needsEditor.slice(i, i + editorBatchSize);
    
    if (i > 0) {
      console.log('⏳ Rate Limit 방지를 위해 13초 대기 중...');
      await sleep(13000);
    }

    const editorResults = await editArticlesBatched(batch, apiKey);
    
    apiBudget.totalApiCalls += 1;
    apiBudget.monthlyAccumulatedCost += 0.0003; // Estimate cost

    editorResults.forEach(res => {
      const archiveItem = newsArchive[res.id];
      if (archiveItem && res.aiAnalysis) {
        archiveItem.aiAnalysis = res.aiAnalysis;
        aiCache[res.id] = {
          ...archiveItem,
          aiAnalysis: res.aiAnalysis
        };
        finalCuratedList.push(archiveItem);
      }
    });
  }

  // Sort final curated list by date (newest first)
  finalCuratedList.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 7. Cleanup newsArchive size (limit to 1200 items to keep file slim)
  const sortedArchiveKeys = Object.keys(newsArchive).sort((a, b) => new Date(newsArchive[b].date) - new Date(newsArchive[a].date));
  if (sortedArchiveKeys.length > 1200) {
    sortedArchiveKeys.slice(1200).forEach(k => {
      // Don't delete curated or bookmarked items if possible, or just delete older ones
      if (!newsArchive[k].isCurated) {
        delete newsArchive[k];
      }
    });
  }

  saveFiles();

  // 8. Generate Daily Briefing Markdown
  const todayStr = new Date().toISOString().split('T')[0];
  if (!fs.existsSync(BRIEFINGS_DIR)) {
    fs.mkdirSync(BRIEFINGS_DIR, { recursive: true });
  }

  const markdownFile = path.join(BRIEFINGS_DIR, `briefing_${todayStr}.md`);
  let mdContent = `# 📈 Premium Daily Investment Curation (Top 30) - ${todayStr}\n\n`;
  mdContent += `> **Truth of Market** | 글로벌 멀티 에이전트 팀이 엄선한 오늘의 핵심 30선 투자 리포트입니다.\n`;
  mdContent += `> 작성 시간: ${new Date().toLocaleDateString('ko-KR')} ${new Date().toLocaleTimeString('ko-KR')}\n\n`;
  mdContent += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  finalCuratedList.forEach((art, index) => {
    const analysis = art.aiAnalysis;
    const regionFlag = { US: '🇺🇸 미국', EU: '🇪🇺 유럽', CN: '🇨🇳 중국', JP: '🇯🇵 일본', KR: '🇰🇷 한국' }[art.region || 'US'] || '🌐 글로벌';
    
    mdContent += `### ${index + 1}. [${regionFlag} | Score: ${art.specialistScore}] ${analysis.translatedTitle}\n`;
    mdContent += `- **출처:** ${art.sourceName} | **분류:** ${art.category}\n`;
    mdContent += `- **원문 기사명:** *${art.title}*\n\n`;
    
    mdContent += `#### 📋 AI 투자 핵심 요약 (3줄)\n`;
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

  mdContent += `\n\n* 본 리포트는 에이전트 팀에 의해 매일 갱신됩니다.`;
  fs.writeFileSync(markdownFile, mdContent, 'utf8');
  console.log(`📝 [Report Created] 데일리 30선 리포트 생성 완료: briefings/briefing_${todayStr}.md`);

  // 9. Git Commit & Push
  try {
    execSync('git add news-archive.json ai-cache.json api-budget.json briefings/', { cwd: ROOT_DIR });
    const gitStatus = execSync('git status --porcelain', { cwd: ROOT_DIR }).toString().trim();
    if (gitStatus) {
      console.log('🐙 Git 커밋 및 푸시를 실행합니다...');
      execSync(`git commit -m "Auto-update: Multi-Agent Curated Briefing ${todayStr}"`, { cwd: ROOT_DIR });
      execSync('git push origin main', { cwd: ROOT_DIR });
      console.log('🚀 [Git Sync Success] Git 동기화가 성공적으로 완료되었습니다.');
    }
  } catch (gitError) {
    console.error('⚠️ [Git Sync Error] Git 동기화 실패:', gitError.message);
  }

  console.log('🤖 파이프라인 작동 완료!');
}

run().catch(err => {
  console.error('💥 파이프라인 구동 중 오류:', err);
});
