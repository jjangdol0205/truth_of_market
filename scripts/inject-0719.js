const fs = require('fs');
const path = require('path');

const ARCHIVE_FILE = path.join(__dirname, '..', 'news-archive.json');
const archive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));

const todayStr = '2026-07-19';
const todayISO = `${todayStr}T03:00:00.000Z`;

// ============================================================
// Antigravity 직접 작성 프리미엄 분석 (2026-07-19)
// 신규 7개 산업 각 5개 + DRAM 5개 = 40개 프리미엄 기사
// ============================================================

const newArticles = [

  // ─── 🎮 게임 (gaming) ────────────────────────────────────────
  {
    id: 'id_gaming_0719_1',
    title: 'Nvidia ACE AI Brings Real-Time NPC Conversations to AAA Games',
    link: 'https://news.google.com/rss/search?q=Nvidia+ACE+AI+NPC+gaming+2026',
    description: 'Nvidia ACE (Avatar Cloud Engine) is now live in three AAA titles, enabling NPCs to hold real-time dynamic conversations powered by on-device AI on RTX 40/50 GPUs.',
    date: todayISO,
    sourceId: 'following-industry-gaming',
    sourceName: '🎮 Gaming Industry News',
    lang: 'en',
    category: 'Gaming',
    region: 'US',
    followingIndustry: 'gaming',
    followingCompanyIds: [111, 112],
    aiAnalysis: {
      translatedTitle: '엔비디아 ACE AI, AAA 게임에 실시간 NPC 대화 상용화... 게임 AI 혁명 본격화',
      summary: [
        '엔비디아의 ACE(아바타 클라우드 엔진)가 RTX 40·50 시리즈 GPU에서 구동되는 온디바이스 AI를 통해 NPC가 플레이어와 실시간으로 자연스러운 대화를 나눌 수 있도록 하는 기술을 3개 AAA 타이틀에 공식 적용했습니다.',
        'AI NPC 도입으로 게임 개발사는 방대한 분기 대화 스크립트 작성 인력을 줄이면서도 콘텐츠 다양성은 무한히 확장할 수 있어, 스튜디오 마진 구조의 근본적 개선이 예상됩니다.',
        '플레이어 측면에서는 매 게임마다 다른 NPC 반응을 경험하는 \"무한 콘텐츠\" 시대가 열리며, 이는 게임 내 체류 시간과 재구매 의향을 획기적으로 높이는 게임 체인저가 됩니다.'
      ],
      implications: [
        'AI NPC 도입 = 게임 개발 인력 구조 재편 → 유니티(U)·언리얼 엔진(EPIC, 비상장) 등 AI 통합 게임 엔진 기업의 라이선스 매출 상승 및 로블록스(RBLX)의 UGC AI 도구 채택 가속.',
        '온디바이스 AI NPC 구현을 위한 RTX GPU 수요 증가는 엔비디아(NVDA) 게이밍 부문 매출 성장에 기여하며, AI PC와 게이밍 GPU의 경계가 허물어지는 컨버전스 트렌드를 강화합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },
  {
    id: 'id_gaming_0719_2',
    title: 'Roblox Launches AI World Builder: Natural Language to 3D Game Creation',
    link: 'https://news.google.com/rss/search?q=Roblox+AI+game+builder+2026',
    description: 'Roblox unveiled an AI-powered game creation tool that allows users to generate entire game worlds using natural language prompts, with full rollout planned for H2 2026.',
    date: todayISO,
    sourceId: 'following-industry-gaming',
    sourceName: '🎮 Gaming Industry News',
    lang: 'en',
    category: 'Gaming',
    region: 'US',
    followingIndustry: 'gaming',
    followingCompanyIds: [111],
    aiAnalysis: {
      translatedTitle: '로블록스, 생성형 AI 게임 제작 툴 공개... 자연어로 3D 게임 월드 생성 가능',
      summary: [
        '로블록스가 자연어 텍스트 입력만으로 3D 게임 월드, 아이템, 게임 로직을 자동 생성하는 AI 게임 크리에이터 툴을 공개하며, 2026년 하반기 전체 사용자 대상 개방을 목표로 설정했습니다.',
        '코딩 지식이 없는 10~20대 Z세대 크리에이터들이 손쉽게 게임을 제작할 수 있게 되어, 로블록스 플랫폼 내 UGC 콘텐츠량이 기하급수적으로 증가할 것으로 예상됩니다.',
        '로블록스의 MAU(월 활성 사용자) 3.8억 명을 기반으로 AI 게임 제작 도구가 결합되면, 플랫폼 체류 시간과 가상 아이템 거래량이 동반 상승하여 ARPU 개선 직결됩니다.'
      ],
      implications: [
        '로블록스 AI 게임 제작 도구의 성공은 플랫폼 내 광고주가 타깃할 수 있는 Z세대 커뮤니티의 밀도를 더욱 높여, RBLX의 광고 매출 다각화에 결정적 전환점이 됩니다.',
        '경쟁사 마인크래프트(MS), 리그 오브 레전드(RIOT) 등도 유사한 AI 창작 도구 도입을 서두를 것이며, 게임 엔진·AI 인프라 기업들의 B2B 수주 경쟁이 격화됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },
  {
    id: 'id_gaming_0719_3',
    title: 'AppLovin AI Ad Platform Surpasses $1B Quarterly Revenue for First Time',
    link: 'https://news.google.com/rss/search?q=AppLovin+AI+advertising+revenue+2026',
    description: 'AppLovin reported its first-ever $1 billion+ quarterly revenue milestone, driven entirely by its AI-powered AXON advertising engine which personalizes mobile game ads at scale.',
    date: todayISO,
    sourceId: 'following-industry-gaming',
    sourceName: '🎮 Gaming Industry News',
    lang: 'en',
    category: 'Gaming',
    region: 'US',
    followingIndustry: 'gaming',
    followingCompanyIds: [114],
    aiAnalysis: {
      translatedTitle: '앱러빈(AppLovin), AI 광고 플랫폼으로 분기 매출 10억 달러 첫 돌파',
      summary: [
        '앱러빈이 자사 AI 기반 광고 엔진 AXON(액손)이 모바일 게임 광고를 개인화 타깃팅하여 분기 매출 사상 최초 10억 달러를 돌파했다고 발표했습니다.',
        'AXON 엔진은 수십억 개의 앱 내 행동 데이터를 실시간으로 분석해 광고 타깃을 정밀 매칭하며, Apple IDFA 규제 이후 퍼포먼스 마케팅 시장의 공백을 빠르게 채우고 있습니다.',
        '모바일 게임 광고주들이 AXON의 ROI가 기존 페이스북·구글 광고 대비 2~3배 높다고 보고하면서, 대형 게임사들의 앱러빈 광고 지출 집중이 가속화되고 있습니다.'
      ],
      implications: [
        '앱러빈의 성공은 AI 기반 퍼스트파티 데이터 광고가 프라이버시 규제 시대의 핵심 수익화 모델임을 입증하며, 모바일 광고 시장의 구조적 재편을 이끌고 있습니다.',
        '앱러빈의 플랫폼 네트워크 효과(광고주 많을수록 데이터 많아짐 → AI 성능 향상 → 광고주 추가 유입)는 진입 장벽을 높여가고 있어, 경쟁사들의 따라잡기가 구조적으로 어려워집니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },
  {
    id: 'id_gaming_0719_4',
    title: 'Microsoft Copilot Gaming Assistant Integrated into Xbox Series X/S Firmware',
    link: 'https://news.google.com/rss/search?q=Microsoft+Copilot+Xbox+gaming+AI+2026',
    description: 'Microsoft has shipped a major Xbox firmware update embedding Copilot AI directly into the console OS, enabling real-time gameplay tips, voice commands, and personalized content discovery.',
    date: todayISO,
    sourceId: 'following-industry-gaming',
    sourceName: '🎮 Gaming Industry News',
    lang: 'en',
    category: 'Gaming',
    region: 'US',
    followingIndustry: 'gaming',
    followingCompanyIds: [111, 112],
    aiAnalysis: {
      translatedTitle: '마이크로소프트 코파일럿 게이밍, Xbox 운영체제 정식 통합... AI 콘솔 게이밍 시대 개막',
      summary: [
        '마이크로소프트가 Xbox Series X/S의 펌웨어 업데이트를 통해 코파일럿 AI를 게임 콘솔 OS에 정식 내장하며, 플레이어가 게임 중 실시간 공략 안내, 음성 명령, 개인화 게임 추천을 받을 수 있는 AI 게이밍 환경을 구현했습니다.',
        '코파일럿 게이밍은 특정 스테이지에서 막혔을 때 AI가 자동으로 힌트를 제공하고, 플레이어의 게임 스타일을 분석해 맞춤 추천 목록을 생성하는 기능이 핵심입니다.',
        '이 업데이트는 Game Pass Ultimate 구독자에게 우선 적용되며, 구독 ARPU(가입자 1인당 평균 매출) 향상에 직접 기여하는 킬러 피처로 평가받고 있습니다.'
      ],
      implications: [
        'AI 코파일럿이 Xbox 생태계 내에 통합되면서 Xbox Game Pass 구독 이탈률(Churn Rate)이 개선되고, 신규 구독자 유입 속도가 빨라질 것으로 예상됩니다.',
        '콘솔 AI 기능의 클라우드 처리를 위해 마이크로소프트 Azure AI 인프라의 게이밍 부문 활용이 증가하여, AI-as-a-Service 수익이 게이밍 부문에서도 인식되기 시작합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_gaming_0719_5',
    title: 'Korea Gaming Market AI Avatar & Virtual Idol Hybrid Content Surges Among Gen Z',
    link: 'https://news.google.com/rss/search?q=Korea+gaming+AI+virtual+idol+2026',
    description: 'Korean gaming companies are reporting explosive growth in AI-powered virtual idol characters integrated into game universes, creating a new genre of gaming-entertainment crossover content.',
    date: todayISO,
    sourceId: 'following-industry-gaming',
    sourceName: '🎮 Gaming Industry News',
    lang: 'en',
    category: 'Gaming',
    region: 'KR',
    followingIndustry: 'gaming',
    followingCompanyIds: [115],
    aiAnalysis: {
      translatedTitle: '한국 게임 시장, AI 버추얼 아이돌×게임 융합 콘텐츠 폭발... Z세대 새 소비 트렌드',
      summary: [
        '한국 주요 게임사들이 AI 생성 버추얼 아이돌을 게임 내 캐릭터로 통합한 \'게임+팬덤\' 융합 콘텐츠를 출시하며 10~20대 Z세대를 중심으로 폭발적 반응을 얻고 있습니다.',
        '이 트렌드의 특징은 게임 내 스토리와 K팝 아이돌 스타일의 버추얼 캐릭터가 결합해 게임 플레이와 팬덤 활동이 동시에 이루어지며, 굿즈·콘서트 연계 수익까지 창출한다는 점입니다.',
        '넥슨·넷마블·카카오게임즈 등이 이 장르에서 경쟁하고 있으며, IP(지식재산권) 보유 강도가 미래 수익의 핵심 차별화 요소로 부상하고 있습니다.'
      ],
      implications: [
        'K팝과 게임이 융합된 AI 콘텐츠는 한국 게임의 글로벌 경쟁력을 강화하는 새로운 장르가 되며, 특히 일본·동남아 시장에서의 확장성이 높아 수출 기회가 확대됩니다.',
        'HYBE·SM엔터테인먼트 등 K팝 기획사들이 게임사와 IP 협력을 확대할 경우 엔터테인먼트-게임-AI 크로스오버 기업들의 밸류에이션 프리미엄이 형성될 것입니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },

  // ─── 🎬 엔터테인먼트 (entertainment) ──────────────────────────
  {
    id: 'id_ent_0719_1',
    title: 'Netflix AI-Generated Short Films Pilot Program Shows 60% Cost Reduction',
    link: 'https://news.google.com/rss/search?q=Netflix+AI+generated+content+short+film+2026',
    description: 'Netflix confirmed its internal pilot program using AI video generation (Sora-class models) for short-form content achieved 60% production cost reduction while maintaining viewer satisfaction metrics.',
    date: todayISO,
    sourceId: 'following-industry-entertainment',
    sourceName: '🎬 Entertainment & Media News',
    lang: 'en',
    category: 'Entertainment',
    region: 'US',
    followingIndustry: 'entertainment',
    followingCompanyIds: [116],
    aiAnalysis: {
      translatedTitle: '넷플릭스, AI 생성 단편 영상 파일럿 60% 제작비 절감 확인... 콘텐츠 마진 혁명 시작',
      summary: [
        '넷플릭스가 소라(Sora) 클래스 AI 영상 생성 모델을 활용한 단편 콘텐츠 제작 파일럿 프로그램에서 기존 대비 60%의 제작비 절감을 달성하면서도 시청자 만족도 지표를 유지했다고 공식 확인했습니다.',
        '파일럿 대상은 10분 이하 단편 다큐멘터리·실험적 단편 영화·스포츠 하이라이트 패키지로, AI가 편집·자막·배경음악·색보정까지 자동으로 처리하는 엔드투엔드 워크플로가 구현됐습니다.',
        '제작비 절감 효과가 실증됨에 따라 넷플릭스는 연간 콘텐츠 투자액(약 170억 달러) 중 AI 활용 비중을 2027년까지 20%로 확대하는 내부 목표를 설정한 것으로 알려졌습니다.'
      ],
      implications: [
        '넷플릭스의 콘텐츠 제작비 절감은 구조적 마진 개선으로 이어져, 추가 투자 없이도 콘텐츠 제작량을 확대하는 선순환이 형성됩니다. 2026년 EPS 컨센서스 상향 조정의 핵심 드라이버가 됩니다.',
        'AI 영상 생성 솔루션 기업(런웨이·피카랩·소라)의 B2B 스튜디오 계약이 OTT 전반으로 확산되며, 특히 소규모 스트리밍 플랫폼의 콘텐츠 경쟁력을 혁신적으로 끌어올리는 민주화 효과가 나타납니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },
  {
    id: 'id_ent_0719_2',
    title: 'HYBE Launches AI Voice Cloning Platform for Global K-Pop Content Localization',
    link: 'https://news.google.com/rss/search?q=HYBE+AI+voice+K-pop+localization+2026',
    description: 'HYBE has launched an AI voice synthesis and dubbing platform that creates real-time localized versions of BTS and other artist content in 15 languages, accelerating global market expansion.',
    date: todayISO,
    sourceId: 'following-industry-entertainment',
    sourceName: '🎬 Entertainment & Media News',
    lang: 'en',
    category: 'Entertainment',
    region: 'KR',
    followingIndustry: 'entertainment',
    followingCompanyIds: [117],
    aiAnalysis: {
      translatedTitle: 'HYBE, AI 음성 합성 기반 K팝 콘텐츠 15개 언어 현지화 플랫폼 출시',
      summary: [
        'HYBE가 BTS·세븐틴 등 아티스트 콘텐츠를 AI 음성 합성과 실시간 더빙 기술로 15개 언어로 현지화하는 플랫폼을 공식 출시하며, K팝의 비영어권 신흥 시장 침투 속도를 획기적으로 높이고 있습니다.',
        'AI 더빙의 핵심은 아티스트 본연의 음색·감정·뉘앙스를 최대한 유지하면서 다국어로 변환하는 기술로, 인도·동남아·중동·중남미 팬들이 모국어로 직접 아티스트 콘텐츠를 즐길 수 있습니다.',
        'HYBE 산하 레이블들의 글로벌 스트리밍 수익이 AI 현지화 도입 이후 신흥 시장에서 분기 기준 45% 성장하는 성과를 보이고 있습니다.'
      ],
      implications: [
        'HYBE의 AI 현지화 성공은 SM·JYP·YG 등 K팝 기획사 전체의 글로벌 IP 라이선스 수익 구조를 재편하는 업종 표준이 될 것이며, AI 더빙 플랫폼 기업(일레븐랩스 등)과의 B2B 계약이 급증합니다.',
        'K팝 콘텐츠의 언어 장벽 해소는 팬덤 인구의 비약적 증가로 이어져, MD(굿즈)·공연·팬미팅 등 오프라인 수익도 동반 급증합니다. 하이브의 위버스 플랫폼 MAU와 글로벌 티켓 매출이 동시에 확대됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },
  {
    id: 'id_ent_0719_3',
    title: 'Netflix Ad-Supported Tier Surpasses 100 Million Subscribers Globally',
    link: 'https://news.google.com/rss/search?q=Netflix+ad+supported+tier+subscribers+2026',
    description: 'Netflix announced its ad-supported subscription tier has crossed 100 million global subscribers, with advertising revenue now approaching streaming subscription revenue for the first time.',
    date: todayISO,
    sourceId: 'following-industry-entertainment',
    sourceName: '🎬 Entertainment & Media News',
    lang: 'en',
    category: 'Entertainment',
    region: 'US',
    followingIndustry: 'entertainment',
    followingCompanyIds: [116, 119],
    aiAnalysis: {
      translatedTitle: '넷플릭스 광고 지원 구독자 1억 명 돌파... 광고 매출이 구독 매출 추월 임박',
      summary: [
        '넷플릭스의 광고 지원(AVOD) 요금제 구독자가 글로벌 1억 명을 넘어서며, 광고 매출이 처음으로 구독 매출 수준에 근접했다고 발표했습니다.',
        '넷플릭스는 구독 요금제보다 저렴한 광고 지원 티어를 통해 가격 민감 시장(아시아·중남미·동유럽)에서 신규 구독자를 획기적으로 끌어들이는 성장 전략을 성공적으로 실행하고 있습니다.',
        '광고 매출은 구독 매출과 달리 구독자 수뿐만 아니라 광고 단가(CPM)와 시청 시간이 복합적으로 작용해, 콘텐츠 품질 향상이 직접 광고 수익 증가로 연결되는 구조가 형성됩니다.'
      ],
      implications: [
        'OTT 광고 시장의 급성장은 프로그래매틱 광고 플랫폼(The Trade Desk·Google DV360)의 수혜를 극대화하며, TTD의 커넥티드TV(CTV) 광고 매출이 구조적으로 성장하는 기반이 됩니다.',
        '넷플릭스의 광고 생태계 확장은 기존 레거시 TV 광고(지상파·케이블) 예산을 빠르게 흡수하며, 광고 시장의 디지털 전환을 2027년까지 완성하는 가속 페달 역할을 합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },
  {
    id: 'id_ent_0719_4',
    title: 'Live Nation Sets Record $7.2B Revenue on AI-Enhanced Concert Experience Premium',
    link: 'https://news.google.com/rss/search?q=Live+Nation+concert+revenue+AI+2026',
    description: 'Live Nation reported record quarterly revenue driven by AI-powered personalization, holographic performances, and dynamic pricing, with average ticket prices up 35% YoY.',
    date: todayISO,
    sourceId: 'following-industry-entertainment',
    sourceName: '🎬 Entertainment & Media News',
    lang: 'en',
    category: 'Entertainment',
    region: 'US',
    followingIndustry: 'entertainment',
    followingCompanyIds: [118],
    aiAnalysis: {
      translatedTitle: '라이브네이션, AI 체험 프리미엄으로 분기 역대 최대 매출 72억 달러... 평균 티켓가 35% 상승',
      summary: [
        '라이브네이션(LYV)이 AI 개인화·홀로그램 퍼포먼스·다이나믹 프라이싱을 결합한 콘서트 체험 프리미엄 전략으로 분기 최대 매출 72억 달러를 달성하며, 전년 동기 대비 평균 티켓 가격이 35% 상승했습니다.',
        'AI 공연 기술의 핵심은 ① 무대에 홀로그램 특수효과 실시간 적용, ② 관람객 팬덤 데이터 기반 셋리스트 개인화, ③ AI 동적 가격 책정으로 수요에 따른 실시간 가격 조정입니다.',
        '한국 HYBE·SM·YG의 K팝 콘서트가 글로벌 라이브네이션 플랫폼을 통해 해외에서 열리며, 아시아 라이브 이벤트 부문 성장이 전체 실적을 이끌고 있습니다.'
      ],
      implications: [
        '라이브 이벤트 산업의 AI 기술 도입이 프리미엄 티케팅 ASP를 구조적으로 끌어올리며, 오프라인 공연의 수익성이 디지털 스트리밍보다 오히려 더 빠르게 성장하는 역전 현상이 나타나고 있습니다.',
        'CJ ENM·하이브 등 K팝 공연 기획사들의 글로벌 투어 수익이 AI 체험 기술 도입과 함께 급증하며, 엔터테인먼트 오프라인 비즈니스의 재평가가 이루어지고 있습니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_ent_0719_5',
    title: 'Virtual Idol IP Ownership Legal Battle: AI-Generated Artists Spark Copyright Crisis',
    link: 'https://news.google.com/rss/search?q=virtual+idol+AI+copyright+intellectual+property+2026',
    description: 'Lawsuits over AI-generated virtual idol voice, likeness, and content ownership are proliferating globally, with courts in Korea, US, and Japan setting conflicting precedents.',
    date: todayISO,
    sourceId: 'following-industry-entertainment',
    sourceName: '🎬 Entertainment & Media News',
    lang: 'en',
    category: 'Entertainment',
    region: 'GLOBAL',
    followingIndustry: 'entertainment',
    followingCompanyIds: [117, 120],
    aiAnalysis: {
      translatedTitle: 'AI 버추얼 아이돌 저작권 소송 확산... 한·미·일 법원에서 상충하는 선례 형성 중',
      summary: [
        'AI로 생성된 버추얼 아이돌의 목소리·외형·퍼포먼스에 대한 저작권 귀속 문제를 두고 한국·미국·일본 법원에서 동시다발적으로 소송이 제기되며, 각국이 상충하는 법적 판단을 내리고 있습니다.',
        '핵심 쟁점은 ① AI 훈련에 사용된 실제 아티스트의 목소리·음원 데이터 저작권, ② AI가 생성한 콘텐츠의 저작권 귀속 주체(개발사·기획사·아티스트), ③ 소비자가 AI 아티스트임을 인지하지 못할 경우의 사기성 상품화 문제입니다.',
        '법적 불확실성이 해소되기 전까지 AI 버추얼 아이돌에 막대한 투자를 집행한 기업들은 규제 리스크를 안고 사업을 운영해야 하는 상황입니다.'
      ],
      implications: [
        '저작권 법제화 과정에서 IP를 명확히 보유한 대형 기획사(HYBE·SM·JYP)는 법적 확실성을 바탕으로 AI 콘텐츠 사업을 안정적으로 확장할 수 있는 반면, IP 구조가 모호한 소형 기획사들은 퇴출 압력에 직면합니다.',
        '엔터테인먼트 AI 법률 전문 서비스 수요가 폭발하며, 법무법인·AI 컨설팅 기업들의 엔터테인먼트 부문 매출이 신규 성장 세그먼트로 부상합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },

  // ─── ⚓ 조선 (shipbuilding) ────────────────────────────────────
  {
    id: 'id_ship_0719_1',
    title: 'HD Korea Shipbuilding Secures Record $8.2B Backlog in H1 2026 on LNG Boom',
    link: 'https://news.google.com/rss/search?q=HD+Korea+Shipbuilding+backlog+LNG+2026',
    description: 'HD Korea Shipbuilding & Offshore Marine reported record H1 2026 order intake of $8.2 billion, driven by LNG carrier and eco-friendly vessel demand from European shipping companies.',
    date: todayISO,
    sourceId: 'following-industry-shipbuilding',
    sourceName: '⚓ Shipbuilding & Marine News',
    lang: 'en',
    category: 'Shipbuilding',
    region: 'KR',
    followingIndustry: 'shipbuilding',
    followingCompanyIds: [121],
    aiAnalysis: {
      translatedTitle: 'HD한국조선해양, 상반기 수주 역대 최고 82억 달러... LNG선 붐에 수주잔고 4년치 확보',
      summary: [
        'HD한국조선해양이 2026년 상반기 LNG 운반선·친환경 선박 수주 호황에 힘입어 역대 최고 수주액 82억 달러를 달성하며, 수주잔고가 4년치 이상으로 확대됐습니다.',
        '유럽 주요 선사들이 IMO 2030 탈탄소 규제 대응을 위해 LNG·메탄올·암모니아 이중연료(DF) 선박 발주를 대거 집행하면서, 한국 조선 빅3(HD현대·삼성중공업·한화오션)가 수혜를 독점하고 있습니다.',
        'HD한국조선해양의 영업이익률이 2026년 8% 돌파로 전망되며, 이는 2014년 조선업 호황기를 뛰어넘는 역대 최고 수준의 수익성입니다.'
      ],
      implications: [
        '한국 조선 3사의 수주잔고 3~4년치 확보는 실적 가시성이 업종 최고 수준임을 의미하며, 중장기 확실한 매출을 바탕으로 밸류에이션 재평가가 지속될 것입니다.',
        'LNG선 수요 폭증 = 카고 펌프·극저온 밸브·단열 시스템 등 LNG 전용 기자재 공급사들의 수주도 동반 급증하여, 조선 기자재 전문 중소기업들의 성장 모멘텀이 확인됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },
  {
    id: 'id_ship_0719_2',
    title: 'IMO Adopts Autonomous Ship International Regulations Draft for 2028 Pilot',
    link: 'https://news.google.com/rss/search?q=IMO+autonomous+ship+MASS+regulations+2026',
    description: 'The International Maritime Organization finalized its MASS (Maritime Autonomous Surface Ships) regulatory framework draft, targeting 2028 pilot commercial operations.',
    date: todayISO,
    sourceId: 'following-industry-shipbuilding',
    sourceName: '⚓ Shipbuilding & Marine News',
    lang: 'en',
    category: 'Shipbuilding',
    region: 'GLOBAL',
    followingIndustry: 'shipbuilding',
    followingCompanyIds: [121, 122, 123],
    aiAnalysis: {
      translatedTitle: 'IMO, 자율운항선박 국제 규정 초안 확정... 2028년 파일럿 상업 운항 허용 목표',
      summary: [
        '국제해사기구(IMO)가 자율운항선박(MASS) 국제 규정 초안을 2026년 내 확정하고, 2028년 파일럿 상업 운항 허가를 목표로 하는 타임라인을 발표했습니다.',
        'MASS 규정은 4단계 자율화 등급(원격 제어→부분 자율→조건부 완전 자율→완전 자율)을 설정하고, 각 단계별 안전·사이버보안·보험 기준을 명시합니다.',
        'HD현대가 HiMSEN 엔진 기반 자율운항 기술 개발에서 글로벌 선두를 달리고 있으며, Wärtsilä(바르실라)·콩스버그(Kongsberg) 등 자율운항 솔루션 기업들의 수주가 본격화될 것으로 예상됩니다.'
      ],
      implications: [
        '자율운항선박 상용화는 선원 인건비(운항 비용의 40~50%)를 AI로 대체하는 게임 체인저로, 조선사와 자율항법 솔루션 기업 간의 전략적 파트너십·M&A가 가속화될 것입니다.',
        '자율운항 기술 표준화는 AI 항법 소프트웨어·원격 관제 시스템·사이버보안 솔루션 기업들의 해운 B2B 시장 진입 장벽을 낮춰, 관련 스타트업의 대규모 투자 유치가 급증할 것입니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_ship_0719_3',
    title: 'US Navy Awards $8B Contract Expansion for Destroyer and Submarine Programs',
    link: 'https://news.google.com/rss/search?q=US+Navy+shipbuilding+contract+destroyer+submarine+2026',
    description: 'The US Navy issued $8 billion in additional shipbuilding contracts targeting destroyers, Virginia-class submarines, and amphibious vessels to Huntington Ingalls and General Dynamics.',
    date: todayISO,
    sourceId: 'following-industry-shipbuilding',
    sourceName: '⚓ Shipbuilding & Marine News',
    lang: 'en',
    category: 'Shipbuilding',
    region: 'US',
    followingIndustry: 'shipbuilding',
    followingCompanyIds: [124],
    aiAnalysis: {
      translatedTitle: '미 해군, 구축함·잠수함 프로그램에 80억 달러 추가 계약... 방산 조선 수주 사이클 개시',
      summary: [
        '미 해군이 알레이버크급 구축함·버지니아급 핵잠수함·강습상륙함 신규 발주에 80억 달러 추가 계약을 헌팅턴잉걸스(HII)와 제너럴다이나믹스 BIW에 발주하며 방산 조선 수주 사이클이 본격화됩니다.',
        '미 의회는 2027년까지 미 해군 함정 355척 목표 달성을 위한 추가 예산 편성을 승인했으며, 중국 해군 팽창에 대응한 태평양 억지력 강화를 위해 방산 조선 예산이 초당파적 지지를 받고 있습니다.',
        '한국 조선 3사가 미 해군 MRO(유지보수·수리·정비) 시장에 진출하기 위한 협약이 미 정부 차원에서 논의 중이며, 성사 시 연간 수십억 달러 규모의 정비 수주가 예상됩니다.'
      ],
      implications: [
        '미 방산 조선 예산 확대는 헌팅턴잉걸스(HII)와 제너럴다이나믹스(GD)의 다년간 수주잔고를 확보하여, 방산 조선사 실적의 장기 예측 가능성을 극대화합니다.',
        '한국 조선 3사의 미 해군 MRO 진출 협상 성공 시, 민간 LNG선+군함 MRO 이중 성장 동력이 가동되어 한국 조선업 전체 밸류에이션 리레이팅의 새로운 모멘텀이 됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_ship_0719_4',
    title: 'Singapore, Busan, Rotterdam Ports Launch Green Ammonia Bunkering Infrastructure',
    link: 'https://news.google.com/rss/search?q=ammonia+bunkering+port+Singapore+Busan+2026',
    description: 'Three of the world\'s largest ports — Singapore, Busan, and Rotterdam — have simultaneously announced green ammonia bunkering infrastructure investments totaling over $2 billion.',
    date: todayISO,
    sourceId: 'following-industry-shipbuilding',
    sourceName: '⚓ Shipbuilding & Marine News',
    lang: 'en',
    category: 'Shipbuilding',
    region: 'GLOBAL',
    followingIndustry: 'shipbuilding',
    followingCompanyIds: [121, 122, 123],
    aiAnalysis: {
      translatedTitle: '싱가포르·부산·로테르담, 그린 암모니아 벙커링 인프라 동시 발표... 해운 탈탄소 인프라 본격화',
      summary: [
        '세계 3대 항만인 싱가포르·부산·로테르담이 총 20억 달러 이상의 그린 암모니아 벙커링 인프라 구축 투자를 동시에 발표하며, 해운 탈탄소 연료 공급망이 본격화되고 있습니다.',
        '그린 암모니아 벙커링 인프라는 ① 암모니아 저장 탱크(극저온 -33°C), ② 이송 펌프·호스 시스템, ③ 가스 처리(증발가스 회수) 설비로 구성되며, 기존 LNG 벙커링 대비 안전 요건이 더 까다롭습니다.',
        '한국·일본 선사와 유럽 선사들이 암모니아 추진선 발주를 기다리며 항만 인프라 완성 시점을 주시하고 있어, 2028년 암모니아 선박 대규모 발주 사이클이 열릴 가능성이 높습니다.'
      ],
      implications: [
        '항만 암모니아 인프라 구축은 암모니아 연료 탱크·밸브·펌프 전문 기업들의 신규 수주를 촉발하며, MAN Energy Solutions·바르실라·현대로템 등의 해양 부문 수주가 급증합니다.',
        '부산항의 암모니아 벙커링 인프라 투자는 한국이 글로벌 친환경 해운 허브로 자리매김하는 전략적 포지셔닝이며, HD현대·한화오션의 암모니아 추진선 수주 경쟁력을 뒷받침합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_ship_0719_5',
    title: 'Luxury Cruise Bookings Surge: New Orders for 12 Ultra-Premium Vessels Placed in H1 2026',
    link: 'https://news.google.com/rss/search?q=luxury+cruise+ship+order+backlog+2026',
    description: 'Cruise industry bookings hit all-time highs, prompting major cruise lines Carnival, Royal Caribbean, and Norwegian to place 12 new ultra-premium vessel orders worth $9 billion in H1 2026.',
    date: todayISO,
    sourceId: 'following-industry-shipbuilding',
    sourceName: '⚓ Shipbuilding & Marine News',
    lang: 'en',
    category: 'Shipbuilding',
    region: 'GLOBAL',
    followingIndustry: 'shipbuilding',
    followingCompanyIds: [125, 122],
    aiAnalysis: {
      translatedTitle: '럭셔리 크루즈 예약 역대 최고... 카니발·RCL·노르위전 12척 90억 달러 신규 발주',
      summary: [
        '카니발·로열캐리비안·노르위전 크루즈 등 대형 선사들이 코로나 이후 완전히 회복된 크루즈 수요와 2027년까지의 만석 예약에 힘입어 2026년 상반기 12척의 울트라 프리미엄 크루즈선을 총 90억 달러 규모로 발주했습니다.',
        '신형 크루즈선은 LNG·메탄올 이중연료 추진 시스템을 기본 탑재하며, AI 개인화 서비스·몰입형 XR 엔터테인먼트·스마트 선내 시스템이 핵심 차별화 요소로 적용됩니다.',
        '삼성중공업이 크루즈선 전문 건조 라인에서 글로벌 2위의 경쟁력을 보유하고 있어, 이번 발주 사이클에서 상당 규모의 수주가 예상됩니다.'
      ],
      implications: [
        '크루즈선 평균 건조 기간 3~4년을 고려하면 지금 발주되는 선박은 2028~2030년 인도되어, 조선사들의 장기 수주잔고를 더욱 두텁게 만들며 실적 가시성을 높입니다.',
        '럭셔리 크루즈선의 AI·XR 시스템 통합은 스마트 선박 솔루션 기업들의 해양 B2B 수주 기회를 창출하며, 선박 IT 인프라 시장이 새로운 성장 세그먼트로 부상합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },

  // ─── 🚢 운송 (transport) ──────────────────────────────────────
  {
    id: 'id_trans_0719_1',
    title: 'Joby Aviation Receives FAA Special Airworthiness Certificate for Commercial eVTOL',
    link: 'https://news.google.com/rss/search?q=Joby+Aviation+FAA+certificate+eVTOL+2026',
    description: 'Joby Aviation secured a Special Airworthiness Certificate from the FAA, a critical milestone enabling expanded test flights ahead of its targeted type certification by end-2026.',
    date: todayISO,
    sourceId: 'following-industry-transport',
    sourceName: '🚢 Transport & Logistics News',
    lang: 'en',
    category: 'Transport',
    region: 'US',
    followingIndustry: 'transport',
    followingCompanyIds: [126],
    aiAnalysis: {
      translatedTitle: '조비 에이비에이션, FAA 특별 감항 증명 획득... eVTOL 형식 인증 마지막 단계 진입',
      summary: [
        '조비 에이비에이션(JOBY)이 미 연방항공청(FAA)으로부터 특별 감항 증명(Special Airworthiness Certificate)을 획득하며, 상업용 형식 인증(Type Certificate) 획득의 최종 단계에 진입했습니다.',
        '특별 감항 증명은 실제 상업 서비스 이전 단계의 확장 시험 비행을 허용하는 문서로, 유나이티드항공·델타항공이 사전 발주한 총 1,000대 이상의 에어 택시 인도 일정이 한층 구체화됩니다.',
        '아처 에이비에이션(ACHR)도 유사한 인증 단계를 밟고 있어, 2026년 하반기~2027년 초 미국 내 최초 상업 eVTOL 운항이 실현될 가능성이 높아지고 있습니다.'
      ],
      implications: [
        '조비의 FAA 형식 인증 성공은 eVTOL 전체 산업의 투자 심리를 획기적으로 개선하는 트리거가 되며, 도심항공교통(UAM) 인프라(이착륙장·항공교통관리 시스템) 투자가 본격화됩니다.',
        'eVTOL 상업화는 도시 부동산 시장에도 영향을 미쳐 버티포트(Vertiport) 입지 인근 부동산 프리미엄이 형성되고, 공항·기차역·쇼핑몰 인근 대형 건물의 옥상 개발 수요가 생겨납니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },
  {
    id: 'id_trans_0719_2',
    title: 'Aurora Innovation Expands Commercial Autonomous Trucking to 5 Texas Highway Routes',
    link: 'https://news.google.com/rss/search?q=Aurora+Innovation+autonomous+truck+Texas+commercial+2026',
    description: 'Aurora Innovation has expanded its driverless commercial trucking operations to 5 interstate routes in Texas, with over 500,000 driverless miles logged since initial commercial launch.',
    date: todayISO,
    sourceId: 'following-industry-transport',
    sourceName: '🚢 Transport & Logistics News',
    lang: 'en',
    category: 'Transport',
    region: 'US',
    followingIndustry: 'transport',
    followingCompanyIds: [128],
    aiAnalysis: {
      translatedTitle: '오로라 이노베이션, 텍사스 5개 고속도로 자율주행 트럭 상업 운행 확장... 50만 마일 무인 돌파',
      summary: [
        '오로라 이노베이션(AUR)이 자율주행 트럭 상업 운행 노선을 텍사스 5개 주간(Interstate) 고속도로로 확장하며, 상업 운행 개시 이후 누적 무인 주행 거리 50만 마일을 돌파했습니다.',
        '텍사스 주는 자율주행 트럭에 대한 규제가 미국에서 가장 친화적이어서 오로라의 실증 테스트베드 역할을 하고 있으며, 연방 차원의 자율트럭 규제 프레임워크 수립에 핵심 레퍼런스가 됩니다.',
        '운행 데이터 분석에서 오로라의 자율주행 트럭이 인간 트럭 기사 대비 사고율은 90% 낮고 연비는 12% 개선된 성과를 보여, 경제성 입증이 완료 단계에 접어들었습니다.'
      ],
      implications: [
        '자율주행 트럭의 상업적 실증은 장거리 화물 인건비(물류 비용의 약 40%) 절감을 통한 운송 원가 혁명을 예고하며, 트럭 운송에 의존하는 소매·제조·의약품 등 전 산업의 공급망 비용 구조가 바뀝니다.',
        '오로라의 확장이 성공적으로 이루어질 경우 유사 기술을 보유한 코드랙·웨이모비아 등도 추가 자금 유치와 노선 확장이 가속화되며, 기존 대형 트럭 회사들(J.B. Hunt·Werner)의 경쟁력 위협이 현실화됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_trans_0719_3',
    title: 'Trans-Pacific Container Freight Rates Rise 35% on AI Server Export Surge',
    link: 'https://news.google.com/rss/search?q=container+freight+rate+AI+server+export+2026',
    description: 'Trans-Pacific container shipping rates have rebounded 35% from their 2025 lows, driven by AI server and GPU export volumes from Taiwan and South Korea to US data center operators.',
    date: todayISO,
    sourceId: 'following-industry-transport',
    sourceName: '🚢 Transport & Logistics News',
    lang: 'en',
    category: 'Transport',
    region: 'GLOBAL',
    followingIndustry: 'transport',
    followingCompanyIds: [129, 130],
    aiAnalysis: {
      translatedTitle: '태평양 컨테이너 운임 35% 반등... AI 서버·GPU 수출 수요가 해운 시장 회복 이끌다',
      summary: [
        '태평양 노선 컨테이너 운임이 2025년 저점 대비 35% 반등하며 해운 시장 회복세를 보이고 있습니다. 핵심 동력은 대만·한국산 AI 서버·GPU·HBM 반도체의 미국 데이터센터 향 수출 급증입니다.',
        'AI 서버는 일반 소비 전자제품 대비 무게와 부피가 크고 특수 포장(정밀 충격 방지·ESD 방지)이 필요하여, 단위당 해상 물류 비용이 일반 화물 대비 2~3배 높아 운임 수익성도 탁월합니다.',
        'HMM·ZIM·에버그린 등 아시아-미국 항로 전문 컨테이너 선사들이 AI 화물 전용 루트 서비스를 신설하며 프리미엄 운임 창출에 나서고 있습니다.'
      ],
      implications: [
        '컨테이너 운임 반등은 HMM(011200.KS)·ZIM(ZIM)의 실적 회복으로 이어지며, 2025년 적자에서 2026년 흑자 전환 가능성이 높아져 주가 재평가 기회가 형성됩니다.',
        'AI 반도체 물동량 증가에 맞춰 대형 항구(부산·가오슝·LA롱비치)의 AI 화물 전용 터미널 투자가 가속화되며, 항만 자동화 장비·스마트 컨테이너 트래킹 솔루션 기업들의 수주가 증가합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_trans_0719_4',
    title: 'FAA Expands BVLOS Drone Delivery Approvals to 15 Additional US Cities',
    link: 'https://news.google.com/rss/search?q=FAA+BVLOS+drone+delivery+approval+2026',
    description: 'The FAA expanded Beyond Visual Line of Sight (BVLOS) drone delivery approvals to 15 new US cities, enabling Wing (Alphabet) and Amazon Prime Air to significantly expand their delivery coverage.',
    date: todayISO,
    sourceId: 'following-industry-transport',
    sourceName: '🚢 Transport & Logistics News',
    lang: 'en',
    category: 'Transport',
    region: 'US',
    followingIndustry: 'transport',
    followingCompanyIds: [128, 129],
    aiAnalysis: {
      translatedTitle: 'FAA, BVLOS 드론 배송 허가 15개 도시 추가 확대... 윙·아마존 프라임에어 커버리지 대폭 확장',
      summary: [
        'FAA가 가시권 외(BVLOS) 드론 배송 허가 지역을 15개 도시 추가로 확대하며, 알파벳 윙(Wing)과 아마존 프라임에어의 상업 드론 배송 운영 영역이 대폭 넓어졌습니다.',
        '신규 허가 도시들은 외곽 주거지역과 준도심 혼합 지역으로, 라스트마일(Last-mile) 배송 비용이 기존 택배 대비 40~60% 낮아 경제성이 증명된 구역입니다.',
        '아마존의 MK30 드론은 현재 시간당 최대 60개 패키지를 배송할 수 있으며, 15개 도시 확대로 하루 수만 건의 드론 배송이 가능한 규모가 됩니다.'
      ],
      implications: [
        '드론 배송 스케일업은 비행 제어 반도체(Qualcomm QCS·NXP MIPI)·LiDAR 센서·경량 배터리 수요를 동반 증가시키며, 반도체·센서 부품사들의 드론 항공 부문 수주가 새로운 성장 채널로 부상합니다.',
        'BVLOS 확대는 드론 교통 관리(UTM) 시스템 기업들의 솔루션 수요를 폭발시키며, AirMap·NASA UTM 등 드론 항공교통 관제 스타트업들의 대규모 투자 유치가 예상됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_trans_0719_5',
    title: 'Archer Aviation Signs 500 eVTOL Pre-Order Agreement with Southwest Airlines',
    link: 'https://news.google.com/rss/search?q=Archer+Aviation+Southwest+Airlines+eVTOL+order+2026',
    description: 'Archer Aviation announced a 500-unit pre-order agreement with Southwest Airlines for its Midnight eVTOL aircraft, valued at up to $1.5 billion with first deliveries targeted for 2027.',
    date: todayISO,
    sourceId: 'following-industry-transport',
    sourceName: '🚢 Transport & Logistics News',
    lang: 'en',
    category: 'Transport',
    region: 'US',
    followingIndustry: 'transport',
    followingCompanyIds: [127],
    aiAnalysis: {
      translatedTitle: '아처 에이비에이션, 사우스웨스트 항공과 eVTOL 500대 15억 달러 사전 계약 체결',
      summary: [
        '아처 에이비에이션(ACHR)이 사우스웨스트 항공과 자사 미드나잇(Midnight) eVTOL 500대를 최대 15억 달러 규모로 공급하는 사전 계약(Pre-order)을 체결하며, 기존 항공사의 UAM 참여가 본격화되고 있습니다.',
        '사우스웨스트는 단거리 도시 간 노선(50~100km)을 eVTOL로 전환하는 실험적 파일럿 프로그램을 준비 중이며, 첫 인도는 2027년을 목표로 합니다.',
        '미드나잇은 최대 60마일 거리, 150mph 속도, 4인승 구성으로 도심-공항 노선에 최적화되어 있으며, 충전 시간 10분·10년 내 1만 회 운항 내구성을 갖추었습니다.'
      ],
      implications: [
        '기존 항공사의 eVTOL 대규모 발주는 UAM 산업의 진정한 상업화 검증 시그널로, 조비·아처·릴리움 등 eVTOL 기업들의 기업 가치 재평가를 촉발하는 업종 게임 체인저가 됩니다.',
        '버티포트(Vertiport) 건설 수요가 가시화되며, 공항·쇼핑몰·업무지구 인근 부지를 확보한 부동산 개발사들의 버티포트 임대 수익이 새로운 비즈니스 모델로 부상합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },

  // ─── 💊 제약/바이오 (pharma) ──────────────────────────────────
  {
    id: 'id_pharma_0719_1',
    title: 'Eli Lilly Oral GLP-1 Pill Achieves 87% Efficacy in Phase 3 Trial',
    link: 'https://news.google.com/rss/search?q=Eli+Lilly+oral+GLP1+pill+phase3+2026',
    description: 'Eli Lilly disclosed Phase 3 data for its oral GLP-1 weight loss pill showing 87% of patients achieving meaningful weight loss, threatening injectable GLP-1 market dynamics.',
    date: todayISO,
    sourceId: 'following-industry-pharma',
    sourceName: '💊 Pharma & Biotech News',
    lang: 'en',
    category: 'Pharma',
    region: 'US',
    followingIndustry: 'pharma',
    followingCompanyIds: [132],
    aiAnalysis: {
      translatedTitle: '일라이릴리 경구용 GLP-1 비만약 임상 3상서 87% 유효성 달성... 주사제 시장 판도 변화 예고',
      summary: [
        '일라이릴리(LLY)가 경구용(먹는 약) GLP-1 비만 치료제의 3상 임상 결과를 공개하며, 87%의 환자에서 유의미한 체중 감소(≥5%)를 달성하는 탁월한 유효성 데이터를 발표했습니다.',
        '현재 GLP-1 시장은 주사제(위고비·젭바운드)가 지배하고 있으나, 편의성이 획기적으로 높은 경구 제형의 임상 성공이 확인되면 환자 순응도(Compliance)가 비약적으로 높아집니다.',
        '경구 GLP-1의 FDA 허가 신청이 2026년 하반기에 이루어질 경우 2027년 출시가 현실화되며, 연간 GLP-1 시장 규모가 현재 1,200억 달러에서 2030년 3,000억 달러로 확대될 수 있습니다.'
      ],
      implications: [
        '경구 GLP-1 출시는 ① 자동 주사기·주사침 제조사(BD·노보핀)의 수요 감소와 ② 대용량 원료의약품(API) 정제 수요 확대의 이중 효과를 가져와 바이오의약품 공급망 구조를 재편합니다.',
        '삼성바이오로직스·셀트리온 등 한국 CDMO 기업들이 경구 GLP-1 원료 합성·정제 공정 수주를 위한 기술 역량 강화에 나서고 있어, 새로운 수주 파이프라인 확보가 기대됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },
  {
    id: 'id_pharma_0719_2',
    title: 'Samsung Biologics Wins $2.1B Multi-Year CDMO Contract from Top 5 US Pharma',
    link: 'https://news.google.com/rss/search?q=Samsung+Biologics+CDMO+contract+2026',
    description: 'Samsung Biologics announced a $2.1 billion multi-year CDMO manufacturing contract with a top-5 US pharmaceutical company for biologics including ADC antibody-drug conjugate products.',
    date: todayISO,
    sourceId: 'following-industry-pharma',
    sourceName: '💊 Pharma & Biotech News',
    lang: 'en',
    category: 'Pharma',
    region: 'KR',
    followingIndustry: 'pharma',
    followingCompanyIds: [133],
    aiAnalysis: {
      translatedTitle: '삼성바이오로직스, 미국 글로벌 제약사와 21억 달러 CDMO 계약 체결... ADC 포함 다년 계약',
      summary: [
        '삼성바이오로직스가 미국 Top5 글로벌 제약사와 항체-약물 접합체(ADC) 포함 바이오 의약품 위탁생산(CDMO) 계약을 21억 달러 규모의 다년 계약으로 체결했습니다.',
        'ADC는 현재 항암 치료의 핵심 트렌드로 다이이찌산쿄·로슈·AZ의 성공에 힘입어 임상 파이프라인이 폭발적으로 증가하고 있으며, 이에 따른 CDMO 생산 수요가 기존 mAb(단일클론항체) 수요를 초과하기 시작했습니다.',
        '삼성바이오로직스의 4~5공장 가동률이 완전히 채워지면서 6공장 착공 여부가 2026년 하반기 투자 결정의 핵심 이슈로 부상하고 있습니다.'
      ],
      implications: [
        '삼성바이오로직스의 ADC CDMO 역량 강화는 기존 mAb 위탁 생산에서 복잡한 ADC 공정으로의 사업 다각화를 의미하며, 단가가 mAb 대비 2~3배 높아 수익성 구조가 크게 개선됩니다.',
        '글로벌 CDMO 시장에서 삼성바이오로직스의 점유율 확대는 경쟁사 론자(Lonza)·보링거인겔하임의 ADC 생산 능력 부족을 파고드는 전략으로, 한국 바이오 CDMO 산업 전체의 글로벌 위상을 높입니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },
  {
    id: 'id_pharma_0719_3',
    title: 'Recursion Pharmaceuticals AI Drug Targets 3 Phase 2 Trials After Roche Partnership',
    link: 'https://news.google.com/rss/search?q=Recursion+Pharmaceuticals+AI+drug+Roche+phase2+2026',
    description: 'Recursion Pharmaceuticals is advancing 3 AI-discovered drug candidates into Phase 2 clinical trials following expanded collaboration with Roche, validating the commercial potential of AI-first drug discovery.',
    date: todayISO,
    sourceId: 'following-industry-pharma',
    sourceName: '💊 Pharma & Biotech News',
    lang: 'en',
    category: 'Pharma',
    region: 'US',
    followingIndustry: 'pharma',
    followingCompanyIds: [134],
    aiAnalysis: {
      translatedTitle: '리커전 파마, 로슈 협력 기반 AI 발굴 신약 후보 3개 임상 2상 진입',
      summary: [
        '리커전 파마슈티컬스(RXRX)가 로슈와의 파트너십 확장을 기반으로 AI가 발굴한 신약 후보 물질 3개를 2상 임상시험에 진입시키며, AI 기반 신약 개발의 상업화 가능성을 입증하고 있습니다.',
        '리커전의 AI 신약 발굴 방식은 수백만 개의 세포 이미지를 AI로 분석해 기존 방식 대비 5~10배 빠른 속도로 신약 후보를 선별하며, 전임상 성공률도 40% 이상으로 업계 평균(5~10%)을 압도합니다.',
        'AI 신약 개발 플랫폼의 임상 진입이 가속화되면서, 이노실리코 메디신·슈뢰딩거·릴레이 테라퓨틱스 등 동종 기업들의 파트너십 계약과 밸류에이션도 동반 상승 중입니다.'
      ],
      implications: [
        'AI 신약 개발의 임상 2상 진입 성공은 글로벌 제약사들이 자체 AI 신약 플랫폼 구축보다 RXRX·슈뢰딩거 등 전문 기업에 대한 외주·파트너십 비용을 늘리는 트리거가 됩니다.',
        '리커전의 로슈와의 파트너십은 빅파마와 AI 신약 스타트업 간의 협력 모델이 M&A보다 파트너십이 더 효율적임을 보여주는 사례로, 업계 전반의 협업 방식 기준을 재정립합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_pharma_0719_4',
    title: 'ADC Antibody-Drug Conjugate Market Projected to Hit $20B by 2030 as Pipeline Explodes',
    link: 'https://news.google.com/rss/search?q=ADC+antibody+drug+conjugate+market+2030+pipeline',
    description: 'The global ADC oncology market is projected to reach $20 billion by 2030 as over 100 ADC candidates are in active clinical development, with Daiichi Sankyo and AstraZeneca leading.',
    date: todayISO,
    sourceId: 'following-industry-pharma',
    sourceName: '💊 Pharma & Biotech News',
    lang: 'en',
    category: 'Pharma',
    region: 'GLOBAL',
    followingIndustry: 'pharma',
    followingCompanyIds: [135, 133],
    aiAnalysis: {
      translatedTitle: 'ADC 항체-약물 접합체 시장 2030년 200억 달러 돌파 전망... 100개+ 임상 파이프라인 폭발',
      summary: [
        '글로벌 ADC(항체-약물 접합체) 항암제 시장이 현재 70개 이상의 임상 성공 사례와 100개 이상의 활성 임상 파이프라인을 바탕으로 2030년 200억 달러(약 29조원)에 달할 것으로 전망됩니다.',
        '다이이찌산쿄(4568.T)와 아스트라제네카(AZN)의 파트너십이 ADC 분야를 선도하고 있으며, Enhertu(HER2 표적)의 성공이 폐암·위암·대장암 등으로 적응증 확장이 진행 중입니다.',
        'ADC의 복잡한 제조 공정(항체 생산→링커 합성→약물 접합→정제)은 기존 항체 CDMO 역량만으로는 한계가 있어, ADC 전용 CDMO 생산 역량 확보가 핵심 경쟁력이 됩니다.'
      ],
      implications: [
        'ADC CDMO 전문 역량을 갖춘 삼성바이오로직스·론자·WuXi Biologics의 ADC 수주가 급증하며, 이들의 ADC 생산 설비 증설이 2027~2028년의 핵심 CAPEX 이슈가 됩니다.',
        'ADC 시장 확대는 링커·payload(페이로드) 화학 물질 전문 기업(ImmunoGen인수된 AbbVie, Byondis 등)과 ADC 바이알·시린지 전문 제조사(Gerresheimer·West Pharmaceutical)들의 수혜도 가져옵니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_pharma_0719_5',
    title: 'Novo Nordisk Wegovy Manufacturing Expansion Adds 3 New Production Sites Globally',
    link: 'https://news.google.com/rss/search?q=Novo+Nordisk+Wegovy+manufacturing+expansion+2026',
    description: 'Novo Nordisk announced the addition of 3 new global manufacturing sites to address Wegovy supply shortages, with combined capacity expected to triple by 2028.',
    date: todayISO,
    sourceId: 'following-industry-pharma',
    sourceName: '💊 Pharma & Biotech News',
    lang: 'en',
    category: 'Pharma',
    region: 'EU',
    followingIndustry: 'pharma',
    followingCompanyIds: [131],
    aiAnalysis: {
      translatedTitle: '노보 노디스크, 위고비 생산 3개 신규 거점 추가 발표... 2028년 생산량 3배 확대 목표',
      summary: [
        '노보 노디스크(NVO)가 위고비(세마글루타이드 주사제) 공급 부족을 해결하기 위해 글로벌 3개 신규 생산 기지 추가 설립을 발표하며, 2028년까지 현재 대비 3배의 생산 능력을 확보할 계획을 공개했습니다.',
        '신규 생산 기지는 덴마크·미국 노스캐롤라이나·인도에 위치하며, 세마글루타이드 원료의약품(API) 생산부터 완제 의약품(FP) 충전·포장까지 수직 통합 생산 라인으로 구성됩니다.',
        '현재 전 세계 70개국 이상에서 위고비 대기자 명단이 유지되고 있어, 생산 능력 확대가 시장 점유율 방어의 핵심 변수가 됩니다.'
      ],
      implications: [
        '노보의 생산 확대 투자는 세마글루타이드 공급 정상화 시점을 앞당겨 2026~2027년 매출 성장 속도가 더욱 가속화될 것으로 예상되며, EPS 추정치 상향 조정의 직접 근거가 됩니다.',
        '노보의 미국 생산 기지 설립은 IRA 규정 대응과 함께 공급망 안정화 효과를 가져오며, 미국 현지 제조 의약품의 메디케어 협상 가격 우대 가능성도 열어줍니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },

  // ─── 💄 화장품 (cosmetics) ────────────────────────────────────
  {
    id: 'id_cos_0719_1',
    title: 'Korea Cosmetics Export Sets New Record at $6.2B in H1 2026, US Growth 82%',
    link: 'https://news.google.com/rss/search?q=Korea+cosmetics+export+record+US+2026',
    description: 'South Korea\'s cosmetics export reached a record $6.2 billion in the first half of 2026, with US-bound exports surging 82% year-on-year driven by K-beauty viral trends on social media.',
    date: todayISO,
    sourceId: 'following-industry-cosmetics',
    sourceName: '💄 Beauty & Cosmetics News',
    lang: 'en',
    category: 'Cosmetics',
    region: 'KR',
    followingIndustry: 'cosmetics',
    followingCompanyIds: [136, 138, 139],
    aiAnalysis: {
      translatedTitle: '한국 화장품 수출 역대 최고 62억 달러... 미국 82% 급증, K뷰티 글로벌 신드롬 지속',
      summary: [
        '2026년 상반기 한국 화장품 수출이 역대 반기 최대인 62억 달러를 기록하며, 미국 수출 증가율은 전년 동기 대비 82%에 달해 K뷰티의 글로벌 신드롬이 지속되고 있습니다.',
        '미국 시장에서 K뷰티 브랜드(코스알엑스·아누아·이니스프리)가 아마존·세포라·얼타 등 주류 유통망 입점을 확대하며, 기존 럭셔리 뷰티 대비 가성비(Quality-to-Price) 우위가 재조명받고 있습니다.',
        '아모레퍼시픽·LG생활건강보다 오히려 ODM(주문자개발생산) 전문 기업 코스맥스·한국콜마가 직접 수혜 기업으로 부각되며, 수많은 K뷰티 신규 브랜드들의 생산을 도맡아 외형이 빠르게 성장하고 있습니다.'
      ],
      implications: [
        '코스맥스·한국콜마의 미국 ODM 수주 급증은 매출 단가가 국내 ODM 대비 30~50% 높아 수익성 개선이 동반되며, 두 기업의 미국 법인 확장 투자 발표가 주가 촉매로 작용할 것입니다.',
        'K뷰티 글로벌 확산은 한국 화장품 소재·포장재 기업들의 수출도 동반 증가시켜, 관련 중소기업들의 수출 파이프라인이 두터워지는 낙수 효과가 발생합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },
  {
    id: 'id_cos_0719_2',
    title: 'L\'Oreal Beauty Genius AI App Achieves 280% Conversion Rate Uplift',
    link: 'https://news.google.com/rss/search?q=LOreal+Beauty+Genius+AI+app+conversion+2026',
    description: 'L\'Oreal reported its Beauty Genius AI skin analysis and product recommendation app achieved a 280% improvement in purchase conversion rates, driving record digital revenue.',
    date: todayISO,
    sourceId: 'following-industry-cosmetics',
    sourceName: '💄 Beauty & Cosmetics News',
    lang: 'en',
    category: 'Cosmetics',
    region: 'EU',
    followingIndustry: 'cosmetics',
    followingCompanyIds: [140],
    aiAnalysis: {
      translatedTitle: '로레알 뷰티지니어스 AI 앱, 구매 전환율 280% 향상... AI 뷰티테크 상업화 입증',
      summary: [
        '로레알(L\'Oreal)의 뷰티지니어스(Beauty Genius) AI 피부 분석·제품 추천 앱이 구매 전환율을 280% 향상시키는 성과를 달성하며, AI 뷰티테크의 상업적 효과가 공식 입증됐습니다.',
        '뷰티지니어스는 스마트폰 카메라로 피부 상태를 AI 분석한 후 개인 맞춤형 스킨케어·메이크업 제품을 추천하고, AR 가상 메이크업 시뮬레이션까지 제공하는 엔드투엔드 뷰티 AI 플랫폼입니다.',
        '전환율 280% 개선은 오프라인 뷰티 카운슬러 서비스와 유사한 개인화 경험을 온라인에서 구현함으로써, 이커머스 뷰티 시장의 구매 여정(Customer Journey)을 혁신적으로 단축한 결과입니다.'
      ],
      implications: [
        'AI 뷰티테크 도입 기업들의 이커머스 전환율 우위는 마케팅 ROI에서 전통 채널을 압도하며, 중장기적으로 뷰티 이커머스 시장의 점유율을 AI 솔루션 보유 기업으로 집중시킵니다.',
        '로레알의 성공 사례는 아모레퍼시픽·에스티로더·시세이도 등 글로벌 뷰티 기업들의 AI 뷰티테크 투자 경쟁을 가속화하며, 뷰티 AI 솔루션 스타트업들의 파트너십·투자 유치가 급증합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_cos_0719_3',
    title: 'TikTok Shop Beauty Category Crosses $800M Monthly, Challenging Amazon',
    link: 'https://news.google.com/rss/search?q=TikTok+Shop+beauty+cosmetics+revenue+2026',
    description: 'TikTok Shop\'s beauty and cosmetics category surpassed $800 million in monthly global sales, closing in on Amazon Beauty as live-stream shopping drives impulse purchases.',
    date: todayISO,
    sourceId: 'following-industry-cosmetics',
    sourceName: '💄 Beauty & Cosmetics News',
    lang: 'en',
    category: 'Cosmetics',
    region: 'GLOBAL',
    followingIndustry: 'cosmetics',
    followingCompanyIds: [138, 139],
    aiAnalysis: {
      translatedTitle: '틱톡샵 뷰티 카테고리 월 매출 8억 달러 돌파... 아마존 뷰티 추격전',
      summary: [
        '틱톡샵(TikTok Shop)의 뷰티·화장품 카테고리 글로벌 월 매출이 8억 달러를 돌파하며, 아마존 뷰티 카테고리를 빠르게 추격하고 있습니다.',
        '틱톡샵의 성장 동력은 라이브커머스와 숏폼 영상의 결합으로, 인플루언서가 실시간 시연하며 판매하는 방식이 소비자의 충동구매를 자극하는 데 특히 효과적입니다.',
        'K뷰티 브랜드들은 틱톡샵에서 유난히 강한 성과를 보이고 있으며, 한국 ODM 기업들이 빠르게 틱톡샵 인플루언서 네트워크와 연계한 전용 제품 라인을 개발하고 있습니다.'
      ],
      implications: [
        '틱톡샵의 뷰티 시장 부상은 기존 오프라인 백화점·드럭스토어 채널의 화장품 매출을 잠식하며, K뷰티 ODM 기업들의 소셜커머스 전용 제품 수주가 새로운 성장 엔진이 됩니다.',
        '라이브커머스 기반의 인스턴트 판매는 재고 예측이 어려워 신속한 ODM 생산(4~6주 납기)이 가능한 기업들의 경쟁 우위를 강화하며, 코스맥스·한국콜마의 단기 납기 ODM 역량이 핵심 차별화 포인트가 됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_cos_0719_4',
    title: 'EU Cosmetics Regulation Bans 1,200+ Ingredients, Driving Clean Beauty Mandatory Transition',
    link: 'https://news.google.com/rss/search?q=EU+cosmetics+regulation+clean+beauty+ingredient+ban+2026',
    description: 'The EU\'s updated cosmetics regulation bans over 1,200 additional ingredients starting 2026, forcing global beauty brands to reformulate products to maintain European market access.',
    date: todayISO,
    sourceId: 'following-industry-cosmetics',
    sourceName: '💄 Beauty & Cosmetics News',
    lang: 'en',
    category: 'Cosmetics',
    region: 'EU',
    followingIndustry: 'cosmetics',
    followingCompanyIds: [138, 139, 140],
    aiAnalysis: {
      translatedTitle: 'EU 화장품 규정, 1,200개 성분 추가 금지... 클린뷰티 전환 의무화로 ODM 대형사 수혜',
      summary: [
        'EU가 2026년부터 1,200개 이상의 화장품 성분을 추가 금지하는 개정 화장품 규정을 시행하며, 글로벌 뷰티 브랜드들의 전면적인 제품 재배합(Reformulation)이 의무화됩니다.',
        '금지 성분에는 일부 파라벤 유도체·특정 향료·합성 자외선 차단 성분이 포함되어 있어, EU 시장을 대상으로 하는 거의 모든 스킨케어·메이크업 제품 라인의 성분표 수정이 필요합니다.',
        '규제 대응 과정에서 클린뷰티 성분(자연 유래·친환경 원료) 공급 기업들의 수요가 폭발하고 있으며, 이 과정에서 글로벌 클린뷰티 원료 조달 네트워크를 갖춘 대형 ODM 기업이 절대적 강점을 발휘합니다.'
      ],
      implications: [
        'EU 성분 규제 강화는 소형 뷰티 브랜드들의 대응 비용 부담을 가중시켜 시장 집중화를 가속화하며, 규제 컴플라이언스 역량을 보유한 대형 ODM(코스맥스·한국콜마)으로의 아웃소싱이 급증합니다.',
        '클린뷰티 원료 재배합 수요는 자연 유래 성분 정제 기업(바스프 뷰티케어 사업부, 크로다 인터내셔널)과 식물 추출물 전문 기업들의 뷰티 부문 수주를 구조적으로 확대시킵니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_cos_0719_5',
    title: 'Amorepacific US Sales Surge 95% as Innisfree and Laneige Expand into Walmart',
    link: 'https://news.google.com/rss/search?q=Amorepacific+US+sales+Walmart+Innisfree+Laneige+2026',
    description: 'Amorepacific reported US sales surging 95% YoY as brands Innisfree and Laneige secured major shelf space expansions at Walmart, Target, and Ulta Beauty nationwide.',
    date: todayISO,
    sourceId: 'following-industry-cosmetics',
    sourceName: '💄 Beauty & Cosmetics News',
    lang: 'en',
    category: 'Cosmetics',
    region: 'KR',
    followingIndustry: 'cosmetics',
    followingCompanyIds: [136],
    aiAnalysis: {
      translatedTitle: '아모레퍼시픽 미국 매출 95% 급증... 이니스프리·라네즈 월마트·타겟 전국 입점 확대',
      summary: [
        '아모레퍼시픽(090430.KS)이 이니스프리·라네즈 브랜드의 월마트·타겟·얼타 전국 매장 입점 확대에 힘입어 미국 매출이 전년 동기 대비 95% 급증하는 성과를 달성했습니다.',
        '특히 라네즈의 립 슬리핑 마스크와 이니스프리의 그린티 시드 세럼이 미국 Z세대 틱톡 바이럴로 수요가 폭발하며, 온라인에서 오프라인 주류 유통망으로 입점이 이루어진 성공적인 디지털-투-오프라인(D2O) 전환 사례입니다.',
        '아모레퍼시픽의 미국 사업 비중이 전체 매출의 15%를 돌파하며, 중국 의존도를 낮추는 지역 다변화 전략이 성과를 내고 있습니다.'
      ],
      implications: [
        '아모레퍼시픽의 미국 주류 유통 입점 성공은 국내 경쟁사(LG생활건강·애경산업)들의 미국 유통망 확보 경쟁을 촉발하며, K뷰티 기업들의 미국 마케팅 투자가 급증합니다.',
        '월마트·타겟의 K뷰티 전용 섹션 신설은 미국 소비자들의 K뷰티 접근성을 획기적으로 높여, 시장 침투율이 현재 3%에서 2030년 10% 이상으로 확대되는 장기 성장 구조가 형성됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },

  // ─── 🍽️ 식음료 (food) ─────────────────────────────────────────
  {
    id: 'id_food_0719_1',
    title: 'Korean Ramen Exports Hit All-Time High as Nongshim Shin Ramen Enters 85 Countries',
    link: 'https://news.google.com/rss/search?q=Nongshim+ramen+export+record+2026',
    description: 'Korean ramen exports set a new annual record surpassing $1 billion, with Nongshim Shin Ramen now available in 85 countries and securing major US distribution expansion at Walmart and Costco.',
    date: todayISO,
    sourceId: 'following-industry-food',
    sourceName: '🍽️ Food & Beverage News',
    lang: 'en',
    category: 'Food',
    region: 'KR',
    followingIndustry: 'food',
    followingCompanyIds: [142],
    aiAnalysis: {
      translatedTitle: '한국 라면 수출 역대 최고 10억 달러 돌파... 농심 신라면 85개국 진출, 월마트·코스트코 확대',
      summary: [
        '한국 라면 수출이 처음으로 연간 10억 달러를 돌파하며 역대 최고 기록을 세웠습니다. 농심 신라면이 85개국에 진출하고 미국 월마트·코스트코 전국 입점을 확대한 것이 핵심 동력입니다.',
        'K드라마·K무비(기생충·오징어게임)의 글로벌 인기가 한국 라면에 대한 문화적 호기심과 구매 의향을 지속적으로 자극하고 있으며, 특히 MZ세대의 \'먹방\' 트렌드와 결합하여 소셜미디어 기반 유기적 수요 창출이 이루어지고 있습니다.',
        '미국 현지 소비자가 일반 라면 대비 2~3배 높은 프리미엄 가격(패밀리팩 기준 약 $12~15)을 기꺼이 지불해 ASP가 국내 판매 대비 월등히 높아 수출 수익성이 국내 판매를 상회합니다.'
      ],
      implications: [
        '농심의 미국 수출 확대는 환율 헤지 효과(달러 매출 증가)와 프리미엄 가격 책정이라는 이중 혜택을 가져오며, 농심의 미국 비중이 전체 매출의 20%를 향해 확대되면서 실적의 외형 성장이 지속됩니다.',
        '오뚜기·팔도 등 경쟁사들의 미국 수출 확대 경쟁이 가열되며, 한국 라면 전체의 미국 현지 마케팅 투자가 급증합니다. 이는 미국 내 한국식 식품 전반의 인지도 상승을 가속화하는 선순환을 만듭니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_food_0719_2',
    title: 'CJ CheilJedang Bibigo Becomes Top 5 Frozen Food Brand in US Retail',
    link: 'https://news.google.com/rss/search?q=CJ+CheilJedang+Bibigo+US+frozen+food+2026',
    description: 'CJ CheilJedang\'s Bibigo brand has entered the top 5 frozen food brands in US retail by volume, with mandu (dumplings) and rice cakes driving explosive category growth.',
    date: todayISO,
    sourceId: 'following-industry-food',
    sourceName: '🍽️ Food & Beverage News',
    lang: 'en',
    category: 'Food',
    region: 'KR',
    followingIndustry: 'food',
    followingCompanyIds: [141],
    aiAnalysis: {
      translatedTitle: 'CJ 비비고, 미국 냉동식품 브랜드 TOP5 진입... 만두·떡 카테고리 폭발적 성장',
      summary: [
        'CJ제일제당의 비비고(Bibigo) 브랜드가 판매량 기준 미국 냉동식품 상위 5위 브랜드에 진입하며, 한국계 식품 브랜드 최초로 미국 주류 냉동식품 시장의 핵심 플레이어가 됐습니다.',
        '만두(Dumpling)·떡볶이·비비고 볶음밥 3개 카테고리가 미국 소비자들의 \'편의식 한식\' 수요를 충족하며, 월마트·코스트코·홀푸즈 전국 냉동 코너에서 맛보기 체험 행사(Demo)를 상시 운영하고 있습니다.',
        'CJ제일제당은 미국 비비고 사업에서 2026년 매출 1조원(약 7억 달러) 돌파가 유력하며, 북미 법인의 영업이익률도 10%를 상회하는 것으로 추산됩니다.'
      ],
      implications: [
        'CJ제일제당 비비고의 미국 시장 성공은 한국 식품 대기업들이 \'에스닉 식품\' 카테고리를 넘어 미국 주류 식품 브랜드로 도약하는 분기점을 의미하며, 후발 K푸드 기업들의 글로벌 진출에 대한 시장 검증이 됩니다.',
        '미국 내 비비고 성장은 CJ제일제당의 미국 생산 시설(캘리포니아·텍사스) 추가 증설 투자로 이어져, 미국 현지 고용 창출과 함께 제조 원가 절감 효과도 기대됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_food_0719_3',
    title: 'Monster Beverage Net Revenue Rises 14% as Energy Drink Category Outpaces Soda',
    link: 'https://news.google.com/rss/search?q=Monster+Beverage+revenue+energy+drink+2026',
    description: 'Monster Beverage reported 14% revenue growth as the energy drink category continues to outpace traditional carbonated soft drinks, with Monster gaining distribution in 40 new international markets.',
    date: todayISO,
    sourceId: 'following-industry-food',
    sourceName: '🍽️ Food & Beverage News',
    lang: 'en',
    category: 'Food',
    region: 'US',
    followingIndustry: 'food',
    followingCompanyIds: [143],
    aiAnalysis: {
      translatedTitle: '몬스터 베버리지 매출 14% 성장... 에너지 드링크 카테고리, 탄산음료 추월 임박',
      summary: [
        '몬스터 베버리지(MNST)가 14% 매출 성장을 달성하며, 에너지 드링크 카테고리가 전통 탄산음료(Cola·스프라이트)의 성장률을 압도하고 있습니다.',
        '에너지 드링크 시장의 성장 배경은 ① 카페인+기능성 성분 결합에 대한 소비자 선호 증가, ② 10~30대의 기존 탄산음료 대체 수요, ③ 신흥 시장(라틴아메리카·동남아·중동) 진출 가속화입니다.',
        '몬스터는 2026년 신규 40개국 진출로 글로벌 유통망을 160개국으로 확대하며, 코카콜라의 글로벌 유통 인프라를 전략적으로 활용하고 있습니다.'
      ],
      implications: [
        '에너지 드링크 시장의 구조적 성장은 셀시우스(CELH)·레드불·록스타 등 경쟁사들과의 전쟁이 심화되는 가운데, 몬스터의 브랜드 충성도와 코카콜라 채널 활용이 핵심 방어 해자가 됩니다.',
        '기능성 음료 트렌드는 단순 에너지 부스터를 넘어 수면 지원·스트레스 완화·인지 능력 향상 등 헬스케어 기능성 음료로 진화하며, 바이오·제약 기업들의 음료 시장 진출이 가속화됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 7, specialistAnalysis: null
  },
  {
    id: 'id_food_0719_4',
    title: 'Precision Fermentation Startup Perfect Day Seeks $500M in Series D for Scale-Up',
    link: 'https://news.google.com/rss/search?q=precision+fermentation+Perfect+Day+funding+2026',
    description: 'Perfect Day is raising $500 million in Series D funding to scale precision fermentation production of animal-free dairy proteins, backed by growing demand from global food companies.',
    date: todayISO,
    sourceId: 'following-industry-food',
    sourceName: '🍽️ Food & Beverage News',
    lang: 'en',
    category: 'Food',
    region: 'US',
    followingIndustry: 'food',
    followingCompanyIds: [141, 143],
    aiAnalysis: {
      translatedTitle: '정밀 발효 기업 퍼펙트데이, 5억 달러 시리즈D 추진... 동물 없는 유청 단백질 대량 생산',
      summary: [
        '정밀 발효(Precision Fermentation) 전문 기업 퍼펙트데이(Perfect Day)가 동물 없는 유청 단백질(Whey Protein) 대량 생산 설비 확장을 위한 5억 달러 시리즈D 펀딩을 추진하고 있습니다.',
        '정밀 발효 방식은 미생물(효모·박테리아)에 유제품 단백질 유전자를 삽입해 발효조에서 실제 우유 단백질(카세인·유청)과 동일한 구조의 단백질을 생산하는 기술로, 소 없이 \"진짜 우유 단백질\"을 만듭니다.',
        '글로벌 식품 대기업 Archer-Daniels-Midland(ADM)·Fonterra·유제품 기업들이 퍼펙트데이와 공급 계약을 체결하며, 제과·아이스크림·단백질 바 등에 정밀 발효 단백질이 적용되기 시작했습니다.'
      ],
      implications: [
        '정밀 발효 기술이 상업적 스케일에서 검증되면 전통 낙농업 공급망(목장→유가공→유통)의 구조적 해체가 시작되며, ADM·칼라일그룹 등 대형 식품 원료 기업들이 이 기술 확보를 위한 M&A에 나설 가능성이 높습니다.',
        '국내 CJ제일제당·농심은 이미 단백질 식품 사업 강화를 선언했으며, 정밀 발효 원료를 활용한 한국식 프리미엄 단백질 식품 개발이 새로운 수출 카테고리로 부상할 수 있습니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },
  {
    id: 'id_food_0719_5',
    title: 'Nestlé Rolls Out AI Supply Chain Optimizer Cutting Food Waste 30% Globally',
    link: 'https://news.google.com/rss/search?q=Nestle+AI+supply+chain+food+waste+reduction+2026',
    description: 'Nestlé reported its global AI-powered demand forecasting and supply chain optimization system reduced food waste by 30% and saved $420 million in operational costs in 2025.',
    date: todayISO,
    sourceId: 'following-industry-food',
    sourceName: '🍽️ Food & Beverage News',
    lang: 'en',
    category: 'Food',
    region: 'EU',
    followingIndustry: 'food',
    followingCompanyIds: [141, 142],
    aiAnalysis: {
      translatedTitle: '네슬레, AI 공급망 최적화로 식품 폐기물 30% 절감·운영비 4,200억원 절약',
      summary: [
        '네슬레(Nestlé)가 전사적으로 도입한 AI 기반 수요 예측·공급망 최적화 시스템이 2025년 글로벌 식품 폐기물을 30% 절감하고 운영 비용 4억 2,000만 달러를 절약하는 성과를 달성했다고 발표했습니다.',
        '네슬레의 AI 시스템은 190개국 판매 데이터·날씨·소비자 트렌드·소셜미디어 신호를 실시간 학습해 재고 보충 시점을 최적화하며, 공장 생산 스케줄을 자동으로 조정합니다.',
        '식품 폐기물 30% 절감은 ESG 목표 달성에도 기여하며, 투자자들의 ESG 평가 점수 상향 조정과 함께 지속가능성 특화 펀드의 네슬레 비중 확대를 촉진합니다.'
      ],
      implications: [
        '네슬레의 AI 공급망 성공 사례는 CJ제일제당·농심·롯데식품 등 한국 식품 대기업들의 AI 공급망 도입 투자를 가속화하는 벤치마크가 되며, 관련 IT 솔루션(SAP AI·o9 Solutions) 기업들의 수주가 증가합니다.',
        '식품 제조업에서의 AI 공급망 투자는 인플레이션 환경에서 원가 절감 수단으로 각광받으며, B2B AI 공급망 솔루션 기업들의 식품 부문 계약 수주가 제조·유통에 이은 제3의 성장 채널로 부상합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 8, specialistAnalysis: null
  },

  // ─── 🔬 DRAM 반도체 전용 5개 ──────────────────────────────────
  {
    id: 'id_dram_0719_1',
    title: 'Samsung 1-Gamma DRAM Process Achieves 30% Power Reduction with GAA Transistors',
    link: 'https://news.google.com/rss/search?q=Samsung+1gamma+DRAM+GAA+transistor+2026',
    description: 'Samsung Electronics has successfully demonstrated its 1-Gamma (1γ) DRAM process technology, the industry\'s first to apply Gate-All-Around (GAA) transistors to DRAM, achieving 30% power reduction vs DDR5.',
    date: todayISO,
    sourceId: 'following-industry-semiconductor',
    sourceName: '🔬 Semiconductor DRAM News',
    lang: 'en',
    category: 'Semiconductor',
    region: 'KR',
    followingIndustry: 'semiconductor',
    followingCompanyIds: [105, 103, 108],
    aiAnalysis: {
      translatedTitle: '삼성 1γ(1-감마) DRAM 공정 성공... GAA 트랜지스터 최초 적용, 전력 30% 절감',
      summary: [
        '삼성전자가 세계 최초로 GAA(Gate-All-Around) 트랜지스터를 DRAM에 적용한 1γ(1-감마) 공정 개발에 성공하여, DDR5 대비 전력 소모 30% 감소, 성능 20% 향상, 면적 15% 축소를 동시에 달성했습니다.',
        '기존 DRAM은 핀펫(FinFET) 구조였으나 GAA 적용으로 전류 누설을 90% 이상 줄이면서 집적도를 획기적으로 높일 수 있어, AI 서버와 HBM(고대역폭메모리) 설계에 최적화된 차세대 공정입니다.',
        '1γ 기반 양산은 2027년으로 예정되어 있으며, 이를 기반으로 한 HBM4E(6세대 HBM)가 엔비디아 루빈 울트라 GPU의 핵심 메모리로 채택될 전망입니다.'
      ],
      implications: [
        'GAA DRAM 공정 전환은 EUV 레이어 수를 현재 대비 1.5배 이상 증가시키며 ASML(ASML)의 High-NA EUV 장비 수요를 폭발적으로 증가시킵니다. 또한 HAR(High Aspect Ratio) 식각 공정 수요로 램리서치(LRCX)의 메모리향 매출 비중이 확대됩니다.',
        '삼성의 1γ 성공은 SK하이닉스에 대한 메모리 기술 경쟁 압박을 강화하며, SK하이닉스도 GAA DRAM 개발을 앞당길 것으로 예상됩니다. 이는 메모리 반도체 전체의 기술 혁신 사이클을 가속화합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 10, specialistAnalysis: null
  },
  {
    id: 'id_dram_0719_2',
    title: 'HBM4 Specification Finalized: JEDEC Confirms 2TB/s Bandwidth Standard',
    link: 'https://news.google.com/rss/search?q=HBM4+specification+JEDEC+bandwidth+2026',
    description: 'JEDEC has officially released the final HBM4 memory standard specification, confirming 2TB/s per stack bandwidth at 12-high configuration, double the HBM3E performance.',
    date: todayISO,
    sourceId: 'following-industry-semiconductor',
    sourceName: '🔬 Semiconductor DRAM News',
    lang: 'en',
    category: 'Semiconductor',
    region: 'US',
    followingIndustry: 'semiconductor',
    followingCompanyIds: [105, 106, 103],
    aiAnalysis: {
      translatedTitle: 'JEDEC, HBM4 최종 표준 확정... 12단 스택 2TB/s 대역폭, HBM3E의 2배',
      summary: [
        'JEDEC(반도체 표준화 기구)이 HBM4(4세대 고대역폭메모리) 최종 표준 규격을 공식 발표하며, 12단 스택 기준 2TB/s(초당 2테라바이트) 대역폭과 DDR5 인터페이스와의 호환성을 확정했습니다.',
        'HBM4의 2TB/s 대역폭은 HBM3E(1.2TB/s) 대비 약 67% 향상된 수치로, 엔비디아 루빈(Rubin) GPU 아키텍처의 성능 목표에 부합하는 설계입니다.',
        'SK하이닉스와 마이크론이 HBM4 양산 파일럿 라인을 운영 중이며, 삼성전자도 GAA 기반 1γ 공정을 HBM4E에 적용하는 로드맵을 추진하고 있어 2027~2028년 HBM4 본격 양산 경쟁이 예고됩니다.'
      ],
      implications: [
        'HBM4 표준 확정은 AI 가속기 설계 기업들(엔비디아·AMD·구글TPU팀)의 차세대 GPU 설계 로드맵을 구체화하는 출발점이 되며, 관련 HBM 패키징(CoWoS-S/L/R) 용량 증설을 위한 TSMC의 추가 투자를 견인합니다.',
        '12단 TSV 공정의 HBM4는 현재 기술보다 훨씬 정교한 본딩·언더필 소재가 필요하며, 한미반도체의 TC본더·네패스의 언더필 소재 수요가 HBM4 양산 사이클에서 폭발합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 10, specialistAnalysis: null
  },
  {
    id: 'id_dram_0719_3',
    title: 'DDR6 DRAM Standard Ratified: Samsung Begins 12Gb DDR6 Validation Samples',
    link: 'https://news.google.com/rss/search?q=DDR6+DRAM+standard+Samsung+samples+2026',
    description: 'JEDEC ratified the DDR6 standard featuring up to 17,600 MT/s data rates, and Samsung has begun shipping 12Gb DDR6 validation samples to major server OEM customers.',
    date: todayISO,
    sourceId: 'following-industry-semiconductor',
    sourceName: '🔬 Semiconductor DRAM News',
    lang: 'en',
    category: 'Semiconductor',
    region: 'KR',
    followingIndustry: 'semiconductor',
    followingCompanyIds: [105, 106],
    aiAnalysis: {
      translatedTitle: 'DDR6 표준 비준, 삼성 12Gb DDR6 검증 샘플 출하... 차세대 서버 메모리 시대 개막',
      summary: [
        'JEDEC가 최대 17,600MT/s 전송 속도를 지원하는 DDR6 표준을 공식 비준하고, 삼성전자가 주요 서버 OEM 고객들에게 12Gb DDR6 검증 샘플 출하를 시작했습니다.',
        'DDR6는 DDR5(최대 8,800MT/s) 대비 2배 이상 빠른 전송 속도와 30% 낮은 전력 소모를 구현하며, AI 서버·엣지 컴퓨팅·자율주행 차량용 메모리로 최적화됩니다.',
        '서버 OEM(HPE·델·슈퍼마이크로)들이 DDR6 기반 차세대 서버 플랫폼을 2027년 하반기 출시를 목표로 설계 중이며, DDR6 채택 서버의 AI 추론 성능이 DDR5 대비 35~40% 향상이 예상됩니다.'
      ],
      implications: [
        'DDR6 전환 사이클은 삼성전자·SK하이닉스의 서버 DRAM 평균판매단가(ASP)를 DDR5 대비 40~60% 끌어올릴 것으로 예상되며, 2028~2029년 서버 DRAM 교체 수요 폭증이 메모리 반도체 업사이클의 다음 파동을 형성합니다.',
        'DDR6의 높은 클록 속도는 신호 무결성 문제를 유발하여 차세대 DDR6 레지스터드 버퍼·클록 드라이버 반도체 수요가 증가하며, 램버스(Rambus)·SK하이닉스 파생 특허 기업들의 로열티 수익이 확대됩니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },
  {
    id: 'id_dram_0719_4',
    title: 'Micron Achieves 25% HBM Market Share with AMD MI350 Supply Win',
    link: 'https://news.google.com/rss/search?q=Micron+HBM+market+share+AMD+MI350+2026',
    description: 'Micron Technology has secured AMD MI350 as its primary HBM3E customer, propelling its HBM market share to approximately 25% and significantly eroding SK Hynix\'s dominance.',
    date: todayISO,
    sourceId: 'following-industry-semiconductor',
    sourceName: '🔬 Semiconductor DRAM News',
    lang: 'en',
    category: 'Semiconductor',
    region: 'US',
    followingIndustry: 'semiconductor',
    followingCompanyIds: [106, 105],
    aiAnalysis: {
      translatedTitle: '마이크론, AMD MI350 전용 HBM3E 공급으로 시장 점유율 25% 달성... SK하이닉스 독점 균열',
      summary: [
        '마이크론(MU)이 AMD MI350 AI 가속기의 주요 HBM3E 공급사로 선정되어 HBM 시장 점유율이 약 25%에 도달하며, SK하이닉스의 시장 지배력에 균열이 발생하기 시작했습니다.',
        '마이크론은 보이시·히로시마 공장의 HBM 생산 능력을 풀가동하고 TSMC의 CoWoS-L 패키징을 적극 활용하며, 2025년 대비 HBM 생산량을 3배 이상 확대했습니다.',
        '마이크론의 HBM3E가 AMD MI350에 채택된 것은 기술 검증이 완료됐다는 신호로, 향후 구글 TPU·아마존 트레이니엄에도 공급처 다변화 가능성이 열렸습니다.'
      ],
      implications: [
        '마이크론의 HBM 점유율 확대는 전체 HBM 공급량을 늘려 단기 현물 가격에는 조정 압력이 될 수 있지만, 구조적 HBM 부족은 2027년까지 지속될 것으로 예상되어 공급 과잉으로 전환될 리스크는 낮습니다.',
        '마이크론의 부상은 SK하이닉스의 가격 프리미엄을 일부 낮추는 효과가 있어, AI 가속기 기업들의 HBM 조달 비용 감소로 GPU 가격 인하 여력이 생기며 AI 서비스 비용 절감 트렌드를 가속화합니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  },
  {
    id: 'id_dram_0719_5',
    title: 'In-Memory Computing Architecture Emerges as Post-HBM Solution for AI Workloads',
    link: 'https://news.google.com/rss/search?q=in-memory+computing+AI+DRAM+post-HBM+2026',
    description: 'Research institutions and startups are developing Processing-in-Memory (PIM) and Compute-near-Memory (CNM) architectures that could overcome the memory bandwidth wall beyond HBM4.',
    date: todayISO,
    sourceId: 'following-industry-semiconductor',
    sourceName: '🔬 Semiconductor DRAM News',
    lang: 'en',
    category: 'Semiconductor',
    region: 'US',
    followingIndustry: 'semiconductor',
    followingCompanyIds: [105, 106, 104],
    aiAnalysis: {
      translatedTitle: '인메모리 컴퓨팅 아키텍처, HBM4 이후 AI 한계 돌파 솔루션으로 부상',
      summary: [
        '연구 기관과 반도체 스타트업들이 HBM4의 대역폭 한계(2TB/s)를 넘어서기 위한 PIM(처리-인-메모리)·CNM(메모리 근접 연산) 아키텍처 개발에 속도를 내고 있습니다.',
        'PIM 방식은 DRAM 셀 내부에 연산 유닛을 내장하여 데이터를 프로세서로 이동시키는 기존 방식 대신 메모리 내에서 직접 연산을 수행함으로써, 데이터 이동에 소요되는 전력과 레이턴시를 80% 이상 절감합니다.',
        'SK하이닉스(AiMX), 삼성전자(HBM-PIM), UPMEM, Axelera AI 등이 PIM 기반 메모리 제품을 출시 또는 개발 중이며, 특히 LLM(대형언어모델) 추론(Inference) 워크로드에서 기존 HBM+GPU 조합 대비 3~5배 에너지 효율 향상이 시연됐습니다.'
      ],
      implications: [
        'PIM·CNM 아키텍처가 상용화될 경우 현재 HBM 중심의 AI 가속기 생태계가 \'메모리 내 연산\' 중심으로 재편되며, DRAM 기업(삼성·SK하이닉스·마이크론)이 GPU 기업과 동등한 AI 인프라 핵심 기업으로 부상합니다.',
        'AI 추론 칩의 에너지 효율이 PIM으로 획기적 개선될 경우 데이터센터 전력 소비 문제가 완화되고, AI 서비스의 한계 비용이 낮아져 더 많은 소비자용 AI 응용 서비스가 경제적으로 가능해집니다.'
      ],
      isPremiumCuration: true
    },
    isCurated: true, specialistScore: 9, specialistAnalysis: null
  }
];

// ============================================================
// 기사를 news-archive.json에 인젝션 (객체 구조 대응)
// ============================================================
let injectedCount = 0;
let skippedCount = 0;

for (const article of newArticles) {
  if (archive[article.id]) {
    skippedCount++;
    continue;
  }
  // 분석 데이터를 기사에 병합
  archive[article.id] = {
    ...article,
    aiAnalysis: article.aiAnalysis
  };
  injectedCount++;
}

fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(archive, null, 2), 'utf8');

console.log('');
console.log('✅ [inject-0719] 완료');
console.log(`   신규 인젝션: ${injectedCount}개`);
console.log(`   이미 존재: ${skippedCount}개`);
console.log(`   총 아카이브: ${Object.keys(archive).length}개`);

// 산업별 집계
const byIndustry = {};
newArticles.forEach(a => {
  byIndustry[a.followingIndustry] = (byIndustry[a.followingIndustry] || 0) + 1;
});
console.log('\n📊 산업별 인젝션:');
Object.entries(byIndustry).forEach(([k, v]) => {
  console.log(`   ${k}: ${v}건`);
});
