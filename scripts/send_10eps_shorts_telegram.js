#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const MASTER_DIR = path.resolve(__dirname, '../samples/shorts_10eps/mastered');

const EPISODE_META = [
  {
    ep: 1,
    file: 'ep01_newborn_sleep_combo2.mp4',
    title: '🎬 [제1편 · 2가지 꿀조합] 새벽마다 깨는 아기? 신생아 통잠 공식 2가지',
    products: '① 모로반사 스와들업 속싸개 (28,500원)\n② 3D 통기성 에어메쉬 두상 베개 (34,000원)',
    ytTitle: '새벽마다 놀라 깨는 신생아, 딱 이 2가지만 세팅하세요! #신생아통잠 #스와들업 #두상베개 #출산준비',
  },
  {
    ep: 2,
    file: 'ep02_baby_vitamind_drop1.mp4',
    title: '🎬 [제2편 · 1가지 단독집중] 신생아 비타민D + 배앓이 유산균 하루 1방울 끝!',
    products: '① 닥터에디션 베이비 비타민D3 400IU 드롭스 & 유산균 (26,400원)',
    ytTitle: '조리원 퇴소 후 영양제 딱 하나만 고른다면? 하루 1방울 비타민D+유산균 #아기비타민D #신생아유산균 #육아템',
  },
  {
    ep: 3,
    file: 'ep03_liquid_calcium_vs2.mp4',
    title: '🎬 [제3편 · 2가지 1:1 비교] 아기 액상 칼슘, 구연산 시럽 VS 차일드라이프 오렌지맛',
    products: '① 어린이 구연산 칼슘+D3+아연 액상 시럽 (24,800원)\n② 차일드라이프 액상 칼슘 마그네슘 천연 오렌지맛 (22,300원)',
    ytTitle: '돌 아기 액상 칼슘 둘 중 뭐 살까? 흡수율 대용량 VS 오렌지맛 직구템 1:1 비교 #아기칼슘 #차일드라이프 #유아영양제',
  },
  {
    ep: 4,
    file: 'ep04_toddler_walker_montessori2.mp4',
    title: '🎬 [제4편 · 2가지 꿀조합] 돌 아기 대근육 걸음마 + 소근육 두뇌 끝판왕 세트',
    products: '① 성장기 바른 보행 걸음마 학습기 & 안전 헬멧 (38,000원)\n② 몬테소리 원목 도형 맞추기 & 입체 비즈 롤러코스터 (23,500원)',
    ytTitle: '돌 전후 1~3세 아기 대근육·소근육 발달 끝판왕 꿀조합 2가지! #걸음마학습기 #아기안전헬멧 #몬테소리교구',
  },
  {
    ep: 5,
    file: 'ep05_silent_bungee_trampoline1.mp4',
    title: '🎬 [제5편 · 1가지 단독집중] 층간소음 0%! 집에서 키 크는 무소음 번지코드 트램폴린',
    products: '① 어린이 성장판 수직 자극 무소음 번지코드 트램폴린 (65,000원)',
    ytTitle: '밤에 뛰어도 층간소음 0%! 무릎 충격 없이 성장판 자극하는 무소음 번지 트램폴린 #유아트램폴린 #키성장운동 #실내육아템',
  },
  {
    ep: 6,
    file: 'ep06_probiotics_vs_multigummy2.mp4',
    title: '🎬 [제6편 · 2가지 1:1 비교] 4~6세 어린이집 면역 영양제! 초유 유산균 스틱 VS 멀티구미',
    products: '① 키즈 면역 생유산균 100억+아연/초유 성장단 (29,900원)\n② 스마트팬츠 키즈 멀티구미 비타민D3+오메가3 DHA (31,500원)',
    ytTitle: '4~6세 어린이집 면역 영양제 승자는? 초유 생유산균 분말 VS 스마트팬츠 멀티구미 #키즈유산균 #어린이영양제 #스마트팬츠',
  },
  {
    ep: 7,
    file: 'ep07_magnetic_blocks_120p1.mp4',
    title: '🎬 [제7편 · 1가지 단독집중] 스마트폰 단번에 끊게 만든 3D 입체 자석블록 120P',
    products: '① 두뇌 공간지각력 발달 3D 입체 자석 마그네틱 블록 120P (42,000원)',
    ytTitle: '아이 스마트폰 단번에 끊게 만든 마법의 교구! 3D 입체 자석블록 120피스 #자석블록 #창의력교구 #엄마표놀이',
  },
  {
    ep: 8,
    file: 'ep08_ergonomic_chair_bookstand1.mp4',
    title: '🎬 [제8편 · 1가지 단독집중] 초등 입학 전 거북목·척추 싹 잡는 인체공학 성장 의자 + 독서대',
    products: '① 초등학생 인체공학 척추 지지 성장 의자 & 거북목 교정 독서대 (89,000원)',
    ytTitle: '책만 보면 구부정한 아이 거북목! 인체공학 듀얼 등받이 성장의자+원목 독서대로 해결 #초등책상의자 #거북목교정 #독서대',
  },
  {
    ep: 9,
    file: 'ep09_elementary_growth_brain3.mp4',
    title: '🎬 [제9편 · 3가지 시너지] 초등 급성장기 키 성장 + 두뇌 집중력 3종 풀세트',
    products: '① 청소년 급성장기 칼슘마그네슘 D3 K2 츄어블 (34,500원)\n② 노르딕 네츄럴스 데일리 키즈 오메가3 DHA (37,800원)\n③ 그래비트랙스 프로 스타터팩 (58,000원)',
    ytTitle: '초등 급성장기 키+두뇌 동시에 잡는 3종 공식! 칼마디K2 + 오메가3 + 그래비트랙스 #초등영양제 #그래비트랙스 #키성장',
  },
  {
    ep: 10,
    file: 'ep10_free_trial_top4.mp4',
    title: '🎬 [제10편 · 4가지 총정리] 신청만 해도 100% 0원! 연령별 무료체험 4대장 총정리',
    products: '① [0~1세] 웅진북클럽 베이비 오감 그림책 무료체험 (0원)\n② [1~3세] 한솔교육 핀덴베베 말놀이 그림책 체험팩 (0원)\n③ [4~6세] 천재교육 밀크T 아이 AI 학습기 7일 무료체험 (0원)\n④ [7~12세] 아이스크림 홈런 초등 10일 무료체험 (0원)',
    ytTitle: '안 받으면 손해! 신청만 해도 100% 0원 연령별 무료체험 4대장 총정리 #무료체험 #웅진북클럽 #핀덴베베 #밀크T아이 #아이스크림홈런',
  },
];

function sendMultipart(endpoint, fieldName, filePath, contentType, caption) {
  return new Promise((resolve, reject) => {
    const boundary = '----KidsFitBoundary' + Date.now().toString(16);
    const filename = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);

    const parts = [];
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${CHAT_ID}\r\n`
    ));
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="supports_streaming"\r\n\r\ntrue\r\n`
    ));
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="width"\r\n\r\n1080\r\n`
    ));
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="height"\r\n\r\n1920\r\n`
    ));
    if (caption) {
      parts.push(Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`
      ));
    }
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`
    ));
    parts.push(fileData);
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    const body = Buffer.concat(parts);
    const req = https.request({
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/${endpoint}`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      },
      timeout: 180000
    }, (res) => {
      let chunks = '';
      res.on('data', d => chunks += d);
      res.on('end', () => {
        try {
          resolve(JSON.parse(chunks));
        } catch (e) {
          resolve({ ok: false, raw: chunks });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  const filterEps = process.argv.slice(2).map(Number).filter(Boolean);
  const targets = filterEps.length > 0
    ? EPISODE_META.filter(m => filterEps.includes(m.ep))
    : EPISODE_META;

  for (const meta of targets) {
    const fp = path.join(MASTER_DIR, meta.file);
    if (!fs.existsSync(fp)) {
      console.error(`Missing file: ${fp}`);
      continue;
    }
    const stat = fs.statSync(fp);
    console.log(`Uploading Ep${meta.ep}: ${meta.file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)...`);
    const caption =
      `${meta.title}\n\n` +
      `🛍️ 홈페이지 매칭 상품:\n${meta.products}\n\n` +
      `📌 유튜브 쇼츠 제목 추천:\n${meta.ytTitle}\n\n` +
      `📌 고정댓글 링크:\n영상 속 추천템 최저가 & 0원 무료체험 바로가기 👉 https://kidsfit.co.kr`;

    const res = await sendMultipart('sendVideo', 'video', fp, 'video/mp4', caption);
    console.log(`  -> Ep${meta.ep} result: ok=${res.ok}, msg_id=${res.result && res.result.message_id}`);
    if (!res.ok) {
      console.error('  -> Error:', res);
    }
  }
})();
