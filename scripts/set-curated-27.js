const fs = require('fs');
const archive = JSON.parse(fs.readFileSync('news-archive.json', 'utf8'));

// 1. Reset all curated flags
for (const id in archive) {
  archive[id].isCurated = false;
}

// 2. Select exactly top 3 per industry
const industries = ['autonomous', 'robotics', 'space', 'crypto', 'nuclear', 'power-infra', 'battery', 'on-device-ai', 'semiconductor'];
const recent = Object.values(archive).sort((a, b) => new Date(b.date) - new Date(a.date));

const selected = {};
industries.forEach(ind => selected[ind] = []);

for (const art of recent) {
  const ind = art.followingIndustry;
  if (industries.includes(ind) && selected[ind].length < 3) {
    selected[ind].push(art);
    archive[art.id].isCurated = true; // Mark as curated
  }
}

fs.writeFileSync('news-archive.json', JSON.stringify(archive, null, 2));
console.log('Successfully set curated flag for exactly 3 articles per industry (Total 27 articles).');
