const fs = require('fs');
const path = require('path');

const tasksDir = path.join(__dirname, '..', 'agent-tasks');
const archivePath = path.join(__dirname, '..', 'news-archive.json');

let archive = [];
if (fs.existsSync(archivePath)) {
  archive = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
}

let totalInjected = 0;
let mergedSummaries = {};

// Read all generated-summaries-*.json
const files = fs.readdirSync(tasksDir).filter(f => f.startsWith('generated-summaries-') && f.endsWith('.json'));

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(tasksDir, file), 'utf8'));
    Object.assign(mergedSummaries, data);
  } catch (err) {
    console.error(`Error parsing ${file}:`, err.message);
  }
}

// Inject into archive
let updatedCount = 0;
for (const id in archive) {
  const item = archive[id];
  if (mergedSummaries[id]) {
    item.aiAnalysis = mergedSummaries[id];
    updatedCount++;
  }
}

// Handle similarity propagation (basic title matching like in inject-summaries-bulk)
const stringSimilarity = require('string-similarity');
const archiveArr = Object.values(archive);
const analyzedItems = archiveArr.filter(a => a.aiAnalysis !== null);
const unanalyzedItems = archiveArr.filter(a => a.aiAnalysis === null);

let clonedCount = 0;
for (const un of unanalyzedItems) {
  let bestMatch = null;
  let bestScore = 0;
  for (const an of analyzedItems) {
    const score = stringSimilarity.compareTwoStrings(un.title, an.title);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = an;
    }
  }
  if (bestScore > 0.6 && bestMatch) {
    archive[un.id].aiAnalysis = JSON.parse(JSON.stringify(bestMatch.aiAnalysis));
    clonedCount++;
  }
}

fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2), 'utf8');

console.log(`✅ [일괄 주입 완료]`);
console.log(`   - 직접 주입: ${updatedCount}건`);
console.log(`   - 유사 기사 복제 매핑: ${clonedCount}건`);
console.log(`   - 총 분석 완료 기사수: ${Object.values(archive).filter(a => a.aiAnalysis !== null).length}건`);
