const fs = require('fs');

const data = JSON.parse(fs.readFileSync('news-archive.json', 'utf8'));

const isEnglish = (str) => {
  if (!str) return false;
  const kor = (str.match(/[가-힣]/g) || []).length;
  const eng = (str.match(/[a-zA-Z]/g) || []).length;
  // If there's almost no Korean but significant English, it's probably English
  return eng > kor * 2 && kor < 10;
};

const bad = Object.values(data).filter(d => {
  if (!d.aiAnalysis) return false;
  const titleBad = isEnglish(d.aiAnalysis.translatedTitle);
  const summaryBad = Array.isArray(d.aiAnalysis.summary) && d.aiAnalysis.summary.some(isEnglish);
  const impBad = Array.isArray(d.aiAnalysis.implications) && d.aiAnalysis.implications.some(isEnglish);
  return titleBad || summaryBad || impBad;
});

console.log(`English entries count: ${bad.length}`);
fs.writeFileSync('bad-english.json', JSON.stringify(bad, null, 2));
