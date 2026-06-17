const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'd:/news';
const ARCHIVE_FILE = path.join(ROOT_DIR, 'news-archive.json');
const CACHE_FILE = path.join(ROOT_DIR, 'ai-cache.json');

function cleanFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let isArchive = Array.isArray(data) || typeof data === 'object' && !data.id; 
  
  let cleanedCount = 0;
  let totalCount = 0;

  if (Array.isArray(data)) {
    // If it's an array of articles
    data.forEach(art => {
      totalCount++;
      if (art.aiAnalysis) {
        const isPremium = art.aiAnalysis.isPremiumCuration === true;
        const containsMockText = art.aiAnalysis.summary && art.aiAnalysis.summary.some(s => 
          s.includes('금일 발생한 주요 경제') || 
          s.includes('기사 원문에서 언급된 주요') || 
          s.includes('시장 참여자들의 투자 경계') ||
          s.includes('보도의 사실 관계를 기반으로') || 
          s.includes('원문 기사에서 언급된 구체적인') || 
          s.includes('관련 시장 참가자들의 반응과')
        );

        if (!isPremium || containsMockText) {
          art.aiAnalysis = null;
          cleanedCount++;
        }
      }
    });
  } else {
    // If it's an object keyed by ID
    for (const id in data) {
      totalCount++;
      const art = data[id];
      if (art && art.aiAnalysis) {
        const isPremium = art.aiAnalysis.isPremiumCuration === true;
        const containsMockText = art.aiAnalysis.summary && art.aiAnalysis.summary.some(s => 
          s.includes('금일 발생한 주요 경제') || 
          s.includes('기사 원문에서 언급된 주요') || 
          s.includes('시장 참여자들의 투자 경계') ||
          s.includes('보도의 사실 관계를 기반으로') || 
          s.includes('원문 기사에서 언급된 구체적인') || 
          s.includes('관련 시장 참가자들의 반응과')
        );

        if (!isPremium || containsMockText) {
          art.aiAnalysis = null;
          cleanedCount++;
        }
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`🧹 [Cleaned] ${filePath}: Cleaned ${cleanedCount} mock summaries out of ${totalCount} total items.`);
}

function main() {
  console.log('🤖 Running database cleanup for Google AdSense compliance...');
  cleanFile(ARCHIVE_FILE);
  cleanFile(CACHE_FILE);
}

main();
