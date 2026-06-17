const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'd:/news';
const ARCHIVE_FILE = path.join(ROOT_DIR, 'news-archive.json');
const CACHE_FILE = path.join(ROOT_DIR, 'ai-cache.json');

const SCRATCH_DIR = 'C:/Users/infomax/.gemini/antigravity/brain/06d48279-93b2-48fd-821b-9ec8c56f0712/scratch';
const REAL_SUMMARIES_1 = path.join(SCRATCH_DIR, 'real_summaries.json');
const REAL_SUMMARIES_8 = path.join(SCRATCH_DIR, 'real_summaries_8.json');
const REAL_SUMMARIES_10 = path.join(SCRATCH_DIR, 'real_summaries_10.json');
const REAL_SUMMARIES_11 = path.join(SCRATCH_DIR, 'real_summaries_11.json');
const REAL_SUMMARIES_12 = path.join(SCRATCH_DIR, 'real_summaries_12.json');
const REAL_SUMMARIES_13 = path.join(SCRATCH_DIR, 'real_summaries_13.json');
const REAL_SUMMARIES_14 = path.join(SCRATCH_DIR, 'real_summaries_14.json');

function main() {
  console.log('🤖 Starting premium summaries injection...');

  let mergedSummaries = {};

  if (fs.existsSync(REAL_SUMMARIES_1)) {
    const data1 = JSON.parse(fs.readFileSync(REAL_SUMMARIES_1, 'utf8'));
    Object.assign(mergedSummaries, data1);
    console.log(`Loaded ${Object.keys(data1).length} summaries from real_summaries.json`);
  }

  if (fs.existsSync(REAL_SUMMARIES_8)) {
    const data8 = JSON.parse(fs.readFileSync(REAL_SUMMARIES_8, 'utf8'));
    Object.assign(mergedSummaries, data8);
    console.log(`Merged ${Object.keys(data8).length} summaries from real_summaries_8.json`);
  }

  if (fs.existsSync(REAL_SUMMARIES_10)) {
    const data10 = JSON.parse(fs.readFileSync(REAL_SUMMARIES_10, 'utf8'));
    Object.assign(mergedSummaries, data10);
    console.log(`Merged ${Object.keys(data10).length} summaries from real_summaries_10.json`);
  }

  if (fs.existsSync(REAL_SUMMARIES_11)) {
    const data11 = JSON.parse(fs.readFileSync(REAL_SUMMARIES_11, 'utf8'));
    Object.assign(mergedSummaries, data11);
    console.log(`Merged ${Object.keys(data11).length} summaries from real_summaries_11.json`);
  }

  if (fs.existsSync(REAL_SUMMARIES_12)) {
    const data12 = JSON.parse(fs.readFileSync(REAL_SUMMARIES_12, 'utf8'));
    Object.assign(mergedSummaries, data12);
    console.log(`Merged ${Object.keys(data12).length} summaries from real_summaries_12.json`);
  }

  if (fs.existsSync(REAL_SUMMARIES_13)) {
    const data13 = JSON.parse(fs.readFileSync(REAL_SUMMARIES_13, 'utf8'));
    Object.assign(mergedSummaries, data13);
    console.log(`Merged ${Object.keys(data13).length} summaries from real_summaries_13.json`);
  }

  if (fs.existsSync(REAL_SUMMARIES_14)) {
    const data14 = JSON.parse(fs.readFileSync(REAL_SUMMARIES_14, 'utf8'));
    Object.assign(mergedSummaries, data14);
    console.log(`Merged ${Object.keys(data14).length} summaries from real_summaries_14.json`);
  }

  console.log(`Total unique summaries to inject: ${Object.keys(mergedSummaries).length}`);

  let archive = {};
  if (fs.existsSync(ARCHIVE_FILE)) {
    archive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
  }

  let cache = {};
  if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  }

  let archiveUpdates = 0;
  let cacheUpdates = 0;

  for (const id in mergedSummaries) {
    const sumData = mergedSummaries[id];
    const aiAnalysis = {
      translatedTitle: sumData.translatedTitle,
      summary: sumData.summary,
      implications: sumData.implications,
      isPremiumCuration: true
    };

    if (archive[id]) {
      // If currently null or a mock summary, replace it
      archive[id].aiAnalysis = aiAnalysis;
      archive[id].isCurated = true;
      archiveUpdates++;
    } else {
      // Even if not in archive, create placeholder in case it gets scraped later
      archive[id] = {
        id: id,
        title: sumData.translatedTitle,
        link: 'https://news.google.com',
        description: sumData.summary.join(' '),
        date: new Date().toISOString(),
        sourceId: 'kr-manual',
        sourceName: '수동 주입 기사',
        lang: 'ko',
        category: 'Macro',
        aiAnalysis: aiAnalysis,
        isCurated: true
      };
      archiveUpdates++;
    }

    // Always inject to AI Cache
    cache[id] = {
      ...archive[id],
      aiAnalysis: aiAnalysis,
      isCurated: true
    };
    cacheUpdates++;
  }

  fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(archive, null, 2), 'utf8');
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');

  console.log(`✅ Injection complete:`);
  console.log(`- news-archive.json: ${archiveUpdates} items updated/inserted`);
  console.log(`- ai-cache.json: ${cacheUpdates} items updated/inserted`);
}

main();
