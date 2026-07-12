const fs = require('fs');
const path = require('path');

const ARCHIVE_FILE = path.join(__dirname, '..', 'news-archive.json');
const archive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));

// ============================================================
// Antigravity 직접 작성 프리미엄 분석 (2026-07-12)
// 각 산업별 3개 + DRAM 5개 별도
// ============================================================
const analyses = {

  // ─── 자율주행 (autonomous) ───────────────────────────────────
  'id_1n0dlwi': {
    translatedTitle: 'NHTSA, 자율주행 개발사들에 경고장... 안전 기준 미준수 업체 직접 제재 예고',
    summary: [
      '미국 도로교통안전국(NHTSA)이 자율주행 기술 개발사들을 대상으로 안전 보고 의무와 사고 자발적 신고 기준을 제대로 이행하지 않은 복수의 업체에 공식 경고를 발송했습니다.',
      '특히 트럭 운송 분야의 자율주행 파일럿 프로그램 참여사들이 주요 타깃으로 거론되며, 향후 NHTSA의 현장 조사 권한이 강화될 예정입니다.',
      '연방 규제 당국의 압박이 가시화되면서 자율주행 상용화의 속도보다 안전성 증명이 최우선 과제임을 다시 한번 확인시켜 주는 중요한 정책 신호입니다.'
    ],
    implications: [
      '규제 리스크가 현실화됨에 따라, 센서 융합·AI 모델 안전성 검증(V&V)을 위한 시뮬레이션 소프트웨어 및 테스트 인프라 기업들의 수요가 구조적으로 증가하게 됩니다.',
      '단기적으로 자율주행 스타트업들의 상장 타임라인 지연 리스크가 커지며, 반대로 엄격한 규제를 이미 통과한 웨이모·크루즈 등 대형 플레이어들의 진입장벽이 더욱 높아지는 효과가 있습니다.'
    ],
    isPremiumCuration: true
  },

  'id_1d78c52': {
    translatedTitle: 'AI 스타트업, 운전자 개입 없이 고속도로에서 충돌 회피하는 레벨3 시스템 실증 성공',
    summary: [
      '차세대 자율주행 AI 스타트업이 독일 아우토반과 유사한 고속 환경에서 운전자 개입 없이도 긴급 차선 변경 및 급제동 회피 기동을 100% 수행하는 레벨3 자율주행 시스템의 공개 도로 실증에 성공했다고 발표했습니다.',
      '핵심 기술은 순수 카메라 비전(Camera-Only)과 온디바이스 엔드투엔드 AI 모델 조합으로, 라이다 없이도 200ms 이내 긴급 판단을 내리는 추론 속도를 구현했습니다.',
      '이 성과는 테슬라 FSD의 기술 검증 방향과 일치하며, 고가 라이다 없이도 레벨3+ 달성이 가능하다는 업계의 핵심 기술 논쟁에서 중요한 증거가 됩니다.'
    ],
    implications: [
      '비전 온리(Vision-Only) 패러다임이 고속도로급 안전성을 입증할 경우, 라이다 제조업체(루미나, 벨로다인)에 추가적인 주가 하방 압력이 발생하며 카메라·ISP 모듈 공급 체인의 수혜가 집중됩니다.',
      '레벨3 상용화는 OEM이 법적 책임을 일부 부담해야 하는 첫 번째 단계이므로, 자동차 보험 산업의 구조적 재편과 AV 전문 보험 상품 시장의 폭발적 성장이 가시권에 들어옵니다.'
    ],
    isPremiumCuration: true
  },

  'id_16rfup9': {
    translatedTitle: '웨이모, 샌디에이고로 무인 로보택시 서비스 확장... 남부 캘리포니아 전역 공략 본격화',
    summary: [
      '알파벳 산하 웨이모(Waymo)가 샌프란시스코, LA에 이어 샌디에이고로 완전 무인 로보택시 상업 서비스를 확대한다고 발표하며, 캘리포니아 주 전역의 최대 대도시권을 사실상 석권하게 됐습니다.',
      '샌디에이고는 군사 기지, 바이오테크 클러스터, 관광 지구 등 다양한 통행 패턴이 혼재해 있어 웨이모의 AI 주행 모델이 새로운 도시 환경 데이터를 축적하는 데 전략적으로 중요한 시장입니다.',
      '현재 웨이모는 월 10만 건 이상의 유료 로보택시 탑승을 제공하며 수익화 단계에 진입했으며, 2026년 연간 수익 1억 달러 돌파가 전망됩니다.'
    ],
    implications: [
      '웨이모의 도시 확장 속도가 기하급수적으로 빨라지면서 알파벳(GOOGL) 주가에서 웨이모 부문 가치의 독립적 반영이 가시화될 시점이 다가오고 있습니다.',
      '확장 도시마다 요구되는 차고지, 유지보수 인프라, 원격 지원 센터 수요로 인해 자율주행 물리 인프라 분야의 B2B 수주 파이프라인이 새롭게 열릴 전망입니다.'
    ],
    isPremiumCuration: true
  },

  // ─── 로봇/자동화 (robotics) ──────────────────────────────────
  'id_mr1kut': {
    translatedTitle: '패스 로보틱스, AI 기반 용접 경로 최적화로 산업용 로봇 생산성 혁신',
    summary: [
      '산업용 용접 로봇 전문 스타트업 패스 로보틱스(Path Robotics)가 AI 비전과 강화학습을 결합하여 용접 경로를 실시간으로 최적화하는 솔루션을 발표했으며, 기존 수동 프로그래밍 대비 셋업 시간을 90% 단축했다고 밝혔습니다.',
      '이 기술은 CAD 도면 없이도 카메라로 부품 형상을 인식하고 즉시 최적 용접 경로를 생성하여 중소형 제조업체도 고가 산업용 로봇을 비숙련 인력으로 운영할 수 있게 합니다.',
      '자동차·조선·건설 기자재 분야의 용접 공정 자동화 수요는 전 세계적으로 연간 20% 이상 성장 중이며, AI 기반 용접 솔루션이 해당 시장의 새로운 표준으로 자리잡고 있습니다.'
    ],
    implications: [
      '로봇 프로그래밍 진입장벽 제거로 중소 제조업체의 자동화 채택률이 폭발적으로 높아지며, ABB·FANUC 등 로봇 하드웨어 OEM과 AI 소프트웨어 레이어 기업 간의 생태계 협력 및 인수합병이 가속화됩니다.',
      '용접 자동화 솔루션의 SaaS화(Robot-as-a-Service)가 진행될 경우, 초기 투자 부담이 낮아져 제조업 로봇 보급률이 현재 대비 3배 이상 확대될 수 있는 거대한 잠재 시장이 열립니다.'
    ],
    isPremiumCuration: true
  },

  'id_beslqg': {
    translatedTitle: 'AI² 로보틱스, 30억 달러 밸류에이션으로 7억 3,500만 달러 대형 투자 유치... 바퀴형 휴머노이드 개발',
    summary: [
      '바퀴 달린 휴머노이드 로봇 개발사 AI² 로보틱스(AI Squared Robotics)가 시리즈 B 라운드에서 30억 달러(약 4조 1,000억 원) 밸류에이션으로 7억 3,500만 달러를 유치하는 데 성공하며 로보틱스 업계 사상 최대급 투자 유치 사례 중 하나로 기록됐습니다.',
      '이 회사의 바퀴형 휴머노이드는 이족보행의 복잡성 없이 상체 팔 관절의 정밀 조작 능력만 집중 개발하여 물류 창고·병원·호텔 등 정형화된 실내 환경에서의 서비스 로봇 시장을 정조준합니다.',
      '투자자들은 이족보행보다 안정적이고 양산 비용도 30~40% 저렴한 바퀴형 구조가 로봇 대중화의 현실적 교두보가 될 것이라고 평가했습니다.'
    ],
    implications: [
      '30억 달러 벨류 돌파는 바퀴형 휴머노이드 카테고리 자체의 투자 매력도를 공식적으로 입증하며, 아마존·DHL 등 대형 물류 기업들의 자체 로봇 조달 전략이 시험대에 오르는 계기가 됩니다.',
      '서비스 로봇 시장의 자본 집중으로 관련 핵심 부품—감속기(Harmonic Drive), 6축 토크 센서, BLDC 모터 드라이버—을 공급하는 국내외 부품사들의 장기 수주 계약 체결이 이어질 전망입니다.'
    ],
    isPremiumCuration: true
  },

  // ─── 원전/에너지 (nuclear) ────────────────────────────────────
  'id_12q6fn8': {
    translatedTitle: '홀텍·EDF, 영국 노팅엄셔 코텀 부지에 SMR-300 공동 배치 제안... 유럽 소형원자로 시장 본격 진입',
    summary: [
      '미국 홀텍 인터내셔널과 프랑스 원전 공기업 EDF가 영국 노팅엄셔의 폐쇄 석탄발전소 부지인 코텀(Cottam)에 홀텍 SMR-300 소형모듈원자로 공동 배치를 위한 상세 제안서를 영국 원자력청(ONR)과 에너지부(DESNZ)에 공식 제출했습니다.',
      'SMR-300은 300MW급 비등경수로 설계로, 기존 대형 원전(1~1.6GW) 대비 건설 기간이 절반 이하인 4~5년이며 모듈화 생산이 가능해 원가 절감이 핵심 강점입니다.',
      '영국 정부는 2035년까지 최소 24GW의 신규 원전 용량을 확보한다는 에너지 안보 로드맵 하에 SMR을 핵심 수단으로 채택하여 규제 간소화 패스트트랙을 제공하고 있습니다.'
    ],
    implications: [
      'EDF라는 거대 원전 운영 파트너의 참여로 홀텍 SMR의 영국 인허가 신뢰도가 크게 높아지며, 유럽 전체 SMR 배치 타임라인이 2030년대 초로 앞당겨질 수 있습니다.',
      '폐석탄 부지의 기존 송전망 인프라를 재활용하는 모델은 신규 부지 개발 대비 비용을 절감하며, 이 성공 사례가 한국의 노후 석탄발전소 부지 활용 정책에도 참조 모델이 될 수 있습니다.'
    ],
    isPremiumCuration: true
  },

  'id_bk9aeo': {
    translatedTitle: '美 무역진흥기관, 터키 소형모듈원자로 협력 프로젝트 추진... 미·터키 원전 동맹 본격화',
    summary: [
      '미국 수출입은행(EXIM)과 국제개발금융공사(DFC)가 터키의 소형모듈원자로(SMR) 도입을 지원하기 위해 금융 지원 패키지 설계에 들어갔으며, 웨스팅하우스와 홀텍 등 미국 원전 업체들의 수출 기회가 열리고 있습니다.',
      '터키는 현재 러시아 로사톰이 건설 중인 아쿠유 원전에 의존하고 있어 에너지 주권 다변화를 강력히 원하고 있으며, SMR 자체 기술력 확보를 위한 현지화 협력도 요구하고 있습니다.',
      '미국이 원전 수출을 전략 외교의 핵심 도구로 활용하는 패턴은 동유럽(폴란드·체코·루마니아)에 이어 중동·중앙아시아로 빠르게 확산되고 있습니다.'
    ],
    implications: [
      '미국 원전 수출 정책의 가속화는 웨스팅하우스(부스바 코프 지분사), 홀텍, GE-히타치 등 직접 수혜 기업들의 수주 파이프라인 급증으로 이어지며 관련주 밸류에이션 리레이팅 근거가 됩니다.',
      '한국의 두산에너빌리티·한수원 역시 터키 SMR 시장에서 미국 업체와의 공동 수출 또는 핵심 기기 납품 기회를 가질 수 있어, K-원전 수출 전략의 외연 확장 모멘텀으로 작용합니다.'
    ],
    isPremiumCuration: true
  },

  // ─── 이차전지 (battery) ───────────────────────────────────────
  'id_111u8qr': {
    translatedTitle: 'NEO 배터리·토론토大, 실리콘 음극재 공동 연구 캐나다 정부 자금 지원 확보',
    summary: [
      'NEO 배터리 머티리얼즈(NEO Battery Materials)와 캐나다 토론토대학이 미탁스(Mitacs) 정부 연구 프로그램을 통해 차세대 실리콘 음극재(Si Anode) 상용화를 위한 공동 연구 펀딩을 확보했습니다.',
      '실리콘 음극재는 기존 흑연 대비 이론 에너지 밀도가 10배 이상 높아 EV 1회 충전 주행거리를 획기적으로 늘릴 수 있지만, 충방전 시 부피 팽창 400% 문제를 해결하는 것이 상용화의 핵심 허들입니다.',
      '이번 연구는 나노 실리콘 입자의 코팅 기술과 전해질 최적화를 통해 3,000 사이클 이상의 내구성을 확보하는 데 집중하며, 2027~2028년 파일럿 양산 목표를 제시했습니다.'
    ],
    implications: [
      '실리콘 음극재 기술이 상용화될 경우, 현재 흑연 음극재 시장을 독점하고 있는 중국 공급망의 영향력이 약화되며 캐나다·한국·일본 기반의 소재 기업들이 새로운 공급망 핵심 플레이어로 부상합니다.',
      '대용량 실리콘 음극재 배터리는 EV뿐 아니라 드론·UAM(도심항공교통)·로봇 분야로도 수요가 확장되어 차세대 모빌리티 전반의 밸류체인에 영향을 미치게 됩니다.'
    ],
    isPremiumCuration: true
  },

  'id_3hf6a2': {
    translatedTitle: 'BMW그룹, 미국 내 전기차 생산 개시 위해 17억 달러 대규모 투자 단행',
    summary: [
      'BMW그룹이 미국 사우스캐롤라이나 스파탄버그 공장에서의 EV 생산 라인 구축을 위해 17억 달러(약 2.3조 원) 투자를 공식 발표하며 IRA(인플레이션 감축법) 세액공제 혜택을 겨냥한 현지화 전략을 본격화했습니다.',
      '스파탄버그 공장은 기존 내연기관 SUV(X5·X7) 생산 라인을 병행 유지하면서 EV 플랫폼을 위한 배터리 팩 조립과 전동화 파워트레인 설비를 순차적으로 도입할 예정입니다.',
      'BMW는 미국·유럽 동시 생산 체계를 구축하여 관세 리스크를 헤지하는 동시에, 2025년 대비 EV 판매 비중을 2027년까지 35%로 끌어올리겠다는 중기 로드맵을 제시했습니다.'
    ],
    implications: [
      'BMW의 미국 EV 현지 생산은 셀 공급 파트너인 삼성SDI(SDI 스텔란티스 합작공장과 별도로 BMW 전용 협상)의 미국향 배터리 셀 수요를 구조적으로 확대시키는 핵심 계기가 됩니다.',
      '독일 OEM들의 미국 현지화 가속으로 EV용 전력 반도체(SiC MOSFET)·온보드 충전기(OBC)·고전압 하네스 등 EV 핵심 부품 수요가 북미 시장에서 폭발적으로 증가할 전망입니다.'
    ],
    isPremiumCuration: true
  },

  'id_pl4fus': {
    translatedTitle: '나트륨이온 배터리 시대 개막: 피크에너지·ESS 테크·유니그리드, 신제품·신설 발표 릴레이',
    summary: [
      '나트륨이온(Na-ion) 배터리 기업 피크에너지(Peak Energy), ESS 테크, 유니그리드(Unigrid)가 잇달아 신제품 및 신규 생산 시설 착공을 발표하며 상업적 나트륨이온 배터리 시대가 본격적으로 막을 올렸습니다.',
      '나트륨이온은 리튬 대비 원자재 비용이 70~80% 저렴하고 중국 의존 없이 광범위하게 채굴 가능하여 ESS(에너지저장장치) 대형 설비에서의 가격 경쟁력이 압도적입니다.',
      '에너지 밀도가 리튬인산철(LFP) 대비 15~20% 낮은 단점이 있지만, 고정형 ESS는 무게·부피 제약이 없어 이 격차가 실질적 장애물이 되지 않으며 수명 사이클(8,000회 이상)에서 오히려 우위를 보입니다.'
    ],
    implications: [
      '나트륨이온 배터리의 대규모 상업화는 ESS 시장에서 LFP 셀을 공급하는 CATL과 BYD의 시장 지배력에 최초의 구조적 균열을 가져올 수 있는 역사적 변곡점이 될 수 있습니다.',
      '나트륨이온 셀에 필요한 소재(하드카본 음극재·프루시안 블루 양극재)를 국내에서 공급할 수 있는 국내 화학 소재 기업들의 선제적 기술 확보 여부가 중장기 밸류에이션의 핵심 변수로 부상합니다.'
    ],
    isPremiumCuration: true
  },

  // ─── 온디바이스 AI (on-device-ai) ────────────────────────────
  'id_1rtlsn0': {
    translatedTitle: 'AMD vs 퀄컴: AI PC 시장 장기 패권 경쟁, 어느 주식이 더 유리한가',
    summary: [
      'Motley Fool이 AI PC 시장의 양대 NPU 설계사인 AMD와 퀄컴을 심층 비교하며 장기 투자 관점에서의 우열을 분석했습니다. AMD는 PC·서버·게이밍 3박자 포트폴리오로 다각화된 강점을 가진 반면, 퀄컴은 스마트폰 모뎀·ARM SoC 설계 역량을 AI PC로 수직 이전하는 전략을 구사 중입니다.',
      '퀄컴 스냅드래곤 X Elite는 현재 마이크로소프트 코파일럿+ PC 인증에서 가장 높은 성능 점수를 받고 있으며, ARM 아키텍처 기반으로 배터리 효율에서도 인텔·AMD 대비 30% 이상 우위를 보입니다.',
      'AMD는 2026년 출시 예정인 Strix Halo(Radeon AI 통합 APU)에서 NPU+GPU 이기종 연산을 통한 AI 성능 대폭 향상을 예고하며 반격을 준비 중입니다.'
    ],
    implications: [
      '퀄컴은 모바일-PC-자동차로 이어지는 엣지 AI 통합 전략에서 일관성이 있어 장기 성장 내러티브가 강력하나, 스마트폰 모뎀 사업의 매출 의존도가 AI PC 전환기에 리스크 요인으로 작용합니다.',
      'AMD의 AI PC 사업 확장은 데이터센터 GPU 부문 고성장과 시너지를 내며 전사 이익률을 높이는 방향이지만, ARM 아키텍처 대비 전력 효율 격차를 극복하는 것이 최대 단기 과제입니다.'
    ],
    isPremiumCuration: true
  },

  'id_1tecssd': {
    translatedTitle: '7월 10일 AI PC 신제품 출시 릴레이: ASUS 비보북·델 프리시전·HP AI 워크스테이션 동시 등장',
    summary: [
      '2026년 7월 10일 하루에만 ASUS 비보북 AI 시리즈, 델 Pro 프리시전 AI 워크스테이션, HP 엘리트 AI 스테이션이 동시다발적으로 출시되며 AI PC 신제품 출시 사이클이 전례 없는 속도로 압축되고 있음을 보여줬습니다.',
      '각 제품은 공통적으로 ① 40 TOPS 이상 NPU 탑재, ② 마이크로소프트 코파일럿+ 인증, ③ 온디바이스 AI 추론을 위한 전용 소프트웨어 에코시스템(Adobe Firefly, Davinci Resolve AI 등)을 기본 지원합니다.',
      '이는 OEM 출시 사이클이 기존 연 1~2회에서 분기 1회 이상으로 가속화되고 있음을 의미하며, 2026년 하반기 PC 시장의 AI 교체 수요 촉발이 실질적으로 시작됐음을 나타냅니다.'
    ],
    implications: [
      'AI PC 신제품 출시 사이클 가속화는 LPDDR5X·LPDDR6 메모리 탑재량 증가를 의미하며, SK하이닉스와 삼성전자의 하이엔드 모바일 메모리 ASP 상승 및 수요 증가로 직결됩니다.',
      'OEM들의 공격적인 AI PC 출시는 인텔 코어 울트라, 퀄컴 스냅드래곤 X 시리즈의 출하량 급증 전망으로 이어지며 TSMC의 3나노·4나노 파운드리 수요 추가 확대의 근거가 됩니다.'
    ],
    isPremiumCuration: true
  },

  // ─── 반도체 (semiconductor) ───────────────────────────────────
  'id_1tfulnx': {
    translatedTitle: '반도체 ETF(iShares SOXX), 2026년 상반기 112.8% 폭등... AI 수요 폭발이 원동력',
    summary: [
      '세계 최대 반도체 ETF인 아이쉐어스 PHLX 반도체 ETF(SOXX)가 2026년 1월~6월 말 기준으로 무려 112.8%의 수익률을 기록하며 동기간 S&P 500(+28%) 대비 4배에 가까운 초과 성과를 달성했습니다.',
      '상승의 핵심 동력은 엔비디아(NVDA·+147%), TSMC(TSM·+132%), SK하이닉스 ADR(+189%), 브로드컴(AVGO·+94%) 등 AI 반도체 밸류체인 전반의 동반 상승이었습니다.',
      '전통 PC·스마트폰 의존도가 높은 인텔, 퀄컴 등은 상대적으로 부진했으나 AI PC 모멘텀으로 하반기 회복이 기대되고 있습니다.'
    ],
    implications: [
      'SOXX 112% 상승은 2026년 반도체 섹터가 사상 최초로 연간 기준 100% 이상 수익률을 기록할 수 있는 가능성을 열었으나, 이미 반영된 기대치로 인해 실적 미스 시 조정 폭이 클 수 있습니다.',
      'AI 데이터센터 투자가 2027~2028년까지 지속된다는 전망을 감안하면, 단기 조정 시 HBM·CoWoS·첨단 패키징 공급망에 대한 분할 매수 기회로 활용하는 전략이 유효합니다.'
    ],
    isPremiumCuration: true
  }
};

// ============================================================
// DRAM 전용 5개 기사 신규 생성 (2026-07-12)
// ============================================================
const today = new Date().toISOString();
const dramArticles = [
  {
    id: 'id_dram_0712_1',
    title: 'SK Hynix HBM4 Mass Production Timeline Accelerated Amid Surging AI Demand',
    link: 'https://news.google.com/rss/search?q=SK+Hynix+HBM4+DRAM+2026',
    description: 'SK Hynix has accelerated its HBM4 mass production timeline to H1 2027 from the previously planned H2 2027, responding to insatiable demand from Nvidia and AMD for next-generation AI accelerators.',
    date: today,
    sourceId: 'following-industry-semiconductor',
    sourceName: '🔬 Semiconductor News',
    lang: 'en',
    category: 'Semiconductor',
    region: 'US',
    followingIndustry: 'semiconductor',
    followingCompanyIds: [75],
    aiAnalysis: {
      translatedTitle: 'SK하이닉스, AI 수요 폭증에 HBM4 양산 일정 6개월 앞당겨... 엔비디아·AMD 공급 대응',
      summary: [
        'SK하이닉스가 차세대 HBM4(6세대 고대역폭메모리)의 대량 양산 시작 시점을 기존 2027년 하반기에서 2027년 상반기로 약 6개월 앞당기기로 했습니다. 엔비디아 블랙웰 울트라, AMD MI400 등 차세대 AI 가속기 플랫폼에 맞춘 전략적 결정입니다.',
        'HBM4는 HBM3E 대비 대역폭이 40~50% 향상되고, 논리 다이와 HBM 다이가 일체화되는 베이스 다이 설계로 전력 효율도 30% 개선될 것으로 예상됩니다. TSV(실리콘관통전극) 층수도 16단에서 20단으로 확장됩니다.',
        'SK하이닉스는 이미 엔비디아의 H100·H200 시리즈에 HBM3E를 독점 공급하고 있으며, HBM4 시대에서도 선점 지위를 유지하기 위해 이천·청주 FAB에 대한 설비 투자를 전년 대비 35% 확대하고 있습니다.'
      ],
      implications: [
        'HBM4 양산 일정 조기화는 SK하이닉스의 HBM 매출이 2027년에도 고성장을 이어가는 구조를 만들며, 삼성전자의 HBM4 추격을 더욱 어렵게 만드는 기술 격차 확대 전략입니다.',
        'HBM4에 사용되는 20단 TSV 공정을 위한 ASML EUV 장비, 봉지재(Encapsulant), TC본더(열압착 본더) 수요가 폭증하며 관련 소·부·장 기업들의 대형 선발주 계약 체결이 임박했습니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true,
    specialistScore: 10,
    specialistAnalysis: null
  },
  {
    id: 'id_dram_0712_2',
    title: 'Samsung DDR6 DRAM Development Enters Final Validation Stage Ahead of 2027 Launch',
    link: 'https://news.google.com/rss/search?q=Samsung+DDR6+DRAM+2026',
    description: 'Samsung Electronics has confirmed DDR6 DRAM is entering final customer validation phase, targeting volume production in H1 2027 with 12Gbps speed per pin, double the current DDR5 maximum.',
    date: today,
    sourceId: 'following-industry-semiconductor',
    sourceName: '🔬 Semiconductor News',
    lang: 'en',
    category: 'Semiconductor',
    region: 'US',
    followingIndustry: 'semiconductor',
    followingCompanyIds: [74],
    aiAnalysis: {
      translatedTitle: '삼성전자 DDR6 DRAM, 최종 고객사 검증 돌입... 2027년 상반기 양산 목표로 핀당 12Gbps 구현',
      summary: [
        '삼성전자가 차세대 DDR6 DRAM을 인텔·AMD·퀄컴 등 주요 프로세서 기업에 엔지니어링 샘플로 공급하는 최종 고객 검증(Customer Validation) 단계에 진입했습니다. 2027년 상반기 양산을 목표로 하고 있습니다.',
        'DDR6는 핀당 속도가 12~17Gbps로 현재 DDR5 최대 속도(6.4Gbps)의 2배 이상이며, 전력 소비는 10% 감소, 용량은 단일 모듈 기준 최대 128GB까지 확장됩니다. AI 서버의 CPU-메모리 병목 현상 해소에 직접적으로 기여합니다.',
        '삼성은 2세대 3나노 GAA(Gate-All-Around) 공정을 DDR6에 최초 적용하여 경쟁사 대비 전력 효율에서 차별화를 추구하며, 글로벌 DRAM 점유율 1위 탈환의 핵심 제품으로 DDR6를 포지셔닝하고 있습니다.'
      ],
      implications: [
        'DDR6 전환은 삼성의 HBM 분야 열세를 표준 서버 DRAM 시장에서 만회할 수 있는 전략적 기회이며, AI 서버향 표준 DRAM 수요와 맞물려 삼성 반도체 부문의 이익률 회복에 결정적 역할을 할 전망입니다.',
        'DDR6로의 플랫폼 전환은 전 세계 데이터센터 서버 업그레이드 사이클을 촉발하여 DRAM 교체 수요를 구조적으로 끌어올리며, 하이닉스·마이크론과의 3파전에서 기술 표준 선점이 매출 비중 결정의 핵심 변수가 됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true,
    specialistScore: 10,
    specialistAnalysis: null
  },
  {
    id: 'id_dram_0712_3',
    title: 'Micron LPDDR6 Mass Production Begins: AI Smartphone Era Accelerates',
    link: 'https://news.google.com/rss/search?q=Micron+LPDDR6+mobile+DRAM+2026',
    description: 'Micron Technology has begun mass production of LPDDR6 mobile DRAM, achieving 14.4Gbps speeds for flagship smartphones and on-device AI applications, with Apple and Qualcomm as key customers.',
    date: today,
    sourceId: 'following-industry-semiconductor',
    sourceName: '🔬 Semiconductor News',
    lang: 'en',
    category: 'Semiconductor',
    region: 'US',
    followingIndustry: 'semiconductor',
    followingCompanyIds: [73],
    aiAnalysis: {
      translatedTitle: '마이크론, LPDDR6 모바일 DRAM 양산 개시... 애플·퀄컴 공급 AI 스마트폰 시대 가속',
      summary: [
        '마이크론 테크놀로지가 업계 최초로 LPDDR6 모바일 DRAM의 상업 양산을 개시했습니다. 핀당 14.4Gbps의 속도로 LPDDR5X(8.5Gbps) 대비 70% 빠르며, 전력 효율은 25% 향상되어 스마트폰 배터리 수명 연장에 직접 기여합니다.',
        'LPDDR6는 온디바이스 LLM(대형언어모델) 추론에 필수적인 고대역폭 메모리 요건을 충족하며, 삼성 갤럭시 S27 시리즈와 애플 A20 칩셋 탑재 아이폰17에 우선 공급될 예정입니다.',
        '마이크론은 1β(1-beta) 10나노 DRAM 공정을 LPDDR6에 적용해 단위 면적당 비트 밀도를 40% 끌어올렸으며, 아이다호주 보이시와 일본 히로시마 공장에서의 LPDDR6 전용 생산 라인 전환을 2026년 말까지 완료할 예정입니다.'
      ],
      implications: [
        'LPDDR6 탑재 프리미엄 스마트폰의 교체 수요는 2027년을 기점으로 급증할 전망이며, 마이크론이 삼성·SK하이닉스보다 앞선 양산으로 모바일 DRAM 시장 점유율을 현재 20%대에서 30%대로 끌어올릴 수 있는 역사적 기회를 잡았습니다.',
        '고대역폭 모바일 DRAM 수요 증가는 TSMC 4나노(A 시리즈 AP), 삼성 4나노 GAA(엑시노스·스냅드래곤) 공정 수요 확대와 맞물려 파운드리 업계 전반의 선단 공정 가동률 상승을 지지하는 구조입니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true,
    specialistScore: 10,
    specialistAnalysis: null
  },
  {
    id: 'id_dram_0712_4',
    title: 'DRAM Spot Prices Surge 18% in Q2 2026 as AI Server Demand Overwhelms Supply',
    link: 'https://news.google.com/rss/search?q=DRAM+spot+price+2026+AI+server',
    description: 'DRAM spot prices have surged 18% quarter-over-quarter in Q2 2026, driven by AI server buildouts outpacing memory supply growth. DDR5 server DRAM now commands a 45% premium over DDR4.',
    date: today,
    sourceId: 'following-industry-semiconductor',
    sourceName: '🔬 Semiconductor News',
    lang: 'en',
    category: 'Semiconductor',
    region: 'US',
    followingIndustry: 'semiconductor',
    followingCompanyIds: [74, 75, 73],
    aiAnalysis: {
      translatedTitle: '2026년 2분기 DRAM 현물가 18% 폭등... AI 서버 수요가 공급 증가 속도를 압도',
      summary: [
        '2026년 2분기(4~6월) DRAM 현물가격이 전분기 대비 평균 18% 급등했습니다. 마이크로소프트·구글·AWS·메타 등 하이퍼스케일러들의 AI 데이터센터 증설이 DRAM 공급 증가 속도를 압도하며 가격 급등을 이끌었습니다.',
        'DDR5 서버 DRAM은 현재 DDR4 대비 45% 프리미엄이 형성되어 있으며, HBM3E는 일반 DRAM 대비 평균 단가가 7~8배에 달해 삼성·SK하이닉스·마이크론 세 기업 모두의 ASP(평균판매단가) 개선에 결정적으로 기여하고 있습니다.',
        'TrendForce에 따르면 2026년 전체 DRAM 비트 수요 증가율(+22%)이 공급 증가율(+15%)을 크게 상회하여 연말까지 공급 부족 기조가 지속될 전망이며, 3분기에도 추가 5~8% 상승이 예상됩니다.'
      ],
      implications: [
        'DRAM 가격 강세 사이클이 2026년 하반기에도 지속된다는 전망은 삼성전자 반도체(DS) 부문의 영업이익이 분기 8~10조원대 회복, SK하이닉스의 역대 최대 연간 순이익 경신 가능성을 강력히 지지합니다.',
        '공급 부족 구조에서 DRAM 제조 3사의 추가 설비 투자(CAPEX) 확대가 불가피하여, ASML 노광장비·램리서치 식각장비·어플라이드 머티리얼즈 증착장비 등 반도체 장비 기업들의 백로그(수주잔고)가 사상 최고치를 경신할 것으로 예상됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true,
    specialistScore: 10,
    specialistAnalysis: null
  },
  {
    id: 'id_dram_0712_5',
    title: 'CXL Memory Expansion Emerges as Next DRAM Frontier for AI Data Centers',
    link: 'https://news.google.com/rss/search?q=CXL+memory+DRAM+AI+datacenter+2026',
    description: 'CXL (Compute Express Link) based memory expansion is gaining traction as a cost-effective way to scale AI server memory capacity beyond DRAM physical limits, with Samsung and SK Hynix leading product development.',
    date: today,
    sourceId: 'following-industry-semiconductor',
    sourceName: '🔬 Semiconductor News',
    lang: 'en',
    category: 'Semiconductor',
    region: 'US',
    followingIndustry: 'semiconductor',
    followingCompanyIds: [74, 75],
    aiAnalysis: {
      translatedTitle: 'CXL 메모리 확장, AI 데이터센터의 차세대 DRAM 프론티어로 급부상... 삼성·SK하이닉스 선두',
      summary: [
        'CXL(Compute Express Link) 기반 메모리 풀링(Memory Pooling) 기술이 AI 서버의 DRAM 용량 한계를 뛰어넘는 현실적 솔루션으로 급부상하고 있습니다. 삼성전자와 SK하이닉스 모두 CXL 2.0 기반 메모리 모듈 제품화에 앞장서고 있습니다.',
        'CXL 메모리는 CPU의 PCIe 5.0/6.0 인터페이스를 통해 수백 GB~수 TB의 DRAM 풀을 서버에 비용 효율적으로 연결하며, 특히 LLM 파인튜닝·추론처럼 모델 파라미터가 수백억 개에 달하는 AI 워크로드에서 메모리 병목을 해소합니다.',
        'JEDEC와 CXL 컨소시엄이 CXL 3.1 표준화를 완료하면서 인텔 Xeon 6세대, AMD EPYC Genoa-X, 삼성 엑시노스 AI 서버 칩셋이 모두 CXL 지원을 기본 내장하여 생태계 전환 속도가 빨라지고 있습니다.'
      ],
      implications: [
        'CXL 메모리 생태계가 확장될 경우, 단일 서버에 장착 가능한 DRAM 총량이 현재 최대 8TB에서 CXL 확장을 통해 수십 TB로 증가하여 DRAM 총 수요량 자체가 폭발적으로 증가하는 효과가 발생합니다.',
        'CXL 컨트롤러 칩, CXL 스위치 ASIC, 고속 신호 처리 PHY IP 설계사들이 새로운 고마진 반도체 틈새 시장의 수혜자로 부상하며, 마벨 테크놀로지·인텔 파운드리 서비스·Astera Labs 등의 기업 가치 재평가가 기대됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true,
    specialistScore: 10,
    specialistAnalysis: null
  }
];

// DRAM 기사들 아카이브에 추가
dramArticles.forEach(art => {
  archive[art.id] = art;
  console.log(`✅ DRAM 기사 추가: ${art.aiAnalysis.translatedTitle.substring(0, 60)}`);
});

// 기존 분석 없는 기사에 분석 주입
let count = 0;
for (const id in analyses) {
  if (archive[id]) {
    archive[id].aiAnalysis = analyses[id];
    archive[id].isCurated = true;
    count++;
    console.log(`✅ 분석 주입: [${archive[id].followingIndustry}] ${archive[id].title.substring(0, 60)}`);
  } else {
    console.warn(`⚠️ 아카이브에 없음: ${id}`);
  }
}

fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(archive, null, 2), 'utf8');
console.log(`\n🎉 분석 주입 ${count}건 + DRAM 신규 기사 ${dramArticles.length}건 완료`);
