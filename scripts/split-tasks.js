const fs = require('fs');
const path = require('path');

const archivePath = path.join(__dirname, '..', 'news-archive.json');
const tasksDir = path.join(__dirname, '..', 'agent-tasks');
const chunkSize = 15; // Reduce to 15 to make it easier for agents

const archive = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
const unanalyzed = Object.values(archive).filter(item => item.aiAnalysis === null);

console.log(`총 미요약 기사: ${unanalyzed.length}건`);

// Clear old tasks
if (fs.existsSync(tasksDir)) {
  fs.readdirSync(tasksDir).forEach(file => fs.unlinkSync(path.join(tasksDir, file)));
}

let chunkIndex = 1;
for (let i = 0; i < unanalyzed.length; i += chunkSize) {
  const chunk = unanalyzed.slice(i, i + chunkSize);
  const filePath = path.join(tasksDir, `chunk-${chunkIndex}.json`);
  fs.writeFileSync(filePath, JSON.stringify(chunk, null, 2), 'utf8');
  chunkIndex++;
}

console.log(`총 ${chunkIndex - 1}개의 청크로 분할되었습니다.`);
