const CACHE_NAME = 'cfmemos-v1';
const STATIC_CACHE = 'cfmemos-static-v1';
const DYNAMIC_CACHE = 'cfmemos-dynamic-v1';
const IMAGE_CACHE = 'cfmemos-images-v1';

// 需要预缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[Service Worker] Pre-caching failed:', err);
      })
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== IMAGE_CACHE
            ) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// 判断是否是图片请求
const isImageRequest = (url) => {
  return url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i);
};

// 判断是否是 API 请求
const isApiRequest = (url) => {
  return url.includes('/api/');
};

// 判断是否是静态资源
const isStaticAsset = (url) => {
  return url.match(/\.(js|css|html|json|woff|woff2|ttf|otf)$/i);
};

// 网络优先策略
const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
  }
  
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  throw new Error('Network and cache both failed');
};

// 缓存优先策略
const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Cache and network both failed:', request.url);
    throw error;
  }
};

// 仅网络策略（用于 API 请求）
const networkOnly = async (request) => {
  return fetch(request);
};

// 处理 fetch 请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 跳过非 GET 请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 跳过 chrome-extension 请求
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // API 请求 - 仅网络
  if (isApiRequest(url.href)) {
    event.respondWith(networkOnly(request).catch(() => {
      // 如果网络失败，返回离线数据或错误
      return new Response(
        JSON.stringify({ error: '离线模式，无法获取最新数据' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }));
    return;
  }
  
  // 图片请求 - 缓存优先
  if (isImageRequest(url.href)) {
    event.respondWith(
      cacheFirst(request).catch(() => {
        // 返回占位图
        return new Response('Image not available', { status: 404 });
      })
    );
    return;
  }
  
  // 静态资源 - 缓存优先
  if (isStaticAsset(url.href)) {
    event.respondWith(
      cacheFirst(request).catch(() => {
        return caches.match('/offline');
      })
    );
    return;
  }
  
  // 页面请求 - 网络优先
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request).catch(() => {
        return caches.match('/offline');
      })
    );
    return;
  }
  
  // 其他请求 - 网络优先
  event.respondWith(
    networkFirst(request).catch(() => {
      return new Response('Offline', { status: 503 });
    })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-memos') {
    console.log('[Service Worker] Background sync triggered');
    event.waitUntil(syncMemos());
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  const options = {
    body: event.data?.text() || '您有一条新消息',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/',
    },
    actions: [
      {
        action: 'open',
        title: '打开',
      },
      {
        action: 'close',
        title: '关闭',
      },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification('异飨客的朋友圈', options)
  );
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// 模拟同步备忘录（实际项目中可以实现真正的同步逻辑）
async function syncMemos() {
  console.log('[Service Worker] Syncing memos...');
  // 这里可以实现离线数据的同步逻辑
}
