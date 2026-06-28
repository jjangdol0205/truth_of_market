/**
 * 팔로잉 외신 일괄 AI 분석 스크립트
 * followingIndustry 태그가 있는 기사 중 aiAnalysis가 없는 것들을 일괄 분석
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { editArticlesBatched } = require('./agents/editor');

const ROOT_DIR = path.join(__dirname, '..');
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const ARCHIVE_FILE = path.join(ROOT_DIR, 'news-archive.json');
const CACHE_FILE = path.join(ROOT_DIR, 'ai-cache.json');
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY 없음. .env 파일 확인');
  process.exit(1);
}

const newsArchive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
let aiCache = {};
if (fs.existsSync(CACHE_FILE)) aiCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));

// 팔로잉 기사 중 aiAnalysis 없는 것 선별 (최신순, 최대 60건)
const unanalyzed = Object.values(newsArchive)
  .filter(art => art.followingIndustry && !art.aiAnalysis)
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 60);

console.log(`🔍 팔로잉 미분석 기사: ${unanalyzed.length}건 → AI 분석 시작`);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const batchSize = 5;
  let done = 0;

  for (let i = 0; i < unanalyzed.length; i += batchSize) {
    const batch = unanalyzed.slice(i, i + batchSize);
    
    if (i > 0) {
      console.log('⏳ Rate limit 방지 13초 대기...');
      await sleep(13000);
    }

    try {
      const results = await editArticlesBatched(batch, apiKey);
      results.forEach(res => {
        if (res.aiAnalysis) {
          newsArchive[res.id].aiAnalysis = res.aiAnalysis;
          newsArchive[res.id].isCurated = true;
          aiCache[res.id] = { ...newsArchive[res.id] };
          done++;
        }
      });
      console.log(`  ✅ ${i + batch.length}/${unanalyzed.length}건 완료 (누적 분석: ${done}건)`);
    } catch (e) {
      console.error(`  ❌ 배치 오류:`, e.message);
    }
  }

  fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(newsArchive, null, 2), 'utf8');
  fs.writeFileSync(CACHE_FILE, JSON.stringify(aiCache, null, 2), 'utf8');
  console.log(`\n🎉 완료! ${done}건 AI 핵심노트 생성 완료. news-archive.json 저장됨.`);
}

run().catch(console.error);
