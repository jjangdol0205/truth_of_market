const fs = require('fs');
const insights = JSON.parse(fs.readFileSync('insights.json', 'utf8'));

const todayStr = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' }); // "7월 9일"

insights.unshift({
  id: "col_" + Date.now(),
  date: new Date().toISOString(),
  title: `[${todayStr}] AI 메모리 품귀 현상과 우주 경제의 도래`,
  content: `
오늘의 글로벌 테크 시장에서는 AI 시대의 양면성이 극명하게 드러나고 있습니다. 

**첫째, 온디바이스 AI PC 시장의 최대 병목으로 '메모리 용량'이 떠올랐습니다.** 클라우드 AI 서버용 HBM(고대역폭 메모리)에 전 세계 반도체 생산 라인이 집중되면서, 역설적으로 일반 PC 및 스마트폰용 D램의 공급 부족 사태가 발생하고 있습니다. 이는 메모리 제조사들에게는 엄청난 가격 협상력을 부여하는 '공급자 우위' 시장의 신호탄이며, 인텔이나 AMD 같은 칩 제조사보다 오히려 삼성전자, SK하이닉스 등 메모리 벤더의 단기적 수익성이 훨씬 안전하게 보장된다는 점을 시사합니다.

**둘째, 스페이스X의 팰컨 9 부스터 36회 재사용 발사가 임박하며 우주 경제의 진입 장벽이 붕괴하고 있습니다.** 로켓 발사 비용의 한계 비용이 제로에 수렴함에 따라, 과거에는 국가 단위에서만 가능했던 위성 데이터 분석(기후 모니터링 등)이나 우주 인프라 구축 비즈니스가 민간 스타트업 영역으로 폭발적으로 확장되고 있습니다. 이는 우주 산업 밸류체인 전반의 패러다임 전환을 예고합니다.

**셋째, AI 인프라를 지탱하기 위한 '에너지 및 데이터센터' 관련 복합 금융(Capital Stack)이 가속화되고 있습니다.** 빅테크들은 무탄소 기저 전력을 확보하기 위해 SMR(소형모듈원전) 및 가스 파이프라인과 같은 구형 에너지 인프라에까지 막대한 자본을 투여하고 있습니다.

투자자들은 단순히 AI 모델 자체를 넘어서, AI를 구동하기 위한 필수 하드웨어 병목 지점(메모리, 전력 인프라)과, AI 기술이 적용되어 산업 구조가 완전히 뒤바뀌는 분야(우주 관측, 로보틱스 물류)로 포트폴리오를 다변화해야 할 시점입니다.
`
});

fs.writeFileSync('insights.json', JSON.stringify(insights, null, 2), 'utf8');
console.log('✅ Insight column injected.');
