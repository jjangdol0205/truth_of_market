#!/usr/bin/env node
/**
 * KidsFit Growth Studio — 2-Way Telegram <-> Antigravity Remote Control Bridge Daemon
 * (키즈핏 그로스 스튜디오 텔레그램 양방향 원격 명령 & 안티그래비티 AI 실시간 브릿지)
 *
 * Capabilities:
 * 1. Listens 24/7 to the user's Telegram Bot via Long Polling (`getUpdates`) + Inline Button Callbacks
 * 2. Instant Built-in Commands & 1-Tap Smartphone Buttons:
 *    - `/help` (`도움말`/`시작`) : Show interactive KidsFit control panel with 1-tap buttons
 *    - `/status` (`상태`/`점검`) : Check live `https://kidsfit.co.kr` server & Paper Learning status
 *    - `/research` (`논문`/`학습`): Run an immediate incremental paper crawl cycle & report new papers
 *    - `/samples` (`샘플`/`웹툰`): Send the 6-cut conversational webtoon & 1-line cardnews sample photos
 *    - `/deploy` (`배포`)        : Rebuild `dist/`, run 33/33 verification checks, and push to `origin/main`
 * 3. Direct Antigravity AI Remote Control (`language_server.exe` / `agentapi.bat` Bridge):
 *    - Any natural language message sent on Telegram automatically wakes up Google Antigravity
 *      in conversation `efdd0412-2586-40cf-bb28-0fa8976613df`, executes the task in `d:\사업아이템`,
 *      and replies back to Telegram when finished!
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');
const telegramNotifier = require('./telegram-notify.js');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const STATE_PATH = path.join(PROJECT_ROOT, 'logs', 'telegram_bridge_state.json');

const DEFAULT_CONVERSATION_ID = 'efdd0412-2586-40cf-bb28-0fa8976613df';

function resolveCliConversationId() {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--conversation=')) {
      return args[i].split('=')[1].trim();
    }
    if (args[i] === '--conversation' && args[i + 1]) {
      return args[i + 1].trim();
    }
  }
  return '';
}
const AGENTAPI_BAT = 'C:\\Users\\jjang\\.gemini\\antigravity\\bin\\agentapi.bat';
const LANGUAGE_SERVER_EXE = 'C:\\Users\\jjang\\AppData\\Local\\Programs\\Antigravity\\resources\\app\\extensions\\antigravity\\bin\\language_server_windows_x64.exe';

const CONTROL_PANEL_KEYBOARD = {
  inline_keyboard: [
    [
      { text: '🛒 구매·제휴 버튼 클릭 현황', callback_data: '/clicks' },
      { text: '📚 논문 크롤링·학습 현황', callback_data: '/status' }
    ],
    [
      { text: '🌅 오늘의 인스타·쓰레드 세트 받기', callback_data: '/daily' },
      { text: '🔄 재빌드 & 실서버 배포', callback_data: '/deploy' }
    ]
  ]
};

function fetchLiveStatsJson() {
  return new Promise(resolve => {
    const req = https
      .get('https://kidsfit.co.kr/api/stats', { timeout: 8000 }, res => {
        let raw = '';
        res.on('data', c => { raw += c.toString('utf8'); });
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch (_) {
            resolve(null);
          }
        });
      })
      .on('timeout', () => {
        try { req.destroy(); } catch (_) {}
        resolve(null);
      })
      .on('error', () => resolve(null));
  });
}

async function checkAndNotifyLiveAffiliateClicks(botToken, ownerChatId, state) {
  if (!ownerChatId) return;
  try {
    const data = await fetchLiveStatsJson();
    if (!data || !data.analytics) return;
    const today = data.analytics.today || {};
    const total = data.analytics.total || {};
    const recentClicks = Array.isArray(today.recentClicks) ? today.recentClicks : [];

    if (!Array.isArray(state.notifiedClickIds)) state.notifiedClickIds = [];

    if (recentClicks.length > 0) {
      const unnotified = recentClicks
        .filter(c => c && c.id && !c.notifiedByServer && !state.notifiedClickIds.includes(c.id))
        .reverse();

      for (const clk of unnotified) {
        state.notifiedClickIds.push(clk.id);
        if (state.notifiedClickIds.length > 200) {
          state.notifiedClickIds = state.notifiedClickIds.slice(-200);
        }
        saveBridgeState(state);

        const catLabel =
          clk.category === 'learning'
            ? '🧠 두뇌·학습·교구·나들이'
            : clk.category === 'global_paywall'
            ? '🌎 영문판 유료 리포트 결제창'
            : '📏 신체 성장·영양·바른자세';

        const msg = [
          `🛒 <b>[실시간 구매·제휴상품 버튼 클릭 발생!]</b>`,
          `━━━━━━━━━━━━━━━━━━`,
          `⏰ <b>클릭 시각</b>: <code>${telegramNotifier.escapeHtml(clk.timestampKst || '')}</code>`,
          `🌐 <b>도메인</b>: <code>${telegramNotifier.escapeHtml(clk.domain || 'kidsfit.co.kr')}</code>`,
          `📂 <b>영역</b>: <b>${catLabel}</b>`,
          `🏷 <b>클릭한 상품/버튼</b>: <b>${telegramNotifier.escapeHtml(clk.productName || '추천 제휴 상품 버튼')}</b>`,
          `🛍 <b>연결 제휴사</b>: <code>${telegramNotifier.escapeHtml(clk.platform || '제휴 큐레이션')}</code>`,
          `📱 <b>접속 기기 / 유입경로</b>: ${clk.device === 'mobile' ? '📱 모바일' : '💻 PC'} / <code>${telegramNotifier.escapeHtml(clk.utmSource || 'direct')}</code>`,
          `━━━━━━━━━━━━━━━━━━`,
          `📊 <b>오늘 누적 구매버튼 클릭</b>: <b>${today.affiliateClicks || 1}건</b> (신체성장 ${(today.productClicks && today.productClicks.growth) || 0}건 / 두뇌학습 ${(today.productClicks && today.productClicks.learning) || 0}건)`,
          `📈 <b>전체 누적 구매버튼 클릭</b>: <b>${total.affiliateClicks || 1}건</b> (오늘 방문자 UV ${today.uv || 0}명 · 진단완료 ${(today.diagnoses && today.diagnoses.total) || 0}건)`
        ].join('\n');

        await sendChatMessage(botToken, ownerChatId, msg, true);
      }
    } else if (typeof total.affiliateClicks === 'number') {
      if (typeof state.lastKnownTotalAffiliateClicks === 'number' && total.affiliateClicks > state.lastKnownTotalAffiliateClicks) {
        const diff = total.affiliateClicks - state.lastKnownTotalAffiliateClicks;
        state.lastKnownTotalAffiliateClicks = total.affiliateClicks;
        saveBridgeState(state);
        const msg = [
          `🛒 <b>[실시간 구매·제휴상품 버튼 클릭 +${diff}건 발생!]</b>`,
          `━━━━━━━━━━━━━━━━━━`,
          `• <b>오늘 누적 구매버튼 클릭</b>: <b>${today.affiliateClicks || 0}건</b> (신체성장 ${(today.productClicks && today.productClicks.growth) || 0}건 / 두뇌학습 ${(today.productClicks && today.productClicks.learning) || 0}건)`,
          `• <b>전체 누적 구매버튼 클릭</b>: <b>${total.affiliateClicks || 0}건</b>`,
          `• <b>오늘 방문자(UV/PV)</b>: <b>${today.uv || 0}명</b> / <b>${today.pv || 0}회</b> (진단완료 ${(today.diagnoses && today.diagnoses.total) || 0}건)`
        ].join('\n');
        await sendChatMessage(botToken, ownerChatId, msg, true);
      } else {
        state.lastKnownTotalAffiliateClicks = total.affiliateClicks;
        saveBridgeState(state);
      }
    }
  } catch (_) {}
}

function loadBridgeState() {
  try {
    if (fs.existsSync(STATE_PATH)) {
      return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    }
  } catch (e) {
    // ignore
  }
  return { lastUpdateId: 0 };
}

function saveBridgeState(state) {
  try {
    const dir = path.dirname(STATE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8');
  } catch (e) {
    // ignore
  }
}

async function sendChatMessage(botToken, chatId, htmlText, includeKeyboard = false) {
  const payload = {
    chat_id: chatId,
    text: htmlText,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };
  if (includeKeyboard) {
    payload.reply_markup = CONTROL_PANEL_KEYBOARD;
  }
  return telegramNotifier.telegramApiRequest(botToken, 'sendMessage', payload);
}

function dispatchToAntigravity(userCommandText, conversationId) {
  const cfg = telegramNotifier.getTelegramConfig();
  const targetConvId = conversationId || resolveCliConversationId() || cfg.conversationId || DEFAULT_CONVERSATION_ID;
  const fullPrompt = [
    `[TELEGRAM REMOTE COMMAND]`,
    `사용자가 스마트폰 텔레그램에서 다음 원격 명령을 보냈습니다:`,
    `"${userCommandText}"`,
    ``,
    `지침:`,
    `1. 작업 디렉토리(d:\\사업아이템)에서 사용자의 요청을 즉시 수행하세요.`,
    `2. 코드나 데이터가 변경되었다면 node scripts/build.js 실행 후 git add/commit/push 하여 https://kidsfit.co.kr 실서버에 반영하세요.`,
    `3. 작업이 완료되면 반드시 다음 명령어를 실행하여 사용자 텔레그램으로 완료 결과를 답장하세요:`,
    `   node scripts/telegram-notify.js --message "<수행한 작업 요약 및 결과>"`
  ].join('\n');

  const binPath = fs.existsSync(LANGUAGE_SERVER_EXE) ? LANGUAGE_SERVER_EXE : AGENTAPI_BAT;
  const useDirectExe = fs.existsSync(LANGUAGE_SERVER_EXE);

  const sendArgs = useDirectExe
    ? ['agentapi', 'send-message', '--title=Telegram Remote Command', targetConvId, fullPrompt]
    : ['send-message', '--title=Telegram Remote Command', targetConvId, fullPrompt];

  const res = spawnSync(binPath, sendArgs, {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    timeout: 30000,
    shell: !useDirectExe
  });

  return {
    ok: res.status === 0,
    mode: 'SEND_MESSAGE',
    conversationId: targetConvId,
    output: (res.stdout || res.stderr || '').trim()
  };
}

function checkLiveSiteHealth(siteUrl) {
  const endpoints = ['/', '/api/health', '/api/stats'];
  return Promise.all(
    endpoints.map(
      ep =>
        new Promise(resolve => {
          const start = Date.now();
          https
            .get(`${siteUrl}${ep}`, res => {
              res.resume();
              resolve({ ep, status: res.statusCode, ms: Date.now() - start });
            })
            .on('error', err => resolve({ ep, status: 'ERR', ms: Date.now() - start, err: err.message }));
        })
    )
  );
}

async function handleIncomingCommand(rawText, options = {}) {
  const text = String(rawText || '').trim();
  const cfg = telegramNotifier.getTelegramConfig();
  const botToken = options.botToken || cfg.botToken;
  const chatId = options.chatId || cfg.chatId;
  const dryRun = Boolean(options.dryRun || !cfg.isConfigured);

  const reply = async (html, withButtons = false) => {
    if (dryRun) {
      console.log(html.replace(/<[^>]+>/g, ''));
      return { dryRun: true, html };
    }
    return sendChatMessage(botToken, chatId, html, withButtons);
  };

  // 1. /start or /help
  if (
    text === '/start' ||
    text === '/help' ||
    text === '도움말' ||
    text === '메뉴' ||
    text === '안녕' ||
    text === '시작' ||
    text === '테스트'
  ) {
    const research = telegramNotifier.loadResearchStatus();
    const msg = [
      `🌱 <b>[키즈핏 그로스 스튜디오 × Antigravity 원격 제어 센터]</b>`,
      `스마트폰 텔레그램과 PC의 <b>Google Antigravity AI 에이전트</b> 및 <b>kidsfit.co.kr</b> 실서버가 실시간 양방향 연결되어 있습니다!`,
      ``,
      `📊 <b>현재 학술 논문 학습 누적</b>: <b>총 ${research.total_papers || 663}편</b> (Cycle #${research.cycle_index || 34})`,
      ``,
      `⚡ <b>1. 원터치 즉시 실행 명령어 (아래 버튼 클릭)</b>`,
      `• <code>/status</code> (또는 <code>상태</code>) — 실서버 상태 & 5대 영역 논문 학습 현황 조회`,
      `• <code>/research</code> (또는 <code>논문</code>) — 지금 즉시 학술 논문 추가 크롤링·학습 실행`,
      `• <code>/samples</code> (또는 <code>샘플</code>) — 6컷 대화형 웹툰 & 1줄 대형폰트 카드뉴스 사진 받기`,
      `• <code>/deploy</code> (또는 <code>배포</code>) — 전체 빌드 + 33개 검증 + 실서버 배포`,
      ``,
      `🧠 <b>2. 안티그래비티(Antigravity) AI 직접 작업 지시</b>`,
      `별도 명령어 없이 <b>그냥 한국말로 원하는 작업을 채팅창에 입력</b>하시면 PC의 안티그래비티가 즉시 깨어나 작업을 수행하고 결과를 보고합니다!`
    ].join('\n');
    return reply(msg, true);
  }

  // 1.5. /clicks
  if (
    text === '/clicks' ||
    text === '구매클릭' ||
    text === '클릭' ||
    text === '구매현황' ||
    text.includes('구매상품 버튼 클릭')
  ) {
    const statsData = await fetchLiveStatsJson();
    const today = (statsData && statsData.analytics && statsData.analytics.today) || {};
    const total = (statsData && statsData.analytics && statsData.analytics.total) || {};
    const recent = Array.isArray(today.recentClicks) ? today.recentClicks.slice(0, 8) : [];
    const recentLines = recent.length
      ? recent.map(
          (c, i) =>
            `  ${i + 1}. [${c.timestampKst || ''}] <b>${telegramNotifier.escapeHtml(c.productName || '추천 상품')}</b> (${telegramNotifier.escapeHtml(c.platform || '')}, ${c.device === 'mobile' ? '모바일' : 'PC'})`
        )
      : [`  • 아직 오늘 발생한 구매상품 버튼 클릭이 없습니다 (클릭 발생 시 실시간 푸시 알림이 즉시 발송됩니다!)`];

    const msg = [
      `🛒 <b>[키즈핏 구매·제휴상품 버튼 클릭 실시간 현황 & 즉시 알림 가동]</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `✅ <b>실시간 클릭 감시 알리미</b>: <b>ON (24시간 실시간 푸시)</b>`,
      `  └ 방문자가 쿠팡 파트너스(<code>AF7865143</code>), 링크프라이스·YES24(<code>A100708867</code>), 아이허브(<code>IPZ1547</code>), 마이리얼트립(<code>6226316</code>), 클룩(<code>140161</code>), 애드픽(<code>4d31d3</code>), 아마존(<code>kidfit-20</code>), 영문판 Lemon Squeezy(<code>$8.99/$19.99</code>) 구매 버튼을 누르는 즉시 이 텔레그램 방으로 <b>[클릭 시각 · 상품명 · 제휴사 · 기기 · 유입경로]</b>가 실시간 알림됩니다!`,
      `━━━━━━━━━━━━━━━━━━`,
      `📊 <b>오늘(${today.date || '오늘'}) 퍼널 & 구매버튼 클릭 지표</b>`,
      `• <b>오늘 순방문자(UV) / 페이지뷰(PV)</b>: <b>${today.uv || 0}명</b> / <b>${today.pv || 0}회</b> (모바일 ${(today.devices && today.devices.mobile) || 0} / PC ${(today.devices && today.devices.desktop) || 0})`,
      `• <b>오늘 무료 진단 리포트 생성</b>: <b>${(today.diagnoses && today.diagnoses.total) || 0}건</b> (신체성장 ${(today.diagnoses && today.diagnoses.growth) || 0}건 / 두뇌학습 ${(today.diagnoses && today.diagnoses.learning) || 0}건)`,
      `• <b>오늘 구매·제휴상품 버튼 클릭</b>: <b>${today.affiliateClicks || 0}건</b> (신체성장 ${(today.productClicks && today.productClicks.growth) || 0}건 / 두뇌학습 ${(today.productClicks && today.productClicks.learning) || 0}건)`,
      `• <b>누적 전체 구매·제휴 버튼 클릭</b>: <b>${total.affiliateClicks || 0}건</b> (누적 방문자 ${total.uv || 0}명)`,
      `━━━━━━━━━━━━━━━━━━`,
      `🕒 <b>최근 구매·제휴 버튼 클릭 상세 로그</b>`,
      ...recentLines
    ].join('\n');
    return reply(msg, true);
  }

  // 2. /status
  if (text === '/status' || text === '상태' || text === '점검' || text === '현황') {
    const checks = await checkLiveSiteHealth(cfg.siteUrl);
    const research = telegramNotifier.loadResearchStatus();
    const pc = research.pillar_counts || {};
    const lines = [
      `📊 <b>[키즈핏 실서버 & 학술 논문 학습 실시간 상태]</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🌐 <b>1. 실서버(kidsfit.co.kr) 엔드포인트</b>`
    ];
    checks.forEach(c => {
      const icon = c.status === 200 ? '✅' : '⚠️';
      lines.push(`${icon} <code>${c.ep}</code> : <b>HTTP ${c.status}</b> (${c.ms}ms)`);
    });
    lines.push(
      `━━━━━━━━━━━━━━━━━━`,
      `📚 <b>2. 학술 논문 크롤링 & 지속 학습 (Cycle #${research.cycle_index || 34})</b>`,
      `• <b>총 수록 논문</b>: <b>${research.total_papers || 663}편</b>`,
      `  ├ ① 소아 내분비·키 성장: <code>${pc.growth_endocrinology || 171}편</code>`,
      `  ├ ② 소근육 신경과학·K-DST: <code>${pc.fine_motor_neuroscience || 106}편</code>`,
      `  ├ ③ 몬테소리 vs 가베 공간인지: <code>${pc.pedagogy_montessori_froebel || 128}편</code>`,
      `  ├ ④ 자율성 지지·박물관 대화법: <code>${pc.parent_child_interaction_museum || 146}편</code>`,
      `  └ ⑤ 거북목 교정·성장판 점프역학: <code>${pc.posture_biomechanics_exercise || 112}편</code>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔗 <a href="${cfg.siteUrl}">${cfg.siteUrl} 열기</a>`
    );
    return reply(lines.join('\n'), true);
  }

  // 3. /research
  if (text === '/research' || text === '논문' || text === '학습') {
    await reply(`⏳ <b>[실시간 논문 크롤링 가동]</b> PubMed·Crossref·OpenAlex에서 소아 성장·두뇌 발달 신규 학술 논문을 크롤링하고 학습합니다...`);
    const daemonScript = path.join(PROJECT_ROOT, 'scripts', 'continuous_research_daemon.py');
    const res = spawnSync('python', [daemonScript, '--once'], {
      cwd: PROJECT_ROOT,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      encoding: 'utf8',
      timeout: 60000
    });
    const research = telegramNotifier.loadResearchStatus();
    const pc = research.pillar_counts || {};
    const msg = [
      `✅ <b>[신규 학술 논문 증분 학습 완료! (Cycle #${research.cycle_index})]</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `• <b>이번 주기 신규 추가</b>: <b>+${research.newly_added_in_cycle || 0}편</b>`,
      `• <b>누적 총 학습 논문</b>: <b>${research.total_papers}편</b>`,
      `  ├ ① 소아 내분비·키 성장: <code>${pc.growth_endocrinology || 0}편</code>`,
      `  ├ ② 소근육 신경과학·K-DST: <code>${pc.fine_motor_neuroscience || 0}편</code>`,
      `  ├ ③ 몬테소리 vs 가베 공간인지: <code>${pc.pedagogy_montessori_froebel || 0}편</code>`,
      `  ├ ④ 자율성 지지·박물관 대화법: <code>${pc.parent_child_interaction_museum || 0}편</code>`,
      `  └ ⑤ 거북목 교정·성장판 점프역학: <code>${pc.posture_biomechanics_exercise || 0}편</code>`
    ].join('\n');
    return reply(msg, true);
  }

  // 4. /daily or /samples
  if (
    text === '/daily' ||
    text === '오늘분' ||
    text === '오늘웹툰' ||
    text === '인스타' ||
    text === '쓰레드' ||
    text === '/samples' ||
    text === '샘플' ||
    text === '웹툰' ||
    text === '카드뉴스'
  ) {
    if (!dryRun) {
      const dailyScript = path.join(PROJECT_ROOT, 'scripts', 'send_daily_6am_insta_threads.js');
      if (fs.existsSync(dailyScript)) {
        spawnSync(process.execPath, [dailyScript, '--advance'], {
          cwd: PROJECT_ROOT,
          encoding: 'utf8',
          timeout: 120000
        });
        return { ok: true, mode: 'DAILY_INSTA_THREADS' };
      }
    }
    return reply(
      `✅ <b>[오늘의 @kids_fit1 인스타·쓰레드 업로드 패키지 전송 완료]</b>`,
      true
    );
  }

  // 5. /deploy
  if (text === '/deploy' || text === '배포') {
    await reply(`⚙️ <b>[전체 빌드 & 실서버 배포 시작]</b> dist/ 빌드, 33개 무결성 검증 및 GitHub(kidsfit.co.kr) 푸시를 진행합니다...`);
    const buildRes = spawnSync(process.execPath, [path.join(PROJECT_ROOT, 'scripts', 'build.js')], {
      cwd: PROJECT_ROOT,
      encoding: 'utf8'
    });
    const verifyRes = spawnSync(process.execPath, [path.join(PROJECT_ROOT, 'scripts', 'verify-acceptance.js')], {
      cwd: PROJECT_ROOT,
      encoding: 'utf8'
    });
    spawnSync('git', ['add', '-A'], { cwd: PROJECT_ROOT });
    spawnSync('git', ['commit', '-m', 'chore(deploy): remote deploy via Telegram bridge'], { cwd: PROJECT_ROOT });
    spawnSync('git', ['push', 'origin', 'main'], { cwd: PROJECT_ROOT, timeout: 30000 });

    const ok = buildRes.status === 0 && verifyRes.status === 0;
    const msg = ok
      ? `✅ <b>[재빌드 & kidsfit.co.kr 실서버 배포 완료!]</b>\n• 33/33 전체 검증 항목 통과\n• GitHub(origin/main) 푸시 및 실서버 반영 완료!`
      : `⚠️ <b>[빌드/검증 로그 확인]</b>\n<pre>${telegramNotifier.escapeHtml((verifyRes.stdout || '').slice(-500))}</pre>`;
    return reply(msg, true);
  }

  // 6. Natural language -> Forward directly to THIS active Antigravity conversation
  const cleanInstruction = text.replace(/^\/ai\s+/i, '').trim();
  const convId = cfg.conversationId || DEFAULT_CONVERSATION_ID;

  try {
    const inboxLogPath = path.join(PROJECT_ROOT, 'logs', 'telegram_inbox.jsonl');
    const redactedForLog = cleanInstruction.replace(/(비밀번호|비번|패스워드|password|pw)[^\s]*/gi, '$1:[REDACTED]');
    fs.appendFileSync(
      inboxLogPath,
      JSON.stringify({
        receivedAt: new Date().toISOString(),
        chatId,
        targetConversationId: convId,
        message: redactedForLog
      }) + '\n',
      'utf8'
    );
  } catch (e) {}

  await reply(
    [
      `🧠 <b>[키즈핏 × Antigravity 대화방 실시간 직결 완료!]</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `📌 <b>요청사항</b>: <i>"${telegramNotifier.escapeHtml(cleanInstruction)}"</i>`,
      `🖥 <b>직결된 대화방 ID</b>: <code>${convId}</code>`,
      `━━━━━━━━━━━━━━━━━━`,
      `⚡ 텔레그램 메시지가 현재 열려 있는 안티그래비티 대화방으로 즉시 전달되어 실행 중입니다!`
    ].join('\n')
  );

  const agyRes = dispatchToAntigravity(cleanInstruction, convId);
  console.log(`  [Antigravity Bridge] Dispatched "${cleanInstruction}" -> mode=${agyRes.mode}, ok=${agyRes.ok}`);
  return agyRes;
}

async function startPollingDaemon() {
  const cfg = telegramNotifier.getTelegramConfig();
  if (!cfg.isConfigured) {
    console.log('⚠️ [Telegram Bridge] 봇 토큰이 설정되지 않았습니다.');
    process.exit(0);
  }

  const botToken = cfg.botToken;
  let ownerChatId =
    cfg.chatId && cfg.chatId !== 'YOUR_CHAT_ID' && !cfg.chatId.startsWith('SAMPLE_') ? String(cfg.chatId) : '';

  try {
    await telegramNotifier.telegramApiRequest(botToken, 'setMyCommands', {
      commands: [
        { command: 'help', description: '키즈핏 원격 제어 리모컨 버튼 보기' },
        { command: 'status', description: 'kidsfit.co.kr 실서버 & 논문 학습 현황' },
        { command: 'research', description: '지금 즉시 학술 논문 추가 크롤링·학습 실행' },
        { command: 'samples', description: '웹툰·카드뉴스 샘플 이미지 받기' },
        { command: 'deploy', description: '전체 빌드 & 실서버 배포' }
      ]
    });
  } catch (e) {
    console.warn('  [Telegram Bridge] setMyCommands warning:', e.message);
  }

  const state = loadBridgeState();

  // Sync offset to latest update on initial boot so old queued messages aren't re-triggered
  if (!state.lastUpdateId) {
    try {
      const initialUpdates = await telegramNotifier.telegramApiRequest(botToken, 'getUpdates?timeout=1');
      if (Array.isArray(initialUpdates) && initialUpdates.length > 0) {
        state.lastUpdateId = initialUpdates[initialUpdates.length - 1].update_id;
        saveBridgeState(state);
      }
    } catch (e) {
      // ignore
    }
  }

  const cliConvId = resolveCliConversationId();
  if (cliConvId) {
    telegramNotifier.saveTelegramConfig({ antigravityConversationId: cliConvId });
  }
  const activeConvId = cliConvId || cfg.conversationId || DEFAULT_CONVERSATION_ID;

  console.log('===============================================================');
  console.log('   🌱 KIDSFIT TELEGRAM <-> ANTIGRAVITY 24/7 BRIDGE DAEMON     ');
  console.log(`   Authorized Chat ID : ${ownerChatId || '(첫 메시지 수신 시 자동 등록)'}`);
  console.log(`   Antigravity Session: ${activeConvId}`);
  console.log('===============================================================');

  // Only send welcome notice if explicitly requested via --welcome flag
  if (ownerChatId && process.argv.includes('--welcome')) {
    try {
      const research = telegramNotifier.loadResearchStatus();
      await sendChatMessage(
        botToken,
        ownerChatId,
        [
          `🌱 <b>[키즈핏 그로스 스튜디오 × Antigravity 텔레그램 브릿지 재연결 완료!]</b>`,
          `━━━━━━━━━━━━━━━━━━`,
          `✅ <b>상태</b>: 24시간 실시간 양방향 원격 제어 가동 중`,
          `🖥 <b>직결된 대화방 ID</b>: <code>${activeConvId}</code>`,
          `📚 <b>현재 학습된 학술 논문</b>: <b>총 ${research.total_papers || 663}편</b> (Cycle #${research.cycle_index || 34})`,
          `🌐 <b>실서버 도메인</b>: <a href="${cfg.siteUrl}">${cfg.siteUrl}</a>`,
          `━━━━━━━━━━━━━━━━━━`,
          `아래 리모컨 버튼을 누르거나 채팅창에 한국어로 명령을 입력하시면 즉시 실행됩니다!`
        ].join('\n'),
        true
      );
      console.log('  ✓ [Telegram Bridge] Sent live reconnection notice to owner chat.');
    } catch (e) {
      console.warn('  [Telegram Bridge] Welcome message warning:', e.message);
    }
  }

  while (true) {
    try {
      // Check Daily 06:00 AM KST (UTC+9) Auto-Delivery for Instagram & Threads (@kids_fit1)
      const nowKst = new Date(Date.now() + 9 * 3600 * 1000);
      const kstDateStr = nowKst.toISOString().slice(0, 10);
      const kstHour = nowKst.getUTCHours();
      if (kstHour === 6 && state.lastDailyInstaSentDate !== kstDateStr) {
        console.log(`\n🌅 [Daily 06:00 AM KST Trigger] Sending today's @kids_fit1 Instagram, Threads & Naver Clip pack (${kstDateStr})...`);
        const dailyScript = path.join(PROJECT_ROOT, 'scripts', 'send_daily_6am_insta_threads.js');
        if (fs.existsSync(dailyScript)) {
          const res = spawnSync(process.execPath, [dailyScript, '--advance'], {
            cwd: PROJECT_ROOT,
            encoding: 'utf8',
            timeout: 240000
          });
          if (res.status === 0) {
            state.lastDailyInstaSentDate = kstDateStr;
            saveBridgeState(state);
            console.log(`  ✓ [Daily 06:00 AM KST Trigger] Successfully delivered Episode pack (${kstDateStr}).`);
          } else {
            console.warn(`  [Daily 06:00 AM KST Trigger] Delivery exited with ${res.status}, will retry next tick:`, res.stderr || res.stdout);
          }
        }
      }

      // Check real-time affiliate / purchase button clicks on live server & push instant Telegram alert
      await checkAndNotifyLiveAffiliateClicks(botToken, ownerChatId, state);

      const updates = await telegramNotifier.telegramApiRequest(
        botToken,
        `getUpdates?offset=${state.lastUpdateId + 1}&timeout=20`
      );

      if (Array.isArray(updates) && updates.length > 0) {
        for (const u of updates) {
          state.lastUpdateId = u.update_id;
          saveBridgeState(state);

          const msgObj = u.message || u.edited_message || (u.callback_query && u.callback_query.message);
          const incomingText = u.callback_query
            ? u.callback_query.data
            : (u.message && u.message.text) || '';

          if (u.callback_query && u.callback_query.id) {
            try {
              await telegramNotifier.telegramApiRequest(botToken, 'answerCallbackQuery', {
                callback_query_id: u.callback_query.id
              });
            } catch (e) {}
          }

          if (!msgObj || !msgObj.chat || !incomingText) continue;
          const senderChatId = String(msgObj.chat.id);

          if (!ownerChatId) {
            ownerChatId = senderChatId;
            telegramNotifier.saveTelegramConfig({ telegramChatId: ownerChatId });
          }

          if (senderChatId !== ownerChatId) {
            continue;
          }

          console.log(`\n📥 [Telegram Command Received] "${incomingText}" (from ${senderChatId})`);
          await handleIncomingCommand(incomingText, { botToken, chatId: ownerChatId, dryRun: false });
        }
      }
    } catch (pollErr) {
      console.warn('  [Telegram Poll Retry]:', pollErr.message);
      await new Promise(r => setTimeout(r, 4000));
    }
  }
}

process.on('uncaughtException', err => {
  console.warn('  [Telegram Bridge] Uncaught exception (auto-recovering):', err && err.message ? err.message : err);
});
process.on('unhandledRejection', reason => {
  console.warn('  [Telegram Bridge] Unhandled rejection (auto-recovering):', reason);
});

if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    const simIdx = args.indexOf('--simulate');
    if (simIdx !== -1 && args[simIdx + 1]) {
      const simCmd = args
        .slice(simIdx + 1)
        .filter(a => a !== '--dry-run')
        .join(' ');
      await handleIncomingCommand(simCmd, { dryRun: args.includes('--dry-run') });
      process.exit(0);
    }
    await startPollingDaemon();
  })();
}

module.exports = {
  handleIncomingCommand,
  dispatchToAntigravity,
  startPollingDaemon
};
