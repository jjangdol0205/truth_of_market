const fs = require('fs');
const archive = JSON.parse(fs.readFileSync('news-archive.json', 'utf8'));

// 1. Reset all curated flags
for (const id in archive) {
  archive[id].isCurated = false;
}

// 2. 각 산업별 선택 수 설정 (semiconductor는 DRAM 포함 5개)
const industryLimits = {
  'autonomous':    3,
  'robotics':      3,
  'space':         3,
  'crypto':        3,
  'nuclear':       3,
  'power-infra':   3,
  'battery':       3,
  'on-device-ai':  3,
  'semiconductor': 5   // DRAM 전용 기사 포함
};

const industries = Object.keys(industryLimits);
const recent = Object.values(archive).sort((a, b) => new Date(b.date) - new Date(a.date));

const selected = {};
industries.forEach(ind => selected[ind] = []);

for (const art of recent) {
  const ind = art.followingIndustry;
  if (industries.includes(ind) && selected[ind].length < industryLimits[ind]) {
    // aiAnalysis 있는 기사만 큐레이션
    if (art.aiAnalysis) {
      selected[ind].push(art);
      archive[art.id].isCurated = true;
    }
  }
}

fs.writeFileSync('news-archive.json', JSON.stringify(archive, null, 2));

let total = 0;
industries.forEach(ind => {
  const cnt = selected[ind].length;
  total += cnt;
  console.log(`  ${ind}: ${cnt}건`);
});
console.log(`\n✅ 총 ${total}건 큐레이션 완료 (반도체 DRAM 포함 5건)`);
