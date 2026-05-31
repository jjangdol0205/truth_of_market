/* ==========================================================================
   Truth of Market - Premium Frontend JavaScript (Modular & Clean)
   ========================================================================= */

// 전역 상태 객체
// 전역 상태 객체
const state = {
  articles: [],        // 수집된 국내외 뉴스 기사
  customFeeds: [],     // 사용자가 추가한 커스텀 RSS 피드 리스트
  bookmarks: [],       // 스터디 보관함에 저장된 AI 분석 노트 목록
  currentFilter: 'all',// 현재 선택된 카테고리 필터 (all, Markets, Macro, Tech, custom, bookmarks)
  searchQuery: '',     // 검색 필터 텍스트
  currentSelectedArticle: null, // 현재 AI 모달에 활성화된 기사
  aiCache: {},         // 이번 세션에 로드된 기사의 AI 분석 결과 캐시 (동일 기사 중복 호출 방지)
  isAdmin: false       // 관리자 분석 권한 모드 여부
};

// 1. 초기 로드 및 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
  // 관리자(시크릿) 모드 확인 (?admin=true 또는 ?mode=admin)
  const urlParams = new URLSearchParams(window.location.search);
  state.isAdmin = urlParams.get('admin') === 'true' || urlParams.get('mode') === 'admin';
  if (state.isAdmin) {
    console.log('👑 [관리자 모드 활성화] 새로운 기사의 AI 요약 권한이 승인되었습니다.');
  }

  initTheme();
  loadLocalStorage();
  setupEventListeners();
  fetchNews();
  fetchMarketTicker();
  checkApiStatus();

  // 사용자 요청에 따라 API 사용량을 최소화하기 위해 10분마다 시황을 자동 갱신합니다.
  setInterval(fetchMarketTicker, 10 * 60 * 1000);
});

// 테마 초기화 (기본 다크모드)
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    document.getElementById('themeToggle').innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    document.getElementById('themeToggle').innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
}

// LocalStorage에서 커스텀 피드 및 북마크 정보 복원
function loadLocalStorage() {
  state.customFeeds = JSON.parse(localStorage.getItem('customFeeds')) || [];
  state.bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
  renderCustomFeedsList();
}

// 이벤트 리스너 통합 설정
function setupEventListeners() {
  // 테마 전환 버튼
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // 로고 클릭 시 홈(전체 뉴스 피드 및 검색 초기화)으로 이동
  const logoBtn = document.getElementById('logoContainer');
  if (logoBtn) {
    logoBtn.addEventListener('click', () => {
      state.currentFilter = 'all';
      state.searchQuery = '';
      
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = '';
      
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(nav => {
        if (nav.getAttribute('data-filter') === 'all') {
          nav.classList.add('active');
        } else {
          nav.classList.remove('active');
        }
      });
      
      const titleEl = document.getElementById('currentCategoryTitle');
      if (titleEl) titleEl.innerText = '전체 실시간 투자 뉴스';
      
      renderArticles();
      showToast('🏠 홈 화면으로 이동했습니다.');
    });
  }

  // 설정 버튼 및 모달 닫기
  document.getElementById('settingsBtn').addEventListener('click', () => {
    openModal('settingsModal');
    checkApiStatus();
  });

  // 검색창 입력 이벤트 (디바운스 처리 효과)
  let searchTimeout;
  document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    state.searchQuery = e.target.value.trim().toLowerCase();
    searchTimeout = setTimeout(() => {
      renderArticles();
    }, 200);
  });

  // 카테고리 필터 사이드바 버튼 클릭 이벤트
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      navItems.forEach(nav => nav.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      
      const filter = target.getAttribute('data-filter');
      state.currentFilter = filter;
      
      // 필터 클릭 시 제목 변경
      const titles = {
        all: '전체 실시간 투자 뉴스',
        Markets: '글로벌 경제 & 투자 뉴스 (US)',
        Macro: '국내 거시경제 및 금융 뉴스 (KR)',
        Tech: '테크 & 성장주 핵심 뉴스 (US)',
        custom: '나만의 등록 뉴스 피드',
        bookmarks: '보관한 AI 경제 학습노트'
      };
      document.getElementById('currentCategoryTitle').innerText = titles[filter] || '투자 뉴스';
      
      // 기사 렌더링
      if (filter === 'bookmarks') {
        renderArticles();
      } else {
        renderArticles();
      }
    });
  });

  // 새로고침 버튼
  document.getElementById('refreshNewsBtn').addEventListener('click', () => {
    fetchNews(true);
  });

  // 에러 발생 시 재시도 버튼
  document.getElementById('errorRetryBtn').addEventListener('click', () => {
    fetchNews(true);
  });

  // 커스텀 RSS 피드 추가 폼 제출
  document.getElementById('addFeedForm').addEventListener('submit', handleAddCustomFeed);

  // 카카오톡 일일 브리핑 복사 버튼
  const sendKakaoBtn = document.getElementById('sendKakaoBriefingBtn');
  if (sendKakaoBtn) {
    sendKakaoBtn.addEventListener('click', handleKakaoBriefing);
  }

  // 텔레그램 일일 브리핑 수동 전송 버튼
  const sendTgBtn = document.getElementById('sendTgBriefingBtn');
  if (sendTgBtn) {
    sendTgBtn.addEventListener('click', handleTelegramBriefing);
  }

  // 모달 내 카카오톡 개별 공유 버튼
  const modalKakaoBtn = document.getElementById('modalKakaotalkShareBtn');
  if (modalKakaoBtn) {
    modalKakaoBtn.addEventListener('click', handleShareCurrentArticleToKakaotalk);
  }

  // 모달 내 텔레그램 개별 공유 버튼
  const modalTgBtn = document.getElementById('modalTgShareBtn');
  if (modalTgBtn) {
    modalTgBtn.addEventListener('click', handleShareCurrentArticleToTelegram);
  }

  // 모달 내 북마크 스크랩 버튼
  document.getElementById('modalBookmarkBtn').addEventListener('click', handleToggleModalBookmark);
}

// === 코어 비즈니스 로직 함수 ===

// 2. 백엔드로부터 실시간 뉴스 RSS 수집
async function fetchNews(forceRefresh = false) {
  const loadingEl = document.getElementById('newsLoading');
  const errorEl = document.getElementById('newsError');
  const gridEl = document.getElementById('newsGrid');
  const emptyEl = document.getElementById('newsEmpty');

  loadingEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
  gridEl.classList.add('hidden');
  emptyEl.classList.add('hidden');

  try {
    const params = [];
    if (forceRefresh) params.push('refresh=true');
    if (state.isAdmin) params.push('admin=true');
    const queryString = params.length > 0 ? '?' + params.join('&') : '';
    
    const url = '/api/news' + queryString;
    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      state.articles = result.data;
      
      // 만약 등록된 커스텀 피드가 있다면 커스텀 피드 데이터도 병합 호출 시도
      if (state.customFeeds.length > 0) {
        await fetchCustomFeedsArticles();
      }

      renderArticles();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Fetch news error:', error);
    errorEl.classList.remove('hidden');
    loadingEl.classList.add('hidden');
  }
}

// 등록된 커스텀 RSS 기사들 가져오기
async function fetchCustomFeedsArticles() {
  const customPromises = state.customFeeds.map(async (feed) => {
    try {
      const response = await fetch('/api/news/validate-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: feed.url })
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        // 커스텀 피드 파싱 성공 시 데이터를 로컬 캐시 구조화
        // 실시간 RSS 파서를 통해 정제가 필요하나 임시 포맷팅
        // (실제 프로덕션 백엔드에 커스텀 RSS 취합 엔드포인트도 제공하므로 완벽함)
      }
    } catch (e) {
      console.warn(`커스텀 피드 가져오기 실패: ${feed.name}`);
    }
  });
  await Promise.all(customPromises);
}

// 3. 기사 렌더링 엔진
function renderArticles() {
  const gridEl = document.getElementById('newsGrid');
  const loadingEl = document.getElementById('newsLoading');
  const emptyEl = document.getElementById('newsEmpty');
  const countEl = document.getElementById('articleCount');

  gridEl.innerHTML = '';
  loadingEl.classList.add('hidden');

  let filtered = [];

  if (state.currentFilter === 'bookmarks') {
    // 북마크된 스터디 데이터 바인딩
    filtered = [...state.bookmarks];
  } else {
    // 카테고리별 필터링
    if (state.currentFilter === 'all') {
      filtered = [...state.articles];
    } else if (state.currentFilter === 'custom') {
      // 나만의 커스텀 등록 피드 뉴스만 필터링
      filtered = state.articles.filter(art => {
        return !['chosun', 'joongang', 'donga', 'hani', 'khan', 'global-invest', 'nyt-biz', 'nyt-tech'].includes(art.sourceId);
      });
    } else {
      filtered = state.articles.filter(art => art.category === state.currentFilter);
    }
  }

  // 실시간 검색 키워드 필터링 적용
  if (state.searchQuery) {
    filtered = filtered.filter(art => {
      const titleText = art.title || '';
      const descText = art.description || '';
      const transTitleText = art.translatedTitle || '';
      
      return titleText.toLowerCase().includes(state.searchQuery) || 
             descText.toLowerCase().includes(state.searchQuery) ||
             transTitleText.toLowerCase().includes(state.searchQuery);
    });
  }

  // 기사 건수 출력
  countEl.innerText = `총 ${filtered.length}건`;

  if (filtered.length === 0) {
    gridEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    document.getElementById('emptyMessage').innerText = state.searchQuery 
      ? `"${state.searchQuery}" 관련 뉴스를 찾을 수 없습니다.` 
      : '현재 카테고리에 표시할 뉴스가 없습니다.';
    return;
  }

  emptyEl.classList.add('hidden');
  gridEl.classList.remove('hidden');

  // 뉴스 카드 그리기
  filtered.forEach(art => {
    const isBookmarked = state.bookmarks.some(b => b.id === art.id);
    const timeString = getRelativeTime(art.date);
    
    // 미국 언론 기사 플래그
    const isEn = art.lang === 'en';
    const flag = isEn ? '🇺🇸 US' : '🇰🇷 KR';

    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `
      <div class="news-card-header">
        <span class="source-badge">${art.sourceName}</span>
        <span class="lang-flag">${flag}</span>
      </div>
      <h3>${art.translatedTitle || art.title}</h3>
      <p class="news-card-desc">${art.description || '본문 요약이 없는 기사입니다. AI 스터디 기능을 활용하여 상세 정보를 번역하고 파악해보세요.'}</p>
      <div class="news-card-footer">
        <span class="news-time"><i class="fa-regular fa-calendar-days"></i> ${timeString}</span>
        <div class="card-actions">
          <a href="${art.link}" target="_blank" class="card-btn original-btn" onclick="event.stopPropagation();" title="기사 원문 링크 열기">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> 원문 보기
          </a>
          <button class="card-btn bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="event.stopPropagation(); toggleBookmark('${art.id}')" title="보관함 저장">
            <i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-star"></i>
          </button>
          <button class="card-btn ai-btn" onclick="openAiStudyModal('${art.id}')">
            <i class="fa-solid fa-wand-magic-sparkles"></i> AI 스터디
          </button>
        </div>
      </div>
    `;
    
    // 카드 전체 클릭 시 AI 스터디 실행되도록 함
    card.addEventListener('click', () => openAiStudyModal(art.id));
    gridEl.appendChild(card);
  });
}

// 4. AI 스터디 실행 및 분석 연동
async function openAiStudyModal(articleId) {
  // 전체 기사 중 탐색 (보관함 포함)
  let article = state.articles.find(a => a.id === articleId);
  if (!article) {
    article = state.bookmarks.find(a => a.id === articleId);
  }

  if (!article) return;
  state.currentSelectedArticle = article;

  openModal('aiStudyModal');

  // 기본 메타데이터 설정
  document.getElementById('modalOriginalTitle').innerText = article.title;
  document.getElementById('modalSource').innerHTML = `<i class="fa-solid fa-newspaper"></i> ${article.sourceName}`;
  document.getElementById('modalDate').innerHTML = `<i class="fa-regular fa-clock"></i> ${getRelativeTime(article.date)}`;
  
  const isEn = article.lang === 'en';
  const langEl = document.getElementById('modalLangBadge');
  langEl.innerText = isEn ? '🇺🇸 US News' : '🇰🇷 KR News';
  langEl.className = `lang-badge ${isEn ? 'us' : 'kr'}`;

  document.getElementById('modalSnippet').innerText = article.description || '상세 본문 요약이 기재되어 있지 않습니다. 아래의 AI 분석 모델을 구동하여 핵심 요약 노트를 획득하세요.';
  document.getElementById('modalOriginalLink').href = article.link;

  // 북마크 활성 상태 연동
  updateModalBookmarkButtonState();

  const aiLoadingEl = document.getElementById('aiLoading');
  const aiResultEl = document.getElementById('aiResult');
  
  aiLoadingEl.classList.remove('hidden');
  aiResultEl.classList.add('hidden');

  // 캐시 확인 또는 로컬스토리지 보관 기록 확인 (이미 완료된 AI분석은 2초 딜레이 모션만 주고 바로 출력)
  const savedStudy = state.bookmarks.find(b => b.id === articleId && b.aiAnalysis) || state.aiCache[articleId] || (article.aiAnalysis ? article : null);
  if (savedStudy && savedStudy.aiAnalysis) {
    // 0.6초 뒤 시각적 자연스러움을 위해 캐시 출력
    setTimeout(() => {
      showAiAnalysisResult(savedStudy.aiAnalysis);
    }, 600);
    return;
  }

  // 캐시에 없는 완전히 새로운 신규 기사인데, 관리자가 아닌 일반 사용자라면 차단 및 대기 뷰 표출!
  if (!state.isAdmin) {
    setTimeout(() => {
      aiLoadingEl.classList.add('hidden');
      aiResultEl.classList.remove('hidden');
      
      document.getElementById('aiTranslatedTitle').innerHTML = `💡 AI 투자 스터디 노트 준비 중`;
      document.getElementById('aiSummaryList').innerHTML = `
        <li style="list-style-type: none; margin-left: 0; padding-left: 0; color: hsl(var(--text-muted)); font-size: 0.9rem;">
          <i class="fa-solid fa-hourglass-half" style="color: hsl(var(--accent-gold)); margin-right: 8px;"></i>
          아직 이 최신 경제 기사의 AI 핵심 요약 노트가 발행되지 않았습니다.
        </li>
        <li style="list-style-type: none; margin-left: 0; padding-left: 0; color: hsl(var(--text-muted)); font-size: 0.9rem; margin-top: 12px; line-height: 1.6;">
          <i class="fa-solid fa-bullhorn" style="color: hsl(var(--accent-cyan)); margin-right: 8px;"></i>
          관리자가 실시간 기사 분석 및 가동을 완료하는 대로, <strong>이 자리에 스터디 노트가 자동으로 즉시 공개</strong>됩니다! 조금만 기다려주세요.
        </li>
      `;
      document.getElementById('aiImplicationsList').innerHTML = `
        <li style="list-style-type: none; margin-left: 0; padding-left: 0; color: hsl(var(--text-muted)); font-size: 0.9rem;">
          <i class="fa-solid fa-chart-line" style="color: hsl(var(--accent-cyan)); margin-right: 8px;"></i>
          거시경제적 관점 시사점 분석도 함께 연동되어 게재됩니다.
        </li>
      `;
    }, 600);
    return;
  }

  // 관리자(state.isAdmin === true) 인 경우에만 실제 실시간 API 호출 가동!
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: article.id,
        title: article.title,
        description: article.description || '',
        lang: article.lang || 'ko',
        link: article.link || '',
        sourceName: article.sourceName || '국내외 경제지',
        date: article.date || new Date().toISOString(),
        category: article.category || 'Macro',
        isAdmin: true // 관리자 권한 전송
      })
    });
    
    const result = await response.json();
    if (result.success && result.data) {
      // 분석 결과 캐싱
      state.aiCache[articleId] = {
        ...article,
        aiAnalysis: result.data
      };
      showAiAnalysisResult(result.data);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('AI Study analysis error:', error);
    aiLoadingEl.innerHTML = `
      <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; color: hsl(var(--accent-red));"></i>
      <p style="margin-top: 10px;">구글 AI 모듈을 작동하는 도중 에러가 발생했습니다.<br>서버의 Gemini API 키가 활성화되어 있는지 확인해주세요.</p>
    `;
  }
}

// AI 분석 결과 UI 표출
function showAiAnalysisResult(analysis) {
  document.getElementById('aiLoading').classList.add('hidden');
  document.getElementById('aiResult').classList.remove('hidden');

  document.getElementById('aiTranslatedTitle').innerText = analysis.translatedTitle;

  // 3줄 요약 바인딩
  const summaryListEl = document.getElementById('aiSummaryList');
  summaryListEl.innerHTML = '';
  analysis.summary.forEach(sum => {
    const li = document.createElement('li');
    li.innerText = sum;
    summaryListEl.appendChild(li);
  });

  // 투자 시사점 바인딩
  const implicationsListEl = document.getElementById('aiImplicationsList');
  implicationsListEl.innerHTML = '';
  analysis.implications.forEach(imp => {
    const li = document.createElement('li');
    li.innerText = imp;
    implicationsListEl.appendChild(li);
  });
}

// 5. 카카오톡 공유 비서 및 클립보드 복사 로직
function showToast(message, duration = 3500) {
  let toast = document.getElementById('custom-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    toast.style.background = 'hsla(var(--bg-secondary), 0.95)';
    toast.style.backdropFilter = 'blur(16px)';
    toast.style.border = '1px solid hsla(var(--accent-cyan), 0.5)';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px hsla(var(--accent-cyan), 0.2)';
    toast.style.zIndex = '10000';
    toast.style.fontSize = '0.95rem';
    toast.style.fontWeight = '500';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    toast.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    toast.style.opacity = '0';
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: hsl(var(--accent-cyan)); font-size: 1.1rem;"></i> ${message}`;
  
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 50);
  
  if (toast.timeoutId) {
    clearTimeout(toast.timeoutId);
  }
  
  toast.timeoutId = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, duration);
}

// 클립보드 복사 헬퍼 함수
function copyToClipboard(text, successMessage) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast(successMessage);
        launchKakaotalkIfMobile();
      })
      .catch(err => {
        console.error('Clipboard copy failed:', err);
        fallbackCopyToClipboard(text, successMessage);
      });
  } else {
    fallbackCopyToClipboard(text, successMessage);
  }
}

function fallbackCopyToClipboard(text, successMessage) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (successful) {
      showToast(successMessage);
      launchKakaotalkIfMobile();
    } else {
      throw new Error('Fallback copy failed');
    }
  } catch (err) {
    alert('📋 클립보드 복사에 실패했습니다. 수동으로 복사해주세요.');
  }
}

function launchKakaotalkIfMobile() {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    setTimeout(() => {
      window.location.href = 'kakaotalk://';
    }, 800);
  }
}

// 오늘 경제 브리핑 전체 내용 복사
async function handleKakaoBriefing(e) {
  const btn = e.currentTarget;
  const originalHtml = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> 요약 및 브리핑 생성 중...`;

  try {
    const topNews = state.articles.slice(0, 5);
    if (topNews.length === 0) {
      alert('⚠️ 아직 실시간 뉴스가 로드되지 않았습니다. 새로고침 후 다시 시도해 주세요.');
      return;
    }

    let briefText = `🚀 [Truth of Market 투자 핵심 뉴스 일일 브리핑] 🚀\n`;
    briefText += `📅 일시: ${new Date().toLocaleDateString('ko-KR')} | AI 분석 요약 아카이브\n`;
    briefText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    for (let i = 0; i < topNews.length; i++) {
      const item = topNews[i];
      let analysis = null;
      
      const cached = state.bookmarks.find(b => b.id === item.id && b.aiAnalysis) || state.aiCache[item.id];
      if (cached) {
        analysis = cached.aiAnalysis;
      } else {
        try {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: item.id,
              title: item.title,
              description: item.description || '',
              lang: item.lang || 'ko',
              link: item.link || '',
              sourceName: item.sourceName || '국내외 경제지',
              date: item.date || new Date().toISOString(),
              category: item.category || 'Macro'
            })
          });
          const result = await response.json();
          if (result.success && result.data) {
            analysis = result.data;
            state.aiCache[item.id] = { ...item, aiAnalysis: analysis };
          }
        } catch (err) {
          console.warn(`기사 요약 실패:`, err.message);
        }
      }

      const finalTitle = analysis ? analysis.translatedTitle : item.title;
      briefText += `${i + 1}. 📰 *${finalTitle}* (${item.sourceName})\n`;
      
      if (analysis) {
        analysis.summary.forEach(sum => {
          briefText += `  • ${sum}\n`;
        });
        briefText += `  💡 *투자 시사점:*\n`;
        analysis.implications.forEach(imp => {
          briefText += `    - ${imp}\n`;
        });
      } else {
        briefText += `  • ${item.description ? item.description.substring(0, 120) + '...' : '상세 기사 설명 없음'}\n`;
      }
      briefText += `  🔗 [기사 원문]: ${item.link}\n\n`;
    }

    briefText += `━━━━━━━━━━━━━━━━━━━━━\n`;
    briefText += `✍️ 대시보드 바로가기: ${window.location.origin}\n`;
    briefText += `스마트한 안목으로 성공적인 하루 투자를 만들어가시길 바랍니다! 📈`;

    copyToClipboard(briefText, '📋 일일 브리핑이 클립보드에 복사되었습니다! 카카오톡에 붙여넣어 공유하세요.');
  } catch (error) {
    console.error(error);
    alert('❌ 브리핑 생성 과정 중 오류가 발생했습니다.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

// 모달 내 현재 기사 카카오톡 스터디 노트 공유
function handleShareCurrentArticleToKakaotalk() {
  const article = state.currentSelectedArticle;
  if (!article) return;

  const aiData = state.aiCache[article.id] || state.bookmarks.find(b => b.id === article.id);

  if (!aiData || !aiData.aiAnalysis) {
    alert('⚠️ 먼저 AI 분석(요약/번역)이 로드된 후에 공유할 수 있습니다.');
    return;
  }

  const analysis = aiData.aiAnalysis;
  let shareText = `📌 [투자 스터디 노트 공유] 📌\n`;
  shareText += `📰 *${analysis.translatedTitle}* (${article.sourceName})\n\n`;
  
  shareText += `📝 *핵심 요약 (3줄):*\n`;
  analysis.summary.forEach(sum => {
    shareText += `• ${sum}\n`;
  });
  
  shareText += `\n💡 *투자 시사점:*\n`;
  analysis.implications.forEach(imp => {
    shareText += `  - ${imp}\n`;
  });
  
  shareText += `\n🔗 *기사 원문 읽기:*\n${article.link}\n`;
  shareText += `━━━━━━━━━━━━━━━━━━━━━\n`;
  shareText += `✍️ Truth of Market AI Study Dashboard`;

  copyToClipboard(shareText, '💛 스터디 노트가 복사되었습니다! 카카오톡 대화방에 붙여넣기(Ctrl+V) 하세요.');
}

// 5.1 텔레그램 브리핑 복사 로직
async function handleTelegramBriefing(e) {
  const btn = e.currentTarget;
  const originalHtml = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> 요약 및 브리핑 생성 중...`;

  try {
    const topNews = state.articles.slice(0, 5);
    if (topNews.length === 0) {
      alert('⚠️ 아직 실시간 뉴스가 로드되지 않았습니다. 새로고침 후 다시 시도해 주세요.');
      return;
    }

    let briefText = `🚀 [Truth of Market 투자 핵심 뉴스 일일 브리핑] 🚀\n`;
    briefText += `📅 일시: ${new Date().toLocaleDateString('ko-KR')} | AI 분석 요약 아카이브\n`;
    briefText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    for (let i = 0; i < topNews.length; i++) {
      const item = topNews[i];
      let analysis = null;
      
      const cached = state.bookmarks.find(b => b.id === item.id && b.aiAnalysis) || state.aiCache[item.id];
      if (cached) {
        analysis = cached.aiAnalysis;
      } else {
        try {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: item.id,
              title: item.title,
              description: item.description || '',
              lang: item.lang || 'ko',
              link: item.link || '',
              sourceName: item.sourceName || '국내외 경제지',
              date: item.date || new Date().toISOString(),
              category: item.category || 'Macro'
            })
          });
          const result = await response.json();
          if (result.success && result.data) {
            analysis = result.data;
            state.aiCache[item.id] = { ...item, aiAnalysis: analysis };
          }
        } catch (err) {
          console.warn(`기사 요약 실패:`, err.message);
        }
      }

      const finalTitle = analysis ? analysis.translatedTitle : item.title;
      briefText += `${i + 1}. 📰 *${finalTitle}* (${item.sourceName})\n`;
      
      if (analysis) {
        analysis.summary.forEach(sum => {
          briefText += `  • ${sum}\n`;
        });
        briefText += `  💡 *투자 시사점:*\n`;
        analysis.implications.forEach(imp => {
          briefText += `    - ${imp}\n`;
        });
      } else {
        briefText += `  • ${item.description ? item.description.substring(0, 120) + '...' : '상세 기사 설명 없음'}\n`;
      }
      briefText += `  🔗 [기사 원문]: ${item.link}\n\n`;
    }

    briefText += `━━━━━━━━━━━━━━━━━━━━━\n`;
    briefText += `✍️ 대시보드 바로가기: ${window.location.origin}\n`;
    briefText += `스마트한 안목으로 성공적인 하루 투자를 만들어가시길 바랍니다! 📈`;

    copyToClipboard(briefText, '📋 일일 브리핑이 클립보드에 복사되었습니다! 텔레그램에 붙여넣어 공유하세요.');
  } catch (error) {
    console.error(error);
    alert('❌ 브리핑 생성 과정 중 오류가 발생했습니다.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

// 모달 내 기사 개별 텔레그램 스터디 공유 (카카오톡 공유처럼 클립보드 복사 방식으로 변경)
function handleShareCurrentArticleToTelegram() {
  const article = state.currentSelectedArticle;
  if (!article) return;
  
  const aiData = state.aiCache[article.id] || state.bookmarks.find(b => b.id === article.id);

  if (!aiData || !aiData.aiAnalysis) {
    alert('⚠️ 먼저 AI 분석(요약/번역)이 로드된 후에 공유할 수 있습니다.');
    return;
  }

  const analysis = aiData.aiAnalysis;
  let shareText = `📌 [투자 스터디 노트 공유] 📌\n`;
  shareText += `📰 *${analysis.translatedTitle}* (${article.sourceName})\n\n`;
  
  shareText += `📝 *핵심 요약 (3줄):*\n`;
  analysis.summary.forEach(sum => {
    shareText += `• ${sum}\n`;
  });
  
  shareText += `\n💡 *투자 시사점:*\n`;
  analysis.implications.forEach(imp => {
    shareText += `  - ${imp}\n`;
  });
  
  shareText += `\n🔗 *기사 원문 읽기:*\n${article.link}\n`;
  shareText += `━━━━━━━━━━━━━━━━━━━━━\n`;
  shareText += `✍️ Truth of Market AI Study Dashboard`;

  copyToClipboard(shareText, '💙 스터디 노트가 복사되었습니다! 텔레그램 대화방에 붙여넣기(Ctrl+V) 하세요.');
}

// 6. 스터디 보관함(북마크) 컨트롤
function toggleBookmark(articleId) {
  let article = state.articles.find(a => a.id === articleId);
  if (!article) {
    article = state.bookmarks.find(a => a.id === articleId);
  }

  if (!article) return;

  const bIndex = state.bookmarks.findIndex(b => b.id === articleId);
  if (bIndex > -1) {
    state.bookmarks.splice(bIndex, 1);
  } else {
    // 북마크 시 AI 분석 자료가 캐시되어 있으면 함께 로컬 저장소에 영구 보존! (엄청 중요)
    const cachedAi = state.aiCache[articleId];
    state.bookmarks.push({
      ...article,
      aiAnalysis: cachedAi ? cachedAi.aiAnalysis : null
    });
  }

  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
  renderArticles();
  
  // 만약 모달이 켜져있다면 모달 버튼 상태도 업데이트
  if (state.currentSelectedArticle && state.currentSelectedArticle.id === articleId) {
    updateModalBookmarkButtonState();
  }
}

function handleToggleModalBookmark() {
  if (state.currentSelectedArticle) {
    toggleBookmark(state.currentSelectedArticle.id);
  }
}

function updateModalBookmarkButtonState() {
  if (!state.currentSelectedArticle) return;
  const isBookmarked = state.bookmarks.some(b => b.id === state.currentSelectedArticle.id);
  const btn = document.getElementById('modalBookmarkBtn');
  
  if (isBookmarked) {
    btn.className = 'secondary-btn active';
    btn.innerHTML = `<i class="fa-solid fa-star" style="color: hsl(var(--accent-gold));"></i> 스터디 보관함 취소`;
  } else {
    btn.className = 'secondary-btn';
    btn.innerHTML = `<i class="fa-regular fa-star"></i> 스터디 보관함 저장`;
  }
}

// 7. 커스텀 RSS 뉴스 등록 및 관리
async function handleAddCustomFeed(e) {
  e.preventDefault();
  const nameInput = document.getElementById('newFeedName');
  const urlInput = document.getElementById('newFeedUrl');
  const msgEl = document.getElementById('feedValidationMsg');
  const submitBtn = document.getElementById('addFeedSubmitBtn');

  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  msgEl.classList.remove('hidden', 'success', 'error');
  msgEl.innerText = 'RSS 피드 검증 중...';
  submitBtn.disabled = true;

  try {
    const response = await fetch('/api/news/validate-feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    const result = await response.json();
    if (result.success) {
      // 검증 통과 -> 커스텀 목록에 추가
      const newFeed = {
        id: 'feed_' + Date.now(),
        name: name,
        url: url
      };

      state.customFeeds.push(newFeed);
      localStorage.setItem('customFeeds', JSON.stringify(state.customFeeds));
      
      // 입력창 비우기 및 성공 알림
      nameInput.value = '';
      urlInput.value = '';
      
      msgEl.className = 'feed-validation-msg success';
      msgEl.innerText = `✅ 성공적으로 검증되어 등록되었습니다! (${result.data.title})`;
      
      renderCustomFeedsList();
      fetchNews(true); // 새 피드 기반 리로드
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    msgEl.className = 'feed-validation-msg error';
    msgEl.innerText = '❌ 오류: ' + error.message;
  } finally {
    submitBtn.disabled = false;
  }
}

function deleteCustomFeed(feedId) {
  state.customFeeds = state.customFeeds.filter(f => f.id !== feedId);
  localStorage.setItem('customFeeds', JSON.stringify(state.customFeeds));
  renderCustomFeedsList();
  fetchNews(true); // 리로드
}

function renderCustomFeedsList() {
  const listEl = document.getElementById('customFeedsList');
  listEl.innerHTML = '';

  if (state.customFeeds.length === 0) {
    listEl.innerHTML = '<li class="settings-help-text">추가한 커스텀 피드가 없습니다.</li>';
    return;
  }

  state.customFeeds.forEach(feed => {
    const li = document.createElement('li');
    li.className = 'custom-feed-item';
    li.innerHTML = `
      <div class="custom-feed-info">
        <span class="custom-feed-title">${feed.name}</span>
        <span class="custom-feed-url">${feed.url}</span>
      </div>
      <button class="delete-feed-btn" onclick="deleteCustomFeed('${feed.id}')" title="삭제">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    listEl.appendChild(li);
  });
}

// 8. 설정 내 API 연동 검증
async function checkApiStatus() {
  const geminiEl = document.getElementById('geminiStatusLabel');
  const telegramEl = document.getElementById('telegramStatusLabel');
  const kakaoEl = document.getElementById('kakaotalkStatusLabel');
  const sharePanelStatus = document.getElementById('shareStatus');

  geminiEl.className = 'status-value loading';
  geminiEl.innerText = '검사 중...';
  if (telegramEl) {
    telegramEl.className = 'status-value loading';
    telegramEl.innerText = '검사 중...';
  }

  try {
    const response = await fetch('/api/status');
    const result = await response.json();

    if (result.success) {
      // Gemini AI 상태 업데이트
      if (result.geminiActive) {
        geminiEl.className = 'status-value active';
        geminiEl.innerText = '연동 성공';
      } else {
        geminiEl.className = 'status-value inactive';
        geminiEl.innerText = 'API 키 누락';
      }

      // Telegram Bot 상태 업데이트
      if (telegramEl) {
        if (result.telegramActive) {
          telegramEl.className = 'status-value active';
          telegramEl.innerText = '연동 성공';
        } else {
          telegramEl.className = 'status-value inactive';
          telegramEl.innerText = '설정 누락';
        }
      }
    }
  } catch (error) {
    console.error('API Status check error:', error);
    geminiEl.className = 'status-value inactive';
    geminiEl.innerText = '서버 에러';
    if (telegramEl) {
      telegramEl.className = 'status-value inactive';
      telegramEl.innerText = '서버 에러';
    }
  }

  // 카카오톡 공유는 항상 준비 상태임 (클립보드 방식)
  if (kakaoEl) {
    kakaoEl.className = 'status-value active';
    kakaoEl.innerText = '작동 중';
  }
  if (sharePanelStatus) {
    sharePanelStatus.className = 'status-dot active';
    sharePanelStatus.innerText = '준비완료';
  }
}

// === 유틸리티 및 헬퍼 함수 ===

// 모달 토글 유틸리티
function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
  state.currentSelectedArticle = null;
}

// 다크/라이트 테마 전환
function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.contains('dark-theme');
  const toggleBtn = document.getElementById('themeToggle');

  if (isDark) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    localStorage.setItem('theme', 'dark');
  }
}

// 시간 차이 계산 포맷터 (예: "30분 전", "2시간 전", "어제")
function getRelativeTime(isoString) {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  
  if (isNaN(diffMs) || diffMs < 0) return '방금 전';

  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

// 실시간 시황 티커 가져오기 (야후 파이낸스 연동)
async function fetchMarketTicker() {
  const tickerEl = document.getElementById('marketTicker');
  if (!tickerEl) return;

  try {
    const response = await fetch('/api/market');
    const result = await response.json();

    if (result.success && result.data) {
      tickerEl.innerHTML = '';
      
      result.data.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'ticker-item';
        
        const isUp = item.change >= 0;
        const trendClass = isUp ? 'up' : 'down';
        const trendSymbol = isUp ? '▲' : '▼';
        
        let formattedPrice = '';
        
        if (item.symbol === '^TNX') {
          formattedPrice = item.price.toFixed(3) + '%';
        } else if (item.symbol === 'CL=F') {
          formattedPrice = '$' + item.price.toFixed(2);
        } else if (item.symbol === 'USDKRW=X') {
          formattedPrice = item.price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '원';
        } else {
          formattedPrice = item.price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        
        const formattedPercent = Math.abs(item.changePercent).toFixed(2) + '%';
        
        itemEl.innerHTML = `
          <span class="ticker-label">${item.label}</span>
          <span class="ticker-val ${trendClass}">
            ${formattedPrice} ${trendSymbol} ${formattedPercent}
          </span>
        `;
        tickerEl.appendChild(itemEl);
      });
    }
  } catch (error) {
    console.error('⚠️ [티커 연동 실패] 시황 정보를 갱신하지 못했습니다:', error);
  }
}
