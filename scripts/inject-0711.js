const fs = require('fs');
const path = require('path');
const archive = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'news-archive.json'), 'utf8'));

// Antigravity 직접 작성 프리미엄 분석 (2026-07-11)
const analyses = {

  // ─── BATTERY ───
  'id_1g7u3zz': {
    translatedTitle: '한국 ESS 배터리 붐, 셀 생산 이후 구간에서 공급망 병목 현상 발생',
    summary: [
      '한국경제신문에 따르면 국내 ESS(에너지저장장치) 시장이 폭발적으로 성장하는 가운데, 배터리 셀 생산 이후 모듈·팩 조립 및 설치 단계에서 심각한 공급 병목이 발생하고 있습니다.',
      'LG에너지솔루션, 삼성SDI 등 국내 대형 배터리 셀 메이커들의 생산 캐파는 확장됐지만, 하류 밸류체인인 BMS(배터리 관리 시스템) 부품 수급 부족과 현장 설치 인력 부족이 납기 지연의 주범으로 지목되고 있습니다.',
      '미국 IRA(인플레이션 감소법)와 유럽 그린딜의 재생에너지 확대 정책에 따라 글로벌 ESS 발주가 급증하고 있어, 셀 이후 공급망 병목은 단기적으로 해소되기 어려운 구조적 문제로 부각됩니다.'
    ],
    implications: [
      '셀 생산보다 ESS 턴키 솔루션(설계·조달·시공)을 제공하는 시스템통합(SI) 업체와 BMS 전문 기업들이 오히려 공급 부족에 따른 프리미엄 마진을 누릴 수 있는 역설적 수혜 구도가 형성됩니다.',
      '병목 해소를 위한 모듈·팩 자동화 장비 투자 수요가 확대되며, 2차전지 후공정 자동화 설비 제조사들의 수주 파이프라인이 중장기적으로 급격히 두터워질 전망입니다.'
    ],
    isPremiumCuration: true
  },

  // ─── ON-DEVICE AI ───
  'id_jllqbj': {
    translatedTitle: 'ASUS, 17 TOPS NPU 탑재 비보북 14·15 신제품으로 AI PC 라인업 본격 확장',
    summary: [
      'ASUS가 인텔·퀄컴 기반의 17 TOPS(Tera Operations Per Second) 신경망처리장치(NPU)를 탑재한 비보북 14·15 신형 라인업을 출시하며 보급형 AI PC 시장 공략을 본격화했습니다.',
      '17 TOPS는 마이크로소프트가 코파일럿 플러스(Copilot+) PC 인증을 위해 요구하는 40 TOPS에는 미치지 못하지만, 실시간 번역·배경 제거·화질 향상 등 일상적 AI 추론 작업을 오프라인으로 처리하는 데 충분한 성능입니다.',
      'AI PC 보급이 고가 하이엔드 모델에서 메인스트림 대중 시장으로 빠르게 확산되고 있음을 보여주는 신호탄으로, OEM들의 출시 경쟁이 한층 가속화될 전망입니다.'
    ],
    implications: [
      'TOPS 기준 AI 성능을 앞세운 PC 교체 수요가 폭발적으로 일어날 경우, NPU를 설계하는 인텔(Intel Core Ultra), 퀄컴(Snapdragon X), AMD(Ryzen AI) 등 칩 메이커들의 ASP(평균판매단가) 상승과 PC 부문 수익성 개선으로 직결됩니다.',
      '온디바이스 AI 추론에 특화된 메모리 대역폭 수요가 증가하면서 LPDDR5X·LPDDR6 등 고속 저전력 D램을 공급하는 삼성전자·SK하이닉스의 중장기 수혜가 기대됩니다.'
    ],
    isPremiumCuration: true
  },

  'id_d2yc9': {
    translatedTitle: '삼성, AMD·애플에 도전장... AI PC 칩 샘플 레노버·HP에 공급 개시',
    summary: [
      '삼성전자가 자체 설계 AI PC 프로세서 칩의 엔지니어링 샘플(ES)을 레노버, HP 등 주요 글로벌 OEM 제조사에 배포하며 AMD, 애플에 맞서는 프리미엄 AI PC SoC(시스템온칩) 시장 진입을 공식 선언했습니다.',
      '삼성의 AI PC 칩은 자사 4나노 파운드리 공정과 고대역폭 LPDDR5X 메모리를 집적한 패키지로, 온디바이스 NPU 성능이 퀄컴 스냅드래곤 X Elite와 직접 경쟁할 수 있는 수준으로 알려졌습니다.',
      '현재 AI PC SoC는 인텔·퀄컴·AMD가 시장을 3분하고 있으며, 삼성이 메모리·파운드리·시스템반도체를 수직계열화한 강점을 무기로 가격 및 성능에서 통합 우위를 노리는 구도입니다.'
    ],
    implications: [
      '삼성이 AI PC 칩 시장에 진입할 경우, 기존 인텔·퀄컴의 점유율 방어를 위한 가격 경쟁이 심화되어 업계 전반 ASP가 하락 압력을 받을 수 있으나, 전체 파이 확장 효과로 NPU 내장 칩 수요 자체는 폭증합니다.',
      '삼성이 자사 파운드리(SF4) 기반으로 AI PC SoC를 양산하면 TSMC 의존도를 낮추는 공급망 다변화 효과가 있어, 파운드리 2위 경쟁을 벌이는 삼성과 TSMC 간 기술 격차 해소 여부가 핵심 투자 모니터링 포인트가 됩니다.'
    ],
    isPremiumCuration: true
  },

  // ─── SEMICONDUCTOR ───
  'id_vvbjcv': {
    translatedTitle: '포토닉스 출하 마일스톤 달성한 타워반도체(TSEM), 현재 주가는 저평가 상태인가',
    summary: [
      '타워반도체(TSEM)가 실리콘 포토닉스 기반 광 집적회로(PIC) 대량 출하 마일스톤을 달성했다고 발표했으며, 시장 분석가들은 이 성과가 현재 주가에 충분히 반영되지 않았다는 분석을 내놓고 있습니다.',
      '실리콘 포토닉스는 데이터센터 내 광 인터커넥트(광학 연결) 수요 급증과 AI 가속기 간 초고속 데이터 전송 필요성이 맞물리며 향후 5년간 연평균 30% 이상 성장이 전망되는 시장입니다.',
      '타워반도체는 TowerJazz 합병 이후 아날로그·혼성신호 특화 파운드리로 포지셔닝을 강화했으며, 포토닉스·SiGe·RF 공정에서 독보적인 기술 경쟁력을 보유하고 있습니다.'
    ],
    implications: [
      '실리콘 포토닉스 칩이 AI 데이터센터의 표준 인터커넥트로 채택되는 속도가 가속화될 경우, 동 기술을 주력으로 삼은 특화 파운드리의 밸류에이션 리레이팅이 예상되어 타워반도체는 가치주에서 성장주로의 전환 시나리오를 맞이할 수 있습니다.',
      '인텔, 엔비디아, Broadcom 등 AI 반도체 대기업들이 외부 파운드리에 포토닉스 공정을 위탁하는 추세이므로, 고객사 다변화와 첨단 공정 수주 확대에 성공할 경우 수익성 개선 폭이 기대 이상일 수 있습니다.'
    ],
    isPremiumCuration: true
  },

  'id_gh5nji': {
    translatedTitle: '계측장비 기업 노바(NVMI), 글로벌파운드리 어드밴스드 패키징 공정 툴오브레코드 수주',
    summary: [
      '반도체 공정 계측 전문 기업 노바(Nova, NVMI)가 글로벌파운드리(GlobalFoundries)의 첨단 패키징(Advanced Packaging) 생산 라인에서 공정 제어 장비 분야의 핵심 지위인 TOR(Tool of Record, 툴오브레코드)를 획득했습니다.',
      'TOR 선정은 단순 납품을 넘어 해당 고객사의 특정 공정 라인에서 독점적 표준 장비로 채택됨을 의미하며, 안정적인 반복 수주와 장기 유지보수 계약으로 이어지는 반도체 장비 업계의 핵심 수주 유형입니다.',
      '어드밴스드 패키징(HBM, 2.5D/3D, 칩렛)은 AI 가속기 성능 향상의 핵심 기술로 부상하며 엔비디아·AMD·인텔 등 AI 칩 기업의 발주가 폭증하고 있어, 관련 패키징 공정 장비 수요 역시 구조적 성장 국면에 진입했습니다.'
    ],
    implications: [
      '노바의 어드밴스드 패키징 계측 장비 TOR 수주는 HBM3E·CoWoS 패키징 공정으로 확장될 수 있는 교두보 확보로, 동사의 백엔드(Back-End) 장비 매출 비중 확대와 마진 개선으로 이어질 전망입니다.',
      '반도체 제조의 패러다임이 2D 미세화 한계를 넘어 3D·칩렛 패키징으로 이동함에 따라, 계측·검사 장비 전문 기업들의 중요성이 전공정 장비 기업 못지않게 부각되며 밸류에이션 갭 해소가 기대됩니다.'
    ],
    isPremiumCuration: true
  },

  'id_1wtl4l7': {
    translatedTitle: 'TSMC, Q2 실적 낙관론으로 적정주가 대비 9% 프리미엄 평가... 매수 vs 관망 논쟁',
    summary: [
      '시장 분석 플랫폼 Simply Wall St.에 따르면, TSMC(TSM)의 현재 주가가 DCF(현금흐름할인) 기반 적정 가치 추정치보다 약 9% 높은 프리미엄 상태이며, 이는 2분기 실적에 대한 시장의 강한 낙관론을 이미 선반영하고 있음을 의미합니다.',
      'TSMC는 AI 가속기 수요에 힘입어 CoWoS 및 N3(3나노) 공정 주문이 역대 최고치를 경신 중이며, 2분기 매출 가이던스는 달러 기준 전년 동기 대비 40% 이상 성장이 예상됩니다.',
      '그러나 엔비디아·애플·AMD에 대한 고객 집중 리스크, 미·중 지정학적 갈등에 따른 공급망 불확실성, 그리고 경쟁사(삼성·인텔)의 추격 등 밸류에이션 조정 요인도 상존합니다.'
    ],
    implications: [
      '단기 차익을 노리는 투자자에게는 이미 낙관론이 반영된 현재 주가 수준에서의 추가 진입이 리스크 대비 수익률 측면에서 불리할 수 있으나, 장기 AI 인프라 투자 관점에서는 TSMC의 기술적 해자(Moat)가 지속 유효합니다.',
      'TSMC 실적 발표(7월 중순 예정)가 AI 반도체 공급망 전체의 방향성을 가늠하는 중요한 이정표가 될 것이며, 실적 서프라이즈 여부에 따라 엔비디아·ASML·SK하이닉스 등 AI 밸류체인 전반의 주가 향방이 결정될 것입니다.'
    ],
    isPremiumCuration: true
  }

};

let injected = 0;
for (const id in analyses) {
  if (archive[id]) {
    archive[id].aiAnalysis = analyses[id];
    archive[id].isCurated = true;
    injected++;
    console.log(`✅ 주입 완료: [${archive[id].followingIndustry}] ${archive[id].title.substring(0, 60)}`);
  } else {
    console.warn(`⚠️ 아카이브에 없는 ID: ${id}`);
  }
}

fs.writeFileSync(path.join(__dirname, '..', 'news-archive.json'), JSON.stringify(archive, null, 2), 'utf8');
console.log(`\n🎉 총 ${injected}건 프리미엄 분석 주입 완료.`);
