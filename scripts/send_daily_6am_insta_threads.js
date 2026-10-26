#!/usr/bin/env node
/**
 * scripts/send_daily_6am_insta_threads.js
 * Daily 06:00 AM KST (@kids_fit1) Webtoon Auto-Sender for Telegram.
 *
 * Strictly ordered per user request ("인스타용 -> 쓰레드용 -> 릴스용 순서대로 + 바로 복사붙여넣기 가능하게"):
 * 1. [1순서: 인스타그램용 (@kids_fit1)]
 *    - 5 Carousel Images (1컷~4컷 + 5컷 핵심요약 저장카드)
 *    - 1 Pure Standalone Copy-Paste Text Bubble (인스타 본문 + 해시태그, 헤더/안내문 0글자)
 * 2. [2순서: 쓰레드(Threads)용 (@kids_fit1)]
 *    - 1 Square 2x2 4-Cut Grid Image
 *    - 1 Pure Standalone Copy-Paste Text Bubble #1 (쓰레드 첫 번째 본문, 헤더/안내문 0글자)
 *    - 1 Pure Standalone Copy-Paste Text Bubble #2 (쓰레드 두 번째 댓글 링크, 헤더/안내문 0글자)
 * 3. [3순서: 인스타 릴스(Reels) & 네이버 클립(Clip)용]
 *    - 1 Vertical 9:16 3D Page-Flip MP4 Video (16s, 무음성 피아노·오르골 선율)
 *    - 1 Pure Standalone Copy-Paste Text Bubble #1 (인스타 릴스 본문 + 해시태그)
 *    - 1 Pure Standalone Copy-Paste Text Bubble #2 (네이버 클립 제목)
 *    - 1 Pure Standalone Copy-Paste Text Bubble #3 (네이버 클립 본문 + 해시태그)
 *    - 1 Pure Standalone Copy-Paste Text Bubble #4 (https://kidsfit.co.kr 링크)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const {
  getTelegramConfig,
  telegramApiRequest,
  sendTelegramPhoto,
  loadResearchStatus
} = require('./telegram-notify');

function sendTelegramVideoFile(botToken, chatId, filePath, caption) {
  return new Promise((resolve, reject) => {
    const boundary = '----KidsFitDailyVideo' + Date.now().toString(16);
    const filename = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);
    const parts = [
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption || ''}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="video"; filename="${filename}"\r\nContent-Type: video/mp4\r\n\r\n`),
      fileData,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ];
    const body = Buffer.concat(parts);
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${botToken}/sendVideo`,
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length
        },
        timeout: 120000
      },
      res => {
        let chunks = '';
        res.on('data', d => (chunks += d));
        res.on('end', () => {
          try {
            resolve(JSON.parse(chunks));
          } catch (e) {
            resolve({ ok: false });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const ROOT_DIR = path.resolve(__dirname, '..');
const WEBTOON_DIR = path.join(ROOT_DIR, '웹툰_모음');
const STATE_FILE = path.join(ROOT_DIR, 'logs', 'daily_6am_insta_state.json');

const EPISODE_CATALOG = [
  {
    ep: 1,
    folder: '1화_만3세소근육민감기_웹툰',
    clipFile: '01_네이버클립_웹툰1화_만3세소근육민감기.mp4',
    title: '1화: 만 3세 "내가 혼자 할 거야!" 고집의 진짜 이유 (손끝 소근육 민감기)',
    reelsCaption: '만 3세 아이가 "내가 혼자 할 거야!" 고집부리는 진짜 이유 🌱✨\n떼쓰는 게 아니라 대뇌 운동피질의 30%와 직결된 [손끝 소근육 민감기]가 열렸다는 신호입니다! 비싼 교구 대신 오늘 저녁 주방 나무집게와 휴지심 오리기 놀이를 해보세요.\n📌 프로필 링크(@kids_fit1)에서 우리 아이 월령별 발달 & 키 백분위를 1분 만에 무료로 확인해 보세요!\n#만3세발달 #소근육발달 #육아툰 #인스타툰 #육아릴스 #몬테소리 #가베 #육아소통 #키즈핏',
    clipTitle: "[육아웹툰 1화] 만 3세 '내가 혼자 할 거야!' 고집의 진짜 이유 (손끝 소근육 민감기)",
    clipBody: '우리 아이 1분 무료 성장·두뇌 진단 👉 https://kidsfit.co.kr  #네이버클립 #육아웹툰 #인스타툰 #만3세발달 #소근육발달 #몬테소리 #가베 #육아소통 #워킹맘 #키즈핏'
  },
  {
    ep: 2,
    folder: '2화_초등문장제수학작업기억_웹툰',
    clipFile: '02_네이버클립_웹툰2화_초등문장제수학작업기억.mp4',
    title: '2화: 연산은 100점인데 문장제 수학만 별표 치는 아이 (전두엽 작업기억의 비밀)',
    reelsCaption: '연산은 100점인데 문장제 수학만 별표 치는 아이, 국어 문제가 아닙니다! 🧠✨\n머릿속 칠판(전두엽 작업기억) 용량이 과부하된 상태라 암산을 멈추고 문제지 여백에 조건과 막대그림을 그리게 하면 거짓말처럼 풀립니다.\n📌 프로필 링크(@kids_fit1)에서 우리 아이 두뇌 학습 역량(LQ) & 예상키를 1분 만에 무료로 확인해 보세요!\n#초등수학 #문장제수학 #서술형수학 #작업기억 #메타인지 #백지복습 #육아툰 #인스타툰 #육아릴스 #초등맘 #키즈핏',
    clipTitle: '[교육웹툰 2화] 연산은 100점인데 문장제 수학만 별표 치는 진짜 이유 (작업기억 도해법)',
    clipBody: '우리 아이 1분 무료 성장·두뇌 진단 👉 https://kidsfit.co.kr  #네이버클립 #교육웹툰 #초등수학 #문장제수학 #서술형수학 #작업기억 #메타인지 #백지복습 #초등맘 #키즈핏'
  },
  {
    ep: 3,
    folder: '3화_밤10시숙면숨은키7cm_웹툰',
    clipFile: '03_네이버클립_웹툰3화_밤10시숙면숨은키7cm.mp4',
    title: '3화: 밤마다 우유 먹였는데 키가 안 큰다고요? (밤 10시 성장호르몬 & 하체 스트레칭)',
    reelsCaption: '밤마다 우유 먹였는데 키가 안 큰다면? 취침 직전 우유와 야식을 끊어보세요! 📏✨\n잠들기 직전 음식을 먹으면 혈당·인슐린이 올라가 밤 10시 성장호르몬 분비가 억제됩니다. 취침 2시간 전 공복 + 5분 하체 스트레칭으로 숨은 키 7cm를 깨워주세요!\n📌 프로필 링크(@kids_fit1)에서 우리 아이 3단 예상키를 1분 만에 무료로 확인해 보세요!\n#아이키성장 #어린이키성장 #키크는습관 #밤10시수면 #성장판스트레칭 #어린이칼슘 #육아툰 #인스타툰 #육아릴스 #키즈핏',
    clipTitle: '[성장웹툰 3화] 밤마다 우유 먹였는데 키가 안 큰다고요? (밤 10시 성장호르몬 & 스트레칭)',
    clipBody: '우리 아이 1분 무료 성장·두뇌 진단 👉 https://kidsfit.co.kr  #네이버클립 #성장웹툰 #아이키성장 #어린이키성장 #키크는습관 #밤10시수면 #성장판스트레칭 #어린이칼슘 #키즈핏'
  },
  {
    ep: 4,
    folder: '4화_편식아이미각민감기아연_웹툰',
    clipFile: '04_네이버클립_웹툰4화_편식아이미각민감기아연.mp4',
    title: '4화: 고기·채소 입에도 안 대는 편식 아이 (미각 세포 아연 부족 & 푸드브릿지)',
    reelsCaption: '고기·채소만 보면 입부터 막는 편식 아이, 투정이 아니라 미각 세포 신호입니다! 🥦✨\n혀의 미각 세포를 재생시키는 아연(Zinc)이 부족하면 쓴맛과 질긴 식감에 예민해집니다. 체중 비례 아연 보충과 공룡 쿠키틀 푸드브릿지로 스스로 먹는 식탁을 만들어주세요!\n📌 프로필 링크(@kids_fit1)에서 우리 아이 키·몸무게 백분위 & 맞춤 영양 권장량을 1분 만에 무료로 확인해 보세요!\n#아이편식 #어린이아연 #푸드브릿지 #밥안먹는아이 #어린이영양제 #아이키성장 #육아툰 #인스타툰 #육아릴스 #키즈핏',
    clipTitle: '[영양웹툰 4화] 고기·채소 입에도 안 대는 편식 아이 (미각 세포 아연 부족 & 푸드브릿지)',
    clipBody: '우리 아이 1분 무료 성장·두뇌 진단 👉 https://kidsfit.co.kr  #네이버클립 #육아웹툰 #아이편식 #어린이아연 #푸드브릿지 #밥안먹는아이 #어린이영양제 #키즈핏'
  },
  {
    ep: 5,
    folder: '5화_거북목자세교정숨은키2cm_웹툰',
    clipFile: '05_네이버클립_웹툰5화_거북목자세교정숨은키2cm.mp4',
    title: '5화: 구부정한 거북목·말린 어깨 펴고 숨은 키 2cm & 집중력 동시에 찾은 비결',
    reelsCaption: '구부정한 거북목·말린 어깨 펴고 숨은 키 2cm & 집중력 동시에 찾은 비결! 📏✨\n평평한 책상 위 책을 보려고 고개를 30도만 숙여도 목뼈에 18kg 하중이 가해집니다. 잔소리 대신 35도 각도조절 독서대와 하루 10초 철봉 매달리기로 숨은 키 2cm를 깨워주세요!\n📌 프로필 링크(@kids_fit1)에서 우리 아이 3단 예상키 & 집중력 리포트를 1분 만에 무료로 확인해 보세요!\n#어린이거북목 #자세교정 #숨은키찾기 #각도조절독서대 #초등책상 #실내철봉 #육아툰 #인스타툰 #육아릴스 #키즈핏',
    clipTitle: '[자세웹툰 5화] 구부정한 거북목·말린 어깨 펴고 숨은 키 2cm & 집중력 동시에 찾은 비결',
    clipBody: '우리 아이 1분 무료 성장·두뇌 진단 👉 https://kidsfit.co.kr  #네이버클립 #육아웹툰 #어린이거북목 #자세교정 #숨은키찾기 #각도조절독서대 #초등책상 #키즈핏'
  },
  {
    ep: 6,
    folder: '6화_야간성장통5분온찜질칼슘마그네슘_웹툰',
    clipFile: '06_네이버클립_웹툰6화_야간성장통5분온찜질칼슘마그네슘.mp4',
    title: '6화: 자다가 무릎·종아리 아파서 우는 아이, 키 크는 신호일까? (야간 성장통 5분 루틴)',
    reelsCaption: '자다가 무릎·종아리 아파서 우는 아이, 5분 온찜질 & 칼슘·마그네슘으로 잡아주세요! 🦵✨\n낮에 뼈가 자란 속도를 근육이 따라가지 못해 생기는 성장통은 잠들기 전 5분 따뜻한 수건 찜질과 부드러운 종아리 스트레칭으로 70% 이상 완화됩니다.\n📌 프로필 링크(@kids_fit1)에서 우리 아이 키 백분위 & 꾸준히 관리 시 잠재키를 1분 만에 무료로 확인해 보세요!\n#아이성장통 #어린이성장통 #아이키성장 #키크는습관 #어린이칼슘 #육아툰 #인스타툰 #육아릴스 #초등맘 #키즈핏',
    clipTitle: '[성장웹툰 6화] 자다가 무릎·종아리 아파서 우는 아이? 야간 성장통 5분 온찜질 & 칼슘·마그네슘 루틴',
    clipBody: '우리 아이 1분 무료 성장·두뇌 진단 👉 https://kidsfit.co.kr  #네이버클립 #성장웹툰 #아이성장통 #어린이성장통 #아이키성장 #어린이칼슘 #다리마사지 #초등맘 #키즈핏'
  },
  {
    ep: 7,
    folder: '7화_학원다녀오면까먹는아이백지복습_웹툰',
    clipFile: '07_네이버클립_웹툰7화_학원다녀오면까먹는아이백지복습.mp4',
    title: '7화: 학원 다녀오면 다 안다는데 시험만 보면 틀리는 아이 (3분 파인만 백지복습법)',
    reelsCaption: '학원 다녀오면 다 안다는데 시험만 보면 틀리는 아이, 하루 3분 백지복습으로 바꿔보세요! 🧠✨\n눈으로만 읽는 복습은 뇌의 익숙함 착각을 일으킵니다. 책을 덮고 오늘 배운 핵심 3줄을 빈 종이에 적어 엄마에게 1분만 설명하게 해보세요!\n📌 프로필 링크(@kids_fit1)에서 우리 아이 두뇌 학습 역량(LQ) & 예상키를 1분 만에 무료로 확인해 보세요!\n#백지복습 #메타인지 #초등공부법 #파인만학습법 #자기주도학습 #육아툰 #인스타툰 #육아릴스 #초등맘 #키즈핏',
    clipTitle: '[교육웹툰 7화] 학원 다녀오면 다 안다는데 시험만 보면 틀리는 아이 (3분 백지복습법)',
    clipBody: '우리 아이 1분 무료 성장·두뇌 진단 👉 https://kidsfit.co.kr  #네이버클립 #교육웹툰 #백지복습 #메타인지 #초등공부법 #파인만학습법 #자기주도학습 #초등맘 #키즈핏'
  },
  {
    ep: 8,
    folder: '8화_스마트폰유튜브과몰입전두엽타이머_웹툰',
    clipFile: '08_네이버클립_웹툰8화_스마트폰유튜브과몰입전두엽타이머.mp4',
    title: '8화: 스마트폰·유튜브 끄라고 하면 소리지르는 아이 (무소음 시각 타이머 20분 법칙)',
    reelsCaption: '스마트폰·유튜브 끄라고 하면 우는 아이, 시각 타이머 20분 법칙으로 해결하세요! ⏰✨\n강제로 폰을 뺏으면 도파민이 급락해 짜증이 폭발합니다. 시청 전 아이 손으로 직접 빨간 면적이 줄어드는 시각 타이머를 맞추게 해주세요!\n📌 프로필 링크(@kids_fit1)에서 우리 아이 전두엽 집중력 & 성장 백분위를 1분 만에 무료로 확인해 보세요!\n#시각타이머 #아이집중력 #전두엽발달 #스마트폰약속 #자기조절력 #육아툰 #인스타툰 #육아릴스 #키즈핏',
    clipTitle: "[두뇌웹툰 8화] 스마트폰·유튜브 끄라고 하면 우는 아이, '시각 타이머 20분 법칙'으로 해결!",
    clipBody: '우리 아이 1분 무료 성장·두뇌 진단 👉 https://kidsfit.co.kr  #네이버클립 #두뇌웹툰 #시각타이머 #아이집중력 #전두엽발달 #자기조절력 #스마트폰약속 #초등맘 #키즈핏'
  },
  {
    ep: 9,
    folder: '9화_박물관다녀와도기억못하는하브루타_웹툰',
    clipFile: '9화_박물관다녀와도기억못하는하브루타_웹툰',
    clipFile: '09_네이버클립_웹툰9화_박물관다녀와도기억못하는하브루타.mp4',
    title: '9화: 주말마다 박물관·과학관 데려가도 기억 못 하는 이유 (출발 전후 하브루타 3단 질문)',
    reelsCaption: '주말마다 박물관·과학관 다녀와도 기억 못 하는 아이, 출발 전후 하브루타 3단 질문으로 바꿔보세요! 🏛️✨\n전시물 100개를 다 보여주려 하기보다 출발 전 차 안에서 오늘 찾을 탐정 미션 1개만 정해주면 아이의 관찰력과 장기기억이 3배 살아납니다.\n📌 프로필 링크(@kids_fit1)에서 우리 지역 맞춤 주말 나들이 코스 & 성장·두뇌 리포트를 1분 만에 무료로 확인해 보세요!\n#주말나들이 #아이와가볼만한곳 #박물관투어 #하브루타 #배경지식 #문해력 #육아툰 #인스타툰 #육아릴스 #키즈핏',
    clipTitle: "[체험웹툰 9화] 박물관·과학관 다녀와도 기억 못 하는 아이? 출발 전후 '하브루타 3단 질문' 비법",
    clipBody: '우리 아이 1분 무료 성장·두뇌 진단 👉 https://kidsfit.co.kr  #네이버클립 #체험웹툰 #주말나들이 #아이와가볼만한곳 #박물관투어 #하브루타 #배경지식 #초등맘 #키즈핏'
  },
  {
    ep: 10,
    folder: '10화_사춘기급성장기숨은키7cm골든타임_웹툰',
    clipFile: '10_네이버클립_웹툰10화_사춘기급성장기숨은키7cm골든타임.mp4',
    title: "10화: 엄마 아빠 키가 작아도 괜찮아요! 후천적 관리로 '숨은 키 +7cm' 더 크는 법",
    reelsCaption: "엄마 아빠 키가 작아도 괜찮아요! 후천적 관리로 '숨은 키 +7cm' 더 클 수 있습니다 📏✨\n유전키(MPH)는 기준점일 뿐, 성장판이 열려 있을 때 밤 10시 숙면·점프 운동·맞춤 영양을 실천하면 최종 성인키는 유전키보다 +5~8cm 더 자랄 수 있습니다!\n📌 프로필 링크(@kids_fit1)에서 우리 아이 3단 예상키(유전키·현재추세·최대잠재키)를 1분 만에 무료로 확인해 보세요!\n#아이키성장 #예상키 #유전키 #숨은키찾기 #키크는습관 #어린이키성장 #육아툰 #인스타툰 #육아릴스 #키즈핏",
    clipTitle: "[성장웹툰 10화] 부모 키가 작아도 후천적 관리로 '숨은 키 +7cm' 더 크는 골든타임 3원칙",
    clipBody: '우리 아이 1분 무료 성장·두뇌 진단 👉 https://kidsfit.co.kr  #네이버클립 #성장웹툰 #아이키성장 #유전키 #예상키계산 #숨은키찾기 #키크는습관 #초등맘 #키즈핏'
  }
];

function loadDailyState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {}
  return { lastSentEpisode: 5, history: [] };
}

function saveDailyState(st) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(st, null, 2) + '\n', 'utf8');
  } catch (e) {}
}

async function sendEpisodePack(epMeta, cfg) {
  const dir = path.join(WEBTOON_DIR, epMeta.folder);
  if (!fs.existsSync(dir)) {
    throw new Error(`Episode folder not found: ${dir}`);
  }

  const research = loadResearchStatus();
  const totalPapers = (research.total_papers || 3894).toLocaleString('ko-KR');

  const gridPath = path.join(dir, '00_전체_4컷_한눈에보기_합본.png');
  const cut1 = path.join(dir, '01_1컷.png');
  const cut2 = path.join(dir, '02_2컷.png');
  const cut3 = path.join(dir, '03_3컷.png');
  const cut4 = path.join(dir, '04_4컷.png');
  const cut5 = path.join(dir, '05_5컷_핵심요약저장카드.png');

  let instaCaption = fs.readFileSync(path.join(dir, '05_인스타그램_본문_해시태그.txt'), 'utf8').trim();
  let threadsP1 = fs.readFileSync(path.join(dir, '06_쓰레드_1번째본문_4컷합본용.txt'), 'utf8').trim();
  let threadsR2 = fs.readFileSync(path.join(dir, '07_쓰레드_2번째이어쓰기_링크댓글용.txt'), 'utf8').trim();

  instaCaption = instaCaption
    .replace(/@계정아이디/g, '@kids_fit1')
    .replace(/논문 [\d,]+편 기반/g, `논문 ${totalPapers}편 기반`)
    .replace(/https:\/\/truthofmarket\.com/g, 'https://kidsfit.co.kr');
  threadsR2 = threadsR2
    .replace(/https:\/\/truthofmarket\.com/g, 'https://kidsfit.co.kr');

  // =========================================================================
  // 1순서: 인스타용 (Instagram Carousel 5장 + 순수 본문 복붙용 말풍선 1개)
  // =========================================================================
  const carouselSlides = [
    [1, cut1, '1/5장 (1컷 — 인스타용 사진 5장을 순서대로 저장 후 바로 아래 말풍선을 통째로 복붙하세요)'],
    [2, cut2, '2/5장 (2컷)'],
    [3, cut3, '3/5장 (3컷)'],
    [4, cut4, '4/5장 (4컷)'],
    [5, cut5, '5/5장 (5컷 요약카드 — 바로 아래 말풍선이 인스타 본문입니다!)']
  ];

  for (const [, sp, desc] of carouselSlides) {
    if (fs.existsSync(sp)) {
      await sendTelegramPhoto(
        cfg.botToken,
        cfg.chatId,
        sp,
        `📸 [1순서 · 인스타용 ${desc} — 제${epMeta.ep}화]`
      );
    }
  }

  // Pure standalone text bubble: Instagram Caption (100% pure text for 1-tap copy & paste)
  await telegramApiRequest(cfg.botToken, 'sendMessage', {
    chat_id: cfg.chatId,
    text: instaCaption,
    disable_web_page_preview: true
  });

  // =========================================================================
  // 2순서: 쓰레드용 (Threads 4컷 바둑판 합본 1장 + 순수 본문 말풍선 + 순수 댓글 말풍선)
  // =========================================================================
  if (fs.existsSync(gridPath)) {
    await sendTelegramPhoto(
      cfg.botToken,
      cfg.chatId,
      gridPath,
      `🧵 [2순서 · 쓰레드용 4컷 합본 — 제${epMeta.ep}화] (이 사진 1장 저장 후 아래 말풍선 2개를 순서대로 첫 글 / 댓글로 복붙하세요!)`
    );
  }

  // Pure standalone text bubble #1: Threads Post 1
  await telegramApiRequest(cfg.botToken, 'sendMessage', {
    chat_id: cfg.chatId,
    text: threadsP1,
    disable_web_page_preview: true
  });

  // Pure standalone text bubble #2: Threads Self-Reply 2 (with link)
  await telegramApiRequest(cfg.botToken, 'sendMessage', {
    chat_id: cfg.chatId,
    text: threadsR2,
    disable_web_page_preview: true
  });

  // =========================================================================
  // 3순서: 릴스 & 네이버 클립용 (Vertical Video + 순수 복붙용 말풍선들)
  // =========================================================================
  if (epMeta.clipFile) {
    const clipPath = path.join(ROOT_DIR, '네이버클립_웹툰영상_모음', epMeta.clipFile);
    if (fs.existsSync(clipPath)) {
      await sendTelegramVideoFile(
        cfg.botToken,
        cfg.chatId,
        clipPath,
        `🎬 [3순서 · 릴스 & 네이버 클립용 세로 영상 — 제${epMeta.ep}화]\n(아래 말풍선들을 그대로 복사해 붙여넣으세요: ①인스타 릴스 본문 ②네이버 클립 제목 ③네이버 클립 설명·태그 ④정보스티커 링크)`
      );

      if (epMeta.reelsCaption) {
        await telegramApiRequest(cfg.botToken, 'sendMessage', {
          chat_id: cfg.chatId,
          text: epMeta.reelsCaption,
          disable_web_page_preview: true
        });
      }
      if (epMeta.clipTitle) {
        await telegramApiRequest(cfg.botToken, 'sendMessage', {
          chat_id: cfg.chatId,
          text: epMeta.clipTitle,
          disable_web_page_preview: true
        });
      }
      if (epMeta.clipBody) {
        await telegramApiRequest(cfg.botToken, 'sendMessage', {
          chat_id: cfg.chatId,
          text: epMeta.clipBody,
          disable_web_page_preview: true
        });
      }
      await telegramApiRequest(cfg.botToken, 'sendMessage', {
        chat_id: cfg.chatId,
        text: 'https://kidsfit.co.kr',
        disable_web_page_preview: true
      });
    }
  }

  console.log(`  ✓ Sent Daily @kids_fit1 Pack (1.Insta -> 2.Threads -> 3.Reels/Clip) for Episode ${epMeta.ep}`);
}

async function main() {
  const cfg = getTelegramConfig();
  if (!cfg.isConfigured || !cfg.chatId) {
    console.error('[Telegram] Bot token or Chat ID not configured.');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const epIdx = args.indexOf('--ep');
  const st = loadDailyState();

  if (epIdx === -1 && args.includes('--advance') && Array.isArray(st.history) && st.history.length > 0) {
    const lastEntry = st.history[st.history.length - 1];
    const lastMs = Date.parse(lastEntry.sentAt || '');
    if (!isNaN(lastMs) && (Date.now() - lastMs) < 12 * 3600 * 1000) {
      console.log(`  [Skip] Daily 6AM pack already sent today (Episode ${lastEntry.ep} at ${lastEntry.sentAt}).`);
      return;
    }
  }

  let targetEpNum = null;
  if (epIdx !== -1 && args[epIdx + 1]) {
    targetEpNum = Number(args[epIdx + 1]);
  } else {
    targetEpNum = (st.lastSentEpisode % EPISODE_CATALOG.length) + 1;
  }

  const epMeta = EPISODE_CATALOG.find(e => e.ep === targetEpNum) || EPISODE_CATALOG[0];
  await sendEpisodePack(epMeta, cfg);

  if (args.includes('--advance') || epIdx !== -1) {
    st.lastSentEpisode = epMeta.ep;
    st.history = st.history || [];
    st.history.push({ ep: epMeta.ep, sentAt: new Date().toISOString() });
    saveDailyState(st);
  }
}

main().catch(err => {
  console.error('[Daily 6AM Insta/Threads Error]:', err.message);
  process.exit(1);
});
