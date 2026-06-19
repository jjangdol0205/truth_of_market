function curateTopN(articles, targetLimit = 30) {
  console.log(`🎯 [Orchestrator Agent] Curation algorithm starting on ${articles.length} articles for top ${targetLimit}...`);

  // 1. Group articles by region
  const regions = { US: [], EU: [], CN: [], JP: [], KR: [] };
  articles.forEach(art => {
    const reg = art.region || 'US';
    if (regions[reg]) {
      regions[reg].push(art);
    } else {
      regions.US.push(art);
    }
  });

  // 2. Sort each region by specialist score (descending) and recency
  for (const r in regions) {
    regions[r].sort((a, b) => {
      const scoreDiff = (b.specialistScore || 0) - (a.specialistScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.date) - new Date(a.date);
    });
  }

  const selected = [];
  const targetPerRegion = Math.floor(targetLimit / 5) || 1;
  const pool = { ...regions };
  let remainingSlots = targetLimit;

  // 1차 패스: 각 지역별로 균등 배분
  for (const r in pool) {
    const takeCount = Math.min(pool[r].length, targetPerRegion);
    for (let i = 0; i < takeCount; i++) {
      selected.push(pool[r][i]);
    }
    pool[r] = pool[r].slice(takeCount);
    remainingSlots -= takeCount;
  }

  // 2차 패스: 슬롯이 남았다면, 모든 지역의 남은 풀 중 점수가 가장 높은 순으로 채움
  if (remainingSlots > 0) {
    const leftover = [];
    for (const r in pool) {
      leftover.push(...pool[r]);
    }
    leftover.sort((a, b) => {
      const scoreDiff = (b.specialistScore || 0) - (a.specialistScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.date) - new Date(a.date);
    });

    const takeCount = Math.min(leftover.length, remainingSlots);
    for (let i = 0; i < takeCount; i++) {
      selected.push(leftover[i]);
    }
  }

  console.log(`🎯 [Orchestrator Agent] Curated ${selected.length} top articles.`);
  return selected;
}

module.exports = { curateTopN };

