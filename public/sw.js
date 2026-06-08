const CACHE_NAME = 'invest-archive-v7';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 서비스 워커 설치 및 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🤖 [PWA] 정적 파일 캐시 완료.');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => {
      console.warn('🤖 [PWA] 캐시 초기 등록 경고:', err.message);
    })
  );
  self.skipWaiting();
});

// 활성화 및 구버전 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🤖 [PWA] 오래된 캐시 삭제:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 네트워크 우선 (Network-First) 전략: 온라인일 때는 항상 최신 파일을 가져오고 오프라인일 때만 캐시로 대체
self.addEventListener('fetch', (event) => {
  // API 요청 및 외부 CDN 소스는 캐시 대상에서 제외
  if (event.request.url.includes('/api/') || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 네트워크 요청 성공 시 캐시에 업데이트하고 반환
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // 네트워크 실패(오프라인) 시 로컬 캐시에서 찾아 반환
        return caches.match(event.request);
      })
  );
});
