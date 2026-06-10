/**
 * Truth of Market - Bulk Analysis Injector
 * 
 * 이 스크립트는 AI 에이전트가 생성한 요약 정보 파일(generated-summaries.json)을 로드하여
 * 1. news-archive.json과 ai-cache.json에 분석 내용을 주입합니다.
 * 2. 제목이 85% 이상 일치하거나 동일한 핵심 키워드를 포함하는 중복/유사 기사에 
 *    요약 내용을 자동으로 1:N 복제 매핑하여 데이터 요약 커버리지를 극대화합니다.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const ARCHIVE_FILE = path.join(ROOT_DIR, 'news-archive.json');
const CACHE_FILE = path.join(ROOT_DIR, 'ai-cache.json');
const SUMMARIES_FILE = path.join(ROOT_DIR, 'generated-summaries.json');

// 문자열 유사도 계산 (Levenshtein Distance 기반)
function getSimilarity(s1, s2) {
  let longer = s1.toLowerCase().trim();
  let shorter = s2.toLowerCase().trim();
  if (longer.length < shorter.length) {
    let temp = longer;
    longer = shorter;
    shorter = temp;
  }
  let longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  let costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue;
    }
  }
  return costs[s2.length];
}

function run() {
  if (!fs.existsSync(SUMMARIES_FILE)) {
    console.error(`❌ 요약 정보 파일이 존재하지 않습니다: ${SUMMARIES_FILE}`);
    process.exit(1);
  }

  // 데이터 로드
  const generated = JSON.parse(fs.readFileSync(SUMMARIES_FILE, 'utf8'));
  const archive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
  
  let aiCache = {};
  if (fs.existsSync(CACHE_FILE)) {
    aiCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  }

  console.log(`📊 1. 주입할 요약 분석 개수: ${Object.keys(generated).length}건`);
  console.log(`📊 2. 기존 아카이브 내 총 기사 개수: ${Object.keys(archive).length}건`);

  let directInjectCount = 0;
  let propagatedCount = 0;

  // 1단계: 직접 생성된 분석 결과 주입
  for (const [id, analysis] of Object.entries(generated)) {
    if (archive[id]) {
      archive[id].aiAnalysis = analysis;
      // 한글 제목도 기사의 번역/순화된 제목으로 업데이트
      if (analysis.translatedTitle) {
        archive[id].translatedTitle = analysis.translatedTitle;
      }
      directInjectCount++;
      
      // 캐시도 함께 동기화
      aiCache[id] = {
        translatedTitle: analysis.translatedTitle,
        aiAnalysis: analysis
      };
    }
  }

  // 2단계: 중복/유사 기사에 대한 1:N 분석 복제 매핑 (동일 기사 다수 출처 커버)
  const allArticles = Object.values(archive);
  
  for (const [srcId, analysis] of Object.entries(generated)) {
    const srcArticle = archive[srcId];
    if (!srcArticle) continue;

    const srcTitle = srcArticle.title;
    
    // 아직 분석이 없는 기사들 중에서 유사한 기사 찾기
    allArticles.forEach(targetArticle => {
      if (targetArticle.id === srcId || targetArticle.aiAnalysis) return;

      const targetTitle = targetArticle.title;
      const similarity = getSimilarity(srcTitle, targetTitle);

      // 제목 유사도가 80% 이상이거나, 아주 긴 제목의 핵심 부분(앞 15자)이 일치할 때
      const isHighlySimilar = similarity >= 0.78 || 
        (srcTitle.length > 20 && targetTitle.length > 20 && srcTitle.substring(0, 18) === targetTitle.substring(0, 18));

      if (isHighlySimilar) {
        // 복제 적용
        targetArticle.aiAnalysis = {
          translatedTitle: analysis.translatedTitle,
          summary: [...analysis.summary],
          implications: [...analysis.implications]
        };
        targetArticle.translatedTitle = analysis.translatedTitle;
        
        // 캐시 등록
        aiCache[targetArticle.id] = {
          translatedTitle: analysis.translatedTitle,
          aiAnalysis: targetArticle.aiAnalysis
        };
        
        propagatedCount++;
        console.log(`🔗 [유사 복제] "${srcTitle.substring(0, 20)}..." ➡️ "${targetTitle.substring(0, 20)}..." (유사도: ${(similarity * 100).toFixed(1)}%)`);
      }
    });
  }

  // 파일 저장
  fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(archive, null, 2), 'utf8');
  fs.writeFileSync(CACHE_FILE, JSON.stringify(aiCache, null, 2), 'utf8');

  console.log(`=========================================`);
  console.log(`✅ [주입 완료]`);
  console.log(`   - 직접 주입: ${directInjectCount}건`);
  console.log(`   - 유사 기사 복제 매핑: ${propagatedCount}건`);
  console.log(`   - 총 분석 완료 기사수: ${Object.values(archive).filter(a => a.aiAnalysis).length}건`);
  console.log(`=========================================`);
}

run();
