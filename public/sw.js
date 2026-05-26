const CACHE_NAME = 'invest-archive-v3';
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

// 네트워크 요청 캐시 전략 (Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
  // API 요청은 캐시 대상에서 제외 (실시간 데이터)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // 캐시 데이터 반환 후 백그라운드에서 신규 리소스 패치
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
