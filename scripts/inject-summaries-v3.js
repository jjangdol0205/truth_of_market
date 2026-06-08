const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const ARCHIVE_FILE = path.join(ROOT_DIR, 'news-archive.json');
const CACHE_FILE = path.join(ROOT_DIR, 'ai-cache.json');

// 1. 핵심 요약 데이터 및 분석 내용 정의
const analyses = {
  // [금융위 4대은행 소집 대책 회의]
  "id_jk8g2z": {
    "translatedTitle": "원·달러 환율 17년 만에 최고치 기록…금융위, 오후 4대 시중은행 소집 긴급 대책 논의",
    "summary": [
      "원·달러 환율이 글로벌 금융위기 이후 17년 만에 최고치로 폭등하자 금융위원회가 오늘 오후 4대 시중은행(KB국민, 신한, 하나, 우리) 자금 부서장들을 긴급 소집했습니다.",
      "이번 긴급 회의는 은행권의 외화 유동성 상황을 점검하고, 급격한 달러 쏠림 현상을 방어하기 위한 선물환 매도 협조 및 시장 유동성 안정화 대책을 논의하기 위해 마련되었습니다.",
      "외환당국은 시중은행들의 투기성 달러 매수를 자제시키고 기업들의 수출대금(달러) 조기 환전을 독려하는 등 가용한 시장 안정 수단을 모두 동원할 계획입니다."
    ],
    "implications": [
      "금융당국이 시중은행들까지 소집해 직접적인 구두 경고 및 협조 조치에 나선 것은 환율 변동성이 임계치에 도달했음을 보여주는 강력한 위험 신호입니다.",
      "고환율 압박에 대응하여 단기적으로 외화 유동성 확보가 절실하므로 외화 자산(달러 예금, 단기 외화 채권)을 일정 비중 이상 유지하여 원화 절하 리스크에 헤지할 필요가 있습니다."
    ]
  },
  // [신영증권 김학균 센터장 진단]
  "id_v5xpnf": {
    "translatedTitle": "[증시 긴급진단] 신영증권 리서치센터장 '매크로 발작보다는 시장의 단기 과열에 따른 심리 위축이 본질'",
    "summary": [
      "신영증권 김학균 리서치센터장은 최근 주가 폭락에 대해 실질적인 채권 금리 발작(급등)은 나타나지 않았으며, 증시가 고점 부담 속에 과도하게 선제적으로 반응해 하락한 장세라고 분석했습니다.",
      "연준의 금리 전망 변화가 증시에 미치는 영향력은 한계에 달했으며, 오히려 빅테크 기업들의 밸류에이션 부담이 차익 실현 욕구를 자극하고 있다는 해석입니다.",
      "현 시점은 경기 침체나 금융 시스템 붕괴와 같은 본질적 위기가 아니기 때문에 과도한 투매 동참은 지양해야 한다고 권고했습니다."
    ],
    "implications": [
      "거시경제의 펀더멘탈 붕괴 리스크가 아니므로, 이번 조정을 성장 잠재력이 큰 업종을 저렴하게 매수할 수 있는 장기 포트폴리오 재편 기회로 활용할 만합니다.",
      "다만 투심 안정화에는 다소 시간이 소요될 수 있으므로, 분할 매수 관점에서 현금 비중을 유지하며 천천히 진입 가격대를 넓혀가는 전략이 유효합니다."
    ]
  },
  // [외환보유고 감소]
  "id_5gezsy": {
    "translatedTitle": "1560원 뚫린 환율에 외환보유고 1.6조 원 급감…'달러 방파제' 약화 우려",
    "summary": [
      "원·달러 환율이 1560원을 터치하는 긴박한 국면에서, 외환당국이 시장 안정화(달러 매도 개입)를 단행하며 올해 들어 외환보유고가 1.6조 원 이상 급감했습니다.",
      "글로벌 강달러 장기화 여파로 주요국 통화 표시 자산의 달러 환산 가치마저 하락하여 외환보유고 총액 감소세를 더욱 가속화하고 있습니다.",
      "학계와 시장 전문가들은 국가 신용도를 지탱하는 최종 방어선인 외환보유액의 안정적 관리 수준에 대한 모니터링이 필요하다고 지적합니다."
    ],
    "implications": [
      "외환보유고 감소 속도가 빨라지면 국가 신용 위험 스프레드가 상승하여 국내 기업들의 해외 자본 조달 비용이 증가할 리스크가 있습니다.",
      "대외 신인도 우려에 대응하기 위해 현금 포트폴리오의 달러 비중을 선제적으로 지켜내고 원화 편향성에서 벗어나는 환 헤지 전략을 지속 유지하십시오."
    ]
  }
};

// 2. 추가적인 중복 뉴스 매핑
const duplicatesMapping = {
  "id_hjbbm1": "id_dif3vc",
  "id_3im7vv": "id_dif3vc",
  "id_vlfav4": "id_dif3vc",
  "id_iwlffc": "id_dif3vc",
  "id_a0uy15": "id_10uhwxr",
  "id_1sxoe9h": "id_pobqgg"
};

function run() {
  const archive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
  const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));

  let updatedCount = 0;
  let mappedCount = 0;

  // 1. 핵심 요약 직접 업데이트
  for (const [id, val] of Object.entries(analyses)) {
    if (archive[id]) {
      archive[id].aiAnalysis = val;
      updatedCount++;
    }
    if (cache[id]) {
      cache[id].aiAnalysis = val;
    } else if (archive[id]) {
      cache[id] = archive[id];
    }
  }

  // 2. 중복 기사들에 타겟 기사의 요약 적용 (모두 동일 품질로 요약 완료되도록 매핑)
  for (const [dupId, targetId] of Object.entries(duplicatesMapping)) {
    // targetId가 v2나 v3에 존재하므로, 아카이브에서 해당 타겟 기사의 aiAnalysis를 가져와 적용
    const targetArticle = archive[targetId] || cache[targetId];
    if (targetArticle && targetArticle.aiAnalysis) {
      if (archive[dupId]) {
        archive[dupId].aiAnalysis = targetArticle.aiAnalysis;
        mappedCount++;
      }
      if (cache[dupId]) {
        cache[dupId].aiAnalysis = targetArticle.aiAnalysis;
      } else if (archive[dupId]) {
        cache[dupId] = archive[dupId];
      }
    }
  }

  fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(archive, null, 2), 'utf8');
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  console.log(`✅ Inject complete: updated ${updatedCount} articles. Mapped ${mappedCount} duplicate articles.`);
}

run();
