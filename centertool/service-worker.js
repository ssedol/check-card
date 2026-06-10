const CACHE_NAME = 'centertool-v11';

const CACHE_FILES = [
  '/centertool/',
  '/centertool/index.html',
  '/centertool/style.css',
  '/centertool/manifest.json',
  '/centertool/js/storage.js',
  '/centertool/js/corners.js',
  '/centertool/js/level.js',
  '/centertool/js/grid.js',
  '/centertool/js/guide.js',
  '/centertool/js/camera.js',
  '/centertool/js/capture.js',
  '/centertool/js/app.js',
  '/centertool/icons/icon-192.png',
  '/centertool/icons/icon-512.png'
];

// 설치: 핵심 파일 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});

// 활성화: 이전 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 요청 처리: 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', (event) => {
  // 광고 요청은 캐시 우회
  if (event.request.url.includes('googlesyndication') ||
      event.request.url.includes('adservice') ||
      event.request.url.includes('doubleclick')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => {
        // 오프라인 폴백
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
